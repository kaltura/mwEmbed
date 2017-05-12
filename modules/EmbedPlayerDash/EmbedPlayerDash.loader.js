( function( mw, $ ) { "use strict";
	mw.addKalturaPlugin( ['mw.Dash'], 'dash', function( embedPlayer, callback){
		// we do user agent checks inside mw.Dash to be compatible with jsonConfig branch
		// which largely does away with the 'loader' concept.  
		embedPlayer.dash = new mw.Dash( embedPlayer, callback );
	});
})( window.mw, jQuery );
