/*
 * Based on the 'kdp3 javascript api'
 * Add full kaltura mapping support to html5 based players
 * http://www.kaltura.org/demos/kdp3/docs.html#jsapi
 */

// scope in mw
( function( mw ) {
 
	mw.KDPMapping = function( ) {
		// Create a Player Manage
		return this.init();
	};
	mw.KDPMapping.prototype = {
		/**
		* Add Player hooks for supporting Kaltura api stuff
		*/ 
		init: function( ){
			this.addPlayerHooks();		 	
		},
				
		addPlayerHooks: function(){
			var _this = this;
			// Add KDP iframe support to client
			
			// Add KDP iframe support to server
			
			// Add the hooks to the player manager			
			$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {						
				// Add the addJsListener and sendNotification maps
				embedPlayer.addJsListener = function(listenerString, callback){
					_this.addJsListener( embedPlayer, listenerString, callback )
				}
				
				embedPlayer.removeJsListener = function(listenerString, callback){
					_this.removeJsListener( embedPlayer, listenerString, callback )
				}				
				
				embedPlayer.sendNotification = function( notificationName, notificationData ){
					_this.sendNotification( embedPlayer, notificationName, notificationData)
				}
				
				embedPlayer.evaluate = function( objectString ){
					_this.evaluate( embedPlayer, objectString);
				}
				
				embedPlayer.setKDPAttribute = function( componentName, property, value ) {
					_this.setKDPAttribute( embedPlayer, componentName, property, value );
				}
			});
		},
		
		/*
		 * emulates kaltura setAttribute function
		 */
		setKDPAttribute: function( embedPlayer, componentName, property, value ) {
			switch( property ) {
				case 'autoPlay':
					embedPlayer.autoplay = value;
					break;
			}
		},
		
		/**
		 * emulates kaltura evaluate function
		 */
		evaluate: function( embedPlayer, objectString ){
			// Strip the { } from the objectString
			objectString = objectString.replace( /\{|\}/g, '' );
			objectPath = objectString.split('.');
			console.log(objectPath);
			switch( objectPath[0] ){
				case 'video':
					switch( objectPath[1] ){
						case 'volume': 
							return embedPlayer.volume;
						break;
					}
				break;			
				
				case 'mediaProxy':
					switch( objectPath[1] ){
						case 'entry':
							if( objectPath[2] ) {
								return $j( embedPlayer ).data( 'kaltura.meta' )[ objectPath[2] ];
							} else {
								return $j( embedPlayer ).data( 'kaltura.meta' );
							}
						break;
					}
				break;
				
				case 'configProxy':
					switch( objectPath[1] ){
						case 'flashvars': 
							if( objectPath[2] ) {
								switch( objectPath[2] ) {
									case 'autoPlay':
										// get autoplay
										return embedPlayer.autoplay;
									break;
								}
							} else {
								// get flashvars
							}
						break;
					}
				break;	
				
				case 'playerStatusProxy':
					switch( objectPath[1] ){
						case 'kdpStatus': 
							//TODO
						break;
					}
				break;					
			}
		},
		
		/**
		 * Emulates kalatura addJsListener function
		 */
		addJsListener: function( embedPlayer, eventName, globalFuncName ){
			//mw.log("KDPMapping:: addJsListener: " + eventName + ' cb:' + callbackFuncName );
			var callback = window[ globalFuncName ];
			switch( eventName ){
				case 'volumeChanged': 
					$j( embedPlayer ).bind('volumeChanged', function(percent){
						callback( {'newVolume' : percent }, embedPlayer.id );
					});
				break;
				case 'playerStateChange':					
					// Kind of tricky should do a few bindings to 'pause', 'play', 'ended', 'buffering/loading'
					$j( embedPlayer ).bind('pause', function(){						
						callback( 'pause', embedPlayer.id );
					});
					
					$j( embedPlayer ).bind('play', function(){
						callback( 'play', embedPlayer.id );
					});
					
					break;
				case 'playerPlayEnd': 
					$j( embedPlayer ).bind("ended", function(){
						// TODO document what data ended should include
						callback( {}, embedPlayer.id );
					});
					break;
				case 'durationChange': 
					// TODO add in duration change support
					break;
				case 'playerUpdatePlayhead':
					$j( embedPlayer ).bind('monitorEvent', function(){
						callback( embedPlayer.currentTime,  embedPlayer.id );
					})
					break;	
				case 'entryReady': 
					$j( embedPlayer ).bind( 'KalturaSupport.metaDataReady', function( event, meta ) {				
						callback( meta );
					});
					break;
			}				
		},
		
		/**
		 * emulates kalatura removeJsListener function
		 */
		removeJsListener: function( embedPlayer, eventName, callbackFuncName ){
			//mw.log("KDPMapping:: removeJsListener: " + eventName + ' cb:' + callbackFuncName );
			var callback = window[ callbackFuncName ];
			switch( eventName ){
				case 'volumeChanged': 
					$j( embedPlayer ).unbind('volumeChanged');
					break;
				case 'playerStateChange':					
					$j( embedPlayer ).unbind('pause');
					$j( embedPlayer ).unbind('play');
					break;
				case 'durationChange': 
					// TODO add in duration change support
					break;
				case 'playerUpdatePlayhead':
					$j( embedPlayer).unbind('monitorEvent');
					break;				
			}
			
			callback();
				
		},		
		
		/**
		 * Master send action list: 
		 */
		sendNotification: function( embedPlayer, notificationName, notificationData ){			
			switch( notificationName ){
				case 'doPlay':
					embedPlayer.play();
					break;
				case 'doPause':
					embedPlayer.pause();
					break;
				case 'doStop':
					embedPlayer.stop();
					break;
				case 'doSeek':
					// Kaltura doSeek is in seconds rather than percentage:
					var percent = parseFloat( notificationData ) / embedPlayer.getDuration();
					embedPlayer.doSeek( percent );
					break;
				case 'changeVolume':
					embedPlayer.setVolume( parseFloat( notificationData ) );
					// TODO the setVolume should update the interface
					embedPlayer.setInterfaceVolume(  parseFloat( notificationData ) );
					break;
				case 'changeMedia':
					// Add a loader to the embed player: 
					$j( '#' + embedPlayer.pid )
					.getAbsoluteOverlaySpinner()
					.attr('id', embedPlayer.id + '_mappingSpinner' )
					
					// Update the entry id
					embedPlayer.kentryid = notificationData.entryId;
									
					// Empty out embedPlayer object sources
					embedPlayer.emptySources();
					
					// Set the onDone interface flag to false ( for sync changeMedia onended events ) 
					embedPlayer.onDoneInterfaceFlag = false;
					
					// Load new sources per the entry id via the checkPlayerSourcesEvent hook:
					$j( embedPlayer ).triggerQueueCallback( 'checkPlayerSourcesEvent', function(){
						$j( '#' + embedPlayer.id + '_mappingSpinner' ).remove();

						// Check if native player controls ( then switch directly ) type: 
						if( embedPlayer.useNativePlayerControls() || embedPlayer.isPersistentNativePlayer() ){
							embedPlayer.switchPlaySrc( embedPlayer.getSrc() );
						} else{ 
							embedPlayer.stop();
							// do normal stop then play: 
							embedPlayer.play();	
							// restore onDone event: 
							embedPlayer.onDoneInterfaceFlag = true;
						}
					});					
					break;					
			}
		}
	};	
		
	// Setup the KDPMapping
	if( mw.playerManager ){	
		window.KDPMapping = new mw.KDPMapping();	
	} else {
		mw.log( 'KDPMapping::bind:EmbedPlayerManagerReady');		
		$j( mw ).bind( 'EmbedPlayerManagerReady', function(){									
			if( !window.KDPMapping ){
				mw.log( "KDPMapping::EmbedPlayerManagerReady" );	
				window.KDPMapping = new mw.KDPMapping();
			}
		});	
	}
	
} )( window.mw );