mw.KWidgetSupport = function( options ) {
	// Create KWidgetSupport instance
	return this.init( options );
};
mw.KWidgetSupport.prototype = {

	// The Kaltura client local reference
	kClient : null,
	
	// Constructor check settings etc
	init: function( options ){
		if( options ){
			$j.extend( this, options);
		}
		this.addPlayerHooks();
	},
	
	/**
	* Add Player hooks for supporting Kaltura api
	*/ 
	addPlayerHooks: function( ){
		var _this = this;	
		// Add the hooks to the player manager
		$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
			// Add hook for check player sources to use local kEntry ID source check:
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
				_this.loadAndUpdatePlayerData( embedPlayer, callback );
			});
			// Add kaltura iframe share support:
			$j( embedPlayer ).bind( 'GetShareIframeSrc', function(event, callback){
				callback( mw.getConfig('Kaltura.ServiceUrl') + '/p/' + _this.kClient.getPartnerId() +
						'/embedIframe/entry_id/' + embedPlayer.kentryid +
						'/uiconf_id/' + embedPlayer.kuiconfid );
			});
		});
	},
	
	/**
	 * Load and bind embedPlayer from kaltura api entry request
	 * @param embedPlayer
	 * @param callback
	 */
	loadAndUpdatePlayerData: function( embedPlayer, callback ){
		var _this = this;
		// Load all the player configuration from kaltura: 
		_this.loadPlayerData( embedPlayer, function( playerData ){
			if( !playerData ){
				mw.log("KWidgetSupport::addPlayerHooks> error no player data!");
				callback();
				return ;
			}
			_this.updatePlayerData( embedPlayer, playerData, callback );
		});
	},
	
	updatePlayerData:function( embedPlayer,  playerData, callback ){
		var _this = this;
		// Check for uiConf	and attach it to the embedPlayer object:
		if( playerData.uiConf ){
			// Store the parsed uiConf in the embedPlayer object:
			embedPlayer.$uiConf = $j( playerData.uiConf );
			
			// Set any global configuration present in custom variables of the playerData
			embedPlayer.$uiConf.find( 'uiVars var' ).each( function( inx, customVar ){
				if( $j( customVar ).attr('key') &&  $j( customVar ).attr('value') ){
					var cVar = $j( customVar ).attr('value');
					// String to boolean: 
					cVar = ( cVar === "false" ) ? false : cVar;
					cVar = ( cVar === "true" ) ? true : cVar;
					
					mw.log("KWidgetSupport::addPlayerHooks> Set Global Config:  " + $j( customVar ).attr('key') + ' ' + cVar );
					mw.setConfig(  $j( customVar ).attr('key'), cVar);
				}
			});
		}
		
		// Check access controls ( this is kind of silly and needs to be done on the server ) 
		if( playerData.accessControl ){
			var acStatus = _this.getAccessControlStatus( playerData.accessControl );
			if( acStatus !== true ){
				$j('.loadingSpinner').remove();
				embedPlayer.showErrorMsg( acStatus );
				return ;
			}
			// Check for preview access control and add special onEnd binding: 
			if( playerData.accessControl.preview && playerData.accessControl.previewLength != -1 ){
				$j( embedPlayer ).bind('ended.acpreview', function(){
					mw.log( 'KWidgetSupport:: ended.acpreview>' );
					// Don't run normal onend action: 
					embedPlayer.onDoneInterfaceFlag = false;
					var closeAcMessage = function(){
						$j( embedPlayer ).unbind('ended.acpreview');
						embedPlayer.stop();
						embedPlayer.onClipDone();
					};
					// Display player dialog 
					// TODO i8ln!!
					embedPlayer.controlBuilder.displayMenuOverlay(
						$j('<div />').append( 
							$j('<h3 />').append( 'Free preview completed, need to purchase'),
							$j('<span />').text( 'Access to the rest of the content is restricted' ),
							$j('<br />'),$j('<br />'),
							$j('<button />').attr({'type' : "button" })
							.addClass( "ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" )
							.append( 
								$j('<span />').addClass( "ui-button-text" )
								.text( 'Ok' )
								.css('margin', '10')
							).click( closeAcMessage )
						), closeAcMessage
					);
				});
			}
		}

		// Add kaltura analytics if we have a session if we have a client ( set in loadPlayerData )
		if( mw.getConfig( 'Kaltura.EnableAnalytics' ) === true && _this.kClient ) {
			mw.addKAnalytics( embedPlayer, _this.kClient );
		}
		
		// Apply player Sources
		if( playerData.flavors ){
			_this.addFlavorSources( embedPlayer, playerData.flavors );
		}
		mw.log("KWidgetSupport:: check for meta:");
		
		// Add any custom metadata:
		if( playerData.entryMeta ){
			embedPlayer.kalturaEntryMetaData = playerData.entryMeta;
		}

		// Apply player metadata
		if( playerData.meta ) {
			embedPlayer.duration = playerData.meta.duration;
			// We have to assign embedPlayer metadata as an attribute to bridge the iframe
			embedPlayer.kalturaPlayerMetaData = playerData.meta;
			$j( embedPlayer ).trigger( 'KalturaSupport_MetaDataReady', embedPlayer.kalturaPlayerMetaData );
		}

		// TODO: Remove this when Eagle is out
		if( mw.getConfig( 'Kaltura.TempCuePoints' ) ) {
			playerData.entryCuePoints = mw.getConfig( 'Kaltura.TempCuePoints' );
		}
		// End Remove
		if( playerData.entryCuePoints ) {
			mw.log( "KCuePoints:: Add CuePoints to embedPlayer");
			embedPlayer.entryCuePoints = playerData.entryCuePoints;
			new mw.KCuePoints( embedPlayer );

			// Allow other plugins to subscribe to cuePoint ready event:
			$( embedPlayer ).trigger( 'KalturaSupport_CuePointsReady', embedPlayer.entryCuePoints );
		}

		if( embedPlayer.$uiConf ){
			// Trigger the check kaltura uiConf event					
			$j( embedPlayer ).triggerQueueCallback( 'KalturaSupport_CheckUiConf', embedPlayer.$uiConf, function(){	
				mw.log("KWidgetSupport::KalturaSupport_CheckUiConf callback");
				// Ui-conf file checks done
				callback();
			});
		} else {
			callback();
		}
	},
	/**
	 * Check for xml config, let flashvars override  
	 * @param {Object} $uiConf jQuery object xml to look for plugin attributes
	 * @param {Object} $uiConf jQuery object xml to look for plugin attributes
	 */
	getPluginConfig: function( embedPlayer, $uiConf, pluginName, attr ){
		var singleAttrName = false;
		if( typeof attr == 'string' ){
			singleAttrName = attr;
			attr = $j.makeArray( attr );
		}

		var config = {};
		var $plugin = $uiConf.find( 'plugin#' + pluginName );
		var $uiPluginVars = $uiConf.find( 'var[key^="' + pluginName + '"]' );
		// @@TODO the iframe really should apply the "data" instead of this hacky merge here:
		var fv = mw.getConfig( 'KalturaSupport.IFramePresetFlashvars' );
		// Check for embedPlayer flashvars ( will overwrite iframe values if present )
		if( $j( embedPlayer ).data('flashvars' ) ){
			fv = $j( embedPlayer ).data('flashvars' );
		}
		$j.each( attr, function(inx, attrName ){
			if( $plugin.attr( attrName ) ){
				config[attrName] = $plugin.attr( attrName );
			}
			// XML sometimes comes in all lower case
			if( $plugin.attr( attrName.toLowerCase() ) ){
				config[attrName] = $plugin.attr( attrName.toLowerCase() );
			}
			
			// Check flashvars overrides
			if( fv[ pluginName + '.' + attrName ] ){
				config[ attrName ] = fv[ pluginName + '.' + attrName ];
			}
			// Check for "flat plugin vars" stored at the end of the uiConf ( instead of as attributes )"
			$uiPluginVars.each( function(inx, node){
				if( $j( node ).attr('key') == pluginName + '.' + attrName ){
					if( $j(node).attr('overrideflashvar') != "false" || ! config[attrName] ){
						config[attrName] = $j(node).get(0).getAttribute('value');
					}
					// found break out of loop
					return false;
				}
			});
		
			// Convert string to boolean 
			if( config[ attrName ] === "true" )
				config[ attrName ] = true;
			if( config[ attrName ] === "false" )
				config[ attrName ] = false; 
		});
		if( singleAttrName != false ){
			return config[ singleAttrName ];
		} else {
			return config;
		}
	},
	/**
	 * Alternate source grabbing script ( for cases where we need to hot-swap the source ) 
	 * playlists on iPhone for example we can't re-load the player we have to just switch the src. 
	 * 
	 * accessible via static reference mw.getEntryIdSourcesFromApi
	 * 
	 */
	getEntryIdSourcesFromApi:  function( widgetId, entryId, callback ){
		var _this = this;
		mw.log( "KWidgetSupport:: getEntryIdSourcesFromApi: w:" + widgetId + ' entry:' + entryId );
		this.kClient = mw.KApiPlayerLoader( {
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
			// Get device sources 
			var deviceSources = _this.getEntryIdSourcesFromFlavorData( _this.kClient.getPartnerId(), playerData.flavors );
			var sources = _this.getSourcesForDevice( deviceSources );
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
			mw.log( "Error: missing required widget paramater");
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
		
		// Add the uiconf_id 
		playerRequest.uiconf_id = this.getUiConfId( embedPlayer );

		// Add the flashvars
		playerRequest.flashvars = $j( embedPlayer ).data( 'flashvars' ); 
		
		// Check if we have the player data bootstrap from the iframe
		var bootstrapData = mw.getConfig("KalturaSupport.IFramePresetPlayerData");

		// Insure the bootStrap data has all the required info: 
		if( bootstrapData 
			&& bootstrapData.partner_id == embedPlayer.kwidgetid.replace('_', '')
			&&  bootstrapData.ks
		){
			mw.log( 'KWidgetSupport::loaded player data from KalturaSupport.IFramePresetPlayerData config' );
			// Clear bootstrap data from configuration: 
			mw.setConfig("KalturaSupport.IFramePresetPlayerData" , null);
			this.kClient = mw.kApiGetPartnerClient( playerRequest.widget_id );
			this.kClient.setKS( bootstrapData.ks );
			callback( bootstrapData );
		} else {
			// Run the request: ( run async to avoid function call stack overflow )
			setTimeout(function(){
				_this.kClient = mw.KApiPlayerLoader( playerRequest, function( playerData ){
					if( playerData.flavors &&  playerData.flavors.code == "INVALID_KS" ){
						$j('.loadingSpinner').remove();
						$j(embedPlayer).replaceWith( "Error invalid KS" );
						return ;
					}
					callback( playerData );
				});
			}, 1);
		}
	},
	
	/**
	 * Check if the access control is oky and set a given error message
	 * 
	 * NOTE should match the iframe messages
	 * NOTE need to i8ln message with gM( 'msg-key' );
	 * 
	 * @return 
	 * @type boolean 
	 * 		true if the media can be played
	 * 		false if the media should not be played. 
	 */
	getAccessControlStatus: function( ac ){
		if( ac.isAdmin){
			return true;
		}
		if( ac.isCountryRestricted ){
			return 'country is restricted';
		}
		if( ac.isScheduledNow === 0 ){
			return 'is not scheduled now';
		}
		if( ac.isSessionRestricted && ac.previewLength === -1 ){
			return 'session restricted';
		}
		if( ac.isSiteRestricted ){
			return 'site restricted';
		}
		return true;
	},
	
	/**
	 * Get the uiconf id, if unset its the kwidget id / partner id default
	 */
	getUiConfId: function( embedPlayer ){
		var uiConfId = ( embedPlayer.kuiconfid ) ? embedPlayer.kuiconfid : false; 
		if( !uiConfId && embedPlayer.kwidgetid ) {
			uiConfId = embedPlayer.kwidgetid.replace( '_', '' );
		}
		return uiConfId;
	},
	/**
	 * Check if the entryId is a url ( add source and do not include in request ) 
	 */
	checkForUrlEntryId:function( embedPlayer ){
		if( embedPlayer.kentryid 
				&& 
			embedPlayer.kentryid.indexOf('://') != -1 )
		{
			embedPlayer.mediaElement.tryAddSource(
					$j('<source />')
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
	addFlavorSources: function( embedPlayer, flavorData ) {
		var _this = this;
		mw.log( 'KWidgetSupport::addEntryIdSources:');
		// Set the poster ( if not already set ) 
		if( !embedPlayer.poster && embedPlayer.kentryid ){
			embedPlayer.poster = mw.getKalturaThumbUrl({
				'partner_id' : this.kClient.getPartnerId(),
				'entry_id' : embedPlayer.kentryid,
				'width' : embedPlayer.getWidth(),
				'height' :  embedPlayer.getHeight()
			});			
		}
		
		var deviceSources = {};
		// Check existing sources have kaltura specific flavorid attribute ) 
		// NOTE we may refactor how we package in the kaltura pay-load from the iframe 
		var sources = embedPlayer.mediaElement.getSources();
		if( sources[0] && sources[0]['flavorid'] ){
			// Not so clean ... will refactor once we add another source
			for(var i=0; i< sources.length;i++){
				deviceSources[ sources[i]['flavorid'] ] = sources[i].src;
			}
			// Unset existing DOM source children ( so that html5 video hacks work better ) 
			$j('#' + embedPlayer.pid).find('source').remove();
			// Empty the embedPlayers sources ( we don't want iPad h.264 being used for iPhone devices ) 
			embedPlayer.mediaElement.sources = [];
			// Update the set of sources in the embedPlayer ( might cause issues with other plugins ) 
		} else {		
			// Get device flavors ( if not already set )
			deviceSources = _this.getEntryIdSourcesFromFlavorData( this.kClient.getPartnerId(), flavorData );	
		}
		// Update the source list per the current user-agent device: 
		var sources = _this.getSourcesForDevice( deviceSources );
		
		for( var i=0; i < sources.length; i++) {
			mw.log( 'KWidgetSupport:: addSource::' + embedPlayer.id + ' : ' +  sources[i].src + ' type: ' +  sources[i].type);
			embedPlayer.mediaElement.tryAddSource(
				$j('<source />')
				.attr( {
					'src' : sources[i].src,
					'type' : sources[i].type
				} )
				.get( 0 )
			);
		}
	},
	
	/**
	 * Get client entry id sources: 
	 */
	getEntryIdSourcesFromFlavorData: function( partner_id, flavorData ){
		var _this = this;

		if( !flavorData ){
			mw.log("Error: KWidgetSupport: flavorData is not defined ");
			return ;
		}

		var deviceSources = {};
		
		// Setup the src defines
		var ipadFlavors = '';
		var iphoneFlavors = '';

		// Setup flavorUrl
		if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
			var flavorUrl = mw.getConfig('Kaltura.ServiceUrl') + '/p/' + partner_id +
					'/sp/' +  partner_id + '00/playManifest';
		} else {
			var flavorUrl = mw.getConfig('Kaltura.CdnUrl') + '/p/' + partner_id +
				   '/sp/' +  partner_id + '00/flvclipper';
		}

		// Find a compatible stream
		for( var i = 0 ; i < flavorData.length; i ++ ) {
			var asset = flavorData[i];
			var entryId = asset.entryId;

			// if flavor status is not ready - continue to the next flavor
			if( asset.status != 2 ) {
				continue;
			}

			// Check playManifest conditional
			if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){

				var src  = flavorUrl + '/entryId/' + asset.entryId;

				// Check for Apple http streaming
				if( asset.tags.indexOf('applembr') != -1 ) {
					src += '/format/applehttp/protocol/http';
					deviceSources['AppleMBR'] = src + '/a.m3u8';
				} else {
					src += '/flavorId/' + asset.id + '/format/url/protocol/http';
				}

			} else {
				var src  = flavorUrl + '/entry_id/' + asset.entryId + '/flavor/' + asset.id ;
			}

			// Add iPad Akamai flavor to iPad flavor Ids list
			if( asset.fileExt == 'mp4' && asset.tags.indexOf('ipadnew') != -1 ){
				ipadFlavors += asset.id + ',';
			}

			// Add iPhone Akamai flavor to iPad&iPhone flavor Ids list
			if( asset.fileExt == 'mp4' && asset.tags.indexOf('iphonenew') != -1 ){
				ipadFlavors += asset.id + ',';
				iphoneFlavors += asset.id + ',';
			}

			// Check the tags to read what type of mp4 source
			if( asset.fileExt == 'mp4' && asset.tags.indexOf('ipad') != -1 ){
				deviceSources['iPad'] = src + '/a.mp4';
			}

			// Check for iPhone src
			if( asset.fileExt == 'mp4' && asset.tags.indexOf('iphone') != -1 ){
				deviceSources['iPhone'] = src + '/a.mp4';
			}

			// Check for ogg source
			if( asset.fileExt == 'ogg' || asset.fileExt == 'ogv'){
				deviceSources['ogg'] = src + '/a.ogg';
			}

			// Check for webm source
			if( asset.fileExt == 'webm' ){
				deviceSources['webm'] = src + '/a.webm';
			}

			// Check for 3gp source
			if( asset.fileExt == '3gp' ){
				deviceSources['3gp'] = src + '/a.3gp';
			}
		}

		ipadFlavors = ipadFlavors.substr(0, (ipadFlavors.length-1) );
		iphoneFlavors = iphoneFlavors.substr(0, (iphoneFlavors.length-1) );

		// Create iPad flavor for Akamai HTTP
		if(ipadFlavors.length != 0) {
			deviceSources['iPadNew'] = flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadFlavors + '/format/applehttp/protocol/http/a.m3u8';
		}

		// Create iPhone flavor for Akamai HTTP
		if(iphoneFlavors.length != 0) {
			deviceSources['iPhoneNew'] = flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneFlavors + '/format/applehttp/protocol/http/a.m3u8';
		}
		
		// Append KS to all source if available 
		// Get KS for playManifest URL ( this should run synchronously since ks should already be available )
		var ksCheck = false;
		this.kClient.getKS( function( ks ) {
			ksCheck = true;
			$j.each( deviceSources, function(inx, source){
				deviceSources[inx] = deviceSources[inx] + '?ks=' + ks;
			});
		});
		if( !ksCheck ){
			mw.log("Error:: KWidgetSupport: KS not defined in time, streams are missing ks paramter");
		}

		return deviceSources;
	},
	
	getSourcesForDevice: function(  deviceSources ){
		var sources = [];
		var addSource = function ( src, type ){
			sources.push( {
				'src': src,
				'type': type
			} );
		};

		// If on an iPad or iPhone4 use iPad Source
		if( mw.isIpad() || mw.isIphone() || mw.isIpod() ) {
			mw.log( "KwidgetSupport:: Add iOS source");
			// Note it would be nice to detect if the iPhone was on wifi or 3g

			// Check if we like to use iPad flavor for iPad & iPhone4
			var useIpadFlavor = ( mw.isIpad() || mw.isIphone4() );

			// Prefer Apple HTTP streaming
			if( deviceSources['AppleMBR'] ) {
				addSource( deviceSources['AppleMBR'] , 'application/vnd.apple.mpegurl' );
				return sources;
			}
			if( deviceSources['iPadNew'] && useIpadFlavor ){
				mw.log( "KwidgetSupport:: Add iPad Source using Akamai HTTP" );
				addSource( deviceSources['iPadNew'] , 'application/vnd.apple.mpegurl' );
				return sources;
			} else if ( deviceSources['iPhoneNew']) {
				mw.log( "KwidgetSupport:: Add iPhone Source using Akamai HTTP" );
				addSource( deviceSources['iPhoneNew'], 'application/vnd.apple.mpegurl' );
				return sources;
			}

			if( deviceSources['iPad'] && useIpadFlavor ){
				mw.log( "KwidgetSupport:: Add normal iPad source" );
				addSource( deviceSources['iPad'] , 'video/h264' );
				return sources;
			} else if ( deviceSources['iPhone']) {
				mw.log( "KwidgetSupport:: Add normal iPhone source" );
				addSource( deviceSources['iPhone'], 'video/h264' );
				return sources;
			}
		}
		
		// If on iPhone or Android or iPod use iPhone src
		if( ( mw.isIphone() || mw.isAndroid2() || mw.isIpod() ) ){			
			if( deviceSources['iPhone'] ) {
				addSource( deviceSources['iPhone'], 'video/h264' );	
			} else if( deviceSources['3gp'] ){
				addSource( deviceSources['3gp'], 'video/3gp' );	
			}
			return sources;
		} else {
			// use h264 source for flash fallback ( desktop browsers ) 
			mw.log( "KwidgetSupport:: Add from flash h264 fallback" );
			if( deviceSources['iPad'] ) {
				addSource( deviceSources['iPad'], 'video/h264' );
			} else if( deviceSources['iPhone'] ) {
				addSource( deviceSources['iPhone'], 'video/h264' );
			}
		}
		// Add the webm
		if( deviceSources['webm'] ){
			addSource( deviceSources['webm'], 'video/webm' );
		}
		
		// Add the 3gp source if available
		if( deviceSources['3gp'] ){
			addSource( deviceSources['3gp'] );
		}
		
		// Always add the oggSrc if we got to this point
		if( deviceSources['ogg'] ) {
			addSource( deviceSources['ogg'], 'video/ogg' );
		}
		
		return sources;
	}
};

//Setup the kWidgetSupport global if not already set
if( !window.kWidgetSupport ){
	window.kWidgetSupport = new mw.KWidgetSupport();
};

/**
 * Register a global shortcuts for the Kaltura sources query
 */
mw.getEntryIdSourcesFromApi = function( widgetId, entryId, callback ){
	kWidgetSupport.getEntryIdSourcesFromApi( widgetId, entryId, callback);
};

