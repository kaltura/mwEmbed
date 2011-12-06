
( function( mw, $){
	
mw.addResourcePaths({
	"mw.NielsenPlugin": "mw.NielsenPlugin.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the plugin is enabled: 
		if( embedPlayer.isPluginEnabled( 'NielsenPlugin' ) ){
			mw.load( "mw.NielsenPlugin", function(){
				new mw.NielsenPlugin( embedPlayer, callback );
			});
		} else {
			// No NielsenPlugin active( continue player build out )  
			callback();
		}
	});
});

})( window.mw, window.jQuery);