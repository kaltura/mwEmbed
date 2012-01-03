( function( mw, $){

mw.addResourcePaths({
	"mw.DoubleClick": "mw.DoubleClick.js"
});
mw.addModuleLoader( 'DoubleClick', ['AdSupport', 'mw.DoubleClick'] );

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check for both doubleclick case names: 
		var pluginName =  null;
		if(  embedPlayer.isPluginEnabled( 'DoubleClick' ) ){
			pluginName = 'DoubleClick';
		} else if(  embedPlayer.isPluginEnabled( 'doubleClick' ) ){
			pluginName = 'doubleClick';
		}
		if( pluginName ){
			mw.load( 'DoubleClick', function(){
				new mw.DoubleClick( embedPlayer, callback, pluginName );
			});
		} else {
			callback();
		}
	});
});

})( window.mw, jQuery);
