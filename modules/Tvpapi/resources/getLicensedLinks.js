(function (mw, $) {
	"use strict";

	var tvpapiGetLicensedLinks = mw.tvpapiRequest.extend( {

		defaultConfig: {
			"restMethod": "GetLicensedLinks",
			"restApiBaseUrl": null
		},

		isDisabled: false,
		lastSelectedSource: "",

		setup: function ( embedPlayer ) {
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
            this.bind("onChangeMedia", function(event, source){
                //reset the last selected source param
                _this.lastSelectedSource="";
            });
		},

		getMediaLicenseLink: function(event, source){
			var url = this.getRequestUrl();
			if (url) {
				var sessionData = source.src.match(/([&|\?]?playSessionId=[0-9a-zA-Z|\-]+)&clientTag=html5:v[0-9_\.|dev|a-zA-Z]+/ig);
				if (sessionData && sessionData.length) {
					source.src = source.src.replace( sessionData[0] , '' );
				}
				var data = {
					"mediaFileID": source.assetid,
					"baseLink": source.src,
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
							if (sessionData && sessionData.length){
								var qp = ( mediaLink.indexOf('?') === -1) ? '?' : '&';
								var sessionString = sessionData[0].substring(1);
								mediaLink += qp + sessionString;
							}
							source.src = mediaLink;
						} else {
							setTimeout(function(){
								_this.getPlayer().triggerHelper('tvpapiNoSubscription', [res]);
							},0)
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
	mw.PluginManager.add( 'tvpapiGetLicensedLinks', tvpapiGetLicensedLinks);
})(window.mw, window.jQuery);
