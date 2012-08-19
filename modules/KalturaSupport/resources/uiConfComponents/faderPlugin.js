/**
* Adds fader plugin support
* Read the fader plugin from the UIConf
* <Plugin id="fader" width="0%" height="0%" includeInLayout="false" target="{controllersVbox}" hoverTarget="{PlayerHolder}" duration="0.5"/>
*/
( function( mw, $ ) { "use strict";

	var faderPlugin = function( embedPlayer ){
		var target = embedPlayer.getRawKalturaConfig( 'fader', 'target' );
		if( target == "{controllersVbox}" ||
			target == "{controlsHolder}" ||
			target == "{controllerVertical}"
		){
			embedPlayer.overlaycontrols = true;
		} else {
			embedPlayer.overlaycontrols = false;
		}
	};
	mw.addKalturaConfCheck( function( embedPlayer, callback ) {
		faderPlugin( embedPlayer );
		callback();
	});

})( window.mw, window.jQuery );