/**
* Playlist Embed. Enables the embedding of a playlist using the mwEmbed player
*/

//Get all our message text
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
		
		// We assign the base player the id of the playlist ( since we want the player api to be 
		// exposed for the playlist id ) 
		this.playerId = ( options.id )? options.id : $j( this.target ).attr( 'id' );
		// Setup the id for the playlist container: 		
		this.id = 'plholder_' + this.playerId;
		// Update the target id 
		$j( this.target ).attr( 'id', this.id );
		this.target = '#' + this.id;
		
		// Set binding to disable "waitForMeta" for playlist items ( we know the size and length )
		$j( mw ).bind( 'checkPlayerWaitForMetaData', function(even, playerElement ){
			if( $j( playerElement ).hasClass( 'mwPlaylist') ){
				playerElement.waitForMeta = false;
			}
		});
			
		this.type = ( options.type ) ?
			options.type:
			mw.getConfig('Playlist.DefaultType' );

		var namedOptions = ['layout', 'playerAspect', 'itemThumbWidth', 'titleHeight', 'titleLength', 'descriptionLength'];
		$j.each( namedOptions, function(inx, optionName ){
			var confName = 'Playlist.' + optionName.charAt(0).toUpperCase() + optionName.substr(1);
			_this[ optionName ] = ( typeof options[ optionName ] != 'undefined' )?
					options[ optionName ] :
					mw.getConfig( confName );
		});
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
		// Set the target to loadingSpinner:
		$j( this.target ).empty().loadingSpinner();
		var callback = function(){
			if( _this.sourceHandler.autoPlay || _this.autoPlay ){
				_this.playClip( _this.clipIndex );
			}
			drawDoneCallback();
		};
		this.loadPlaylistHandler( function( sourceHandler ){
			mw.log("Playlist::drawPlaylist: sourceHandler loaded");
			_this.sourceHandler = sourceHandler;
			// Check if load failed or empty playlist
			if( _this.sourceHandler.getClipList().length == 0 ){
				$j( _this.target ).empty().text( gM('mwe-playlist-empty') );
				return ;
			}
			// Check if we should include the ui 
			if( _this.sourceHandler.hasPlaylistUi() ){
				_this.drawUI( callback );
			} else {
				$j( _this.target )
				.empty()
				.append(
					_this.getPlayerContainer()
				);
				_this.updatePlayer( _this.clipIndex, callback );
			}
		});
	},
	getClipList:function(){
		return  this.sourceHandler.getClipList();
	},
	getPlayerContainer:function(){
		return $j( '<span />' )
		.addClass( 'media-rss-video-player-container')
		.css({
			'float' : 'left'
		})
		.append( $j('<div />').addClass( 'media-rss-video-player' ).css( 'position', 'relative' ) );
	},
	/**
	* Draw the media rss playlist ui
	*/
	drawUI: function( callback ){
		var _this = this;
		// Empty the target and setup player and playerList divs
		$j( _this.target )
		.empty()
		.addClass( 'ui-widget-content' )
		.css('position', 'relative' )
		.append(
			_this.getPlayerContainer()
			,
			$j( '<div />')
			.addClass( 'media-rss-video-list' )
			.attr('id', _this.id + '_videolist')
			.css({
				'position' : 'absolute',
				'z-index' : '1',
				'overflow-x' : 'hidden',
				'overflow-y' : 'auto',
				'bottom': '7px'
			})
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
			}
			var $plListContainer =$j('<div />')
			.addClass( 'playlistSet-container' )
			.css({
				'position' : 'absolute',
				'overflow' : 'hidden',
				'top' : '3px',
				'height' : '20px',
				'padding' : '4px',
				'left' : leftPx
			})
			.append(
				$j('<span />')
				.addClass( 'playlistSetList' )
				.css( {
					'white-space':'pre'
				})
			);
			$j( _this.target ).append( $plListContainer );

			var $plListSet = $j( _this.target ).find( '.playlistSetList' );

			$j.each( playlistSet, function( inx, playlist){
				// check for playlist name: 
				if( !playlist.name ){
					return true;
				}
				// Add a divider
				if( inx != 0 ){
					$plListSet.append( $j('<span />').text( ' | ') );
				}
				$plLink = $j('<a />')
					.attr('href', '#')
					.text( playlist.name )
					.click( function(){
						
						$j(this)
						.addClass( 'ui-state-active' )
						.siblings().removeClass('ui-state-active');
						
						 _this.sourceHandler.setPlaylistIndex( inx );
						 mw.log( 'mw.Playlist:: selectPlaylist:' + inx );
						 $j( _this.target + ' .media-rss-video-list').loadingSpinner();
						 _this.sourceHandler.loadCurrentPlaylist( function(){
							 $j( _this.target + ' .media-rss-video-list').empty();
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
				var $scrollButton =	$j('<div />')
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

				var $buttonSpan = $j('<span />')
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

		// Add the player
		_this.updatePlayer( _this.clipIndex, function(){
			// Update the list height ( vertical layout )
			if( _this.layout == 'vertical' ){
				$j( _this.target + ' .media-rss-video-list' ).css( {
					'top' : $j( _this.target + ' .media-rss-video-player-container' ).height() + 4,
					'width' : '95%'
				} );
				// Add space for the multi-playlist selector:
				if( _this.sourceHandler.hasMultiplePlaylists() ){
					// also adjust .playlistSet-container if present
					$j( _this.target + ' .playlistSet-container').css( {
						'top' : $j( _this.target + ' .media-rss-video-player-container' ).height() + 4
					});
					$j( _this.target + ' .media-rss-video-list' ).css({
						'top' : $j( _this.target + ' .media-rss-video-player-container' ).height() + 26
					});
				}

			} else {
				// Update horizontal layout
				$j( _this.target + ' .media-rss-video-list').css( {
					'top' : '0px',
					'left' : $j( _this.target + ' .media-rss-video-player-container' ).width() + 4,
					'right' : '4px'
				} );
				// Add space for the multi-playlist selector:
				if( _this.sourceHandler.hasMultiplePlaylists() ){
					$j( _this.target + ' .playlistSet-container').css( {
						'left' : $j( _this.target + ' .media-rss-video-player-container' ).width() + 4
					});
					$j( _this.target + ' .media-rss-video-list').css( {
						'top' : '26px'
					});
				}
			}
			var $videoList = $j( _this.target + ' .media-rss-video-list' );
			$videoList.show();
			// show the video list and apply the swipe binding
			$j( _this.target ).find('.media-rss-video-list-wrapper').fadeIn();
			if( mw.isHTML5FallForwardNative() ){
				// iScroll is buggy with current version of iPad / iPhone use scroll buttons instead
				/*
				document.addEventListener('touchmove', function(e){ e.preventDefault(); });
				var myScroll = iScroll( _this.id + '_videolist' );
				setTimeout(function () { myScroll.refresh(); }, 0);
				*/
				// Add space for scroll buttons:
				var curTop = $j( _this.target + ' .media-rss-video-list' ).css('top');
				if(!curTop) curTop = '0px';
				$j( _this.target + ' .media-rss-video-list' ).css( {
					'position' : 'absolute',
					'height' : null,
					'top' : curTop,
					'bottom' : '48px'
				});
				if( _this.layout == 'vertical' ){
					$j( _this.target + ' .media-rss-video-list' ).css({
						'top' : $j( _this.target + ' .media-rss-video-player-container' ).height() + 8
					});
				}
				
				// Add scroll buttons if configured to do so:
				if( mw.getConfig( 'Playlist.ShowScrollButtons' ) ){
					_this.addScrollButtons( $videoList );
				}				
			}
			if( callback ) 
				callback();
		});
	},
	addScrollButtons: function( $videoList){
		var _this = this;
		$j( _this.target ).append(
			$j( '<div />').css({
				'position' : 'absolute',
				'bottom' : '15px',
				'right': '8px',
				'height' : '30px',
				'width' : $j( _this.target + ' .media-rss-video-list').width()
			})
			.append(
				$j.button({
					'text' : 'scroll down',
					'icon' : 'circle-arrow-s'
				})
				.css('float', 'right')
				.click(function(){
					var clipListCount = $videoList.children().length;
					var clipSize = $videoList.children(':first').height();
					var curTop = $videoList.get(0).scrollTop;

					var targetPos = curTop + (clipSize * 3);
					if( targetPos > clipListCount * clipSize ){
						targetPos = ( clipListCount * ( clipSize -1 ) );
					}
					mw.log(" animate to: " +curTop + ' + ' + (clipSize * 3) + ' = ' + targetPos );
					$videoList.animate({'scrollTop': targetPos }, 500 );

					return false;
				}),
				$j.button({
					'text' : 'scroll up',
					'icon' : 'circle-arrow-n'
				})
				.css('float', 'left')
				.click(function(){
					var clipListCount = $videoList.children().length;
					var clipSize = $videoList.children(':first').height();
					var curTop = $videoList.get(0).scrollTop;

					var targetPos = curTop - (clipSize * 3);
					if( targetPos < 0 ){
						targetPos = 0;
					}
					mw.log(" animate to: " +curTop + ' + ' + (clipSize * 3) + ' = ' + targetPos );
					$videoList.animate({'scrollTop': targetPos }, 500 );

					return false;
				})
			)
		);
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
		this.targetWidth = $j( this.target ).width();
		this.targetHeight = $j( this.target ).height();
		
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
			if( _this.sourceHandler.getVideoListWidth() != 'auto' ){
				var playerWidth = this.targetWidth - _this.sourceHandler.getVideoListWidth();
			} else {
				var pa = this.playerAspect.split(':');
				var playerWidth = parseInt( ( pa[0] / pa[1] ) * this.targetHeight );
			}
			
			this.targetPlayerSize = {
				'height' : ( this.targetHeight - this.titleHeight - 10 ) + 'px',
				'width' : playerWidth
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
		return $j('#' + this.getVideoPlayerId() ).get(0);
	},
	// Play a clipIndex, if the player is already in the page swap the player src to the new target
	playClip: function( clipIndex ){
		var _this = this;
		// Check for a video/audio tag already in the page:
		var $inDomAV = $j( _this.target + ' .media-rss-video-player video, '+ _this.target + ' .media-rss-video-player audio' );
		var embedPlayer = this.getEmbedPlayer();
	
		if( $inDomAV.length == 0 || embedPlayer.instanceOf != 'Native' || !mw.isMobileDevice() ){
			_this.updatePlayer( clipIndex, function(){
				mw.log("mw.Playlist:: PlayClip: callback" );
				_this.play();
			});
			return ;
		}

		if (typeof _this.nextPlayIndex !='undefined'){
			if (clipIndex < _this.nextPlayIndex) {
				return;
			}
			_this.nextPlayIndex = clipIndex + 1;
		}  
          
		// Add a loader to the embed player: 
		$j( embedPlayer )
		.getAbsoluteOverlaySpinner()
		.attr('id', _this.getVideoPlayerId() + '_mappingSpinner' );
	    
		// Update the poster
		embedPlayer.updatePosterSrc( _this.sourceHandler.getClipPoster( clipIndex, _this.getTargetPlayerSize() ) );
		// Empty existing sources
	    embedPlayer.emptySources();

		// Update the interface sources
	    this.sourceHandler.getClipSources( clipIndex, function( clipSources ){
			if( !clipSources ){
				mw.log("Error: mw.Playlist no sources found for clipIndex:" + clipIndex);
			}
			for( var i =0; i < clipSources.length; i++ ){
				var $source = $j('<source />')
				.attr( clipSources[i] );
				embedPlayer.mediaElement.tryAddSource( $source.get(0) ) ;
			}
			
			// Auto select the source
			embedPlayer.mediaElement.autoSelectSource();
			// Auto select player based on default order
			if ( !embedPlayer.mediaElement.selectedSource ) {
				mw.log( 'Error no source for playlist swich' );
				if( typeof callback != 'undefined' ) {
					callback();
				}
				return ;
			} else {
				embedPlayer.selectedPlayer = mw.EmbedTypes.getMediaPlayers().defaultPlayer( embedPlayer.mediaElement.selectedSource.mimeType );
			}
			// If we switched to a source that is non-native playback jump out to normal swap 
			if( embedPlayer.selectedPlayer.library != 'Native' ){
				$j('.loadingSpinner').remove();
				$j( _this.target + ' .media-rss-video-player' ).empty().append( $video );
				
				_this.addEmbedPlayerInterface( clipIndex, function(){
					embedPlayer.play();
				});
				return ;
			}
			// Run switchPlaying source 
			if ( typeof _this.nextPlayIndex == 'undefined' ){
				_this.nextPlayIndex = _this.clipIndex + 1;
			}
			mw.log('mw.Playlist:: Play next: ' + _this.nextPlayIndex);
			embedPlayer.switchPlaySrc( embedPlayer.mediaElement.selectedSource.getSrc(), 
					function() { 
						$j('.loadingSpinner').remove(); 
						$( embedPlayer ).data('clipIndex', clipIndex); 
					},
					function() { 
						if( _this.nextPlayIndex < _this.sourceHandler.getClipCount() ){
							_this.playClip( _this.nextPlayIndex ); 
						}
	    			}
			);
	    });
	},
	/**
	* Update the player
	*/
	updatePlayer: function( clipIndex , callback ){
		var _this = this;
		mw.log( "mw.Playlist:: updatePlayer " + clipIndex );
		var playerSize = _this.getTargetPlayerSize();
		this.clipIndex = clipIndex;
		// If we have a ui .. update it: 
		if( _this.sourceHandler.hasPlaylistUi() ){
			this.updatePlayerUi( clipIndex );
		}
		// Check if we really have to update: 
		var embedPlayer = _this.getEmbedPlayer();
		if( $( embedPlayer ).data('clipIndex') == clipIndex ){
			callback();
			return ;
		}
		
		// Build the video tag object:
		var $video = $j( '<video />' )
		.attr({
			'id' : _this.getVideoPlayerId(),
			'poster' : _this.sourceHandler.getClipPoster( clipIndex, playerSize)
		})
		.addClass( 'mwPlaylist' )
		.css(
			playerSize
		);
		
		// Lookup the sources from the playlist provider:
		_this.sourceHandler.getClipSources( clipIndex, function( clipSources ){
			mw.log("mw.Playlist:: getClipSources cb for " + clipIndex );
			if( clipSources ){
				for( var i =0; i < clipSources.length; i++ ){
					var $source = $j('<source />')
						.attr( clipSources[i] );
					$video.append( $source );
				}
			}
			// Put the video player into the page and create the embedPlayer interface
			$j( _this.target + ' .media-rss-video-player' ).empty().append( $video );
			_this.addEmbedPlayerInterface( clipIndex, function(){
				callback();
			});
		});
	},
	updatePlayerUi:function( clipIndex ){
		var _this = this;
		var playerSize = _this.getTargetPlayerSize() ;
		if( this.titleHeight != 0){
			// Build and output the title
			var $title = $j('<div />' )
				.addClass( 'playlist-title ui-state-default ui-widget-header ui-corner-all')
				.css( {
					'top' : '0px',
					'height' : _this.titleHeight,
					'width' : playerSize.width
				} )
				.text(
					_this.sourceHandler.getClipTitle( clipIndex )
				);
			$j( _this.target + ' .media-rss-video-player-container' ).find('.playlist-title').remove();
			$j( _this.target + ' .media-rss-video-player-container' ).prepend( $title );
		}
		// Update the player list if present:
		$j( _this.target + ' .clipItemBlock')
			.removeClass( 'ui-state-active' )
			.addClass( 'ui-state-default' )
			.eq( clipIndex )
			.addClass( 'ui-state-active' );

	},

	getVideoPlayerId: function( ){
		return this.playerId;
	},
	addEmbedPlayerInterface: function( clipIndex, callback ){
		var _this = this;
		mw.log( "mw.Playlist:: addEmbedPlayerInterface " );
		var $video = $j( '#' +_this.getVideoPlayerId() );
		// Add any custom attributes that may be needed for embedPlayer bindings
		var attributes = _this.sourceHandler.getCustomAttributes( _this.clipIndex );
		// Update the video tag with the embedPlayer
		$video.unbind().embedPlayer( attributes, function(){
			var embedPlayer = _this.getEmbedPlayer();
			if(!embedPlayer){
				mw.log("mw.Playlist::updateVideoPlayer > Error, embedPlayer not defined at embedPlayer ready time");
				return;
			}
			// update the player clip index
			$( embedPlayer ).data('clipIndex', clipIndex); 
			
			// Setup ondone playing binding to play next clip (if autoContinue is true )
			if( _this.sourceHandler.autoContinue == true ){
				$j( embedPlayer ).unbind('ended.playlist').bind( 'ended.playlist', function(event ){
					mw.log("Playlist:: updateVideoPlayer -> finished clip" + _this.clipIndex );
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
			_this.addPlaylistSeekButtons( embedPlayer );
			mw.log( "player should be ready: " + _this.clipIndex + ' ' + $j('#' +_this.getVideoPlayerId() ) );
			// Run the callback if its set
			if( callback ){
				callback();
			}
		} );
	},
	// Checks if the player has next prev playlist buttons if not adds them.
	addPlaylistSeekButtons: function( embedPlayer ){
		var _this = this;
		// add previous / next buttons if not present: 
		// TODO (HACK) we should do real controlBar support for custom buttons
		if( embedPlayer.controlBuilder ){
			$controlBar = embedPlayer.$interface.find('.control-bar');
			
			if( $controlBar.find( '.ui-icon-seek-next' ).length != 0 ){
				// already have seek buttons
				return false;
			}
			
			// make space ( reduce playhead lenght ) 
			var pleft =  parseInt( $controlBar.find( '.play_head' ).css( 'left' ) ) + 56;
			$controlBar.find('.play_head').css('left', pleft);
			$plButton = $j('<div />')
				.addClass("ui-state-default ui-corner-all ui-icon_link lButton")
				.buttonHover()
				.append(
					$j('<span />')
					.addClass( "ui-icon")
				);
			$controlBar.find( '.play-btn').after(
				$plButton.clone().attr({
						'title' : 'Previous clip'
					})
					.click(function(){					
						if( _this.clipIndex - 1 >= 0 ){
							_this.clipIndex--;
							_this.playClip( _this.clipIndex );
							return ;
						}
						mw.log("Cant prev: cur:" + _this.clipIndex );
					})
					.find('span').addClass('ui-icon-seek-prev').parent()			
				,					
				$plButton.clone().attr({
						'title' : 'Next clip'
					})
					.click(function(){
						if( _this.clipIndex + 1 < _this.sourceHandler.getClipCount() ){
							_this.clipIndex++;
							_this.playClip( _this.clipIndex );
							return ;
						}
						mw.log("Cant next: cur:" + _this.clipIndex );
					})
					.find('span').addClass('ui-icon-seek-next').parent()
			);
		}
	},
	/**
	* Add the media list with the selected clip highlighted
	*/
	addMediaList: function() {
		var _this = this;
		$targetItemList = $j( this.target + ' .media-rss-video-list');
		// update the playlistItme total available width
		this.playlistItemWidth = $targetItemList.width();
		$j.each( this.sourceHandler.getClipList(), function( inx, clip ){
			mw.log( 'mw.Playlist::addMediaList: On clip: ' + inx);

			// Output each item with the current selected index:
			$itemBlock = $j('<div />')
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
			.click( function(){
				// Update _this.clipIndex
				_this.clipIndex = $j( this ).data( 'clipIndex' );

				_this.nextPlayIndex = _this.clipIndex;

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
		var embedPlayer = $j('#' + this.getVideoPlayerId() ).get(0);
		embedPlayer.play();
	},

	/**
	 * Load the playlist driver from a source
	 */
	loadPlaylistHandler: function( callback ){
		var _this = this;
		// Allow plugins to setup the source handler: 
		$j(mw).trigger('Playlist_GetSourceHandler', [this] );
		
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
	 * Set the playlsit source handler
	 */
	setSourceHandler: function ( sourceHandler ){
		this.sourceHandler = sourceHandler;
	}
};
