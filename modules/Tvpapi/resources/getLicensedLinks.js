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
		},

		getMediaLicenseLink: function(event, source){
			var url = this.getRequestUrl();
			if (url) {
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
	mw.PluginManager.add( 'tvpapiGetLicensedLinks', tvpapiGetLicensedLinks);
})(window.mw, window.jQuery);
