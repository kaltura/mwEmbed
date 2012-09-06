
( function( mw, $ ) { "use strict";
	
mw.addResourcePaths({
	"mw.FreeWheelController": "mw.FreeWheelController.js"
});

mw.addModuleLoader( 'FreeWheel', [ 'AdSupport', 'mw.FreeWheelController' ] );

// Check if the plugin is enabled: 
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		
		// disable on android 4 where not mobile chrome
		if( mw.isAndroid40() && !mw.isMobileChrome() ){
			callback();
			return ;
		}
		
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