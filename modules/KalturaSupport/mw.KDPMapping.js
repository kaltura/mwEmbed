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
		// global list of kdp listening callbacks
		listenerList: {},
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
			mw.log("KDPMapping::addPlayerHooks>");
			// Add the hooks to the player manager			
			$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {										
				// Add the addJsListener and sendNotification maps
				embedPlayer.addJsListener = function(listenerString, globalFuncName){
					_this.addJsListener( embedPlayer, listenerString, globalFuncName );
				};
				embedPlayer.removeJsListener = function(listenerString, callbackName){
					_this.removeJsListener( embedPlayer, listenerString, callbackName );
				};
				
				embedPlayer.sendNotification = function( notificationName, notificationData ){
					_this.sendNotification( embedPlayer, notificationName, notificationData);
				};
				
				embedPlayer.evaluate = function( objectString ){
					return _this.evaluate( embedPlayer, objectString);
				};
				
				// TODO per KDP docs this should be "attribute" but thats a protected native method. 
				// the emulation has to do something more tricky like listen to componentName changes 
				// in the attribute space!
				embedPlayer.setKDPAttribute = function( componentName, property, value ) {
					_this.setKDPAttribute( embedPlayer, componentName, property, value );
				};
				
				// Fire the KalturaKDPCallbackReady event with the player id: 
				if( window.KalturaKDPCallbackReady ){
					window.KalturaKDPCallbackReady( embedPlayer.id );
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
				playerMethods.push( 'addJsListener', 'removeJsListener', 'sendNotification', 'setKDPAttribute' );
			});
			
			$j( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ) {		
				$j( playerProxy ).bind( 'jsListenerEvent', function(event, globalFuncName, listenerArgs){
					if( typeof window[ globalFuncName ] == 'function' ){
						window[ globalFuncName ].apply( this, listenerArgs );
					}
				});
				
				// Directly build out the evaluate call on the playerProxy
				playerProxy.evaluate = function( objectString ){
					return _this.evaluate( playerProxy, objectString);			
				};
				
				// Listen for the proxyReady event from the server: 
				$j( playerProxy ).bind( 'proxyReady', function(){
					if( window.KalturaKDPCallbackReady ){
						window.KalturaKDPCallbackReady( playerProxy.id );
					}
				});
			});			
		},
		
		/***************************************
		 * Server side kdp mapping iframe player setup: 
		 **************************************/
		addIframePlayerHooksServer: function(){
			var _this = this;
			mw.log("KDPMapping::addIframePlayerHooksServer");
			
			$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
				exportedBindings.push( 'jsListenerEvent', 'Kaltura.SendAnalyticEvent' );
			});
			
			$j( mw ).bind( 'newIframePlayerServerSide', function( event, embedPlayer ){

				embedPlayer.addJsListener = function( eventName, globalFuncName){					
					var listenEventName = 'gcb_' + _this.getListenerId( embedPlayer, eventName, globalFuncName); 					
					window[ listenEventName ] = function(){				
						// Check if the globalFuncName is defined on this side of the iframe and call it
						if( window[ globalFuncName ] && typeof window[ globalFuncName ] == 'function' ){
							window[ globalFuncName ].apply( this, $j.makeArray( arguments ) );
						}
						var args = [ globalFuncName, $j.makeArray( arguments ) ];
						$j( embedPlayer ).trigger( 'jsListenerEvent', args );
					};					
					_this.addJsListener( embedPlayer, eventName, listenEventName);
				};
				
				embedPlayer.removeJsListener = function( eventName, globalFuncName){
					var listenEventName = 'gcb_' + _this.getListenerId( embedPlayer, eventName, globalFuncName);
					_this.removeJsListener( embedPlayer, eventName, listenEventName );
				};
				
				// sendNotification method export: 
				embedPlayer.sendNotification = function( notificationName, notificationData ){
					_this.sendNotification( embedPlayer, notificationName, notificationData);
				};
				
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
				case 'duration':
					return embedPlayer.duration;
					break;
				case 'mediaProxy':
					switch( objectPath[1] ){
						case 'entryMetadata':
							if( objectPath[2] ) {
								return embedPlayer.kalturaEntryMetaData[ objectPath[2] ];
							} else {
								return embedPlayer.kalturaEntryMetaData;
							}
						break;
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
		addJsListener: function( embedPlayer, eventName, callbackName ){
			var _this = this;
			mw.log("KDPMapping::addJsListener: " + eventName + ' cb:' + callbackName );
			this.listenerList[  this.getListenerId( embedPlayer, eventName, callbackName)  ] = window[ callbackName ];
			var callback = function(){
				var listnerId = _this.getListenerId( embedPlayer, eventName, callbackName) ;
				// Check that the listener is still valid and run the callback with supplied arguments
				if( _this.listenerList [ listnerId ] ){
					_this.listenerList [ listnerId ].apply( _this, $j.makeArray( arguments ) );
				}
			};
			switch( eventName ){
				case 'kdpEmpty':
					// TODO: When we have video tag without an entry
					break;
				case 'kdpReady':
					// TODO: When player is ready with entry, only happens once
					$( embedPlayer ).bind( 'playerReady.kdpReady', function() {
						callback( {}, embedPlayer.id );
					});
					break;
				case 'volumeChanged': 
					$j( embedPlayer ).bind('volumeChanged', function(event, percent){
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
				case 'doStop':
				case 'stop':
					$j( embedPlayer ).bind("doStop", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'playerPaused':
				case 'pause':
				case 'doPause':
					$j( embedPlayer ).bind("pause", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'playerPlayed':
				case 'play':
				case 'doPlay':
					$j( embedPlayer ).bind("play", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'doSeek':
				case 'playerSeekStart':
				case 'doIntelligentSeek':		
					$j( embedPlayer ).bind("seeking", function(){
						callback( embedPlayer.currentTime, embedPlayer.id );
					});
					break;
				case 'playerSeekEnd':
					$j( embedPlayer ).bind("seeked", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'playerPlayEnd':
					$j( embedPlayer ).bind("ended", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'durationChange': 
					$j( embedPlayer ).bind( "durationchange", function(){
						callback( { 'newValue' : embedPlayer.duration }, embedPlayer.id );
					});
				break;
				case 'openFullScreen': 
				case 'hasOpenedFullScreen':
					$j( embedPlayer ).bind( "onOpenFullScreen", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'hasCloseFullScreen':
				case 'closeFullScreen':
					$j( embedPlayer ).bind( "onCloseFullScreen", function(){
						callback( embedPlayer.id );
					});
					break;
				case 'playerUpdatePlayhead':
					$j( embedPlayer ).bind('monitorEvent', function(){
						callback( embedPlayer.currentTime,  embedPlayer.id );
					})
					break;	
				case 'entryReady':
					$j( embedPlayer ).bind( 'KalturaSupport_MetaDataReady', function( event, embedPlayer ) {
						callback( embedPlayer , embedPlayer.id );
					});
					break;
				case 'mediaReady':
					// check for "media ready" ( namespace to kdpMapping )
					$( embedPlayer ).bind( 'playerReady.kdpMapping', function() {
						callback( embedPlayer.id );
					});
					break;
				default:
					mw.log("Error unkown JsListener: " + eventName );
			}				
		},
		/**
		 * Emulates kalatura removeJsListener function
		 */
		removeJsListener: function( embedPlayer, eventName, callbackName ){
			var listenerId = this.getListenerId( embedPlayer, eventName, callbackName) ;
			mw.log("KDPMapping:: removeJsListener " + listenerId );
			this.listenerList [  listenerId ] = null;
		},
		
		// Generate an id for a listener based on embedPlayer, eventName and callbackName
		getListenerId: function(  embedPlayer, eventName, callbackName ){
			return embedPlayer.id + '_' + eventName + '_' + callbackName;
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
				case 'cleanMedia':
					embedPlayer.emptySources();
					break;
				case 'changeMedia':
				    
					// Check if we don't have entryId or it's -1. than we just empty the source and the metadata
					if( notificationData.entryId == "" || notificationData.entryId == -1 ) {
					    // Empty sources
					    embedPlayer.emptySources();
					    break;
					}

					var chnagePlayingMedia = embedPlayer.isPlaying();
					// Pause player during media switch
					embedPlayer.pause();
					
					// Add a loader to the embed player: 
					$j( embedPlayer )
					.getAbsoluteOverlaySpinner()
					.attr('id', embedPlayer.id + '_mappingSpinner' );
					
					// Clear out any bootstrap data from the iframe 
					mw.setConfig('KalturaSupport.BootstrapPlayerData', false);
					
					// Update the entry id
					embedPlayer.kentryid = notificationData.entryId;
					// clear player & entry meta 
				    embedPlayer.kalturaPlayerMetaData = null;
				    embedPlayer.kalturaEntryMetaData = null;
					
					// Update the poster
					embedPlayer.updatePosterSrc( 
						mw.getKalturaThumbUrl({
							'partner_id': embedPlayer.kwidgetid.replace('_', ''),
							'entry_id' : embedPlayer.kentryid,
							'width' : embedPlayer.getWidth(),
							'height' :  embedPlayer.getHeight()
						})
					);
									
					// Empty out embedPlayer object sources
					embedPlayer.emptySources();
					
					// Bind the ready state:
					$j( embedPlayer ).bind('playerReady', function(){					
						embedPlayer.stop();
						// do normal stop then play:
						if( chnagePlayingMedia ){
							embedPlayer.play();	
						}
					});
										
					// Load new sources per the entry id via the checkPlayerSourcesEvent hook:
					$j( embedPlayer ).triggerQueueCallback( 'checkPlayerSourcesEvent', function(){
						$j( '#' + embedPlayer.id + '_mappingSpinner' ).remove();
						embedPlayer.setupSourcePlayer();
						//
						// Check if native player controls ( then switch directly ) type: 
						if( embedPlayer.useNativePlayerControls() || embedPlayer.isPersistentNativePlayer() 
								&& chnagePlayingMedia ){
							embedPlayer.switchPlaySrc( embedPlayer.getSrc() );
						}
					});
				break;
			}
		}
	};	
		
	// Setup the KDPMapping
	// TODO just a normal anonymous function initialization		
	if( !window.KDPMapping ){
		window.KDPMapping = new mw.KDPMapping();
	}
	mw.log("KDPMapping::done " + window.KDPMapping );
} )( window.mw );