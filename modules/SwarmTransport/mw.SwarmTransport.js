
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
			// Setup local reference to embedPlayer interface
			var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
											
			// Setup the "embedCode" binding to swap in an updated url
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
			
				// Confirm SwarmTransport add-on is available ( defines swarmTransport var )  
				if( typeof window['swarmTransport'] != 'undefined' ){			
					
					mw.log(" SwarmTransport :: checkPlayerSourcesEvent ");
					_this.addSwarmSource( embedPlayer, callback );
										
				} else {								
					// No swarm support just directly issue the callback 
					callback();					
				}
			} );
			
			// Check if we have a "recommend" binding and provide an xpi link			
			mw.log('bind::addControlBindingsEvent');
			$j( embedPlayer ).bind( 'addControlBindingsEvent', function(){				
				if( mw.getConfig( 'recommendSwarmTransport' ) &&  
					typeof window['swarmTransport'] == 'undefined' &&
					$j.browser.mozilla ) {
					embedPlayer.ctrlBuilder.doWarningBindinng( 
						'recommendSwarmTransport',
						_this.getRecomendSwarmMessage()						
					);
				}
			});
					
		} );	
	
		
		
		$j( mw ).bind( 'embedPlayerUpdateMediaPlayersEvent', function( event, mediaPlayers){
			// Detect support for SwarmTransport
			if( typeof window['swarmTransport'] != 'undefined' ){
				// Add the swarmTransport playerType
				mediaPlayers.defaultPlayers['video/swarmTransport'] = ['native'];
				
				// For now swarm transport only supports ogg ( probably add webm in the future ) 
				// Native html5 player  
				var swarmTransportPlayer = new mediaPlayer( 'swarmTransportPlayer', ['video/swarmTransport' ], 'native' );
				
				// Add the swarmTransport "player"
				mediaPlayers.addPlayer( swarmTransportPlayer );							
			} 						
		});
					
	},
	
	addSwarmSource: function( embedPlayer, callback ) {
		
		// Setup function to run in context based on callback result
		var finishAddSwarmSource = function(){
			// Get the highest quality source that the system can playback 
			// ( for now just grab the first ogg/theora )
			var source = embedPlayer.mediaElement.getSources( 'video/ogg' )[0];		
			var absoluteSource =  mw.absoluteUrl( source.getSrc() );
			var swarmSrc = httpseed2tstream( absoluteSource );
			
			mw.log('addSwarmSource for: ' + source.getSrc()  + "\nGot:" + swarmSrc );
			
			embedPlayer.mediaElement.tryAddSource( 
				$j('<source />')
				.attr( {
					'type' : 'video/swarmTransport',
					'title': gM('mwe-swarmtransport-stream-ogg'), 
					'src': 'tribe://' + swarmSrc,
					'default' : true // mark as default source
				} )
				.get( 0 )
			);
			callback();
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
	}, 
	
	getRecomendSwarmMessage: function(){
		//add a xpi link ( for now just link out to the web site ) 
		return gM( 'mwe-swarmtransport-recommend', 'http://www.tribler.org/trac/wiki/WikimediaCooperation' );			
	}
	
};

// Add player bindings for swarm Transport 
mw.SwarmTransport.addPlayerHooks();