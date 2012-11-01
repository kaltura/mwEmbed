/**
* Adds captions support
*/
( function( mw, $ ) { "use strict";
	
	mw.KTimedText = function( embedPlayer, captionPluginName, callback ) {
		return this.init( embedPlayer, captionPluginName, callback );
	};
	mw.KTimedText.prototype = {
		bindPostfix : '.kTimedText',
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
			// Set captions layout of player based on plugin Name: 
			if( this.pluginName == 'closedCaptionsOverPlayer' ) {
				this.defaultDisplayMode = 'ontop';
			} else if( this.pluginName == 'closedCaptionsUnderPlayer' ) {
				this.defaultDisplayMode = 'below';
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
			
			// Update the layout options per existing layout or uiConf preference. 
			if( existingLayout !== null ) {
				embedPlayer.timedText.setLayoutMode( existingLayout );
			} else if( _this.getConfig( 'hideClosedCaptions' ) == true ) {
				embedPlayer.timedText.setLayoutMode( 'off' );
			}
			// Bind player at player ready time
			_this.bindPlayer( embedPlayer );
			callback();
		},
        /* Override bindTextButton for allowing captions toggle */
        bindTextButton: function($textButton) {
			var _this = this;
			$textButton.unbind( 'click.textMenu' ).bind( 'click.textMenu', function() {
                if ( _this.embedPlayer.getKalturaConfig( '', 'customCaptionsButton' ) ) {
                    _this.toggleCaptions();
                }
                else {
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
			var style = { 'display': 'inline' };
	
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
				var emFontMap = { '6': .375, '7': .438, '8' : .5, '9': .563, '10': .625, '11':.688,
						'12':.75, '13': .813, '14': .875, '15':.938, '16':1, '17':1.063, '18': 1.125, '19': 1.888,
						'20':1.25, '21':1.313, '22':1.375, '23':1.438, '24':1.5};
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
			$( embedPlayer ).unbind( this.bindPostfix );
			
			// Trigger changed caption
			$( embedPlayer ).bind( 'TimedText_ChangeSource' + this.bindPostfix , function() {
				$( embedPlayer ).trigger( 'changedClosedCaptions' );
			});
			
			// Support hide show notifications: 
			$( embedPlayer ).bind( 'Kaltura_SendNotification'+ this.bindPostfix , function( event, notificationName, notificationData) {
				switch( notificationName ) {
					case 'showHideClosedCaptions':
						embedPlayer.timedText.toggleCaptions();
						break;
					case 'showClosedCaptions':
						embedPlayer.timedText.setLayoutMode(  embedPlayer.timedText.defaultDisplayMode );
						break;
					case 'hideClosedCaptions':
						embedPlayer.timedText.setLayoutMode( 'off' );
						break;
				}
			});
			
			// Support SetKDP attribute style caption updates
			$( embedPlayer ).bind( 'Kaltura_SetKDPAttribute' + this.bindPostfix, function( event, componentName, property, value ) {
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
			// Check if text sources are already loaded ( not null )
			if( this.textSources.length ) {
				callback();
				return ;
			}
			// init timedText sources:
			this.textSources = [];
		
			// Check for kaltura ccUrl style text tracks ( not eagle api )
			if( this.getConfig( 'ccUrl' ) ) {
				mw.log( 'KTimedText:: loadTextSources> add textSources from ccUrl:' + this.getConfig( 'ccUrl' ) );
				// Set up a single source from the custom vars:
				var textSource = this.getTextSource( this.getConfig( 'ccUrl' ), this.getConfig( 'type' ) );
				if( textSource ) {
					_this.textSources.push( textSource);
				}
			}

			// Api sources require that a api query
			_this.getKalturaClient().getKS( function( ks ) {
				_this.ksCache = ks;
				_this.getTextSourcesFromApi( function( dbTextSources ) {
					$.each( dbTextSources, function( inx, dbTextSource ) {
						mw.log( 'KTimedText:: loadTextSources> add textSources from db:' + inx, _this.getTextSourceFromDB( dbTextSource ) );
						var readySource = _this.getTextSourceFromDB( dbTextSource );
						if ( !_this.isSourceLoaded( readySource ) ) {
							_this.textSources.push( readySource );
						}
					});
					$( _this.embedPlayer ).trigger( 'KalturaSupport_CCDataLoaded' );
					// Done adding source issue callback
					mw.log( 'KTimedText:: loadTextSources> total source count: ' + _this.textSources.length );
					callback();
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
				mw.log( "Error: KTimedText error missing text source from custom vars" );
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
			// Try to insert the track source:
			var embedSource = this.embedPlayer.mediaElement.tryAddSource(
				$( '<track />' ).attr({
					'kind'		: 'subtitles',
					'language'	: dbTextSource.language,
					'srclang' 	: dbTextSource.languageCode,
					'label'		: dbTextSource.label,
					'id'		: dbTextSource.id,
					'fileExt'	: dbTextSource.fileExt,
					'src'		: _this.getCaptionUrl( dbTextSource.id, dbTextSource.fileExt ),
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
		},
		
		/**
		 * Checks if a given source is already found within loaded sources
		 * @param {mw.TextSource} source - Source to check
		 */
		isSourceLoaded: function( source ) {
			var _this = this;
			var found = false;
			$.each( _this.textSources, function() {
				if ( source.id == this.id ) {
					found = true;
					return ;
				}
			} );
			return found;
		}
	};

} )( window.mw, jQuery );