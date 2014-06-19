( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlistAPI', mw.KBaseMediaList.extend({

		defaultConfig: {
			'initItemEntryId': null,
			'autoContinue': true,
			'autoPlay': null,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null,
			'includeInLayout': null,
			'parent': 'sideBarContainer',
			'mediaItemWidth': 290,
			'titleLimit': 25,
			'descriptionLimit': 70,
			'thumbnailWidth' : 50,
			'horizontalMediaItemWidth': 290,
			'includeThumbnail': true,
			'includeItemNumberPattern': false,
			'includeMediaItemDuration': true,
			'loop': false,
			'containerPosition': null //'after'
		},

		// flag to store the current loading entry
		loadingEntry: null,
		// Flag for disabling jumping between clips
		enableClipSwitch: true,

		playlistSet : [],

		getConfig: function( key ){
			return this.embedPlayer.getKalturaConfig( 'playlistAPI', key );
		},

		setup: function( embedPlayer ) {
			this.addBindings();
			this.loadPlaylists();
		},
		addBindings: function() {
			var _this = this;
			this.bind( 'playerReady', function ( e, newState ) {
				if (_this.playlistSet.length > 0){
					_this.prepareData(_this.playlistSet[0].items);
					_this.setMediaList(_this.playlistSet[0].items);
				}
			});

			this.bind("mediaListLayourReady", function(){
				// add play list event handlers
				var chapterBox = _this.getComponent().find('.chapterBox');
				chapterBox
					.off('click' )
					.on('click', function(){
						// set active class to the current selected item
						$(".chapterBox").removeClass( 'active');
						$( this ).addClass( 'active');
						// get entry ID to play
						var index = $(this).data( 'chapterIndex' );
						_this.playMedia( index);
					});
			});
		},

		loadPlaylists: function(){
			var embedPlayer = this.embedPlayer;
			// Populate playlist set with kalturaPlaylistData
			for (var playlistId in embedPlayer.kalturaPlaylistData ) {
				if (embedPlayer.kalturaPlaylistData.hasOwnProperty(playlistId)) {
					this.playlistSet.push( embedPlayer.kalturaPlaylistData[ playlistId ] );
				}
			}
		},

		prepareData: function(itemsArr){
			for (var i = 0; i < itemsArr.length; i++){
				var item = itemsArr[i];
				var customData = item.partnerData ? JSON.parse(item.partnerData) :  {};
				var title = item.name || customData.title;
				var description = item.description || customData.desc;
				item.order = i;
				item.title = title;
				item.description = description;
				item.width = this.getConfig( 'mediaItemWidth' );
				item.durationDisplay = item.duration;
			}
		},

		playMedia: function(clipIndex){
			var embedPlayer = this.embedPlayer;
			var _this = this;
			var id = _this.mediaList[clipIndex].id;
			if( !embedPlayer ){
				mw.log("Error: Playlist:: playClip called with null embedPlayer ");
				return ;
			}

			// iOS devices have a autoPlay restriction, we issue a raw play call on
			// the video tag to "capture the user gesture" so that future
			// javascript play calls can work
			if( embedPlayer.getPlayerElement() && embedPlayer.getPlayerElement().load ){
				mw.log("Playlist:: issue load call to capture click for iOS");
				embedPlayer.getPlayerElement().load();
			}

			// Send notifications per play request
			if( clipIndex == 0 ) {
				embedPlayer.triggerHelper( 'playlistFirstEntry' );
			} else if( clipIndex == (this.mediaList.length-1) ) {
				embedPlayer.triggerHelper( 'playlistLastEntry' );
			} else {
				embedPlayer.triggerHelper( 'playlistMiddleEntry' );
			}

			// Check if entry id already matches ( and is loaded )
			if( embedPlayer.kentryid == id ){
				if( this.loadingEntry ){
					mw.log("Error: PlaylistHandlerKaltura is loading Entry, possible double playClip request");
				}else {
					embedPlayer.play();
				}
				return ;
			}

			// Update the loadingEntry flag:
			this.loadingEntry = id;
			var originalAutoPlayState = embedPlayer.autoplay;

			// Listen for change media done
			var bindName = 'onChangeMediaDone' + this.bindPostFix;
			$( embedPlayer).unbind( bindName ).bind( bindName, function(){
				mw.log( 'mw.PlaylistHandlerKaltura:: onChangeMediaDone' );
				_this.loadingEntry = false;
				// restore autoplay state:
				embedPlayer.autoplay = originalAutoPlayState;
				embedPlayer.play();
			});
			mw.log("PlaylistHandlerKaltura::playClip::changeMedia entryId: " + id);

			// Make sure its in a playing state when change media is called if we are autoContinuing:
			if( this.autoContinue && !embedPlayer.firstPlay ){
				embedPlayer.stopped = embedPlayer.paused = false;
			}
			// set autoplay to true to continue to playback:
			embedPlayer.autoplay = true;

			// Use internal changeMedia call to issue all relevant events
			embedPlayer.sendNotification( "changeMedia", {'entryId' : id, 'playlistCall': true} );

			// Add playlist specific bindings:
			//_this.addClipBindings();

			// Restore onDoneInterfaceFlag
			embedPlayer.onDoneInterfaceFlag = true;
		},

		addClipBindings: function( clipIndex ){
			var _this = this;
			mw.log( "Playlist::addClipBindings" );

			var embedPlayer = _this.embedPlayer;
			// remove any old playlist bindings:
			//$( embedPlayer ).unbind( this.bindPostfix );

			// Once the player is ready add any custom bindings
			//_this.sourceHandler.addEmbedPlayerBindings( embedPlayer );

			// Add the seek forward / back buttons
			//_this.addPlaylistSeekButtons();

			// Add ad bindings
			_this.addPlaylistAdBindings();

			// Setup ondone playing binding to play next clip (if autoContinue is true )
			if( _this.autoContinue == true ){
				$( embedPlayer ).bind( 'postEnded' + _this.bindPostfix, function(event ){
					mw.log("Playlist:: postEnded > on inx: " + clipIndex );
					// Play next clip
					if(  (clipIndex + 1) < _this.mediaList.length && (clipIndex + 1) <= parseInt( mw.getConfig( 'Playlist.MaxClips' ) ) ){
						// Update the onDone action object to not run the base control done:
						mw.log("Playlist:: postEnded > continue playlist set: onDoneInterfaceFlag false ");
						embedPlayer.onDoneInterfaceFlag = false;
						// update the player and play the next clip
						_this.playMedia( clipIndex + 1, true );
					} else {
						mw.log("Playlist:: End of playlist, run normal end action" );
						embedPlayer.triggerHelper( 'playlistDone' );
						if( _this.loop ){
							embedPlayer.onDoneInterfaceFlag = false;
							_this.playClip(0);
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
				if( !_this.includeInLayout ){
					return ;
				}

				$(uiSelector).show();
			});

			// if in an iframe support update resize binding
			$( embedPlayer ).bind( 'updateLayout' + this.bindPostfix, function(){
				// don't do any updates if in fullscreen
				// not displaying a player
				// or there is no playlist ~layout~ to resize.
				if( embedPlayer.layoutBuilder.isInFullScreen()
					||
					!embedPlayer.displayPlayer
					||
					!_this.sourceHandler.includeInLayout
					){
					return ;
				}
				// else do the update:
				//_this.updatePlaylistLayout(); TODO: check if needed
			});

			$( embedPlayer ).bind( 'playlistPlayPrevious' + this.bindPostfix, function() {
				_this.playPrevious(clipIndex);
			});

			$( embedPlayer ).bind( 'playlistPlayNext' + this.bindPostfix, function() {
				_this.playNext(clipIndex);
			});
			// check for interface events and update playlist specific interface components:
//			$( embedPlayer ).bind( 'onDisableInterfaceComponents' + this.bindPostfix, function( event, excludingComponents ){
//				if ( !excludingComponents || ( $.inArray( 'playlistPrevNext', excludingComponents ) == -1 ) ) {
//					_this.disablePrevNext();
//				}
//			});
//			$( embedPlayer ).bind( 'onEnableInterfaceComponents' + this.bindPostfix, function(){
//				_this.enablePrevNext();
//			});
			// Trigger playlistsListed when we get the data
			$( embedPlayer ).trigger( 'playlistsListed' );
		},

		// add bindings for playlist playback ( disable playlist item selection during ad Playback )
		addPlaylistAdBindings: function(){
			var _this = this;
			var embedPlayer = this.embedPlayer;
			$( embedPlayer ).bind('AdSupport_StartAdPlayback' + this.bindPostfix, function(){
				_this.blockPlaylist();
			});
			$( embedPlayer ).bind('AdSupport_EndAdPlayback' + this.bindPostfix, function(){
				_this.restorePlaylist();
			});
		},
		blockPlaylist: function(){
			var _this = this;
			var embedPlayer = this.embedPlayer;
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
			if( embedPlayer.layoutBuilder.isInFullScreen() ){
				_this.$target.find( '.playlist-block-list' ).hide();
			}
		},
		restorePlaylist: function(){
			// Restore clip switch:
			this.enableClipSwitch = true;
			this.$target.find( '.playlist-block-list' ).remove();
		},

		playNext: function(clipIndex) {
			var _this = this;
			if( _this.enableClipSwitch &&  (clipIndex + 1) < _this.mediaList.length && (clipIndex + 1) <= parseInt( mw.getConfig( 'Playlist.MaxClips' ) ) ){
				_this.playClip( clipIndex+1 );
				return ;
			}
			mw.log( "Error: mw.playlist can't next: current: " + _this.clipIndex );
		},

		playPrevious: function(clipIndex) {
			var _this = this;
			if( _this.enableClipSwitch && clipIndex - 1 >= 0 ){
				_this.playClip( clipIndex-1 );
				return ;
			}
			mw.log("Cant prev: cur:" + clipIndex-1 );
		}

	})

	);

} )( window.mw, window.jQuery );