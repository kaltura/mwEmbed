( function( mw, $ ) { "use strict";
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
	
	mw.log("ExternalResources:: IframeCustomPluginJs1:: newEmbedPlayerEvent");
    
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
    
		mw.log("ExternalResources:: IframeCustomPluginJs1:: KalturaSupport_CheckUiConf");
		
		embedPlayer.setKDPAttribute("myCustomPlugin", "foo", "bar");
		// continue player build out
		callback();
	});
});
})( window.mw, jQuery );