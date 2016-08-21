(function (mw, $) {
    "use strict";

    var FPS = mw.KBasePlugin.extend({

        defaultConfig: {},

        /**
         * Check is HLS FPS is supported
         * @returns {boolean}
         */
        isSafeEnviornment: function () {
            return mw.isDesktopSafari();
        },
        /**
         * Setup the HLS FPS controller
         */
        setup: function () {
            this.addBindings();
        },
        /**
         * Bind player events to HLS FPS controller
         */
        addBindings: function () {
            this.bind("playerReady", this.initFPS.bind(this));
            this.bind("onChangeMedia", this.clean.bind(this));
        },
        /**
         * Register the playback events
         */
        initFPS: function () {
            this.log("Init");
            this.registered = true;
            this.onneedkeyHandler = this.onneedkey.bind(this);
            this.getPlayer().getPlayerElement().addEventListener('webkitneedkey', this.onneedkey.bind(this), false);
            this.onerrorHandler = this.onerror.bind(this);
            this.getPlayer().getPlayerElement().addEventListener('error', this.onerrorHandler, false);
        },
        /**
         * Clean method
         */
        clean: function(){
            this.getPlayer().getPlayerElement().removeEventListener('webkitneedkey', this.onneedkeyHandler);
            this.onneedkeyHandler = null;
            this.getPlayer().getPlayerElement().removeEventListener('error', this.onerrorHandler);
            this.onerrorHandler = null;
        },
        /**
         * need key event handler
         * @param event
         */
        onneedkey: function (event) {
            this.log("Need key");
            var video = event.target;
            var initData = event.initData;
            var contentId = this.extractContentId(initData);
            var source = this.getPlayer().getSource();
            var certificate = this.base64DecodeUint8Array(source.fpsCertificate);
            initData = this.concatInitDataIdAndCertificate(initData, contentId, certificate);

            if (!video.webkitKeys) {
                var keySystem = this.selectKeySystem();
                video.webkitSetMediaKeys(new WebKitMediaKeys(keySystem));
            }
            if (!video.webkitKeys) {
                throw "Could not create MediaKeys";
            }

            var keySession = video.webkitKeys.createSession("video/mp4", initData);
            if (!keySession) {
                throw "Could not create key session";
            }

            keySession.contentId = contentId;

            function waitForEvent(name, action, target) {
                target.addEventListener(name, function (arg) {
                    action(arg);
                }, false);
            }

            waitForEvent('webkitkeymessage', this.licenseRequestReady.bind(this), keySession);
            waitForEvent('webkitkeyadded', this.onkeyadded.bind(this), keySession);
            waitForEvent('webkitkeyerror', this.onkeyerror.bind(this), keySession);
        },
        /**
         * Error event handler
         * @param event
         */
        onerror: function (event) {
            this.log("Error:A video playback error occurred");
            var data;
            if (event && event.currentTarget && event.currentTarget.error){
                var errorCode = event.currentTarget.error.code;
                var errorMessagesMap = {
                    "1": "MEDIA_ERR_ABORTED",
                    "2": "MEDIA_ERR_NETWORK",
                    "3": "MEDIA_ERR_DECODE",
                    "4": "MEDIA_ERR_SRC_NOT_SUPPORTED"
                };
                var errorMessage = errorMessagesMap[errorCode];
                data = {
                    errorCode: errorCode,
                    errorMessage: errorMessage
                };
            }
            this.getPlayer().triggerHelper('embedPlayerError', [ data ]);

        },
        /**
         * Extract content id form the initData
         * @param initData
         * @returns {string}
         */
        extractContentId: function (initData) {
            var contentId = this.arrayToString(initData);
            // contentId is passed up as a URI, from which the host must be extracted:
            var link = document.createElement('a');
            //Remove starting comma if exist
            link.href = contentId;//.replace(/^,/gi, "");
            return link.hostname;
        },
        /**
         * Create initData object as Uint8Array
         * @param initData
         * @param id
         * @param cert
         * @returns {Uint8Array}
         */
        concatInitDataIdAndCertificate: function (initData, id, cert) {
            if (typeof id === "string") {
                id = this.stringToArray(id);
            }
            // layout is [initData][4 byte: idLength][idLength byte: id][4 byte:certLength][certLength byte: cert]
            var offset = 0;
            var buffer = new ArrayBuffer(initData.byteLength + 4 + id.byteLength + 4 + cert.byteLength);
            var dataView = new DataView(buffer);

            var initDataArray = new Uint8Array(buffer, offset, initData.byteLength);
            initDataArray.set(initData);
            offset += initData.byteLength;

            dataView.setUint32(offset, id.byteLength, true);
            offset += 4;

            var idArray = new Uint8Array(buffer, offset, id.byteLength);
            idArray.set(id);
            offset += idArray.byteLength;

            dataView.setUint32(offset, cert.byteLength, true);
            offset += 4;

            var certArray = new Uint8Array(buffer, offset, cert.byteLength);
            certArray.set(cert);

            return new Uint8Array(buffer, 0, buffer.byteLength);
        },
        /**
         * Select the relevant key system
         * @returns {*}
         */
        selectKeySystem: function () {
            var keySystem = null;
            if (WebKitMediaKeys.isTypeSupported("com.apple.fps.1_0", "video/mp4")) {
                keySystem = "com.apple.fps.1_0";
            } else {
                this.log("Key System not supported");
            }
            return keySystem;
        },
        /**
         * CDM message event handler
         * @param event
         */
        licenseRequestReady: function (event) {
            this.log("Ready for license request");
            var session = event.target;
            var message = event.message;
            var request = new XMLHttpRequest();
            request.responseType = 'text';
            request.session = session;
            request.addEventListener('load', this.licenseRequestLoaded.bind(this), false);
            request.addEventListener('error', this.licenseRequestFailed.bind(this), false);
            var params = this.base64EncodeUint8Array(message);
            var serverProcessSPCPath = this.getLicenseUri();
            request.open('POST', serverProcessSPCPath, true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send(params);
        },
        /**
         * Get the license URI for HLS FPS
         * @returns {*}
         */
        getLicenseUri: function () {
            var licenseUri;
            var overrideDrmServerURL = mw.getConfig('Kaltura.overrideDrmServerURL');
            if (overrideDrmServerURL) {
                licenseUri = overrideDrmServerURL;
            } else {
                var licenseBaseUrl = mw.getConfig('Kaltura.UdrmServerURL');
                if (!licenseBaseUrl) {
                    this.log('Error:: failed to retrieve UDRM license URL ');
                }

                var licenseData = this.getPlayer().mediaElement.getLicenseUriComponent();
                licenseUri = licenseBaseUrl + "/fps/license?" + licenseData;
            }
            return licenseUri;
        },
        /**
         * License request loaded event handler
         * @param event
         */
        licenseRequestLoaded: function (event) {
            this.log("On license request loaded");
            var request = event.target;
            var session = request.session;

            // so trim the excess:
            var keyText = request.responseText.trim();
            var responseObj = JSON.parse(keyText);

            var key = this.base64DecodeUint8Array(responseObj.ckc);
            session.update(key);
        },
        /**
         * License request failed event handler
         * @param event
         */
        licenseRequestFailed: function (event) {
            this.log('Error:The license request failed.');
            var data = {
                errorMessage: "License request failed"
            };
            this.getPlayer().triggerHelper('embedPlayerError', [ data ]);
        },
        /**
         * Key error event handler
         * @param event
         */
        onkeyerror: function (event) {
            this.log('Error:A decryption key error was encountered');
            var data = {
                errorMessage: "A decryption key error was encountered"
            };
            this.getPlayer().triggerHelper('embedPlayerError', [ data ]);
        },
        /**
         * Key added event handler
         * @param event
         */
        onkeyadded: function (event) {
            this.log('Decryption key was added to session.');
        },
        //Utils
        /**
         * String to array util method
         * @param string
         * @returns {Uint16Array}
         */
        stringToArray: function (string) {
            var buffer = new ArrayBuffer(string.length * 2); // 2 bytes for each char
            var array = new Uint16Array(buffer);
            for (var i = 0, strLen = string.length; i < strLen; i++) {
                array[i] = string.charCodeAt(i);
            }
            return array;
        },
        /**
         * Array to string util method
         * @param array
         * @returns {string}
         */
        arrayToString: function (array) {
            var uint16array = new Uint16Array(array.buffer);
            return String.fromCharCode.apply(null, uint16array);
        },
        /**
         * base64 decode as Uint8Array util method
         * @param input
         * @returns {Uint8Array}
         */
        base64DecodeUint8Array: function (input) {
            var raw = window.atob(input);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }

            return array;
        },
        /**
         * base64 encode as Uint8Array util method
         * @param input
         * @returns {string}
         */
        base64EncodeUint8Array: function (input) {
            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            while (i < input.length) {
                chr1 = input[i++];
                chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
                chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }
            return output;
        }
    });
    mw.FPS = FPS;
})(window.mw, window.jQuery);