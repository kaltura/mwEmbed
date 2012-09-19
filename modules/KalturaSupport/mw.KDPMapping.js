/**
 * Based on the 'kdp3 javascript api'
 * Add full Kaltura mapping support to html5 based players
 * http://www.kaltura.org/demos/kdp3/docs.html#jsapi
 */
// scope in mw
( function( mw, $ ) { "use strict";
	mw.KDPMapping = function( ) {
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
				this.addIframePlayerServerBindings();
			} else {
				// For client side of the iframe add iframe hooks and player hooks ( will bind to 
				// different build player build outs and lets us support pages with both
				// iframe and no iframes players
				this.addIframePlayerClientBindings();
			}
			// if not an api server include non-iframe player hooks 
			if( window.kWidgetSupport && !window.kWidgetSupport.isIframeApiServer() ){
				this.addPlayerHooks();
			}
		},
		addPlayerHooks: function(){
			var _this = this;
			// Add the hooks to the player manager			
			$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
				// Add the addJsListener and sendNotification maps
				embedPlayer.addJsListener = function( listenerString, globalFuncName ){
					_this.addJsListener( embedPlayer, listenerString, globalFuncName );
				};
				embedPlayer.removeJsListener = function( listenerString, callbackName ){
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
		addIframePlayerClientBindings: function(){
			var _this = this;
			mw.log( "KDPMapping::addIframePlayerClientBindings" );

			$( mw ).bind( 'AddIframePlayerMethods', function( event, playerMethods ){
				playerMethods.push( 'addJsListener', 'removeJsListener', 'sendNotification', 'setKDPAttribute' );
			});
			
			$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ) {
				$( playerProxy ).bind( 'jsListenerEvent', function( event, globalFuncName, listenerArgs ){
					// check if globalFuncName has descendant properties
					if( typeof window[ globalFuncName ] == 'function' ){
						window[ globalFuncName ].apply( window[ globalFuncName ], listenerArgs );
					} else {
						// try to send the global function name: 
						try{
							var winPrefix = ( globalFuncName.indexOf( 'window.' ) === 0 )?'':'window.';
							var evalFunction = eval( winPrefix + globalFuncName );
							// try to get the parent 
							try {
								var evalFunctionParent =  eval( globalFuncName.split('.').slice(0,-1).join('.') );
							} catch ( e ){
								// can't get the parent just pass the function scope: 
								var evalFunctionParent = evalFunction;
							}
							evalFunction.apply( evalFunctionParent, listenerArgs );
						} catch (e){
							mw.log( "KDPMapping:: Error in jsListenerEvent callback: " + e );
						}
					}
				});
				// Add local callbacks for local updates of properties in async requests 
				$( playerProxy ).bind( 'AddIframePlayerMethodCallbacks', function( event, playerMethods ){
					playerMethods[ 'sendNotification' ] = function( notificationName, notificationData ){
						// Emulate kdp seek behavior by setting local property at doSeek time. 
						if( notificationName == 'doSeek' ){
							playerProxy.kPreSeekTime = playerProxy.currentTime;
						}
						// Reach into the player and issue the play call ( if in iOS to capture the user gesture click event if present )
						var iframeEmbedPlayer = $( '#' + playerProxy.id + '_ifp' )[0].contentWindow.$( '#' + playerProxy.id )[0];

						// check for changeMedia call and issue a .load so we can play if that is called after
						if( notificationName == 'changeMedia' ){
							if( iframeEmbedPlayer && iframeEmbedPlayer.getPlayerElement() ){
								iframeEmbedPlayer.getPlayerElement().load();
							}
						}
						// check for play call and issue that on the iframe side async directly
						if( notificationName == 'doPlay' 
								&& 
							!iframeEmbedPlayer.canAutoPlay()
						){
							iframeEmbedPlayer.getPlayerElement().play();
							// Do not also issue iframe postMessage ( so we avoid sending two play requests ) 
							return false;
						}
						// By default do issue the postMessage api call for the given sendNotification. 
						return true;
					}
					// @@TODO if we split kaltura playlist into its own folder with own loader we can move that there. 
					playerMethods[ 'setKDPAttribute' ] = function( componentName, property, value ){
						// Check for playlist change media call and issue a play directly on the video element
						// gets around iOS restriction on async playback
						if( componentName == 'playlistAPI.dataProvider' && property == 'selectedIndex' ){
							// iOS devices have a autoPlay restriction, we issue a raw play call on 
							// the video tag to "capture the user gesture" so that future 
							// javascript play calls can work. 
							var embedPlayer = $( '#' + playerProxy.id + '_ifp' )
								.get(0).contentWindow
								.$('#' + playerProxy.id )[0];

							$( '#' + playerProxy.id + '_ifp' )
								.get(0).contentWindow
								.$( '#pid_' + playerProxy.id )[0].load();
						}
						// always send postMessage on setKDPAttribute
						return true;
					};
				});
				
				// Directly build out the evaluate call on the playerProxy
				playerProxy.evaluate = function( objectString ){
					return _this.evaluate( playerProxy, objectString);
				};
				// Listen for the proxyReady event from the server: 
				$( playerProxy ).bind( 'proxyReady', function(){
					// Issue the jsReadyCallback for the html5 player:
					kWidget.jsCallbackReady( playerProxy.id );
				});
			});			
		},
		
		/***************************************
		 * Server side kdp mapping iframe player setup: 
		 **************************************/
		addIframePlayerServerBindings: function(){
			var _this = this;
			mw.log("KDPMapping::addIframePlayerServerBindings");
			$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings ){
				exportedBindings.push( 'jsListenerEvent', 'KalturaSendAnalyticEvent' );
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
						embedPlayer.triggerHelper( 'jsListenerEvent', args );
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
				
				// Add preSeek event binding to upate the kPreSeekTime var
				$( embedPlayer ).bind( 'preSeek', function(event, percent){					
					embedPlayer.kPreSeekTime = embedPlayer.currentTime;
				});
				// Once a seek is complete null the kPreSeekTime ( so we can use currentTime ) in evaluate calls
				$( embedPlayer ).bind( 'seeked', function( event ){
					embedPlayer.kPreSeekTime = null;
				});
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
					embedPlayer.pauseTime = parseFloat(value);
				break;
				default:
					var subComponent = null;
					var pConf = embedPlayer.playerConfig['plugins'];
					var baseComponentName = componentName;
					// support decedent properties
					if( componentName.indexOf('.') != -1 ){
						var cparts = componentName.split('.');
						baseComponentName = cparts[0];
						subComponent = cparts[1];
					}
					if( !pConf[ baseComponentName ] ){
						pConf[ baseComponentName ] = {}; 
					}
					if( subComponent ){
						if( !pConf[ baseComponentName ][subComponent] ){
							pConf[ baseComponentName ][ subComponent ] = {};
						}
						pConf[ baseComponentName ][subComponent][property] = value;
					} else {
						pConf[ baseComponentName ][ property ] = value;
					}
				break;
			}
			// TODO move to a "ServicesProxy" plugin
			if( baseComponentName == 'servicesProxy' 
				&& subComponent && subComponent == 'kalturaClient' 
				&& property == 'ks' 
			){
				this.updateKS( embedPlayer, value );
			}
			// Give kdp plugins a chance to take attribute actions 
			embedPlayer.triggerHelper( 'Kaltura_SetKDPAttribute', [ componentName, property, value ] );
		},
		updateKS: function ( embedPlayer, ks){
			var client = mw.kApiGetPartnerClient( embedPlayer.kwidgetid );
			// clear out any old player data cache:
			client.clearCache();
			// update the new ks:
			client.setKS( ks );
			// TODO confirm flash KDP issues a changeMedia internally for ks updates
			embedPlayer.sendNotification( 'changeMedia', {'entryId': embedPlayer.kentryid });
			
			// add a loading spinner: 
			//embedPlayer.addPlayerSpinner();
			// reload the player:
			//kWidgetSupport.loadAndUpdatePlayerData( embedPlayer, function(){
				// ks should now be updated
			//	embedPlayer.hideSpinner();
			//});
		},
		/**
		 * Emulates kaltura evaluate function
		 * 
		 * @@TODO move this into a separate uiConfValue parser script, 
		 * I predict ( unfortunately ) it will expand a lot.
		 */
		evaluate: function( embedPlayer, objectString ){
			var _this = this;
			var result;
			if( typeof objectString !== 'string'){
				return objectString;
			}
			// Check if a simple direct evaluation: 
			if( objectString[0] == '{' &&  objectString[  objectString.length -1 ] == '}' && objectString.split( '{' ).length == 2 ){
				result = _this.evaluateExpression( embedPlayer, objectString.substring(1, objectString.length-1) );
			} else if ( objectString.split( '{' ).length > 1 ){ // Check if we are doing a string based evaluate concatenation: 
				// Replace any { } calls with evaluated expression.
				result = objectString.replace(/\{([^\}]*)\}/g, function( match, contents, offset, s) {
					return _this.evaluateExpression( embedPlayer, contents );
				});	
			} else {
				// Echo the evaluated string: 
				result = objectString;
			}
			if( result === 0 ){
				return result;
			}
			// Return undefined to string: undefined, null, ''
			if( result === "undefined" || result === "null" || result === "" )
				result = undefined;

			if( result === "false"){
				result = false;
			}
			if( result === "true"){
				result = true;
			}
			
			return result;
		},
		/**
		 * Maps a kdp expression to embedPlayer property.
		 * 
		 * NOTE: embedPlayer can be a playerProxy when on the other side of the iframe
		 * so anything not exported over the iframe will not be available 
		 * 
		 * @param {object} embedPlayer Player Proxy or embedPlayer object 
		 * @param {string} expression The expression to be evaluated
		 */
		evaluateExpression: function( embedPlayer, expression ){
			var _this = this;
			// Check if we have a function call: 
			if( expression.indexOf( '(' ) !== -1 ){
				var fparts = expression.split( '(' );
				return _this.evaluateStringFunction( 
					fparts[0], 
					// Remove the closing ) and evaluate the Expression 
					// should not include ( nesting !
					_this.evaluateExpression( embedPlayer, fparts[1].slice( 0, -1) )
				);
			}
			
			// Split the uiConf expression into parts separated by '.'
			var objectPath = expression.split('.');
			// Check the exported kaltura object ( for manual overrides of any mapping ) 
			if( embedPlayer.playerConfig
					&&
				embedPlayer.playerConfig.plugins
					&&
				embedPlayer.playerConfig.plugins[ objectPath[0] ] 
			){
				var kObj = embedPlayer.playerConfig.plugins[ objectPath[0] ] ;
				// TODO SHOULD USE A FUNCTION map
				if( !objectPath[1] ){
					return kObj;
				}
				if( !objectPath[2] && (objectPath[1] in kObj) ){
					return kObj[ objectPath[1] ];
				}
				if( objectPath[2] && kObj[ objectPath[1] ] && kObj[ objectPath[1] ][ objectPath[2] ]  ){
					return kObj[ objectPath[1] ][ objectPath[2] ];
				}
				
			}
			
			switch( objectPath[0] ){
				case 'isHTML5':
					return true;
					break;
				case 'sequenceProxy':
					if( ! embedPlayer.sequenceProxy ){
						return null;
					}
					if( objectPath[1] ){
						switch( objectPath[1] ){
							// check for direct mapping properties: 
							case 'timeRemaining':
							case 'isInSequence':
								return embedPlayer.sequenceProxy[ objectPath[1] ];
								break;								
							case 'activePluginMetadata':
								if(  objectPath[2] ){
									if( ! embedPlayer.sequenceProxy.activePluginMetadata ){
										return null;
									}
									return embedPlayer.sequenceProxy.activePluginMetadata[ objectPath[2] ]
								}
								return embedPlayer.sequenceProxy.activePluginMetadata;
								break;
						}
						return null;
					}
					// return the base object if no secondary path is specified 
					return embedPlayer.sequenceProxy;
					break;
				case 'video':
					switch( objectPath[1] ){
						case 'volume':
							return embedPlayer.volume;
							break;
						case 'player':
							switch( objectPath[2] ){
								case 'currentTime':
									// check for kPreSeekTime ( kaltura seek delay update property ) 
									if( embedPlayer.kPreSeekTime !== null ){
										return embedPlayer.kPreSeekTime;
									}
									return embedPlayer.currentTime;
								break;
							}
						break;
					}
				break;
				case 'duration':
					return embedPlayer.getDuration();
					break;
				case 'mediaProxy':
					switch( objectPath[1] ){
						case 'entryCuePoints':
							if( ! embedPlayer.rawCuePoints ){
								return null;
							}
							var kdpCuePointFormat = {};
							$.each( embedPlayer.rawCuePoints, function(inx, cuePoint ){
								var startTime = parseInt( cuePoint.startTime );
								if( kdpCuePointFormat[ startTime ] ){
									kdpCuePointFormat[ startTime ].push( cuePoint )
								} else {
									kdpCuePointFormat[ startTime ] = [ cuePoint ];
								}
							});
							return kdpCuePointFormat;
						break;
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
					// get flashvars from playerConfig where possible
					// TODO deprecate $( embedPlayer ).data('flashvars');
					var fv;
					if( embedPlayer.playerConfig && embedPlayer.playerConfig['vars'] ){
						fv = embedPlayer.playerConfig['vars'];
					} else {
						fv = $( embedPlayer ).data('flashvars');
					}
					switch( objectPath[1] ){
						case 'flashvars':
							if( objectPath[2] ) {
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
								// Get full flashvars object
								return fv;
							}
						break;
						case 'sessionId':
							return window.kWidgetSupport.getGUID();
						break;
					}
					// No objectPath[1] match return the full configProx object: 
					// TODO I don't think this is supported in KDP ( we might want to return null instead )
					return { 
							'flashvars' : fv,
							'sessionId' : window.kWidgetSupport.getGUID()
						};
				break;	
				case 'playerStatusProxy':
					switch( objectPath[1] ){
						case 'kdpStatus':
							if( embedPlayer.kdpEmptyFlag ){
								return "empty";
							}
							if( embedPlayer.playerReady ){
								return 'ready';
							}
							return null;
						break;
					}
				break;
				// TODO We should move playlistAPI into the Kaltura playlist handler code
				// ( but tricky to do because of cross iframe communication issue ) 
				case 'playlistAPI':
					switch( objectPath[1] ) {
						case 'dataProvider':
							// Get the current data provider: 
							if( !embedPlayer.kalturaPlaylistData ){
								return null;
							}
							var plData = embedPlayer.kalturaPlaylistData;
							var plId = plData['currentPlaylistId'];
							var dataProvider = {
								'content' : plData[ plId ],
								'length' : plData[ plId ].length,
								'selectedIndex' : plData['selectedIndex'] || 0
							}
							if( objectPath[2] == 'selectedIndex' ) {
								return dataProvider.selectedIndex;
							}
							return dataProvider;
						break;
					}
				break;
			}
			// Look for a plugin based config: typeof
			var pluginConfigValue = null;
			// See if we are looking for a top level property
			if( !objectPath[1] && $.isEmptyObject( embedPlayer.getKalturaConfig( objectPath[0] ) ) ){
				// Return the top level property directly ( {loop} {autoPlay} etc. ) 
				pluginConfigValue = embedPlayer.getKalturaConfig( '', objectPath[0] );
			} else {
				pluginConfigValue = embedPlayer.getKalturaConfig( objectPath[0], objectPath[1]);
				if( $.isEmptyObject( pluginConfigValue ) ){
					return ;
				} 
			}
			return pluginConfigValue;
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
			// mw.log("KDPMapping::addJsListener: " + eventName + ' cb:' + callbackName );

			// We can pass [eventName.namespace] as event name, we need it in order to remove listeners with their namespace
			if( typeof eventName == 'string' ) {
				var eventData = eventName.split('.', 2);
				var eventNamespace = ( eventData[1] ) ? eventData[1] : 'kdpMapping';
				eventName = eventData[0];
			}
			
			if( typeof callbackName == 'string' ){
				this.listenerList[  this.getListenerId( embedPlayer, eventName, callbackName)  ] = window[ callbackName ];
				var callback = function(){
					var listnerId = _this.getListenerId( embedPlayer, eventName, callbackName) ;
					// Check that the listener is still valid and run the callback with supplied arguments
					if( $.isFunction( _this.listenerList [ listnerId ] ) ){
						_this.listenerList [ listnerId ].apply( _this, $.makeArray( arguments ) );
					}
				};
			} else if( typeof callbackName == 'function' ){
				// Make life easier for internal usage of the listener mapping by supporting
				// passing a callback by function ref
				var callback = callbackName;
			} else {
				mw.log( "Error: KDPMapping : bad callback type: " + callbackName );
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
				bindName += '.' + eventNamespace;
				// bind with .kdpMapping postfix::
				embedPlayer.bindHelper( bindName, function(){
					bindCallback.apply( _this, $.makeArray( arguments ) );
				});
			};
			switch( eventName ){
				case 'mediaLoadError':
					b( 'mediaLoadError' );
					break;
				case 'mediaError':
					b( 'mediaError' );
				case 'kdpEmpty':
					// TODO: When we have video tag without an entry
					b( 'playerReady', function(){
						// only trigger kdpEmpty when the player is empty
						// TODO support 'real' player empty state, ie not via "error handler" 
						if( embedPlayer[ 'data-playerError' ] && ! embedPlayer.kentryid ){
							embedPlayer.kdpEmptyFlag = true;
							callback( embedPlayer.id );
						}
					});
					break;
				case 'kdpReady':
					// TODO: When player is ready with entry, only happens once
					b( 'playerReady', function() {
						if( ! embedPlayer[ 'data-playerError' ] ){
							embedPlayer.kdpEmptyFlag = false;
						}
						callback( embedPlayer.id );
					});
					break;
				case 'playerLoaded':
				case 'playerReady':
					b( 'playerReady' );
					break;
				case 'changeVolume':
				case 'volumeChanged':
					b( 'volumeChanged', function(event, percent){
						callback( { 'newVolume' : percent }, embedPlayer.id );
					});
					break;
				case 'playerStateChange':
					// right before we start loading sources ( we enter a loading state )
					b( 'preCheckPlayerSources', function(){
						callback( 'loading', embedPlayer.id );
					})
					b( 'playerReady', function(){
						callback( 'ready', embedPlayer.id );
					});
					b( 'onpause', function(){
						callback( 'paused', embedPlayer.id );
					});
					b( 'onplay', function(){
						// Go into playing state: 
						callback( 'playing', embedPlayer.id );
					});
					break;
				case 'doStop':
				case 'stop':
					b( "doStop");
					break;
				case 'playerPaused':
				case 'pause':
				case 'doPause':
					b( "onpause" );
					break;
				case 'playerPlayed':
					b( "firstPlay" );
					break;
				case 'play':
				case 'doPlay':
					b( "onplay" );
					break;
				case 'playerSeekStart':
					b( "seeking" ); // playerSeekStart just sends the playerId
					break;
				case 'seek':
				case 'doSeek':
				case 'doIntelligentSeek':	
					b( "seeking", function(){
						var seekTime = ( embedPlayer.kPreSeekTime !== null ) ? embedPlayer.kPreSeekTime : embedPlayer.currentTime
						callback( seekTime, embedPlayer.id );
					});
					break;
				case 'playerSeekEnd':
					b( "seeked" );
					break;
				case 'playerPlayEnd':
					// Player Play end should subscribe to postEnded which is fired at the end
					// of ads and between clips in a playlist. 
					b( "postEnded" );
					break;
				case 'playbackComplete':
					// Signifies the end of a media in the player ( can be either ad or content )
					b( "playbackComplete" );
					b( "AdSupport_EndAdPlayback", function( e, slotType){
						// do not trigger the end adplayback event for postroll ( will already be
						// triggred by the content end 
						if( slotType != 'postroll' ){
							callback();
						}
					});
					break;
				case 'durationChange':
					b( "durationchange", function(){
						callback( {'newValue' : embedPlayer.duration}, embedPlayer.id );
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
					b( 'monitorEvent', function() {
						// Only seend updates while playing
						if( embedPlayer.isPlaying() ){
							callback( embedPlayer.currentTime );
						}
					});
					break;	
				case 'changeMedia':
					b( 'playerReady', function( event ){
						callback({'entryId' : embedPlayer.kentryid }, embedPlayer.id );
					});
					break;
				case 'entryReady':
					b( 'KalturaSupport_EntryDataReady', function( event, entryData ){
						callback( entryData, embedPlayer.id );
					});
					break;
				case 'entryFailed':
					b( 'KalturaSupport_EntryFailed' );
					break;
				case 'mediaReady':
					// Check for "media ready" ( namespace to kdpMapping )
					b( 'playerReady',function( event ){
						// Only issue the media ready callback if entry is actually ready.
						if( embedPlayer.kentryid ){
							callback( embedPlayer.id )
						}
					});
					break;
				case 'metadataReceived':
					b('KalturaSupport_MetadataReceived');
					break;
				
				/**
				 * Buffer related listeners 
				 */	
				case 'bufferChange':
					var triggeredBufferStart = false;
					var triggeredBufferEnd = false;
					// html5 has no buffer change event.. just trigger buffering on progress then again on bufferPercent == 1;
					b( 'monitorEvent', function(){
						if( !triggeredBufferStart){
							callback( true, embedPlayer.id );
							triggeredBufferStart = true;
						}
						if( !triggeredBufferEnd && embedPlayer.bufferedPercent == 1 ){
							callback( false, embedPlayer.id );
							triggeredBufferEnd = true;
						}
					})
					break;
				case 'bytesDownloadedChange':
					// KDP sends an initial bytes loaded zeor at player ready: 
					var prevBufferBytes = 0;
					b( 'monitorEvent', function(){
						if( typeof embedPlayer.bufferedPercent != 'undefined' ){
							var bufferBytes = parseInt( embedPlayer.bufferedPercent *  embedPlayer.mediaElement.selectedSource.getSize() );
							if( bufferBytes != prevBufferBytes ){
								callback( { 'newValue': bufferBytes }, embedPlayer.id );
								prevBufferBytes = bufferBytes;
							}
						}
					})
					break;
				case 'playerDownloadComplete':
					b( 'monitorEvent', function(){
						if(  embedPlayer.bufferedPercent == 1 ){
							callback( embedPlayer.id );
						}
					});
					break;
				case 'bufferProgress':
					var prevBufferTime = 0;
					b( 'monitorEvent', function(){
						if( typeof embedPlayer.bufferedPercent != 'undefined' ){
							var bufferTime = parseInt( embedPlayer.bufferedPercent * embedPlayer.duration );
							if( bufferTime != prevBufferTime ){
								callback( { 'newTime': bufferTime }, embedPlayer.id );
								prevBufferTime = bufferTime;
							}
						}
					})
					break;
				case 'bytesTotalChange':
					var prevBufferBytesTotal = 0;
					// Fired once per media loaded: 
					b( 'mediaLoaded', function(){
						callback( { 'newValue': embedPlayer.mediaElement.selectedSource.getSize()  } );
					})
					break;
					
				
				// Pre Sequence:
				case 'preSequenceStart':
				case 'prerollStarted':
					b('AdSupport_prerollStarted', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
				case 'preSequenceComplete':
					b('AdSupport_preSequenceComplete', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
					
				// mid Sequence: 
				case 'midrollStarted':
					b('AdSupport_midrollStarted', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
				case 'midSequenceComplete':
					b('AdSupport_midSequenceComplete', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
					
				// post roll Sequence: 
				case 'postRollStarted':
					b('AdSupport_midrollStarted', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
				case 'postSequenceComplete':
					b('AdSupport_postSequenceComplete', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
					
				// generic events: 
				case 'adStart':
					b('AdSupport_StartAdPlayback', function( e, slotType ){
						callback( { 'timeSlot': slotType }, embedPlayer.id );
					});	
					break;
				case 'adEnd':
					b('AdSupport_EndAdPlayback', function( e, slotType){
						callback( { 'timeSlot': slotType }, embedPlayer.id )
					});
					break;
				// Generic ad time update
				case 'adUpdatePlayhead': 
					b( 'AdSupport_AdUpdatePlayhead', function( event, adTime) {
						callback( adTime, embedPlayer.id );
					});
					break;
				/**OLD NUMERIC SEQUENCE EVENTS */
				case 'pre1start':
					b( 'AdSupport_PreSequence');
					break;
				// Post sequences:
				case 'post1start':
					b( 'AdSupport_PostSequence');
					break;
				/**
				 * Cue point listeners TODO ( move to mw.kCuepoints.js )
				 */
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
				case 'doReplay':
					b('replayEvent');
					break;
				case 'save':
				case 'gotoContributorWindow':
				case 'gotoEditorWindow':
					mw.log( "Warning: kdp event: " + eventName + " does not have an html5 mapping" );
					break;

				case 'freePreviewEnd':
					b('KalturaSupport_FreePreviewEnd');
					break;
				/** 
				 * For closedCaption plguin
				 *  TODO move to mw.KTimedText.js 
				 */
				case 'ccDataLoaded':
					b('KalturaSupport_CCDataLoaded');
					break;
				case 'newClosedCaptionsData':
					b('KalturaSupport_NewClosedCaptionsData');
					break;
				case 'changedClosedCaptions':
					b('TimedText_ChangeSource');
					break;
				default:
					// Custom listner 
					// ( called with any custom arguments that are provided in the trigger)
					b( eventName, function(){
						var args = $.makeArray( arguments );
						if( args.length ){
							args.shift();
						}
						callback.apply( _this, args );
					} );
					break;
			};
			// The event was successfully binded: 
			return true;
		},
		
		/**
		 * Emulates Kaltura removeJsListener function
		 */
		removeJsListener: function( embedPlayer, eventName, callbackName ){
			// Remove event by namespace
			if( typeof eventName == 'string' && eventName[0] === '.' ) {
				var eventData = eventName.split('.', 2);
				var eventNamespace = eventData[1];
				if( eventNamespace ) {
					$( embedPlayer ).unbind('.' + eventNamespace);
				}
				return ;
			}

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
			mw.log('KDPMapping:: sendNotification > '+ notificationName,  notificationData );
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
					// Update local kPreSeekTime
					embedPlayer.kPreSeekTime =  embedPlayer.currentTime;
					embedPlayer.seek( percent );
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
					// check if we are in a playlist
					if( embedPlayer.playlist  &&  !notificationData.playlistCall ){
						var clipList = embedPlayer.playlist.sourceHandler.getClipList();
						// search playlist for entryId
						for( var inx =0; inx < clipList.length; inx++ ){
							var clip = clipList[inx]; 
							// todo ( why is this not read from playlist source hander? ) 
							var autoContinue = embedPlayer.playlist.sourceHandler.autoContinue
							if( clip.id == notificationData.entryId ){
								// issue playlist index update ( not a direct changeMedia call 
								 embedPlayer.playlist.playClip( inx, autoContinue );
								 // don't contiue with normal change media. 
								 return ;
							}
						};
					}
					
					// Check changeMediak if we don't have entryId and referenceId and they both not -1 - Empty sources
					if( ( ! notificationData.entryId || notificationData.entryId == "" || notificationData.entryId == -1 )
						&& ( ! notificationData.referenceId || notificationData.referenceId == "" || notificationData.referenceId == -1 ) ) 
					{
						mw.log( "KDPMapping:: ChangeMedia missing entryId or refrenceid, empty sources.")
					    embedPlayer.emptySources();
					    break;
					}
					// Check if we have entryId and it's not -1. than we change media
					if( (notificationData.entryId && notificationData.entryId != -1) || (notificationData.referenceId && notificationData.referenceId != -1) ){
						
						// Check if we already started change media request
						if( embedPlayer.changeMediaStarted ) {
							break;
						}
						// Set flag so we know we already started changing media
						embedPlayer.changeMediaStarted = true;
						// Check if we use referenceId
						if( ! notificationData.entryId && notificationData.referenceId ) {
							embedPlayer.kreferenceid = notificationData.referenceId;
						} else {
							embedPlayer.kreferenceid = null;
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
						embedPlayer.kAds = null;

						// Temporary update the thumbnail to black pixel. the real poster comes from entry metadata
						embedPlayer.updatePosterSrc();
						
						// Run the embedPlayer changeMedia function
						embedPlayer.changeMedia();
						break;
					}
                case 'alert':
                    embedPlayer.controlBuilder.displayAlert( notificationData );
                    break;
                case 'removealert':
                    embedPlayer.controlBuilder.closeAlert();
                    break;
			}
			// Give kdp plugins a chance to take attribute actions 
			embedPlayer.triggerHelper( 'Kaltura_SendNotification', [ notificationName, notificationData ] );
		}
	};	
		
	// Setup the KDPMapping
	if( !window.KDPMapping ){
		window.KDPMapping = new mw.KDPMapping();
	}
	mw.log("KDPMapping::done ");
} )( window.mw, jQuery );
