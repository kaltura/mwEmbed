/**
* Adds captions support
*/
( function( mw, $ ) {

	mw.KTimedText = function( embedPlayer, kalturaConfig, callback ){
		return this.init( embedPlayer, kalturaConfig, callback );
	};
	mw.KTimedText.prototype = {
		init: function( embedPlayer, kalturaConfig, callback ){
			var _this = this;
			// Override embedPlayer hasTextTracks:
			embedPlayer.hasTextTracks = function(){
				return true
			};
			// Set the KTimedText plugin configuration
			_this.kVars = kalturaConfig;
		
			// Check for kaltura plugin representation of offset:
			if( _this.kVars.timeOffset ){
				_this.timeOffset = _this.kVars.timeOffset;
			}

			// Trigger changed caption
			$( embedPlayer ).bind( 'TimedText_ChangeSource', function() {
				$( embedPlayer ).trigger( 'changedClosedCaptions' );
			});
			
			// Support hide show notifications: 
			$( embedPlayer ).bind( 'Kaltura_SendNotification', function( event, notificationName, notificationData){
				switch( notificationName ){
					case 'showHideClosedCaptions':
						embedPlayer.timedText.toggleCaptions();
						break;
					case 'showClosedCaptions':
						embedPlayer.timedText.selectLayout( 'ontop' );
						break;
					case 'hideClosedCaptions':
						embedPlayer.timedText.selectLayout( 'off' );
						break;
				}
			});
			
			// Inherit the timed text support via the base TimedText module:
			var baseTimedText = new mw.TimedText( embedPlayer, kalturaConfig );
			for( var i in _this ){
				if( baseTimedText[ i ] ){
					baseTimedText[ 'parent_' + i] = baseTimedText[i];
				}
				baseTimedText[i] = _this[i];
			}
			return baseTimedText;

		},
	
		getKalturaClient: function(){
			if( ! this.kClient ){
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
			if( this.textSources !== null ){
				callback();
				return ;
			}
			// init timedText sources:
			this.textSources = [];
		
			// Check for kaltura ccUrl style text tracks ( not eagle api )
			if( this.kVars.ccUrl ){
				// Set up a single source from the custom vars:
				$.each( _this.getTextSourceFromVars( _this.kVars ), function(inx, textSource ){
					_this.textSources.push( textSource);
				});
			}
		
			// Api sources require that a api query
			_this.getKalturaClient().getKS( function( ks ) {
				_this.ksCache = ks;
				_this.getTextSourcesFromApi( function( dbTextSources ){
					$.each( dbTextSources, function( inx, dbTextSource ){
						_this.textSources.push(
							_this.getTextSourceFromDB( dbTextSource )
						);
						$( _this.embedPlayer ).trigger('KalturaSupport_newClosedCaptionsData');
					});
					$( _this.embedPlayer ).trigger('KalturaSupport_ccDataLoaded');
					// Done adding source issue callback
					callback();
				});
			});
		},
		/**
		 * Get the text sources from the api: 
		 */
		getTextSourcesFromApi: function( callback ){
			var _this = this;
			this.getKalturaClient().doRequest( {
				'service' : 'caption_captionasset',
				'action' : 'list',
				'filter:objectType' : 'KalturaAssetFilter',
				'filter:entryIdEqual' : _this.embedPlayer.kentryid,
				'filter:statusEqual' : 2
			}, function( data ) {
				mw.log( "KTimedText:: sources loaded: " + data.totalCount, data.objects);
				// TODO is this needed does the api not return an empty set?
				if( data.totalCount > 0 ) {
					callback( data.objects );
				} else {
					callback( [] );
				}
			});
		},
		getTextContentType: function( type ){
			switch( type ){
				case 'srt':
					return 'text/x-srt';
					break;
				case 'tt':
					return 'text/xml';
					break;
			}
		},
		getTextSourceFromVars: function( kalturaTextVars ){
			var _this = this;
			var type = this.embedPlayer.evaluate( kalturaTextVars.type );
			var ccUrl = this.embedPlayer.evaluate( kalturaTextVars.ccUrl );
			if( !type || !ccUrl ){
				mw.log("Error: KTimedText error missing type or text source from custom vars");
				return [];
			}
			var embedSource = this.embedPlayer.mediaElement.tryAddSource(
				$( '<track />' ).attr({
					'kind'		: 'subtitles',
					'label'		: 'English',
					'srclang' 	: 'en',
					'fileExt'	: type,
					'type'		: this.getTextContentType( type ),
					'src'		: ccUrl
				}).get(0)
				);
			// Return a "textSource" object:
			return [ new mw.TextSource( embedSource ) ];
		},
	
		/**
		 * Gets a text source we can use the application from a database textSource
		 * @param {Object} textSource
		 */
		getTextSourceFromDB: function( dbTextSource ){
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
				}).get(0) 
				);
			// Return a "textSource" object:
			return new mw.TextSource( embedSource );
		},
	
		/**
		* Returns the caption serve url
		* @param {String} captionId - caption asset id
		* @param {String} type - caption asset type
		*/
		getCaptionUrl: function( captionId, type ){
			// Sample Url for Caption serve
			// http://www.kaltura.com/api_v3/index.php?service=caption_captionasset&action=serve&captionAssetId=@ID@&ks=@KS@
			var params = {
				'action': 'serve',
				'captionAssetId': captionId,
				'ks': this.ksCache
			};
			var kalsig = this.getKalturaClient().getSignature( params );
			var baseUrl = mw.getConfig('Kaltura.ServiceUrl') + mw.getConfig('Kaltura.ServiceBase').replace('index.php', '');
			return baseUrl + 'caption_captionasset&' + $.param( params ) + '&kalsig=' + kalsig + '&.' + type;
		}
	};

} )( window.mw, jQuery );