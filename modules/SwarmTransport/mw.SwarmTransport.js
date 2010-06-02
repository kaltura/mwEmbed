
/**
 * Add the msg text: 
 */
mw.includeAllModuleMessages();

/** 
* Define mw.SwarmTransport object: 
*/
mw.SwarmTransport = {
	addPlayerHooks: function(){
		var _this = this; 
		// Bind some hooks to every player:  		
		$j( mw ).bind( 'newEmbedPlayerEvent', function( event, swapedPlayerId ) {
			// Setup local refrence to embedPlayer interface
			var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
											
			// Setup the "embedCode" binding to swap in an updated url
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
				// Confirm SwarmTransport add-on is avaliable ( defines swarmTransport var )  
				if( typeof window['swarmTransport'] != 'undefined' ){
					mw.log(" SwarmTransport :: checkPlayerSourcesEvent ");
					_this.addSwarmSource( embedPlayer, callback );
				}
			} );
			
		} );				
	},
	
	addSwarmSource: function( embedPlayer, callback ) {
		
		// Setup function to run in context based on callback result
		var finishAddSwarmSource = function(){
			// Get the highest quality source that the system can playback 
			// ( for now just grab the first ogg/theora )
			var source = embedPlayer.mediaElement.getSources( 'video/ogg' )[0];			
			var swarmSrc = httpseed2tstream( source.getSrc() );
			
			mw.log('addSwarmSource for: ' + source.getSrc()  + "\nGot:" + swarmSrc );
			
			embedPlayer.mediaElement.tryAddSource( 
				$j('<source />')
				.attr( {
					'title': gM('mwe-swarmtransport-stream'), 
					'src': swarmSrc
				} )
				.get( 0 )
			);
		}
		
		// p2p next does not have a lookup service rather a static file that defines a function 
		// by the name of httpseed2tstream ( check if httpseed2tstream is defined ) 
		if ( typeof httpseed2tstream == 'undefined' ) {
			mw.load('http://wikipedia.p2p-next.org/tlookup.js', function(){
				finishAddSwarmSource();
			} );
		} else {
			finishAddSwarmSource();	
		}
	}
	
};

// Add player bindings for swarm Transport 
mw.SwarmTransport.addPlayerHooks();