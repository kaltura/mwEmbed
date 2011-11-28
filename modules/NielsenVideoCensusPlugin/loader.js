
( function( mw, $){
	
mw.addResourcePaths({
	"mw.NielsenVideoCensusPlugin": "mw.NielsenVideoCensusPlugin.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the plugin is enabled: 
		if( embedPlayer.isPluginEnabled( 'NielsenVideoCensusPlugin' ) ){
			mw.load( "mw.NielsenVideoCensusPlugin", function(){
				new mw.NielsenVideoCensusPlugin( embedPlayer, callback );
			});
		} else {
			// No NielsenVideoCensusPlugin active( continue player build out )  
			callback();
		}
	});
});

})( window.mw, window.jQuery);