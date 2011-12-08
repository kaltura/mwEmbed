
( function( mw, $){
	
mw.addResourcePaths({
	"mw.NielsenCombined": "mw.NielsenCombined.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the plugin is enabled: 
		if( embedPlayer.isPluginEnabled( 'nielsenCombined' ) ){
			mw.load( "mw.NielsenCombined", function(){
				new mw.NielsenCombined( embedPlayer, callback );
			});
		} else {
			// No NielsenCombined active( continue player build out )  
			callback();
		}
	});
});

})( window.mw, window.jQuery);