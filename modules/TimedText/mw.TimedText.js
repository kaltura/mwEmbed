/**
 * The Core timed Text interface object
 * 
 * handles class mappings for: 
 * 	menu display ( jquery.ui themeable )
 * 	timed text loading request
 *  timed text edit requests
 * 	timed text search & seek interface ( version 2 ) 
 *
 * @author: Michael Dale
 * 	
 * Some code borrowed from: http://www.annodex.net/~silvia/itext/elephant_no_skin_v2.html
 * ( Licensed under: MPL 1.1/GPL 2.0/LGPL 2.1 )
 * Contributor(s):
 *  Silvia Pfeiffer <silvia@siliva-pfeiffer.de>
 *
 */ 

mw.addMessages( {
	"mwe-timedtext-back-btn" : "Back",
	"mwe-timedtext-choose-text" : "Chose text",
	"mwe-timedtext-add-timed-text" : "Add timed text",
	"mwe-timedtext-loading-text-edit" : "Loading timed text editor", 
	
	"mwe-timedtext-search" : "Search clip",
	
	"mwe-timedtext-layout" : "Layout", 
	"mwe-timedtext-layout-ontop" : "Ontop of video",
	"mwe-timedtext-layout-below": "Below video", 
	"mwe-timedtext-layout-off" : "Hide subtitles",
	
	"mwe-timedtext-loading-text" : "Loading text ...",
	
	"mwe-timedtext-key-language": "$1, $2",
	
	"mwe-timedtext-textcat-cc" : "Captions",
	"mwe-timedtext-textcat-sub" : "Subtitles",
	"mwe-timedtext-textcat-tad" : "Audio description",
	"mwe-timedtext-textcat-ktv" : "Karaoke",
	"mwe-timedtext-textcat-tik" : "Ticker text",
	"mwe-timedtext-textcat-ar" : "Active regions",
	"mwe-timedtext-textcat-nb" : "Annotation",
	"mwe-timedtext-textcat-meta" : "Timed metadata",
	"mwe-timedtext-textcat-trx" : "Transcript",
	"mwe-timedtext-textcat-lrc" : "Lyrics",
	"mwe-timedtext-textcat-lin" : "Linguistic markup",
	"mwe-timedtext-textcat-cue" : "Cue points"
} );

// Bind to mw ( for uncluttered global namespace ) 
( function( $ ) {
	
	/** 
	 * Timed Text Object
	 * @param embedPlayer Host player for timedText interfaces 
	 */
	mw.TimedText = function( embedPlayer, options ) {
		return this.init( embedPlayer, options);
	}
	mw.TimedText.prototype = {
		
		/** 
		* Preferences config order is presently: 
		* 1) user cookie
		* 2) defaults provided in this config var: 
		*/
		config: {
			// Layout for basic "timedText" type can be 'ontop', 'off', 'below'
			'layout' : 'ontop',
			
			//Set the default local ( should be grabbed from the browser )
			'userLanugage' : 'en',
			
			//Set the default category of timedText to display ( un-categorized timed-text is by default "SUB"  )
			'userCategory' : 'SUB'
		},
		
		/**
		 * The list of enabled sources 
		 */
		enabledSources: null,
				
		
		/**
		 * Stores the last text string per category to avoid dom checks 
		 * for updated text 
		 */
		prevText: null,
		
		/**
		* Text sources ( a set of textSource objects )
		*/
		textSources: null,
		
		/**
		* Text Source(s) Setup Flag
		*/
		textSourceSetupFlag: null,
		
		/*
		 * Hard coded to "commons" right now .. but we will want to support per-asset provider id's
		 * in addition to a standard "callback" system from cross domain grabbing of srt's
		 */
		textProviderId : 'commons',
		
		/**
		* Valid "iText" categories
		*/
		validCategoriesKeys: [
			"CC",
			"SUB",
			"TAD",
			"KTV",
			"TIK",
			"AR",
			"NB",
			"META",
			"TRX",
			"LRC",
			"LIN",
			"CUE"
		],
		
		/**
		 * Timed text extension to mime map
		 */
		timedTextExtMime: {
			'srt': 'text/x-srt',
			'mw-srt': 'text/mw-srt',
			'cmml': 'text/cmml'
		},
			
		/**
		 * @constructor
		 * @param {Object} embedPlayer Host player for timedText interfaces  
		 */
		init: function( embedPlayer, options ) {
			var _this = this;
			mw.log("TimedText: init() ")
			this.embedPlayer = embedPlayer;	
			this.options = options;
			
			//Init internal variables: 
			this.enabledSources = [];
			this.prevText = '';
			this.textSources = [];
			this.textSourceSetupFlag = false;
			
			//Set default langauge via wgUserLanguage if set
			if( typeof wgUserLanguage != 'undefined') {
				this.config.userLanugage = wgUserLanguage;
			}
			
			// Load user preferences config:  
			preferenceConfig = mw.getUserConfig( 'timedTextConfig' );
			if( typeof preferenceConfig == 'object' ) {
				this.config = preferenceConfig;
			}
			
			// Set up embedPlayer hooks:			
			$j( embedPlayer ).bind( 'monitorEvent', function() {				
				_this.monitor();
				return false;
			} );
							
			$j( embedPlayer ).bind( 'playEvent', function() {
				// Will load and setup timedText sources (if not loaded already loaded )
				_this.setupTextSources();
			} );
		},
		
		/**
		* Setups available text sources
		*   loads text sources
		* 	auto-selects a source based on the user language
		* @param {Function} callback Function to be called once text sources are setup. 
		*/
		setupTextSources: function( callback ) {
			var _this = this;
			if( this.textSourceSetupFlag ) {
				if( callback ) {
					callback();
				}
				return ;
			}
			// Load textSources			
			_this.loadTextSources( function() {
				
				// Enable a default source and issue a request to "load it"
				_this.autoSelectSource();
			
				// Load and parse the text value of enabled text sources:
				_this.loadEnabledSources();
				
				_this.textSourceSetupFlag = true;
				
				if( callback ) {
					callback();
				}
			} );
		},
		
		/**
		* Binds the timed text menu 
		* and updates its content from "getMainMenu"
		*
		* @param {Object} target to display the menu
		* @param {Boolean} autoShow If the menu should be displayed 
		*/
		bindMenu: function( target , autoShow) {
			var _this = this;
			mw.log( "TimedText:bindMenu:" + target );
			_this.menuTarget = target;
			var $menuButton = this.embedPlayer.$interface.find( '.timed-text' );
			
			var positionOpts = { };
			if( this.embedPlayer.supports[ 'overlays' ] ){
				var positionOpts = {
					'directionV' : 'up',								
					'offsetY' : this.embedPlayer.ctrlBuilder.getHeight(),
					'directionH' : 'left',
					'offsetX' : -28
				};		
			}
			
			// Else bind and show the menu 
			// We already have a loader in embedPlayer so the delay of
			// setupTextSources is already taken into account
			_this.setupTextSources( function() {
				// NOTE: Button target should be an option or config
				$menuButton.unbind().menu( {
					'content'	: _this.getMainMenu(),
					'zindex' : mw.getConfig( 'fullScreenIndex' ),
					'crumbDefaultText' : ' ',
					'autoShow': autoShow,
					'targetMenuContainer' : _this.menuTarget,
					'positionOpts' : positionOpts,
					'backLinkText' : gM( 'mwe-timedtext-back-btn' )
				} )
			});
		},
		
		/**
		* Monitor video time and update timed text filed[s]
		*/ 
		monitor: function( ) {
			//mw.log(" timed Text monitor: " + this.enabledSources.length );
			embedPlayer = this.embedPlayer;
			// Setup local reference to currentTime: 
			var currentTime = embedPlayer.currentTime;
			
			// Get the text per category
			var textCategories = [ ];
						
			for( var i = 0; i <  this.enabledSources.length ; i++ ) {
				var source =  this.enabledSources[ i ];
				this.updateSourceDisplay( source, currentTime );
			}
		},
		
		/**
		 * Load all the available text sources from the inline embed
		 * 	or from a apiProvider
		 * @param {Function} callback Function to call once text sources are loaded
		 */
		loadTextSources: function( callback ) {
			var _this = this;
			this.textSources = [ ];
			// Get local reference to all timed text sources: ( text/xml, text/x-srt etc )
			var inlineSources = this.embedPlayer.mediaElement.getSources( 'text' );
			// Add all the sources to textSources
			for( var i = 0 ; i < inlineSources.length ; i++ ) {
				// make a new textSource:
				var source = new TextSource( inlineSources[i] );
				this.textSources.push( source );
			}			
			
			//If there are no inline sources check & apiTitleKey
			if( !this.embedPlayer.apiTitleKey ) {
				//no other sources just issue the callback:
				callback();
				return ;
			}
			
			// Try to get sources from text provider:
			var provider_id = ( this.embedPlayer.apiProvider ) ?  this.embedPlayer.apiProvider : 'local'; 
			var apiUrl = mw.getApiProviderURL( provider_id );
			var assetKey = 	this.embedPlayer.apiTitleKey;
			if( !apiUrl || !assetKey ) {
				mw.log("Error: loading source without apiProvider or apiTitleKey");
				return ;
			}
			//For now only support mediaWikiText provider library
			this.textProvider = new mw.MediaWikiTextProvider( {
				'provider_id' : provider_id,
				'apiUrl': apiUrl,
				'embedPlayer': this.embedPlayer
			} );
					
			// Load the textProvider sources
			this.textProvider.loadSources( assetKey,  function( textSources ) {
				for( var i in textSources ) {
					var textSource = textSources[ i ];
					// Try to insert the itext source: 
					var textElm = document.createElement( 'itext' );
					$j( textElm ).attr( {
						'category' : 'SUB',
						'lang' 	: textSource.lang,
						'type' 	: _this.timedTextExtMime[ textSource.extension ],
						'titleKey' 	: textSource.titleKey
					} );
					//debugger;
					// Add the sources to the parent embedPlayer 
					// ( in case other interfaces want to access them )
					var embedSource = _this.embedPlayer.mediaElement.tryAddSource( textElm );	
					// Get a "textSource" object:
					var source = new TextSource( embedSource, _this.textProvider );
					_this.textSources.push( source );
				}
				// All sources loaded run callback: 
				callback();
			} );		
		},
		
		/**
		* Get the layout mode
		* 
		* Takes into consideration: 
		* 	Playback method overlays support ( have to put subtitles bellow video )
		* 	 
		*/
		getLayoutMode: function() {
		 	// Re-map "ontop" to "below" if player does not support 
		 	if( this.config.layout == 'ontop' && !this.embedPlayer.supports['overlays']  ) {
		 		this.config.layout = 'below';
		 	}	
		 	return this.config.layout;	
		},
		
		/**
		* Auto selects a source given the local configuration 
		* 
		* NOTE: presently this selects a "single" source. 
		* In the future we could support multiple "enabled sources" 
		*/
		autoSelectSource: function() {
			this.enabledSources = [];
									
			// Check if any source matches our "local"
			for( var i in this.textSources ) {
				var source = this.textSources[ i ];		
				if( this.config.userLanugage  &&
					this.config.userLanugage == source.lang.toLowerCase() ) {
					// Check for category if available  
					this.enabledSources.push( source );
					return ;
				} 
			}
			// If no userLang, source try enabling English:
			if( this.enabledSources.length == 0 ) {
				for( var i in this.textSources ) {
					var source = this.textSources[ i ];
					if( source.lang.toLowerCase() == 'en' ) {
						this.enabledSources.push( source );
						return ;
					}
				}	
			}
			// If still no source try the first source we get; 
			if( this.enabledSources.length == 0 ) {
				for( var i in this.textSources ) {
					var source = this.textSources[ i ];
					this.enabledSources.push( source );
					return ;
				}	
			}
		},
				
		/**
		* Issue a request to load all enabled Sources
		*  Should be called anytime enabled Source list is updatd
		*/
		loadEnabledSources: function() {
			for(var i in this.enabledSources ) {
				var enabledSource = this.enabledSources[ i ];
				if( ! enabledSource.loaded )
					enabledSource.load();
			}
		},			
		
		/**
		* Selection of a menu item
		* 
		* @param {Element} item Item selected
		*/
		selectMenuItem: function( item ) {
			mw.log("selectMenuItem: " + $j( item ).find('a').attr('class') );
		},	
		
		/**
		* Checks if a source is "on"
		* @return 
		* 	true if source is on
		* 	false if source is off
		* @type {Boolean}
		*/		
		isSourceEnabled: function( source ) {
			for(var i in this.enabledSources ) {
				var enabledSource = this.enabledSources[i];
				if( source.id ) {
					if( source.id == enabledSource.id )
						return true;
				}
				if( source.lang ) {
					if( source.lang == enabledSource.lang )
						return true;
				}
			}	
			return false;
		},
		
		/**
		* Get a source object by language, returns "false" if not found
		*/
		getSourceByLanguage: function ( langKey ) {
			for(var i in this.textSources) {
				var source = this.textSources[ i ];
				if( source.lang == langKey )
					return source;
			}
			return false;
		},
		
		/**
		* Builds the core timed Text menu and 
		* returns the binded jquery object / dom set
		*
		* Assumes text sources have been setup: (  _this.setupTextSources() )
		* 
		* calls a few sub-functions:
		* Basic menu layout:
		*		Chose Language
		*			All Subtiles here ( if we have categories list them ) 
		*		Layout	
		*			Bellow video
		*			Ontop video ( only available to supported plugins )
		*		[ Search Text ]
		*			[ This video ] 
		*			[ All videos ]
		*		[ Chapters ] seek to chapter
		*/
		getMainMenu: function() {
			var _this = this;
		
			
			// Build the source list menu item:	
			$menu = $j( '<ul>' );
			// Chouse text menu item ( if there are sources)
			if( _this.textSources.length != 0 ) {
				$menu.append( 
					$j.getLineItem( gM( 'mwe-timedtext-choose-text'), 'comment' ).append(
						_this.getLanguageMenu()
					),
						// Layout Menu option
					$j.getLineItem( gM( 'mwe-timedtext-layout' ), 'image' ).append(
						_this.getLayoutMenu()
					)
					
					// Search Menu option
					//$j.getLineItem( gM('mwe-timedtext-search'),  'search')
				);
			}
			// Put in the "Make Transcript" link
			$menu.append(
				_this.getLiAddText()
			); 
			
										
			return $menu;
		},
		
		/**
		 * Shows the timed text edit ui
		 * 
		 * @param {String} mode Mode or page to display ( to differentiate between edit vs new transcript) 
		 */		
		showTimedTextEditUI: function( mode ) {
			var _this = this;
			// Show a loader:
			mw.addLoaderDialog( gM( 'mwe-timedtext-loading-text-edit' ));
			// Load the timedText edit interface
			mw.load( 'TimedText.Edit', function() {
				if( ! _this.editText ) {
					_this.editText = new mw.TimedTextEdit( _this );
				}
				// Close the loader:
				mw.closeLoaderDialog();
				_this.editText.showUI();
			})
		},
		
		/**
		* Utility function to assist in menu build out:
		* Get menu line item (li) html:  <li><a> msgKey </a></li> 
		*
		* @param {String} msgKey Msg key for menu item
		*/
		
		/**
		 * Get the add text menu item: 
		 */		
		getLiAddText: function() {
			var _this = this;
			return $j.getLineItem( gM( 'mwe-timedtext-add-timed-text'), 'script', function() {
				_this.showTimedTextEditUI( 'add' );
			} )
		},
		
		/**
		* Get line item (li) from source object
		* @param {Object} source Source to get menu line item from
		*/
		getLiSource: function( source ) {
			var _this = this;
			//See if the source is currently "on"
			var source_icon = ( this.isSourceEnabled( source ) )? 'bullet' : 'radio-on'; 
			
			if( source.title ) {
				return $j.getLineItem( source.title, source_icon, function() {
					mw.log(" call selectTextSource");
					_this.selectTextSource( source ); 
				});
			}
			
			if( source.lang ) {
				var langKey = source.lang.toLowerCase();
				_this.getLanguageName ( langKey );
				return $j.getLineItem( 
					gM('mwe-timedtext-key-language', [langKey, unescape( mw.Language.names[ source.lang ] )	] ), 
					source_icon,
					function() {
						mw.log(" call selectTextSource");
						_this.selectTextSource( source ); 
					} 
				);
			}
		},			
		
		/**
	 	 * Get lagnuage name from language key
	 	 * @param {String} lang_key Language key
	 	 */
	 	getLanguageName: function( lang_key ) {
	 		if( mw.Language.names[ lang_key ]) {
	 			return mw.Language.names[ lang_key ];
	 		}
	 		return false
	 	},
		
		/** 
		* Builds and returns the "layout" menu 
		* @return {Object} 
		* 	The jquery menu dom object
		*/		
		getLayoutMenu: function() {
			var _this = this;
			var layoutOptions = [ ];
			
			//Only display the "ontop" option if the player supports it: 
			if( this.embedPlayer.supports[ 'overlays' ] )
				layoutOptions.push( 'ontop' );
				
			//Add below and "off" options: 
			layoutOptions.push( 'below' );
			layoutOptions.push( 'off' );
									
			$ul = $j('<ul>');
			$j.each( layoutOptions, function( na, layoutMode ) {
				var icon = ( _this.config.layout == layoutMode ) ? 'bullet' : 'radio-on';
				$ul.append( 
					$j.getLineItem( 
						gM( 'mwe-timedtext-layout-' + layoutMode), 
						icon,
						function() {
							_this.selectLayout( layoutMode );
						} ) 
					)
			});
			return $ul;
		},
		
		/**
		* Select a new layout
		* @param {Object} layoutMode The selected layout mode
		*/
		selectLayout: function( layoutMode ) {
			var _this = this;
			if( layoutMode != _this.config.layout ) {
				// Update the config and redraw layout
				_this.config.layout = layoutMode;
				
				// Update the user config: 
				mw.setUserConfig( 'timedTextConfig', _this.config);
						 
				// Update the display: 
				_this.updateLayout();
			}
		},
		
		/**
		* Updates the timed text layout ( should be called when  config.layout changes )
		*/
		updateLayout: function() {
			var $playerTarget =  this.embedPlayer.$interface;	
			$playerTarget.find('.itext').remove();
			this.refreshDisplay();
		},
		
		/**
		* Select a new source
		*
		* @param {Object} source Source object selected
		*/
		selectTextSource: function( source ) {
			var _this = this;
			mw.log(" select source: " + source.lang );			
			
			// Update the config language if the source includes language
			if( source.lang )
				this.config.userLanugage =  source.lang;
				
			if( source.category )
				this.config.userCategory = source.category;
			
			// (@@todo update category & setup category language buckets? )
			
			// Remove any other sources selected in sources category
			this.enabledSources = [];
			
			this.enabledSources.push( source );
			//Set any existing text target to "loading"
			if( !source.loaded ) {
				var $playerTarget = this.embedPlayer.$interface; 			
				$playerTarget.find('.itext').text( gM('mwe-timedtext-loading-text') );
			}
			// Load the text:
			source.load( function() {
				// Refresh the interface: 
				_this.refreshDisplay();
			})
		},
		
		/**
		* Refresh the display, updates the timedText layout, menu, and text display 
		*/
		refreshDisplay: function() {
			// Empty out previous text to force an interface update: 
			this.prevText = [];
			// Refresh the Menu (if it has a target to refresh) 
			if( this.menuTarget ) {
				mw.log('bind menu refresh display');
				this.bindMenu(  this.menuTarget, false )
			}
			// Issues a "monitor" command to update the timed text for the new layout
			this.monitor();
		},
		
		/**
		* Builds the language source list menu
		* checks all text sources for category and language key attribute
		*/
		getLanguageMenu: function() {
			var _this = this;

			// See if we have categories to worry about:

			var catSourceList = [ ];
			// ( All sources should have a category (depreciate ) 
			var sourcesWithoutCategory = [ ];
			for( var i in this.textSources ) {
				var source = this.textSources[ i ];
				if( source.category ) {
					var catKey = source.category ;
					// Init Category menu item if it does not already exist: 
					if( !catSourceList[ catKey ] ) {
						// Set up catList pointer: 
						catSourceList[ catKey ] = [ ]
					}
					// Append to the source category key menu item:
					catSourceList[ catKey ].push(
						_this.getLiSource( source )
					)		
				}else{
					sourcesWithoutCategory.push( _this.getLiSource( source ) );
				}
			}
			var $langMenu = $j('<ul>');
			// Check if we have multiple categories ( if not just list them under the parent menu item)
			if( catSourceList.length > 1 ) {
				for(var catKey in catSourceList) {
					$catChildren = $j('<ul>');
					for(var i in catSourceList[ catKey ]) {
						$catChildren.append(
							catSourceList[ catKey ][i]
						) 
					}
					// Append a cat menu item for each category list
					$langMenu.append(
						$j.getLineItem( gM( 'mwe-timedtext-textcat-' + catKey.toLowerCase() ) ).append(
							$catChildren
						)
					);
				}
			} else {
				for(var catKey in catSourceList) {
					for(var i in catSourceList[ catKey ]) {
						$langMenu.append(
							catSourceList[ catKey ][i]
						) 
					}
				}
			}		
			
			for(var i in sourcesWithoutCategory) {
				$langMenu.append( sourcesWithoutCategory[i] )
			}
			
			//Add in the "add text" to the end of the interface: 
			$langMenu.append( 
				_this.getLiAddText() 
			);
			
			return $langMenu; 
		},
		
		/**
		 * Updates a source display in the interface for a given time
		 * @param {Object} source Source to update
		 */
		updateSourceDisplay: function ( source, time ) {
			// Get the source text for the requested time: 
			var text = source.getTimedText( time );
			
			// We do a type comparison so that "undefined" != "false" 
			if( text === this.prevText[ source.category ] )
				return ;
			
			//mw.log( 'updateTextDisplay: ' + text );	
					
			var $playerTarget =  this.embedPlayer.$interface;
			var $textTarget = $playerTarget.find( '.itext_' + source.category + ' span' );
			// If we are missing the target add it: 
			if( $textTarget.length == 0) {
				this.addItextDiv( source.category )
				// Re-grab the textTarget:
				$textTarget = $playerTarget.find( '.itext_' + source.category + ' span' );
			}
			
			
			// If text is "false" fade out the subtitle: 
			if( text === false ) {
				$textTarget.fadeOut('fast');
			}else{
				// Fade in the target if not visible
				if( ! $textTarget.is(':visible') ) {
					$textTarget.fadeIn('fast');
				}					
				// Update text ( use "html" instead of "text" so that parsers can swap in html for formating
				$textTarget.html( text );
			}
			//mw.log( ' len: ' + $textTarget.length + ' ' + $textTarget.html() );
			// Update the prev text:
			this.prevText[ source.category ] = text;
		},
		
		
		/**
		 * Add an itext div to the embedPlayer
		 */
		addItextDiv: function( category ) {
			mw.log(" addItextDiv: " +  category )
			// Get the relative positioned player class from the ctrlBuilder:
			var $playerTarget =  this.embedPlayer.$interface;
			
			//Remove any existing itext divs for this player;
			$playerTarget.find('.itext_' + category ).remove();
			
			// Setup the display text div: 
			var layoutMode = this.getLayoutMode();
			if( layoutMode == 'ontop' ) {
				var $itext = $j('<div>')
					.addClass( 'itext' + ' ' + 'itext_' + category )
					.css( {							
						'position':'absolute',
						'bottom': ( this.embedPlayer.ctrlBuilder.getHeight() + 10 ),
						'width': '100%',
						'display': 'block',
						'opacity': .8,
						'text-align':'center'
					})
					.append(
						$j('<span \>')
					)									
				
				// If in fullscreen mode update the text size: 
				if( this.embedPlayer.ctrlBuilder.fullscreenMode ){
					$itext.css(
						this.embedPlayer.ctrlBuilder.getFullscreenTextCss()
					);					
				}
				$playerTarget.append( $itext );
				// Resize the interface for layoutMode == 'ontop' ( if not in fullscreen )  
				// NOTE this shoudl be a call to ctrlBuilder not handled here inline
				if( ! this.embedPlayer.ctrlBuilder.fullscreenMode ){
					if( this.embedPlayer.ctrlBuilder.checkOverlayControls() ){
						var playerHeight = this.embedPlayer.getHeight();
					} else {
						var playerHeight = this.embedPlayer.getHeight() + this.embedPlayer.ctrlBuilder.getHeight();
					}
					// Restore the player height	
					this.embedPlayer.$interface.animate({
						'height': playerHeight
					});
				}
			}else if ( layoutMode == 'below') {
				// Set the belowBar size to 60 pxiles: 
				var belowBarHeight = 60; 
				// Append before controls: 
				$playerTarget.find( '.control-bar' ).before(
					$j('<div>').addClass( 'itext' + ' ' + 'itext_' + category )
						.css({
							'display' : 'block',
							'width' : '100%',
							'height' : belowBarHeight + 'px',
							'background-color' : '#000',
							'text-align' : 'center',
							'padding-top' : '5px'
						} ).append(
							$j('<span>').css( {
								'color':'white'
							} )
						) 
				);		
				// Add some height for the bar and interface
				var height = ( belowBarHeight + 8 )  + this.embedPlayer.getHeight() + this.embedPlayer.ctrlBuilder.getHeight();				
				// Resize the interface for layoutMode == 'below' ( if not in full screen)
				if( ! this.embedPlayer.ctrlBuilder.fullscreenMode ){
					this.embedPlayer.$interface.animate({
						'height': height
					})
				}
				mw.log( ' height of ' + this.embedPlayer.id + ' is now: ' + $j( '#' + this.embedPlayer.id ).height() );
			}
			mw.log( 'should have been appended: ' + $playerTarget.find('.itext').length );
		}
	}
		
	/**
	 * TextSource object extends a base mediaSource object 
	 *  with some timedText features
	 *
	 * @param {Object} source Source object to extend
	 * @param {Object} {Optional} textProvider The text provider interface ( to load source from api ) 
	 */
	TextSource = function( source , textProvider) {
		return this.init( source, textProvider );
	}
	TextSource.prototype = {
	
		//The load state:
		loaded: false,
		
		// Container for the captions
		// captions include "start", "end" and "content" fields
		captions: [],
		
		// The previous index of the timed text served
		// Avoids searching the entire array on time updates. 
		prevIndex: 0,
		
		/**
		 * @constructor Inherits mediaSource from embedPlayer
		 * @param {source} Base source element
		 */
		init: function( source , textProvider) {
			for( var i in source) {
				this[i] = source[i];	
			}			
			// Set default category to subtitle if unset: 
			if( ! this.category ) {
				this.category = 'SUB';
			}
			//Set the textProvider if provided
			if( textProvider ) {
				this.textProvider = textProvider;
			}
		},
		
		/**
		 * Function to load and parse the source text
		 * @param {Function} callback Function called once text source is loaded
		 */
		load: function( callback ) {
			var _this = this;
						
			//check if its already loaded:
			if( _this.loaded ) {
				if( callback ) { 
					callback();
				}
			}
			// Set parser handler: 
			switch( this.getMIMEType() ) {
				//Special mediaWiki srt format ( support wiki-text in srt's )
				case 'text/mw-srt':
					var handler = parseMwSrt;
				break;
				case 'text/x-srt':
					var handler = parseSrt;
				break;
				case 'text/cmml':
					var handler = parseCMML;
				break;
				default: 
					var hanlder = null;
				break;
			}
			if( !handler ) {
				mw.log("Error: no handler for type: " + this.getMIMEType() );
				return ;
			}
			// Try to load src via src attr:
			if( this.getSrc() ) {
				// Issue the direct load request ( if we can ) 
				if ( !mw.isLocalDomain( this.getSrc() ) ) {
					mw.log("Error: cant load crossDomain src:" + this.getSrc()   )
					return ;
				}
				$j.get( this.getSrc(), function( data ) {
					// Parse and load captions:
					_this.captions = handler( data );
					// Update the loaded state:
					_this.loaded = true;
					if( callback ) { 
						callback();
					}
				}, 'text' );
				return ;
			}			
			
			// Try to load src via textProvider:
			if( this.textProvider && this.titleKey ) {
				this.textProvider.loadTitleKey( this.titleKey, function( data ) {
					if( data ) {
						_this.captions = handler( data );
					}
					if( callback ) { 
						callback();
					}
					return ;
				});
			}
		},
		
		/**
		* Returns the text content for requested time
		*
		* @param {String} time Time in seconds
		*/				
		getTimedText: function ( time ) {
			var prevCaption =  this.captions[ this.prevIndex ];
			
			// Setup the startIndex: 
			if( prevCaption && time >= prevCaption.start ) {
				var startIndex = this.prevIndex;
			}else{
				//If a backwards seek start searching at the start: 
				var startIndex = 0;
			}			 			
			// Start looking for the text via time, return first match: 
			for( var i = startIndex ; i < this.captions.length; i ++ ) {
				caption = this.captions[ i ];
				if( time >= caption.start  && 
					time <= caption.end ) {
					this.prevIndex = i;
					return caption.content;
				}
			}
			//No text found in range return false: 
			return false;
		}		
	}
	/**	
	 * parse mediaWiki html srt 
	 * @param {Object} data XML data string to be parsed
	 */
	function parseMwSrt( data ) {
		var captions = [ ];
		var curentCap = [];
		var parseNextAsTime = false;		
		// Optimize: we could use javascript strings functions instead of jQuery XML parsing:  		
		$j( '<div>' + data + '</div>' ).find('p').each( function() {					
			currentPtext = $j(this).html();
			//mw.log( 'pText: ' + currentPtext );
			
			//Check if the p matches the "all in one line" match: 
			var m = currentPtext.replace('--&gt;', '-->').match(/\d+\s(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?\n?(.*)/);
			if (m) {
				captions.push({
				'start': 
					(parseInt(m[1], 10) * 60 * 60) +
					(parseInt(m[2], 10) * 60) +
					(parseInt(m[3], 10)) +
					(parseInt(m[4], 10) / 1000),
				'end':
					(parseInt(m[5], 10) * 60 * 60) +
					(parseInt(m[6], 10) * 60) +
					(parseInt(m[7], 10)) +
					(parseInt(m[8], 10) / 1000),
				'content': $j.trim( m[9] )
				});
				return 'next';
			} 
			// Else check for multi-line match:
			if( parseInt( currentPtext ) ==  currentPtext ) {
				if( curentCap.length != 0) {
					captions.push( curentCap );
				}
				curentCap = {
					'content': ''
				};	
				return 'next';
			}
			//Check only for time match:
			var m = currentPtext.replace('--&gt;', '-->').match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
			if (m) {
				curentCap['start']= 
					(parseInt(m[1], 10) * 60 * 60) +
					(parseInt(m[2], 10) * 60) +
					(parseInt(m[3], 10)) +
					(parseInt(m[4], 10) / 1000);
				curentCap['end']=
					(parseInt(m[5], 10) * 60 * 60) +
					(parseInt(m[6], 10) * 60) +
					(parseInt(m[7], 10)) +
					(parseInt(m[8], 10) / 1000);
				return 'next';
			}
			//Else content for the curentCap
			if( currentPtext != '<br>' ) {
				curentCap['content'] +=  currentPtext;
			}
		});
		//Push last subtitle: 
		if( curentCap.length != 0) {
			captions.push( curentCap );
		}
		return captions;
	}
	/**
	 * srt timed text parse handle:
	 * @param {String} data Srt string to be parsed
	 */
	function parseSrt( data ) {		
		// Remove dos newlines
		var srt = data.replace(/\r+/g, '');

		// Trim white space start and end
		srt = srt.replace(/^\s+|\s+$/g, '');

		// Remove all html tags for security reasons
		srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, ''); 
	
		// Get captions
		var captions = [ ];
		var caplist = srt.split('\n\n');
		for (var i = 0; i < caplist.length; i=i+1) {
	 		var caption = "";
			var content, start, end, s;
			caption = caplist[i];
			s = caption.split(/\n/);
			if (s[0].match(/^\d+$/) && s[1].match(/\d+:\d+:\d+/)) {	        	
				// ignore caption number in s[0]
				// parse time string
				var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
				if (m) {
					start =
						(parseInt(m[1], 10) * 60 * 60) +
						(parseInt(m[2], 10) * 60) +
						(parseInt(m[3], 10)) +
						(parseInt(m[4], 10) / 1000);
					end =
						(parseInt(m[5], 10) * 60 * 60) +
						(parseInt(m[6], 10) * 60) +
						(parseInt(m[7], 10)) +
						(parseInt(m[8], 10) / 1000);
				} else {
					// Unrecognized timestring
					continue;
				}
				// concatenate text lines to html text
				content = s.slice(2).join("<br>");
			} else {
				// file format error or comment lines
				continue;
			}
			captions.push({
				'start' : start,
				'end' : end, 
				'content' : content
			} );
		}
	
		return captions;
	}
	/** 
	 * CMML parser handle
	 * @param {Mixed} data String or XML tree of CMML data to be parsed
	 */
	function parseCMML( data ) {
		var captions = [ ];
		$j( data ).find( 'clip' ).each( function( inx, clip ) {			
			var content, start, end;
			// mw.log(' on clip ' + clip.id);
			start = mw.npt2seconds( $j( clip ).attr( 'start' ).replace( 'npt:', '' ) );
			end = mw.npt2seconds( $j( clip ).attr( 'end' ).replace( 'npt:', '' ) );
			
			$j( clip ).find( 'body' ).each( function( binx, bn ) {
				if ( bn.textContent ) {
					content = bn.textContent;
				} else if ( bn.text ) {
					content = bn.text;
				}
			} );
			captions.push ( {
				'start' : start, 
				'end' : end, 
				'content' : content
			} );
		} );
		
		return captions;
	}
	
	/**
	 * Text Providers
	 * 
	 * text provider objects let you map your player to a timed text provider 
	 * can provide discovery, and contribution push back
	 * 
	
	// Will add a base class once we are serving more than just mediaWiki "commons"  
	mw.BaseTextProvider = function() {
		return this.init(); 
	}
	mw.BaseTextProvider.prototype = {
		init: function() {
			
		}
	} 

	 */
	 var default_textProvider_attr = [
		'apiUrl',
		'provider_id',
		'timed_text_NS',
		'embedPlayer'
	];
		
	mw.MediaWikiTextProvider = function( options ) {
		this.init( options )
	}	
	mw.MediaWikiTextProvider.prototype = {
		
		// The api url:
		apiUrl: null,
		
		// The timed text namespace
		timed_text_NS: null,
		
		/**
		* @constructor
		* @param {Object} options Set of options for the provider
		*/
		init: function( options ) {
			for(var i in default_textProvider_attr) {
				var attr =  default_textProvider_attr[ i ];
				if( options[ attr ] )
					this[ attr ] = options[ attr ];
					
			}
		},
		
		/**
		 * Loads a single text source by titleKey
		 * @param {titleKey}  
		 */
		loadTitleKey: function( titleKey, callback ) {
			var request = {
				'action': 'parse',
				'page': titleKey
			};
			mw.getJSON( this.apiUrl, request, function( data ) {
				if ( data && data.parse && data.parse.text['*'] ) {
					callback(  data.parse.text['*']  );
					return;
				}
				mw.log("Error: could not load:" + titleKey);
				callback( false );
			} );
		},
		
		/**
		 * Loads all available source for a given assetKey
		 *
		 * @param {String} assetKey  For mediaWiki the assetKey is the "wiki title"
		 */
		loadSources: function( assetKey, callback ) {
			var request = {};
			var _this = this;
			this.getSourcePages( assetKey, function( sourcePages ) {
				if( ! sourcePages.query.allpages ) {
					//Check if a shared asset
					mw.log( 'no subtitle pages found');
					callback();
					return ;
				}
				// We have sources put them into the player
				callback( _this.getSources( sourcePages ) );
			} );
		},
		
		/**
		 * Get the subtitle pages
		 * @param {String} titleKey Title to get subtitles for
		 * @param {Function} callback Function to call once NS subs are grabbed 
		 */ 
		getSourcePages: function( titleKey, callback ) {
			var _this = this;
			var request = {
				'list' : 'allpages',
				'apprefix' : titleKey,
				'apnamespace' : this.getTimedTextNS(),
				'aplimit' : 200,
				'prop':'revisions'
			};
			mw.getJSON( this.apiUrl, request, function( sourcePages ) {
				// If "timedText" is not a valid namespace try "just" with prefix: 
				if ( sourcePages.error && sourcePages.error.code == 'apunknown_apnamespace' ) {
					var request = { 
						'list' : 'allpages', 
						'apprefix' : _this.getCanonicalTimedTextNS() + ':' + _this.embedPlayer.apiTitleKey 
					};
					mw.getJSON( _this.apiUrl, request, function( sourcePages ) {
						callback( sourcePages )
					} );
				} else {
					callback( sourcePages );
				}
			} );
	 	},
	 	
	 	/**
	 	 * Get the sources from sourcePages data object ( api result )
	 	 * @param {Object} sourcePages Source page result object
	 	 */
	 	getSources: function( sourcePages  ) {
			var _this = this;
			// look for text tracks:
			var foundTextTracks = false;
			var sources = [];
			for ( var i in sourcePages.query.allpages ) {
				
				var subPage = sourcePages.query.allpages[i];
				var langKey = subPage.title.split( '.' );
				var extension = langKey.pop();
				langKey = langKey.pop();
				
				//NOTE: we hard code the mw-srt type
				// ( This is because mediaWiki srt files can have wiki-text and parsed as such )
				if( extension == 'srt' ) { 
					extension = 'mw-srt';
				}
				
				if ( ! _this.isSuportedLang( langKey ) ) {
					mw.log( 'Error: langkey:' + langKey + ' not supported' );
				} else {
					sources.push( {
						'extension': extension,
						'lang': langKey,
						'titleKey': subPage.title
					} );
				}
			}
			return sources;
	 	},
	 	
	 	/**
	 	 * Return the namespace (if not encoded on the page return default 102 )
	 	 */
	 	getTimedTextNS: function() {
	 		if( this.timed_text_NS )
	 			return this.timed_text_NS;
			if ( typeof wgNamespaceIds != 'undefined' && wgNamespaceIds['timedtext'] ) {
				this.timed_text_NS = wgNamespaceIds['timedtext'];
			}else{
				//default value is 102 ( probably should store this elsewhere )
				this.timed_text_NS = 102;
			}
			return this.timed_text_NS;
	 	},
	 	
	 	/**
	 	 * Get the Canonical timed text namespace text 
	 	 */
	 	getCanonicalTimedTextNS: function() {
	 		return 'TimedText';
	 	},	 	
	 	
	 	/**
	 	 * Check if the language is supported
	 	 */
	 	isSuportedLang: function( lang_key ) {
	 		if( mw.Language.names[ lang_key ]) {
	 			return true;
	 		}
	 		return false;
	 	}
	 	
	 }
	
	
} )( window.mw );

/**
* jQuery entry point for timedText interface:
*/
( function( $ ) {
	/**
	* jquery timedText binding.
	* Calls mw.timedText on the given selector
	* 
	* @param {Object} options Options for the timed text menu 
	*/
	$.fn.timedText = function ( action, target  ) {
		mw.log('fn.timedText:: ' + action + ' t: ' + target );
		if( !target ){
			options = action;
		}
		if( typeof options == 'undefined' )
			options = {};
		
		$j( this.selector ).each(function() {
			var embedPlayer = $j(this).get(0);
			
			// Setup timed text for the given player: 
			if( ! embedPlayer.timedText ) {
				embedPlayer.timedText = new mw.TimedText( embedPlayer, options);
			}
			
			//show the menu
			if( action == 'showMenu' ) {
				// Bind the menu to the target with autoShow = true
				mw.log('bind menu fn.timedText');
				embedPlayer.timedText.bindMenu( target, true );
			}
		} );
	}
} )( jQuery );