/**
 * Based on the 'kdp3 javascript api'
 * Add full Kaltura mapping support to html5 based players
 * http://www.kaltura.org/demos/kdp3/docs.html#jsapi
 *
 * Compatibility is tracked here:
 * http://html5video.org/wiki/Kaltura_KDP_API_Compatibility
 *
 */
( function( mw, $ ) { "use strict";
	mw.KDPMapping = function( embedPlayer ) {
		return this.init( embedPlayer );
	};
	mw.KDPMapping.prototype = {

		// ability to format expressions
		formatFunctions: {
			timeFormat: function( value ){
				return mw.seconds2npt( parseFloat(value) );
			},
			dateFormat: function( value ){
				var date = new Date( value * 1000 );
				return date.toDateString();
			},
			numberWithCommas: function( value ){
				return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
		},
		// global list of kdp listening callbacks
		listenerList: {},
		/**
		* Add Player hooks for supporting Kaltura api stuff
		*/
		init: function( embedPlayer ){
			var _this = this;
			
			// Expose formatFunctions as mw.formaters
			mw.formaters = this.formatFunctions;

			// player api:
			var kdpApiMethods = [ 'addJsListener', 'removeJsListener', 'sendNotification',
								  'setKDPAttribute', 'evaluate' ];

			var parentProxyDiv = null;
			if(  mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
				try {
					parentProxyDiv = window['parent'].document.getElementById( embedPlayer.id );
				} catch (e) {

					// Do nothing
				}
			}
			// Add kdp api methods to local embed object as well as parent iframe
			$.each( kdpApiMethods, function( inx, methodName) {
				// Add to local embed object:
				embedPlayer[ methodName ] = function(){
					var args = $.makeArray( arguments ) ;
					args.splice( 0,0, embedPlayer);
					return _this[ methodName ].apply( _this, args );
				}
				// Add to parentProxyDiv as well:
				if( parentProxyDiv ){
					parentProxyDiv[ methodName ] = function(){
                        var args = arguments ;
                        // convert arguments to array
                        var ret = [];
                        if( args != null ){
                            var i = args.length;
                            // The window, strings (and functions) also have 'length'
                            if( i == null || typeof args === "string" || jQuery.isFunction(args) || args.setInterval )
                                ret[0] = args;
                            else
                                while( i )
                                    ret[--i] = args[i];
                        }
                        ret.splice( 0,0, embedPlayer);
                        return _this[ methodName ].apply(_this, ret);
					}
				}
			});
			// Fire jsCallback ready on the parent
			var runCallbackOnParent = false;
			if(  mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
				try {
					if( window['parent'] && window['parent']['kWidget'] && parentProxyDiv ){
						runCallbackOnParent = true;
						window['parent']['kWidget'].jsCallbackReady( embedPlayer.id );
					}
				} catch( e ) {
					runCallbackOnParent = false;
				}
			}
			// Run jsCallbackReady inside the iframe ( support for onPage Iframe plugins )
			if( !runCallbackOnParent ) {
				window.kWidget.jsCallbackReady( embedPlayer.id );
			}
		},

		/**
		 * Emulates Kaltura setAttribute function
		 * @param {Object} embedPlayer Base embedPlayer to be affected
		 * @param {String} componentName Name of component to be updated
		 * @param {String} property The value to give the named attribute
		 */
		setKDPAttribute: function( embedPlayer, componentName, property, value ) {
			mw.log("KDPMapping::setKDPAttribute " + componentName + " p:" + property + " v:" + value  + ' for: ' + embedPlayer.id );

			var pluginNameToSet = componentName;
			var propertyNameToSet = property;
			var valueToSet = value;
			
			switch( property ) {
				case 'autoPlay':
					embedPlayer.autoplay = value;
				break;
				case 'disableAlerts':
					mw.setConfig('EmbedPlayer.ShowPlayerAlerts', !value );
				break;
				default:
					// support descendant properties
					if( componentName.indexOf('.') != -1 ){
						var cparts = componentName.split('.');
						pluginNameToSet = cparts[0];
						propertyNameToSet = cparts[1];
						valueToSet = {};
						valueToSet[ property ] = value;
					}
					// Save configuration
					embedPlayer.setKalturaConfig( pluginNameToSet, propertyNameToSet, valueToSet );
				break;
			}
			// TODO move to a "ServicesProxy" plugin
			if( pluginNameToSet == 'servicesProxy'
				&& propertyNameToSet && propertyNameToSet == 'kalturaClient'
				&& property == 'ks'
			){
				this.updateKS( embedPlayer, value );
			}
			// Give kdp plugins a chance to take attribute actions
			$( embedPlayer ).trigger( 'Kaltura_SetKDPAttribute', [ componentName, property, value ] );
		},
		updateKS: function ( embedPlayer, ks){
			var client = mw.kApiGetPartnerClient( embedPlayer.kwidgetid );
			// update the new ks:
			client.setKs( ks );
			// Update KS flashvar
			embedPlayer.setFlashvars( 'ks', ks );
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
		evaluate: function( embedPlayer, objectString, limit ){
			var _this = this;
			var result;

			var isCurlyBracketsExpresion = function( str ) {
				if( typeof str == 'string' ) {
					return ( str.charAt(0) == '{' && str.charAt( str.length -1 ) == '}' );
				}
				return false;
			};

			// Limit recursive calls to 5
			limit = limit || 0;
			if( limit > 4 ) {
				mw.log('KDPMapping::evaluate: recursive calls are limited to 5');
				return objectString;
			}

			if( typeof objectString !== 'string'){
				return objectString;
			}
			// Check if a simple direct evaluation:
			if( isCurlyBracketsExpresion(objectString) && objectString.split( '{' ).length == 2 ){
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
			/*
			 * Support nested expressions
			 * Example: <Plugin id="fooPlugin" barProperty="{mediaProxy.entry.id}">
			 * {fooPlugin.barProperty} should return entryId and not {mediaProxy.entry.id}
			 */
			if( isCurlyBracketsExpresion(result) ) {
				result = this.evaluate( embedPlayer, result, limit++ );
			}
			return result;
		},
		/**
		 * Normalize evaluate expression
		 */
		getEvaluateExpression: function( embedPlayer, expression ){
			var _this = this;
			// Check if we have a function call:
			if( expression.indexOf( '(' ) !== -1 ){
				var fparts = expression.split( '(' );
				return _this.evaluateStringFunction(
					fparts[0],
					// Remove the closing ) and evaluate the Expression
					// should not include ( nesting !
					_this.getEvaluateExpression( embedPlayer, fparts[1].slice( 0, -1) )
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
				if( objectPath[2] && kObj[ objectPath[1] ] && typeof kObj[ objectPath[1] ][ objectPath[2] ] != 'undefined' ){
					return kObj[ objectPath[1] ][ objectPath[2] ];
				}

			}

			var getReffererURL = function(fv,objectPath) {
				// Check for the fv:
				if( fv && fv[ objectPath[2] ] ){
					return fv[ objectPath[2] ];
				}
				// Else use the iframeParentUrl if set:
				return mw.getConfig( 'EmbedPlayer.IframeParentUrl' );
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
							case 'skipOffsetRemaining':

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
									if( embedPlayer.seeking && embedPlayer.kPreSeekTime !== null ){
										return embedPlayer.kPreSeekTime;
									}
									/*var ct = embedPlayer.currentTime - embedPlayer.startOffset;
									if( ct < 0 )
										ct = 0;*/
									// give the current time - any start offset. 
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
						case 'sources': 
							return embedPlayer.mediaElement.getSources();
						break;
						case 'isLive':
							return embedPlayer.isLive();
						break;
						case 'mediaPlayTo':
							var mediaPlayTo = embedPlayer.getFlashvars('mediaProxy.mediaPlayTo');
							return mediaPlayTo ? mediaPlayTo :null;
							break;
						case 'mediaPlayFrom':
							var mediaPlayFrom = embedPlayer.getFlashvars('mediaProxy.mediaPlayFrom');
							return mediaPlayFrom ? mediaPlayFrom : null;
							break;
						case 'isOffline':
							if ( $.isFunction( embedPlayer.isOffline ) ) {
								return embedPlayer.isOffline();
							}
							return true;
						break;	
						case 'kalturaMediaFlavorArray':
							if( ! embedPlayer.kalturaFlavors ){
							return null;
							}
							return embedPlayer.kalturaFlavors;
						break;
					}
				break;
				// config proxy mapping
				case 'configProxy':
					var fv = embedPlayer.getFlashvars();
					switch( objectPath[1] ){
						case 'flashvars':
							if( objectPath[2] ) {
								switch( objectPath[2] ) {
									case 'autoPlay':
										// get autoplay
										return embedPlayer.autoplay;
									break;
									case 'referer':
									case 'referrer':
										return getReffererURL(fv,objectPath);
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
						// kaltura widget mapping: 
						case 'kw': 
							var kw = {
								'objectType': "KalturaWidget",
								'id' : embedPlayer.kwidgetid,
								'partnerId': embedPlayer.kpartnerid,
								'uiConfId' : embedPlayer.kuiconfid
							}
							if( objectPath[2] ){
								if( typeof kw[ objectPath[2] ] != 'undefined' ){
									return kw[ objectPath[2] ]
								}
								return null;
							}
							return kw;
						break;
						case 'targetId':
							return embedPlayer.id;
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
							if( embedPlayer.playerReadyFlag ){
								return 'ready';
							}
							return null;

						break;
						case 'loadTime':
						return kWidget.loadTime[embedPlayer.kwidgetid];
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
							var plId =null;
							if( plData['currentPlaylistId'] ){
								plId = plData['currentPlaylistId'];
							} else {
								 for (var plKey in plData) break;
								 plId = plKey;
							}
							var dataProvider = {
								'content' : plData[ plId ],
								'length' : plData[ plId ].length,
								'selectedIndex' : plData['selectedIndex']
							}
							if( objectPath[2] == 'selectedIndex' ) {
								return dataProvider.selectedIndex;
							}
							return dataProvider;
						break;
					}
				break;
				case 'utility':
					switch( objectPath[1] ) {
						case 'random':
							return Math.floor(Math.random() * 1000000000);
							break;
						case 'timestamp':
							return new Date().getTime();
							break;
						case 'referrer_url':
							var fv = embedPlayer.getFlashvars();
							return getReffererURL(fv,objectPath);
							break;
						case 'referrer_host':
							var fv = embedPlayer.getFlashvars();
							var referrer =  getReffererURL(fv,objectPath);
							var getLocation = function(href) {
								var l = document.createElement("a");
								l.href = href;
								return l;
							};
							var location = getLocation(referrer);
							return location.hostname;
							break;
						case 'nativeAdId':
							if( embedPlayer ) {
								return embedPlayer.getFlashvars('nativeAdId');
							} else {
								return "";
							}
							break;
						case 'nativeVersion':
							if ( embedPlayer ) {
								return embedPlayer.getFlashvars( 'nativeVersion' );
							} else {
								return "";
							}
							break;
						case 'streamerType':
							if (embedPlayer){
								return embedPlayer.streamerType;
							}
							return "";
							break;
					}
					break;
				case 'embedServices':
					var proxyData = embedPlayer.getKalturaConfig( 'proxyData' );
					var filedName = expression.replace('embedServices.', '');
					return this.getProperty(filedName, proxyData);
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
			// Search for format functions
			var formatFunc = null;
			if( expression.indexOf('|') !== -1 ){
				var expArr = expression.split('|');
				expression = expArr[0];
				formatFunc = expArr[1];
				if( typeof this.formatFunctions[ formatFunc ] == 'function' ){
					formatFunc = this.formatFunctions[ formatFunc ];
				} else {
					formatFunc = null;
				}
			}

			var evalVal = this.getEvaluateExpression( embedPlayer, expression );
			if( evalVal === null || typeof evalVal == 'undefined' || evalVal === 'undefined'){
				return '';
			}
			// Run by formatFunc
			if( formatFunc ){
				return formatFunc( evalVal );
			}
			return evalVal;
		},
		evaluateStringFunction: function( functionName, value ){
			switch( functionName ){
				case 'encodeUrl':
					return encodeURI( value );
					break;
				case 'conditional': 
					value
					break;
			}
		},
		getProperty: function( propertyName, object ) {
			var parts = propertyName.split( "." ),
				length = parts.length,
				i,
				property = object || this;

			for ( i = 0; i < length; i++ ) {
				if (property === undefined) break;
				property = property[parts[i]];
			}

			return property;
		},
		/**
		 * Emulates Kaltura removeJsListener function
		 */
		removeJsListener: function( embedPlayer, eventName, callbackName ){
			mw.log( "KDPMapping:: removeJsListener:: " + eventName );
			if( typeof eventName == 'string' ) {
				var eventData = eventName.split('.', 2);
				var eventNamespace = eventData[1];
				// Remove event by namespace, if only namespace was given
				if( eventNamespace && eventName[0] === '.' ) {
					$( embedPlayer ).unbind('.' + eventNamespace);
				}
				else if ( !eventNamespace ) {
					eventNamespace = 'kdpMapping';
				}
				eventName = eventData[0];
				if ( !callbackName ) {
					callbackName = 'anonymous';
				}
				else {
					var listenerId = this.getListenerId( embedPlayer, eventName, eventNamespace, callbackName) ;
					// If no listener with this callback name was found, return
					if ( !this.listenerList[ listenerId ] ) {
						return ;
					}
				}
				if ( this.listenerList[ listenerId ] ) {
					this.listenerList[ listenerId ] = null;
				}
				else {
					for ( var listenerItem in this.listenerList ) {
						if ( listenerItem.indexOf( embedPlayer.id + '_' + eventName + '.' + eventNamespace ) != -1 ) {
							this.listenerList[ listenerItem ] = null;
						}
					}
				}
			}
		},

		/**
		 * Generate an id for a listener based on embedPlayer, eventName and callbackName
		 */
		getListenerId: function(  embedPlayer, eventName, eventNamespace, callbackName ){
			return embedPlayer.id + '_' + eventName + '.' + eventNamespace + '_' + callbackName;
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
				var listenerId = this.getListenerId( embedPlayer, eventName, eventNamespace, callbackName );
				this.listenerList[ listenerId ] = callbackName;
				var callback = function(){
					var callbackName = _this.listenerList[ listenerId ];
					// Check for valid local listeners:
					var callbackToRun = kWidgetSupport.getFunctionByName( callbackName, window );
					if( ! $.isFunction( callbackToRun ) ){
						// Check for valid parent page listeners:
						callbackToRun = kWidgetSupport.getFunctionByName( callbackName, window['parent'] );
					}

					if( $.isFunction( callbackToRun ) ) {
						try{
							callbackToRun.apply( embedPlayer, $.makeArray( arguments ) );
						}catch(e){
							mw.log("Error when trying to run callbackToRun (probably JavaScript error in callbackToRun code)")
						};
					} else {
						mw.log('kdpMapping::addJsListener: callback name: ' + callbackName + ' not found');
					}
					
				};
			} else if( typeof callbackName == 'function' ){
				// Make life easier for internal usage of the listener mapping by supporting
				// passing a callback by function ref
				var listenerId = this.getListenerId( embedPlayer, eventName, eventNamespace, 'anonymous' );
				_this.listenerList[ listenerId ] = true;
				var callback = function(){
					if ( _this.listenerList[ listenerId ] ) {
						callbackName.apply( embedPlayer, $.makeArray( arguments) );
					}
				}
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
					bindCallback.apply( embedPlayer, $.makeArray( arguments ) );
				});
			};
			switch( eventName ){
				case 'layoutReady':
					b( 'KalturaSupport_DoneWithUiConf' );
				break;
				case 'mediaLoadError':
					b( 'mediaLoadError' );
					break;
				case 'mediaError':
					b( 'mediaError' );
					break;
				case 'kdpEmpty':
				case 'readyToLoad':
					if( embedPlayer.playerReadyFlag ){
						// player is already ready when listener is added
						if( ! embedPlayer.kalturaPlayerMetaData ){
							embedPlayer.kdpEmptyFlag = true;
							callback( embedPlayer.id );
						}
					} else {
						// TODO: When we have video tag without an entry
						b( 'playerReady', function(){
							// only trigger kdpEmpty when the player is empty
							// TODO support 'real' player empty state, ie not via "error handler"
							if( ! embedPlayer.kalturaPlayerMetaData ){
								embedPlayer.kdpEmptyFlag = true;
								// run after all other playerReady events: 
								setTimeout(function(){
									callback( embedPlayer.id );
								},0)
							}
						});
					}
					break;
				case 'kdpReady':
					// TODO: When player is ready with entry, only happens once
					// why not use widgetLoaded event ? 
					b( 'playerReady', function() {
						if( !embedPlayer.getError() ){
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
					b( "doStop" );
					break;
				case 'playerPaused':
				case 'pause':
				case 'doPause':
					b( "onpause" );
					break;
				case 'playerPlayed':
					b( "onplay" );
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
						var seekTime = ( embedPlayer.kPreSeekTime !== null ) ? embedPlayer.kPreSeekTime : embedPlayer.currentTime;
						callback( seekTime, embedPlayer.id );
					});
					break;
				case 'playerSeekEnd':
					b( "seeked", function(){
						// null out the pre seek time:
						embedPlayer.kPreSeekTime = null
						callback( embedPlayer.id );
					} );
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
						// triggered by the content end
						if( slotType != 'postroll' ){
							callback();
						}
					});
					break;
				case 'durationChange':
					b( "durationchange", function(){
						callback( {'newValue' : embedPlayer.duration}, embedPlayer.id );
					});
					b( "durationChange", function(){
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
							// run after all other playerReady events
							setTimeout(function(){
								callback( embedPlayer.id )
							},0);
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
					// KDP sends an initial bytes loaded zero at player ready:
					var prevBufferBytes = 0;
					b( 'monitorEvent', function(){
						if( typeof embedPlayer.bufferedPercent != 'undefined' && embedPlayer.mediaElement.selectedSource ){
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
				case 'midSequenceStart':
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
				case 'postSequenceStart':
					b('AdSupport_postrollStarted', function( e, slotType ){
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
				case 'switchingChangeStarted':
					b( 'sourceSwitchingStarted', function( event, data ) {
					callback( data );
					});
					break;
				case 'switchingChangeComplete':
					b( 'sourceSwitchingEnd', function( event, data ) {
						callback( data );
					});
					break;
				default:
					// Custom listner
					// ( called with any custom arguments that are provided in the trigger)
					b( eventName, function(){
						var args = $.makeArray( arguments );
						if( args.length ){
							args.shift();
						}
						callback.apply( embedPlayer, args );
					} );
					break;
			};
			// The event was successfully binded:
			return true;
		},

		/**
		 * Master send action list:
		 */
		sendNotification: function( embedPlayer, notificationName, notificationData ){
			mw.log('KDPMapping:: sendNotification > '+ notificationName,  notificationData );
			switch( notificationName ){
				case 'showSpinner': 
					embedPlayer.addPlayerSpinner();
					break;
				case 'hideSpinner': 
					embedPlayer.hideSpinner();
					break;
				case 'doPlay':
					// If in ad, only trigger doPlay event
					if( embedPlayer.sequenceProxy && embedPlayer.sequenceProxy.isInSequence ) {
						embedPlayer.triggerHelper( 'doPlay' );
						if( mw.getConfig( "EmbedPlayer.ForceNativeComponent") ) {
							embedPlayer.play();
						}
						break;
					}
					if( embedPlayer.playerReadyFlag == false ){
						mw.log('Warning:: KDPMapping, Calling doPlay before player ready');
						$( embedPlayer ).bind( 'playerReady.sendNotificationDoPlay', function(){
							$( embedPlayer ).unbind( '.sendNotificationDoPlay' );
							embedPlayer.play();
						})
						return;
					}
					embedPlayer.play();
					break;
				case 'doPause':
					// If in ad, only trigger doPause event
					if( embedPlayer.sequenceProxy && embedPlayer.sequenceProxy.isInSequence ) {
						embedPlayer.triggerHelper( 'doPause' );
						break;
					}
					embedPlayer.pause();
					break;
				case 'doStop':
					setTimeout(function() {
						embedPlayer.ignoreNextNativeEvent = true;
                			        embedPlayer.seek(0, true);
						embedPlayer.stop();
					},10);
					break;
				case 'doReplay':
					embedPlayer.replay();
					break;
				case 'doSeek':
					// Kaltura doSeek is in seconds rather than percentage:
					var seekTime = ( parseFloat( notificationData ) - embedPlayer.startOffset );
					// Update local kPreSeekTime
					embedPlayer.kPreSeekTime =  embedPlayer.currentTime;
					// Once the seek is complete null kPreSeekTime
					embedPlayer.bindHelper( 'seeked.kdpMapOnce', function(){
						embedPlayer.kPreSeekTime = null;
					});
					embedPlayer.seek( seekTime );
					break;
				case 'changeVolume':
					embedPlayer.setVolume( parseFloat( notificationData ),true );
					break;
				case 'openFullScreen':
					embedPlayer.layoutBuilder.fullScreenManager.doFullScreenPlayer();
					break;
				case 'closeFullScreen':
					embedPlayer.layoutBuilder.fullScreenManager.restoreWindowPlayer();
					break;
				case 'cleanMedia':
					embedPlayer.emptySources();
					break;
				case 'changeMedia':
					// Check changeMedia if we don't have entryId and referenceId and they both not -1 - Empty sources
					if( ( ! notificationData.entryId || notificationData.entryId == "" || notificationData.entryId == -1 )
						&& ( ! notificationData.referenceId || notificationData.referenceId == "" || notificationData.referenceId == -1 ) 
						// check for mediaProxy based override: 
						&& !notificationData.mediaProxy
					){
						mw.log( "KDPMapping:: ChangeMedia missing entryId or refrenceid, empty sources.")
						embedPlayer.emptySources();
						break;
					}
					// Check if we have entryId and it's not -1. than we change media
					if( (notificationData.entryId && notificationData.entryId != -1)
							||
						(notificationData.referenceId && notificationData.referenceId != -1) 
							||
						(notificationData.mediaProxy)
					){
						
						// Check if we already started change media request
						if( embedPlayer.changeMediaStarted ) {
							break;
						}
						
						// Set flag so we know we already started changing media
						embedPlayer.changeMediaStarted = true;

						// Check if we use referenceId
						if( ! notificationData.entryId && notificationData.referenceId ) {
							embedPlayer.setFlashvars('referenceId', notificationData.referenceId);
						} else {
							embedPlayer.setFlashvars('referenceId', null);
						}
						// Update the entry id
						embedPlayer.kentryid = notificationData.entryId;
						// Clear player & entry meta
						embedPlayer.kalturaPlayerMetaData = null;
						embedPlayer.kalturaEntryMetaData = null;

						// clear cuepoint data:
						embedPlayer.rawCuePoints = null;
						embedPlayer.kCuePoints = null;

						// clear ad data ..
						embedPlayer.kAds = null;

						// Temporary update the thumbnail to black pixel. the real poster comes from entry metadata
						embedPlayer.updatePoster();

						// if data is injected via changeMedia, re-load into iframe inject location:
						if( notificationData.mediaProxy ){
							window.kalturaIframePackageData.entryResult = notificationData.mediaProxy;
							// update plugin possition. Future refactor should treat mediaProxy as plugin  
							embedPlayer.playerConfig.plugins['mediaProxy'] = notificationData.mediaProxy;
							embedPlayer.playerConfig.plugins['mediaProxy'].manualProvider = true;
						}
						
						// Run the embedPlayer changeMedia function
						embedPlayer.changeMedia();
						break;
					}
				case 'alert':
					embedPlayer.layoutBuilder.displayAlert( notificationData );
					break;
				case 'removealert':
					embedPlayer.layoutBuilder.closeAlert();
					break;
				case 'enableGui':
					if ( notificationData.guiEnabled == true ) {
					embedPlayer.enablePlayControls();
					} else {
					embedPlayer.disablePlayControls();
					}
					break;
				default: 
					// custom notification
					$( embedPlayer ).trigger( notificationName, [notificationData] );
					break;
			}
			// Give kdp plugins a chance to take attribute actions
			$( embedPlayer ).trigger( 'Kaltura_SendNotification', [ notificationName, notificationData ] );
		}
	};

} )( window.mw, jQuery );
