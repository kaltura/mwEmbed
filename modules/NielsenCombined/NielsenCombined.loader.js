
( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ["mw.NielsenCombined"], 'nielsenCombined', function( embedPlayer, callback) {
	new mw.NielsenCombined( embedPlayer, callback );
});

})( window.mw, window.jQuery);