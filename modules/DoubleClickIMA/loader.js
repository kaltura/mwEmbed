( function( mw, $){

mw.addResourcePaths({
	"mw.DoubleClickIMA": "mw.DoubleClickIMA.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		if( embedPlayer.getKalturaConfig( 'doubleClickIMA', 'plugin' ) ){
			mw.load( 'mw.DoubleClickIMA', function(){
				new mw.DoubleClickIMA( embedPlayer );
			})
		}
	});
});

})( window.mw, jQuery);
