( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( ['mw.AkamaiAnalytics'], 'akamaiAnalytics', function( embedPlayer, callback ){
	embedPlayer.akamaiAnalytics = new mw.AkamaiAnalytics( embedPlayer, callback );
});

} )( window.mw, window.jQuery );