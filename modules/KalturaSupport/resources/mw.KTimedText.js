/**
* Adds captions support
*/
( function( mw, $ ) { "use strict";

	mw.KTimedText = function( embedPlayer, captionPluginName, callback ) {
		return this.init( embedPlayer, captionPluginName, callback );
	};
	mw.KTimedText.prototype = {
		bindPostFix : '.kTimedText',
		init: function( embedPlayer, captionPluginName, callback ) {
			var _this = this;

			this.embedPlayer = embedPlayer;
			// Set the caption plugin name so that we can get config from the correct location.
			this.pluginName = captionPluginName;
			// Check for kaltura plugin representation of offset:
			if( _this.getConfig( 'timeOffset' ) ) {
				_this.timeOffset = _this.getConfig( 'timeOffset' );
			}
			// Check for existing timedText on player and retain visibility.
			var existingLayout = null;
			if( embedPlayer.timedText ) {
				existingLayout = embedPlayer.timedText.getPersistentConfig( 'layout' );
			}
			if( this.pluginName == 'closedCaptionsOverPlayer' || this.pluginName == 'closedCaptionsFlexible') {
				this.defaultDisplayMode = 'ontop';
			} else if( this.pluginName == 'closedCaptionsUnderPlayer' ) {
				// Set captions layout of player based on url type
				if( _this.getConfig( 'ccUrl' ) && _this.getConfig( 'ccUrl' ).substr( -4 ) == '.xml' ){
					this.defaultDisplayMode = 'ontop';
				} else {
					this.defaultDisplayMode = 'below';
				}
			}

			// Inherit the timed text support via the base TimedText module:
			var baseTimedText = new mw.TimedText( embedPlayer );
			for( var i in _this ) {
				if( baseTimedText[ i ] ) {
					baseTimedText[ 'parent_' + i ] = baseTimedText[i];
				}
				baseTimedText[i] = _this[i];
			}
			embedPlayer.timedText = baseTimedText;

			// if using the customCaptionsButton existingLayout always starts as "off"
			if ( _this.embedPlayer.getKalturaConfig( '', 'customCaptionsButton' ) ) {
				existingLayout =  'off';
			}
			// Set the default key:
			var defaultLanguageKey =  _this.embedPlayer.getKalturaConfig( this.pluginName, 'defaultLanguageKey' );
			if ( defaultLanguageKey && defaultLanguageKey != "None" ){
				embedPlayer.timedText.setPersistentConfig( 'userLanguage', defaultLanguageKey );
			} else {
				// default language is none, set display to off
				embedPlayer.timedText.defaultDisplayMode = 'off';
			}

			$( embedPlayer ).bind( 'playerReady' + this.bindPostFix, function() {
				// Update the layout options per existing layout or uiConf preference.
				if( existingLayout !== null ) {
					embedPlayer.timedText.setLayoutMode( existingLayout );
				} else if( _this.getConfig( 'hideClosedCaptions' ) == true ) {
					embedPlayer.timedText.setLayoutMode( 'off' );
				} else {
					embedPlayer.timedText.setLayoutMode( _this.defaultDisplayMode );
				}
				// Bind player at player ready time
				_this.bindPlayer( embedPlayer );
			} );
			callback();
		},
		/* Override bindTextButton for allowing captions toggle */
		bindTextButton: function($textButton) {
			var _this = this;
			$textButton.unbind( 'click.textMenu' ).bind( 'click.textMenu', function() {
				if ( _this.embedPlayer.getKalturaConfig( '', 'customCaptionsButton' ) ) {
					_this.toggleCaptions();
				} else {
					_this.showTextMenu();
				}
				return true;
			} );
		},
		/* Override buildMenu for allowing captions toggle */
		buildMenu: function( autoShow ) {
			var _this = this;
			if ( _this.embedPlayer.getKalturaConfig( '', 'customCaptionsButton' ) ) {
				return;
			} else {
				this.parent_buildMenu( autoShow );
			}
		},
		/* get the captions css from configuration options */
		getCaptionCss: function() {
			var style = {'display': 'inline'};

			if( this.getConfig( 'bg' ) ) {
				style[ "background-color" ] = mw.getHexColor( this.getConfig( 'bg' ) );
			}
			if( this.getConfig( 'fontColor' ) ) {
				style[ "color" ] = mw.getHexColor( this.getConfig( 'fontColor' ) );
			}
			if( this.getConfig( 'fontFamily' ) ) {
				style[ "font-family" ] = this.getConfig( 'fontFamily' );
			}
			if( this.getConfig( 'fontsize' ) ) {
				// Translate to em size so that font-size parent percentage
				// base on http://pxtoem.com/
				var emFontMap = { '6': .5, '7': .583, '8': .666, '9': .75, '10': .833, '11': .916,
						'12': 1, '13': 1.083, '14': 1.166, '15': 1.25, '16': 1.333, '17': 1.416, '18': 1.5, '19': 1.583,
						'20': 1.666, '21': 1.75, '22': 1.833, '23': 1.916, '24': 2 };
				// Make sure its an int:
				var fontsize = parseInt( this.getConfig( 'fontsize' ) );
				style[ "font-size" ] = ( emFontMap[ fontsize ] ) ?
						emFontMap[ fontsize ] +'em' :
						(  fontsize > 24 )?  emFontMap[ 24 ]+'em' : emFontMap[ 6 ];
			}
			if( this.getConfig( 'useGlow' ) && this.getConfig( 'glowBlur' ) && this.getConfig( 'glowColor' ) ) {
				style[ "text-shadow" ] = '0 0 ' + this.getConfig( 'glowBlur' ) + 'px ' + mw.getHexColor( this.getConfig( 'glowColor' ) );
			}
			return style;
		},
		bindPlayer: function( embedPlayer ) {
			var _this = this;
			// Remove any old timed text bindings:
			$( embedPlayer ).unbind( this.bindPostFix );

			// Trigger changed caption
			$( embedPlayer ).bind( 'TimedText_ChangeSource' + this.bindPostFix , function() {
				$( embedPlayer ).trigger( 'changedClosedCaptions' );
			});

			// Support hide show notifications:
			$( embedPlayer ).bind( 'Kaltura_SendNotification'+ this.bindPostFix , function( event, notificationName, notificationData) {
				switch( notificationName ) {
					case 'showHideClosedCaptions':
						embedPlayer.timedText.toggleCaptions();
						break;
					case 'showClosedCaptions':
						var mode = embedPlayer.timedText.defaultDisplayMode
						if(  mode == 'off' ){
							mode = 'ontop';
						}
						embedPlayer.timedText.setLayoutMode( mode );
						break;
					case 'hideClosedCaptions':
						embedPlayer.timedText.setLayoutMode( 'off' );
						break;
				}
			});

			// Support SetKDP attribute style caption updates
			$( embedPlayer ).bind( 'Kaltura_SetKDPAttribute' + this.bindPostFix, function( event, componentName, property, value ) {
				if( componentName == _this.pluginName ) {
					if( property == 'ccUrl' ) {
						// empty the text sources:
						embedPlayer.timedText.textSources = null;
						// re-setup sources will run loadTextSources
						embedPlayer.timedText.setupTextSources();
					}
				}
			});
		},
		/*
		 *
		 *
		 // TODO support addInterface based on uiConf position.
		 addInterface: function() {

		  <hbox id="ccOverComboBoxWrapper" horizontalalign="right" width="100%" height="100%" paddingright="5" paddingtop="5">
          <plugin id="captionsOverFader" width="0%" height="0%" includeinlayout="false" target="{ccOverComboBoxWrapper}" hovertarget="{PlayerHolder}" duration="0.5" autohide="true" path="faderPlugin.swf"></plugin>
          <combobox id="ccOverComboBox" width="90" stylename="_kdp" selectedindex="{closedCaptionsOverPlayer.currentCCFileIndex}"
	           kevent_change="sendNotification( 'closedCaptionsSelected' , ccOverComboBox.selectedItem)"
	           dataprovider="{closedCaptionsOverPlayer.availableCCFilesLabels}" prompt="Captions" tooltip="">
          </combobox>

          <Button id="custom1BtnControllerScreen" height="22"
          focusRectPadding="0" buttonType="iconButton"
          kClick="jsCall( 'customFunc1', mediaProxy.entry.id )"
          styleName="controllerScreen" icon="generalIcon"
          k_buttonType="buttonIconControllerArea" tooltip="captions"
          color1="14540253" color2="16777215" color3="3355443"
          color4="10066329" color5="16777215" font="Arial"/>

          ( this.parent_addInterface();

		 }
		 */
		includeCaptionButton:function() {
			return true;
		},
		getConfig: function( attrName ) {
			return this.embedPlayer.getKalturaConfig( this.pluginName, attrName );
		},
		getKalturaClient: function() {
			if( ! this.kClient ) {
				this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			}
			return this.kClient;
		},

		/**
		 * Load the list of captions sources from the kaltura api, or from plugin config
		 */
		loadTextSources: function( callback ) {
			var _this = this;
			mw.log("KTimedText::loadTextSources");
			// Check if text sources are already loaded ( not null )
			if( this.textSources && this.textSources.length ) {
				mw.log( 'KTimedText:: loadTextSources > already loaded' );
				callback();
				return ;
			}

			// Check that we have entry data before loading:
			var entry = this.embedPlayer.evaluate('{mediaProxy.entry}');
			if( !entry || !entry.id ){
				mw.log("KTimedText::loadTextSources without entry data ( skip )");
				callback();
				return ;
			}

			// Check for Kaltura ccUrl style text tracks ( not eagle api )
			if( this.getConfig( 'ccUrl' ) ) {
				mw.log( 'KTimedText:: loadTextSources> add textSources from ccUrl:' + this.getConfig( 'ccUrl' ) );
				// Set up a single source from the custom vars:
				var textSource = this.getTextSource( this.getConfig( 'ccUrl' ), this.getConfig( 'type' ) );
				if( textSource ) {
					_this.textSources.push( textSource);
				}
				callback();
				return ;
			}

			// Api sources require that a api query
			_this.getKalturaClient().getKS( function( ks ) {
				mw.log( 'KTimedText:: loadTextSources> from api');
				_this.ksCache = ks;
				_this.getTextSourcesFromApi( function( dbTextSources ) {
					var multiRequest = [];
					$.each( dbTextSources, function( inx, dbTextSource ) {
						multiRequest.push(
							{ 
								'service' : 'caption_captionasset',
								'action' : 'getUrl',
								'id' : dbTextSource.id
							}
						);

					});
					if ( multiRequest.length ) {
						_this.getKalturaClient().doRequest( multiRequest, function( result ) {
							var captionsURLs = [];
							$.each( result, function() {
								// Extracting captionAssetId from URL (i.e http://..../captionAssetId/<captionAssetId>/ks/...)
								var startIndex = this.indexOf( 'captionAssetId/') + "captionAssetId/".length;
								var endIndex = this.indexOf( '/ks/' );
								var captionAssetId = this.substr( startIndex, ( endIndex - startIndex ) );
								captionsURLs[ captionAssetId ] = this;
							} );
							$.each( dbTextSources, function( inx, dbTextSource ) {
								dbTextSource.src = captionsURLs[ dbTextSource.id ];
								mw.log( 'KTimedText:: loadTextSources> add textSources from db:' + inx );
								_this.textSources.push(
									_this.getTextSourceFromDB( dbTextSource )
								);
							});
							$( _this.embedPlayer ).trigger( 'KalturaSupport_CCDataLoaded' );
							// Done adding source issue callback
							mw.log( 'KTimedText:: loadTextSources> total source count: ' + _this.textSources.length );
							callback();
						} );
					}
				});
			});
		},
		/**
		 * Get the text sources from the api:
		 */
		getTextSourcesFromApi: function( callback ) {
			var _this = this;
			this.getKalturaClient().doRequest( {
				'service' : 'caption_captionasset',
				'action' : 'list',
				'filter:objectType' : 'KalturaAssetFilter',
				'filter:entryIdEqual' : _this.embedPlayer.kentryid,
				'filter:statusEqual' : 2
			}, function( data ) {
				mw.log( "KTimedText:: getTextSourcesFromApi: " + data.totalCount, data.objects );
				$( _this.embedPlayer ).trigger( 'KalturaSupport_NewClosedCaptionsData' );
				// TODO is this needed? Does the api not return an empty set?
				if( data.totalCount > 0 ) {
					callback( data.objects );
				} else {
					callback( [] );
				}
			});
		},
		getTextContentType: function( type ) {
			switch( type ) {
				case 'srt':
					return 'text/x-srt';
					break;
				case 'tt':
					return 'text/xml';
					break;
			}
		},
		getTextSource: function( ccUrl, type ) {
			var _this = this;
			if( !ccUrl ) {
				mw.log("Error: KTimedText error missing text source from custom vars");
				return null;
			}
			if( !type ) {
				type  = 'text/x-srt';
			}

			var embedSource = this.embedPlayer.mediaElement.tryAddSource(
				$( '<track />' ).attr({
					'kind'		: 'subtitles',
					'label'		: 'English',
					'srclang' 	: 'en',
					'fileExt'	: type,
					'type'		: this.getTextContentType( type ),
					'src'		: ccUrl
				})[0]
				);
			// Return a "textSource" object:
			return new mw.TextSource( embedSource );
		},

		/**
		 * Gets a text source we can use the application from a database textSource
		 * @param {Object} textSource
		 */
		getTextSourceFromDB: function( dbTextSource ) {
			var _this = this;
			if( dbTextSource.fileExt == '' ){
				// TODO other format mappings?
				if( dbTextSource.format == '2' ){
					dbTextSource.fileExt = 'xml';
				}
			}
			// Try to insert the track source:
			var embedSource = this.embedPlayer.mediaElement.tryAddSource(
				$( '<track />' ).attr({
					'kind'		: 'subtitles',
					'language'	: dbTextSource.language,
					'srclang' 	: dbTextSource.languageCode,
					'label'		: dbTextSource.label,
					'id'		: dbTextSource.id,
					'fileExt'	: dbTextSource.fileExt,
					'src'		: dbTextSource.src + '/.' + dbTextSource.fileExt,
					'title'		: dbTextSource.label,
					'default'	: dbTextSource.isDefault
				})[0]
			);
			// Return a "textSource" object:
			return new mw.TextSource( embedSource );
		},

		/**
		* Returns the caption serve url
		* @param {String} captionId - caption asset id
		* @param {String} type - caption asset type
		*/
		getCaptionUrl: function( captionId, type ) {
			// Sample Url for Caption serve
			// http://www.kaltura.com/api_v3/index.php?service=caption_captionasset&action=serve&captionAssetId=@ID@&ks=@KS@
			var params = {
				'action': 'serve',
				'captionAssetId': captionId,
				'ks': this.ksCache
			};
			var kalsig = this.getKalturaClient().getSignature( params );
			var baseUrl = mw.getConfig( 'Kaltura.ServiceUrl' ) + mw.getConfig( 'Kaltura.ServiceBase' ).replace( 'index.php', '' );
			return baseUrl + 'caption_captionasset&' + $.param( params ) + '&kalsig=' + kalsig + '&.' + type;
		}
	};

} )( window.mw, jQuery );