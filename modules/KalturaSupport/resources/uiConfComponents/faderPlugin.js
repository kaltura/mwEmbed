/**
* Adds fader plugin support
* Read the fader plugin from the UIConf
* <Plugin id="fader" width="0%" height="0%" includeInLayout="false" target="{controllersVbox}" hoverTarget="{PlayerHolder}" duration="0.5"/>
*/
( function( mw, $ ) { "use strict";

	var faderPlugin = function( embedPlayer ){
		if( embedPlayer.getKalturaConfig( 'target' ) == "{controllersVbox}" || 
			embedPlayer.getKalturaConfig( 'target' ) == "{controlsHolder}" 
		){
			embedPlayer.overlaycontrols = true;
		} else {
			embedPlayer.overlaycontrols = false;
		}
	};
	
	
	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			if( embedPlayer.isPluginEnabled( 'fader' ) ) {
				faderPlugin( embedPlayer );
			}
			callback();
		});
	});

})( window.mw, window.jQuery );