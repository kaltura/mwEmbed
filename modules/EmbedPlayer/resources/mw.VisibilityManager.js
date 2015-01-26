( function( mw, $ ) { "use strict";

mw.VisibilityManager = function( embedPlayer ) {
	return this.init( embedPlayer );
};

mw.VisibilityManager.prototype = {
	resumePlayback: false, // should we resume playback when the page is visible again

	init: function( embedPlayer ) {

		// visibility API is not supported by IE8 and IE9. Also can be disabled using Flashvar.
		if ( mw.isIE8() || mw.isIE9() || mw.getConfig('disableVisibility') ){
			return;
		}

		var _this = this;

		document.addEventListener("visibilitychange", function() {
			if ( document.hidden ) {
				$(embedPlayer).trigger("visibilityEvent", ["hidden"]); // dispatch event for analytics tracking if needed
				if ( embedPlayer.isPlaying() ){
					_this.resumePlayback = true;
					embedPlayer.sendNotification( "doPause" );
				}
			} else {
				$(embedPlayer).trigger("visibilityEvent", ["visible"]); // dispatch event for analytics tracking if needed
				if ( _this.resumePlayback ){
					embedPlayer.sendNotification( "doPlay" );
					_this.resumePlayback = false;
				}
			}
		});
		return this;
	}
};

})( window.mw, window.jQuery );