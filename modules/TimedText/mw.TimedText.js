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
 */

( function( mw, $ ) {

	// Merge in timed text related attributes:
	mw.mergeConfig( 'EmbedPlayer.SourceAttributes', [
  	   'srclang',
	   'category',
	   'label',
	   'data-mwtitle'
	]);
	
	/**
	 * Timed Text Object
	 * @param embedPlayer Host player for timedText interfaces
	 */
	mw.TimedText = function( embedPlayer, options ) {
		return this.init( embedPlayer, options);
	};
	
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

			//Set the default category of timedText to display ( un-categorized timed-text is by default "SUB" )
			'userCategory' : 'SUB'
		},

		/**
		 * The list of enabled sources
		 */
		enabledSources: [],

		/**
		 * The current language key
		 */
		currentLangKey : null,

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

		/**
		* Valid "Track" categories
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
		 * @constructor
		 * @param {Object} embedPlayer Host player for timedText interfaces
		 */
		init: function( embedPlayer, options ) {
			var _this = this;
			mw.log("TimedText: init() ");
			this.embedPlayer = embedPlayer;
			this.options = options;
			
			this.addPlayerBindings();

			// Load user preferences config:
			var preferenceConfig = $.cookie( 'TimedText.Preferences' );
			if( preferenceConfig !== null ) {
				this.config = JSON.parse(  preferenceConfig );
			}
			// Set up embedPlayer hooks:
		},
		
		addPlayerBindings: function(){
			
			var embedPlayer = this.embedPlayer;
			// Check for timed text support:
			$( embedPlayer ).bind( 'addControlBarComponent', function(event, controlBar ){
				if( mw.isTimedTextSupported( embedPlayer ) ){
					controlBar.supportedComponets['timedText'] = true;
					controlBar.components['timedText'] = _this.getTimedTextButton();					
				}
			});
			
			
			$( embedPlayer ).bind( 'monitorEvent', function() {
				_this.monitor();
			} );

			$( embedPlayer ).bind( 'play', function() {
				// Will load and setup timedText sources (if not loaded already loaded )
				_this.setupTextSources();
			} );
			
			// Resize the timed text font size per window width
			$( embedPlayer ).bind( 'onCloseFullScreen onOpenFullScreen', function() {
				var textOffset = _this.embedPlayer.controlBuilder.fullscreenMode ? 30 : 10;
				
				mw.log( 'TimedText::set text size for: : ' + embedPlayer.$interface.width() + ' = ' + _this.getInterfaceSizeTextCss({
					'width' :  embedPlayer.$interface.width(),
					'height' : embedPlayer.$interface.height()
				})['font-size'] );
				
				embedPlayer.$interface.find( '.track' ).css( _this.getInterfaceSizeTextCss({
					'width' :  embedPlayer.$interface.width(),
					'height' : embedPlayer.$interface.height()
				}) ).css({
					// Get the text size scale then set it to control bar height + 10 px; 
					'bottom': ( _this.embedPlayer.controlBuilder.getHeight() + textOffset ) + 'px'
				});
				
			});
			
			// Update the timed text size
			$( embedPlayer ).bind( 'onResizePlayer', function(e, size, animate) {
				mw.log( 'TimedText::onResizePlayer: ' + _this.getInterfaceSizeTextCss(size)['font-size'] );
				if (animate) {
					embedPlayer.$interface.find( '.track' ).animate( _this.getInterfaceSizeTextCss( size ) );
				} else {
					embedPlayer.$interface.find( '.track' ).css( _this.getInterfaceSizeTextCss( size ) );
				}
			});

			// Setup display binding
			$( embedPlayer ).bind( 'onShowControlBar', function(event, layout ){
				// Move the text track if present
				embedPlayer.$interface.find( '.track' )
				.stop()
				.animate( layout, 'fast' );
			});
			
			$( embedPlayer ).bind( 'onHideControlBar', function(event, layout ){
				// Move the text track down if present
				embedPlayer.$interface.find( '.track' )
				.stop()
				.animate( layout, 'fast' );
			});
			
		},
		
		
		/**
		 * Get the current language key
		 * 
		 * @return 
		 * @type {string}
		 */
		getCurrentLangKey: function(){
			return this.currentLangKey;
		},
		/**
		 * The timed text button to be added to the interface
		 */
		getTimedTextButton: function(){
			var _this = this;
			/**
			* The closed captions button
			*/
			return {
				'w': 28,
				'o': function( ctrlObj ) {
					var $textButton = $( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-timed_text' ) )
						.addClass( "ui-state-default ui-corner-all ui-icon_link rButton timed-text" )
						.append(
							$( '<span />' )
							.addClass( "ui-icon ui-icon-comment" )
						)
						// Captions binding:
						.buttonHover();
					_this.bindTextButton( $textButton );
					return $textButton;
						
				}
			};
		},
		
		bindTextButton: function($textButton){
			var _this = this;
			$textButton.unbind('click.textMenu').bind('click.textMenu', function() {
				_this.showTextMenu();
			} );
		},
		
		/**
		* Get the fullscreen text css
		*/
		getInterfaceSizeTextCss: function( size ) {			
			//mw.log(' win size is: ' + $( window ).width() + ' ts: ' + textSize );
			return {
				'font-size' : this.getInterfaceSizePercent( size ) + '%'
			};
		},
		/**
		* Show the text interface library and show the text interface near the player.
		*/
		showTextMenu: function() {
			var embedPlayer = this.embedPlayer;
			var loc = embedPlayer.$interface.find( '.rButton.timed-text' ).offset();
			mw.log('showTextInterface::' + embedPlayer.id + ' t' + loc.top + ' r' + loc.right);

			var $menu = $( '#timedTextMenu_' + embedPlayer.id );
			//This may be unnecessary .. we just need to show a spinner somewhere
			if ( $menu.length != 0 ) {
				// Hide show the menu:
				if( $menu.is( ':visible' ) ) {
					$menu.hide( "fast" );
				}else{
					// move the menu to proper location
					$menu.show("fast");
				}
			}else{
				//Setup the menu:
				$('body').append(
					$('<div>')
						.addClass('ui-widget ui-widget-content ui-corner-all')
						.attr( 'id', 'timedTextMenu_' + embedPlayer.id )
						.css( {
							'position' 	: 'absolute',
							'z-index' 	: 10,
							'height'	: '180px',
							'width' 	: '180px',
							'font-size'	: '12px',
							'display' : 'none'
						} )

				);
				// Load text interface ( if not already loaded )
				$( '#' + embedPlayer.id ).timedText( 'showMenu', '#timedTextMenu_' + embedPlayer.id );
			}
		},
		getInterfaceSizePercent: function( size ) {
			// Some arbitrary scale relative to window size ( 400px wide is text size 105% )
			var textSize = size.width / 3.8;
			if( textSize < 95 ) textSize = 95;
			if( textSize > 200 ) textSize = 200;
			return textSize;
		},

		/**
		* Setups available text sources
		*   loads text sources
		* 	auto-selects a source based on the user language
		* @param {Function} callback Function to be called once text sources are setup.
		*/
		setupTextSources: function( callback ) {
			mw.log( 'mw.TimedText::setupTextSources');
			debugger;
			var _this = this;
			if( this.textSourceSetupFlag ) {
				if( callback ) {
					callback();
				}
				return ;
			}
			this.textSourceSetupFlag = true;

			// Load textSources
			_this.loadTextSources( function() {

				// Enable a default source and issue a request to "load it"
				_this.autoSelectSource();

				// Load and parse the text value of enabled text sources:
				_this.loadEnabledSources();

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
					'offsetY' : this.embedPlayer.controlBuilder.getHeight(),
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
					'zindex' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 2,
					'crumbDefaultText' : ' ',
					'autoShow': autoShow,
					'targetMenuContainer' : _this.menuTarget,
					'positionOpts' : positionOpts,
					'backLinkText' : gM( 'mwe-timedtext-back-btn' ),
					'createMenuCallback' : function(){
						_this.embedPlayer.controlBuilder.showControlBar( true );
					},
					'closeMenuCallback' : function(){
						_this.embedPlayer.controlBuilder.keepControlBarOnScreen = false;
					}
				} );
			});
		},

		/**
		* Monitor video time and update timed text filed[s]
		*/
		monitor: function( ) {
			//mw.log(" timed Text monitor: " + this.enabledSources.length );
			var embedPlayer = this.embedPlayer;
			// Setup local reference to currentTime:
			var currentTime = embedPlayer.currentTime;

			// Get the text per category
			var textCategories = [ ];

			for( var i = 0; i < this.enabledSources.length ; i++ ) {
				var source = this.enabledSources[ i ];
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
			this.textSources = [];

			$( this.embedPlayer ).triggerQueueCallback( 'LoadTextSources', callback );
		
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
		 	if( this.config.layout == 'ontop' && !this.embedPlayer.supports['overlays'] ) {
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
			for( var i=0; i < this.textSources.length; i++ ) {
				var source = this.textSources[ i ];
				if( this.config.userLanugage &&
					this.config.userLanugage == source.srclang.toLowerCase() ) {
					// Check for category if available
					this.enableSource( source );
					return ;
				}
			}
			// If no userLang, source try enabling English:
			if( this.enabledSources.length == 0 ) {
				for( var i=0; i < this.textSources.length; i++ ) {
					var source = this.textSources[ i ];
					if( source.srclang.toLowerCase() == 'en' ) {
						this.enableSource( source );
						return ;
					}
				}
			}
			// If still no source try the first source we get;
			if( this.enabledSources.length == 0 ) {
				for( var i=0; i < this.textSources.length; i++ ) {
					var source = this.textSources[ i ];
					this.enableSource( source );
					return ;
				}
			}
		},
		/**
		 * Enable a source and update the currentLangKey 
		 * @param source
		 * @return
		 */
		enableSource: function( source ){
			this.enabledSources.push( source );
			this.currentLangKey = source.srclang;
		},

		// Get the current source sub captions
		loadCurrentSubSrouce: function( callback ){
			mw.log("loadCurrentSubSrouce:: enabled source:" + this.enabledSources.length);
			for( var i =0; i < this.enabledSources.length; i++ ){
				var source = this.enabledSources[i];
				if( source.category == 'SUB' ){
					source.load( function(){
						callback( source);
						return ;
					});
				}
			}
			return false;
		},

		// Get sub captions by language key:
		getSubCaptions: function( langKey, callback ){
			for( var i=0; i < this.textSources.length; i++ ) {
				var source = this.textSources[ i ];
				if( source.srclang.toLowerCase() == langKey ) {
					var source = this.textSources[ i ];
					source.load( function(){
						callback( source.captions );
					});
				}
			}
		},

		/**
		* Issue a request to load all enabled Sources
		*  Should be called anytime enabled Source list is updated
		*/
		loadEnabledSources: function() {
			for(var i=0; i < this.enabledSources.length; i++ ) {
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
			mw.log("selectMenuItem: " + $( item ).find('a').attr('class') );
		},

		/**
		* Checks if a source is "on"
		* @return {Boolean}
		* 	true if source is on
		* 	false if source is off
		*/
		isSourceEnabled: function( source ) {
			for(var i=0; i < this.enabledSources.length; i++ ) {
				var enabledSource = this.enabledSources[i];
				if( source.id ) {
					if( source.id == enabledSource.id )
						return true;
				}
				if( source.srclang ) {
					if( source.srclang == enabledSource.srclang )
						return true;
				}
			}
			return false;
		},

		/**
		* Get a source object by language, returns "false" if not found
		*/
		getSourceByLanguage: function ( langKey ) {
			for(var i=0; i < this.textSources.length; i++) {
				var source = this.textSources[ i ];
				if( source.srclang == langKey )
					return source;
			}
			return false;
		},

		/**
		* Builds the core timed Text menu and
		* returns the binded jquery object / dom set
		*
		* Assumes text sources have been setup: ( _this.setupTextSources() )
		*
		* calls a few sub-functions:
		* Basic menu layout:
		*		Chose Language
		*			All Subtiles here ( if we have categories list them )
		*		Layout
		*			Bellow video
		*			Ontop video ( only available to supported plugins )
		* TODO features:
		*		[ Search Text ]
		*			[ This video ]
		*			[ All videos ]
		*		[ Chapters ] seek to chapter
		*/
		getMainMenu: function() {
			var _this = this;
			
			// Build the source list menu item:
			var $menu = $( '<ul>' );
			// Show text menu item ( if there are sources)
			if( _this.textSources.length != 0 ) {
				$menu.append(
					$.getLineItem( gM( 'mwe-timedtext-choose-text'), 'comment' ).append(
						_this.getLanguageMenu()
					),
						// Layout Menu option
					$.getLineItem( gM( 'mwe-timedtext-layout' ), 'image' ).append(
						_this.getLayoutMenu()
					)
				);
			} else {
				// Add a link to request timed text for this clip:
				if( mw.getConfig( 'TimedText.ShowRequestTranscript' ) ){
					$menu.append(
						$.getLineItem( gM( 'mwe-timedtext-request-subs'), 'comment', function(){
							_this.getAddSubRequest();
						})
					);
				} else {
					$menu.append(
						$.getLineItem( gM( 'mwe-timedtext-no-subs'), 'close' )
					)
				}
			}

			// Put in the "Make Transcript" link if config enabled and we have an api key
			if( mw.getConfig( 'TimedText.ShowAddTextLink' ) && _this.embedPlayer.apiTitleKey ){
				$menu.append(
					_this.getLiAddText()
				);
			}

			// Allow other modules to add to the timed text menu:
			$( _this.embedPlayer ).trigger( 'TimedText.BuildCCMenu', $menu ) ;

			return $menu;
		},

		// Simple interface to add a transcription request
		// TODO this should probably be moved to a gadget
		getAddSubRequest: function(){
			var _this = this;
			var buttons = {};
			buttons[ gM('mwe-timedtext-request-subs') ] = function(){
				var apiUrl = _this.textProvider.apiUrl;
				var videoTitle = 'File:' + _this.embedPlayer.apiTitleKey.replace('File:|Image:', '');
				var catName = mw.getConfig( 'TimedText.NeedsTranscriptCategory' );
				var $dialog = $(this);

				var subRequestCategoryUrl = apiUrl.replace('api.php', 'index.php') +
					'?title=Category:' + catName.replace(/ /g, '_');

				var buttonOk= {};
				buttonOk[gM('mwe-ok')] =function(){
					$(this).dialog('close');
				};
				// Set the loadingSpinner:
				$( this ).loadingSpinner();
				// Turn off buttons while loading
				$dialog.dialog( 'option', 'buttons', null );

				// Check if the category does not already exist:
				mw.getJSON( apiUrl, { 'titles': videoTitle, 'prop': 'categories' }, function( data ){
					if( data && data.query && data.query.pages ){
						for( var i in data.query.pages ){							
							// we only request a single page:
							if( data.query.pages[i].categories ){
								var categories = data.query.pages[i].categories;
								for(var j =0; j < categories.length; j++){
									if( categories[j].title.indexOf( catName ) != -1 ){
										$dialog.html( gM('mwe-timedtext-request-already-done', subRequestCategoryUrl ) );
										$dialog.dialog( 'option', 'buttons', buttonOk);
										return ;
									}
								}
							}
						}
					}

					// Else category not found add to category:
					// check if the user is logged in:
					mw.getUserName( apiUrl, function( userName ){
						if( !userName ){
							$dialog.html( gM('mwe-timedtext-request-subs-fail') );
							return ;
						}
						// Get an edit token:
						mw.getToken( apiUrl, videoTitle, function( token ) {
							if( !token ){
								$dialog.html( gM('mwe-timedtext-request-subs-fail') );
								return ;
							}
							var request = {
								'action' : 'edit',
								'summary' : 'Added request for subtitles using [[Commons:MwEmbed|MwEmbed]]',
								'title' : videoTitle,
								'appendtext' : "\n[[Category:" + catName + "]]",
								'token': token
							};
							// Do the edit request:
							mw.getJSON( apiUrl, request, function(data){
								if( data.edit && data.edit.newrevid){

									$dialog.html( gM('mwe-timedtext-request-subs-done', subRequestCategoryUrl )
									);
								} else {
									$dialog.html( gM('mwe-timedtext-request-subs-fail') );
								}
								$dialog.dialog( 'option', 'buttons', buttonOk );
							});
						});
					});
				});
			};
			buttons[ gM('mwe-cancel') ] = function(){
				$(this).dialog('close');
			};
			mw.addDialog({
				'title' : gM( 'mwe-timedtext-request-subs'),
				'width' : 450,
				'content' : gM('mwe-timedtext-request-subs-desc'),
				'buttons' : buttons
			});
		},
		/**
		 * Shows the timed text edit ui
		 *
		 * @param {String} mode Mode or page to display ( to differentiate between edit vs new transcript)
		 */
		showTimedTextEditUI: function( mode ) {
			var _this = this;
			// Show a loader:
			mw.addLoaderDialog( gM( 'mwe-timedtext-loading-text-edit' ) );
			// Load the timedText edit interface
			mw.load( 'mw.TimedTextEdit', function() {
				if( ! _this.editText ) {
					_this.editText = new mw.TimedTextEdit( _this );
				}
				// Close the loader:
				mw.closeLoaderDialog();
				// Show the upload text ui: 
				_this.editText.showUI();
			});
		},

		/**
		* Utility function to assist in menu build out:
		* Get menu line item (li) html: <li><a> msgKey </a></li>
		*
		* @param {String} msgKey Msg key for menu item
		*/

		/**
		 * Get the add text menu item:
		 */
		getLiAddText: function() {
			var _this = this;
			return $.getLineItem( gM( 'mwe-timedtext-upload-timed-text'), 'script', function() {
						_this.showTimedTextEditUI( 'add' );
					} );
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
				return $.getLineItem( source.title, source_icon, function() {
					_this.selectTextSource( source );
				});
			}						
			if( source.srclang ) {
				var langKey = source.srclang.toLowerCase();
				var cat = gM('mwe-timedtext-key-language', langKey, _this.getLanguageName ( langKey ) );
				return $.getLineItem(
					gM('mwe-timedtext-key-language', langKey, _this.getLanguageName ( langKey ) ),
					source_icon,
					function() {
						_this.selectTextSource( source );
					}
				);
			}
		},

		/**
	 	 * Get language name from language key
	 	 * @param {String} lang_key Language key
	 	 */
	 	getLanguageName: function( lang_key ) {
	 		if( mw.Language.names[ lang_key ]) {
	 			return mw.Language.names[ lang_key ];
	 		}
	 		return false;
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

			$ul = $('<ul>');
			$.each( layoutOptions, function( na, layoutMode ) {
				var icon = ( _this.config.layout == layoutMode ) ? 'bullet' : 'radio-on';
				$ul.append(
					$.getLineItem(
						gM( 'mwe-timedtext-layout-' + layoutMode),
						icon,
						function() {
							_this.selectLayout( layoutMode );
						} )
					);
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
				
				// Update the display:
				_this.updateLayout();
			}
		},

		/**
		* Updates the timed text layout ( should be called when config.layout changes )
		*/
		updateLayout: function() {
			var $playerTarget = this.embedPlayer.$interface;
			$playerTarget.find('.track').remove();
			this.refreshDisplay();
		},

		/**
		* Select a new source
		*
		* @param {Object} source Source object selected
		*/
		selectTextSource: function( source ) {
			var _this = this;
			mw.log("mw.TimedText:: selectTextSource: select lang: " + source.srclang );
			// For some reason we lose binding for the menu ~sometimes~ re-bind
			this.bindTextButton( this.embedPlayer.$interface.find('timed-text') );
			
			
			this.currentLangKey =  source.srclang;
			
			// Update the config language if the source includes language
			if( source.srclang )
				this.config.userLanugage = source.srclang;

			if( source.category )
				this.config.userCategory = source.category;

			// (@@todo update category & setup category language buckets? )

			// Remove any other sources selected in sources category
			this.enabledSources = [];

			this.enabledSources.push( source );
			
			// Set any existing text target to "loading"
			if( !source.loaded ) {
				var $playerTarget = this.embedPlayer.$interface;
				$playerTarget.find('.track').text( gM('mwe-timedtext-loading-text') );
				// Load the text:
				source.load( function() {
					// Refresh the interface:
					_this.refreshDisplay();
				});
			} else {
				_this.refreshDisplay();
			}
		},

		/**
		* Refresh the display, updates the timedText layout, menu, and text display
		* also updates the cookie preference. 
		* 
		* Called after a user option change
		*/
		refreshDisplay: function() {
			// Update the configuration object
			$.cookie( 'TimedText.Preferences',  JSON.stringify( this.config ) );
			
			// Empty out previous text to force an interface update:
			this.prevText = [];
			
			// Refresh the Menu (if it has a target to refresh)
			if( this.menuTarget ) {
				mw.log('bind menu refresh display');
				this.bindMenu( this.menuTarget, false );
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

			// See if we have categories to worry about
			// associative array of SUB etc categories. Each category contains an array of textSources.
			var catSourceList = {};
			var catSourceCount = 0;

			// ( All sources should have a category (depreciate )
			var sourcesWithoutCategory = [ ];
			for( var i=0; i < this.textSources.length; i++ ) {
				var source = this.textSources[ i ];
				if( source.category ) {
					var catKey = source.category ;
					// Init Category menu item if it does not already exist:
					if( !catSourceList[ catKey ] ) {
						// Set up catList pointer:
						catSourceList[ catKey ] = [ ];
						catSourceCount++;
					}
					// Append to the source category key menu item:
					catSourceList[ catKey ].push(
						_this.getLiSource( source )
					);
				}else{
					sourcesWithoutCategory.push( _this.getLiSource( source ) );
				}
			}
			var $langMenu = $('<ul>');
			// Check if we have multiple categories ( if not just list them under the parent menu item)
			if( catSourceCount > 1 ) {
				for(var catKey in catSourceList) {
					var $catChildren = $('<ul>');
					for(var i=0; i < catSourceList[ catKey ].length; i++) {
						$catChildren.append(
							catSourceList[ catKey ][i]
						);
					}
					// Append a cat menu item for each category list
					$langMenu.append(
						$.getLineItem( gM( 'mwe-timedtext-textcat-' + catKey.toLowerCase() ) ).append(
							$catChildren
						)
					);
				}
			} else {
				for(var catKey in catSourceList) {
					for(var i=0; i < catSourceList[ catKey ].length; i++) {
						$langMenu.append(
							catSourceList[ catKey ][i]
						);
					}
				}
			}

			for(var i=0; i < sourcesWithoutCategory.length; i++) {
				$langMenu.append( sourcesWithoutCategory[i] );
			}

			//Add in the "add text" to the end of the interface:
			if( mw.getConfig( 'TimedText.ShowAddTextLink' ) && _this.embedPlayer.apiTitleKey ){
				$langMenu.append(
					_this.getLiAddText()
				);
			}

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
			// ( check if we are updating the text )
			if( text === this.prevText[ source.category ] ){
				return ;
			}

			//mw.log( 'mw.TimedText:: updateTextDisplay: ' + text );

			var $playerTarget = this.embedPlayer.$interface;
			var $textTarget = $playerTarget.find( '.track_' + source.category + ' span' );
			// If we are missing the target add it:
			if( $textTarget.length == 0 ) {
				this.addItextDiv( source.category );
				// Re-grab the textTarget:
				$textTarget = $playerTarget.find( '.track_' + source.category + ' span' );
			}

			// If text is "false" fade out the subtitle:
			if( text === false ) {
				$textTarget.fadeOut('fast');
			}else{
				// Fade in the target if not visible
				if( ! $textTarget.is(':visible') ) {
					$textTarget.fadeIn('fast');
				}
				// Update text ( use "html" instead of "text" so that subtitle format can
				// include html formating 
				// TOOD we should scrub this for non-formating html
				$textTarget.html( text );

				// Add/update the lang option
				$textTarget.attr( 'lang', source.srclang.toLowerCase() );
				
				// Update any links to point to a new window
				$textTarget.find( 'a' ).attr( 'target', '_blank' );
			}
			// mw.log( ' len: ' + $textTarget.length + ' ' + $textTarget.html() );
			// Update the prev text:
			this.prevText[ source.category ] = text;
		},


		/**
		 * Add an track div to the embedPlayer
		 */
		addItextDiv: function( category ) {
			mw.log(" addItextDiv: " + category );
			// Get the relative positioned player class from the controlBuilder:
			var $playerTarget = this.embedPlayer.$interface;
			//Remove any existing track divs for this player;
			$playerTarget.find('.track_' + category ).remove();

			// Setup the display text div:
			var layoutMode = this.getLayoutMode();
			if( layoutMode == 'ontop' ) {
				this.embedPlayer.controlBuilder.keepControlBarOnScreen = false;
				var $track = $('<div>')
					.addClass( 'track' + ' ' + 'track_' + category )
					.css( {
						'position':'absolute',
						'bottom': ( this.embedPlayer.controlBuilder.getHeight() + 10 ),
						'width': '100%',
						'display': 'block',
						'opacity': .8,
						'text-align':'center'
					})
					.append(
						$('<span \>')
					);

				// Scale the text Relative to player size:
				$track.css(
					this.getInterfaceSizeTextCss({
						'width' :  this.embedPlayer.getWidth(),
						'height' : this.embedPlayer.getHeight()
					})
				);
				// Resize the interface for layoutMode == 'below' ( if not in full screen)
				if( ! this.embedPlayer.controlBuilder.fullscreenMode ){
					this.embedPlayer.$interface.animate({
						'height': this.embedPlayer.getHeight() 
					});
				}
				$playerTarget.append( $track );
				
			} else if ( layoutMode == 'below') {
				this.embedPlayer.controlBuilder.keepControlBarOnScreen = true;
				// Set the belowBar size to 60 pixels:
				var belowBarHeight = 60;
				// Append before controls:
				$playerTarget.find( '.control-bar' ).before(
					$('<div>').addClass( 'track' + ' ' + 'track_' + category )
						.css({
							'position' : 'absolute',
							'top' : this.embedPlayer.getHeight(),
							'display' : 'block',
							'width' : '100%',
							'height' : belowBarHeight + 'px',
							'background-color' : '#000',
							'text-align' : 'center',
							'padding-top' : '5px'
						} ).append(
							$('<span>').css( {
								'color':'white'
							} )
						)
				);
				// Add some height for the bar and interface
				var height = ( belowBarHeight + 8 ) + this.embedPlayer.getHeight() + this.embedPlayer.controlBuilder.getHeight();
				// Resize the interface for layoutMode == 'below' ( if not in full screen)
				if( ! this.embedPlayer.controlBuilder.fullscreenMode ){
					this.embedPlayer.$interface.animate({
						'height': height
					});
				}
				mw.log( ' height of ' + this.embedPlayer.id + ' is now: ' + $( '#' + this.embedPlayer.id ).height() );
			}
			mw.log( 'should have been appended: ' + $playerTarget.find('.track').length );
		}
	};

	/**
	 * Base TextSource object
	 *
	 * @param {Object} source Source object to extend
	 * @param {Object} textProvider [Optional] The text provider interface ( to load source from api )
	 */
	TextSource = function( source ) {
		return this.init( source );
	};
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
		 * @param {Object} Pointer to the textProvider 
		 */
		init: function( source , textProvider) {	
			//	Inherits mediaSource	
			for( var i in source){
				this[ i ] =  source[ i];
			}
			
			// Set default category to subtitle if unset:
			if( ! this.category ) {
				this.category = 'SUB';
			}
			//Set the textProvider if provided
			if( textProvider ) {
				this.textProvider = textProvider;
				
				// switch type to mw-srt if we are going to load via api 
				// ( this is need because we want to represent one thing to search engines / crawlers, 
				// while representing the mw-srt type internally so that mediawiki parsed text 
				// gets converted to html before going into the video 
				if( this.mwtitle ){
					this.mimeType = 'text/mw-srt';
				}
			}
			return this;
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
					return ;
				}
			};
			_this.loaded = true;
			
			// Trigger the "getTextSourceParser"
			
			
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

			// Try to load src via XHR source
			if( this.getSrc() ) {
				// Issue the direct load request
				if ( !mw.isLocalDomain( this.getSrc() ) ) {
					mw.log("Error: cant load crossDomain src:" + this.getSrc() );
					return ;
				}
				$.get( this.getSrc(), function( data ) {
					// Parse and load captions:
					_this.captions = handler( data );
					mw.log("mw.TimedText:: loaded from srt file: " + _this.captions.length + ' captions');
					// Update the loaded state:
					_this.loaded = true;
					if( callback ) {
						callback();
					}
				}, 'text' );
				return ;
			}


		},

		/**
		* Returns the text content for requested time
		*
		* @param {String} time Time in seconds
		*/
		getTimedText: function ( time ) {
			var prevCaption = this.captions[ this.prevIndex ];

			// Setup the startIndex:
			if( prevCaption && time >= prevCaption.start ) {
				var startIndex = this.prevIndex;
			}else{
				//If a backwards seek start searching at the start:
				var startIndex = 0;
			}
			// Start looking for the text via time, return first match:
			for( var i = startIndex ; i < this.captions.length; i++ ) {
				var caption = this.captions[ i ];
				// Don't handle captions with 0 or -1 end time:
				if( caption.end == 0 || caption.end == -1)
					continue;

				if( time >= caption.start &&
					time <= caption.end ) {
					this.prevIndex = i;
					//mw.log("Start cap time: " + caption.start + ' End time: ' + caption.end );
					return caption.content;
				}
			}
			//No text found in range return false:
			return false;
		}
	};

	
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
		var captions = [];
		var caplist = srt.split('\n\n');
		for (var i = 0; i < caplist.length; i++) {
	 		var caption = "";
			var content, start, end, s;
			caption = caplist[i];
			s = caption.split(/\n/);
			if (s.length < 2) {
				// file format error or comment lines
				continue;
			}
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
	};
	
	
	
} )( window.mediaWiki, window.jQuery );
