
/**
 * Add the msg text: 
 */
mw.includeAllModuleMessages();

/** 
* Define mw.SwarmTransport object: 
*/
mw.SwarmTransport = {
	loadingHttpseed2tstream: false,
	
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
					
					// Add the swarm source
					mw.log(" SwarmTransport :: checkPlayerSourcesEvent ");
					_this.addSwarmSource( embedPlayer, callback );
										
				} else {								
					// No swarm support just directly issue the callback 
					callback();	
				}
			} );
			
			// Check if we have a "recommend" binding and provide an xpi install link			
			mw.log('bind::addControlBindingsEvent');
			$j( embedPlayer ).bind( 'addControlBindingsEvent', function(){				
				if( mw.getConfig( 'recommendSwarmTransport' ) &&  
					typeof window['swarmTransport'] == 'undefined' &&
					$j.browser.mozilla ) {
					embedPlayer.controlBuilder.doWarningBindinng( 
						'recommendSwarmTransport',
						_this.getRecomendSwarmMessage()						
					);
				}
			});
					
		} );	
		
		
		// Add the swarmTransport player to available player types: 
		$j( mw ).bind( 'EmbedPlayerManagerReady', function( event ) {
			// Add the swarmTransport playerType	
			mw.EmbedTypes.players.defaultPlayers['video/swarmTransport'] = ['Native'];
			
			// Build the swarm Transport Player
			var swarmTransportPlayer = new mediaPlayer( 'swarmTransportPlayer', ['video/swarmTransport' ], 'Native' );
			
			// Add the swarmTransport "player"
			mw.EmbedTypes.players.addPlayer( swarmTransportPlayer );	
		});
					
	},
	
	addSwarmSource: function( embedPlayer, callback ) {
		var _this = this;
		
		var source = embedPlayer.mediaElement.getSources( 'video/ogg' )[0];	
		if( ! source ){
			mw.log("Error: addSwarmSource: could not find video/ogg source to gennerate torrent from");
			callback();
			return ;
		}
		
		// Setup function to run in context based on callback result
		var finishAddSwarmSource = function(){
			// Get the highest quality source that the system can playback 
			// ( for now just grab the first ogg/theora )			
			var absoluteSource =  mw.absoluteUrl( source.getSrc() );
			var swarmSrc = httpseed2tstream( absoluteSource );
			
			mw.log('addSwarmSource for: ' + source.getSrc()  + "\n\nGot:" + swarmSrc );
			
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
			// Check if we already started loading httpseed2tstream
			if( this.loadingHttpseed2tstream ){
				mw.waitForObject( 'httpseed2tstream', function(){
					finishAddSwarmSource();	
				});
				return ; 
			}
			this.loadingHttpseed2tstream = true;
			// Should do a check to avoid loading tlookup multiple times			
			mw.load( 'http://wikipedia.p2p-next.org/tlookup.js', function(){
				finishAddSwarmSource();	
			});
			
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