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
const firebase = require("../../../node_modules/firebase/app");
require("../../../node_modules/firebase/auth");
require("../../../node_modules/firebase/firestore");

// Values
var db;
var master_name = 'MasterNAME';
var master_key = 'masmas';
var card_key;
var cloudNum;
var text_sha256;
var master_db;
var card_db;
const ext_version = "NumberBank 0.1.1b";

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
//		console.log("version:");
		console.log(ext_version);

        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();

        master_db = db.collection("master");
        card_db = db.collection("card");



//      console.log("init_done");

}


    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'numberbank',
            name: 'NumberBank',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'putCloud',
                    blockType: BlockType.COMMAND,
                    text: 'put [KEY][NUMBER]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: "key"
                        },
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "01234"
                        }                    
                    }
                },
                {
                    opcode: 'getCloud',
                    blockType: BlockType.COMMAND,
                    text: 'get [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: "key"
                        }
                    }
                },
                {
                    opcode: 'getNumber',
                    text: 'CloudNumber',
                    blockType: BlockType.REPORTER
                },
/*

*/
            ],
            menus: {
            }
        };
    }

    put2Cloud (args) {

        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(args.KEY))
        .then(keyStr => {
            text_sha256 = hexString(keyStr);
            sleep(15);
    		console.log("HashedIdm: " + text_sha256);
        });

        cloudNum = args.NUMBER;
        console.log("CloudNum: " + cloudNum);

        //let  add_data = card_db.doc('number');

        card_db.add({
            master_key: master_key,
            card_key: text_sha256,
            number: cloudNum,
        })
        .catch(function(error) {
            ed_msg.textContent = "エラー";
            console.error("Error writing document: ", error);
        });


    }

    
    getCloud (args) {


    }
    
    getNumber () {

        return cloudNum;
    }

}

module.exports = Scratch3Numberbank;
