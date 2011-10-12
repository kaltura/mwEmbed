( function( mw, $ ) {
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
	
	mw.log("ExternalResources:: IframeCustomPluginJs1:: newEmbedPlayerEvent");
    
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
    
		mw.log("ExternalResources:: IframeCustomPluginJs1:: KalturaSupport_CheckUiConf");
		// continue player build out
		callback();
	});
});
})( window.mw, jQuery );