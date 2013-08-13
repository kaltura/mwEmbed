( function( mw ) { "use strict";

	mw.addKalturaPlugin( ['mw.Widevine'], 'widevine', function( embedPlayer, callback){
		var widevine = new mw.Widevine( embedPlayer, callback );
	});

} )( window.mw );