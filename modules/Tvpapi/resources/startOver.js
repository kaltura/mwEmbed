(function (mw, $) {
    "use strict";

    var startOver = mw.tvpapiRequest.extend( {

        defaultConfig: {
            "restMethod": "GetEPGLicensedData",
            "restApiBaseUrl": null,
            "EPGItemID": 0,
            "startTime": "0001-01-01T00:00:00",
            "userIP": "",
            "refferer": "",
            "countryCd2": "",
            "languageCode3": "",
            //There's an issue with startOver and open ended LIVE manifest - so use this flag to force
            //close ended manifest, where the end time returning from TVPAPI will be in the future.
            "forceCloseEndedManifest": false,
            "startFromBeginning": false // should playback start from live edge(false) or from beginning of DVR window(true)
        },

        isDisabled: false,
        seekOnPlaying: true,
        lastSelectedSource: "",

        setup: function ( ) {
            this.addBindings();
        },

        addBindings: function () {
            var _this = this;
            this.bind("SourceSelected", function(event, source){
                //Prevent dispatching request if source haven't change or it's not valid source (assetid is not valid)
                if ((source.assetid != 0) && (_this.lastSelectedSource != source.assetid)) {
                    _this.lastSelectedSource = source.assetid;
                    _this.getMediaLicenseLink( event, source );
                }
            });
            if (this.getConfig("startFromBeginning")) {
                //If start from beginning is set then on initial playing event seek to 0
                //we keep a flag and reset it on change media so this will get trigger for next time as well
                this.bind("playing", function () {
                    setTimeout(function(){
                        if (_this.seekOnPlaying) {
                            _this.seekOnPlaying = false;
                            _this.getPlayer().seek(0, false);
                        }
                    }, 0);
                });
                this.bind("onChangeMedia", function () {
                    _this.seekOnPlaying = true;
                });
            }
        },

        getMediaLicenseLink: function(event, source){
            var url = this.getRequestUrl();
            if (url) {
                var config = this.getConfig();
                var data = {
                    "mediaFileID": source.assetid,
                    "basicLink": source.src,
                    "formatType": config.forceCloseEndedManifest ? 0 : 1,
                    "EPGItemID": config.EPGItemID,
                    "startTime": config.startTime,
                    "userIP": config.userIP,
                    "refferer": config.refferer,
                    "countryCd2": config.countryCd2,
                    "languageCode3": config.languageCode3,
                    "initObj": this.getInitObj()
                };

                var getResponseLink = function (res) {
                    return res.mainUrl ||
                        ( res.licensed_link && res.licensed_link.main_url );
                };

                var _this = this;

                this.doRequest(url, data, {async: false}).then(
                    function (res) {
                        var mediaLink = getResponseLink(res);
                        if (mediaLink) {
                            _this.getPlayer().triggerHelper('tvpapiSubscription', [res]);
                            source.src = mediaLink;
                        } else {
                            _this.getPlayer().triggerHelper('tvpapiNoSubscription', [res]);
                        }
                    },
                    function (xmlHttpRequest, status) {
                        //TODO:Handle error - dispatch event
                    },
                    null
                );
            }

            return false;
        }
    });
    mw.PluginManager.add( 'tvpapiStartOver', startOver);
})(window.mw, window.jQuery);
