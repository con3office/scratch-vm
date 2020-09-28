/*

    NumberBank
    Scratch3.0 Extension

    Web:
    https://con3.com/sc2scratch/

*/


const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const formatMessage = require('format-message');
const firebase = require("firebase");
require("firebase/firestore");


// Values
var db;
var master_key = '';
var bank_name = '';
var bank_key = '';
var card_key = '';
var setNum;
var cloudNum;
var master_sha256 = '';
var bank_sha256 = '';
var card_sha256 = '';
var master_db;
var bank_db;
var card_db;
var puttingFlag = false;
const ext_version = "NumberBank 0.2.4";

var firebaseConfig = {
    apiKey: "AIzaSyA1iKV2IluAbBaO0A8yrKbNi7odxE1AaX8",
    authDomain: "numberbank-68d06.firebaseapp.com",
    databaseURL: "https://numberbank-68d06.firebaseio.com",
    projectId: "numberbank-68d06",
    storageBucket: "numberbank-68d06.appspot.com",
    messagingSenderId: "368738644656",
    appId: "1:368738644656:web:c858b84c08784215ec8175",
    measurementId: "G-DLFL2V0M98"
};


/**
* Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
* @type {string}
*/
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJudW1iZXJiYW5raWNvbiI+CiAgICA8IS0tIEdlbmVyYXRlZCBieSBQYWludENvZGUgLSBodHRwOi8vd3d3LnBhaW50Y29kZWFwcC5jb20gLS0+CiAgICA8ZyBpZD0ibnVtYmVyYmFua2ljb24tZ3JvdXAiPgogICAgICAgIDxlbGxpcHNlIGlkPSJudW1iZXJiYW5raWNvbi1vdmFsIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjguNSIgY3k9IjM4IiByeD0iOC41IiByeT0iOSIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua2ljb24tb3ZhbDIiIHN0cm9rZT0ibm9uZSIgZmlsbD0icmdiKDEyOCwgMTI4LCAxMjgpIiBjeD0iMjMuNzUiIGN5PSIzMiIgcng9IjE1LjI1IiByeT0iMTUiIC8+CiAgICAgICAgPGVsbGlwc2UgaWQ9Im51bWJlcmJhbmtpY29uLW92YWwzIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjM5Ljc1IiBjeT0iMzIiIHJ4PSIxMi4yNSIgcnk9IjEzIiAvPgogICAgPC9nPgogICAgCiAgICA8dGV4dCAgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iQW1lcmljYW5UeXBld3JpdGVyLUJvbGQsICdBbWVyaWNhbiBUeXBld3JpdGVyJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMzUiIHg9IjUiIHk9Ii0wIj48dHNwYW4geD0iNSIgeT0iMzAiPk48L3RzcGFuPjwvdGV4dD4KPC9zdmc+Cg=='

/**
* Icon svg to be displayed in the category menu, encoded as a data URI.
* @type {string}
*/
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJudW1iZXJiYW5raWNvbiI+CiAgICA8IS0tIEdlbmVyYXRlZCBieSBQYWludENvZGUgLSBodHRwOi8vd3d3LnBhaW50Y29kZWFwcC5jb20gLS0+CiAgICA8ZyBpZD0ibnVtYmVyYmFua2ljb24tZ3JvdXAiPgogICAgICAgIDxlbGxpcHNlIGlkPSJudW1iZXJiYW5raWNvbi1vdmFsIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjguNSIgY3k9IjM4IiByeD0iOC41IiByeT0iOSIgLz4KICAgICAgICA8ZWxsaXBzZSBpZD0ibnVtYmVyYmFua2ljb24tb3ZhbDIiIHN0cm9rZT0ibm9uZSIgZmlsbD0icmdiKDEyOCwgMTI4LCAxMjgpIiBjeD0iMjMuNzUiIGN5PSIzMiIgcng9IjE1LjI1IiByeT0iMTUiIC8+CiAgICAgICAgPGVsbGlwc2UgaWQ9Im51bWJlcmJhbmtpY29uLW92YWwzIiBzdHJva2U9Im5vbmUiIGZpbGw9InJnYigxMjgsIDEyOCwgMTI4KSIgY3g9IjM5Ljc1IiBjeT0iMzIiIHJ4PSIxMi4yNSIgcnk9IjEzIiAvPgogICAgPC9nPgogICAgCiAgICA8dGV4dCAgZmlsbD0icmdiKDAsIDAsIDApIiBmb250LWZhbWlseT0iQW1lcmljYW5UeXBld3JpdGVyLUJvbGQsICdBbWVyaWNhbiBUeXBld3JpdGVyJywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMzUiIHg9IjUiIHk9Ii0wIj48dHNwYW4geD0iNSIgeT0iMzAiPk48L3RzcGFuPjwvdGV4dD4KPC9zdmc+Cg=='


function sleep(msec) {
    return new Promise(resolve =>
        setTimeout(() => {
            resolve();
        }, msec)
    );
}

function hexString(textStr) {
    const byteArray = new Uint8Array(textStr);
    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });
    return hexCodes.join('');
}


/**
* Class for the NumberBank with Scratch 3.0
* @param {Runtime} runtime - the runtime instantiating this block package.
* @constructor
*/

class Scratch3Numberbank {
    constructor (runtime) {
        /**
        * The runtime instantiating this block package.
        * @type {Runtime}
        */
        this.runtime = runtime;

//      console.log("initializing...");
//      console.log("version:");
//      console.log(ext_version);

        firebase.initializeApp(firebaseConfig);

        db = firebase.firestore();
        master_db = db.collection("master");
        bank_db = db.collection("bank");
        card_db = db.collection("card");

        sleep(20);

//      console.log("init_done");

    }


    /**
    * @returns {object} metadata for this extension and its blocks.
    */
    getInfo () {

        this.setupTranslations();

        return {
            id: 'numberbank',
            name: 'NumberBank',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'putCloud',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.putCloud',
                        default: 'put [BANK][CARD][NUM]',
                        description: 'saveFirebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: 'bank'
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'card'
                        },
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '12345'
                        }
                    }
                },
                {
                    opcode: 'getCloud',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.getCloud',
                        default: 'get Num of [BANK][CARD]',
                        description: 'readFirebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: 'bank'
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'card'
                        }
                    }
                },
                {
                    opcode: 'getNumber',
                    text: formatMessage({
                        id: 'numberbank.getNumber',
                        default: 'CloudNumber',
                        description: 'getNumber'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'setMaster',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setMaster',
                        default: 'set Master [KEY]',
                        description: 'readFirebase'
                    }),
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        }
                    }
                },
            ],
            menus: {
            }
        };
    }

    putCloud (args) {

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == '' || args.NUM == '') {
            return;
        }

        if (puttingFlag){
            return;
        }
        puttingFlag = true;

        console.log("putCloud...");

        bank_key = args.BANK;
        card_key = args.CARD;

        if(args.NUM != '' && args.NUM != undefined){
            setNum = args.NUM;
            console.log("setNum: " + setNum);    
        }
        
        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
                console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                sleep(20);
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
                    console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {
                    if (mkey.exists) {

                        card_db.doc(card_sha256).set({
                            bank_key: bank_sha256,
                            card_key: card_sha256,
                            number: setNum,
                        })
                        .then(() => {
                            bank_db.doc(bank_sha256).set({
                                bank_name: bank_name
                            })
                            sleep(50);
                        })
                        .then(() => {
                            puttingFlag = false;
                            console.log("putCloud...end");
                        })
                        .catch(function(error) {
                                console.error("Error writing document: ", error);
                        });
        
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No Masterkey!");
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                });
                
            });

        }

    }

    getCloud (args) {

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == ''){
            return;
        }

        bank_key = args.BANK;
        card_key = args.CARD;

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
                console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                sleep(20);
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
                    console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {
                    if (mkey.exists) {

                        card_db.doc(card_sha256).get()
                        .then((doc) => {
                            let data = doc.data();
                            
                            cloudNum = data.number;
                            
                        })                        
                        .then(() => {
                            sleep(50);
                        })
                        .then(() => {
                            puttingFlag = false;
                            console.log("getCloud...end");
                        })
                        .catch(function(error) {
                                console.error("Error writing document: ", error);
                        });
        
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No Masterkey!");
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                });
                
            });

        }

    }


    getNumber () {
        return cloudNum;
    }


    setMaster (args) {

        if (args.KEY == ''){
            return;
        }

        master_sha256 = '';
        master_key = args.KEY;

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(master_key))
        .then(masterStr => {
            master_sha256 = hexString(masterStr);
        })
        .then(() => {
            sleep(20);
            console.log("Masterkry:", master_key);
        })
        .catch(function(error) {
            console.log("Error getting document:", error);
        });

    }


    setupTranslations () {
        const localeSetup = formatMessage.setup();
        const extTranslations = {
            'ja': {
                'numberbank.putCloud': '[BANK]の[CARD]に[NUM]を登録',
                'numberbank.getCloud': '[BANK]の[CARD]から数字取得',
                'numberbank.getNumber': 'クラウド数字',
                'numberbank.setMaster': 'マスター[KEY]をセット'
            },
            'ja-Hira': {
                'numberbank.putCloud': '[BANK]の[CARD]に[NUM]をとうろく',
                'numberbank.getCloud': '[BANK]の[CARD]からすうじ',
                'numberbank.getNumber': 'クラウドすうじ',
                'numberbank.setMaster': 'マスター[KEY]をセット'
            }
        };
        for (const locale in extTranslations) {
            if (!localeSetup.translations[locale]) {
                localeSetup.translations[locale] = {};
            }
            Object.assign(localeSetup.translations[locale], extTranslations[locale]);
        }
    }

}

module.exports = Scratch3Numberbank;
