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
			// Check What types of bindings we should add:
			if( mw.getConfig( 'EmbedPlayer.EnableIframeApi' ) && mw.getConfig('Kaltura.IframeRewrite') ){
				this.addIframePlayerHooksClient();
				return ;
			}
			if( mw.getConfig( 'EmbedPlayer.EnableIframeApi' ) && mw.getConfig( 'EmbedPlayer.IsIframePlayer' ) ){
				this.addIframePlayerHooksServer();
				return ;
			}
			// No iframe just do normal KDP mapping hooks: 
			this.addPlayerHooks();
		},
				
		addPlayerHooks: function(){
			var _this = this;

			// Add the hooks to the player manager			
			$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {		
				// Add the addJsListener and sendNotification maps
				embedPlayer.addJsListener = function(listenerString, globalFuncName){
					_this.addJsListener( embedPlayer, listenerString, window[ globalFuncName ] )
				}
				
				embedPlayer.removeJsListener = function(listenerString, callback){
					_this.removeJsListener( embedPlayer, listenerString, callback )
				}				
				
				embedPlayer.sendNotification = function( notificationName, notificationData ){
					_this.sendNotification( embedPlayer, notificationName, notificationData)
				}
				
				embedPlayer.evaluate = function( objectString ){
					return _this.evaluate( embedPlayer, objectString);
				}
				
				// TODO per KDP docs this should be "	ttribute" but thats a protected native method. 
				// the emulation has to do something more tricky like listen to componentName changes 
				// in the attribute space!
				embedPlayer.setKDPAttribute = function( componentName, property, value ) {
					_this.setKDPAttribute( embedPlayer, componentName, property, value );
				}
			});
		},
		
		/***************************************
		 * Client side kdp mapping iframe player setup: 
		 **************************************/	
		addIframePlayerHooksClient: function(){
			var _this = this;
			mw.log( "KDPMapping::addIframePlayerHooksClient" );

			$j( mw ).bind( 'AddIframePlayerMethods', function( event, playerMethods ){
				playerMethods.push( 'addJsListener',  'sendNotification', 'setKDPAttribute' );
				// NOTE we don't export evaluate since we need to run it synchronously
			});
			
			$j( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ) {		
				$j( playerProxy ).bind('jsListenerEvent', function(event, globalFuncName, listenerArgs){
					window[ globalFuncName ].apply( this, listenerArgs );
				})
				// Directly build out the evaluate call on the playerProxy
				playerProxy.evaluate = function( objectString ){
					return _this.evaluate( playerProxy, objectString);					
				}
			});
			
		},
		
		/***************************************
		 * Server side kdp mapping iframe player setup: 
		 **************************************/
		addIframePlayerHooksServer: function(){
			var _this = this;
			mw.log("KDPMapping::addIframePlayerHooksServer");
			
			$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
				exportedBindings.push( 'jsListenerEvent' );
			});
			
			$j( mw ).bind( 'newIframePlayerServerSide', function( event, embedPlayer ){
				
				embedPlayer.addJsListener = function(listenerString, globalFuncName){
					_this.addJsListener(embedPlayer, listenerString, function(){
						var args = [ globalFuncName, $j.makeArray( arguments ) ];
						$j( embedPlayer ).trigger( 'jsListenerEvent', args )
					});
				};
				
				// Identical to non-iframe sendNotification
				embedPlayer.sendNotification = function( notificationName, notificationData ){
					_this.sendNotification( embedPlayer, notificationName, notificationData)
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
								return embedPlayer.kalturaPlayerMetaData[ objectPath[2] ];
							} else {
								return embedPlayer.kalturaPlayerMetaData;
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
		addJsListener: function( embedPlayer, eventName, callback ){
			//mw.log("KDPMapping:: addJsListener: " + eventName + ' cb:' + callbackFuncName );			
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
		 * Emulates kalatura removeJsListener function
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
					
					// Update the poster
					embedPlayer.updatePosterSrc( 
						mw.getKalturaThumbUrl({
							'partner_id': $j( embedPlayer ).attr( 'kwidgetid' ).replace('_', ''),
							'entry_id' : embedPlayer.kentryid,
							'width' : embedPlayer.getWidth(),
							'height' :  embedPlayer.getHeight()
						})
					);
									
					// Empty out embedPlayer object sources
					embedPlayer.emptySources();
					
					// Set the onDone interface flag to false ( for sync changeMedia onended events ) 
					embedPlayer.onDoneInterfaceFlag = false;
					
					// Load new sources per the entry id via the checkPlayerSourcesEvent hook:
					$j( embedPlayer ).triggerQueueCallback( 'checkPlayerSourcesEvent', function(){
						$j( '#' + embedPlayer.id + '_mappingSpinner' ).remove();

						// Check if native player controls ( then switch directly ) type: 
						if( embedPlayer.useNativePlayerControls() || embedPlayer.isPersistentNativePlayer() ){
							embedPlayer.switchPlaySrc( embedPlayer.getSrc(), function(){
								// Once switch is complete restore onDone event
								embedPlayer.onDoneInterfaceFlag = true;
							});
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
	// TODO just a normal anonymous function initialization				
	if( !window.KDPMapping ){
		mw.log( "KDPMapping::setup" );	
		window.KDPMapping = new mw.KDPMapping();
	}
	
} )( window.mw );