/**
 * double click init
 */
( function( mw ) { "use strict";

	mw.addKalturaConfCheck( function(embedPlayer, callback ){
		// Disable doubleClick for isOS < 5 ( breaks content playback )
		if( mw.isIOS4() || mw.isIOS3() ){
			callback();
			return ;
		}
		// disable on android 4 where not mobile chrome
		if( mw.isAndroid40() && !mw.isMobileChrome() ){
			callback();
			return ;
		}
		// Check if plugin is enabled
	 	if( embedPlayer.isPluginEnabled( 'doubleClick' ) || embedPlayer.isPluginEnabled( 'doubleclick' )  ){
	 		// support both case types:
	 		var pluginName = ( embedPlayer.isPluginEnabled( 'doubleClick' ) )? 'doubleClick' : 'doubleclick';
			mw.load( 'mw.DoubleClick', function(){
				new mw.DoubleClick( embedPlayer, callback, pluginName );
			});
		} else {
			callback();
		}
	});

})( window.mw );
