
( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ["mw.Omniture"], 'omniture', function( embedPlayer, callback){
	new mw.Omniture( embedPlayer, callback );
});

})( window.mw, window.jQuery);