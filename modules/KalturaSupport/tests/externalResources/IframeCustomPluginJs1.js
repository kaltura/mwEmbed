( function( mw, $ ) { "use strict";
	mw.addKalturaConfCheck(function( embedPlayer, callback ) {
		mw.log("ExternalResources:: IframeCustomPluginJs1:: CheckConfig");
		embedPlayer.setKDPAttribute("myCustomPlugin", "foo", "bar");
		// continue player build out
		callback();
	});
})( window.mw, jQuery );