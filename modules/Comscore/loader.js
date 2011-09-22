
( function( mw, $){
	
mw.addResourcePaths({
	"mw.Comscore": "mw.Comscore.js"
});

// Send beacons on the parent iframe page so that we can use the on-page comscore include if present
/*
$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Comscore_Beacon' );
});

// Add the Comscore client ( could put into a "client" file but so small: 
$j( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
	$j( playerProxy ).bind( 'Comscore_Beacon', function( event, beconObject) {
		console.log('send Comscore_Beacon', beconObject);
		var sendBecon = function(){
			COMSCORE.beacon( beconObject );
		};
		// Load the comscore becon system if not already loaded: 
		if( ! window.COMSCORE ){
			$.getScript( document.location.protocol == "https:" ? "https://sb" : "http://b"
			 	+ ".scorecardresearch.com/beacon.js", function(){
				sendBecon();
			});
		} else {
			sendBecon();
		}
	});
});
*/
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){

		// check if the plugin is enabled: 
		if( embedPlayer.isPluginEnabled( 'comscore' ) ){
			mw.load( "mw.Comscore", function(){
				new mw.Comscore( embedPlayer, callback );
			});
		} else {
			// no com score plugin active: 
			callback();
			return ;
		}
		
	});
});


})( window.mw, window.jQuery);