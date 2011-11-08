/**
* Playlist Embed. Enables the embedding of a playlist using the mwEmbed player
*/
( function( mw, $ ) {

// Get all our message text
mw.includeAllModuleMessages();

mw.Playlist = function( options ){
	return this.init( options );
};

mw.Playlist.prototype = {

	// Stores the current clip index to be played
	clipIndex: 0,

	// Stores the cached player size:
	targetPlayerSize: null,
	
	// The source handler
	sourceHandler: null,
	
	// the theme handler:
	theme : null,
	
	// player Id
	playerId: null,	
	
	// Store if the current mouse gesture was a mouse up ( only affects iPad emulation with desktop browers ) 
	onTouchScroll: false,
	
	// Flag for disabling jumping between clips 
	enableClipSwitch: true,
	
	bindPostFix: '.playlist',
	
	// constructor
	init: function( options ) {
		var _this = this;
		// Check for required options: 
		if( options.src )
			this.src = options.src;
		
		if( options.srcPayLoad ){
			this.srcPayLoad = unescape(options.srcPayLoad).replace(/\+/g,' ');
		}
		
		this.target = options.target;
		
		if( options.embedPlayer ) {
			this.embedPlayer = options.embedPlayer;
		}
		
		// We assign the base player the id of the playlist ( since we want the player api to be 
		// exposed for the playlist id ) 
		this.playerId = ( this.embedPlayer )? 
							this.embedPlayer.id : 
						( options['id'] )?  options['id'] :
						$( this.target ).attr( 'id' );
						
		// Setup the id for the playlist container: 		
		this.id = 'plholder_' + this.playerId;
		
		// Update the target id 
		$( this.target ).attr( 'id', this.id );
		this.target = '#' + this.id;
		
		// Set binding to disable "waitForMeta" for playlist items ( We know the size and length )
		$( mw ).bind( 'checkPlayerWaitForMetaData', function(even, playerElement ){
			if( $( playerElement ).hasClass( 'mwPlaylist') ){
				playerElement.waitForMeta = false;
			}
		});
			
		this.type = ( options.type ) ?
			options.type:
			mw.getConfig('Playlist.DefaultType' );

		var namedOptions = ['layout', 'playerAspect', 'itemThumbWidth', 'titleHeight', 'titleLength', 'descriptionLength'];
		$.each( namedOptions, function(inx, optionName ){
			var confName = 'Playlist.' + optionName.charAt(0).toUpperCase() + optionName.substr(1);
			_this[ optionName ] = ( typeof options[ optionName ] != 'undefined' )?
					options[ optionName ] :
					mw.getConfig( confName );
		});
	},
	// try to get the title height from the source handler, else from the local configuration
	getTitleHeight: function(){
		if( this.sourceHandler && typeof this.sourceHandler.titleHeight != 'undefined' )
			return this.sourceHandler.titleHeight;
		return this.titleHeight;
	},
	formatTitle: function( text ){
		if( text.length > this.titleLength )
			return text.substr(0, this.titleLength-3) + ' ...';
		return text;
	},
	formatDescription: function( text ){
		if( text.length > this.descriptionLength )
			return text.substr(0, this.descriptionLength-3) + ' ...';
		return text;
	},
	drawPlaylist: function( drawDoneCallback ){
		var _this = this;
		// Set the target to loadingSpinner ( if we don't already have an embedPlayer ) 
		if( !this.embedPlayer ){
			$( this.target ).loadingSpinner();
		}
		var callback = function(){
			if( _this.sourceHandler.autoPlay || _this.autoPlay ){
				// only auto play if ipad3x ( iPad 4 and iOS does not let you autoplay )
				if( !mw.isIOS() || mw.isIpad3() ){
					_this.playClip( _this.clipIndex );
				}
			}
			drawDoneCallback();
		};
		this.loadPlaylistHandler( function( sourceHandler ){

			// Done loading playlist hide loader ( this is kind of messy )
			if( !_this.embedPlayer ){
				$( _this.target ).empty();
			}
			
			mw.log("Playlist::drawPlaylist: sourceHandler:" + sourceHandler);
			// Check if load failed or empty playlist
			if( _this.sourceHandler.getClipList().length == 0 ){
				$( _this.target ).text( gM('mwe-playlist-empty') );
				callback();
				return ;
			}
			// Check if we should include the ui 
			if( _this.sourceHandler.hasPlaylistUi() ){
				_this.drawUI( callback );
			} else {
				if( !_this.isPlayerPreset() ){
					$( _this.target )
					.empty()
					.append(
						_this.getPlayerContainer()
					);
				}
				_this.drawEmbedPlayer( _this.clipIndex, callback );
			}
		});
	},
	getClipList:function(){
		return  this.sourceHandler.getClipList();
	},
	isPlayerPreset:function(){
		// check if the player container already exists ( playlist iframe pre-layout ) 
		var $pl =  $( this.target ).find( '.media-rss-video-player-container' );
		return !!( $pl.length );
	},
	getPlayerContainer:function(){
		return $( '<span />' )
			.addClass( 'media-rss-video-player-container')
			.css({
				'float' : 'left'
			})
			.append( $('<div />').addClass( 'media-rss-video-player' ).css( 'position', 'relative' ) );
	},
	/**
	* Draw the media rss playlist ui
	*/
	drawUI: function( callback ){
		var _this = this;
		// Empty the target and setup player and playerList divs
		$( _this.target )
		.addClass( 'ui-widget-content' )
		.css('position', 'relative' );
		
		if( !_this.isPlayerPreset() ){
			$( _this.target ).append(
				_this.getPlayerContainer()
			);
		}
		// @@TODO Add media-playlist-ui container

		// Add the video list: 
		$( _this.target ).append(
			$('<div />')
			.attr( 'id',  'video-list-wrapper-' + _this.id )
			.addClass('video-list-wrapper')
			.css({
				'position' : 'absolute',
				'z-index' : '1',
				'overflow-x' : 'hidden',
				'overflow-y' : 'auto',
				'bottom': '0px'
			})
			.append( 
				$( '<div />')
				.addClass( 'media-rss-video-list' )
				.attr( 'id',  'media-rss-video-list-' + _this.id )
			)
			.hide()
		);
		// Check if we have multiple playlist and setup the list and bindings
		if( _this.sourceHandler.hasMultiplePlaylists() ){
			var playlistSet = _this.sourceHandler.getPlaylistSet();
			if( _this.layout == 'vertical' ){
				var leftPx = '0px';
			} else {
				// just the default left side assignment ( updates once we have player size ) 
				var leftPx = '444px';
				var playerSize = _this.getTargetPlayerSize();
				if( playerSize.width )
					leftPx = playerSize.width;
			}
			var $plListContainer =$('<div />')
			.addClass( 'playlist-set-container' )
			.css({
				'position' : 'absolute',
				'overflow' : 'hidden',
				'top' : '3px',
				'height' : '20px',
				'padding' : '4px',
				'left' : leftPx
			})
			.append(
				$('<span />')
				.addClass( 'playlist-set-list' )
				.css( {
					'white-space':'pre'
				})
			);
			$( _this.target ).append( $plListContainer );
			
			var $plListSet = $( _this.target ).find( '.playlist-set-list' );

			$.each( playlistSet, function( inx, playlist){
				// check for playlist name: 
				if( !playlist.name ){
					return true;
				}
				// Add a divider
				if( inx != 0 ){
					$plListSet.append( $('<span />').text( ' | ') );
				}
				$plLink = $('<a />')
					.attr('href', '#')
					.text( playlist.name )
					.click( function(){
						
						$(this)
						.addClass( 'ui-state-active' )
						.siblings().removeClass('ui-state-active');
						
						 _this.sourceHandler.setPlaylistIndex( inx );
						 mw.log( 'mw.Playlist:: selectPlaylist:' + inx );
						 $( _this.target + ' .media-rss-video-list')
						 .empty()
						 .append(
							$('<div />')
							.css({
								'position' : 'absolute',
								'top' : '45%',
								'left' : '45%'
							})
							.loadingSpinner()
						 )
						 
						 _this.sourceHandler.loadCurrentPlaylist( function(){
							 $( _this.target + ' .media-rss-video-list').empty();
							_this.addMediaList();
						 });
						 
						return false;
					})
					.buttonHover();
				// highlight the default
				if( inx == 0 ){
					$plLink.addClass( 'ui-state-active' );
				}
				$plListSet.append( $plLink );	
			});
			
			// Check playlistSet width and add scroll left / scroll right buttons
			if( $plListSet.width() > $plListContainer.width() ){
				var baseButtonWidth = 24;
				$plListSet.css( {
					'position': 'absolute',
					'left' : baseButtonWidth + 'px'
				});
				var $scrollButton =	$('<div />')
				.addClass( 'ui-corner-all ui-state-default' )
				.css({
					'position' : 'absolute',
					'top' : '-1px',
					'cursor' : 'pointer',
					'margin' :'0px',
					'padding' : '2px',
					'width'	: '16px',
					'height' : '16px'
				});

				var $buttonSpan = $('<span />')
					.addClass( 'ui-icon' )
					.css('margin', '2px' );

				var plScrollPos = 0;
				var scrollToListPos = function( pos ){

					listSetLeft = $plListSet.find('a').eq( pos ).offset().left -
						$plListSet.offset().left ;

					mw.log("scroll to: " + pos + ' left: ' + listSetLeft);
					$plListSet.animate({'left': -( listSetLeft - baseButtonWidth) + 'px'} );
				};
				
				$plListContainer
				.append(
					$scrollButton.clone()
					.css('left', '0px')
					.append( $buttonSpan.clone().addClass('ui-icon-circle-arrow-w') )
					.click( function(){
						//slide right
						if( plScrollPos >= 0){
							mw.log("scroll right");
							plScrollPos--;
							scrollToListPos( plScrollPos );
						}
					})
					.buttonHover(),

					$scrollButton.clone()
					.css('right', '0px')
					.append( $buttonSpan.clone().addClass('ui-icon-circle-arrow-e') )
					.click( function(){
						//slide left
						if( plScrollPos < $plListSet.find('a').length-1 ){
							plScrollPos++;
							scrollToListPos( plScrollPos );
						}
					})
					.buttonHover()
				);
			}
		};

		// Add the selectable media list
		_this.addMediaList();

		var $videoListWraper = $( '#video-list-wrapper-' + _this.id );
		
		// Update the player
		_this.drawEmbedPlayer( _this.clipIndex, function(){
			var playerSize = _this.getTargetPlayerSize();
			// Update the list height ( vertical layout )
			if( _this.layout == 'vertical' ){
				var verticalSpace = $( _this.target + ' .media-rss-video-player-container' ).height();
				$videoListWraper.css( {
					'top' : parseInt( verticalSpace ) + 4,
					'left' : '0px',
					'right' : '4px'
						
				} );
				// Add space for the multi-playlist selector:
				if( _this.sourceHandler.hasMultiplePlaylists() ){
					$videoListWraper.css({
						'top' : parseInt( verticalSpace ) + 26
					});
				}
			} else {
				// Update horizontal layout
				$videoListWraper.css( {
					'top' : '0px',
					'left' :  parseInt( playerSize.width ) + 4,
					'right' : '2px',
					'margin-top' : '5px'
				} );
				// Add space for the multi-playlist selector:
				if( _this.sourceHandler.hasMultiplePlaylists() ){
					$( _this.target + ' .playlist-set-container').css( {
						'left' : parseInt( playerSize.width ) + 4
					});
					$videoListWraper.css( {
						'top' : '26px'
					});
				}
			}
			// Show the videoList
			$videoListWraper.show();
			
			// Should test for touch support
			if( mw.isMobileDevice() && !$('#video-list-wrapper-' + _this.id ).get(0).iScroll ){
				// give real height for iScroll:
				$videoListWraper.css("height", $videoListWraper.height() );
				// add iScroll:
				$('#video-list-wrapper-' + _this.id ).get(0).iScroll = 
					new iScroll( 'video-list-wrapper-' + _this.id, { 
						'onTouchEnd': function(e, moved){ 
							if( moved !== false){
								_this.onTouchScroll = true;
							} else {
								_this.onTouchScroll = false
							}
							return false 
						}, 
						'hScroll' : false, 
						'hideScrollbar' : false 
					});
			}				
			if( callback ) 
				callback();
		});
	},
	/**
	* Update the target size of the player
	*/
	getTargetPlayerSize: function( ){
		var _this = this;
		if( this.targetPlayerSize ){
			return this.targetPlayerSize;
		}

		// Get the target width and height:
		this.targetWidth = $( this.target ).width();
		this.targetHeight = $( this.target ).height();
		
		// if there is no player interface take all the allowed space:
		if( !_this.sourceHandler.hasPlaylistUi() ){
			return {
				'width' : this.targetWidth  + 'px',
				'height' : this.targetHeight + 'px'
			};
		}
		
		if( _this.layout == 'vertical' ){
			/* Vertical layout */
			var pa = this.playerAspect.split(':');
			this.targetPlayerSize = {
				'width' : this.targetWidth + 'px',
				'height' : parseInt( ( pa[1] / pa[0] ) * this.targetWidth )
			};
		} else {
			/* horizontal layout */
			// Check if we have explicit video size
			var playerWidth = parseInt( $( this.target + ' .media-rss-video-player-container' ).css('width') );
			if(  isNaN( playerWidth) || !playerWidth ){
				if( _this.sourceHandler.getVideoListWidth() != 'auto' ){
					playerWidth = this.targetWidth - _this.sourceHandler.getVideoListWidth();
				} else {
					var pa = this.playerAspect.split(':');
					playerWidth = parseInt( ( pa[0] / pa[1] ) * this.targetHeight );
				}
			}
			this.targetPlayerSize = {
				'height' : ( this.targetHeight - this.getTitleHeight() ) + 'px',
				'width' : playerWidth + 'px'
			};
		}
		
		if( this.targetPlayerSize.width > this.targetWidth ){
			var pa = this.playerAspect.split(':');
			this.targetPlayerSize.width = this.targetWidth;
			this.targetPlayerSize.height = parseInt( ( pa[1] / pa[0] ) * this.targetWidth );
		}
		
		return this.targetPlayerSize;
	},
	getEmbedPlayer: function(){
		return $('#' + this.getVideoPlayerId() ).get(0);
	},
	getVideoPlayerTarget: function(){
		return $( this.target + ' .media-rss-video-player' );
	},
	// Play a clipIndex, if the player is already in the page swap the player src to the new target
	playClip: function( clipIndex ){
		var _this = this;
		// Check for a video/audio tag already in the page:
		var embedPlayer = this.getEmbedPlayer();
		this.clipIndex = clipIndex;
        // Hand off play clip request to sourceHandler: 
		_this.sourceHandler.playClip( embedPlayer, clipIndex, function(){
			// Do any local player interface updates: 
			_this.updatePlayerUi( clipIndex );
			// Add playlist specific bindings: 
			_this.addClipBindings();
		} );
	},
	/**
	* Update the player
	*/
	drawEmbedPlayer: function( clipIndex , callback ){
		var _this = this;
		mw.log( "mw.Playlist:: updatePlayer " + clipIndex );
		this.clipIndex = clipIndex;
		
		// Check if we really have to update: 
		var embedPlayer = _this.getEmbedPlayer();
		if( $( embedPlayer ).data('clipIndex') == clipIndex ){
			callback();
			return ;
		}
		// Pass off player updates to sourceHandler
		_this.sourceHandler.drawEmbedPlayer( clipIndex, function(){
			// update Ui: 
			_this.updatePlayerUi( _this.clipIndex );
			
			// Add playlist specific bindings: 
			_this.addClipBindings();
			// Issue the playlist ready callback 
			callback();
		});
	},
	addClipBindings: function( ){
		var _this = this;
		var embedPlayer = _this.getEmbedPlayer();
		// remove any old playlist bindings:
		$( embedPlayer ).unbind( this.bindPostFix );
		
		// Once the player is ready add any custom bindings
		_this.sourceHandler.addEmbedPlayerBindings( embedPlayer );

		// Add the seek forward / back buttons 
		_this.addPlaylistSeekButtons();
		
		// Add ad bindings
		_this.addPlaylistAdBindings(); 
		
		// Setup ondone playing binding to play next clip (if autoContinue is true )
		if( _this.sourceHandler.autoContinue == true ){
			$( embedPlayer ).bind( 'postEnded' + this.bindPostFix, function(event ){
				// Play next clip
				if( _this.clipIndex + 1 < _this.sourceHandler.getClipCount() ){
					// Update the onDone action object to not run the base control done:
					embedPlayer.onDoneInterfaceFlag = false;
					_this.clipIndex++;
					// update the player and play the next clip
					_this.playClip( _this.clipIndex );
				} else {
					mw.log("Reached end of playlist run normal end action" );
					// Update the onDone action object to not run the base control done:
					embedPlayer.onDoneInterfaceFlag = true;
				}
			});
		}
		var uiSelector = '.playlist-set-container,.playlist-block-list,.video-list-wrapper,.playlist-scroll-buttons';
		// fullscreen support
		$( embedPlayer ).bind('onOpenFullScreen' + this.bindPostFix, function(){
			// hide inteface comonets ( these should readlly all be in their own div! )
			$(uiSelector).hide(); 
		});
		$( embedPlayer ).bind('onCloseFullScreen' + this.bindPostFix, function(){
			setTimeout(function(){ // give some time for the dom to update
				var playerSize = {
					'width' : $( _this.target + ' .media-rss-video-player-container' ).width() + 'px',
					'height' : ( $( _this.target + ' .media-rss-video-player-container' ).height() - _this.getTitleHeight() ) + 'px'
				};
				embedPlayer.resizePlayer( playerSize, false);
				$(uiSelector).show();
			},30);
		});
		
	},
	updatePlayerUi:function( clipIndex ){
		var _this = this;
		// Give a chance for sourceHandler to update player ui
		_this.sourceHandler.updatePlayerUi( clipIndex );
		
		// Update the player list if present:
		$( _this.target + ' .clipItemBlock')
			.removeClass( 'ui-state-active' )
			.addClass( 'ui-state-default' )
			.eq( clipIndex )
			.addClass( 'ui-state-active' );

	},
	getVideoPlayerId: function( ){
		return this.playerId;
	},
	// Checks if the player has next prev playlist buttons if not adds them.
	addPlaylistSeekButtons: function(){
		var _this = this;
		var embedPlayer = this.getEmbedPlayer();
		// add previous / next buttons if not present: 
		// TODO (HACK) we should do real controlBar support for custom buttons
		if( embedPlayer.controlBuilder ){
			$controlBar = embedPlayer.$interface.find('.control-bar');
			
			if( $controlBar.find( '.ui-icon-seek-next' ).length != 0 ){
				// already have seek buttons
				return false;
			}
			
			$plButton = $('<div />')
				.addClass("ui-state-default ui-corner-all ui-icon_link lButton")
				.buttonHover()
				.append(
					$('<span />')
					.addClass( "ui-icon")
				);
				
			$playButton = $controlBar.find( '.play-btn');
			
			if( _this.sourceHandler.isNextButtonDisplayed() ){	
			 	// make space ( reduce playhead length ) 
				var pleft =  parseInt( $controlBar.find( '.play_head' ).css( 'left' ) ) + 28;
				$controlBar.find('.play_head').css('left', pleft);
					
				$nextButton = $plButton.clone().attr({
							'title' : 'Next clip'
						})
						.click(function(){
							if(_this.enableClipSwitch &&  _this.clipIndex + 1 < _this.sourceHandler.getClipCount() ){
								_this.clipIndex++;
								_this.playClip( _this.clipIndex );
								return ;
							}
							mw.log("Cant next: cur:" + _this.clipIndex );
						})
						.find('span').addClass('ui-icon-seek-next')
						.parent()
						.buttonHover();
						
				$playButton.after($nextButton);
			}
				
			if(  _this.sourceHandler.isPreviousButtonDisplayed() ){
				// make space ( reduce playhead length ) 
				var pleft =  parseInt( $controlBar.find( '.play_head' ).css( 'left' ) ) + 28;
				$controlBar.find('.play_head').css('left', pleft);
				
				$prevButton = $plButton.clone().attr({
							'title' : 'Previous clip'
						})
						.click(function(){					
							if( _this.enableClipSwitch && _this.clipIndex - 1 >= 0 ){
								_this.clipIndex--;
								_this.playClip( _this.clipIndex );
								return ;
							}
							mw.log("Cant prev: cur:" + _this.clipIndex );
						})
						.find('span').addClass('ui-icon-seek-prev')
						.parent()
						.buttonHover();
						
				$playButton.after($prevButton);
			}
		}
	},
	// add bindings for playlist playback ( disable playlist item selection during ad Playback )
	addPlaylistAdBindings: function(){
		var _this = this;
		var embedPlayer = this.getEmbedPlayer();
		$( embedPlayer ).bind('AdSupport_StartAdPlayback', function(){
			//  Disable clip switch flag: 
			_this.enableClipSwitch = false;

			// Add a gray overlay
			var $listwrap = $( '#video-list-wrapper-plholder_' + this.id );
			var cssPops = ['width','height', 'position', 'bottom', 'right', 'left', 'top'];
			var cssObj = {};
			
			// Copy in all the settings:
			$.each( cssPops, function(inx, prop){
				cssObj[ prop ] = $listwrap.css(prop);
			});
			// remove height
			if( cssObj[ 'height' ] )
				cssObj[ 'height' ] = null; 
			
			if( !$( _this.target + ' .playlist-block-list').length ){
				$listwrap.before( 
					$('<div />').css( cssObj )
					.addClass('playlist-block-list')
					.css({
						'z-index': 2,
						'background-color' : '#FFF',
						'opacity' : '0.7',
						'filter' : 'alpha(opacity=70)'
					})
					.click(function(){
						// don't let event propagate
						return false;
					})
				);
			}
		});
		$( embedPlayer ).bind('AdSupport_EndAdPlayback', function(){
			// Restore clip switch: 
			_this.enableClipSwitch = true;
			$( _this.target + ' .playlist-block-list').remove();
			
		});
	},
	/**
	* Add the media list with the selected clip highlighted
	*/
	addMediaList: function() {
		var _this = this;
		$targetItemList = $( this.target + ' .media-rss-video-list');
		// update the playlistItme total available width
		this.playlistItemWidth = $targetItemList.width();
		$.each( this.sourceHandler.getClipList(), function( inx, clip ){
			mw.log( 'mw.Playlist::addMediaList: On clip: ' + inx);
			if( inx > mw.getConfig( 'Playlist.MaxClips' ) ){
				return false;
			}
			// Output each item with the current selected index:
			$itemBlock = $('<div />')
				.addClass( 'ui-widget-content ui-corner-all playlistItem ui-helper-clearfix' );
				

			if( _this.clipIndex == inx ){
				$itemBlock.addClass( 'ui-state-active');
			} else {
				$itemBlock.addClass( 'ui-state-default' );
			}
			// Add a single row table with image, title then duration
			$itemBlock.append(
				_this.sourceHandler.getPlaylistItem( inx )
			)				
			.data( 'clipIndex', inx )
			.buttonHover()
			.addClass( 'clipItemBlock' 	)
			.css( {
				'cursor': 'pointer'
			} )
			.click( function(event){
				// check that we can switch clips:
				if( !_this.enableClipSwitch ){
					return ;
				}
				// from chrome pretending to be iOS ( store the last touch event ) 
				if( _this.onTouchScroll ){
					return ;
				}
				// Update _this.clipIndex
				_this.clipIndex = $( this ).data( 'clipIndex' );
				_this.playClip( _this.clipIndex );

			}); //close $itemBlock

			// Add the itemBlock to the targetItem list
			$targetItemList.append(
				$itemBlock
			);
			mw.log("Added item block : " + $targetItemList.children().length );
		});
	},

	play: function(){
		mw.log( 'mw.Playlist::play ');
		var embedPlayer = $('#' + this.getVideoPlayerId() ).get(0);
		embedPlayer.play();
	},

	/**
	 * Load the playlist driver from a source
	 * @param {function} callback Function to be called once load is complete. 
	 */
	loadPlaylistHandler: function( callback ){
		var _this = this;
		// Allow plugins to setup the source handler: 
		$( mw ).trigger('Playlist_GetSourceHandler', [ this ] );
		
		if( !_this.sourceHandler ){
			switch( this.type ){
				case 'application/rss+xml':
					_this.sourceHandler = new mw.PlaylistHandlerMediaRss( this );
				break;
			}
		};
		// Load the playlist
		_this.sourceHandler.loadPlaylist( function(){
			callback( _this.sourceHandler );
		});
	},

	/**
	 * Set the playlist source handler
	 */
	setSourceHandler: function ( sourceHandler ){
		this.sourceHandler = sourceHandler;
	}
};


})( window.mw, jQuery );

