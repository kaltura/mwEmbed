(function (mw, $) {
    "use strict";

    var getlicensedUrl = mw.tvpapiRequest.extend( {

        defaultConfig: {
            "restApiBaseUrl": "",
            "restMethod": "service/licensedUrl/action/get",
            "apiVersion":"3.6.1353.16020",
            "ItemID": 0,
            "Type": "",
            "Params": {},
            "ks": ""
        },

        isDisabled: false,
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
        },

        getMediaLicenseLink: function(event, source){
            var url = this.getRequestUrl();

            if (url) {
                var config = this.getConfig();

                var request = {};

                switch(config.Type) {
                  case "Recording":
                    var mediaData = this.getProxyConfig();
                    var mediaSelectedFile = mediaData.Files.filter(function( file ) {
                                                                return file.FileID == source.assetid;
                                                            });
                    request = {
                        "objectType": "KalturaLicensedUrlRecordingRequest",
                        "assetId": config.ItemID,
                        "fileType": mediaSelectedFile[0].Format
                    }
                    break;
                  case "Media":
                    request = {
                        "objectType": "KalturaLicensedUrlMediaRequest",
                        "assetId": config.ItemID,
                        "contentId": config.Params.contentId,
                        "baseUrl": config.Params.baseUrl
                    }
                    break;
                  case "EPG":
                    request = {
                        "objectType": "KalturaLicensedUrlEpgRequest",
                        "assetId": config.ItemID,
                        "contentId": config.Params.contentId,
                        "baseUrl": config.Params.baseUrl,
                        "streamType": config.Params.streamType, //CATCHUP START_OVER TRICK_PLAY
                        "startDate": config.Params.startDate
                    }
                    break;
                }

                var data = {
                  "apiVersion":config.apiVersion,
                  "ks": config.ks,
                  "request":request
                };

                var getResponseLink = function (res) {
                    return res.result.mainUrl ;
                };

                var _this = this;

                this.doRequest(url, data).then(
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
    mw.PluginManager.add( 'tvpapiGetlicensedUrl', getlicensedUrl);
})(window.mw, window.jQuery);
