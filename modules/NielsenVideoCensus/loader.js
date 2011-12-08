
( function( mw, $){
	
mw.addResourcePaths({
	"mw.NielsenVideoCensus": "mw.NielsenVideoCensus.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the plugin is enabled: 
		if( embedPlayer.isPluginEnabled( 'nielsenVideoCensus' ) ){
			mw.load( "mw.NielsenVideoCensus", function(){
				new mw.NielsenVideoCensus( embedPlayer, callback );
			});
		} else {
			// No NielsenVideoCensus active( continue player build out )  
			callback();
		}
	});
});

})( window.mw, window.jQuery);