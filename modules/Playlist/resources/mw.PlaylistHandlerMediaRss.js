( function( mw, $ ) { "use strict";
mw.PlaylistHandlerMediaRss = function( playlist ){
	return this.init( playlist );
};

mw.PlaylistHandlerMediaRss.prototype = {
	// Set the media rss namespace
	mediaNS: 'http://search.yahoo.com/mrss/',

	// If playback should continue to the next clip on clip complete
	autoContinue: true,

	// if the playlist should automatically start:
	autoPlay: false,

	// If the playlist ui should be displayed
	includeInLayout: true,

	init: function ( playlist ){
		this.playlist = playlist;
	},

	/**
	 * Load the playlist source file with a callback
	 */
	loadPlaylist: function( callback ){
		var _this = this;
		// check if we already have the $rss loaded
		if( this.$rss ){
			callback( this.$rss );
			return ;
		}
		// Check if we have the source pre-loaded:
		if( this.getSrcPayLoad() ) {
			var xmlDoc =  $.parseXML( this.getSrcPayLoad() );
			this.$rss = $( xmlDoc );
			callback( _this.$rss );
			return ;
		}
		// Check if the source is valid:
		if( !_this.getSrc() ){
			mw.log("PlaylistHandlerMediaRSS:: missing source");
			return ;
		}

		// Show an error if a cross domain request:
		if( mw.isLocalDomain( this.getSrc() ) ) {
			// Note this only works with local sources
			$.get( mw.absoluteUrl( this.getSrc() ), function( data ){
				// jQuery already converts data into xmlDoc so the following is not needed:
				// var xmlDoc =  $.parseXML( data );
				_this.$rss = $( data );
				callback( _this.$rss );
			});
		} else {
			new mw.ajaxProxy({
				url: _this.getSrc(),
				success: function( resultXML ) {
					_this.$rss = $( resultXML );
					callback( _this.$rss );
				},
				error: function() {
					mw.log("Error: loading " + _this.getSrc() );
					callback(false);
					return ;
				},
				startWithProxy: true
			});
		}
	},
	hasMultiplePlaylists: function(){
		return false;
	},
	hasPlaylistUi: function(){
		if( this.playlist.layout == 'noClipList' ){
			return false;
		}
		return this.includeInLayout;
	},
	isNextButtonDisplayed: function(){
		return true;
	},
	isPreviousButtonDisplayed: function(){
		return true;
	},
	getVideoListWidth: function(){
		return 'auto';
	},
	getSrcPayLoad: function(){
		return this.playlist.srcPayLoad;
	},
	getSrc: function(){
		return this.playlist.src;
	},
	// Get clip count
	getClipCount: function(){
		if( !this.$rss ){
			mw.log("Error no rss to count items" );
		}
		return this.$rss.find('item').length;
	},
	playClip: function( embedPlayer, clipIndex, callback ){
		var _this = this;
		// Update the poster
		embedPlayer.updatePosterSrc( _this.getClipPoster( clipIndex, _this.playlist.getTargetPlayerSize() ) );
		// Empty existing sources
		embedPlayer.emptySources();

		var clipSources = this.getClipSources( clipIndex );
		if( !clipSources ){
			mw.log("Error: mw.Playlist no sources found for clipIndex:" + clipIndex);
			return ;
		}
		for( var i =0; i < clipSources.length; i++ ){
			var $source = $('<source />')
			.attr( clipSources[i] );
			embedPlayer.mediaElement.tryAddSource( $source[0] ) ;
		}
		embedPlayer.changeMedia( function(){
			// restore playlist bindings and update update Ui:
			_this.playlist.updatePlayerUi( _this.clipIndex );

			// Add playlist specific bindings:
			_this.playlist.addClipBindings();

			// do the actual play:
			embedPlayer.play();

			// if there was a play callback call it
			if( callback ){
				callback();
			}
		});
	},

	drawEmbedPlayer: function( clipIndex, callback ){
		var _this = this;
		var playerSize = _this.playlist.getTargetPlayerSize();
		var $target = _this.playlist.getVideoPlayerTarget();
		var $video;
		// Check that the player is not already in the dom:
		if( $('#' + _this.playlist.getVideoPlayerId()).length ){
			mw.log( 'Error :: PlaylistHandler: drawEmbedPlayer player already in DOM? ');
			callback();
			return ;
		} else {

			// Build the video tag object:
			$video = $( '<video />' )
			.attr({
				'id' : _this.playlist.getVideoPlayerId(),
				'poster' : _this.getClipPoster( clipIndex, playerSize)
			})
			.css(
				playerSize
			);
			_this.updateVideoSources( clipIndex, $video );

			// Add the video to the target:
			$target.append( $video );

			// God knows why we have to do this. ( bug in chrome, this is not needed in firefox)
			jQuery.fn.embedPlayer = window.jQueryEmbedPlayer;

			// create the EmbedPlayer and issue the callback:
			$video.embedPlayer( callback );
		}
	},
	/**
	 * Adds the video sources for a given video tag
	 * @param clipIndex
	 * @param $video
	 * @return
	 */
	updateVideoSources: function( clipIndex, $video ){
		var _this = this;
		var clipSources = _this.getClipSources( clipIndex );
		if( clipSources ){
			// Update the sources from the playlist provider:
			for( var i =0; i < clipSources.length; i++ ){
				var $source = $('<source />')
					.attr( clipSources[i] );
				$video.append( $source );
			}
		}
	},
	updatePlayerUi: function( clipIndex ){
		var _this = this;
		var playerSize = _this.playlist.getTargetPlayerSize();
		if( this.playlist.titleHeight != 0){
			// Build and output the title
			var $title = $('<div />' )
				.addClass( 'playlist-title ui-state-default ui-widget-header ui-corner-all')
				.css( {
					'top' : '0px',
					'height' : _this.titleHeight,
					'width' : playerSize.width
				} )
				.text(
					_this.getClipTitle( clipIndex )
				);
			$( _this.target + ' .media-rss-video-player-container' ).find('.playlist-title').remove();
			$( _this.target + ' .media-rss-video-player-container' ).prepend( $title );
		}
	},
	getClipSources: function( clipIndex ){
		var _this = this;
		var $item = $( this.$rss.find('item')[ clipIndex ] );
		var clipSources = [];
		$.each( $item.find( '*' ), function( inx, mediaContent){
			if( $( mediaContent )[0].nodeName == 'media:content' ){
				clipSource = {};
				if( $( mediaContent ).attr('url' ) ){
					clipSource.src = $( mediaContent ).attr('url' );
				}
				if( $( mediaContent ).attr('type' ) ){
					clipSource.type = $( mediaContent ).attr('type' );
				}
				if( $( mediaContent ).attr( 'duration' ) ) {
					clipSource.durationHint = $( mediaContent ).attr('duration' );
				}
				clipSources.push( clipSource );
			}
		});
		return clipSources;
	},

	getCustomAttributes: function( clipIndex){
		// no custom metadata present in mrss playlist handler:
		return {};
	},
	addEmbedPlayerBindings: function( embedPlayer ){
		// no custom bindings in default mrss playlist handler
	},
	getClipList: function(){
		return this.$rss.find('item');
	},
	/**
	* Get an items poster image ( return missing thumb src if not found )
	*/
	getClipPoster: function ( clipIndex ){
		var $item = this.$rss.find('item').eq( clipIndex );
		var mediaThumb = $item.find( 'media\\:thumbnail, content\\:thumbnail, thumbnail' );
		mw.log( 'mw.PlaylistMediaRss::getClipPoster: ' + $( mediaThumb ).attr('url' ) );
		if( mediaThumb && $( mediaThumb ).attr('url' ) ){
			return $( mediaThumb ).attr('url' );
		}

		// return missing thumb url
		return mw.getConfig( 'imagesPath' ) + 'vid_default_thumb.jpg';
	},

	/**
	* Get an item title from the $rss source
	*/
	getClipTitle: function( clipIndex ){
		var $item = this.$rss.find('item').eq( clipIndex ) ;
		var mediaTitle = $item.find( 'media\\:title, content\\:title, title' );
		if( mediaTitle ){
			return $( mediaTitle ).text();
		}
		mw.log("Error could not find title for clip: " + clipIndex );
		return gM('mwe-mediarss-untitled');
	},

	/**
	 *  Get a clip description
	 */
	getClipDesc: function( clipIndex ){
		var $item = this.$rss.find('item').eq( clipIndex ) ;
		var mediaDesc = $item.find( 'media\\:description, content\\:description, description' );
		if( mediaDesc ){
			return $( mediaDesc ).text();
		}
		mw.log("Error could not find description for clip: " + clipIndex );
		return gM('mwe-mediarss-untitled');
	},

	getClipDuration: function ( clipIndex ) {
		// return the first found media duration
		var $item = this.$rss.find('item').eq( clipIndex ) ;
		var itemDuration = 0;
		$( $item.find('*')).each( function( inx, mediaContent ){
			if( $( mediaContent ).attr( 'duration' ) ) {
				itemDuration = $( mediaContent ).attr( 'duration' );
				// end for loop
				return false;
			}
		});
		return itemDuration;
	},
	getPlaylistItem: function( clipIndex ){
		var _this = this;
		var width = ( _this.playlist.itemThumbWidth )? _this.playlist.itemThumbWidth  : 70;
		var $item = $('<div />')
			.css( 'width', '100%' )
			.append(
				$('<img />')
				.attr({
					'alt' : _this.getClipTitle( clipIndex ),
					'src' : _this.getClipPoster( clipIndex )
				})
				.css({
					'width': width + 'px'
				})
				,
				$('<div />')
				.addClass('clipText')
				.append(
					$('<span />')
					.addClass('clipTitle')
					.text(
						_this.playlist.formatTitle(
								_this.getClipTitle( clipIndex )
						)
					)
					,
					$('<div />')
					.addClass('clipDuration')
					.text(
						mw.seconds2npt(
							_this.getClipDuration( clipIndex )
						)
					)
				)
				,
				$('<div />').css('clear', 'right')
				,
				$('<span />').addClass('clipDescription').text(
					_this.playlist.formatDescription(
						_this.getClipDesc( clipIndex )
					)
				)
			)
			.attr('title',_this.getClipDesc( clipIndex ) );
		return $item;
	},
	adjustTextWidthAfterDisplay: function( $clipList ){
		// no action
	}
};

} )( window.mw, jQuery );