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
var settingNum ='';
var cloudNum = '';
var master_sha256 = '';
var bank_sha256 = '';
var card_sha256 = '';
var uni_sha256 = '';
var master_db;
var bank_db;
var card_db;
var inoutFlag = false;
var availableFlag = false;
var intervalMs = 50;
var intervalLong = 1000;
const projectName ='numberbank-';
const ext_version = "NumberBank 0.6.9";

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

function io_waiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if(inoutFlag){
                reject();
            }else{
                resolve();
            }
        }, msec)
    )
    .catch(() => {
        console.log('waiter loop!');
        return io_waiter(intervalMs);
    });
}

function reportNum_waiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if(inoutFlag){
                reject();
            }else{
                resolve(cloudNum);
            }
        }, msec)
    )
    .catch(() => {
        console.log('waiter loop!');
        return reportNum_waiter(intervalMs);
    });
}


function available_waiter(msec) {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            if(inoutFlag){
                reject();
            }else{
                resolve(availableFlag);
            }
        }, msec)
    )
    .catch(() => {
        console.log('waiter loop!');
        return available_waiter(intervalMs);
    });
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

        //console.log("initializing...");
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

        //console.log("init_done");

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
                    opcode: 'putNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.putNum',
                        default: 'put[NUM]to[CARD]of[BANK]',
                        description: 'put Num to Firebase'
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
                '---',
                {
                    opcode: 'setNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.setNum',
                        default: 'set [VAL] to Num of[CARD]of[BANK]',
                        description: 'set Num by Firebase'
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
                /*
                {
                    opcode: 'inoutDone',
                    text: formatMessage({
                        id: 'numberbank.inoutDone',
                        default: 'done',
                        description: 'inoutDone'
                    }),
                    blockType: BlockType.BOOLEAN
                },
                */
                '---',
                {
                    opcode: 'getNum',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'numberbank.getNum',
                        default: 'get Num of[CARD]of[BANK]',
                        description: 'get Num from Firebase'
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
                        }
                    }
                },
                {
                    opcode: 'repNum',
                    text: formatMessage({
                        id: 'numberbank.repNum',
                        default: 'cloudNum',
                        description: 'report Number'
                    }),
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'repCloudNum',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'numberbank.repCloudNum',
                        default: 'Num of[CARD]of[BANK]',
                        description: 'report Cloud Number'
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
                        }
                    }
                },
                '---',
                {
                    opcode: 'boolAvl',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'numberbank.boolAvl',
                        default: '[CARD]of[BANK] available?',
                        description: 'report Number'
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
                        }
                    }
                },
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
                    acceptReporters: true,
                    items: 'getDynamicMenuItems'
                }
            }
        };
    }

    getDynamicMenuItems () {
        return this.runtime.getEditingTarget().getAllVariableNamesInScopeByType(Variable.SCALAR_TYPE);
    }


    putNum (args) {

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == '' || args.NUM == '') {
            return;
        }
        
        if (inoutFlag){
            return;
        }
        inoutFlag = true;

        //console.log("putCloud...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
        //console.log("uni_key: " + uni_key);    

        if(args.NUM != '' && args.NUM != undefined){
            settingNum = args.NUM;
            //console.log("settingNum: " + settingNum);    
        }
        
        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
                //console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
                    //console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
                .then(uniStr => {
                    uni_sha256 = hexString(uniStr);
                    //console.log("uni_sha256: " + uni_sha256);
                })
            })
            .then(() => {
                //console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {
                    if (mkey.exists) {
                        const now = Date.now();
                        card_db.doc(uni_sha256).set({
                            number: settingNum,
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
                        })
                        .then(() => {
                            inoutFlag = false;
                            //console.log("putCloud...end");
                        })
                        .catch(function(error) {
                            console.error("Error writing document: ", error);
                            inoutFlag = false;
                        });
        
                    } else {
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return io_waiter(intervalMs);

    }


    setNum (args, util) {

        const variable = util.target.lookupOrCreateVariable(null, args.VAL);

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == ''){
            return;
        }

        if (inoutFlag){
            return;
        }
        inoutFlag = true;

        //console.log("setNum...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
        //console.log("uni_key: " + uni_key);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
                //console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
                    //console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
                .then(uniStr => {
                    uni_sha256 = hexString(uniStr);
                    //console.log("uni_sha256: " + uni_sha256);
                })
            })
            .then(() => {
                //console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        card_db.doc(uni_sha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                card_db.doc(uni_sha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    variable.value = data.number;
                                })
                                .then(() => {
                                    inoutFlag = false;
                                })                   
                                .catch(function(error) {
                                        console.error("Error getting document: ", error);
                                });

                            } else {
//                                console.log("No Card!");
//                                cloudNum = '';
                                variable.value = '';
                                inoutFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                }).catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return io_waiter(intervalMs);

    }


    inoutDone () {
        return !inoutFlag;
    }

    
    getNum (args) {

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == ''){
            return;
        }

        if (inoutFlag){
            return;
        }
        inoutFlag = true;

        //console.log("getNum...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
        //console.log("uni_key: " + uni_key);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
                //console.log("bank_sha256: " + bank_sha256);    
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
                    //console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
                .then(uniStr => {
                    uni_sha256 = hexString(uniStr);
                    //console.log("uni_sha256: " + uni_sha256);
                })
            })
            .then(() => {
                //console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        card_db.doc(uni_sha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                card_db.doc(uni_sha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    cloudNum = data.number;
                                })
                                .then(() => {
                                    inoutFlag = false;
                                })                   
                                .catch(function(error) {
                                        console.error("Error getting document: ", error);
                                });

                            } else {
                                //console.log("No Card!");
                                cloudNum = '';
                                inoutFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                })
                .catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return io_waiter(intervalMs);

    }



    repNum (args, util) {
        return cloudNum;
    }


    repCloudNum (args) {


        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == ''){
            return;
        }

        if (inoutFlag){
            return;
        }
        inoutFlag = true;

        //console.log("repCloudNum...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
        //console.log("uni_key: " + uni_key);

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(bank_key))
            .then(bankStr => {
                bank_sha256 = hexString(bankStr);
                //console.log("bank_sha256: " + bank_sha256);
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(card_key))
                .then(cardStr => {
                    card_sha256 = hexString(cardStr);
                    //console.log("card_sha256: " + card_sha256);
                })
            })
            .then(() => {
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
                .then(uniStr => {
                    uni_sha256 = hexString(uniStr);
                    //console.log("uni_sha256: " + uni_sha256);
                })
            })
            .then(() => {
                //console.log("master_sha256: " + master_sha256);

                master_db.doc(master_sha256).get().then(function(mkey) {

                    if (mkey.exists) {

                        card_db.doc(uni_sha256).get().then(function(ckey) {

                            if (ckey.exists) {

                                card_db.doc(uni_sha256).get()
                                .then((doc) => {
                                    let data = doc.data();
                                    cloudNum = data.number;
                                })
                                .then(() => {
                                    inoutFlag = false;
                                })                   
                                .catch(function(error) {
                                    console.error("Error getting document: ", error);
                                });

                            } else {
                                //console.log("No Card!");
                                cloudNum = '';
                                inoutFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error cheking document:", error);
                            inoutFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                    }

                })
                .catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                });
                
            });

        }

        return reportNum_waiter(intervalMs);

    }



    boolAvl (args, util) {

        if (master_sha256 == ''){
            return;
        }

        if (args.BANK == '' || args.CARD == ''){
            return;
        }

        if (inoutFlag){
            return;
        }
        inoutFlag = true;

        console.log("boolAvl...");

        bank_key = bank_name = args.BANK;
        card_key = args.CARD;

        uni_key = bank_key.trim().concat(card_key.trim());
        //console.log("uni_key: " + uni_key);    

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        if (bank_key != '' && bank_key != undefined){

            crypto.subtle.digest('SHA-256', new TextEncoder().encode(uni_key))
            .then(uniStr => {
                uni_sha256 = hexString(uniStr);
                //console.log("uni_sha256: " + uni_sha256);
            })
            .then(() => {
                //console.log("master_sha256: " + master_sha256);
                
                master_db.doc(master_sha256).get().then(function(mkey) {
                
                    if (mkey.exists) {

                        card_db.doc(uni_sha256).get().then(function(ckey) {

                            if (ckey.exists) {
                                //console.log("Available!");
                                inoutFlag = false;
                                availableFlag = true;
                            } else {
                                //console.log("No Available!");
                                inoutFlag = false;
                                availableFlag = false;
                            }

                        }).catch(function(error) {
                            console.log("Error checking document:", error);
                            inoutFlag = false;
                            availableFlag = false;
                        });
    
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No MasterKey!");
                        inoutFlag = false;
                        availableFlag = false;
                    }
                
                })
                .catch(function(error) {
                    console.log("Error getting document:", error);
                    inoutFlag = false;
                    availableFlag = false;
                });
                                
            })

        }

        return available_waiter(intervalMs);

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
            //console.log("MasterKey:", master_key);
            //console.log("master_sha256:", master_sha256);
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
                'numberbank.putNum': '[BANK]の[CARD]の数字を[NUM]にする',
                'numberbank.setNum': '[VAL]を[BANK]の[CARD]の数字にする',
                'numberbank.inoutDone': '読み書き完了',
                'numberbank.getNum': '[BANK]の[CARD]を読む',
                'numberbank.repNum': 'クラウド数字',
                'numberbank.repCloudNum': '[BANK]の[CARD]の数字',
                'numberbank.boolAvl': '[BANK]の[CARD]がある',
                'numberbank.setMaster': 'マスター[KEY]をセット'
            },
            'ja-Hira': {
                'numberbank.NumberBank': 'なんばーばんく',
                'numberbank.argments.bank': 'ばんく',
                'numberbank.argments.card': 'かーど',
                'numberbank.argments.key': 'きー',
                'numberbank.putNum': '[BANK]の[CARD]のすうじを[NUM]にする',
                'numberbank.setNum': '[VAL]を[BANK]の[CARD]のすうじにする',
                'numberbank.inoutDone': 'よみかきかんりょう',
                'numberbank.getNum': '[BANK]の[CARD]をよむ',
                'numberbank.repNum': 'クラウドすうじ',
                'numberbank.repCloudNum': '[BANK]の[CARD]のすうじ',
                'numberbank.boolAvl': '[BANK]の[CARD]がある',
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
