( function( mw, $ ) { "use strict";

mw.addResourcePaths({
	"mw.DoubleClick": "mw.DoubleClick.js"
});
mw.addModuleLoader( 'DoubleClick', ['AdSupport', 'mw.DoubleClick'] );

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// disable doubleClick for isOS < 5 ( breaks content playback )
		if( mw.isIOS() && ! mw.isIOS5() ){
			callback();
			return ;
		}
		
		// Check if plugin is enabled
	 	if( embedPlayer.isPluginEnabled( 'doubleClick' ) ){
			mw.load( 'DoubleClick', function(){
				new mw.DoubleClick( embedPlayer, callback );
			});
		} else {
			callback();
		}
	});
});

})( window.mw, jQuery);
