( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ['mw.GoogleAnalytics'], 'googleAnalytics', function( embedPlayer, callback ){
	embedPlayer.googleAnalytics = new mw.GoogleAnalytics( embedPlayer, callback );
});

} )( window.mw, window.jQuery );