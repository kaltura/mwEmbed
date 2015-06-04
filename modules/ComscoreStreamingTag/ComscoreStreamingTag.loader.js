/**
 * ComscoreStreamingTag loader
 */
( function( mw ) { "use strict";
	mw.addKalturaPlugin( ["ComScoreStreamingTag"], 'ComScoreStreamingTag', function( embedPlayer, callback ){
		new mw.ComscoreStreamingTag( embedPlayer, callback );
	});
})( window.mw);
