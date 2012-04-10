
( function( mw, $ ) { "use strict";
	
mw.addResourcePaths({
	"mw.FreeWheelController": "mw.FreeWheelController.js"
});

mw.addModuleLoader( 'FreeWheel', [ 'AdSupport', 'mw.FreeWheelController' ] );

// Check if the plugin is enabled: 
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the freewheel plugin is enabled:
		if( embedPlayer.isPluginEnabled( 'freeWheel' ) ){
			mw.load( ["FreeWheel"], function(){
				// pass the freewheel plugin 
				embedPlayer.freeWheel = new mw.FreeWheelController( embedPlayer, callback );
			});
		} else {
			// No FreeWheel plugin issue callback to continue player build out
			callback();
		}
	});
});

} )( window.mw, window.jQuery );