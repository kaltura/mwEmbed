mw.addResourcePaths({
	"mw.Omniture": "mw.Omniture.js"
});

// Omniture communicates all the dispatched events to the parent frame
$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Omniture_DispatchEvent' );
});

$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check the "plugin" is enabled:
		if( embedPlayer.getKalturaConfig( 'omniture', 'plugin') ){	
			mw.load('mw.Omniture', function(){
				new mw.Omniture( embedPlayer, callback);
			});
			// wait for omniture plugin ( return to block callback bellow )
			return ;
		}
		// no Omniture, run callback directly
		callback();
	});
});
