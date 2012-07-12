
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
		//Check if siteCatalyst15 is enabled: 
		var pluginName = embedPlayer.isPluginEnabled( 'omniture' )?  'omniture' : 
						embedPlayer.isPluginEnabled( 'siteCatalyst15' )? 'siteCatalyst15' :
						null;
		if( pluginName ){
			mw.load('mw.Omniture', function(){
				new mw.Omniture( embedPlayer, pluginName, callback );
			});
			return ;
		}
		// no Omniture, run callback directly
		callback();
	});
});

})( window.mw, window.jQuery);