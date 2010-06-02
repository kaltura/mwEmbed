

/** 
* Define a simple global object no instance instantiation 
*/
mw.SwarmTransport = {
	addPlayerHooks : function(){
		var _this = this; 
		// Bind some hooks to every player:  		
		$j( mw ).bind( 'newEmbedPlayerEvent', function( event, swapedPlayerId ) {
			// Setup local refrence to embedPlayer interface
			var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
											
			// Setup the "embedCode" binding to swap in an updated url
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
				mw.log(" entryId:: checkPlayerSourcesEvent ");
				_this.addSwarmSource( embedPlayer, callback );
			} );
			
		} );				
	},
	
	addSwarmSource: function( embedPlayer, callback ) {
		// p2p next does not have a lookup service rather a static file that defines a function 
		// by the name of: 
		if ( typeof httpseed2tstream == 'undefined' ){
			// get http://wikipedia.p2p-next.org/tlookup.js
		}
	}
	
};

// Add player bindings for swarm Transport 
mw.SwarmTransport.addPlayerHooks();