( function( mw, $){

mw.addResourcePaths({
	"mw.DoubleClick": "mw.DoubleClick.js"
});
mw.addModuleLoader( 'DoubleClick', ['AdSupport', 'mw.DoubleClick'] );

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		if( embedPlayer.getKalturaConfig( 'DoubleClick', 'plugin' ) ){
			mw.load( 'DoubleClick', function(){
				new mw.DoubleClick( embedPlayer, callback );
			});
		} else {
			callback();
		}
	});
});

})( window.mw, jQuery);
