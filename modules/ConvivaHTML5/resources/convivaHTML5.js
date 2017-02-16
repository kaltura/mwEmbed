/**
 * Created by karol.bednarz on 2/11/2016.
 * plugin version 1.0
 */
(function (mw, $, kWidget) {
    "use strict";

    mw.PluginManager.add('convivaHTML5', mw.KBaseComponent.extend({

        defaultConfig: {
            'order': 22,
            'parent': '',
            'partnerID': null,
            'gatewayUrl': null,
            'viewerID':null,
            'heartbeatInterval': 20
        },

        requireSessionCreation: true,
        playFirstTime: true,
        buffering: false,
        playerStateManager: '',
        // The track List
        eventTrackList: [
            'durationChange',
            'changeMedia',
            'skinLoadFailed',
            'entryFailed',
            'mediaLoadError',
            'mediaError',
            'doPause',
            'doPlay',
            'doStop',
            'doSeek',
            'kdpEmpty',
            'playerStateChange',
            'playerPlayEnd',
            'alert',
            'showUiElement',
            'freePreviewEnd',
            'playing'
        ],
        systemInterface: '',
        systemSettings: '',
        systemFactory: '',

        setup: function () {
            this.loadSDK();
        },

        /**
         * load conviva sdk - currently version 1.7
         */
        loadSDK: function () {
            var _this = this;
            var loadSDK = $.ajax({
                url: mw.getMwEmbedPath() + "modules/ConvivaHTML5/resources/conviva-core-sdk.min.js",
                dataType: "script",
                timeout: 5000
            });

            $.when(loadSDK).then(function () {
                _this.settingsInit();
                _this.addPlayerBindings();
            }, function () {
                // error msg
            });
        },

        /**
         * initialize the conviva plugin
         */
        settingsInit: function () {
            this.systemInterface = new Conviva.SystemInterface(
                new this.Html5Time(),
                new this.Html5Timer(),
                new this.Html5Http(),
                new this.Html5Storage(),
                new this.Html5Metadata(),
                new this.Html5Logging()
            );

            this.systemSettings = new Conviva.SystemSettings();
            this.systemFactory = new Conviva.SystemFactory(this.systemInterface, this.systemSettings);

            var partnerID = this.getConfig("partnerID");
            this.clientSettings = new Conviva.ClientSettings(partnerID);

            if (this.getConfig("heartbeatInterval"))
                this.clientSettings.heartbeatInterval = this.getConfig("heartbeatInterval");
            if (this.getConfig("gatewayUrl"))
                this.clientSettings.gatewayUrl = this.getConfig('gatewayUrl');

            this.client = new Conviva.Client(this.clientSettings, this.systemFactory);
        },

        /**
         * setting up player state manager
         * it is responsible for video info and event changes
         */
        setupPlayerStatetManager: function () {
            this.playerStateManager.setBitrateKbps(this.getPlayer().mediaElement.selectedSource.bandwidth / 1024); // in Kbps
            // Duration of the video stream was detected. It is milliseconds.
            this.playerStateManager.setDuration(this.embedPlayer.duration); // in seconds
            this.playerStateManager.setPlayerType("Stream AMG Player");
            this.playerStateManager.setPlayerVersion(window["MWEMBED_VERSION"]);
        },

        /**
         *  Add the player bindings
         */
        addPlayerBindings: function () {
            var _this = this;

            _this.embedPlayer.bindHelper('embedPlayerError', function (e, error) {
                _this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.STOPPED);
                _this.playerStateManager.sendError('[' + error.errorId + '] ' + error.errorMessage, Conviva.Client.ErrorSeverity.FATAL);
                _this.cleanupConvivaSession();
            });


            //if spinner is shown inform that there is buffering action
            _this.bind('onAddPlayerSpinner', function () {
                _this.buffering = true;
            });
            _this.bind('onRemovePlayerSpinner', function () {
                _this.buffering = false;
            });


            // track bitrate change events
            this.bind('sourceSwitchingEnd', function (newIndex) {
                var currentBitrate = _this.embedPlayer.currentBitrate != -1 ? _this.embedPlayer.currentBitrate : _this.getPlayer().mediaElement.selectedSource.bandwidth / 1024;
                if (_this.playerStateManager._bitrateKbps != currentBitrate)
                    _this.playerStateManager.setBitrateKbps(currentBitrate);

            });

            // set the rest of the bindings from the track list
            $.each(_this.eventTrackList, function () {
                var eventName = this;
                var eventNameBinding = _this.getEventNameBinding(eventName);
                _this.embedPlayer.addJsListener(eventNameBinding + _this.bindPostFix, function (data) {
                    _this.playerEvent(eventName, data);

                });
            });
        },

        /**
         * Terminates the existing Conviva monitoring session. Whenever error, playback ends or is cancelled
         */
        cleanupConvivaSession: function () {
            if (this.client && this.currentConvivaSessionKey != Conviva.Client.NO_SESSION_KEY) {
                this.client.cleanupSession(this.currentConvivaSessionKey);
                this.currentConvivaSessionKey = Conviva.Client.NO_SESSION_KEY;
            }
            this.requireSessionCreation = true;
        },

        /**
         * When the application stops, free existing Conviva.Client objects.
         */
        destroyConvivaPlugin: function () {

            if (this.client && this.currentConvivaSessionKey != Conviva.Client.NO_SESSION_KEY && this.currentConvivaSessionKey != undefined) {
                this.client.cleanupSession(this.currentConvivaSessionKey);
                this.currentConvivaSessionKey = Conviva.Client.NO_SESSION_KEY;
            }

            if (this.client)
                this.client.release();
            this.client = null;

            // If client was the only consumer of systemFactory, release systemFactory as well.
            if (this.systemFactory)
                this.systemFactory.release();
            this.sytemFactory = null;

        },

        /**
         * Handles the mapping for special case eventNames that
         * don't match their corresponding kaltura listener binding name
         */
        getEventNameBinding: function (eventName) {
            switch (eventName) {
                case 'quartiles':
                    return 'playerUpdatePlayhead';
                    break;
                default :
                    return eventName;
            }

        },

        /**
         * set polling timer to track buffering state
         */
        setPollingTimer: function () {
            var _this = this;
            this.removePollingTimer();
            this.positionPollingTimer = setInterval(function () {
                if (_this.playerStateManager.getPlayerState() != Conviva.PlayerStateManager.PlayerState.BUFFERING && _this.embedPlayer.buffering && _this.buffering && _this.embedPlayer.currentTime == _this.lastPosition)
                    _this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.BUFFERING);
                _this.lastPosition = _this.embedPlayer.currentTime;
            }, 500);
        },

        removePollingTimer: function () {
            if (this.positionPollingTimer)
                clearInterval(this.positionPollingTimer);
            this.positionPollingTimer = null;
        },

        /**
         * player event handler
         * @param methodName
         * @param data
         */
        playerEvent: function (methodName, data) {
            var _this = this;

            switch (methodName) {
                case "changeMedia":
                    this.requireSessionCreation = true;
                    break;
                case "doPlay":
                    if (this.requireSessionCreation) {
                        this.requireSessionCreation = false;
                        var contentMetadata = this.buildConvivaContentMetadata();
                        this.currentConvivaSessionKey = this.client.createSession(contentMetadata);
                        this.playerStateManager = this.client.getPlayerStateManager();
                        _this.setupPlayerStatetManager();

                        // Report the new player state to Conviva.
                        this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.UNKNOWN);
                        this.client.attachPlayer(this.currentConvivaSessionKey, this.playerStateManager);
                    }
                    if (this.playerStateManager && !this.positionPollingTimer)
                        this.setPollingTimer();
                    break;
                case "playing":
                    if (this.playerStateManager.getPlayerState() != Conviva.PlayerStateManager.PlayerState.PLAYING)
                        this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.PLAYING);
                    break;
                case "playerPlayEnd":
                case "doStop":
                    if (this.playerStateManager.getPlayerState() != Conviva.PlayerStateManager.PlayerState.STOPPED)
                        this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.STOPPED);
                    this.removePollingTimer();
                    this.cleanupConvivaSession();
                    break;
                case "doPause":
                    if (this.playerStateManager.getPlayerState() != Conviva.PlayerStateManager.PlayerState.PAUSED && this.embedPlayer.currentTime != this.embedPlayer.duration)
                        this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.PAUSED);
                    this.removePollingTimer();
                    break;
                case "mediaLoadError":
                case "mediaError":
                case "entryFailed":
                case "kdpEmpty":

                    var error = this.embedPlayer.getError();
                    this.playerStateManager.setError(error);
                    this.playerStateManager.sendError(error.msg, Conviva.Client.ErrorSeverity.FATAL);
                    this.cleanupConvivaSession();
                    break;
                case "showSpinner":
                    if (this.playerStateManager.getPlayerState() != Conviva.PlayerStateManager.PlayerState.BUFFERING)
                        this.playerStateManager.setPlayerState(Conviva.PlayerStateManager.PlayerState.BUFFERING);
                    break;
                default :
                    return;

            }
        },


        buildConvivaContentMetadata: function () {
            var contentMetadata = new Conviva.ContentMetadata();


            // Recommended format for the assetName, using both the ID of the video content and its title
            contentMetadata.assetName = "[" + this.embedPlayer.kentryid + "] " + this.embedPlayer.kalturaPlayerMetaData.name;

            // The stream url for this video content.
            // For manifest-based streaming protocols, it should point to the top-level manifest.
            contentMetadata.streamUrl = this.embedPlayer.baseURI;

            // The type of stream for this content. Usually either live or VOD.
            // Sometimes the application may not know right away, in which case you have the option to set it to Unknown
            // and possibly fill the gap later on.
            contentMetadata.streamType = this.embedPlayer.isLive() ? Conviva.ContentMetadata.StreamType.LIVE : Conviva.ContentMetadata.StreamType.VOD;

            // Duration of this particular video stream.
            // If this information is available to your application from your Content Management System,
            // you can supply it here.
            // Otherwise, the PlayerInterface will have to extract it from the video player.
            contentMetadata.duration = this.embedPlayer.duration;//Math.floor(videoData.metadata.durationMs / 1000); // in seconds

            // Frame rate this particular video stream was encoded at.
            // If this information is available to your application from your Content Management System,
            // you can supply it here.
            // Otherwise, the PlayerInterface will have to extract it from the video player.
            //contentMetadata.encodedFrameRate = 29;//videoData.metadata.frameRate;

            // Here we are playing progressive download content with a static bitrate,
            // and the HTML5 video element does not expose bitrate information.
            // We set the default bitrate to report for this content based on metadata
            // since the PlayerInterface cannot retrieve it from the HTML5 video player.
            contentMetadata.defaultBitrateKbps = this.getPlayer().mediaElement.selectedSource.bandwidth / 1024;//Math.floor(videoData.metadata.bitrateBps / 1000); // in Kbps

            // The Conviva Platform will be setup to parse the stream urls for your video assets
            // and infer the resource it is served from (CDN-level, possibly bucket-level/server-level).
            // In cases where the video application does not have access to a meaningful stream url
            // (local video proxy / some DRM wrappers), the Conviva Platform can be configured to
            // infer the resource from the defaultResource field instead.
            //contentMetadata.defaultResource = "Akamai/Wowza";

            // A human-readable identifier for your application.
            // Very helpful to filter traffic and compare performance for different builds of
            // the video application.
            contentMetadata.applicationName = "Stream AMG Player";

            // An identifier for the current user. Can be obfuscated to ensure privacy.
            // Can be used to isolate video traffic for a particular and help with
            // video quality assessements/troubleshooting for that particular user.
            contentMetadata.viewerId = this.getConfig("viewerID") ? this.getConfig("viewerID") : this.embedPlayer.kuiconfid;

            // Custom metadata, usually defined in a metadata spreadsheet.
            // Based on the type of video application and the expectations in terms of
            // Conviva metrics and filtering capabilities.
            //contentMetadata.custom = {
            //    userSubscriptionType: userData.subscriptionType,
            //    userAccountType: userData.accountType,
            //    genres: videoData.metadata.genres.join(',') // string
            //};

            return contentMetadata;
        },


        // ------------------------------------------------- INTERFACES -----------------------------------------------------------

        Html5Time: function () {
            function _constr() {
                // nothing to initialize
            }

            _constr.apply(this, arguments);

            this.getEpochTimeMs = function () {
                var d = new Date();
                return d.getTime();
            };

            this.release = function () {
                // nothing to release
            }
        },

        Html5Timer: function () {

            function _constr() {
                // nothing to initialize
            }

            _constr.apply(this, arguments);

            this.createTimer = function (timerAction, intervalMs, actionName) {
                var timerId = setInterval(timerAction, intervalMs);
                var cancelTimerFunc = (function () {
                    if (timerId !== -1) {
                        clearInterval(timerId);
                        timerId = -1;
                    }
                });
                return cancelTimerFunc;
            };

            this.release = function () {
                // nothing to release
            };

        },


        Html5Http: function () {

            function _constr() {
                // nothing to initialize
            }

            _constr.apply(this, arguments);

            this.makeRequest = function (httpMethod, url, data, contentType, timeoutMs, callback) {
                // XDomainRequest only exists in IE, and is IE8-IE9's way of making CORS requests.
                // It is present in IE10 but won't work right.
                // if (typeof XDomainRequest !== "undefined" && navigator.userAgent.indexOf('MSIE 10') === -1) {
                // 	return this.makeRequestIE89.apply(this, arguments);
                // }
                return this.makeRequestStandard.apply(this, arguments);
            };

            this.makeRequestStandard = function (httpMethod, url, data, contentType, timeoutMs, callback) {
                var xmlHttpReq = new XMLHttpRequest();

                xmlHttpReq.open(httpMethod, url, true);

                if (contentType && xmlHttpReq.overrideMimeType) {
                    xmlHttpReq.overrideMimeType = contentType;
                }
                if (contentType && xmlHttpReq.setRequestHeader) {
                    xmlHttpReq.setRequestHeader('Content-Type', contentType);
                }
                if (timeoutMs > 0) {
                    xmlHttpReq.timeout = timeoutMs;
                    xmlHttpReq.ontimeout = function () {
                        // Often this callback will be called after onreadystatechange.
                        // The first callback called will cleanup the other to prevent duplicate responses.
                        xmlHttpReq.ontimeout = xmlHttpReq.onreadystatechange = null;
                        if (callback) callback(false, "timeout after " + timeoutMs + " ms");
                    };
                }

                xmlHttpReq.onreadystatechange = function () {
                    if (xmlHttpReq.readyState === 4) {
                        xmlHttpReq.ontimeout = xmlHttpReq.onreadystatechange = null;
                        if (xmlHttpReq.status == 200) {
                            if (callback) callback(true, xmlHttpReq.responseText);
                        } else {
                            if (callback) callback(false, "http status " + xmlHttpReq.status);
                        }
                    }
                };

                xmlHttpReq.send(data);

                return null; // no way to cancel the request
            };

            this.release = function () {
                // nothing to release
            };

        },


        Html5Storage: function () {
            function _constr() {
                // nothing to initialize
            }

            _constr.apply(this, arguments);

            this.saveData = function (storageSpace, storageKey, data, callback) {
                var localStorageKey = storageSpace + "." + storageKey;
                try {
                    localStorage.setItem(localStorageKey, data);
                    callback(true, null);
                } catch (e) {
                    callback(false, e.toString());
                }
            };

            this.loadData = function (storageSpace, storageKey, callback) {
                var localStorageKey = storageSpace + "." + storageKey;
                try {
                    var data = localStorage.getItem(localStorageKey);
                    callback(true, data);
                } catch (e) {
                    callback(false, e.toString());
                }
            };

            this.release = function () {
                // nothing to release
            };

        },


        Html5Metadata: function () {

            function _constr() {
                // nothing to initialize
            }

            _constr.apply(this, arguments);

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getBrowserName = function () {
                var M = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                return M[1];
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getBrowserVersion = function () {
                var M = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                return M[2];
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getDeviceBrand = function () {
                return null;
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getDeviceManufacturer = function () {
                return null;
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getDeviceModel = function () {
                return null;
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getDeviceType = function () {
                var isiPad = /ipad/i.test(navigator.userAgent.toLowerCase());
                if (isiPad) return 'iPad';
                var isiPhone = /iphone/i.test(navigator.userAgent.toLowerCase());
                if (isiPhone) return 'iPhone';
                var isiPod = /ipod/i.test(navigator.userAgent.toLowerCase());
                if (isiPod) return 'iPod';
                var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
                if (isAndroid) return 'Android';
                var isBlackBerry = /blackberry/i.test(navigator.userAgent.toLowerCase());
                if (isBlackBerry) return 'BlackBerry';
                var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());
                if (isWindowsPhone) return 'Windows Phone'
                var isWebOS = /webos/i.test(navigator.userAgent.toLowerCase());
                if (isWebOS) return 'webOS';
                return null;
            };

            // There is no value we can access that qualifies as the device version.
            this.getDeviceVersion = function () {
                return null;
            };

            // HTML5 can qualify as an application framework of sorts.
            this.getFrameworkName = function () {
                return "HTML5";
            };

            // No convenient way to detect HTML5 version.
            this.getFrameworkVersion = function () {
                return null;
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getOperatingSystemName = function () {
                var OSName = "Unknown OS";
                if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
                else if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
                else if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
                else if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
                return OSName;
            };

            // Relying on HTTP user agent string parsing on the Conviva Platform.
            this.getOperatingSystemVersion = function () {
                return null;
            };

            this.release = function () {
                // nothing to release
            };

        },

        Html5Logging: function () {

            function _constr() {
                // nothing to initialize
            }

            _constr.apply(this, arguments);

            this.consoleLog = function (message, logLevel) {
                if (typeof console === 'undefined') return;
                if (console.log && logLevel === Conviva.SystemSettings.LogLevel.DEBUG ||
                    logLevel === Conviva.SystemSettings.LogLevel.INFO) {
                    console.log(message);
                } else if (console.warn && logLevel === Conviva.SystemSettings.LogLevel.WARNING) {
                    console.warn(message);
                } else if (console.error && logLevel === Conviva.SystemSettings.LogLevel.ERROR) {
                    console.error(message);
                }
            };

            this.release = function () {
                // nothing to release
            };

        }


    }));

})(window.mw, window.jQuery, kWidget);
