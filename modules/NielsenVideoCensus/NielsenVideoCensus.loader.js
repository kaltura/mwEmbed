
( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ["mw.NielsenVideoCensus"], 'nielsenVideoCensus', function( embedPlayer, callback) {
	new mw.NielsenVideoCensus( embedPlayer, callback );
});

})( window.mw, window.jQuery);