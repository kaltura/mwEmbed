mw.addResourcePaths({
	"mw.Comscore": "mw.Comscore.js"
});

//Ads have to communicate with parent iframe to support companion ads.
$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Comscore_Beacon' );
});

// Add the Comscore client ( could put into a "client" file but so small: 
$j( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
	$j( playerProxy ).bind( 'Comscore_Beacon', function( event, beconObject) {
		var sendBecon = function(){
			COMSCORE.beacon( beconObject );
		}
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