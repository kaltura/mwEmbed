( function( mw, $ ) {"use strict";

/* Base API helper */
mw.KApiPartnerCache = [];
mw.kApiGetPartnerClient = function( widgetId ){
	if( !mw.KApiPartnerCache[ widgetId ] ){
		mw.KApiPartnerCache[ widgetId ] = new kWidget.api( {'wid':widgetId} );
	}
	return mw.KApiPartnerCache[ widgetId ];
};

/* Base Widget support*/
mw.KWidgetSupport = function( options ) {
	// Create KWidgetSupport instance
	return this.init( options );
};
mw.KWidgetSupport.prototype = {

	// The Kaltura client local reference
	kClient : null,
	kSessionId: null, // Used for Analytics events
	originalStreamerType: null,

	// Constructor check settings etc
	init: function( options ){
		if( options ){
			$.extend( this, options);
		}
		this.addStringsSupport();
		this.addPlayerHooks();
	},

	addStringsSupport: function(){
		window.getStringByKey = function(key){
			var playerConfig = window.kalturaIframePackageData.playerConfig;
			if (playerConfig && playerConfig.plugins && playerConfig.plugins.strings && playerConfig.plugins.strings[key]){
				return playerConfig.plugins.strings[key];
			}else{
				return false;
			}
		}
	},

	isIframeApiServer: function(){
		return ( mw.getConfig( 'EmbedPlayer.IsIframeServer' )
					&&
				mw.getConfig( 'EmbedPlayer.IframeParentUrl' ) )
	},
	/**
	* Add Player hooks for supporting Kaltura api
	*/
	addPlayerHooks: function( ){
		var _this = this;
		// Add the hooks to the player manager ( added to KalturaSupportNewPlayer to
		// avoid out of order execution before uiConf is ready )
		$( mw ).bind( 'KalturaSupportNewPlayer', function( event, embedPlayer ) {

			// Check if we should add binding: ( we need a widget id )
			if( ! embedPlayer.kwidgetid ){
				mw.log("Error:: KalturaSupportNewPlayer without kwidgetid");
				return ;
			}

			_this.bindPlayer( embedPlayer );
			// Add KDP API mapping ( will trigger playerReady for adding jsListeners )
			new mw.KDPMapping( embedPlayer );

			if ( kWidget.isIE8() && !kWidget.supportsFlash() ) {
				embedPlayer.setError( embedPlayer.getKalturaMsg( 'ks-FLASH-REQUIRED' ) );
			}
		});
	},

	/**
	 * Add player bindings
	 * @param {Object} embedPlayer
	 */
	bindPlayer: function( embedPlayer ){
		var _this = this;
		// Add player methods:
		this.addPlayerMethods( embedPlayer );

		// Check for playerConfig
		if( !embedPlayer.playerConfig ) {
			mw.log('Error: KWidgetSupport::bindPlayer error playerConfig not found');
			return ;
		}
		mw.setConfig("nativeVersion", embedPlayer.getFlashvars("nativeVersion"));
		// Overrides the direct download link to kaltura specific download.php tool for
		// selecting a download / playback flavor based on user agent.
		embedPlayer.bindHelper( 'directDownloadLink', function( event, downloadUrlCallback ) {
			var baseUrl = mw.getConfig('wgLoadScript').replace( 'load.php', '' );
			var downloadUrl = baseUrl + 'modules/KalturaSupport/download.php/wid/' + embedPlayer.kwidgetid;

			// Also add the uiconf id to the url:
			if( embedPlayer.kuiconfid ){
				downloadUrl += '/uiconf_id/' + embedPlayer.kuiconfid;
			}

			if( embedPlayer.kentryid ) {
				downloadUrl += '/entry_id/'+ embedPlayer.kentryid;
			}

			// Get KS and append to download url ( should be sync call )
			var client = mw.kApiGetPartnerClient( embedPlayer.kwidgetid );
			// Append ks & referrer for access control
			downloadUrl += '/referrer/' +  base64_encode( kWidgetSupport.getHostPageUrl() );
			var ks = client.getKs();
			if( ks ){
				downloadUrl += '/ks/' + ks;
			};
			downloadUrlCallback( downloadUrl );
		});
		
		// Add hook for check player sources to use local kEntry ID source check:
		embedPlayer.bindHelper( 'checkPlayerSourcesEvent', function( event, callback ) {
			_this.originalStreamerType = embedPlayer.getKalturaConfig( null, 'streamerType' ) ? embedPlayer.getKalturaConfig( null, 'streamerType' ) : 'http';
			_this.loadAndUpdatePlayerData( embedPlayer, callback );
		});

		// Update poster when we get entry meta data
		embedPlayer.bindHelper( 'KalturaSupport_EntryDataReady', function() {
			// Set duration
			embedPlayer.setDuration( embedPlayer.kalturaPlayerMetaData.duration );
			
			// Update thumbnail
			var thumbUrl = _this.getKalturaThumbnailUrl({
				url: embedPlayer.evaluate('{mediaProxy.entry.thumbnailUrl}'),
				width: embedPlayer.getWidth(),
				height: embedPlayer.getHeight()
			});
			if( embedPlayer.getFlashvars( 'loadThumbnailWithKs' ) === true ) {
				thumbUrl += '?ks=' + embedPlayer.getFlashvars('ks');
			}
			if (mw.getConfig('thumbnailUrl')) {
				thumbUrl = embedPlayer.evaluate(mw.getConfig('thumbnailUrl'));
			}
			var alt = gM('mwe-embedplayer-video-thumbnail-for', embedPlayer.evaluate('{mediaProxy.entry.name}'));
			embedPlayer.updatePoster( thumbUrl, alt );
			embedPlayer.isAudioPlayer = ( embedPlayer.kalturaPlayerMetaData.mediaType === 5 );
		});

		// Add black sources:
		embedPlayer.bindHelper( 'AddEmptyBlackSources', function( event, vid ){
			$(vid).empty();
			$.each( mw.getConfig( 'Kaltura.BlackVideoSources' ), function(inx, sourceAttr ){
				$(vid).append(
					$( '<source />' ).attr( sourceAttr )
				)
			});
		});
		// Add Kaltura iframe share support:
		embedPlayer.bindHelper( 'getShareIframeSrc', function( event, callback ){
			var uiconf_id = (embedPlayer.kuiconfid) ? '/uiconf_id/' + embedPlayer.kuiconfid : '';
			var iframeUrl = mw.getMwEmbedPath() + 'mwEmbedFrame.php';
			iframeUrl +='/wid/' + embedPlayer.kwidgetid + uiconf_id + 
				'/entry_id/' + embedPlayer.kentryid + '/' +
				'?' + kWidget.flashVarsToUrl( embedPlayer.getFlashvars() );
			// return the iframeUrl via the callback:
			callback( iframeUrl );
		});

		// Example how to override embedPlayerError handler

		embedPlayer.shouldHandlePlayerError = false;
		embedPlayer.bindHelper( 'embedPlayerError' , function ( event , data , doneCallback ) {
			var displayedAcError = false;
			// check for AC error:
			if ( mw.getConfig("manualProvider") ) {
				embedPlayer.shouldHandlePlayerError = true;
				embedPlayer.handlePlayerError(data);
				return;
			}
			_this.getEntryIdSourcesFromApi( embedPlayer , embedPlayer.kentryid , function ( sources ) {
				// no sources, or access control error.
				if ( !sources || sources.message ) {
					embedPlayer.showErrorMsg( sources );
					displayedAcError = true;
					doneCallback();
				}
			} );
			// give the above access control message 3 seconds to resolve; else show default network error
			setTimeout( function () {
				if ( displayedAcError ) {
					return;
				}
				embedPlayer.handlePlayerError( data , true );
			} , 3000 );
		} );

		// Support mediaPlayFrom, mediaPlayTo properties
		embedPlayer.bindHelper( 'Kaltura_SetKDPAttribute', function(e, componentName, property, value){
			if (!value) {
				return;
			}
			var segmentChange = false;
			switch( property ){
				case 'mediaPlayFrom':
					embedPlayer.startTime = parseFloat(value);
					segmentChange = true;
					clearTimeout(window.timeoutID);
					break;
				case 'mediaPlayTo':
					embedPlayer.pauseTime = parseFloat(value);
					segmentChange = true;
					embedPlayer.stopMonitor();
					clearTimeout(window.timeoutID);
					break;
			}
			if (segmentChange) {
				window.timeoutID = setTimeout(function () {
					$(embedPlayer).trigger("playSegmentEvent", [embedPlayer.startTime, embedPlayer.pauseTime]);
					embedPlayer.playSegment(embedPlayer.startTime, embedPlayer.pauseTime);
				}, 100);
			}
		});
	},
	/**
	 * Load and bind embedPlayer from kaltura api entry request
	 * @param embedPlayer
	 * @param callback
	 */
	loadAndUpdatePlayerData: function( embedPlayer, callback ){
		var _this = this;
		mw.log( "KWidgetSupport::loadAndUpdatePlayerData" );
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
			embedPlayer.setError( playerData.error );
		}

		var hasLivestreamConfig = function ( protocol ) {
			var configurations = playerData.meta.liveStreamConfigurations;
			if ( configurations && configurations.length ) {
				for (var i = 0; i < configurations.length; i++ ) {
					if ( configurations[i].protocol == protocol ) {
						return true;
					}
				}
			}
			return false;
		}

		function handlePlayerData() {
			// Check for "image" mediaType ( 2 )
			if( playerData.meta && playerData.meta.mediaType == 2 ){
				mw.log( 'KWidgetSupport::updatePlayerData: Add Entry Image' );
				embedPlayer.mediaElement.tryAddSource(
					$('<source />')
						.attr( {
							'src' : _this.getKalturaThumbnailUrl({
								url: playerData.meta.thumbnailUrl,
								width: embedPlayer.getWidth(),
								height: embedPlayer.getHeight()
							}),
							'type' : 'image/jpeg'
						} )
						.get( 0 )
				);
			}
			// Check for external media:
			if( playerData.meta && playerData.meta.type == "externalMedia.externalMedia" ){
				$( embedPlayer ).trigger( 'KalturaSupport_AddExternalMedia', playerData.meta );
			}

			//mw.log( "KWidgetSupport::updatePlayerData: check for meta:" );
			// check for entry id not found:
			if( playerData.meta && playerData.meta.code == 'ENTRY_ID_NOT_FOUND' ){
				$( embedPlayer ).trigger( 'KalturaSupport_EntryFailed' );
			} else {
				// Look for custom metadata in playerData.entryMeta and entryMetadata ( mediaProxy override name )
				embedPlayer.kalturaEntryMetaData = ( playerData.entryMeta ) ? playerData.entryMeta : playerData.entryMetadata
				
				// Lock for "entry" in 'meta' and 'entry' ( mediaProxy override name )
				var meta =  ( playerData.meta ) ? playerData.meta: playerData.entry;
				// Apply player entry metadata
				if( meta ) {
					// We have to assign embedPlayer metadata as an attribute to bridge the iframe
					embedPlayer.kalturaPlayerMetaData = meta;

					if ( meta.moderationStatus && (!playerData.contextData || !playerData.contextData.isAdmin) ) {
						if ( meta.moderationStatus == 1 ) {
							embedPlayer.setError( embedPlayer.getKalturaMsgObject('ks-ENTRY_MODERATE') );
						} else if ( meta.moderationStatus == 3 ) {
							embedPlayer.setError( embedPlayer.getKalturaMsgObject('ks-ENTRY_REJECTED') );
						}
					}
				}
			}

			// Check access controls ( must come after addPlayerMethods for custom messages )
			// check for Cuepoint data and load cuePoints,
			// TODO optimize cuePoints as hard or soft dependency on kWidgetSupport
			if( (playerData.entryCuePoints && playerData.entryCuePoints.length > 0) || ( embedPlayer.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) ) {
				embedPlayer.rawCuePoints = playerData.entryCuePoints;
				embedPlayer.kCuePoints = new mw.KCuePoints( embedPlayer );
			}
			_this.handleUiConf( embedPlayer, callback );
		}

		if( playerData.contextData ){
			embedPlayer.kalturaContextData = playerData.contextData;
		}

		var isStreamSupported = false;
		// Check for live stream
		if( playerData.meta && ( playerData.meta.type == 7 || playerData.meta.type == 8 )){
			//check if entry ONLY has hls configuration:
			var hasOnlyHLS = false;
			var configurations = playerData.meta.liveStreamConfigurations;
			if ( playerData.meta.hlsStreamUrl && ( !configurations || configurations.length == 0) ) {
				hasOnlyHLS = true;
			}  else if ( configurations ) {
				for ( var i = 0; i < configurations.length; i++ ) {
					if ( configurations[i].protocol != "hls" &&  configurations[i].protocol != "applehttp" ) {
						hasOnlyHLS = false;
						break;
					}
					hasOnlyHLS = true;
				}
			}
			if ( hasOnlyHLS ) {
				mw.setConfig("LeadWithHLSOnFlash", true);
			}

			if ( mw.EmbedTypes.getMediaPlayers().isSupportedPlayer( 'splayer' ) ) {
				if ( playerData.contextData && playerData.contextData.flavorAssets ) {
					var flavorData = playerData.contextData.flavorAssets;
					for( var i = 0 ; i < flavorData.length; i ++ ) {
						var tags = flavorData[i].tags.toLowerCase().split(',');
						if ( $.inArray( 'multicast_silverlight', tags ) != -1 ) {
							_this.addLiveEntrySource( embedPlayer, playerData.meta, false, true, 'multicast_silverlight', undefined);
							isStreamSupported = true;
							embedPlayer.setLive( true );
							break;
						}
					}
				}
			}
			if(  (playerData.meta.hlsStreamUrl || hasLivestreamConfig( 'hls' ) || hasLivestreamConfig( 'applehttp' ))
				&&
				mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'application/vnd.apple.mpegurl' ).length ) {
				// Add live stream source
				//if we're gettting the source from manual provider(mediaProxy) - add them directly
				if (playerData.entry && playerData.entry.manualProvider){
					if (playerData.meta.hdsStreamUrl){
						embedPlayer.mediaElement.tryAddSource($('<source />')
							.attr({
								'src' : playerData.meta.hdsStreamUrl,
								'type' : 'application/vnd.apple.mpegurl'
							})[0] );
					}
					embedPlayer.mediaElement.tryAddSource(
						$('<source />')
							.attr({
								'src' : playerData.meta.hlsStreamUrl,
								'type' : 'application/vnd.apple.mpegurl'
							})[0] );

					embedPlayer.setLive( true );
					handlePlayerData();
					return;
				}
				_this.addLiveEntrySource( embedPlayer, playerData.meta, false, false, 'applehttp', function() {
					// Set live property to true
					embedPlayer.setLive( true );
					handlePlayerData();
				} );
				return;
			} else if ( mw.EmbedTypes.getMediaPlayers().isSupportedPlayer( 'kplayer' ) ) {
				var streamerType;
				var streamerTypeFV = embedPlayer.getKalturaConfig( null, 'streamerType' );
				if ( streamerTypeFV && hasLivestreamConfig( streamerTypeFV ) ) {
					streamerType = streamerTypeFV;
				}
				else if ( hasLivestreamConfig( 'hdnetworkmanifest' )) {
					streamerType = 'hdnetworkmanifest';
				} else if ( hasLivestreamConfig( 'hds' ) ){
					streamerType = 'hds';
				} else {
					streamerType = 'rtmp';
				}

				// Add live stream source
				_this.addLiveEntrySource( embedPlayer, playerData.meta, true, false, streamerType, undefined );
				
				// Set live property to true
				embedPlayer.setLive( true );
			} else if ( !isStreamSupported ) {
				embedPlayer.setError( embedPlayer.getKalturaMsg('LIVE-STREAM-NOT-SUPPORTED') );
			}
		} else {
			if (this.isEmbedServicesEnabled(playerData)){
				this.setEmbedServicesData(embedPlayer, playerData);
			} else {
				embedPlayer.setLive( false );
				//TODO in the future we will have flavors for livestream. revise this code.
				// Apply player Sources
				if ( playerData.contextData && playerData.contextData.flavorAssets ) {
					_this.addFlavorSources( embedPlayer, playerData );
				}
				// try with direct source override: 
				if ( playerData.sources ) {
					_this.addSources( embedPlayer, playerData.sources  );
				}
			}
		}
		handlePlayerData();
	},
	isEmbedServicesEnabled: function(playerData){
		if (playerData && playerData.meta &&
			playerData.meta.partnerData &&
			playerData.meta.partnerData["proxyEnabled"] &&
			playerData.meta.partnerData["proxyEnabled"] === "true") {
			return true;
		} else {
			return false;
		}
	},
	setEmbedServicesData: function(embedPlayer, playerData){
		//Set flavors
		var flavorAssets = [];
		$.each( playerData.contextData.flavorAssets, function ( index, flavorAsset ) {
			var flavorPartnerData = flavorAsset.partnerData;
			if (flavorPartnerData.url != "") {
				var flavorAssetObj = {
					"data-assetid": flavorAsset.id,
					src: flavorPartnerData.url,
					type: flavorPartnerData.type,
					"data-width": flavorAsset.width,
					"data-height": flavorAsset.height,
					"data-bitrate": flavorAsset.bitrate,
					"data-bandwidth": (flavorAsset.bitrate ? (flavorAsset * 1024) : 0),
					"data-frameRate": flavorAsset.frameRate,
					"data-flavorid": flavorPartnerData.flavorid,
					"default": flavorPartnerData["default"]
				};
				flavorAssets.push( flavorAssetObj );
			}
		} );
		embedPlayer.replaceSources(flavorAssets);
		//Set Live
		if ( playerData.meta.partnerData["isLive"] &&
			playerData.meta.partnerData["isLive"] == "true" ) {
			embedPlayer.setLive( true );
		}

		//Set proxyData response data
		embedPlayer.setKalturaConfig( 'proxyData', playerData.meta.partnerData);
	},
	addPlayerMethods: function( embedPlayer ){
		var _this = this;

		embedPlayer.getRawKalturaConfig = function( confPrefix, attr ){
			var rawConfigArray = _this.getRawPluginConfig( embedPlayer, confPrefix, attr );
			if( $.isPlainObject(rawConfigArray) && attr ){
				return rawConfigArray[ attr ];
			}
			return rawConfigArray;
		};

		// Add getKalturaConfig to embed player:
		embedPlayer.getKalturaConfig = function( confPrefix, attr ){
			return _this.getPluginConfig( embedPlayer, confPrefix, attr );
		};

		// Extend plugin configuration
		embedPlayer.setKalturaConfig = function( pluginName, key, value, quiet ) {

			// no key - exit
			if ( ! key ) {
				return ;
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
				embedPlayer.playerConfig = {
					'plugins' : {},
					'vars' : {}
				};
			}
			// check for var update ( no top level plugin ) 
			if( ! pluginName ){
				embedPlayer.playerConfig['vars'][key] = value;
			} else if( 
				! embedPlayer.playerConfig[ 'plugins' ][ pluginName ] 
			){
				// Plugin doesn't exists -> create it
				embedPlayer.playerConfig[ 'plugins' ][ pluginName ] = objectSet;
			} else {
				// If our key is an object, and the plugin already exists, merge the two objects together
				if( typeof key === 'object' ) {
					$.extend( embedPlayer.playerConfig[ 'plugins' ][ pluginName ], objectSet);
					mw.log( 'merged:: ', embedPlayer.playerConfig[ 'plugins' ][ pluginName ]);
				}
				// If old value & new value is array, don't merge
				else if( $.isArray(embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ]) && $.isArray(value) ) {
					embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ] = value;
				}
				// If the old value is an object and the new value is an object merge them
				else if( typeof embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ] === 'object' && typeof value === 'object' ) {
					$.extend( embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ], value );
				} else {
					embedPlayer.playerConfig[ 'plugins' ][ pluginName ][ key ] = value;
				}
			}
			if( !quiet ) {
				embedPlayer.triggerHelper( 'Kaltura_ConfigChanged', [ pluginName, key, value ]);
			}
		};

		// Add an exported plugin value:
		embedPlayer.addExportedObject = function( pluginName, objectSet ){
			// TODO we should support log levels in 1.7
			// https://github.com/kaltura/mwEmbed/issues/80
			mw.log( "KwidgetSupport:: addExportedObject is deprecated, please use standard setKalturaConfig" );
			for( var key in objectSet ){
				embedPlayer.setKalturaConfig( pluginName, key, objectSet[key] );
			}
		};

		// Add isPluginEnabled to embed player:
		embedPlayer.isPluginEnabled = function( pluginName ) {
			// Always check with lower case first letter of plugin name:
            var lcPluginName = (pluginName.substr(0,1)) ? pluginName.substr(0,1).toLowerCase() + pluginName.substr(1) : false;
			if( lcPluginName ){
				// Check if plugin exists
				if( _this.getRawPluginConfig( embedPlayer, lcPluginName ) === undefined ) {
					return false;
				}
				// Check if pluginName.plugin is false
				if( _this.getPluginConfig( embedPlayer, lcPluginName , 'plugin' ) === false ) {
					return false;
				}
				// check for the disableHTML5 attribute
				if( _this.getPluginConfig( embedPlayer, lcPluginName , 'disableHTML5' ) ){
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

		embedPlayer.setFlashvars = function( key, value ) {
			if( key ) {
				embedPlayer.playerConfig['vars'][ key ] = value;
			}
		}

		// Adds support for custom message strings
		embedPlayer.getKalturaMsg = function ( msgKey ){
			// check for message locale:
			var localeMsgKey = msgKey;
			if ( embedPlayer.currentLocale ){
				localeMsgKey = embedPlayer.currentLocale + '_' + msgKey;
			}
			// Check for uiConf configured msgs:
			if( _this.getPluginConfig( embedPlayer, 'strings', localeMsgKey ) ) {
				return _this.getPluginConfig( embedPlayer, 'strings', localeMsgKey );
			}
			// NOTE msgKey is used instead of localeMsgKey ( since default mw messages uses resource loader localization ) 
			if ( mw.messages.exists( msgKey ) ) {
				return gM( msgKey );
			}
			msgKey = 'ks-' + msgKey;
			if ( mw.messages.exists( msgKey ) ) {
				return gM( msgKey );
			}
			if ( msgKey.indexOf( '_TITLE' ) == -1 ) {
				return gM( 'ks-GENERIC_ERROR' );
			}
			return gM( 'ks-GENERIC_ERROR_TITLE' );
		};

		embedPlayer.getKalturaMsgTitle = function ( msgKey ) {
			return embedPlayer.getKalturaMsg( msgKey + '_TITLE' );
		};

		embedPlayer.getKalturaMsgObject = function( msgKey ) {
			return {
				'title': embedPlayer.getKalturaMsgTitle( msgKey ),
				'message': embedPlayer.getKalturaMsg( msgKey )
			}
		};

		embedPlayer.resolveSrcURL = function( srcURL ){
			var deferred = $.Deferred();
			var eventObj = {"src":srcURL,
				"promise":deferred,
				"handled":false};
			embedPlayer.triggerHelper( 'preResolveSrc' ,eventObj );
			if (eventObj.handled){
				return eventObj.promise;
			}

			if (mw.getConfig("EmbedPlayer.UseDirectManifestLinks")) {
				return deferred.resolve( srcURL );
			}

			if (srcURL && srcURL.toLowerCase().indexOf("playmanifest") === -1){
				return deferred.resolve( srcURL );
			}
			var srcToPlay = null;
			var qp = ( srcURL.indexOf('?') === -1) ? '?' : '&';

			$.ajax({
				url: srcURL + qp + "responseFormat=jsonp",
				dataType: 'jsonp',
				success: function( playmanifest ){
					var flavors = playmanifest.flavors;
					if ( flavors && flavors.length === 1 ) {
						srcToPlay = flavors[0].url;
						deferred.resolve( srcToPlay );
						//if we get more then 1 flavors we dont need the redirect so we'll use the same url
						// the playmanifest service will return the manifest directly.
					} else if (flavors && flavors.length > 1){
						deferred.resolve( srcURL );
					} else {
						deferred.reject();
					}
				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();
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

			if( embedPlayer.rawCuePoints || ( embedPlayer.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) ){
				mw.log("KWidgetSupport:: trigger KalturaSupport_CuePointsReady", embedPlayer.rawCuePoints);
				// Allow other plugins to subscribe to cuePoint ready event:
				$( embedPlayer ).trigger( 'KalturaSupport_CuePointsReady', embedPlayer.rawCuePoints );
			}

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
		if( embedPlayer.playerConfig ){
			_this.baseUiConfChecks( embedPlayer );
			// TODO: remove this completly once all plugins revised
			embedPlayer.$uiConf = $({});
			// Trigger the check kaltura uiConf event
			mw.log( "KWidgetSupport:: trigger Kaltura_CheckConfig" );
			$( embedPlayer ).triggerQueueCallback( 'Kaltura_CheckConfig', embedPlayer, function(){
				doneWithUiConf();
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
		
		// Check for autoMute:
		var autoMute = getAttr( 'autoMute' );
		if( autoMute ){
			setTimeout(function(){
				embedPlayer.toggleMute( true );
			},300);
			// autoMute should only happen once per session:
			embedPlayer.setKalturaConfig( '', 'autoMute', null );
		}
		// Check for loop:
		var loop = getAttr( 'loop' );
		if( loop ){
			embedPlayer.loop = true;
		}

		// Check if errors / alerts should be displayed:
		if( getAttr( 'disableAlerts' ) ){
			mw.setConfig('EmbedPlayer.ShowPlayerAlerts', false );
		}

		var mediaProxy = embedPlayer.getKalturaConfig('mediaProxy');
		// handle mediaProxy properties
		if ( mediaProxy ){
			// check for preferedFlavorBR
			var preferedFlavorBR = mediaProxy.preferedFlavorBR;
			// Check for dissable bit rate cookie and overide default bandwidth
			if( getAttr( 'disableBitrateCookie' ) && preferedFlavorBR ){
				embedPlayer.setCookie( 'EmbedPlayer.UserBandwidth', preferedFlavorBR * 1000 );
			}
			// always set perfered bitrate if defined:
			if( preferedFlavorBR && embedPlayer.mediaElement ){
				embedPlayer.mediaElement.preferedFlavorBR = preferedFlavorBR * 1000;
			}

			// Check for mediaPlayFrom
			// first check in hash
			var mediaPlayFrom = kWidget.getHashParam("t");
			if ( mediaPlayFrom ){
				mediaPlayFrom = kWidget.npt2seconds(mediaPlayFrom);
			}
			// now cheeck in Flashvars - will override hash params
			if (mediaProxy.mediaPlayFrom){
				mediaPlayFrom = mediaProxy.mediaPlayFrom;
			}
			if (mediaPlayFrom && !embedPlayer.startTime) {
				embedPlayer.startTime = parseFloat( mediaPlayFrom );
				mw.setConfig( "Kaltura.UseAppleAdaptive" , true) ;
			}
			// Check for mediaPlayTo
			var mediaPlayTo = mediaProxy.mediaPlayTo;
			if (mediaPlayTo && !embedPlayer.pauseTime) {
				embedPlayer.pauseTime = parseFloat( mediaPlayTo );
			}
		}

		// Enable tooltips
		if( getAttr('enableTooltips') === false ){
			embedPlayer.enableTooltips = false;
		}

		// Check for imageDefaultDuration
		var imageDuration = getAttr( 'imageDefaultDuration' );
		if( imageDuration ){
			$( embedPlayer ).data('imageDuration', imageDuration);
		}



		// Should we show ads on replay?
		if( getAttr( 'adsOnReplay' ) ) {
			embedPlayer.adsOnReplay = true;
		}

		// Should we hide the spinner?
		if( getAttr( 'disablePlayerSpinner' ) ) {
			mw.setConfig('LoadingSpinner.Disabled', true );
		}
		var streamerType = embedPlayer.getKalturaConfig( null, 'streamerType' );
		if ( embedPlayer.kalturaContextData && streamerType == 'auto' ) {
			embedPlayer.streamerType = embedPlayer.kalturaContextData.streamerType;
		} else if ( streamerType ) {
			embedPlayer.streamerType = streamerType;
		}
		// restore the original streamerType Flashvar for future use if the user change media (for example - playlist)
		embedPlayer.setFlashvars( 'streamerType', _this.originalStreamerType);
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
			// Some IE out of order issue? has us re-checking player config here
			if( window.kalturaIframePackageData.playerConfig ){
				embedPlayer.playerConfig =  window.kalturaIframePackageData.playerConfig;
				delete( window.kalturaIframePackageData.playerConfig );
			}
		}

		var plugins =  embedPlayer.playerConfig['plugins'];
		var returnConfig = {};

		// ConfPrefix is the plugin Name and the first letter should always be lower case.
		if( confPrefix && confPrefix[0] ){
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
		} else if( !confPrefix && attr ){
			returnConfig[ attr ] = embedPlayer.playerConfig['vars'][attr]
		} else {
			return undefined;
		}
		
		return returnConfig;
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
	getEntryIdSourcesFromApi:  function( embedPlayer, entryId, callback ){
		var _this = this;
		var sources;
		mw.log( "KWidgetSupport:: getEntryIdSourcesFromApi: w:" + embedPlayer.kwidgetid + ' entry:' + embedPlayer.kentryid );
		this.kClient = mw.kApiEntryLoader({
			'widget_id': embedPlayer.kwidgetid,
			'entry_id': entryId
		}, function( playerData ){
			// Check access control
			if( playerData.contextData ){
				var acStatus = _this.getAccessControlStatus( playerData.contextData, embedPlayer );
				if( acStatus !== true ){
					callback( acStatus );
					return ;
				}
			}
			// see if we are dealing with an image asset ( no flavor sources )
			if( playerData.meta && playerData.meta.mediaType == 2 ){
				sources = [{
						'src' : _this.getKalturaThumbnailUrl({
							url: playerData.meta.thumbnailUrl,
							width:  embedPlayer.getWidth(),
							height: embedPlayer.getHeight()
						}),
						'type' : 'image/jpeg'
					}];
			} else {
				// Get device sources
				sources = _this.getEntryIdSourcesFromPlayerData( embedPlayer.kpartnerid, playerData );
			}
			// Return the valid source set
			callback( sources );
		});
	},
	/**
	 * Sets up variables and issues the mw.kEntryLoader call
	 */
	loadPlayerData: function( embedPlayer, callback ){
		var _this = this;
		var playerRequest = {};
		// Check for widget id
		if( ! embedPlayer.kwidgetid ){
			mw.log( "Error: missing required widget paramater ( kwidgetid ) ");
			callback( false );
			return ;
		} else {
			playerRequest.widget_id = embedPlayer.kwidgetid;
		}

		// Check if the entryId is of type url:
		if( !this.checkForUrlEntryId( embedPlayer ) && embedPlayer.kentryid ){
			// Add entry_id playerLoader call
			playerRequest.entry_id =  embedPlayer.kentryid;
		}

		// Add the flashvars
		playerRequest.flashvars = embedPlayer.getFlashvars();

		// Add features
		playerRequest.features = kalturaIframePackageData.apiFeatures;

		// Set KS from flashVar
		this.kClient = mw.kApiGetPartnerClient( playerRequest.widget_id );
		this.kClient.setKs( embedPlayer.getFlashvars( 'ks' ) );

		// Check for playlist cache based
		if( window.kalturaIframePackageData && window.kalturaIframePackageData.playlistResult ){
			var pl = window.kalturaIframePackageData.playlistResult;
			for( var plId in pl ) break;
			if( pl[plId].content.indexOf('<?xml') === 0 ){
				// convert to comma seperated entries
				var entryList = [];
				for( var i in pl[plId].items ){
					entryList.push( pl[plId].items[i].id );
				}
				pl[plId].content = entryList.join(',');
			}
			embedPlayer.kalturaPlaylistData = pl;
			delete( window.kalturaIframePackageData.playlistResult );
		}

		// Check for entry cache:
		if( window.kalturaIframePackageData && window.kalturaIframePackageData.entryResult ){
			var entryResult =  window.kalturaIframePackageData.entryResult

			this.handlePlayerData( embedPlayer, entryResult );
			callback( entryResult );
			// remove the entryResult from the payload
			delete( window.kalturaIframePackageData.entryResult );
			return ;
		}
		// Run the request:
		this.kClient = mw.kApiEntryLoader( playerRequest, function( playerData ){
			_this.handlePlayerData(embedPlayer, playerData );
			callback( playerData );
		});
	},
	/**
	 * handle player data mappings to embedPlayer
	 */
	handlePlayerData: function(embedPlayer, entryResult ){
		// Set entry id and partner id as soon as possible
		if( entryResult.meta && entryResult.meta.id ) {
			embedPlayer.kentryid = entryResult.meta.id;
			embedPlayer.kpartnerid = entryResult.meta.partnerId;
		}

		// Error handling
		var errObj = null;
		if( entryResult.meta &&  entryResult.meta.code == "INVALID_KS" ){
			errObj = embedPlayer.getKalturaMsgObject( "NO_KS" );
		}
		if( entryResult.error ) {
			errObj = embedPlayer.getKalturaMsgObject( 'GENERIC_ERROR' );
			errObj.message = entryResult.error;
		}
		if( errObj ) {
			embedPlayer.hideSpinner();
			embedPlayer.setError( errObj );
		}
		if (entryResult.entry && entryResult.entry.manualProvider){
			mw.setConfig("manualProvider",true);
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
			return embedPlayer.getKalturaMsgObject( 'UNAUTHORIZED_COUNTRY' );
		}
		if( ac.isScheduledNow === 0 ){
			return embedPlayer.getKalturaMsgObject( 'OUT_OF_SCHEDULING' );
		}
		if( ac.isIpAddressRestricted ) {
			return embedPlayer.getKalturaMsgObject( 'UNAUTHORIZED_IP_ADDRESS' );
		}
		if( ac.isSessionRestricted && ac.previewLength === -1 ){
			return embedPlayer.getKalturaMsgObject( 'NO_KS' );
		}
		if( ac.isSiteRestricted ){
			return embedPlayer.getKalturaMsgObject( 'UNAUTHORIZED_DOMAIN' );
		}
		// This is normally handled at the iframe level, but check is included here for completeness
		if( ac.isUserAgentRestricted ){
			return embedPlayer.getKalturaMsgObject( 'USER_AGENT_RESTRICTED' );
		}
		// New AC API
		if( ac.accessControlActions && ac.accessControlActions.length ) {
			var msgObj = embedPlayer.getKalturaMsgObject( 'GENERIC_ERROR' );
			var err = false;
			$.each( ac.accessControlActions, function() {
				if( this.type == 1 ) {
					msgObj.message = '';
					if( ac.accessControlMessages && ac.accessControlMessages.length ) {
						$.each( ac.accessControlMessages, function() {
							msgObj.message += this.value + '\n';
							err = true;
						});
					} else {
						msgObj = embedPlayer.getKalturaMsgObject( 'NO_KS' );
						err = true;
					}
				}
			});

			if( err ) {
				return msgObj;
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
	addSources: function( embedPlayer, sources ){
		$.each(sources, function( inx, source){
			embedPlayer.mediaElement.tryAddSource( 
				$('<source />')
				.attr( source )
				.get( 0 )
			);
		});
	},
	/**
	* Convert flavorData to embedPlayer sources
	*
	* @param {Object} embedPlayer Player object to apply sources to
	* @param {Object} flavorData Function to be called once sources are ready
	*/
	addFlavorSources: function( embedPlayer, playerData ) {
		var _this = this;
		//mw.log( 'KWidgetSupport::addEntryIdSources:');
		// Check if we already have sources with flavorid info
		var sources = embedPlayer.mediaElement.getSources();
		if( sources[0] && sources[0]['data-flavorid'] ){
			return ;
		}
		// Else get sources from flavor data :
		var flavorSources = _this.getEntryIdSourcesFromPlayerData( embedPlayer.kpartnerid, playerData );
		embedPlayer.kalturaFlavors = flavorSources;
		// Check for prefered bitrate info
		var preferedBitRate = embedPlayer.evaluate('{mediaProxy.preferedFlavorBR}' );

		var flashvarsPlayMainfestParams = this.getPlayMainfestParams( embedPlayer );
		// Add all the sources to the player element:
		var qp = '';
		for( var i=0; i < flavorSources.length; i++) {
			var source = flavorSources[i];
			// if we have a prefred bitrate and source type is adaptive append it to the requets url:
			if( preferedBitRate && source.type == 'application/vnd.apple.mpegurl' ){
				qp = ( source.src.indexOf('?') === -1) ? '?' : '&';
				source.src = source.src + qp +  'preferredBitrate=' + preferedBitRate;
			}

			if ( source['disableQueryString'] ) {
				var mParams =  this.getPlayMainfestParams( embedPlayer, true );
				if ( mParams != '' ) {
					var index = source.src.lastIndexOf( '/a.' );
					source.src = source.src.substring( 0, index ) + '/' + mParams  + source.src.substring( index ) ;
				}

			} else {
				// add any flashvar based playManifest params
				qp = ( source.src.indexOf('?') === -1) ? '?' : '&';
				source.src = source.src +  qp + flashvarsPlayMainfestParams;
			}

			mw.log( 'KWidgetSupport:: addSource::' + embedPlayer.id + ' : ' +  source.src + ' type: ' +  source.type);
			var sourceElm = $('<source />')
				.attr( source )
				.get( 0 );
			// Add it to the embedPlayer
			embedPlayer.mediaElement.tryAddSource( sourceElm );
		}
	},
	getPlayMainfestParams: function( embedPlayer, disableQueryString ){
		var p = '';
		var and = '';
		var equalDelimiter = '=';
		var andDelimiter = '&';
		if ( disableQueryString ) {
			andDelimiter = equalDelimiter = '/';
		}
		var urlParms = ["deliveryCode", "storageId", "maxBitrate", "playbackContext", "seekFrom", "clipTo" ];
		$.each( urlParms, function( inx, param ){
			if( embedPlayer.getFlashvars( param ) ){
				 p += and + param + equalDelimiter + embedPlayer.getFlashvars( param );
				 and = andDelimiter;
			}
		});

		p += and + 'uiConfId' + equalDelimiter + embedPlayer.kuiconfid;
		return p;
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
	getBaseFlavorUrl: function(partnerId) {
		if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
			return mw.getConfig('Kaltura.ServiceUrl') + '/p/' + partnerId +
					'/sp/' +  partnerId + '00/playManifest';
		} else {
			return mw.getConfig('Kaltura.CdnUrl') + '/p/' + partnerId +
					'/sp/' +  partnerId + '00/flvclipper';
		}
	},
	/**
	 * Get client entry id sources:
	 * @param {string} partnerId Used to build asset urls
	 * @param {object} playerData The flavor data object
	 */
	getEntryIdSourcesFromPlayerData: function( partnerId, playerData ){
		var _this = this;

		if( !playerData.contextData || ( playerData.contextData && !playerData.contextData.flavorAssets )){
			mw.log("Error: KWidgetSupport: contextData.flavorAssets is not defined ");
			return ;
		}
		var flavorData = playerData.contextData.flavorAssets;

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
		var flavorUrl = _this.getBaseFlavorUrl(partnerId);

		// Flag that indecate if we have H264 flavor
		var hasH264Flavor = false;
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
				'data-aspect' : sourceAspect, // not all sources have valid aspect ratios
				'data-tags': asset.tags,
				'data-assetid': asset.id
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
				source['type'] = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2';
				hasH264Flavor = true;
			}

			// Check for iPhone src
			if( $.inArray( 'iphone', tags ) != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPhone';
				source['type'] = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2';
				hasH264Flavor = true;
			}

			//if we have mbr flavours and we're not in mobile device add it to the playable
			if (( $.inArray( 'mbr', tags ) != -1 || $.inArray( 'web' ,tags ) != -1 ) &&
				$.isEmptyObject(source['src']) &&
				!mw.isMobileDevice() &&
				asset.fileExt )
			{
				if ( asset.fileExt.toLowerCase() == 'mp4' ) {
					source['src'] = src + '/a.mp4';
					source['type'] = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2';
					hasH264Flavor = true;
				} else if ( asset.fileExt.toLowerCase() == 'flv' ) {
					source['src'] = src + '/a.flv';
					source['type'] = 'video/x-flv';
				}

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
					|| // some ingestion systems give "webm"
					( asset.containerFormat.toLowerCase() == 'webm' )
				)
			){
				source['src'] = src + '/a.webm';
				source['data-flavorid'] = 'webm';
				source['type'] = 'video/webm; codecs="vp8, vorbis';
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

			if ( asset.fileExt && asset.fileExt == 'wvm'){
				source['src'] = src + '/a.wvm';
				source['data-flavorid'] = 'wvm';
				source['type'] = 'video/wvm';
				source['disableQueryString'] = true;
			} 

			if ( asset.tags && asset.tags == 'kontiki'){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'kontiki';
				source['type'] = 'video/kontiki';
			}

			if ( asset.tags && asset.tags.indexOf( 'ism_manifest' ) !=-1 ) {
				src = src.replace( "/format/url/", "/format/sl/" );
				source['src'] = src + '/a.ism';
				source['data-flavorid'] = 'ism';
				if ( asset.tags.indexOf( 'playready' ) != -1 ) {
					source['type'] = 'video/playreadySmooth';
				} else {
					source['type'] = 'video/ism';
				}
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
			//mw.log( "KWidgetSupport:: set aspect for: " + source['data-flavorid'] + ' = ' + source['data-aspect'] );
		}

		// Only add flavor sources if no appleMBR flavor exists and Kaltura.UseFlavorIdsUrls
		if( mw.getConfig('Kaltura.UseFlavorIdsUrls') && mw.getConfig('Kaltura.UseAppleAdaptive')
			&& $.grep(deviceSources, function( a ){
				if( a['data-flavorid'] == 'AppleMBR' ){
					return true;
				}
			}).length  == 0
		) {
			// We only need single HLS stream
			var addedHlsStream = false;
			var validClipAspect = this.getValidAspect( deviceSources );
			// Check if mobile device media query
			if ( mw.isMobileDevice() && mw.isDeviceLessThan480P() && iphoneAdaptiveFlavors.length ) {
				// Add "iPhone" HLS flavor
				deviceSources.push({
					'data-aspect' : validClipAspect,
					'data-flavorid' : 'iPhoneNew',
					'type' : 'application/vnd.apple.mpegurl',
					'src' : flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
				});
				addedHlsStream = true;
			} else if( ipadAdaptiveFlavors.length ) {
				// Add "iPad" HLS flavor
				deviceSources.push({
					'data-aspect' : validClipAspect,
					'data-flavorid' : 'iPadNew',
					'type' : 'application/vnd.apple.mpegurl',
					'src' : flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
				});
			}
		}
		this.removedAdaptiveFlavors = false;
		// Apple adaptive streaming is broken for short videos
		// remove adaptive sources if duration is less then 10 seconds,
		if( playerData.meta.duration < 10 ) {
			deviceSources = this.removeAdaptiveFlavors( deviceSources );
		}

		// Remove adaptive sources when in playlist and playing audio entry - Causes player to freeze
		if( !this.removedAdaptiveFlavors && mw.getConfig( 'playlistAPI.kpl0Url' ) && playerData.meta && playerData.meta.mediaType == 5 ) {
			deviceSources = this.removeAdaptiveFlavors( deviceSources );
		}

		// Prefer H264 flavor over HLS on Android
		if( !this.removedAdaptiveFlavors && mw.isAndroid() && hasH264Flavor && !mw.getConfig( 'Kaltura.LeadHLSOnAndroid' ) ) {
			deviceSources = this.removeAdaptiveFlavors( deviceSources );
		}

		//TODO: Remove duplicate webm and h264 flavors
		/*if (mw.EmbedTypes.getMediaPlayers().isSupportedPlayer( 'h264Native' ) && mw.EmbedTypes.getMediaPlayers().isSupportedPlayer( 'webmNative' )) {
			//remove someone if duplicate
		}*/

		// Append KS to all source if available
		// Get KS for playManifest URL ( this should run synchronously since ks should already be available )
		var ks = this.kClient.getKs();

		var ksStr = '';
		var ksQueryString = '';

		if (ks){
			var manifestKs = _this.fixPlaymanifestParam( ks );
			ksStr = '/ks/' + manifestKs;
			ksQueryString = '&ks=' + manifestKs;
		}

		var referrer =   _this.fixPlaymanifestParam( base64_encode( _this.getHostPageUrl() ) );
		var nativeVersion = mw.getConfig("nativeVersion");
		nativeVersion = (nativeVersion != null && nativeVersion.length > 0) ? '_' + nativeVersion : '';
		var clientTag = 'html5:v' + window[ 'MWEMBED_VERSION' ] + nativeVersion;
		$.each( deviceSources, function(inx, source){
			if ( deviceSources[inx]['disableQueryString'] == true ) {
				var index = deviceSources[inx]['src'].lastIndexOf('/a.');
				deviceSources[inx]['src'] = deviceSources[inx]['src'].substring(0, index) + ksStr +
					'/referrer/' + referrer +
					'/clientTag/' + clientTag +
					deviceSources[inx]['src'].substring(index) ;
			} else {
				deviceSources[inx]['src'] = deviceSources[inx]['src'] +
					'?referrer=' + referrer + ksQueryString +
					'&clientTag=' + clientTag;
			}
		});
		
		return deviceSources;
	},
	/**
	 *  "/" and "+" are valid base64 chars. They might break playmanifest URL so we replace them to "_" and "-" accordingly.
	 *  There is a server side code that replaces the string back to the original value
	 * @param value
	 */
	fixPlaymanifestParam: function( value ) {
		return value.replace(/\+/g, "-").replace(/\//g, "_");
	},
	removeAdaptiveFlavors: function( sources ){
		for( var i =0 ; i < sources.length; i++ ){
			if( sources[i].type == 'application/vnd.apple.mpegurl' ){
				// Remove the current source:
				sources.splice( i, 1 );
				i--;
			}
		}
		this.removedAdaptiveFlavors = true;
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
		}
		// Always return a valid apsect ( assume default aspect if none is found )
		var aspectParts = mw.getConfig( 'EmbedPlayer.DefaultSize' ).split( 'x' );
		return  Math.round( ( aspectParts[0] / aspectParts[1]) * 100 ) / 100;
	},
	/**
	 * Add livestream source to the mediaElement
	 * @param embedPlayer
	 * @param entry
	 * @param isFlash should be played in Flash player
	 * @param isSilverlight should be played in Silverlight player
	 * @param streamerType
	 * @param callback
	 */
	addLiveEntrySource: function( embedPlayer, entry, isFlash, isSilverlight, streamerType, callback ) {
		var _this = this;
		var extension;
		var mimeType;
		var format = streamerType;
		var protocol;
		if ( isFlash ) {
			extension = 'f4m';
			embedPlayer.setFlashvars( 'streamerType', streamerType );
			protocol = 'rtmp';
			if ( embedPlayer.kalturaContextData ) {
				protocol = embedPlayer.kalturaContextData.mediaProtocol;
			}
			mimeType = 'video/live';
		} else if ( isSilverlight ) {
			extension = 'f4m';
			protocol = 'http';
			mimeType = 'video/multicast';

		} else {
			embedPlayer.setFlashvars( 'streamerType', 'http' );
			extension = 'm3u8';
			protocol = 'http';
			mimeType = 'application/vnd.apple.mpegurl';
		}

		var srcUrl = this.getBaseFlavorUrl(entry.partnerId) + '/entryId/' + entry.id + '/format/' + format + '/protocol/' + protocol + '/uiConfId/' + embedPlayer.kuiconfid +  '/a.' + extension;
		// Append KS & Referrer
		function getKs() {
			srcUrl += '?referrer=' + base64_encode( _this.getHostPageUrl() );
			var deferred = $.Deferred();
			var ks = _this.kClient.getKs();
			if( ks ){
				srcUrl += '&ks=' + ks;
			}
			deferred.resolve();
			return deferred.promise();
		}
		//add source
		function addSource() {
			var deferred = $.Deferred();
			function callAddSource( url ) {
				mw.log( 'KWidgetSupport::addLiveEntrySource: Add Live Entry Source - ' + url );
				embedPlayer.mediaElement.tryAddSource(
					$('<source />')
						.attr({
							'src' : url,
							'type' : mimeType
						})[0]
				);
				deferred.resolve();
			}

			callAddSource( srcUrl );
			return deferred.promise();
		}
		getKs().then(addSource).then(function() {
			if ( callback ) {
				callback();
			}
		});
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
	},
	getKalturaThumbnailUrl: function( thumb ) {
		if( ! thumb.url ){
			return mw.getConfig( 'EmbedPlayer.BlackPixel' );
		}
		var thumbUrl = thumb.url;
		// Only append width/height params if thumbnail from kaltura service ( could be external thumbnail )
		if( thumbUrl.indexOf( "thumbnail/entry_id" ) != -1 ){

			if( mw.getConfig('EmbedPlayer.ShowOriginalPoster') ){
				thumbUrl += '/width/0/height/0';
			} else {
				thumbUrl += '/width/' + thumb.width + '/height/' + thumb.height;
			}
		}
		return thumbUrl;
	},
	getFunctionByName: function( functionName, context /*, args */) {
		try {
			var args = Array.prototype.slice.call(arguments).splice(2);
			var namespaces = functionName.split(".");
			var func = namespaces.pop();
			for(var i = 0; i < namespaces.length; i++) {
				context = context[namespaces[i]];
			}
			return context[func];
		} catch( e ){
			mw.log("kWidgetSupport::executeFunctionByName: Error could not find function: " + functionName + ' error: ' + e);
			return false;
		}
	}
};

//Setup the kWidgetSupport global if not already set
if( !window.kWidgetSupport ){
	window.kWidgetSupport = new mw.KWidgetSupport();
}

/**
 * Register a global shortcuts for the Kaltura sources query
 */
mw.getEntryIdSourcesFromApi = function( embedPlayer, entryId, callback ){
	kWidgetSupport.getEntryIdSourcesFromApi( embedPlayer, entryId, callback);
};

})( window.mw, jQuery );
