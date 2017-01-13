( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ['mw.UniversalAnalytics'], 'universalAnalytics', function( embedPlayer, callback ){
	embedPlayer.universalAnalytics = new mw.UniversalAnalytics( embedPlayer, callback );
});

} )( window.mw, window.jQuery );