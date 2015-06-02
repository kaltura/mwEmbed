/**
 * ComscoreStreamingTag loader
 */
( function( mw ) { "use strict";
	mw.addKalturaPlugin( ["comscorestreamingtag"], 'comscorestreamingtag', function( embedPlayer, callback ){
		new mw.ComscoreStreamingTag( embedPlayer, callback );
	});
})( window.mw);
