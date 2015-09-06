( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'closedCaptions', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 62,
			"displayImportance": "high",
			"iconClass": "icon-cc",
			"align": "right",
			"showTooltip": true,
			"layout": "ontop", // "below"
			"displayCaptions": null, // null will use user preference
			"defaultLanguageKey": null,
			"whiteListLanguagesCodes": null, //white list the languages by languages codes (e.g. 'en,fr' will remove all items but English and French if they exist)
			"useCookie": true,
			"hideWhenEmpty": false,
			"showEmbeddedCaptions": false,
			"hideClosedCaptions": false,
			"showEmbeddedCaptionsStyle": false,
			"showOffButton": true,
			"toggleActiveCaption": false,
			"useExternalClosedCaptions": false,
			"offButtonPosition": "first",
			// Can be used to force loading specific language and expose to other plugins
			"forceLoadLanguage": false
		},

		textSources: [],
		defaultBottom: 15,
		lastActiveCaption: null,
		ended: false,

		setup: function(){
			var _this = this;
			this.cookieName = this.pluginName + '_languageKey';

			if( (this.getConfig( 'useCookie' ) && $.cookie( this.cookieName )
				&&
				$.cookie( this.cookieName ) == 'None')
				||
				this.getConfig('displayCaptions') === null
				||
				( this.getConfig( 'hideClosedCaptions') === true )
			){
				this.setConfig('displayCaptions', false );
			}

			if( (this.embedPlayer.isOverlayControls() && !this.embedPlayer.getInterface().find( '.controlBarContainer' ).is( ':hidden' )) || this.embedPlayer.useNativePlayerControls() ){
				if( this.embedPlayer.layoutBuilder ) {
					this.defaultBottom += this.embedPlayer.layoutBuilder.getHeight();
				}
			}

			this.embedPlayer.bindHelper("propertyChangedEvent", function(event, data){
				if ( data.plugin === _this.pluginName ){
					if ( data.property === "captions" ){
						_this.getMenu().$el.find("li a")[data.value].click();
					}
				}
			});

			if ( this.getConfig('showEmbeddedCaptions') === true ) {

				if ( this.getConfig('showEmbeddedCaptionsStyle') === true ) {
					this.bind( 'textTrackIndexChanged', function( e, captionData ) {
						if ( captionData.ttml ) {
							var xml =  $.parseXML( mw.html.unescape( decodeURIComponent( captionData.ttml ) ));
							_this.selectedSource.parseStylesTTML( xml );
						}
					});
				}
				this.bind( 'onEmbeddedData', function( e, captionData ) {
					//remove old captions
					var $tracks = _this.embedPlayer.getInterface().find( '.track' );
					$tracks.each( function( inx, caption){
						if(  $( caption ).attr('data-capId') == captionData.capId ){
							$( caption ).remove();
						}
					});
					if ( _this.getConfig( 'displayCaptions' ) === true ) {
						var caption = captionData;
						//if we got raw ttml <p>
						if ( captionData.ttml ) {
							var xml =  $.parseXML( mw.html.unescape( decodeURIComponent( captionData.ttml ) ));
							caption.caption = _this.selectedSource.parseCaptionObjTTML( $(xml).find( 'p' )[0] );
						}
						if ( !_this.selectedSource ) {
							_this.selectedSource = caption.source;
						}
                        var captionContent = _this.parseCaption(caption.caption);
						_this.addCaption( _this.selectedSource, caption.capId, captionContent );
					}
				});
				this.bind( 'changedClosedCaptions', function () {
					_this.getPlayer().triggerHelper('newClosedCaptionsData');
					//remove old captions
					_this.embedPlayer.getInterface().find( '.track' ).empty();
					_this.getPlayer().triggerHelper( 'changeEmbeddedTextTrack', _this.selectedSource );
				});
				this.bind( 'textTracksReceived', function ( e, data ) {
					if ( data && $.isArray( data.languages ) && data.languages.length ) {
						_this.destory();
						var newSources = [];
						$.each( data.languages, function ( inx, src ) {
							var source = new mw.TextSource( $.extend( { srclang: src.label }, src ) );
							//no need to load embedded captions
							source.loaded = true;
							newSources.push( source );
						} );
						_this.buildMenu( newSources );
					}
				} );
			} else {
				if (!this.getConfig("useExternalClosedCaptions")) {
					this.bind( 'playerReady', function () {
						_this.destory();
						_this.setupTextSources( function () {
							_this.buildMenu( _this.textSources );
						} );
					} );
					outOfBandCaptionEventHandlers.call(this);
				}

			}
			if (this.getConfig("useExternalClosedCaptions")) {
				this.bind( 'loadExternalClosedCaptions', function ( e, data ) {
					if ( !(data && $.isArray( data.languages ) ) ) {
						data.languages = [];
					}
					_this.destory();
					_this.buildMenu( data.languages );
				} );
				outOfBandCaptionEventHandlers.call(this);
			}

			function outOfBandCaptionEventHandlers(){
				var _this = this;
				this.bind( 'timeupdate', function(){
					if( _this.getConfig('displayCaptions') === true && _this.selectedSource ){
						_this.monitor();
					}
				});

				this.bind( 'ended', function(){
					_this.ended = true;
				});

				this.bind( 'playing', function(){
					_this.ended = false;
				});
			}

			this.bind( 'onplay', function(){
				_this.playbackStarted = true;
			});
			this.bind( 'hidePlayerControls', function(){
				_this.getComponent().removeClass( 'open' );
			});

			this.bind( 'showHideClosedCaptions', function(){
				if( _this.getConfig('displayCaptions') === true ){
					_this.setConfig('displayCaptions', false);
				} else {
					_this.setConfig('displayCaptions', true);
				}
			});

			this.bind( 'showClosedCaptions', function(){
				if( _this.getConfig('displayCaptions') === false ){
					_this.setConfig('displayCaptions', true);
				}
			});

			this.bind( 'hideClosedCaptions', function(){
				if( _this.getConfig('displayCaptions') === true ){
					_this.setConfig('displayCaptions', false);
				}
			});

			this.bind( 'onCloseFullScreen onOpenFullScreen', function(){
				if (_this.getConfig("displayCaptions") == true){
					_this.updateTextSize();
				}
			});

			if( this.getConfig('layout') == 'below'){
				this.updateBelowVideoCaptionContainer();
			}

			if ( this.getConfig('layout') == 'ontop' ) {
				this.bind('onHideControlBar onShowControlBar', function (event, layout) {
					if (!_this.ended && _this.getPlayer().isOverlayControls()) {
						_this.defaultBottom = layout.bottom;
						// Move the text track down if present
						_this.getPlayer().getInterface().find('.track')
							.stop()
							.animate(layout, 'fast');
					}
				});
			}

			this.bind("AdSupport_StartAdPlayback", function(){
				_this.setConfig('displayCaptions', false);
				_this.hideCaptions();
			});
			this.bind("AdSupport_EndAdPlayback", function(){
				_this.setConfig('displayCaptions', true);
				_this.showCaptions();
			});
			this.bind("playSegmentEvent", function(){
				_this.updateTimeOffset();
			});
		},
		updateTextSize: function(){
			// Check if we are in fullscreen or not, if so add an additional bottom offset of
			// double the default bottom padding.
			var textOffset = this.getPlayer().layoutBuilder.isInFullScreen() ?
					mw.getConfig("TimedText.BottomPadding") * 2 :
					mw.getConfig("TimedText.BottomPadding");

			var textCss = this.getInterfaceSizeTextCss({
				'width' :  this.getPlayer().getInterface().width(),
				'height' : this.getPlayer().getInterface().height()
			});

			this.log( 'set text size for: : ' + this.getPlayer().getInterface().width() + ' = ' + textCss['font-size'] );

			this.getPlayer().getInterface().find( '.track' )
			.css( textCss )
			.css({
				// Get the text size scale then set it to control bar height + TimedText.BottomPadding;
				'bottom': textOffset + 'px'
			});
			// check if below caption location, and update container size 
			if( this.getConfig('layout') == 'below' ){
				var _this = this;
				// give time for the dom to update: 
				setTimeout(function(){
					_this.updateBelowVideoCaptionContainer();	
				},50)
			}
		},
		getUserLanguageKeyPrefrence: function(){
			if( !this.getConfig('useCookie') ){
				return false;
			}
			// TODO add check if we can even use cookies
			// If no cookies allow, return null

			return $.cookie(this.cookieName);
		},
		onConfigChange: function( property, value ){
			switch( property ){
				case 'displayCaptions':
					if( value === false ){
						this.hideCaptions();
					} else {
						this.showCaptions();
					}
				break;
			}
			this._super( property, value );
		},
		hideCaptions: function(){
			if( !this.getConfig('displayCaptions') || this.textSources.length === 0 ) {
				this.getMenu().clearActive();
				if (this.getConfig('showOffButton')){
						this.getMenu().$el.find('.offBtn').addClass('active');
				}
				this.getCaptionsOverlay().hide();
				var $cc = this.embedPlayer.getInterface().find('.captionContainer' );
				$cc.remove();
				this.embedPlayer.doUpdateLayout();
				this.getPlayer().triggerHelper('closedCaptionsHidden');
			}
		},
		showCaptions: function(){
			if( this.getConfig('displayCaptions') ) {
				this.getMenu().clearActive();
				this.getCaptionsOverlay().show();
				if( this.selectedSource != null ) {
					this.getPlayer().triggerHelper('closedCaptionsDisplayed', {language: this.selectedSource.label});
					this.getMenu().$el.find("li").eq(this.lastActiveCaption).addClass('active');
				}
				if( this.getConfig('layout') == 'below' ) {
					this.updateBelowVideoCaptionContainer();
				}
			}
		},
		getCaptionURL: function( captionId ){
			if( this.captionURLs && this.captionURLs[ captionId ] ){
				return this.captionURLs[ captionId ];
			} 
			return null;
		},
		updateTimeOffset: function(){
			// support server side clipping
			if ( this.embedPlayer.supportsURLTimeEncoding() && this.embedPlayer.startTime ){
				this.timeOffset = this.embedPlayer.startTime;
			}
		},
		setupTextSources: function( callback ){
			var _this = this;
			this.updateTimeOffset();
			// Get from <track> elements
			$.each( this.getPlayer().getTextTracks(), function( inx, textSource ){
				_this.textSources.push( new mw.TextSource( textSource ) );
			});

			this.loadCaptionsFromApi(function( captions ){
				// Add track elements
				$.each(captions, function(){
					_this.textSources.push(
						_this.getTextSourceFromDB( this )
					);
				});
				// Allow plugins to override text sources data
				_this.getPlayer().triggerHelper( 'ccDataLoaded', [_this.textSources, function(textSources){
					_this.textSources = textSources;
				}]);

				// Handle Force loading of captions
				if( _this.getConfig('forceLoadLanguage') ) {
					_this.forceLoadLanguage();
				}

				if( _this.getConfig('displayCaptions') !== false || ($.cookie( _this.cookieName ) !== 'None' && $.cookie( _this.cookieName )) ){
					_this.autoSelectSource();
					if( _this.selectedSource ){
						_this.setTextSource(_this.selectedSource, false);
					}
				}
				callback();
			});
		},
		loadCaptionsFromApi: function( callback ){
			if(!this.getPlayer().kentryid){
				this.log('loadCaptionsFromApi:: Entry Id not found, exit.');
				callback([]);
				return;

			}
			var _this = this;
			this.getKalturaClient().doRequest( {
				'service' : 'caption_captionasset',
				'action' : 'list',
				'filter:objectType' : 'KalturaAssetFilter',
				'filter:entryIdEqual' : this.getPlayer().kentryid,
				'filter:statusEqual' : 2,
				'pager:pageSize': 50
			}, function( data ) {
				mw.log( "mw.ClosedCaptions:: loadCaptionsFromApi: " + data.totalCount, data.objects );
				if( data.objects && data.objects.length ){
					// white list languages by their label
					if( _this.getConfig("whiteListLanguagesCodes") != null){
						mw.log( "mw.ClosedCaptions:: whitelist : " + _this.getConfig("whiteListLanguagesCodes") );
						var whiteListedLaguages = new Array();
						var whiteListArr = _this.getConfig("whiteListLanguagesCodes").split(",");
						for(var j=0 ; j<whiteListArr.length ; j++){
							for(var i=data.objects.length-1 ; i > -1 ; i--){
								if( data.objects[i].languageCode == whiteListArr[j]){
									whiteListedLaguages.push(data.objects[i]);
								}
							}
						}
						data.objects = whiteListedLaguages;
						if(!data.objects.length && _this.getConfig("hideWhenEmpty") == true){
							_this.getBtn().hide();
						}

					}
					_this.loadCaptionsURLsFromApi( data.objects, callback );

				} else {
					// No captions
					callback([]);
				}
			});
		},
		loadCaptionsURLsFromApi: function( captions, callback ){
			var _this = this;
			var multiRequest = [],
				captionIds = [];
			// Generate multi-request for captions URLs
			$.each( captions, function( inx, caption ) {
				multiRequest.push({ 
					'service' : 'caption_captionasset',
					'action' : 'getUrl',
					'id' : caption.id
				});
				captionIds.push( caption.id );
			});
			if ( multiRequest.length ) {
				this.getKalturaClient().doRequest( multiRequest, function( result ) {
					var captionsURLs = {};
					if( typeof result == 'string'){
						captionsURLs[ captionIds[ 0 ] ] = result;
					} else {
						// Store captions URLs in array
						$.each( result, function( idx, captionUrl ) {
							captionsURLs[ captionIds[ idx ] ] = captionUrl;
						} );
					}
					// Store caption URLs locally
					_this.captionURLs = captionsURLs;
					// Done adding source issue callback
					mw.log( 'mw.ClosedCaptions:: loadCaptionsURLsFromApi> total captions count: ' + captions.length );
					callback( captions );
				} );
			}
		},
		getTextSourceFromDB: function( dbTextSource ) {
			var _this = this;
			if( !dbTextSource.fileExt ){
				// TODO other format mappings?
				switch( dbTextSource.format ){
					case '1':
						dbTextSource.fileExt = 'srt';
						break;
					case '2':
						dbTextSource.fileExt = 'xml';
						break;
				}
			}

			var captionsSrc;
			if( mw.isIphone() && !mw.getConfig('disableTrackElement') && !this.getConfig('forceLoadLanguage') ) {
				// getting generated vtt file from dfxp/srt
				captionsSrc = mw.getConfig('Kaltura.ServiceUrl') +
							"/api_v3/index.php/service/caption_captionasset/action/serveWebVTT/captionAssetId/" +
							dbTextSource.id +
							"/segmentIndex/-1/version/2/captions.vtt";
			} else {
				captionsSrc = this.getCaptionURL( dbTextSource.id ) + '/.' + dbTextSource.fileExt;
			}

			this.bind( 'onChangeMediaDone', function () {
				_this.embedPlayer.getInterface().find( 'track').remove();
			});

			// Try to insert the track source:
			var embedSource = this.embedPlayer.mediaElement.tryAddSource(
				$( '<track />' ).attr({
					'kind'		: 'subtitles',
					'language'	: dbTextSource.language,
					'srclang' 	: dbTextSource.languageCode,
					'label'		: dbTextSource.label || dbTextSource.language,
					'id'		: dbTextSource.id,
					'fileExt'	: dbTextSource.fileExt,
					'src'		: captionsSrc,
					'title'		: dbTextSource.label,
					'default'	: dbTextSource.isDefault
				})[0]
			);
			// Return a "textSource" object:
			return new mw.TextSource( embedSource );
		},
		forceLoadLanguage: function(){
			var lang = this.getConfig('forceLoadLanguage');
			var source = this.selectSourceByLangKey( lang );
			// Found caption
			if( source && !source.loaded ) {
				source.load($.proxy(function(){
					this.getPlayer().triggerHelper('forcedCaptionLoaded', source);
				},this));
			}
		},
		autoSelectSource: function(){
			var _this = this;
			this.selectedSource = null;
			if( ! this.textSources.length ){
				this.log("Error:: autoSelectSource no textSources set" );
				return ;
			}

			var source = null;
			// Get source by user language
			if( this.getUserLanguageKeyPrefrence() ){
				source = this.selectSourceByLangKey( this.getUserLanguageKeyPrefrence() );
				if( source ){
					this.log('autoSelectSource: select by user preference');
					this.selectedSource = source;
					return ;
				}
			}
			// Get source by plugin default language
			var defaultLangKey = this.getConfig('defaultLanguageKey');
			if( !this.selectedSource && defaultLangKey ){
				if( defaultLangKey == 'None' ){
					return ;
				}
				source = this.selectSourceByLangKey( defaultLangKey );
				if( source ){
					this.log('autoSelectSource: select by defaultLanguageKey: ' + defaultLangKey);
					this.selectedSource = source;
					this.embedPlayer.getInterface().find( '[srclang='+ defaultLangKey +']').attr("default", "true");
					return ;
				}				
			}
            // Get source by "default" property
            if ( !this.selectedSource ) {
                source = this.selectDefaultSource();
                if( source ){
                    this.log('autoSelectSource: select by default caption');
                    this.selectedSource = source;
                }
            }
			// Get from $_SERVER['HTTP_ACCEPT_LANGUAGE']
			if( !this.selectedSource && mw.getConfig('Kaltura.UserLanguage') ){
				$.each(mw.getConfig('Kaltura.UserLanguage'), function(lang, priority){
					source = _this.selectSourceByLangKey( lang );
					if( source ){
						_this.log('autoSelectSource: select by browser language: ' + lang);
						_this.selectedSource = source;
						return true;
					}
				});
			}
			// Else, get the first caption
			if( !this.selectedSource ){
				this.log('autoSelectSource: select first caption');
				this.selectedSource = this.textSources[0];
			}
		},
		selectSourceByLangKey: function( langKey ){
			var selectedSource = null;
			$.each(this.textSources, function(idx, source){
				if( source.srclang && langKey == source.srclang.toLowerCase() ){
					selectedSource = source;
					return false;
				}
			});
			return selectedSource;
		},
		selectDefaultSource: function(){
			var selectedSource = null;
			$.each(this.textSources, function(idx, source){
				if( source['default'] ){
					selectedSource = source;
					return false;
				}
			});
			return selectedSource;
		},
		monitor: function(){
			this.updateSourceDisplay( this.selectedSource, this.getPlayer().currentTime );
		},
		updateSourceDisplay: function ( source, time ) {
			var _this = this;
			if( this.timeOffset ){
				time = time + parseInt( this.timeOffset );
			}

			// Get the source text for the requested time:
			var activeCaptions = source.getCaptionForTime( time );
			var addedCaption = false;

			// Show captions that are on:
			$.each( activeCaptions, function( capId, caption ){
				if( _this.embedPlayer.getInterface().find( '.track[data-capId="' + capId +'"]').length == 0){
					_this.addCaption( source, capId, caption );
					addedCaption = true;
				}
			});
			// hide captions that are off:
			_this.embedPlayer.getInterface().find( '.track' ).each(function( inx, caption){
				if( !activeCaptions[ $( caption ).attr('data-capId') ] ){
					if( addedCaption ){
						$( caption ).remove();
					} else {
						$( caption ).fadeOut( mw.getConfig('EmbedPlayer.MonitorRate'), function(){$(this).remove();} );
					}
				}
			});
		},

		addCaption: function( source, capId, caption ){
			// use capId as a class instead of id for easy selections and no conflicts with
			// multiple players on page.
			var $textTarget = $('<div />')
				.addClass( 'track' )
				.attr( 'data-capId', capId )
				.hide();

			// Update text ( use "html" instead of "text" so that subtitle format can
			// include html formating
			// TOOD we should scrub this for non-formating html
			$textTarget.append(
				$('<span />')
					.addClass( 'ttmlStyled' )
					.css( 'pointer-events', 'auto')
					.css( this.getCaptionCss() )
					.append(
						$('<span>')
						// Prevent background (color) overflowing TimedText
						// http://stackoverflow.com/questions/9077887/avoid-overlapping-rows-in-inline-element-with-a-background-color-applied
						.css( 'position', 'relative' )
						.html( caption.content )
					)
			);

			// Add/update the lang option
			$textTarget.attr( 'lang', source.srclang.toLowerCase() );

			// Update any links to point to a new window
			$textTarget.find( 'a' ).attr( 'target', '_blank' );

			// Add TTML or other complex text styles / layouts if we have ontop captions:
			if( this.getConfig('layout') == 'ontop' ){
				if( caption.css ){
					$textTarget.css( caption.css );
				} else {
					$textTarget.css( this.getDefaultStyle() );
				}
			}
			// Apply any custom style ( if we are ontop of the video )
			this.displayTextTarget( $textTarget );

			// apply any interface size adjustments:
			$textTarget.css( this.getInterfaceSizeTextCss({
					'width' :  this.embedPlayer.getInterface().width(),
					'height' : this.embedPlayer.getInterface().height()
				})
			);

			// Update the style of the text object if set
			if( caption.styleId ){
				var capCss = source.getStyleCssById( caption.styleId );
				$textTarget.find('span.ttmlStyled').css(
					capCss
				);
			}
			$textTarget.fadeIn('fast');
		},
		displayTextTarget: function( $textTarget ){
			var embedPlayer = this.embedPlayer;
			var $interface = embedPlayer.getInterface();

			if( this.getConfig('layout') == 'ontop' ){
				this.addTextOverlay(
					$textTarget
				);
			} else if( this.getConfig('layout') == 'below' ){
				this.addTextBelowVideo( $textTarget );
			} else {
				this.log("Possible Error, layout mode not recognized: " + this.getConfig('layout') );
			}
		},
		getInterfaceSizeTextCss: function( size ) {
			//mw.log(' win size is: ' + $( window ).width() + ' ts: ' + textSize );
			return {
				'font-size' : this.getInterfaceSizePercent( size ) + '%'
			};
		},
		getCaptionsOverlay: function(){
			return this.getPlayer().getInterface().find('.captionsOverlay');
		},
		addTextOverlay: function( $textTarget ){
			var _this = this;
			var $captionsOverlayTarget = this.getCaptionsOverlay();
			var layoutCss = {
				'left': 0,
				'top': 0,
				'bottom': 0,
				'right': 0,
				'position': 'absolute'
			};

			if( $captionsOverlayTarget.length == 0 ){
				// TODO make this look more like addBelowVideoCaptionsTarget
				$captionsOverlayTarget = $( '<div />' )
				 	.addClass( 'captionsOverlay' )
					.css( layoutCss )
					.css('pointer-events', 'none');
				this.embedPlayer.getVideoHolder().append( $captionsOverlayTarget );
			}
			// Append the text:
			$captionsOverlayTarget.append( $textTarget );

		},
		addTextBelowVideo: function( $textTarget ) {
			var $interface = this.embedPlayer.getInterface();
			// Get the relative positioned player class from the layoutBuilder:
			this.embedPlayer.layoutBuilder.keepControlBarOnScreen = true;
			if( !$interface.find('.captionContainer').length || this.embedPlayer.useNativePlayerControls() ) {
				this.updateBelowVideoCaptionContainer();
			}
			$interface.find('.captionContainer').html($textTarget);
		},
		updateBelowVideoCaptionContainer: function(){
			var _this = this;
			mw.log( "TimedText:: updateBelowVideoCaptionContainer" );
			if (this.getConfig('displayCaptions') === false){
				return;
			}
			// Append after video container
			var $cc = _this.embedPlayer.getInterface().find('.captionContainer' );
			if( !$cc.length ){
				$cc = $('<div>').addClass( 'captionContainer block' )
				.css({
					'width' : '100%',
					'background-color' : '#000',
					'text-align' : 'center',
					'padding-top' : '5px'
				})
				_this.embedPlayer.getVideoHolder().after( $cc );
			}
			var height = ( _this.getInterfaceSizePercent({
				'width' :  _this.embedPlayer.getInterface().width(),
				'height' : _this.embedPlayer.getInterface().height()
			}) / 100 ) *  mw.getConfig( 'TimedText.BelowVideoBlackBoxHeight' );
			$cc.css( 'height',  height + 'px')
			
			// update embedPlayer layout per updated caption container size.
			 _this.embedPlayer.doUpdateLayout();
		},		
		/**
		 * Gets a text size percent relative to about 30 columns of text for 400
		 * pixel wide player, at 100% text size.
		 *
		 * @param size {object} The size of the target player area width and height
		 */
		getInterfaceSizePercent: function( size ) {
			// This is a ugly hack we should read "original player size" and set based
			// on some standard normal 31 columns 15 rows
			var sizeFactor = 4;
			if( size.height / size.width < .7 ){
				sizeFactor = 6;
			}
			var textSize = size.width / sizeFactor;
			if( textSize < 95 ){
				textSize = 95;
			}
			if( textSize > 150 ){
				textSize = 150;
			}
			return textSize;
		},		
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
				var hShadow = this.getConfig( 'hShadow' ) ? this.getConfig( 'hShadow' ) : 0;
				var vShadow = this.getConfig( 'vShadow' ) ? this.getConfig( 'vShadow' ) : 0;
				style[ "text-shadow" ] = hShadow + 'px ' + vShadow + 'px ' + this.getConfig( 'glowBlur' ) + 'px ' + mw.getHexColor( this.getConfig( 'glowColor' ) );
			}
			return style;
		},
		getDefaultStyle: function(){
			var baseCss =  {
				'position':'absolute',
				'bottom': this.defaultBottom,
				'width': '100%',
				'display': 'block',
				'opacity': .8,
				'text-align': 'center',
				'z-index': 2
			};
			baseCss = $.extend( baseCss, this.getInterfaceSizeTextCss({
				'width' :  this.embedPlayer.getInterface().width(),
				'height' : this.embedPlayer.getInterface().height()
			}));
			return baseCss;
		},
		buildMenu: function( sources ){
			for ( var i = sources.length - 1; i >= 0; i-- ){
				if ( sources[i].srclang && sources[i].srclang === "multilingual" ){
					sources.splice(i, 1); // remove multilingual source from menu
				}
			}
			var _this = this;
			mw.log('closedCaptions::buildMenu with sources: ', sources);
			// Destroy the old menu
			this.getMenu().destroy();

			// Check if we even have textSources
			if( sources == 0 ){
				this.setConfig('displayCaptions', false);

				if( this.getConfig('hideWhenEmpty') === true ) {
					this.getBtn().hide();
				}
				this.getMenu().addItem({
					'label': gM('mwe-timedtext-no-subtitles')
				});
				// hide old timed captions text
				this.hideCaptions();

				// Allow plugins to integrate with captions menu
				this.getPlayer().triggerHelper('captionsMenuReady');

				this.getPlayer().triggerHelper("updatePropertyEvent",{"plugin": this.pluginName, "property": "captions", "items": [{'label':gM('mwe-timedtext-no-subtitles'), 'value':gM('mwe-timedtext-no-subtitles')}]});

				return this.getMenu();
			} else {
				if( this.getConfig('hideWhenEmpty') == true ){
					this.setConfig('visible', true)
				}
				this.getBtn().show();
				// show new timed captions text if exists
				this.showCaptions();
			}

			// Add Off item as first element
			if( this.getConfig('showOffButton') && this.getConfig('offButtonPosition') == 'first' ) {
				this.addOffButton();
			}

			var items = [];
			// Add text sources
			$.each(sources, function( idx, source ){
				_this.getMenu().addItem({
					'label': source.label,
					'callback': function(){
						// If this caption is the same as current caption, toggle off captions
						if( _this.getConfig('toggleActiveCaption') && _this.selectedSource === source ) {
							_this.selectedSource = null;
							_this.setConfig('displayCaptions', false);
						} else {
							_this.setTextSource( source );
							_this.getActiveCaption();
						}
					},
					'active': ( _this.selectedSource === source && _this.getConfig( "displayCaptions" )  )
				});
				items.push({'label':source.label, 'value':source.label});
			});

			this.getActiveCaption();
			// Add Off item as last element
			if( this.getConfig('showOffButton') && this.getConfig('offButtonPosition') == 'last' ) {
				this.addOffButton();
			}

			if ( this.getConfig('showOffButton')){
				items.unshift({'label':'Off', 'value':'Off'});
			}

			// dispatch event to be used by a master plugin if defined
			this.getPlayer().triggerHelper("updatePropertyEvent",{"plugin": this.pluginName, "property": "captions", "items": items, "selectedItem": this.getMenu().$el.find('.active a').text()});

			// Allow plugins to integrate with captions menu
			this.getPlayer().triggerHelper('captionsMenuReady');
		},
		addOffButton: function() {
			var _this = this;
			this.getMenu().addItem({
				'label': 'Off',
				'attributes': {
					'class': "offBtn"
				},
				'callback': function(){
					_this.selectedSource = null;
					_this.setConfig('displayCaptions', false);
					// also update the cookie to "None"
					_this.getPlayer().setCookie( _this.cookieName, 'None' );
				},
				'active': ! _this.getConfig( "displayCaptions" ) 
			});
		},
		setTextSource: function( source, setCookie ){
			setCookie = ( setCookie === undefined ) ? true : setCookie;
			var _this = this;
			if( !source.loaded ){
				this.embedPlayer.getInterface().find('.track').text( gM('mwe-timedtext-loading-text') );
				source.load(function(){
					_this.getPlayer().triggerHelper('newClosedCaptionsData' , _this.selectedSource);
					if( _this.playbackStarted ){
						_this.monitor();
					}
				});
			}
			this.selectedSource = source;

			if( !this.getConfig('displayCaptions') ){
				_this.getActiveCaption();
				this.setConfig('displayCaptions', true );
			}
			// Save to cookie
			if( setCookie && this.getConfig('useCookie') ){
				this.getPlayer().setCookie( this.cookieName, source.srclang.toLowerCase() );
			}

			this.getPlayer().triggerHelper('changedClosedCaptions', {language: this.selectedSource.label ? this.selectedSource.label : ""});
		},
		getActiveCaption: function(){
			var _this = this;
			var currentActiveCaption = this.getMenu().$el.find('.active').index();
			if( this.lastActiveCaption === null ) {
				_this.lastActiveCaption = currentActiveCaption;
				return _this.lastActiveCaption;
			}
			if( this.lastActiveCaption != currentActiveCaption ) {
				_this.lastActiveCaption = currentActiveCaption;
				return _this.lastActiveCaption;
			}
		},
		getComponent: function(){
			var _this = this;
			if( !this.$el ){
				var $menu = $( '<ul />' ).addClass( 'dropdown-menu' );
				var $button = $( '<button />' )
								.addClass( 'btn icon-cc' )
								.attr('title', gM( 'mwe-embedplayer-timed_text' ) )
								.click( function(e){
									if ( _this.getMenu().numOfChildren() > 0 ) {
										_this.getMenu().toggle();
									} else {
										_this.getPlayer().triggerHelper( "showHideClosedCaptions" );
									}

								});
                this.setAccessibility($button, gM( 'mwe-embedplayer-timed_text' ));
				this.$el = $( '<div />' )
								.addClass( 'dropup' + this.getCssClass() )
								.append( $button, $menu );
			}
			return this.$el;
		},
		getMenu: function(){
			if( !this.menu ) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex')
				});
			}
			return this.menu;			
		},
		getBtn: function(){
			return this.getComponent().find('button');
		},
		destory: function(){
			this.playbackStarted = false;
			// Empty existing text sources
			this.textSources = [];
			this.selectedSource = null;
		},
        parseCaption: function(caption){
            var parsedCaption = caption.content;

            //find timeStamp in caption string (for example: 00:00:01.000 --> 00:00:01.200) and cut it if exists
            var regExp = /^\d{2}:\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}:\d{2}\.\d{3}\s/;
            if( regExp.test(parsedCaption ))
                parsedCaption=parsedCaption.replace(regExp,"");

            //find align expression in caption string (for example: align:middle) and cut it if exists
            regExp = /align:(left|middle|right)/;
            if( regExp.test(parsedCaption ))
                parsedCaption=parsedCaption.replace(regExp,"");

            return { "content" : parsedCaption };
        }
	}));

} )( window.mw, window.jQuery );