/**
 * Based on the 'kdp3 javascript api'
 * Add full kaltura mapping support to html5 based players
 * http://www.kaltura.org/demos/kdp3/docs.html#jsapi
 */
				
// scope in mw
( function( mw, $ ) {
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
			if( mw.getConfig( 'EmbedPlayer.IsIframeServer' ) ){
				this.addIframePlayerHooksServer();
				return ;
			} 
			// For client side of the iframe add iframe hooks and player hooks ( will bind to 
			// different build player build outs and lets us support pages with both
			// iframe and no iframes players
			this.addIframePlayerHooksClient();
			// Always add player hooks
			this.addPlayerHooks();
		},
		addPlayerHooks: function(){
			var _this = this;
			mw.log("KDPMapping::addPlayerHooks>");
			// Add the hooks to the player manager			
			$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
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
				if( window.deepLinkId ){
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

			$( mw ).bind( 'AddIframePlayerMethods', function( event, playerMethods ){
				playerMethods.push( 'addJsListener', 'removeJsListener', 'sendNotification', 'setKDPAttribute' );
			});

			$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ) {

				$( playerProxy ).bind( 'jsListenerEvent', function(event, globalFuncName, listenerArgs){
					// check if globalFuncName has descendant properties
					if( typeof window[ globalFuncName ] == 'function' ){
						window[ globalFuncName ].apply( this, listenerArgs );
					} else {
						// try to send the global function name: 
						try{
							var evalFunctionName = eval( globalFuncName );
							evalFunctionName.apply( this, listenerArgs );
						} catch (e){
							mw.log( "Warning KDPMapping: jsListenerEvent function name not found");
						}
					}
				});
				
				// Directly build out the evaluate call on the playerProxy
				playerProxy.evaluate = function( objectString ){
					return _this.evaluate( playerProxy, objectString);			
				};
				// Listen for the proxyReady event from the server: 
				$( playerProxy ).bind( 'proxyReady', function(){
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
			$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings ){
				exportedBindings.push( 'jsListenerEvent', 'Kaltura.SendAnalyticEvent' );
			});
			
			$( mw ).bind( 'newIframePlayerServerSide', function( event, embedPlayer ){

				embedPlayer.addJsListener = function( eventName, globalFuncName){
					// Check for function based binding ( and do  internal event bind ) 
					if( typeof globalFuncName == 'function' ){
						_this.addJsListener( embedPlayer, eventName, globalFuncName );
						return ;
					}
					
					var listenEventName = 'gcb_' + _this.getListenerId( embedPlayer, eventName, globalFuncName); 					
					window[ listenEventName ] = function(){
						// Check if the globalFuncName is defined on this side of the iframe and call it
						if( window[ globalFuncName ] && typeof window[ globalFuncName ] == 'function' ){
							window[ globalFuncName ].apply( this, $.makeArray( arguments ) );
						}
						var args = [ globalFuncName, $.makeArray( arguments ) ];
						$( embedPlayer ).trigger( 'jsListenerEvent', args );
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

				// setKDPAttribute method export:
				embedPlayer.setKDPAttribute = function( componentName, property, value ) {
					_this.setKDPAttribute( embedPlayer, componentName, property, value );
				};
				
				embedPlayer.evaluate = function( objectString ){
					return _this.evaluate( embedPlayer, objectString);
				};
			});
		},
		
		/**
		 * Emulates Kaltura setAttribute function
		 * @param {Object} embedPlayer Base embedPlayer to be affected 
		 * @param {String} componentName Name of component to be updated
		 * @param {String} property The value to give the named attribute
		 */
		setKDPAttribute: function( embedPlayer, componentName, property, value ) {
			mw.log("KDPMapping::setKDPAttribute " + componentName + " p:" + property + " v:" + value  + ' for: ' + embedPlayer.id );
			switch( property ) {
				case 'autoPlay':
					embedPlayer.autoplay = value;
				break;
				case 'mediaPlayFrom':
					embedPlayer.startTime = parseFloat(value);
				break;
				case 'mediaPlayTo':
					embedPlayer.endTime = parseFloat(value);
				break;
			}
			// Give kdp plugins a chance to take attribute actions 
			$( embedPlayer ).trigger( 'Kaltura_SetKDPAttribute', [componentName, property, value] );
		},
		
		/**
		 * Emulates kaltura evaluate function
		 * 
		 * @@TODO move this into a separate uiConfValue parser script, 
		 * I predict ( unfortunately ) it will expand a lot.
		 */
		evaluate: function( embedPlayer, objectString ){
			var _this = this;
			var evExp;
			if( typeof objectString != 'string'){
				return objectString;
			}
			// Replace any { } calls with evaluated expression.
			var text = objectString.replace(/\{([^\}]*)\}/g, function(match, contents, offset, s) {
				evExp = contents;
			});
			// We can't use return inside the replace callback,
			// because if we return an object {mediaProxy.entryMetadata}
			// It will be returned as a string [object Object]
			if( evExp ) {
				text = _this.evaluateExpression( embedPlayer, evExp );
			}

			// Return undefined to string: undefined, null, ''
			if( text === "undefined" || text === "null" || text == "" )
				text = undefined;

			if( text === "false")
				text = false;
			if( text === "true")
				text = true;
			
			return text;
		},
		evaluateExpression: function( embedPlayer, expression){
			var _this = this;
			
			// Check if we have a function call: 
			if( expression.indexOf( '(' ) !== -1 ){
				var fparts = expression.split( '(' );
				return _this.evaluateStringFunction( 
						fparts[0], 
						// Remove the closing ) and evaluate the Expression 
						// should not include ( nesting !
						_this.evaluateExpression(embedPlayer, fparts[1].slice( 0, -1) )
				);
			}
			// Split the uiConf expression into parts separated by '.'
			var objectPath = expression.split('.');
			switch( objectPath[0] ){
				case 'video':
					switch( objectPath[1] ){
						case 'volume': 
							return embedPlayer.volume;
							break;
						case 'player':
							switch( objectPath[2] ){
								case 'currentTime':
									return embedPlayer.currentTime;
								break;
							}
						break;
					}
				break;			
				case 'duration':
					return embedPlayer.duration;
					break;
				case 'mediaProxy':
					switch( objectPath[1] ){
						case 'entryMetadata':
							if( ! embedPlayer.kalturaEntryMetaData ){
								return null;
							}
							if( objectPath[2] ) {
								return embedPlayer.kalturaEntryMetaData[ objectPath[2] ];
							} else {
								return embedPlayer.kalturaEntryMetaData;
							}
						break;
						case 'entry':
							if( ! embedPlayer.kalturaPlayerMetaData ){
								return null;
							}
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
								var fv = $( embedPlayer ).data('flashvars' );
								switch( objectPath[2] ) {
									case 'autoPlay':
										// get autoplay
										return embedPlayer.autoplay;
									break;
									case 'referer':
										// Check for the fv:
										if( fv && fv[ objectPath[2] ] ){
											return fv[ objectPath[2] ];
										}
										// Else use the iframeParentUrl if set:
										return mw.getConfig( 'EmbedPlayer.IframeParentUrl' );
										break;
									default: 
										if( fv && fv[ objectPath[2] ] ){
											return fv[ objectPath[2] ]
										}
										return null;
										break;
								}
							} else {
								// Get flashvars
								return $( embedPlayer ).data( 'flashvars' );
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
		evaluateStringFunction: function( functionName, value ){
			switch( functionName ){
				case 'encodeUrl':
					return encodeURI( value );
					break;
			}
		},
		
		/**
		 * Emulates Kalatura addJsListener function
		 * @param {Object} EmbedPlayer the player to bind against
		 * @param {String} eventName the name of the event. 
		 * @param {Mixed} String of callback name, or function ref
		 */
		addJsListener: function( embedPlayer, eventName, callbackName ){
			var _this = this;
			mw.log("KDPMapping::addJsListener: " + eventName + ' cb:' + callbackName );

			if( typeof callbackName == 'string' ){
				this.listenerList[  this.getListenerId( embedPlayer, eventName, callbackName)  ] = window[ callbackName ];
				var callback = function(){
					var listnerId = _this.getListenerId( embedPlayer, eventName, callbackName) ;
					// Check that the listener is still valid and run the callback with supplied arguments
					if( _this.listenerList [ listnerId ] ){
						_this.listenerList [ listnerId ].apply( _this, $.makeArray( arguments ) );
					}
				};
			} else if( typeof callbackName == 'function' ){
				// Make life easier for internal usage of the listener mapping by supporting
				// passing a callback by function ref
				var callback = callbackName;
			} else {
				mw.log( "Error: KDPMapping : bad callback type" );
				return ;
			}
			
			// Shortcut for embedPlayer bindings with postfix string ( so they don't get removed by other plugins ) 
			var b = function( bindName, bindCallback ){
				if( !bindCallback){
					bindCallback = function(){
						callback( embedPlayer.id );
					};
				}
				// Add a postfix string
				bindName += '.kdpMapping';
				// remove any other kdpMapping binding:
				$( embedPlayer ).bind( bindName, function(){
					bindCallback.apply( _this, $.makeArray( arguments ) );
				});
			};
			switch( eventName ){
				case 'kdpEmpty':
					// TODO: When we have video tag without an entry
					break;
				case 'kdpReady':
					// TODO: When player is ready with entry, only happens once
					b( 'playerReady', function() {
						callback( {}, embedPlayer.id );
					});
					break;
				case 'volumeChanged': 
					b( 'volumeChanged', function(event, percent){
						callback( {'newVolume' : percent }, embedPlayer.id );
					});
					break;
				case 'playerStateChange':					
					// TODO add in other state changes
					b( 'pause', function(){
						callback( 'pause', embedPlayer.id );
					});
					
					b( 'onplay', function(){
						callback( 'onplay', embedPlayer.id );
					});
					
					break;
				case 'doStop':
				case 'stop':
					b( "doStop");
					break;
				case 'playerPaused':
				case 'pause':
				case 'doPause':
					b( "pause" );
					break;
				case 'playerPlayed':
				case 'play':
				case 'doPlay':
					b( "onplay" );
					break;
				case 'seek':
				case 'doSeek':
				case 'playerSeekStart':
				case 'doIntelligentSeek':		
					b( "seeking", function(){
						callback( embedPlayer.currentTime, embedPlayer.id );
					});
					break;
				case 'playerSeekEnd':
					b( "seeked");
					break;
				case 'playerPlayEnd':
					b("ended" );
					break;
				case 'durationChange': 
					b( "durationchange", function(){
						callback( { 'newValue' : embedPlayer.duration }, embedPlayer.id );
					});
				break;
				case 'openFullScreen': 
				case 'hasOpenedFullScreen':
					b( "onOpenFullScreen" );
					break;
				case 'hasCloseFullScreen':
				case 'closeFullScreen':
					b( "onCloseFullScreen" );
					break;
				case 'playerUpdatePlayhead':
					b('monitorEvent', function() {
						callback( embedPlayer.currentTime );
					});
					break;	
				case 'changeMedia':
					b( 'onChangeMediaDone', function( event ){
						callback({ 'entryId' : embedPlayer.kentryid }, embedPlayer.id );
					});
					break;
				case 'entryReady':
					b( 'KalturaSupport_EntryDataReady', function( event, entryData ){
						callback( entryData, embedPlayer.id );
					});
					break;
				case 'mediaReady':
					// check for "media ready" ( namespace to kdpMapping )
					b( 'playerReady' );
					break;
				case 'cuePointsReceived':
					b( 'KalturaSupport_CuePointsReady', function( event, cuePoints ) {
						callback( embedPlayer.rawCuePoints, embedPlayer.id );
					});
					break;
				case 'cuePointReached':
					b( 'KalturaSupport_CuePointReached', function( event, cuePointWrapper ) {
						callback( cuePointWrapper, embedPlayer.id );
					});
					break;
				case 'adOpportunity':
					b( 'KalturaSupport_AdOpportunity', function( event, cuePointWrapper ) {
						callback( cuePointWrapper, embedPlayer.id );
					});
					break;
				/**
				 * Mostly for analytics ( rather than strict kdp compatibility )
				 */
				case 'videoView':
					b('firstPlay' );
					break;
				case 'share':
					b('showShareEvent');
					break;
				case 'openFullscreen':
					b( 'openFullScreen' );
					break;
				case 'closefullscreen':
					b('closeFullScreen' );
					break;
				case 'replay':
					b('replayEvent');
					break;
				case 'save':
				case 'gotoContributorWindow':
				case 'gotoEditorWindow':
					mw.log( "Warning: kdp event: " + eventName + " does not have an html5 mapping" );
					break;

				/* For closedCaption plguin */
				case 'ccDataLoaded':
					b('KalturaSupport_ccDataLoaded');
					break;
				case 'newClosedCaptionsData':
					b('KalturaSupport_newClosedCaptionsData');
					break;
				case 'changedClosedCaptions':
					b('TimedText_ChangeSource');
					break;
				default:
					mw.log("Error unkown JsListener: " + eventName );
					return false;
			};
			// The event was successfully binded: 
			return true;
		},
		
		/**
		 * Emulates Kaltura removeJsListener function
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
					// Update the entry id
					embedPlayer.kentryid = notificationData.entryId;
					// Clear out any bootstrap data from the iframe 
					mw.setConfig('KalturaSupport.IFramePresetPlayerData', false);
					// Clear player & entry meta 
				    embedPlayer.kalturaPlayerMetaData = null;
				    embedPlayer.kalturaEntryMetaData = null;
				    
				    // clear cuepoint data:
				    embedPlayer.rawCuePoints = null;
				    embedPlayer.kCuePoints = null;
				    
				    // clear ad data ..
				    embedPlayer.ads = null;
				    
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
					
					// run the embedPlayer changeMedia function
					embedPlayer.changeMedia();
				break;
			}
		}
	};	
		
	// Setup the KDPMapping
	if( !window.KDPMapping ){
		window.KDPMapping = new mw.KDPMapping();
	}
	mw.log("KDPMapping::done ");
} )( window.mw, jQuery );