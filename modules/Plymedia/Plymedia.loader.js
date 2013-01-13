/**
* Plymedia close caption module loader
*
* @The module fetches subtitles from Subply by kaltura's entryId
* @author Elizabeth Marr
*
* @author Michael Dale, ported to RL17
*/
( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ["mw.Subply"], 'plymedia', function( embedPlayer, callback) {
	mw.Subply.bindPlayer( embedPlayer );
	callback();
});

} )( window.mw, jQuery );