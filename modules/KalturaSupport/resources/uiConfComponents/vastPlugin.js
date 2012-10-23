( function( mw, $ ) { "use strict";

mw.addKalturaPlugin( [ "mw.AdTimeline", "mw.KAds" ], "vast", function( embedPlayer, callback){
	embedPlayer.kAds = new mw.KAds( embedPlayer, function(){
		mw.log( "AdPlugin: Done loading ads, run callback" );
		// Wait until ads are loaded before running callback
		// ( We don't want to display the player until ads are ready )
		callback();
	});
});

})( window.mw, jQuery );
