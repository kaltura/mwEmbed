( function( mw, $ ) {
	
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
			$.extend( this, options);
		}
		this.addPlayerHooks();
	},
	
	/**
	* Add Player hooks for supporting Kaltura api
	*/ 
	addPlayerHooks: function( ){
		var _this = this;	
		// Add the hooks to the player manager
		$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
			// Add hook for check player sources to use local kEntry ID source check:
			$( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
				_this.loadAndUpdatePlayerData( embedPlayer, callback );
			});
			// Add Kaltura iframe share support:
			$( embedPlayer ).bind( 'GetShareIframeSrc', function(event, callback){
				callback( mw.getConfig( 'Kaltura.ServiceUrl' ) + '/p/' + _this.kClient.getPartnerId() +
						'/embedIframe/entry_id/' + embedPlayer.kentryid +
						'/uiconf_id/' + embedPlayer.kuiconfid );
			});
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
			embedPlayer.$uiConf = $( playerData.uiConf );
			
			// Set any global configuration present in custom variables of the playerData
			embedPlayer.$uiConf.find( 'uiVars var' ).each( function( inx, customVar ){
				if( $( customVar ).attr('key') &&  $( customVar ).attr('value') ){
					var cVar = $( customVar ).attr('value');
					// String to boolean: 
					cVar = ( cVar === "false" ) ? false : cVar;
					cVar = ( cVar === "true" ) ? true : cVar;
					
					// mw.log("KWidgetSupport::addPlayerHooks> Set Global Config:  " + $( customVar ).attr('key') + ' ' + cVar );
					mw.setConfig(  $( customVar ).attr('key'), cVar);
				}
			});
		}
		
		// Check access controls ( this is kind of silly and needs to be done on the server ) 
		if( playerData.accessControl ){
			var acStatus = _this.getAccessControlStatus( playerData.accessControl );
			if( acStatus !== true ){
				$( '.loadingSpinner' ).remove();
				embedPlayer.showErrorMsg( acStatus );
				return ;
			}
			// Check for preview access control and add special onEnd binding: 
			if( playerData.accessControl.preview && playerData.accessControl.previewLength != -1 ){
				$( embedPlayer ).bind('ended.acpreview', function(){
					mw.log( 'KWidgetSupport:: ended.acpreview>' );
					// Don't run normal onend action: 
					embedPlayer.onDoneInterfaceFlag = false;
					var closeAcMessage = function(){
						$( embedPlayer ).unbind('ended.acpreview');
						embedPlayer.stop();
						embedPlayer.onClipDone();
					};
					// Display player dialog 
					// TODO i8ln!!
					embedPlayer.controlBuilder.displayMenuOverlay(
						$('<div />').append( 
							$('<h3 />').append( 'Free preview completed, need to purchase'),
							$('<span />').text( 'Access to the rest of the content is restricted' ),
							$('<br />'),$('<br />'),
							$('<button />').attr({'type' : "button" })
							.addClass( "ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" )
							.append( 
								$('<span />').addClass( "ui-button-text" )
								.text( 'Ok' )
								.css('margin', '10')
							).click( closeAcMessage )
						), closeAcMessage
					);
				});
			}
		}

		// Add Kaltura analytics if we have a session if we have a client ( set in loadPlayerData )
		if( mw.getConfig( 'Kaltura.EnableAnalytics' ) === true && _this.kClient ) {
			mw.addKAnalytics( embedPlayer, _this.kClient );
		}
		// Apply player Sources
		if( playerData.flavors ){
			_this.addFlavorSources( embedPlayer, playerData.flavors );
		}
		
		// Check for "image" mediaType ( 2 ) 
		if( playerData.meta && playerData.meta.mediaType == 2 ){ 
			mw.log( 'KWidgetSupport:: add image Source:: ( use poster getter ) ' );
			embedPlayer.mediaElement.tryAddSource(
				$('<source />')
				.attr( {
					'src' : mw.getKalturaThumbUrl({
						'partner_id' : this.kClient.getPartnerId(),
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

		// Add any custom metadata:
		if( playerData.entryMeta ){
			embedPlayer.kalturaEntryMetaData = playerData.entryMeta;
			$( embedPlayer ).trigger( 'KalturaSupport_MetadataReceived', embedPlayer.kalturaEntryMetaData );
		}
		// Apply player metadata
		if( playerData.meta ) {
			embedPlayer.duration = playerData.meta.duration;
			// We have to assign embedPlayer metadata as an attribute to bridge the iframe
			embedPlayer.kalturaPlayerMetaData = playerData.meta;
			$( embedPlayer ).trigger( 'KalturaSupport_EntryDataReady', embedPlayer.kalturaPlayerMetaData );
		}
		if( playerData.entryCuePoints && playerData.entryCuePoints.length > 0 ) {
			mw.log( "KCuePoints:: Added " + playerData.entryCuePoints.length + " CuePoints to embedPlayer");
			embedPlayer.rawCuePoints = playerData.entryCuePoints;
			embedPlayer.kCuePoints = new mw.KCuePoints( embedPlayer );
		}
		embedPlayer.getRawKalturaConfig = function( confPrefix, attr ){
			return _this.getRawPluginConfig( embedPlayer, confPrefix, attr );
		};
		// Add getKalturaConfig to embed player:
		embedPlayer.getKalturaConfig = function( confPrefix, attr ){
			return _this.getPluginConfig( embedPlayer, confPrefix, attr );
		};

		// Add isPluginEnabled to embed player:
		embedPlayer.isPluginEnabled = function( pluginName ) {
			return _this.getPluginConfig( embedPlayer, pluginName, 'plugin');
		};

		// Add getFlashvars to embed player:
		embedPlayer.getFlashvars = function() {
			return $( embedPlayer ).data('flashvars');
		}
		
		// Check for payload based uiConf xml ( as loaded in the case of playlist with uiConf ) 
		if( $(embedPlayer).data('uiConfXml') ){
			embedPlayer.$uiConf = $( embedPlayer ).data('uiConfXml');
		}
		
		// Check for playlist cache based 
		if( playerData.playlistCache ){
			embedPlayer.playlistCache = playerData.playlistCache;
		}	
		
		// Local function to defer the trigger of loaded cuePoints so that plugins have time to load
		// and setup their binding to KalturaSupport_CuePointsReady
		var doneWithUiConf = function(){
			if( embedPlayer.rawCuePoints ){
				// Allow other plugins to subscribe to cuePoint ready event:
				$( embedPlayer ).trigger( 'KalturaSupport_CuePointsReady', embedPlayer.rawCuePoints );
			};
			// Run the DoneWithUiConf trigger ( allows dependency based loaders to include setup code )
			$( embedPlayer ).trigger( 'KalturaSupport_DoneWithUiConf' );
			callback();
		};
		
		if( embedPlayer.$uiConf ){
			_this.baseUiConfChecks( embedPlayer );
			// Trigger the check kaltura uiConf event					
			$( embedPlayer ).triggerQueueCallback( 'KalturaSupport_CheckUiConf', embedPlayer.$uiConf, function(){	
				mw.log("KWidgetSupport::KalturaSupport_CheckUiConf done with all uiConf checks");
				// Ui-conf file checks done
				doneWithUiConf();
			});
		} else {
			doneWithUiConf();
		}
	},
	/**
	 * Run base ui conf / flashvars checks
	 * @param embedPlayer
	 * @return
	 */
	baseUiConfChecks: function( embedPlayer ){
		// Check for autoplay:
		var autoPlay = this.getPluginConfig( embedPlayer, '', 'autoPlay');
		if( autoPlay ){
			embedPlayer.autoplay = true;
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
			attr = $.makeArray( attr );
		}
		var rawConfig = this.getRawPluginConfig( embedPlayer, confPrefix, attr);
		var config =  this.postProcessConfig( embedPlayer, rawConfig );
		
		if( singleAttrName != false ){
			return config[ singleAttrName ];
		} else {
			return config;
		}
	},

	getRawPluginConfig: function( embedPlayer, confPrefix, attr ){
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
			$plugin = $uiConf.find( 'plugin#' + confPrefix );
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
				$.each( $plugin.get(0).attributes, function(i, nodeAttr){
					 config[ nodeAttr.name ] = nodeAttr.value;
				});
			}
			// @@TODO php should give us more structured configuration 
			$.each(flashvars, function( key, val) {
				if( key.indexOf( confPrefix ) === 0 ){
					config[key] = val;
				}
			})
			
			// Check for "flat plugin vars" stored at the end of the uiConf ( instead of as attributes )"
			$uiPluginVars.each( function(inx, node){
				var attrName = $(node).attr('key');
				if( $(node).attr('overrideflashvar') != "false" || ! config[attrName] ){
					config[attrName] = $(node).get(0).getAttribute('value');
				}
				// Found break out of loop
				return false;
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
						if( $(node).attr('overrideflashvar') != "false" || ! config[attrName] ){
							config[attrName] = $(node).get(0).getAttribute('value');
						}
						// Found break out of loop
						return false;
					}
				});
				
			});
		}
		return config;
	},
	postProcessConfig: function(embedPlayer,  config ){
		var _this = this;
		$.each(config, function( attrName, value ) {
			// Unescape values that would come in from flashvars
			if( value ){
				config[ attrName ] = unescape( value );
			}
			// Convert string to boolean 
			if( config[ attrName ] === "true" )
				config[ attrName ] = true;
			if( config[ attrName ] === "false" )
				config[ attrName ] = false; 
			
			// Do any value handling 
			config[ attrName ] = embedPlayer.evaluate( config[ attrName ] );
		});
		
		// Check if disableHTML5 was "true" and return false for the plugin config ( since we are the html5 library ) 
		if( config['disableHTML5'] == true && config['plugin'] ){
			config['plugin'] = false;
		}
		
		return config;
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
		
		// only request the ui Conf if we don't already have it: 
		if( !embedPlayer.$uiConf ){
			playerRequest.uiconf_id = this.getUiConfId( embedPlayer );
		}

		// Add the flashvars
		playerRequest.flashvars = $( embedPlayer ).data( 'flashvars' ); 
		
		// Check if we have the player data bootstrap from the iframe
		var bootstrapData = mw.getConfig("KalturaSupport.IFramePresetPlayerData");

		//alert( 'bootstrap:' + mw.getConfig( 'KalturaSupport.IFramePresetPlayerData' ) ) ;
		// Insure the bootStrap data has all the required info: 
		if( bootstrapData 
			&& bootstrapData.partner_id == embedPlayer.kwidgetid.replace('_', '')
			&& bootstrapData.ks
		){
			mw.log( 'KWidgetSupport::loaded player data from KalturaSupport.IFramePresetPlayerData config' );
			// Clear bootstrap data from configuration: 
			mw.setConfig("KalturaSupport.IFramePresetPlayerData" , null);
			this.kClient = mw.kApiGetPartnerClient( playerRequest.widget_id );
			this.kClient.setKS( bootstrapData.ks );
			callback( bootstrapData );
		} else {
			// Run the request: ( run async to avoid function call stack overflow )
			_this.kClient = mw.KApiPlayerLoader( playerRequest, function( playerData ){
				if( playerData.flavors &&  playerData.flavors.code == "INVALID_KS" ){
					$('.loadingSpinner').remove();
					$(embedPlayer).replaceWith( "Error invalid KS" );
					return ;
				}
				callback( playerData );
			});
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
		//if( ac.isCountryRestricted ){
		//	return 'country is restricted';
		//}
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
			// Unset existing DOM source children 
			$('#' + embedPlayer.pid ).find('source').remove();
			// Empty the embedPlayers sources ( we don't want iPad h.264 being used for iPhone devices ) 
			embedPlayer.mediaElement.sources = [];
			// Update the set of sources in the embedPlayer ( might cause issues with other plugins ) 
		} else {		
			// Get device flavors ( if not already set )
			deviceSources = _this.getEntryIdSourcesFromFlavorData( _this.kClient.getPartnerId(), flavorData );	
		}
		// Setup the error hook: 
		if( _this.videoIsTranscodingFlag ){
			$(embedPlayer).bind( 'NoSourcesCustomError', function( callback ) {
				callback( "Video is transcoding, check back later" );
			});
		}
		// Update the source list per the current user-agent device: 
		var sources = _this.getSourcesForDevice( deviceSources );
		
		for( var i=0; i < sources.length; i++) {
			mw.log( 'KWidgetSupport:: addSource::' + embedPlayer.id + ' : ' +  sources[i].src + ' type: ' +  sources[i].type);
			embedPlayer.mediaElement.tryAddSource(
				$('<source />')
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
		var ipadAdaptiveFlavors = [];
		var iphoneAdaptiveFlavors = [];

		// Setup flavorUrl
		if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
			var flavorUrl = mw.getConfig('Kaltura.ServiceUrl') + '/p/' + partner_id +
					'/sp/' +  partner_id + '00/playManifest';
		} else {
			var flavorUrl = mw.getConfig('Kaltura.CdnUrl') + '/p/' + partner_id +
				   '/sp/' +  partner_id + '00/flvclipper';
		}
		_this.videoIsTranscodingFlag = false;
		// Find a compatible stream
		for( var i = 0 ; i < flavorData.length; i ++ ) {
			var asset = flavorData[i];
			var entryId = asset.entryId;
			
			// continue if clip is not ready (2) and not in a transcoding state (4 )
			if( asset.status != 2  ) {
				// if an asset is transcoding and no other source is found bind an error callback: 
				if( asset.status == 4 ){
					_this.videoIsTranscodingFlag = true;
				}
				continue;
			}
			
			// Check playManifest conditional
			if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
				var src  = flavorUrl + '/entryId/' + asset.entryId;
				// Check if Apple http streaming is enabled and the tags include applembr
				if( asset.tags.indexOf('applembr') != -1 ) {
					src += '/format/applehttp/protocol/http';
					deviceSources['AppleMBR'] = src + '/a.m3u8';
				} else {
					src += '/flavorId/' + asset.id + '/format/url/protocol/http';
				}

			} else {
				mw.log( "Error: KWidgetSupport: non-manifest urls are deprecated" );
				var src  = flavorUrl + '/entry_id/' + asset.entryId + '/flavor/' + asset.id ;
			}
			
			// Add iPad Akamai flavor to iPad flavor Ids list id list
			if( asset.tags.indexOf('ipadnew') != -1 ){
				ipadAdaptiveFlavors.push( asset.id );
			}

			// Add iPhone Akamai flavor to iPad&iPhone flavor Ids list
			if( asset.tags.indexOf('iphonenew') != -1 ){
				ipadAdaptiveFlavors.push( asset.id );
				iphoneAdaptiveFlavors.push( asset.id );
			}

			// Check the tags to read what type of mp4 source
			if( asset.tags.indexOf('ipad') != -1 ){
				deviceSources['iPad'] = src + '/a.mp4';
			}

			// Check for iPhone src
			if( asset.tags.indexOf('iphone') != -1 ){
				deviceSources['iPhone'] = src + '/a.mp4';
			}

			// Check for ogg source
			if( asset.fileExt == 'ogg' || asset.fileExt == 'ogv'){
				deviceSources['ogg'] = src + '/a.ogg';
			}

			// Check for webm source
			if( asset.fileExt == 'webm' || asset.tags.indexOf('webm') != -1 ){
				deviceSources['webm'] = src + '/a.webm';
			}

			// Check for 3gp source
			if( asset.fileExt == '3gp' ){
				deviceSources['3gp'] = src + '/a.3gp';
			}
		}
		// Create iPad flavor for Akamai HTTP
		if( ipadAdaptiveFlavors.length != 0) {
			deviceSources['iPadNew'] = flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/http/a.m3u8';
		}

		// Create iPhone flavor for Akamai HTTP
		if(iphoneAdaptiveFlavors.length != 0) {
			deviceSources['iPhoneNew'] = flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/http/a.m3u8';
		}
		
		// Append KS to all source if available 
		// Get KS for playManifest URL ( this should run synchronously since ks should already be available )
		var ksCheck = false;
		this.kClient.getKS( function( ks ) {
			ksCheck = true;
			$.each( deviceSources, function(inx, source){
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

			// Prefer Apple HTTP streaming if enabled: 
			if( mw.getConfig('Kaltura.UseAppleAdaptive') ){
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
}

/**
 * Register a global shortcuts for the Kaltura sources query
 */
mw.getEntryIdSourcesFromApi = function( widgetId, entryId, callback ){
	kWidgetSupport.getEntryIdSourcesFromApi( widgetId, entryId, callback);
};

})( window.mw, jQuery );
