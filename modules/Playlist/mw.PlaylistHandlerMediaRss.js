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
			var xmlDoc =  $j.parseXML( this.getSrcPayLoad() );
			this.$rss = $j( xmlDoc );
			callback( _this.$rss );
			return ;
		}
		
		
		// Show an error if a cross domain request:
		if( mw.isLocalDomain( this.getSrc() ) ) {
			// Note this only works with local sources
			$j.get( mw.absoluteUrl( this.getSrc() ), function( data ){
				// jQuery already converts data into xmlDoc so the following is not needed:
				// var xmlDoc =  $j.parseXML( data );
				_this.$rss = $j( data );
				callback( _this.$rss );
			});
		} else {
			var proxyUrl = mw.getConfig( 'Mw.XmlProxyUrl' );
			if( !proxyUrl ){
				mw.log("Error: mw.KAds : missing kaltura proxy url ( can't load ad ) ");
				return ; 
			}
			$j.getJSON( proxyUrl + '?url=' + encodeURIComponent( this.getSrc() ) + '&callback=?', function( result ){
				if( result['http_code'] == 'ERROR' || result['http_code'] == 0 ){
					mw.log("Error: loading " + _this.getSrc() );
					callback(false);
					return ;
				}
				// parse the MRSS:
				var xmlDoc =  $j.parseXML( result['contents'] );
				_this.$rss = $j( xmlDoc );
				callback( _this.$rss );
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

	getClipSources: function( clipIndex, callback ){
		var _this = this;
		var $item = $j( this.$rss.find('item')[ clipIndex ] );
		var clipSources = [];
		$j.each( $item.find( '*' ), function( inx, mediaContent){
			if( $j( mediaContent ).get(0).nodeName == 'media:content' ){
				clipSource = {};
				if( $j( mediaContent ).attr('url' ) ){
					clipSource.src = $j( mediaContent ).attr('url' );
				}
				if( $j( mediaContent ).attr('type' ) ){
					clipSource.type = $j( mediaContent ).attr('type' );
				}
				if( $j( mediaContent ).attr( 'duration' ) ) {
					clipSource.durationHint = $j( mediaContent ).attr('duration' );
				}
				clipSources.push( clipSource );
			}
		});
		callback( clipSources );
	},

	getCustomAttributes: function( clipIndex){
		// no custom metadata present in mrss playlist handler:
		return {};
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
		mw.log( 'mw.PlaylistMediaRss::getClipPoster: ' + $j( mediaThumb ).attr('url' ) );
		if( mediaThumb && $j( mediaThumb ).attr('url' ) ){
			return $j( mediaThumb ).attr('url' );
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
			return $j( mediaTitle ).text();
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
			return $j( mediaDesc ).text();
		}
		mw.log("Error could not find description for clip: " + clipIndex );
		return gM('mwe-mediarss-untitled');
	},

	getClipDuration: function ( clipIndex ) {
		// return the first found media duration
		var $item = this.$rss.find('item').eq( clipIndex ) ;
		var itemDuration = 0;
		$j( $item.find('*')).each( function( inx, mediaContent ){
			if( $j( mediaContent ).attr( 'duration' ) ) {
				itemDuration = $j( mediaContent ).attr( 'duration' );
				// end for loop
				return false;
			}
		});
		return itemDuration;
	},
	getPlaylistItem: function( clipIndex ){
		var _this = this;
		var width = ( _this.playlist.itemThumbWidth )? _this.playlist.itemThumbWidth  : 70;
		var $item = $j('<div />')
			.css('width', '100%')
			.append(
				$j('<img />')
				.attr({
					'alt' : _this.getClipTitle( clipIndex ),
					'src' : _this.getClipPoster( clipIndex )
				})
				.css({
					'width': width + 'px'
				})
				,
				$j('<div />')
				.addClass('clipText')
				.append(
					$j('<span />')
					.addClass('clipTitle')
					.text( 
						_this.playlist.formatTitle( 
								_this.getClipTitle( clipIndex ) 
						)
					)
					,
					$j('<div />')
					.addClass('clipDuration')
					.text(
						mw.seconds2npt(
							_this.getClipDuration( clipIndex )
						)
					)
				)
				,
				$j('<div />').css('clear', 'right')
				,
				$j('<span />').addClass('clipDescription').text( 
					_this.playlist.formatDescription(
						_this.getClipDesc( clipIndex )
					)
				)
			)
			// poor mans tool tip: 
			.attr('title',_this.getClipDesc( clipIndex ) );
		return $item;
	}
};
