/**
 * <Plugin id="statistics" width="0%" height="0%" includeInLayout="false"/>
 *
 *	@dependencies
 *		mw.KAnalytics
 */
( function( mw, $ ) { "use strict";
	mw.addKalturaPlugin(  "statistics", function( embedPlayer, callback){
		mw.addKAnalytics( embedPlayer );
		callback();
	});

})( window.mw, window.jQuery );
