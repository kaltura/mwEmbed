(function (mw, $) {
	"use strict";

	mw.PluginManager.add( 'tvpapiGetLicenseData', mw.KBasePlugin.extend( {

		defaultConfig: {},

		isDisabled: false,

		setup: function ( embedPlayer ) {
			this.addBindings();
		},

		getProxyConfig: function( attr, raw ) {
			if( raw ){
				return this.embedPlayer.getRawKalturaConfig( "proxyData", attr );
			}
			return this.embedPlayer.getKalturaConfig( "proxyData", attr );
		},

		addBindings: function () {
			var _this = this;
			this.bind("challengeCustomData", function(event, customData){
				var proxyConfig = _this.getProxyConfig();
				customData.customString = proxyConfig.ssGuid;
			});
			this.bind("updateDashContextData", function(event, data){
				var proxyConfig = _this.getProxyConfig();
				data.contextData.customData.userId = proxyConfig.requestData.initObj.SiteGuid;
				data.contextData.widevineHeader.trackType = "SD_HD";
			});
		}
	}));
})(window.mw, window.jQuery);
