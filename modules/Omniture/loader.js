
( function( mw, $ ) { "use strict";

mw.addResourcePaths({
	"mw.Omniture": "mw.Omniture.js"
});

// Omniture communicates all the dispatched events to the parent frame
$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Omniture_DispatchEvent' );
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// get the captions plugin name list from config: 
		var omniturePluginnames = ['omniture', 'siteCatalyst15'];
		var omniturePluginName = null;
		for( var i =0; i < omniturePluginnames.length; i++ ){
			omniturePluginName = omniturePluginnames[i];
			if( embedPlayer.isPluginEnabled( omniturePluginName ) ){
				mw.load('mw.Omniture', function(){
					new mw.Omniture( embedPlayer, omniturePluginName, callback );
				});
				return ;
			}
		};
		// no Omniture, run callback directly
		callback();
	});
});

})( window.mw, window.jQuery);