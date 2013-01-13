/**
* Playlist Embed. Enables the embedding of a playlist using the mwEmbed player
*/
( function( mw, $ ) { "use strict";

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

	bindPostfix: '.playlist',

	// constructor
	init: function( options ) {
		var _this = this;
		// Check for required options:
		if( options.src )
			this.src = options.src;

		if( options.srcPayLoad ){
			this.srcPayLoad = unescape(options.srcPayLoad).replace(/\+/g,' ');
		}

		if( options.embedPlayer ) {
			this.embedPlayer = options.embedPlayer;
			this.embedPlayer.playlist = this;
		}

		// set the top level target:
		if( options.target ){
			this.$target = $( options.target );
		}
		// We assign the base player the id of the playlist ( since we want the player api to be
		// exposed for the playlist id )
		this.playerId = ( this.embedPlayer )?
							this.embedPlayer.id :
						( options['id'] ) ?  options['id'] :
						this.$target.attr( 'id' );

		// Setup the id for the playlist container:
		if( ! this.$target.attr( 'id' ) ){
			this.$target.attr( 'id', this.playerId + '_pl' );
		}
		this.id = this.$target.attr( 'id' );

		// Set binding to disable "waitForMeta" for playlist items ( We know the size and length )
		$( mw ).bind( 'EmbedPlayerWaitForMetaCheck', function(even, playerElement ){
			if( $( playerElement ).hasClass( 'mwPlaylist') ){
				playerElement.waitForMeta = false;
			}
		});

		this.type = ( options.type ) ?
			options.type:
			mw.getConfig('Playlist.DefaultType' );

		var namedOptions = [ 'layout', 'playerAspect', 'itemThumbWidth', 'titleHeight', 'titleLength', 'descriptionLength' ];
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
			//return text.substr(0, this.titleLength-3) + ' ...';
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
			this.$target.loadingSpinner();
		}
		var callback = function(){
			if( _this.sourceHandler.autoPlay || _this.autoPlay ){
				// only auto play if ipad3x ( iPad 4 and iOS does not let you autoplay )
				if( _this.embedPlayer.canAutoPlay() ){
					_this.playClip( _this.clipIndex, (_this.sourceHandler.autoPlay || _this.autoPlay) );
				}
			}
			drawDoneCallback();
		};
		this.loadPlaylistHandler( function( sourceHandler ){

			// Done loading playlist hide loader ( this is kind of messy )
			if( ! _this.embedPlayer ){
				_this.$target.empty();
			}

			mw.log("Playlist::drawPlaylist: sourceHandler:" + sourceHandler);
			// Check if load failed or empty playlist
			if( _this.sourceHandler.getClipList().length == 0 ){
				_this.$target.text( gM('mwe-playlist-empty') );
				callback();
				return ;
			}
			// Check if we should include the ui
			if( _this.sourceHandler.hasPlaylistUi() ){
				_this.drawUI( callback );
			} else {
				_this.drawEmbedPlayer( _this.clipIndex, callback );
			}
		});
	},
	getClipList:function(){
		return  this.sourceHandler.getClipList();
	},
	getVideoListWrapper: function(){
		var listWrapId = 'video-list-wrapper-' + this.id;
		var $listWrap = this.$target.find( '#' + listWrapId )
		if( ! $listWrap.length ){
			$listWrap =$('<div />')
			.attr( 'id',  listWrapId )
			.addClass('video-list-wrapper').appendTo( this.$target )
		}
		return $listWrap;
	},
	getVideoList: function() {
		return this.getVideoListWrapper().find('.media-rss-video-list');
	},
	getListHeight: function() {
		var height = this.getVideoListWrapper().height() - 10; // 10 is the list margin
		var $tabs = this.getVideoListWrapper().find('.playlist-set-container');
		if( $tabs.length ) {
			height = height - $tabs.outerHeight();
		}
		return height;
	},
	/**
	* Draw the media rss playlist ui
	*/
	drawUI: function( callback ){
		var _this = this;
		var embedPlayer = _this.getEmbedPlayer();
		// Empty the target and setup player and playerList divs
		this.$target
		.addClass( 'ui-widget-content' );

		// @@TODO Add media-playlist-ui container

		// Add the video list:
		this.getVideoListWrapper()
			.append(
				$( '<div />')
				.addClass( 'media-rss-video-list' )
				.attr( 'id',  'media-rss-video-list-' + _this.id )
			)

		if( $.isFunction( _this.sourceHandler.setupPlaylistMode ) ) {
			_this.sourceHandler.setupPlaylistMode( _this.layout );
		}
		// Check if we have multiple playlist and setup the list and bindings
		if( _this.sourceHandler.hasMultiplePlaylists() ){
			var playlistSet = _this.sourceHandler.getPlaylistSet();

			var $plListContainer = $('<div />')
			.addClass( 'playlist-set-container' )
			.css({
				'height' : '20px',
				'padding' : '4px'
			})
			.append(
				$('<span />')
				.addClass( 'playlist-set-list' )
				.css( {
					'white-space':'pre'
				})
			);
			this.getVideoListWrapper().prepend( $plListContainer );

			var $plListSet = this.$target.find( '.playlist-set-list' );

			$.each( playlistSet, function( inx, playlist){
				// check for playlist name:
				if( !playlist.name ){
					return true;
				}
				// Add a divider
				if( inx != 0 ){
					$plListSet.append( $('<span />').text( ' | ') );
				}
				var $plLink = $('<a />')
					.attr('href', '#')
					.text( playlist.name )
					.click( function(){
						_this.switchTab( inx );
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
					var listSetLeft = $plListSet.find('a').eq( pos ).offset().left - $plListSet.offset().left ;
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
		}

		// Add the selectable media list
		_this.addMediaList();

		var $videoList = _this.getVideoList();
		// Update the player
		_this.drawEmbedPlayer( _this.clipIndex, function(){
			_this.updatePlaylistLayout();

			_this.sourceHandler.adjustTextWidthAfterDisplay( $videoList );

			// Should test for touch support
			if( mw.isMobileDevice() && !$videoList[0].iScroll ){
				// give real height for iScroll:
				$videoList.css("height", this.getListHeight() );
				// add iScroll:
				$videoList[0].iScroll =
					new iScroll( 'media-rss-video-list-' + _this.id, {
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
			if( callback ) {
				callback();
			}
		});
	},
	updatePlaylistLayout: function(){
		var playerSize = this.getTargetPlayerSize();
		// make sure the player has the correct size:
		this.embedPlayer.updateInterfaceSize( playerSize );
		// Update the list height ( vertical layout )
		if( this.layout == 'vertical' ){
			var verticalSpace = this.embedPlayer.getInterface().height();
			this.getVideoListWrapper().css({
				'left' : '0px',
				'right' : '4px'
			});
		} else {
			// Update horizontal layout
			this.getVideoListWrapper().css( {
				'top' : '0px',
				'left' :  parseInt( playerSize.width ) + 4,
				'right' : '2px',
				'height' : playerSize.height
			} );
			this.getVideoList().css('height', this.getListHeight());
			if( this.getVideoList()[0].iScroll ){
				this.getVideoList()[0].iScroll.refresh();
			}
		}
		// Show the videoList
		this.getVideoListWrapper().show();
	},
	switchTab: function( inx ){
		var _this = this;

		var $tabSet = this.$target.find( '.playlist-set-list' );

		$tabSet
		.find('a')
		.eq( inx )
		.addClass( 'ui-state-active' )
		.siblings().removeClass('ui-state-active');

		 _this.sourceHandler.setPlaylistIndex( inx );
		 mw.log( 'mw.Playlist:: selectPlaylist:' + inx );
		 _this.$target.find( '.media-rss-video-list' )
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
			_this.$target.find( '.media-rss-video-list' ).empty();
			_this.addMediaList();
			_this.embedPlayer.triggerHelper( 'indexChanged', { 'newIndex' : inx } );
		 });
	},
	/**
	* Update the target size of the player
	*/
	getTargetPlayerSize: function( ){
		var _this = this;
		// Get the target width and height:
		this.targetWidth = this.$target.width();
		this.targetHeight = this.$target.height();

		// if there is no player interface take all the allowed space:
		if( !_this.sourceHandler.hasPlaylistUi() ){
			return {
				'width' : this.targetWidth,
				'height' : this.targetHeight
			};
		}

		if( _this.layout == 'vertical' ){
			// TODO make embedPlayer.isAudio() accurate!@
			// check for audio player:
			if( this.embedPlayer.controlBuilder.height ==  this.embedPlayer.getInterface().height() ){
				this.targetHeight = this.embedPlayer.controlBuilder.height;
			} else {
				/*
				var pa = this.playerAspect.split(':');
				this.targetHeight = parseInt( ( pa[1] / pa[0] ) * this.targetWidth );
				*/
				this.targetHeight = this.targetHeight - this.getVideoListWrapper().height();
			}
			/* Vertical layout */
			this.targetPlayerSize = {
				'width' : this.targetWidth,
				'height' : this.targetHeight
			};
		} else {
			/* horizontal layout */
			// Check if we have explicit video size
			var playerWidth = parseInt( this.$target.find( '.media-rss-video-player-container' ).css('width') );
			if(  isNaN( playerWidth) || !playerWidth ){
				if( _this.sourceHandler.getVideoListWidth() != 'auto' ){
					playerWidth = this.targetWidth - _this.sourceHandler.getVideoListWidth();
				} else {
					var pa = this.playerAspect.split(':');
					playerWidth = parseInt( ( pa[0] / pa[1] ) * this.targetHeight );
				}
			}
			this.targetPlayerSize = {
				'height' : ( this.targetHeight - this.getTitleHeight() ),
				'width' : playerWidth
			};
		}

		if( parseInt( this.targetPlayerSize.width ) > this.targetWidth ){
			var pa = this.playerAspect.split(':');
			this.targetPlayerSize.width = this.targetWidth;
			this.targetPlayerSize.height = parseInt( ( pa[1] / pa[0] ) * this.targetWidth );
		}

		return this.targetPlayerSize;
	},
	getEmbedPlayer: function(){
		return $('#' + this.getVideoPlayerId() )[0];
	},
	getVideoPlayerTarget: function(){
		return this.$target.find( '.media-rss-video-player' );
	},
	// Play a clipIndex, if the player is already in the page swap the player src to the new target
	playClip: function( clipIndex, autoContinue ){
		var _this = this;
		mw.log( "Playlist::playClip: index: " + clipIndex + ' autoContinue: ' + autoContinue);
		// Check for a video/audio tag already in the page:
		var embedPlayer = this.getEmbedPlayer();
		this.clipIndex = clipIndex;
		if( !embedPlayer ){
			mw.log("Error: Playlist:: playClip called with null embedPlayer ");
			return ;
		}

		// trigger a playlist_playClip event:
		embedPlayer.triggerHelper( 'Playlist_PlayClip', [ clipIndex, !!autoContinue ]);

		// iOS devices have a autoPlay restriction, we issue a raw play call on
		// the video tag to "capture the user gesture" so that future
		// javascript play calls can work
		if( embedPlayer.getPlayerElement() ){
			mw.log("Playlist:: issue load call to capture click for iOS");
			embedPlayer.getPlayerElement().load();
		}

		// Update selected clip:
		_this.updatePlayerUi( clipIndex );

		// disable switching playlist items while loading the next one
		_this.disablePrevNext();

		// Hand off play clip request to sourceHandler:
		_this.sourceHandler.playClip( embedPlayer, clipIndex, function(){
			mw.log( "Playlist::playClip > sourceHandler playClip callback ");
			// restore next prev buttons:
			_this.enablePrevNext();
			// Add playlist specific bindings:
			_this.addClipBindings();
			// Restore onDoneInterfaceFlag
			embedPlayer.onDoneInterfaceFlag = true;
		} );
	},
	/**
	* Update the player
	*/
	drawEmbedPlayer: function( clipIndex , callback ){
		var _this = this;
		mw.log( "Playlist:: updatePlayer " + clipIndex );
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
		mw.log( "Playlist::addClipBindings" );

		var embedPlayer = _this.getEmbedPlayer();
		// remove any old playlist bindings:
		$( embedPlayer ).unbind( this.bindPostfix );

		// Once the player is ready add any custom bindings
		_this.sourceHandler.addEmbedPlayerBindings( embedPlayer );

		// Add the seek forward / back buttons
		_this.addPlaylistSeekButtons();

		// Add ad bindings
		_this.addPlaylistAdBindings();

		// Setup ondone playing binding to play next clip (if autoContinue is true )
		if( _this.sourceHandler.autoContinue == true ){
			$( embedPlayer ).bind( 'postEnded' + _this.bindPostfix, function(event ){
				mw.log("Playlist:: postEnded > on inx: " + _this.clipIndex );
				// Play next clip
				if( parseInt(  _this.clipIndex ) + 1 < _this.sourceHandler.getClipCount() && parseInt( _this.clipIndex ) + 1 <= parseInt( mw.getConfig( 'Playlist.MaxClips' ) ) ){
					// Update the onDone action object to not run the base control done:
					mw.log("Playlist:: postEnded > continue playlist set: onDoneInterfaceFlag false ");
					embedPlayer.onDoneInterfaceFlag = false;
					_this.clipIndex = parseInt( _this.clipIndex ) + 1;
					// update the player and play the next clip
					_this.playClip( _this.clipIndex, true );
				} else {
					mw.log("Playlist:: End of playlist, run normal end action" );
					embedPlayer.triggerHelper( 'playlistDone' );
					if( _this.sourceHandler.loop ){
						embedPlayer.onDoneInterfaceFlag = false;
						_this.clipIndex =0;
						_this.playClip( _this.clipIndex, true );
					} else {
						// Update the onDone action object to not run the base control done:
						embedPlayer.onDoneInterfaceFlag = true;
					}
				}
			});
		}
		var uiSelector = '.playlist-set-container,.playlist-block-list,.video-list-wrapper,.playlist-scroll-buttons';
		// fullscreen support
		$( embedPlayer ).bind( 'onOpenFullScreen' + this.bindPostfix, function(){
			// hide interface components ( these should really all be in their own div! )
			$(uiSelector).hide();
			// hide the playlist blocker:
			_this.$target.find( '.playlist-block-list' ).hide();
		});
		$( embedPlayer ).bind( 'onCloseFullScreen' + this.bindPostfix, function(){
			// restore the playlist blocker ( if present
			_this.$target.find( '.playlist-block-list' ).show();

			// only resize if the playlist has a ui:
			if( !_this.sourceHandler.includeInLayout ){
				return ;
			}

			$(uiSelector).show();
		});

		// if in an iframe support update resize binding
		$( embedPlayer ).bind( 'updateLayout' + this.bindPostfix, function(){
			// don't do any updates if in fullscreen
			// not displaying a player
			// or there is no playlist ~layout~ to resize.
			if( embedPlayer.controlBuilder.isInFullScreen()
					||
				!embedPlayer.displayPlayer
					||
				!_this.sourceHandler.includeInLayout
			){
				return ;
			}
			// else do the update:
			_this.updatePlaylistLayout();
		});

		$( embedPlayer ).bind( 'playlistPlayPrevious' + this.bindPostfix, function() {
			_this.playPrevious();
		});

		$( embedPlayer ).bind( 'playlistPlayNext' + this.bindPostfix, function() {
			_this.playNext();
		});
		// check for interface events and update playlist specific interface components:
		$( embedPlayer ).bind( 'onDisableInterfaceComponents' + this.bindPostfix, function( event, excludingComponents ){
			if ( !excludingComponents || ( $.inArray( 'playlistPrevNext', excludingComponents ) == -1 ) ) {
				_this.disablePrevNext();
			}
		});
		$( embedPlayer ).bind( 'onEnableInterfaceComponents' + this.bindPostfix, function(){
			_this.enablePrevNext();
		});
		// Trigger playlistsListed when we get the data
		$( embedPlayer ).trigger( 'playlistsListed' );
	},
	disablePrevNext: function(){
		this.embedPlayer.$interface.find('.playlistPlayPrevious,.playlistPlayNext')
	 		.unbind('mouseenter mouseleave click')
	 		.css('cursor', 'default' );
	},
	enablePrevNext: function(){
		var _this = this;
		this.embedPlayer.$interface.find('.playlistPlayPrevious,.playlistPlayNext')
		.css('cursor', 'pointer' )
		.unbind('click')
		.click(function(){
			if( $( this).hasClass( 'playlistPlayPrevious' ) ){
				$( _this.embedPlayer ).trigger( 'playlistPlayPrevious' );
			} else if( $( this ).hasClass( 'playlistPlayNext' ) ){
				$( _this.embedPlayer ).trigger( 'playlistPlayNext');
			}
		})
		.buttonHover();
	},
	updatePlayerUi:function( clipIndex ){
		var _this = this;
		// Give a chance for sourceHandler to update player ui
		_this.sourceHandler.updatePlayerUi( clipIndex );

		// Update the player list if present:
		_this.$target.find( '.clipItemBlock')
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

		// Don't add seek buttons if we don't have an embedPlayer:
		if( ! embedPlayer ){
			return ;
		}
		// add previous / next buttons if not present:
		// TODO (HACK) we should do real controlBar support for custom buttons
		if( ! embedPlayer.controlBuilder ){
			return ;
		}
		var $controlBar = embedPlayer.$interface.find('.control-bar');
		if( $controlBar.find( '.ui-icon-seek-next' ).length != 0 ){
			// already have seek buttons
			return false;
		}

		var $plButton = $('<div />')
			.addClass("ui-state-default ui-corner-all ui-icon_link lButton")
			.buttonHover()
			.append(
				$('<span />')
				.addClass( "ui-icon")
			);

		var $playButton = $controlBar.find( '.play-btn');

		if( _this.sourceHandler.isNextButtonDisplayed() ){
		 	// make space ( reduce playhead length )
			var pleft =  parseInt( $controlBar.find( '.play_head' ).css( 'left' ) ) + 28;
			$controlBar.find('.play_head').css('left', pleft);

			var $nextButton = $plButton.clone().attr({
						'title' : 'Next clip'
					})
					.unbind('click')
					.click(function(){
						$( embedPlayer ).trigger( 'playlistPlayNext' );
					})
					.addClass( 'playlistPlayNext' )
					.find('span')
					.addClass('ui-icon-seek-next')
					.parent()
					.buttonHover();

			$playButton.after($nextButton);
		}

		if(  _this.sourceHandler.isPreviousButtonDisplayed() ){
			// make space ( reduce playhead length )
			var pleft =  parseInt( $controlBar.find( '.play_head' ).css( 'left' ) ) + 28;
			$controlBar.find('.play_head').css('left', pleft);

			var $prevButton = $plButton.clone().attr({
						'title' : 'Previous clip'
					})
					.unbind('click')
					.click(function(){
						$( embedPlayer ).trigger( 'playlistPlayPrevious' );
					})
					.addClass( 'playlistPlayPrevious' )
					.find('span').addClass('ui-icon-seek-prev')
					.parent()
					.buttonHover();

			$playButton.after($prevButton);
		}
	},
	// add bindings for playlist playback ( disable playlist item selection during ad Playback )
	addPlaylistAdBindings: function(){
		var _this = this;
		var embedPlayer = this.getEmbedPlayer();
		$( embedPlayer ).bind('AdSupport_StartAdPlayback' + this.bindPostfix, function(){
			_this.blockPlaylist();
		});
		$( embedPlayer ).bind('AdSupport_EndAdPlayback' + this.bindPostfix, function(){
			_this.restorePlaylist();
		});
	},
	blockPlaylist: function(){
		var _this = this;
		var embedPlayer = this.getEmbedPlayer();
		// Add the Disable clip switch flag:
		_this.enableClipSwitch = false;

		// Add a gray overlay
		var $listwrap = this.$target.find( '.video-list-wrapper' );
		var cssPops = ['width','height', 'position', 'bottom', 'right', 'left', 'top'];
		var cssObj = {};

		// Copy in all the settings:
		$.each( cssPops, function(inx, prop){
			cssObj[ prop ] = $listwrap.css(prop);
		});
		// make sure we are not in fullscreen ( and there is nothing to cover up )
		if( ! this.$target.find( '.playlist-block-list' ).length ){
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
		// if in fullscreen hide the listwrap
		if( embedPlayer.controlBuilder.isInFullScreen() ){
			_this.$target.find( '.playlist-block-list' ).hide();
		}
	},
	restorePlaylist: function(){
		// Restore clip switch:
		this.enableClipSwitch = true;
		this.$target.find( '.playlist-block-list' ).remove();
	},
	/**
	* Add the media list with the selected clip highlighted
	*/
	addMediaList: function() {
		var _this = this;
		var $targetItemList = this.$target.find( '.media-rss-video-list' );
		// update the playlistItme total available width
		this.playlistItemWidth = $targetItemList.width();
		$.each( this.sourceHandler.getClipList(), function( inx, clip ){
			mw.log( 'mw.Playlist::addMediaList: On clip: ' + inx);
			if( inx > mw.getConfig( 'Playlist.MaxClips' ) ){
				return false;
			}
			// Output each item with the current selected index:
			var $itemBlock = $('<div />')
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
			.bind( 'click', function(event){
				// Check that we are not trying to switch during another switch
				if ( _this.embedPlayer.changeMediaStarted ) {
					return ;
				}
				// check that we can switch clips:
				if( !_this.enableClipSwitch ){
					return ;
				}
				// from chrome pretending to be iOS ( store the last touch event )
				if( _this.onTouchScroll && ! mw.isIOS() ){
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
			//mw.log("Added item block : " + $targetItemList.children().length );
		});
	},

	play: function(){
		mw.log( 'mw.Playlist::play ');
		var embedPlayer = $('#' + this.getVideoPlayerId() )[0];
		embedPlayer.play();
	},

	playNext: function() {
		var _this = this;
		if( _this.enableClipSwitch &&  parseInt( _this.clipIndex ) + 1 < _this.sourceHandler.getClipCount() && parseInt( _this.clipIndex ) + 1 <= parseInt( mw.getConfig( 'Playlist.MaxClips' ) ) ){
			_this.clipIndex++;
			_this.playClip( _this.clipIndex );
			return ;
		}
		mw.log( "Error: mw.playlist can't next: current: " + _this.clipIndex );
	},

	playPrevious: function() {
		var _this = this;
		if( _this.enableClipSwitch && _this.clipIndex - 1 >= 0 ){
			_this.clipIndex--;
			_this.playClip( _this.clipIndex );
			return ;
		}
		mw.log("Cant prev: cur:" + _this.clipIndex );
	},

	/**
	 * Load the playlist driver from a source
	 * @param {function} callback Function to be called once load is complete.
	 */
	loadPlaylistHandler: function( callback ){
		var _this = this;
		// Allow plugins to setup the source handler:
		$( mw ).trigger('PlaylistGetSourceHandler', [ this ] );

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
