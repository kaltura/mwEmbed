
( function( mw, $){
	
mw.addResourcePaths({
	"mw.Comscore": "mw.Comscore.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the plugin is enabled: 
		if( embedPlayer.isPluginEnabled( 'comscore' ) ){
			mw.load( "mw.Comscore", function(){
				new mw.Comscore( embedPlayer, callback );
			});
		} else {
			// no com score plugin active: 
			callback();
			return ;
		}
		
	});
});


})( window.mw, window.jQuery);