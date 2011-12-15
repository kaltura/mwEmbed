( function( mw, $ ) {
	
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
			// Add hook for check player sources to use local kEntry ID source check:
			$( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
				_this.loadAndUpdatePlayerData( embedPlayer, callback );
			});
			// Add Kaltura iframe share support:
			$( embedPlayer ).bind( 'getShareIframeSrc', function( event, callback ){
				var iframeUrl = mw.getMwEmbedPath() + 'mwEmbedFrame.php';
				iframeUrl +='/wid/' + embedPlayer.kwidgetid +
					'/uiconf_id/' + embedPlayer.kuiconfid +
					'/entry_id/' + embedPlayer.kentryid + '/';
				// return the iframeUrl via the callback: 
				callback( iframeUrl );
			});
		});
		// Ads have to communicate with parent iframe to support companion ads.
		$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
			// Add the updateCompanionTarget binding to bridge iframe
			exportedBindings.push( 'KalturaSupport_RawUiConfReady' );
		});
		
		// Do special binding for iframe
		$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
			// once the player is "ready" add kWidget methods: 
			$( playerProxy ).bind('KalturaSupport_RawUiConfReady', function(event, rawUiConf ){
				// Store the parsed uiConf in the playerProxy object:
				playerProxy.$uiConf = $( rawUiConf );
				_this.addPlayerMethods( playerProxy );
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
		mw.log("KWidgetSupport::loadAndUpdatePlayerData>");
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
	
	updatePlayerData: function( embedPlayer,  playerData, callback ){
		var _this = this;
		// Check for playerData error: 
		if( playerData.error ){
			embedPlayer['data-playerError'] = playerData.error;
		}
		
		// Check for uiConf	and attach it to the embedPlayer object:
		if( playerData.uiConf ){
			// Pass along the uiConf data
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
						
						// mw.log("KWidgetSupport::addPlayerHooks> Set Global Config:  " + $( customVar ).attr('key') + ' ' + cVar );
						mw.setConfig(  $( customVar ).attr('key'), cVar);
					}
				});
			}
		}
		
		// Check access controls ( this is kind of silly and needs to be done on the server ) 
		if( playerData.accessControl ){
			var acStatus = _this.getAccessControlStatus( playerData.accessControl );
			if( acStatus !== true ){
				embedPlayer.hidePlayerSpinner();
				embedPlayer.showErrorMsg( acStatus );
				return ;
			}
			// Check for preview access control and add special onEnd binding: 
			if( playerData.accessControl.previewLength != -1 ){
				$( embedPlayer ).bind('postEnded.acpreview', function(){
					mw.log( 'KWidgetSupport:: postEnded.acpreview>' );
					$( embedPlayer ).trigger( 'KalturaSupport_FreePreviewEnd' );
					// Don't run normal onend action: 
					embedPlayer.onDoneInterfaceFlag = false;
					var closeAcMessage = function(){
						$( embedPlayer ).unbind('postEnded.acpreview');
						embedPlayer.controlBuilder.closeMenuOverlay();
						embedPlayer.onClipDone();
					};
					// Display player dialog 
					// TODO i8ln!!
					embedPlayer.controlBuilder.displayMenuOverlay(
						$('<div />').append( 
							$('<h3 />').append( 'Free preview completed, need to purchase'),
							$('<span />').text( 'Access to the rest of the content is restricted' ),
							$('<br />'),$('<br />'),
							$('<button />').attr({'type' : "button"})
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
		// check for entry id not found: 
		if( playerData.meta && playerData.meta.code == 'ENTRY_ID_NOT_FOUND' ){
			$( embedPlayer ).trigger( 'KalturaSupport_EntryFailed' );
		} else {
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
		}
		// Add player methods: 
		this.addPlayerMethods( embedPlayer );
		
		// Check for payload based uiConf xml ( as loaded in the case of playlist with uiConf ) 
		if( $(embedPlayer).data( 'uiConfXml' ) ){
			embedPlayer.$uiConf = $( embedPlayer ).data( 'uiConfXml' );
		}
		// Check for playlist cache based 
		if( playerData.playlistData ){
			embedPlayer.kalturaPlaylistData = playerData.playlistData;
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
		
		// Add an exported plugin value: 
		embedPlayer.addExportedObject = function( pluginName, objectSet ){
			if( !embedPlayer.kalturaExportedEvaluateObject ){
				embedPlayer.kalturaExportedEvaluateObject = {};
			}
			if( !embedPlayer.kalturaExportedEvaluateObject[ pluginName ] ){
				embedPlayer.kalturaExportedEvaluateObject[ pluginName ] = objectSet;
			} else {
				$.extend( embedPlayer.kalturaExportedEvaluateObject[ pluginName ], objectSet);
			}
			// Sync iframe with attribute data updates:
			$( embedPlayer ).trigger( 'updateIframeData' );
		}

		// Add isPluginEnabled to embed player:
		embedPlayer.isPluginEnabled = function( pluginName ) {
			return _this.getPluginConfig( embedPlayer, pluginName, 'plugin' );
		};
		// Add getFlashvars to embed player:
		embedPlayer.getFlashvars = function() {
			var fv = $( embedPlayer ).data( 'flashvars' );
			if( !fv ){
				fv = mw.getConfig( 'KalturaSupport.IFramePresetFlashvars' ) || {};
			}
			return fv;
		}
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
			// Run the DoneWithUiConf trigger 
			// Allows modules that depend on other modules initialization to do what they need to do. 
			mw.log("KWidgetSupport:: trigger KalturaSupport_DoneWithUiConf");
			
			// Don't stack
			setTimeout(function(){
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
			// Check for uiVars
			$uiPluginVars.each( function(inx, node){
				var attrName = $(node).attr('key');
				if( $(node).attr('overrideflashvar') != "false" || ! config[attrName] ){
					var attrKey = attrName.replace( confPrefix + '.', '');
					config[ attrKey ] = $(node).get(0).getAttribute('value');
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
			// If JS Api disabled, evaluate is undefined
			if( embedPlayer.evaluate )
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
			var sources = _this.getEntryIdSourcesFromFlavorData( _this.kClient.getPartnerId(), playerData.flavors );
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
	 * TODO should match the iframe messages keys
	 * TODO need to i8ln message with gM( 'msg-key' );
	 * 
	 * @return 
	 * @type boolean 
	 * 		true if the media can be played
	 * 		false if the media should not be played. 
	 */
	getAccessControlStatus: function( ac ){
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
		// Check if we already have sources: 
		var sources = embedPlayer.mediaElement.getSources();
		if( sources[0] && sources[0]['data-flavorid'] ){
			return ;
		}
		// Else get sources from flavor data :
		var flavorSources = _this.getEntryIdSourcesFromFlavorData( _this.kClient.getPartnerId(), flavorData );
		// Add all the sources to the player element: 
		for( var i=0; i < flavorSources.length; i++) {
			mw.log( 'KWidgetSupport:: addSource::' + embedPlayer.id + ' : ' +  flavorSources[i].src + ' type: ' +  flavorSources[i].type);
			embedPlayer.mediaElement.tryAddSource(
				$('<source />')
				.attr( flavorSources[i] )
				.get( 0 )
			);
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
		return hostUrl;
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
		
		// Remove the ':' from the protocol
		var protocol = location.protocol.substr(0, location.protocol.length-1); 

		// Setup the deviceSources array
		var deviceSources = [];
		
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

		// Add all avaliable sources: 
		for( var i = 0 ; i < flavorData.length; i ++ ) {
			var asset = flavorData[i];
			var entryId = asset.entryId;
			
			// Setup a source object:
			var source = {
				'data-bitrate' :  asset.bitrate * 8,
				'data-width' : asset.width,
				'data-height' : asset.height
			};
			// Continue if clip is not ready (2) and not in a transcoding state (4 )
			if( asset.status != 2  ) {
				// if an asset is transcoding and no other source is found bind an error callback: 
				if( asset.status == 4 ){
					source.error = 'not-ready-transcoding';
					// don't add sources that are not ready ( for now ) 
					//deviceSources.push( source );
				}
				continue;
			}
			
			// Add iPad Akamai flavor to iPad flavor Ids list id list
			if( asset.tags.toLowerCase().indexOf('ipadnew') != -1 ){
				iphoneAdaptiveFlavors.push( asset.id );
				// We don't need to continue, the ipadnew/iphonenew flavor are used also for progressive download
				//continue;
			}
			
			// Add iPhone Akamai flavor to iPad&iPhone flavor Ids list
			if( asset.tags.toLowerCase().indexOf('iphonenew') != -1 ){
				ipadAdaptiveFlavors.push( asset.id );
				iphoneAdaptiveFlavors.push( asset.id );
			}
			
			// Check playManifest conditional
			if( mw.getConfig( 'Kaltura.UseManifestUrls' ) ){
				var src  = flavorUrl + '/entryId/' + asset.entryId;
				// Check if Apple http streaming is enabled and the tags include applembr
				if( asset.tags.indexOf('applembr') != -1 ) {
					src += '/format/applehttp/protocol/'+ protocol + '/a.m3u8';
				} else {
					src += '/flavorId/' + asset.id + '/format/url/protocol/' + protocol;
				}
			} else {
				mw.log( "Error: KWidgetSupport: non-manifest urls are deprecated" );
				var src  = flavorUrl + '/entry_id/' + asset.entryId + '/flavor/' + asset.id ;
			}
			
			// Check the tags to read what type of mp4 source
			if( asset.tags.toLowerCase().indexOf('ipad') != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPad';
				source['type'] = 'video/h264';
			}

			// Check for iPhone src
			if( asset.tags.toLowerCase().indexOf('iphone') != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPhone';
				source['type'] = 'video/h264';
			}

			// Check for ogg source
			if( asset.fileExt.toLowerCase() == 'ogg' 
				|| 
				asset.fileExt.toLowerCase() == 'ogv'
				||
				asset.containerFormat.toLowerCase() == 'ogg'
			){
				source['src'] = src + '/a.ogg';
				source['data-flavorid'] = 'ogg';
				source['type'] = 'video/ogg';
			}

			// Check for webm source
			if( asset.fileExt == 'webm' 
				|| 
				asset.tags.indexOf('webm') != -1 
				|| // Kaltura transcodes give: 'matroska'
				asset.containerFormat.toLowerCase() == 'matroska'
				|| // some ingestion systems give "webm" 
				asset.containerFormat.toLowerCase() == 'webm'
			){
				source['src'] = src + '/a.webm';
				source['data-flavorid'] = 'webm';
				source['type'] = 'video/webm';
			}

			// Check for 3gp source
			if( asset.fileExt == '3gp' ){
				source['src'] = src + '/a.3gp';
				source['data-flavorid'] = '3gp'
				source['type'] = 'video/3gp';
			}
			// Add the source ( if a src was defined ):
			if( source['src'] ){
				deviceSources.push( source );
			}
		}
		
		// Create iPad flavor for Akamai HTTP
		if( ipadAdaptiveFlavors.length != 0 && mw.getConfig('Kaltura.UseAppleAdaptive') ) {
			deviceSources.push({
				'data-flavorid' : 'iPadNew',
				'type' : 'application/vnd.apple.mpegurl',
				'src' : flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
			});
		}
		// Create iPhone flavor for Akamai HTTP
		if(iphoneAdaptiveFlavors.length != 0 && mw.getConfig('Kaltura.UseAppleAdaptive') ) {
			deviceSources.push({
				'data-flavorid' : 'iPhoneNew',
				'type' : 'application/vnd.apple.mpegurl',
				'src' : flavorUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
			});
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
mw.getEntryIdSourcesFromApi = function( widgetId, entryId, callback ){
	kWidgetSupport.getEntryIdSourcesFromApi( widgetId, entryId, callback);
};

})( window.mw, jQuery );
