
( function( mw, $ ) {
	
mw.addResourcePaths({
	"mw.FreeWheelController": "mw.FreeWheelController.js"
});

mw.addModuleLoader( 'FreeWheel', [ 'AdSupport', 'mw.FreeWheelController' ] );

// Check if the plugin is enabled: 
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check for both freeWheel case names: 
		var pluginName =  null;
		if(  embedPlayer.isPluginEnabled( 'FreeWheel' ) ){
			pluginName = 'FreeWheel';
		} else if(  embedPlayer.isPluginEnabled( 'freeWheel' ) ){
			pluginName = 'freeWheel';
		}
		// Check if the freewheel plugin is enabled:
		if( pluginName){
			mw.load( ["FreeWheel"], function(){
				// pass the freewheel plugin 
				embedPlayer.freeWheel = new mw.FreeWheelController( embedPlayer, callback, pluginName );
			});
		} else {
			// No FreeWheel plugin issue callback to continue player build out
			callback();
		}
	});
});

} )( window.mw, window.jQuery );