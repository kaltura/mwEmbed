(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'addLicenseCustomData', mw.KBaseProxyPlugin.extend( {

			defaultConfig: {},

			isDisabled: false,

			setup: function ( embedPlayer ) {
				this.addBindings();
			},

			addBindings: function () {
				var _this = this;
				this.bind("challengeCustomData", function(event, customData){
					var proxyConfig = _this.getProxyConfig();
					customData.SecureSitedGuid = proxyConfig.ssGuid;
				});
			}
		} )
	);

})( window.mw, window.jQuery );
