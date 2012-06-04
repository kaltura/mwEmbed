/**
 * double click init
 */
( function( mw ) { "use strict";

	mw.addKalturaConfCheck( embedPlayer, callback ){
		// disable doubleClick for isOS < 5 ( breaks content playback )
		if( mw.isIOS() && ! mw.isIOS5() ){
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
