/*

    NumberBank
    Scratch3.0 Extension

    Web:
    https://con3.com/numberbank/

*/


const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const Variable = require('../../engine/variable');
const formatMessage = require('format-message');
const firebase = require("firebase");
require("firebase/firestore");


// Variables
var db;
var master_key = '';
var bank_name = '';
var bank_key = '';
var card_key = '';
var uni_key = '';
var setNum ='';
var cloudNum = '';
var master_sha256 = '';
var bank_sha256 = '';
var card_sha256 = '';
var uni_sha256 = '';
var master_db;
var bank_db;
var card_db;
var puttingFlag = false;
var gettingFlag = false;
const projectName ='numberbank-';
const ext_version = "NumberBank 0.5.1a";

var firebaseConfig = {
    apiKey: "AIzaSyA1iKV2IluAbBaO0A8yrKbNi7odxE1AaX8",
    authDomain: ".firebaseapp.com",
    databaseURL: ".firebaseio.com",
    projectId: "",
    storageBucket: ".appspot.com",
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

/** Project Id for nb*/
const prjtId = "68d06";

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
        console.log(ext_version);


        /** Firebase initilizing */
        var fb_id = projectName.concat(prjtId);
        firebaseConfig.projectId = fb_id;
        var fb_dm = fb_id.concat(firebaseConfig.authDomain);
        firebaseConfig.authDomain = fb_dm;
        var fb_sb = fb_id.concat(firebaseConfig.storageBucket);
        firebaseConfig.storageBucket = fb_sb;
        var fb_ul = 'https://'.concat(fb_id).concat(firebaseConfig.databaseURL);
        firebaseConfig.databaseURL = fb_ul;

        firebase.initializeApp(firebaseConfig);

        db = firebase.firestore();
        master_db = db.collection("master");
        bank_db = db.collection("bank");
        card_db = db.collection("card");

//      console.log("init_done");

    }


    /**
    * @returns {object} metadata for this extension and its blocks.
    */
    getInfo () {

        this.setupTranslations();

        return {
            id: 'numberbank',
            name: formatMessage({
                id: 'numberbank.NumberBank',
                default: 'NumberBank'
            }),
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'putCloud',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.putCloud',
                        default: 'put[NUM]to[CARD]of[BANK]',
                        description: 'saveFirebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        },
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '10'
                        }
                    }
                },
                {
                    opcode: 'getCloud',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.getCloud',
                        default: 'set [VAL] to Num of[CARD]of[BANK]',
                        description: 'readFirebase'
                    }),
                    arguments: {
                        BANK: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.bank',
                                default: 'bank'
                            })
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.card',
                                default: 'card'
                            })
                        },
                        VAL: {
                            type: ArgumentType.STRING,
                            fieldName: 'VARIABLE',
                            variableType: Variable.SCALAR_TYPE,            
                            menu: 'valMenu'
                        }
                    }
                },
                {
                    opcode: 'gettingDone',
                    text: formatMessage({
                        id: 'numberbank.gettingDone',
                        default: 'done',
                        description: 'gettingDone'
                    }),
                    blockType: BlockType.BOOLEAN
                },
/*
                {
                    opcode: 'getNumber',
                    text: formatMessage({
                        id: 'numberbank.getNumber',
                        default: 'CloudNum',
                        description: 'getNumber'
                    }),
                    blockType: BlockType.REPORTER
                },
*/
                '---',
                {
                    opcode: 'setMaster',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setMaster',
                        default: 'set Master[KEY]',
                        description: 'readFirebase'
                    }),
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'numberbank.argments.key',
                                default: 'key'
                            })
                        }
                    }
                },
            ],
            menus: {
                valMenu: {
                    items: 'getDynamicMenuItems'
                }
            }
        };
    }

    getDynamicMenuItems () {
        return this.runtime.getEditingTarget().getAllVariableNamesInScopeByType(Variable.SCALAR_TYPE);
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

//        console.log("putCloud...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
//        console.log("uni_key: " + uni_key);    

        if(args.NUM != '' && args.NUM != undefined){
            setNum = args.NUM;
//            console.log("setNum: " + setNum);    
        }
        
        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
//                console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
//                    console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
                .then(uniStr => {
                    uni_sha256 = hexString(uniStr);
//                    console.log("uni_sha256: " + uni_sha256);
                })
            })
            .then(() => {
//                console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {
                    if (mkey.exists) {
                        const now = Date.now();
                        card_db.doc(uni_sha256).set({
                            number: setNum,
                            bank_key: bank_sha256,
                            card_key: card_sha256,
                            master_key: master_sha256,
                            time_stamp: now
                        })
                        .then(() => {
                            bank_db.doc(bank_sha256).set({
                                bank_name: bank_name,
                                time_stamp: now
                            })
                            sleep(20);
                        })
                        .then(() => {
                            puttingFlag = false;
//                            console.log("putCloud...end");
                        })
                        .catch(function(error) {
                            console.error("Error writing document: ", error);
                            puttingFlag = false;
                        });
        
                    } else {
                        console.log("No MasterKey!");
                        puttingFlag = false;
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                    puttingFlag = false;
                });
                
            });

        }

    }


    getCloud (args, util) {

        const variable = util.target.lookupOrCreateVariable(null, args.VAL);

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == ''){
            return;
        }

        if (gettingFlag){
            return;
        }
        gettingFlag = true;


//        console.log("getCloud...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
//        console.log("uni_key: " + uni_key);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
//                console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
//                    console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
                .then(uniStr => {
                    uni_sha256 = hexString(uniStr);
//                    console.log("uni_sha256: " + uni_sha256);
                })
            })
            .then(() => {
//                console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        card_db.doc(uni_sha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                card_db.doc(uni_sha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    cloudNum = data.number;
                                    variable.value = data.number;
                                })
                                .then(() => {
                                    gettingFlag = false;
                                })                   
                                .catch(function(error) {
                                        console.error("Error getting document: ", error);
                                });

                            } else {
//                                console.log("No Card!");
                                cloudNum = '';
                                variable.value = '';
                                gettingFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            gettingFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        gettingFlag = false;
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                    gettingFlag = false;
                });
                
            });

        }

    }


    gettingDone () {
        return !gettingFlag;
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
//            console.log("MasterKey:", master_key);
//            console.log("master_sha256:", master_sha256);
            console.log("MasterKey setted!");
        })
        .catch(function(error) {
            console.log("Error setting MasterKey:", error);
        });

    }


    setupTranslations () {
        const localeSetup = formatMessage.setup();
        const extTranslations = {
            'ja': {
                'numberbank.NumberBank': 'ナンバーバンク',
                'numberbank.argments.bank': 'バンク',
                'numberbank.argments.card': 'カード',
                'numberbank.argments.key': 'キー',
                'numberbank.putCloud': '[BANK]の[CARD]の数字を[NUM]にする',
                'numberbank.getCloud': '[VAL]を[BANK]の[CARD]の数字にする',
                'numberbank.getNumber': 'クラウド数字',
                'numberbank.gettingDone': '取得完了',
                'numberbank.setMaster': 'マスター[KEY]をセット'
            },
            'ja-Hira': {
                'numberbank.NumberBank': 'なんばーばんく',
                'numberbank.argments.bank': 'ばんく',
                'numberbank.argments.card': 'かーど',
                'numberbank.argments.key': 'きー',
                'numberbank.putCloud': '[BANK]の[CARD]のすうじを[NUM]にする',
                'numberbank.getCloud': '[VAL]を[BANK]の[CARD]のすうじにする',
                'numberbank.getNumber': 'クラウドすうじ',
                'numberbank.gettingDone': 'しゅとくかんりょう',
                'numberbank.setMaster': 'ますたー[KEY]をセット'
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
