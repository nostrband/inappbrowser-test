/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

let ref = null
const logs = document.getElementById('logs')

function log(str) {
    logs.innerHTML = str + "\n" + logs.innerHTML;
}

function exec(fn) {
    try {
        fn()
    } catch (e) {
        log("Error: "+e)
    }
}

function open() {
    exec(() => {
        const options = document.getElementById('options').value;
        ref = cordova.InAppBrowser.open("https://nostr.band/test1.html", "_blank", options);
        ref.addEventListener("message", (e) => {
            log("message "+JSON.stringify(e));
            try {
                switch (e.data.cmd) {
                    case "close": return close()
                    case "hide": return hide();
                    case "executeScript": return executeScript();
                    case "insertCSS": return insertCSS();
                }
            } catch (e) {
                log("command error "+e)
            }
        })
        ref.addEventListener("loadstart", (e) => {
            log("loadstart "+e.url);
        })
        ref.addEventListener("loadstop", (e) => {
            log("loadstop "+e.url);
        })
        ref.addEventListener("beforeload", (e, cb) => {
            log("beforeload "+e.url);
            cb("redirect-"+e.url);
        })
        log("options "+options+" tab created");
    })
}

function close() {
    exec(() => {
        ref.close();
    })
}

function show() {
    exec(() => {
        ref.show();
    })
}

function hide() {
    exec(() => {
        ref.hide();
    })
}

function executeScript() {
    exec(() => {
        ref.executeScript({code: `(() => {
            window.webkit.messageHandlers.cordova_iab.postMessage(
                JSON.stringify({executed:true})
            );
            return "posted";
            })();
        `}, (v) => {
            log("executeScript reply "+v)
        });
    })
}

function insertCSS() {
    exec(() => {
        ref.insertCSS({code: "body{background-color: black}"});
    })
}

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    document.getElementById('open').addEventListener('click', open)
    document.getElementById('close').addEventListener('click', close)
    document.getElementById('hide').addEventListener('click', hide)
    document.getElementById('show').addEventListener('click', show)
    document.getElementById('executeScript').addEventListener('click', executeScript)
    document.getElementById('insertCSS').addEventListener('click', insertCSS)
}
