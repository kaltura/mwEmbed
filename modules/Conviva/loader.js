/**
* Adds Conviva plugin support
*/
( function( mw, $ ) {
mw.addResourcePaths({
	"mw.Conviva": "mw.Conviva.js"
});
	
// XXX can remove once we move to new resource loader:
window.convivaPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		if( embedPlayer.isPluginEnabled ( 'conviva' ) ){
			mw.load('mw.Conviva', function(){
				// call the Conviva plugin that loads conviva html5 library and 
				// issues the callback once done setting up player bindings 
				new mw.Conviva( embedPlayer, callback );
			});
			return ;
		}
		// don't block player build out if plugin is not enabled
		callback();
	});
});

})( window.mw, jQuery );