
( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ['mw.FreeWheel'], 'FreeWheel', function( embedPlayer, callback){
	embedPlayer.freeWheel = new mw.FreeWheelController( embedPlayer, callback );
});

} )( window.mw, window.jQuery );