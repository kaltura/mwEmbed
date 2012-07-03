
( function( mw, $ ) { "use strict";

mw.addResourcePaths({
	"mw.SiteCatalyst15": "mw.SiteCatalyst15.js"
});

// Omniture communicates all the dispatched events to the parent frame
$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Omniture_DispatchEvent' );
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		//Check if siteCatalyst15 is enabled: 
		if( embedPlayer.isPluginEnabled( 'siteCatalyst15' ) ){
			mw.load('mw.SiteCatalyst15', function(){
				new mw.SiteCatalyst15( embedPlayer, callback );
			});
			return ;
		}
		// no Omniture, run callback directly
		callback();
	});
});

})( window.mw, window.jQuery);