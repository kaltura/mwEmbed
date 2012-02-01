
( function( mw, $){

mw.addResourcePaths({
	"mw.Omniture": "mw.Omniture.js"
});

// Omniture communicates all the dispatched events to the parent frame
$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Omniture_DispatchEvent' );
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check the "plugin" is enabled:
		if( embedPlayer.isPluginEnabled( 'omniture' ) ){
			mw.load('mw.Omniture', function(){
				new mw.Omniture( embedPlayer, callback);
			});
			// wait for omniture plugin ( return to block callback below )
			return ;
		} else{
			// no Omniture, run callback directly
			callback();
		}
	});
});

})( window.mw, window.jQuery);