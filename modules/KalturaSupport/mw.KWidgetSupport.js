( function( mw, $ ) { "use strict";
	
/**
 * Add the messages text:
 *  TODO remove once we switch to RL17 
 */
mw.includeAllModuleMessages();


mw.KWidgetSupport = function( options ) {
	// Create KWidgetSupport instance
	return this.init( options );
};
mw.KWidgetSupport.prototype = {

	// The Kaltura client local reference
	kClient : null,
	kSessionId: null, // Used for Analytics events
	
	// Constructor check settings etc
	init: function( options ){
		if( options ){
			$.extend( this, options);
		}
		this.addPlayerHooks();
	},
	isIframeApiServer: function(){
		return ( mw.getConfig( 'EmbedPlayer.IsIframeServer' )
					&& 
				mw.getConfig( 'EmbedPlayer.EnableIframeApi' ) 
					&& 
				mw.getConfig( 'EmbedPlayer.IframeParentUrl' ) )
	},
	/**
	* Add Player hooks for supporting Kaltura api
	*/ 
	addPlayerHooks: function( ){
		var _this = this;	
		 
		// Add the hooks to the player manager
		$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
			// Check if we should add binding: ( we need a widget id )
			if( ! embedPlayer.kwidgetid ){
				return ;
			}
			_this.bindPlayer( embedPlayer );
			
		});
		// Ads have to communicate with parent iframe to support companion ads.
		$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
			// Add the updateCompanionTarget binding to bridge iframe
			exportedBindings.push( 'KalturaSupport_RawUiConfReady' );
		});
		
		// Do special binding for iframe
		$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
			// Once the player is "ready" add kWidget methods: 
			$( playerProxy ).bind('KalturaSupport_RawUiConfReady', function(event, rawUiConf ){
				// Store the parsed uiConf in the playerProxy object:
				playerProxy.$uiConf = $( rawUiConf );
				_this.addPlayerMethods( playerProxy );
			});
		});
		
	},
	/**
	 * Add player bindings 
	 */
	bindPlayer: function( embedPlayer ){
		var _this = this;
		// Add player methods: 
		this.addPlayerMethods( embedPlayer );
		
		// Add hook for check player sources to use local kEntry ID source check:
		$( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
			_this.loadAndUpdatePlayerData( embedPlayer, callback );
		});
		
		embedPlayer.bindHelper( 'KalturaSupport_EntryDataReady', function() {
			var thumbUrl = embedPlayer.evaluate('{mediaProxy.entry.thumbnailUrl}');
			// Only append width/height params if thumbnail from kaltura service ( could be external thumbnail )
			if( thumbUrl.indexOf( "thumbnail/entry_id" ) != -1 ){
				thumbUrl += '/width/' + embedPlayer.getWidth();
				thumbUrl += '/height/' + embedPlayer.getHeight();
			}
			embedPlayer.updatePosterSrc( thumbUrl );
		});
		
		// Add black sources: 
		$( embedPlayer ).bind( 'AddEmptyBlackSources', function( event, vid ){
			$.each( mw.getConfig( 'Kaltura.BlackVideoSources' ), function(inx, sourceAttr ){
				$(vid).append(
					$( '<source />' ).attr( sourceAttr )
				)	
			});
		});
		// Add Kaltura iframe share support:
		$( embedPlayer ).bind( 'getShareIframeSrc', function( event, callback ){
			var iframeUrl = mw.getMwEmbedPath() + 'mwEmbedFrame.php';
			iframeUrl +='/wid/' + embedPlayer.kwidgetid +
				'/uiconf_id/' + embedPlayer.kuiconfid +
				'/entry_id/' + embedPlayer.kentryid + '/' + 
				'?' + kWidget.flashVarsToUrl( embedPlayer.getFlashvars() );
			// return the iframeUrl via the callback: 
			callback( iframeUrl );
		});
	},
	rewriteTarget: function( widgetTarget, callback ){
		var _this = this;
		this.loadPlayerData( widgetTarget, function( playerData ){
			// look for widget type in uiConf file: 
			switch( _this.getWidgetType( playerData.uiConf ) ){
				// We have moved playlist into a "player" based uiconf plugin
				case 'playlist' :
					mw.load( [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ], function(){
						// Quick non-ui conf check for layout mode 
						var layout = ( $( widgetTarget ).width() > $( widgetTarget ).height() ) 
										? 'horizontal' : 'vertical';
						$( '#' + widgetTarget.id ).playlist({
							'layout': layout,
							'titleHeight' : 0 // Kaltura playlist include title via player ( not playlist ) 
						}); 
						callback();
					});
				break;
				case 'pptwidget':
					mw.load([ 'EmbedPlayer', 'mw.KPPTWidget', 'mw.KLayout' ], function(){
						new mw.KPPTWidget( widgetTarget, playerData.uiConf, callback );
					});
				break;
				default:
					mw.log("Error:: Could not read widget type for uiconf:\n " + playerData.uiConf );
				break;
			}
		});
	},
	getWidgetType: function( uiConf ){
		var $uiConf = $( uiConf );
		if( $uiConf.find('plugin#playlistAPI').length ){
			return 'playlist';
		}
		if( $uiConf.find('plugin#pptWidgetAPI') ){
			return 'pptwidget';
		}
		return null;
	},
	/**
	 * Load and bind embedPlayer from kaltura api entry request
	 * @param embedPlayer
	 * @param callback
	 */
	loadAndUpdatePlayerData: function( embedPlayer, callback ){
		var _this = this;
		mw.log( "KWidgetSupport::loadAndUpdatePlayerData>" );
		// Load all the player configuration from kaltura: 
		_this.loadPlayerData( embedPlayer, function( playerData ){
			if( !playerData ){
				mw.log("KWidgetSupport::loadAndUpdatePlayerData> error no player data!");
				callback();
				return ;
			}
			_this.updatePlayerData( embedPlayer, playerData, callback );
		});
	},
	
	updatePlayerData: function( embedPlayer,  playerData, callback ){
		var _this = this;
		// Check for playerData error: 
		if( playerData.error ){
			embedPlayer['data-playerError'] = playerData.error;
		}
		
		// Check for uiConf	and attach it to the embedPlayer object:
		if( playerData.uiConf ){
			// check raw data for xml header ( remove ) 
			// <?xml version="1.0" encoding="UTF-8"?>
			playerData.uiConf = $.trim( playerData.uiConf.replace( /\<\?xml.*\?\>/, '' ) );
			
			// Pass along the raw uiConf data
			$( embedPlayer ).trigger( 'KalturaSupport_RawUiConfReady', [ playerData.uiConf ] );
			
			// Store the parsed uiConf in the embedPlayer object:
			embedPlayer.$uiConf = $( playerData.uiConf );
			
			// if not in an iframe server set any configuration present in custom variables of the playerData
			if( !mw.getConfig('EmbedPlayer.IsIframeServer') ){
				embedPlayer.$uiConf.find( 'uiVars var' ).each( function( inx, customVar ){
					if( $( customVar ).attr('key') &&  $( customVar ).attr('value') ){
						var cVar = $( customVar ).attr('value');
						// String to boolean: 
						cVar = ( cVar === "false" ) ? false : cVar;
						cVar = ( cVar === "true" ) ? true : cVar;
						mw.setConfig(  $( customVar ).attr('key'), cVar);
					}
				});
			}
		}
		
		// Apply player Sources
		if( playerData.flavors ){
			_this.addFlavorSources( embedPlayer, playerData );
		}
		
		// Check for "image" mediaType ( 2 ) 
		if( playerData.meta && playerData.meta.mediaType == 2 ){ 
			mw.log( 'KWidgetSupport:: Add Entry Image:: ( use getKalturaThumbUrl ) ' );
			embedPlayer.mediaElement.tryAddSource(
				$('<source />')
				.attr( {
					'src' : kWidget.getKalturaThumbUrl({
						'partner_id' : embedPlayer.kpartnerid,
						'entry_id' : embedPlayer.kentryid,
						'width' : embedPlayer.getWidth(),
						'height' :  embedPlayer.getHeight()
					}),
					'type' : 'image/jpeg'
				} )
				.get( 0 )
			);
		}
		mw.log("KWidgetSupport:: check for meta:");
		// check for entry id not found: 
		if( playerData.meta && playerData.meta.code == 'ENTRY_ID_NOT_FOUND' ){
			$( embedPlayer ).trigger( 'KalturaSupport_EntryFailed' );
		} else {
			// Add any custom metadata:
			if( playerData.entryMeta ){
				embedPlayer.kalturaEntryMetaData = playerData.entryMeta;
			}
			// Apply player metadata
			if( playerData.meta ) {
				embedPlayer.duration = playerData.meta.duration;
				// We have to assign embedPlayer metadata as an attribute to bridge the iframe
				embedPlayer.kalturaPlayerMetaData = playerData.meta;
			}
			if( playerData.entryCuePoints && playerData.entryCuePoints.length > 0 ) {
				mw.log( "KCuePoints:: Added " + playerData.entryCuePoints.length + " CuePoints to embedPlayer");
				embedPlayer.rawCuePoints = playerData.entryCuePoints;
				embedPlayer.kCuePoints = new mw.KCuePoints( embedPlayer );
			}
		}
		
		// Check for payload based uiConf xml ( as loaded in the case of playlist with uiConf ) 
		if( $(embedPlayer).data( 'uiConfXml' ) ){
			embedPlayer.$uiConf = $( embedPlayer ).data( 'uiConfXml' );
		}
		// Check for playlist cache based 
		if( playerData.playlistData ){
			embedPlayer.kalturaPlaylistData = playerData.playlistData;
		}

		// Check access controls ( must come after addPlayerMethods for custom messages )
		if( playerData.accessControl ){
			embedPlayer.kalturaAccessControl = playerData.accessControl;
		}
		_this.handleUiConf( embedPlayer, callback );
	},
	addPlayerMethods: function( embedPlayer ){
		var _this = this;
		
		embedPlayer.getRawKalturaConfig = function( confPrefix, attr ){
			return _this.getRawPluginConfig( embedPlayer, confPrefix, attr );
		};
		// Add getKalturaConfig to embed player:
		embedPlayer.getKalturaConfig = function( confPrefix, attr ){
			return _this.getPluginConfig( embedPlayer, confPrefix, attr );
		};
		
		// Extend plugin configuration
		embedPlayer.setKalturaConfig = function( pluginName, key, value ) {
			// no plugin/key - exit
			if ( ! pluginName || ! key ) {
				return false;
			} 
			
			// Always create obj with plugin properties
			var objectSet = {};
			if( typeof key === "string" ) {
				objectSet[ key ] = value;
			}
			// The key could be an object with all plugin properties
			if( typeof key === "object" ) {
				objectSet = key;
			}
			
			// No player config, create the object
			if( ! embedPlayer.playerConfig ) {
				embedPlayer.playerConfig = {};
			}
			// Plugin doesn't exists -> create it
			if( ! embedPlayer.playerConfig[ 'plugins' ][ pluginName ] ){
				embedPlayer.playerConfig[ 'plugins' ][ pluginName ] = objectSet;
			} else {
				// If our key is an object, and the plugin already exists, merge the two objects together
				if( typeof key === 'object' ) {
					$.extend( embedPlayer.playerConfig[ 'plugins' ][ pluginName ], objectSet);
					return false;
				}
				// If the old value is an object and the new value is an object merge them
				if( typeof embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ] === 'object' && typeof value === 'object' ) {
					$.extend( embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ], value );
				} else {
					embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ] = value;
				}
			}
			// Sync iframe with attribute data updates:
			$( embedPlayer ).trigger( 'updateIframeData' );			
		};
		
		// Add an exported plugin value: 
		embedPlayer.addExportedObject = function( pluginName, objectSet ){
			// TODO we should support log levels in 1.7 
			// https://github.com/kaltura/mwEmbed/issues/80
			if( console && console.log ){
				console.log( "KwidgetSupport:: addExportedObject is deprecated, please use standard setKalturaConfig" );
			}
			for( var key in objectSet ){
				embedPlayer.setKalturaConfig( pluginName, key, objectSet[key] );
			}
		};

		// Add isPluginEnabled to embed player:
		embedPlayer.isPluginEnabled = function( pluginName ) {
			// Always check with lower case first letter of plugin name: 
			pluginName = pluginName[0].toLowerCase() + pluginName.substr(1);
			if( _this.getPluginConfig( embedPlayer, pluginName , 'plugin' ) ){
				// check for the disableHTML5 attribute
				if( _this.getPluginConfig( embedPlayer, pluginName , 'disableHTML5' ) ){
					return false;
				}
				return true;
			}
			return false;
		};
		
		// Add getFlashvars to embed player:
		embedPlayer.getFlashvars = function( param ) {
			if( ! embedPlayer.playerConfig || ! embedPlayer.playerConfig.vars ) {
				return {};
			}			
			var fv = embedPlayer.playerConfig['vars'] || {};
			if ( param ) {
				if ( param in fv ) {
					return fv[ param ];
				}
				else {
					return undefined;
				}
			}
			return fv;
		}
		
		// Adds support for custom message strings
		embedPlayer.getKalturaMsg = function ( msgKey ){
			// Check for uiConf configured msgs: 
			if( _this.getPluginConfig( embedPlayer, 'strings', msgKey ) ){
				return _this.getPluginConfig( embedPlayer, 'strings', msgKey );
			} 
			// If not found in the "strings" mapping then fallback to mwEmbed hosted default string:
			// XXX should be mw.getMsg in 1.7
			return gM('ks-' + msgKey );
		};
	},
	/**
	 * Handle the ui conf 
	 */
	handleUiConf: function( embedPlayer, callback ){
		var _this = this;
		// Local function to defer the trigger of loaded cuePoints so that plugins have time to load
		// and setup their binding to KalturaSupport_CuePointsReady
		var doneWithUiConf = function(){
			if( embedPlayer.rawCuePoints ){
				mw.log("KWidgetSupport:: trigger KalturaSupport_CuePointsReady", embedPlayer.rawCuePoints);
				// Allow other plugins to subscribe to cuePoint ready event:
				$( embedPlayer ).trigger( 'KalturaSupport_CuePointsReady', embedPlayer.rawCuePoints );
			};
			
			// Trigger the early player events ( after uiConf handling has a chance to setup bindings 
			if( embedPlayer.kalturaPlayerMetaData ){
				$( embedPlayer ).trigger( 'KalturaSupport_EntryDataReady', embedPlayer.kalturaPlayerMetaData );
			}
			if( embedPlayer.kalturaEntryMetaData ){
				$( embedPlayer ).trigger( 'KalturaSupport_MetadataReceived', embedPlayer.kalturaEntryMetaData );
			}
			
			// Run the DoneWithUiConf trigger 
			// Allows modules that depend on other modules initialization to do what they need to do. 
			mw.log("KWidgetSupport:: trigger KalturaSupport_DoneWithUiConf");
			
			// Don't stack
			setTimeout( function(){
				$( embedPlayer ).trigger( 'KalturaSupport_DoneWithUiConf' );
				callback();
			}, 0 );
		};
		
		// Sync iframe with attribute data updates:
		$( embedPlayer ).trigger( 'updateIframeData' );
		
		if( embedPlayer.$uiConf ){
			_this.baseUiConfChecks( embedPlayer );
			// Trigger the check kaltura uiConf event			
			mw.log( "KWidgetSupport:: trigger KalturaSupport_CheckUiConf" );
			$( embedPlayer ).triggerQueueCallback( 'KalturaSupport_CheckUiConf', embedPlayer.$uiConf, function(){	
				mw.log("KWidgetSupport::KalturaSupport_CheckUiConf done with all uiConf checks");
				// Trigger the api method for 1.6.7 and above ( eventually we will deprecate KalturaSupport_CheckUiConf );
				$( mw ).triggerQueueCallback( 'Kaltura_CheckConfig', embedPlayer, function(){
					// ui-conf file checks done
					doneWithUiConf();
				});
			});
		} else {
			doneWithUiConf();
		}		
	},
	/**
	 * Run base ui conf / flashvars check
	 * @param embedPlayer
	 * @return
	 */
	baseUiConfChecks: function( embedPlayer ){
		var _this = this;
		var getAttr = function( attrName ){
			return _this.getPluginConfig( embedPlayer, '', attrName );
		}
		// Check for autoplay:
		var autoPlay = getAttr( 'autoPlay' );
		if( autoPlay ){
			embedPlayer.autoplay = true;    
		}
		
		// Check for loop:
		var loop = getAttr( 'loop' );
		if( loop ){
			embedPlayer.loop = true;
		}

		// Check for dissable bit rate cookie and overide default bandwidth cookie
		if( getAttr( 'disableBitrateCookie' ) && getAttr( 'mediaProxy.preferedFlavorBR') ){
			embedPlayer.setCookie( 'EmbedPlayer.UserBandwidth', getAttr( 'mediaProxy.preferedFlavorBR' ) * 1000 );
			//$.cookie('EmbedPlayer.UserBandwidth', getAttr( 'mediaProxy.preferedFlavorBR') * 1000 );
		}

		// Check for imageDefaultDuration
		var imageDuration = getAttr( 'imageDefaultDuration' );
		if( imageDuration ){
			embedPlayer.imageDuration = imageDuration;
		}
		
		// Check for mediaPlayFrom
		var mediaPlayFrom = embedPlayer.evaluate('{mediaProxy.mediaPlayFrom}');	
		if( mediaPlayFrom ) {
			embedPlayer.startTime = parseFloat( mediaPlayFrom );
		}
		// Check for mediaPlayTo
		var mediaPlayTo = embedPlayer.evaluate('{mediaProxy.mediaPlayTo}');
		if( mediaPlayTo ) {
			embedPlayer.pauseTime = parseFloat( mediaPlayTo );
		}
		
		// Check for end screen play or "replay" button:
		// TODO more complete endscreen support by doing basic layout of end screen!!!
		if( embedPlayer.$uiConf.find( '#endScreen' ).find('button[command="play"],button[kclick="sendNotification(\'doPlay\')"]' ).length == 0 ){
			// no end play button
			$( embedPlayer ).data('hideEndPlayButton', true );
		} else{
			$( embedPlayer ).data('hideEndPlayButton', false );
		}
	},
	/**
	 * Check for xml config, let flashvars override 
	 * @param embedPlayer {Object} the embedPlayer for which configuration is being retrived
	 * @param confPrefix {String} the confPrefix, Can be empty if you want a non-prefixed attribute
	 * @param attr {Optional: Array|String} A list of attributes you want to get for the confPrefix 
	 * 				if null, we retrive all settings with the provided confPrefix 
	 */
	getPluginConfig: function( embedPlayer, confPrefix, attr ){
		var singleAttrName = false;
		if( typeof attr == 'string' ){
			singleAttrName = attr;
		}

		var rawConfigArray = this.getRawPluginConfig( embedPlayer, confPrefix, singleAttrName );
		var configArray = this.postProcessConfig( embedPlayer, rawConfigArray );
		
		if( singleAttrName != false ){
			return configArray[ singleAttrName ];
		} else {
			return configArray;
		}
	},

	getRawPluginConfig: function( embedPlayer, confPrefix, attr ){
		// Setup local pointers: 
		var _this = this;
		if( ! embedPlayer.playerConfig ){
			if( attr ){
				attr = [ attr ];
			}
			return this.getLegacyPluginConfig( embedPlayer, confPrefix, attr );
		}
		
		var plugins =  embedPlayer.playerConfig['plugins'];
		var returnConfig = {};
		
		// ConfPrefix is the plugin Name and the first letter should always be lower case. 
		if( confPrefix ){
			confPrefix = confPrefix[0].toLowerCase() + confPrefix.substr(1);
		}
	
		// if confPrefix is not an empty string or null check for the conf prefix
		if( confPrefix && plugins[ confPrefix ] ){
			if( !attr ){
				return plugins[ confPrefix ];
			}
			if( attr && typeof plugins[ confPrefix ][ attr ] !== 'undefined' ){
				returnConfig[ attr ] = plugins[ confPrefix ][ attr ];
			}
            if ( attr && typeof attr == 'object' ) {
                for ( var currAttr in attr ) {
                    if ( plugins[ confPrefix ][ attr[ currAttr ] ] ) {
                        returnConfig[ attr[ currAttr ] ] = plugins[ confPrefix ][ attr[ currAttr ] ];
                    }
                }
            }
		}
		if( !confPrefix && attr ){
			returnConfig[ attr ] = embedPlayer.playerConfig['vars'][attr]
		}
		return returnConfig;
	},
	/**
	 * Eventually we should deprecate this in favor of a iframe like javascript service to get plugin config.
	 */
	getLegacyPluginConfig: function( embedPlayer, confPrefix, attr ){
		if( !this.logLegacyErrorOnce ){
			this.logLegacyErrorOnce = true;
			mw.log("Error: kWidgetSupport get config from uiCOnf has been deprecated please load via iframe");
		}
		// Setup local pointers: 
		var _this = this;
		var flashvars = embedPlayer.getFlashvars();
		var $uiConf = embedPlayer.$uiConf;
	
		
		// If we are getting attributes and we are checking "plugin", Also check for "disableHTML5"
		if( attr && $.inArray( 'plugin', attr ) != -1 ){
			attr.push( "disableHTML5" );
		}

		var config = {};
		var $plugin = [];
		var $uiPluginVars = [];
		
		// if confPrefix is not an empty string or null check for the conf prefix
		if( confPrefix ){
			$plugin = $uiConf.find( '#' + confPrefix );
			// When defined from uiConf ( "plugin" tag is equivalent to "confPrefix.plugin = true" in the uiVars )
			if( $plugin.length && attr && $.inArray( 'plugin', attr ) != -1 ){ 
				config['plugin'] = true;
			}
			$uiPluginVars = $uiConf.find( 'var[key^="' + confPrefix + '"]' );
		} else {
			// When confPrefix is empty we still need to check for config in the ui Plugin Vars section
			var uiPluginVarsSelect = '';
			// pre-build out $uiPluginVars list
			var coma = '';
			$.each( attr, function(inx, attrName ){
				uiPluginVarsSelect+= coma + 'var[key="' + attrName + '"]';
				coma = ',';
			});
			if( uiPluginVarsSelect ){
				$uiPluginVars = $uiConf.find( uiPluginVarsSelect );
			}
		}
		if( !attr && confPrefix ){
			if( $plugin.length ) {
				$.each( $plugin[0].attributes, function(i, nodeAttr){
					 config[ nodeAttr.name ] = nodeAttr.value;
				});
			}
			// @@TODO php should give us more structured configuration 
			$.each(flashvars, function( key, val) {
				if( key.indexOf( confPrefix ) === 0 ){
					config[key] = val;
				}
			})
			// Check for uiVars
			$uiPluginVars.each( function(inx, node){
				var attrName = $(node).attr('key');
				if( $(node).attr('overrideflashvar') != "false" || ! config[attrName] ){
					var attrKey = attrName.replace( confPrefix + '.', '');
					config[ attrKey ] = $(node)[0].getAttribute('value');
				}
			});
		} else {
			$.each( attr, function(inx, attrName ){
				// Plugin
				if( $plugin.length ){
					if( $plugin.attr( attrName ) ){
						config[ attrName ] = $plugin.attr( attrName );
					}
					// XML sometimes comes in all lower case
					if( $plugin.attr( attrName.toLowerCase() ) ){
						config[ attrName ] = $plugin.attr( attrName.toLowerCase() );
					}
				}
				
				// Flashvars overrides
				var pluginPrefix = ( confPrefix )? confPrefix + '.': '';
				if( flashvars[ pluginPrefix + attrName ] ){
					config[ attrName ] = flashvars[ pluginPrefix + attrName ];
				}
				
				// Uivars Check for "flat plugin vars" stored at the end of the uiConf ( instead of as attributes )"
				$uiPluginVars.each( function(inx, node){
					if( $( node ).attr('key') == pluginPrefix + attrName ){
						if( $(node).attr('overrideflashvar') == "true" || ! config[attrName] ){
							config[attrName] = $(node)[0].getAttribute('value');
						}
						// Found break out of loop
						return false;
					}
				});
				
			});
		}
		return config;
	},
	postProcessConfig: function( embedPlayer, config ){
		var _this = this;
		var returnSet = $.extend( {}, config ); 
		$.each( returnSet, function( attrName, value ) {
			// Unescape values that would come in from flashvars
			if( value && ( typeof value === 'string' ) ){
				returnSet[ attrName ] = unescape( value );
			}
			// Do any value handling  ... myPlugin.cat = {video.currentTime}
			// If JS Api disabled, evaluate is undefined
			if( embedPlayer.evaluate ){
				returnSet[ attrName ] = embedPlayer.evaluate( returnSet[ attrName ] );
			}
		});
		return returnSet;
	},
	/**
	 * Alternate source grabbing script ( for cases where we need to hot-swap the source ) 
	 * playlists on iPhone for example we can't re-load the player we have to just switch the src. 
	 * 
	 * accessible via static reference mw.getEntryIdSourcesFromApi
	 * 
	 */
	getEntryIdSourcesFromApi:  function( widgetId, partnerId, entryId, size, callback ){
		var _this = this;
		var sources;
		mw.log( "KWidgetSupport:: getEntryIdSourcesFromApi: w:" + widgetId + ' entry:' + entryId );
		this.kClient = mw.KApiPlayerLoader({
			'widget_id' : widgetId, 
			'entry_id' : entryId
		}, function( playerData ){
			// Check access control 
			if( playerData.accessControl ){
				var acStatus = _this.getAccessControlStatus( playerData.accessControl );
				if( acStatus !== true ){
					callback( acStatus );
					return ;
				}
			}
			// see if we are dealing with an image asset ( no flavor sources )
			if( playerData.meta && playerData.meta.mediaType == 2 ){ 
				sources = [{
						'src' : kWidget.getKalturaThumbUrl({
							'partner_id' : partnerId,
							'entry_id' : entryId,
							'width' : size.width,
							'height' : size.height
						}),
						'type' : 'image/jpeg'
					}];
			} else {
				// Get device sources 
				sources = _this.getEntryIdSourcesFromPlayerData( partnerId, playerData );
			}
			// Return the valid source set
			callback( sources );
		});
	},
	/**
	 * Sets up variables and issues the mw.KApiPlayerLoader call
	 */
	loadPlayerData: function( embedPlayer, callback ){
		var _this = this;
		var playerRequest = {};
		// Check for widget id	 
		if( ! embedPlayer.kwidgetid ){
			mw.log( "Error: missing required widget paramater ( kwidgetid ) ");
			callback( false );
			return false;
		} else {
			playerRequest.widget_id = embedPlayer.kwidgetid;
		}
		
		// Check if the entryId is of type url: 
		if( !this.checkForUrlEntryId( embedPlayer ) && embedPlayer.kentryid ){
			// Add entry_id playerLoader call			
			playerRequest.entry_id =  embedPlayer.kentryid;
		}

		if( embedPlayer.kreferenceid ) {
			playerRequest.reference_id = embedPlayer.kreferenceid;
		}
		
		// only request the ui Conf if we don't already have it: 
		if( !embedPlayer.$uiConf ){
			playerRequest.uiconf_id = this.getUiConfId( embedPlayer );
		}

		// Add the flashvars
		playerRequest.flashvars = $( embedPlayer ).data( 'flashvars' ); 

		// Check if we have the player data bootstrap from the iframe
		var bootstrapData = mw.getConfig("KalturaSupport.IFramePresetPlayerData");
		// Insure the bootStrap data has all the required info: 
		if( bootstrapData 
			&& bootstrapData.partner_id
			&& bootstrapData.ks
		){
			mw.log( 'KWidgetSupport::loaded player data from KalturaSupport.IFramePresetPlayerData config' );
			// Clear bootstrap data from configuration: 
			mw.setConfig("KalturaSupport.IFramePresetPlayerData" , null);
			embedPlayer.kpartnerid = bootstrapData.partner_id;
			this.kClient = mw.kApiGetPartnerClient( playerRequest.widget_id );
			this.kClient.setKS( bootstrapData.ks );
			callback( bootstrapData );
		} else {
			// Run the request: ( run async to avoid function call stack overflow )
			_this.kClient = mw.KApiPlayerLoader( playerRequest, function( playerData ){				
				// Check for flavors error code: ( INVALID_KS )
				if( playerData.flavors &&  playerData.flavors.code == "INVALID_KS" ){
					$('.loadingSpinner').remove();
					embedPlayer['data-playerError'] = embedPlayer.getKalturaMsg( "NO_KS" );
				}
				
				callback( playerData );
			});
		}
	},
	
	/**
	 * Check if the access control is oky and set a given error message
	 * 
	 * TODO should match the iframe messages keys
	 * TODO need to i8ln message with gM( 'msg-key' );
	 * 
	 * @return 
	 * @type boolean 
	 * 		true if the media can be played
	 * 		false if the media should not be played. 
	 */
	getAccessControlStatus: function( ac, embedPlayer ){
		if( ac.isAdmin ){
			return true;
		}
		if( ac.isCountryRestricted ){
			return 'country is restricted';
		}
		if( ac.isScheduledNow === 0 ){
			return 'is not scheduled now';
		}
		if( ac.isIpAddressRestricted ) {
			return 'ip restricted';
		}
		if( ac.isSessionRestricted && ac.previewLength === -1 ){
			return 'session restricted';
		}
		if( ac.isSiteRestricted ){
			return 'site restricted';
		}
		// This is normally handled at the iframe level, but check is included here for completeness
		if( ac.isUserAgentRestricted ){
			return embedPlayer.getKalturaMsg( 'USER_AGENT_RESTRICTED' );
		}
		
		// New AC API
		if( ac.accessControlActions && ac.accessControlActions.length ) {
			var message = false;
			$.each( ac.accessControlActions, function() {
				if( this.type == 1 ) {
					message = '';
					if( ac.accessControlMessages && ac.accessControlMessages.length ) {
						$.each( ac.accessControlMessages, function() {
							message += this.value + '\n';
						});
					} else {
						message = 'Access denied';
					}
				}
			});
			
			if( message ) {
				return message;
			}
		}
		return true;
	},
	/**
	 * Get the uiconf id
	 */
	getUiConfId: function( embedPlayer ){
		return embedPlayer.kuiconfid;
	},
	/**
	 * Check if the entryId is a url ( add source and do not include in request ) 
	 */
	checkForUrlEntryId:function( embedPlayer ){
		if( embedPlayer.kentryid 
				&& 
			typeof embedPlayer.kentryid == 'string'
				&&
			embedPlayer.kentryid.indexOf('://') != -1 )
		{
			embedPlayer.mediaElement.tryAddSource(
					$('<source />')
					.attr( {
						'src' : embedPlayer.kentryid
					} )
					.get( 0 )
				);
			return true;
		}
		return false;
	},
	
	/**
	* Convert flavorData to embedPlayer sources
	* 
	* @param {Object} embedPlayer Player object to apply sources to
	* @param {Object} flavorData Function to be called once sources are ready 
	*/ 
	addFlavorSources: function( embedPlayer, playerData ) {
		var _this = this;
		mw.log( 'KWidgetSupport::addEntryIdSources:');
		// Set the poster ( if not already set ) 
		if( !embedPlayer.poster && embedPlayer.kentryid ){
			embedPlayer.poster = kWidget.getKalturaThumbUrl({
				'partner_id' : embedPlayer.kpartnerid,
				'entry_id' : embedPlayer.kentryid,
				'width' : embedPlayer.getWidth(),
				'height' :  embedPlayer.getHeight()
			});
		}
		// Check if we already have sources with flavorid info 
		var sources = embedPlayer.mediaElement.getSources();
		if( sources[0] && sources[0]['data-flavorid'] ){
			return ;
		}
		// Else get sources from flavor data :
		var flavorSources = _this.getEntryIdSourcesFromPlayerData( embedPlayer.kpartnerid, playerData );

		// Check for prefered bitrate info
		var preferedBitRate = embedPlayer.evaluate('{mediaProxy.preferedFlavorBR}' );
		
		// Add all the sources to the player element: 
		for( var i=0; i < flavorSources.length; i++) {
			var source = flavorSources[i];
			// if we have a prefred bitrate and source type is adaptive append it to the requets url:
			if( preferedBitRate && source.type == 'application/vnd.apple.mpegurl' ){
				var qp = ( source.src.indexOf('?') === -1) ? '?' : '&';
				source.src = source.src + qp +  'preferredBitrate=' + preferedBitRate;
			}
			
			mw.log( 'KWidgetSupport:: addSource::' + embedPlayer.id + ' : ' +  source.src + ' type: ' +  source.type);
			var sourceElm = $('<source />')
				.attr( source )
				.get( 0 );
			// Add it to the embedPlayer
			embedPlayer.mediaElement.tryAddSource( sourceElm );
		}
	},
	/** 
	 * Get the host page url used passing referrer to kaltura api
	 */
	getHostPageUrl: function(){
		// The referring  url ( can be from the iframe if in iframe mode )
		var hostUrl = ( mw.getConfig( 'EmbedPlayer.IframeParentUrl') ) ?
						mw.getConfig( 'EmbedPlayer.IframeParentUrl') :
						document.URL;

		// If we have hash, remove everything after that
		if( hostUrl.indexOf("#") !== -1 ) {
			hostUrl = hostUrl.substr(0, hostUrl.indexOf("#"));
		}
		
		// Only domain is needed, so removing everything (incl.) after the third slash, resulting in shorter referrer not breaking the 1024 chars limit (iOS)
		hostUrl = hostUrl.substr( 0, hostUrl.indexOf( "/", 8 ) );
		return hostUrl;
	},
	/**
	 * Get client entry id sources: 
	 * @param {string} partnerId Used to build asset urls
	 * @param {object} playerData The flavor data object
	 */
	getEntryIdSourcesFromPlayerData: function( partnerId, playerData ){
		var _this = this;
		var flavorData = playerData.flavors;
		if( !flavorData ){
			mw.log("Error: KWidgetSupport: flavorData is not defined ");
			return ;
		}

		var protocol = mw.getConfig('Kaltura.Protocol');
		if( !protocol ){
			protocol = window.location.protocol.replace(':','');
		}
		// Setup the deviceSources array
		var deviceSources = [];
		
		// Setup the src defines
		var ipadAdaptiveFlavors = [];
		var iphoneAdaptiveFlavors = [];

		// Setup flavorUrl
		if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
			var flavorUrl = mw.getConfig('Kaltura.ServiceUrl') + '/p/' + partnerId +
					'/sp/' +  partnerId + '00/playManifest';
		} else {
			var flavorUrl = mw.getConfig('Kaltura.CdnUrl') + '/p/' + partnerId +
				   '/sp/' +  partnerId + '00/flvclipper';
		}
		
		// Add all avaliable sources: 
		for( var i = 0 ; i < flavorData.length; i ++ ) {
			var asset = flavorData[i];

			var sourceAspect = Math.round( ( asset.width / asset.height )  * 100 )  / 100
			// Setup a source object:
			var source = {
				'data-sizebytes' : asset.size * 1024,
				'data-bandwidth' : asset.bitrate * 1024,
				'data-width' : asset.width,
				'data-height' : asset.height,
				'data-aspect' : sourceAspect // not all sources have valid aspect ratios
			};
			// setup tags array: 
			var tags = asset.tags.toLowerCase().split(',');

			// Continue if clip is not ready (2) and not in a transcoding state (4 )
			if( asset.status != 2  ) {
				// if an asset is transcoding and no other source is found bind an error callback: 
				if( asset.status == 4 ){
					source.error = 'not-ready-transcoding';
					mw.log("KWidgetSupport:: Skip sources that are not ready: " +  asset.id + ' ' +  asset.tags );
					
					// don't add sources that are not ready ( for now ) 
					// deviceSources.push( source );
				}
				continue;
			}
			
			// Check playManifest conditional
			if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
				var src  = flavorUrl + '/entryId/' + asset.entryId;
				// Check if Apple http streaming is enabled and the tags include applembr
				if( mw.getConfig('Kaltura.UseAppleAdaptive') && $.inArray( 'applembr', tags ) != -1 ) {
					src += '/format/applehttp/protocol/' + protocol + '/a.m3u8';
					
					deviceSources.push({
						'data-aspect' : sourceAspect,
						'data-flavorid' : 'AppleMBR',
						'type' : 'application/vnd.apple.mpegurl',
						'src' : src
					});
					
					continue;
				} else {
					src += '/flavorId/' + asset.id + '/format/url/protocol/' + protocol;
				}
			} else {
				mw.log( "Error: KWidgetSupport: non-manifest urls are deprecated" );
				var src  = flavorUrl + '/entry_id/' + asset.entryId + '/flavor/' + asset.id ;
			}
			
			// Check the tags to read what type of mp4 source
			if( $.inArray( 'ipad', tags ) != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPad';
				source['type'] = 'video/h264';
			}

			// Check for iPhone src
			if( $.inArray( 'iphone', tags ) != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPhone';
				source['type'] = 'video/h264';
			}

			// Check for ogg source
			if( asset.fileExt && 
				( 
				asset.fileExt.toLowerCase() == 'ogg' 
				|| 
				asset.fileExt.toLowerCase() == 'ogv'
				||
				( asset.containerFormat && asset.containerFormat.toLowerCase() == 'ogg' )
				)
			){
				source['src'] = src + '/a.ogg';
				source['data-flavorid'] = 'ogg';
				source['type'] = 'video/ogg';
			}

			// Check for webm source
			if( asset.fileExt && asset.containerFormat && ( asset.fileExt == 'webm' 
					|| 
					$.inArray( 'webm' , tags) != -1 
					|| // Kaltura transcodes give: 'matroska'
					asset.containerFormat.toLowerCase() == 'matroska'
					|| // some ingestion systems give "webm" 
					( asset.containerFormat.toLowerCase() == 'webm' )
				)
			){
				source['src'] = src + '/a.webm';
				source['data-flavorid'] = 'webm';
				source['type'] = 'video/webm';
			}

			// Check for 3gp source
			if( asset.fileExt && asset.fileExt == '3gp' ){
				source['src'] = src + '/a.3gp';
				source['data-flavorid'] = '3gp';
				source['type'] = 'video/3gp';
			}
			
			// Check for mp3 source
			if ( asset.fileExt && asset.fileExt == 'mp3' ){
				source['src'] = src + '/a.mp3';
				source['data-flavorid'] = 'mp3';
				source['type'] = 'audio/mp3';
			}
			
			// Add the source ( if a src was defined ):
			if( source['src'] ){
				deviceSources.push( source );
			}
			
			/**
			 * Add Adaptive flavors:
			 */
			
			// Android does not support audio flavors in the adaptive stream set:
			if(  navigator.userAgent.indexOf( 'Android' ) !== -1 && 
					asset.width == 0  && asset.height == 0  ){
				continue;
			}
			
			// Add iPad Akamai flavor to iPad flavor Ids list id list
			if( $.inArray( 'ipadnew', tags ) != -1 ){
				ipadAdaptiveFlavors.push( asset.id );
			}
			
			// Add iPhone Akamai flavor to iPad&iPhone flavor Ids list
			if( $.inArray( 'iphonenew', tags ) != -1 ){
				ipadAdaptiveFlavors.push( asset.id );
				iphoneAdaptiveFlavors.push( asset.id );
			}
		} // end source loop

		// Make sure all the sources have valid aspect ratios ( if not get from other sources )
		for( var i=0; i < deviceSources.length; i++ ){
			var source = deviceSources[i];
			
			if( ! this.isValidAspect( source['data-aspect'] ) ){
				source['data-aspect'] = this.getValidAspect( deviceSources );
			}
			mw.log( "KWidgetSupport:: set aspect for: " + source['data-flavorid'] + ' = ' + source['data-aspect'] );
		}
		
		// Only add flavor sources if no appleMBR flavor exists and Kaltura.UseFlavorIdsUrls
		if( mw.getConfig('Kaltura.UseFlavorIdsUrls') && $.grep(deviceSources, function( a ){ 
				if( a['data-flavorid'] == 'AppleMBR' ){ 
					return true;
				}
			}).length  == 0
		) {
			var validClipAspect = this.getValidAspect( deviceSources );
			// Create iPad flavor for Akamai HTTP if we have more than one flavor
			if( ipadAdaptiveFlavors.length > 1 && mw.getConfig('Kaltura.UseAppleAdaptive') ) {
				deviceSources.push({
					'data-aspect' : validClipAspect,
					'data-flavorid' : 'iPadNew',
					'type' : 'application/vnd.apple.mpegurl',
					'src' : flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
				});
			}
			// Create iPhone flavor for Akamai HTTP
			if( iphoneAdaptiveFlavors.length > 1 && mw.getConfig('Kaltura.UseAppleAdaptive') ) {
				deviceSources.push({
					'data-aspect' : validClipAspect,
					'data-flavorid' : 'iPhoneNew',
					'type' : 'application/vnd.apple.mpegurl',
					'src' : flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
				});
			}
		}
		// Apple adaptive streaming is broken for short videos
		// remove adaptive sources if duration is less then 10 seconds, 
		if( playerData.meta.duration < 10 ) {
			deviceSources = this.removeAdaptiveFlavors( deviceSources );
		}
		
		// Remove adaptive sources when in playlist and playing audio entry - Causes player to freeze
		if( mw.getConfig( 'playlistAPI.kpl0Url' ) && playerData.meta && playerData.meta.mediaType == 5 ) {
			deviceSources = this.removeAdaptiveFlavors( deviceSources );
		}
		
		// Append KS to all source if available 
		// Get KS for playManifest URL ( this should run synchronously since ks should already be available )
		var ksCheck = false;
		this.kClient.getKS( function( ks ) {
			ksCheck = true;
			$.each( deviceSources, function(inx, source){
				deviceSources[inx]['src'] = deviceSources[inx]['src'] + '?ks=' + ks + '&referrer=' + base64_encode( _this.getHostPageUrl() );
			});
		});
		if( !ksCheck ){
			mw.log("Error:: KWidgetSupport: KS not defined in time, streams will be missing ks paramter");
		}
		
		return deviceSources;
	},
	removeAdaptiveFlavors: function( sources ){
		for( var i =0 ; i < sources.length; i++ ){
			if( sources[i].type == 'application/vnd.apple.mpegurl' ){
				// Remove the current source:
				sources.splice( i, 1 );
				i--;
			}
		}
		return sources;
	},
	getValidAspect: function( sources ){
		var _this = this;
		for( var i=0; i < sources.length; i++ ){
			var source = sources[i];
			var aspect = source['data-aspect'];
			if( this.isValidAspect( aspect ) ){
				// return valid aspect and exit out of the loop:
				return aspect;
			}
		};
		// Always return a valid apsect ( assume default aspect if none is found ) 
		var aspectParts = mw.getConfig( 'EmbedPlayer.DefaultSize' ).split( 'x' );
		return  Math.round( ( aspectParts[0] / aspectParts[1]) * 100 ) / 100;;
	},
	isValidAspect: function( aspect ){
		return  ! isNaN( aspect) && isFinite( aspect );
	},
	generateGUID: function() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},
	getGUID: function() {
		if( ! this.kSessionId ) {
			this.kSessionId = this.generateGUID();
		}
		return this.kSessionId;
	}
};

//Setup the kWidgetSupport global if not already set
if( !window.kWidgetSupport ){
	window.kWidgetSupport = new mw.KWidgetSupport();
}

/**
 * Register a global shortcuts for the Kaltura sources query
 */
mw.getEntryIdSourcesFromApi = function( widgetId, partnerId, entryId, size, callback ){
	kWidgetSupport.getEntryIdSourcesFromApi( widgetId, partnerId, entryId, size, callback);
};

})( window.mw, jQuery );
