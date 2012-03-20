/**
* Adds fader plugin support
* Read the fader plugin from the UIConf
* <Plugin id="fader" width="0%" height="0%" includeInLayout="false" target="{controllersVbox}" hoverTarget="{PlayerHolder}" duration="0.5"/>
*/
( function( mw, $ ) { "use strict";

	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// get Raw config ( we don't support id name resolution yet )
			var faderConfig = embedPlayer.getRawKalturaConfig(
					'fader', 
					['plugin', 'target', 'hoverTarget', 'duration', 'fadeOutDelay', 'autoHide']
			);
			faderPlugin( embedPlayer, faderConfig );
			callback();
		});
	});

	window.faderPlugin = function( embedPlayer, faderConfig ){
		if( faderConfig.target == "{controllersVbox}" || 
			faderConfig.target == "{controlsHolder}" 
		){
			embedPlayer.overlaycontrols = true;
		} else {
			embedPlayer.overlaycontrols = false;
		}
	};

})( window.mw, window.jQuery );