( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'closedCaptions', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 62,
         	"displayImportance": "high",
         	"align": "right",
         	"showTooltip": true,
         	"layout": "ontop", // "below"
         	"displayCaptions": null, // null will use user preference
         	"defaultLanguageKey": null,
         	"useCookie": true,
         	"hideWhenEmpty": false
		},

		textSources: [],

		setup: function(){
			var _this = this;

			// Set cookie name
			this.cookieName = this.pluginName + '_languageKey';

			this.bind( 'playerReady', function(){
				_this.destory();
				_this.setupTextSources(function(){
					_this.buildMenu();
				});
			});
			this.bind( 'onplay', function(){
				_this.playbackStarted = true;
			});
			this.bind( 'hidePlayerControls', function(){
				_this.getComponent().removeClass( 'open' );
			});
			this.bind( 'timeupdate', function(){
				if( _this.getConfig('displayCaptions') === true && _this.selectedSource ){
					_this.monitor();
				}
			});
			this.bind( 'showHideClosedCaptions', function(){
				if( _this.getConfig('displayCaptions') === true ){
					_this.setConfig('displayCaptions', false);
				} else {
					_this.setConfig('displayCaptions', true);
				}
			});

			if( this.getConfig('layout') == 'below' ){
				this.updateBelowVideoCaptionContainer();
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
			this.getCaptionsOverlay().hide();
		},
		showCaptions: function(){
			this.getCaptionsOverlay().show();
		},
		getCaptionURL: function( captionId ){
			if( this.captionURLs && this.captionURLs[ captionId ] ){
				return this.captionURLs[ captionId ];
			} 
			return null;
		},
		setupTextSources: function( callback ){
			var _this = this;

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
				_this.getPlayer().triggerHelper( 'ccDataLoaded', [_this.textSource, function(textSources){
					_this.textSources = textSources;
				}]);
				if( _this.getConfig('displayCaptions') !== false ){
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
				return;
				callback([]);
			}
			var _this = this;
			this.getKalturaClient().doRequest( {
				'service' : 'caption_captionasset',
				'action' : 'list',
				'filter:objectType' : 'KalturaAssetFilter',
				'filter:entryIdEqual' : this.getPlayer().kentryid,
				'filter:statusEqual' : 2
			}, function( data ) {
				mw.log( "mw.ClosedCaptions:: loadCaptionsFromApi: " + data.totalCount, data.objects );
				if( data.objects.length ){
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
					// Store captions URLs in array
					$.each( result, function( idx, captionUrl ) {
						captionsURLs[ captionIds[ idx ] ] = captionUrl;
					} );
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
					'src'		: this.getCaptionURL( dbTextSource.id ) + '/.' + dbTextSource.fileExt,
					'title'		: dbTextSource.label,
					'default'	: dbTextSource.isDefault
				})[0]
			);
			// Return a "textSource" object:
			return new mw.TextSource( embedSource );
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
					return ;
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
			// Get source by "default" property
			if ( !this.selectedSource ) {
				source = this.selectDefaultSource();
				if( source ){
					this.log('autoSelectSource: select by default caption');
					this.selectedSource = source;
				}
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
				if( langKey == source.srclang.toLowerCase() ){
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
					.html( caption.content )
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
				style[ "text-shadow" ] = '0 0 ' + this.getConfig( 'glowBlur' ) + 'px ' + mw.getHexColor( this.getConfig( 'glowColor' ) );
			}
			return style;
		},
		getDefaultStyle: function(){
			var defaultBottom = 15;
			if( this.embedPlayer.isOverlayControls() && !this.embedPlayer.getInterface().find( '.controlBarContainer' ).is( ':hidden' ) ) {
				defaultBottom += this.embedPlayer.layoutBuilder.getHeight();
			}
			var baseCss =  {
				'position':'absolute',
				'bottom': defaultBottom,
				'width': '100%',
				'display': 'block',
				'opacity': .8,
				'text-align': 'center',
				'z-index': 2
			};
			baseCss =$.extend( baseCss, this.getInterfaceSizeTextCss({
				'width' :  this.embedPlayer.getInterface().width(),
				'height' : this.embedPlayer.getInterface().height()
			}));
			return baseCss;
		},
		buildMenu: function(){
			var _this = this;

			// Destroy the old menu
			this.getMenu().destroy();

			// Check if we even have textSources
			if( this.textSources.length == 0 ){
				if( this.getConfig('hideWhenEmpty') === true ) {
					this.getBtn().hide();
				}
				this.getMenu().addItem({
					'label': gM('mwe-timedtext-no-subtitles'),
				});
				return this.getMenu();
			}

			// Add Off item
			this.getMenu().addItem({
				'label': 'Off',
				'callback': function(){
					_this.setConfig('displayCaptions', false);
				}
			});

			// Add text sources
			$.each(this.textSources, function( idx, source ){
				_this.getMenu().addItem({
					'label': source.label,
					'callback': function(){
						_this.setTextSource( source );
					},
					'active': ( _this.selectedSource === source )
				})
			});
		},
		setTextSource: function( source, setCookie ){
			setCookie = ( setCookie === undefined ) ? true : setCookie;
			var _this = this;
			if( !source.loaded ){
				this.embedPlayer.getInterface().find('.track').text( gM('mwe-timedtext-loading-text') );
				source.load(function(){
					_this.getPlayer().triggerHelper('newClosedCaptionsData');
					if( _this.playbackStarted ){
						_this.monitor();
					}
				});
			}
			this.selectedSource = source;
			if( !this.getConfig('displayCaptions') ){
				this.setConfig('displayCaptions', true );
			}
			// Save to cookie
			if( setCookie && this.getConfig('useCookie') ){
				this.getPlayer().setCookie( this.cookieName, source.srclang.toLowerCase() );
			}

			this.getPlayer().triggerHelper('changedClosedCaptions');
		},
		openMenu: function(){
			this.getComponent().addClass( 'open' );
		},
		closeMenu: function(){
			this.getComponent().removeClass( 'open ');
		},
		getComponent: function(){
			var _this = this;
			if( !this.$el ){
				var $menu = $( '<ul />' ).addClass( 'dropdown-menu' );
				var $button = $( '<button />' )
								.addClass( 'btn icon-cc' )
								.attr('title', gM( 'mwe-embedplayer-timed_text' ) )
								.click( function(e){
									_this.getMenu().toggle();
								});

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
		}
	}));

} )( window.mw, window.jQuery );