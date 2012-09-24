( function( mw, $ ) { "use strict";

mw.addResourcePaths({
	"mw.DoubleClick": "mw.DoubleClick.js"
});
mw.addModuleLoader( 'DoubleClick', ['AdSupport', 'mw.DoubleClick'] );

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// disable doubleClick for isOS < 5 ( breaks content playback )
		if( mw.isIOS4() || mw.isIOS4() ){
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
			mw.load( 'DoubleClick', function(){
				new mw.DoubleClick( embedPlayer, callback, pluginName );
			});
		} else {
			callback();
		}
	});
});

})( window.mw, jQuery);
