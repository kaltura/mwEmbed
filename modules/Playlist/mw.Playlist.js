/**
* Playlist Embed. Enables the embedding of a playlist playlist using the mwEmbed player   
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
	
	// constructor
	init: function( options ) {
		
		this.src = options.src;			
		
		this.target = options.target;	
		
		this.id = ( options.id )? options.id : $j( this.target ).attr( 'id' );
		if( !this.id ){
			// Give it a random id if unset:
			this.id = 'playlist_' + Math.random();
		}
		
		// Set the sourceHandler if provided
		if( options.sourceHandler ) {
			this.sourceHandler = options.sourceHandler;
		}
		

		// Set binding to disable "waitForMeta" for playlist items ( we know the size and length )
		$j( mw ).bind( 'addElementWaitForMetaEvent', function(even, waitForMetaObject ){		
			if( $j( waitForMetaObject[ 'playerElement' ] ).hasClass( 'mwPlaylist') ){
				waitForMetaObject[ 'waitForMeta' ] = false;
			}
		});
		
		this.type = ( options.type ) ? 
			options.type: 
			mw.getConfig('Playlist.defaultType' );
		
		// Set default options or use layout 
		this.layout = ( options.layout ) ?  
			options.layout : 
			mw.getConfig( 'Playlist.layout' );
		
		// Player aspect ratio
		this.playerAspect = ( options.playerAspect ) ?  
			options.playerAspect : 
			mw.getConfig( 'Playlist.playerAspect' );
		
		// Item thumb width 	
		this.itemThumbWidth = ( options.itemThumbWidth ) ? 
			options.itemThumbWidth : 
			mw.getConfig('Playlist.itemThumbWidth');
		
		// Default title height: 
		this.titleHeight = ( options.titleHeight ) ? 
			options.titleHeight :
			mw.getConfig( 'Playlist.titleHeight' );
				
	},
	
	/**
	* Draw the media rss playlist ui
	*/
	drawUI: function(){
		var _this = this;
		// Set the target to loadingSpinner: 
		$j( this.target ).empty().loadingSpinner();
		
		this.loadPlaylistHandler( function( playlistHandler ){			
			mw.log("mw.Playlist::loaded playlist handler");
			// Check if load failed or empty playlist
			if( _this.sourceHandler.getClipList().length == 0 ){
				$j( _this.target ).empty().text( gM('mwe-playlist-empty') )
				return ;	
			}
			
			// Empty the target and setup player and playerList divs
			$j( _this.target )
			.empty()
			.append(
				$j( '<span />' )							
					.addClass( 'media-rss-video-player')
					.css({
						'float' : 'left'
					})
				,				
				$j( '<div />')		
					.addClass( 'media-rss-video-list-wrapper' )									
					.css({
						'position' : 'relative',
					    'z-index' : '1',
					    'width': '400px',
					    'height': '300px',
					    'overflow' : 'auto'
					})
					.append( 
						$j( '<div />')
						.addClass( 'media-rss-video-list' )
						.attr('id', _this.id + '_videolist')
					)
					.hide()		
			);
			
			// Add the selectable media list
			_this.addMediaList(); 
			
			// Add the player
			_this.updatePlayer( _this.clipIndex, function(){
				
				// Update the list height ( vertical layout )
				if( _this.layout == 'vertical' ){
					var targetListHeight = ( $j( _this.target ).height() - $j( _this.target + ' .media-rss-video-player' ).height() );				
					$j( _this.target + ' .media-rss-video-list-wrapper' ).css( {
						'height' : targetListHeight,
						'width' : '100%'
					} )
				} else {
					var targetListWidth = ( $j( _this.target ).width() - $j( _this.target + ' .media-rss-video-player' ).width() );
					$j( _this.target + ' .media-rss-video-list-wrapper').css( {
						'width' : targetListWidth,
						'height' : '100%'
					} )			
				}
				// show the video list and apply the swipe binding 
				$j( _this.target ).find('.media-rss-video-list-wrapper').fadeIn();				
				if( mw.isMobileSafari() ){			
					document.addEventListener('touchmove', function(e){ e.preventDefault(); });							
					var myScroll = iScroll( _this.id + '_videolist' );		
					setTimeout(function () { myScroll.refresh(); }, 0);
				}
				
			});
										
					
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
		
		// Get the target width and height: ( should be based on layout or 
		this.targetWidth = $j( this.target ).width();
		this.targetHeight = $j( this.target ).height();			
		
		/* vertical layout */
		if( _this.layout == 'vertical' ){	
			var pa = this.playerAspect.split(':');
			this.targetPlayerSize = {
				'width' : this.targetWidth + 'px',
				'height' : parseInt( ( pa[1] / pa[0]  ) * this.targetWidth )
			};
		} else {
		/* horizontal layout */
			var pa = this.playerAspect.split(':');
			this.targetPlayerSize = {
				'height' : ( this.targetHeight - this.titleHeight ) + 'px',
				'width' : parseInt( ( pa[0] / pa[1]  ) * this.targetHeight )
			};
		}		
		if( this.targetPlayerSize.width > this.targetWidth ){
			var pa = this.playerAspect.split(':');
			this.targetPlayerSize.width =  this.targetWidth;
			this.targetPlayerSize.height =  parseInt( ( pa[1] / pa[0]  ) * this.targetWidth );
		}
		return this.targetPlayerSize;
	},
	
	/**
	* update the player
	*/
	updatePlayer: function( clipIndex , callback ){
		var _this = this;					
		var playerSize = _this.getTargetPlayerSize() ;
		
		// Build and output the title
		var $title = $j('<div />' )
			.addClass( 'playlist-title')
			.css( { 
				'height' : _this.titleHeight,
				'font-size' : '85%',
				'width' :  playerSize.width
			} )
			.text( 
				_this.sourceHandler.getClipTitle( clipIndex ) 
			)
			.addClass( 'ui-state-default ui-widget-header' )
		
		$j( _this.target + ' .media-rss-video-player' ).find('.playlist-title').remove( );
		$j( _this.target + ' .media-rss-video-player' ).prepend( $title );						
		
		// Update the player list if present: 			 
		$j( _this.target + ' .clipItemBlock')
			.removeClass( 'ui-state-active' )
			.addClass( 'ui-state-default' )
			.eq( clipIndex ) 
			.addClass( 'ui-state-active' )		
		
		// Build the video tag object: 
		var $video = $j( '<video />' )
			.attr({
				'id' : 'mrss_' + this.id + '_' + clipIndex,
				'poster' : _this.sourceHandler.getClipPoster( clipIndex ) 
			})
			.addClass( 'mwPlaylist' )
			.css(
				playerSize
			)
			// Add custom attributes: 
			.attr(  _this.sourceHandler.getCustomClipAttributes( clipIndex ) );
		
		// lookup the sources from the playlist provider: 		
		this.sourceHandler.getClipSources( clipIndex, function( clipSources ){			
			if( clipSources ){
				for( var i =0; i < clipSources.length; i++ ){					
					var $source = $j('<source />')
						.attr(  clipSources[i] );															
					$video.append( $source );
				}
			}			
			_this.addVideoPlayer( $video , callback);
		});
	},
	
	addVideoPlayer: function( $video , callback){
		var _this = this;
		// If on mobile safari just swap the sources ( don't replace the video ) 
		// ( mobile safari can't javascript start the video ) 
		// see: http://developer.apple.com/iphone/search/search.php?simp=1&num=10&Search=html5+autoplay
		var addVideoPlayerToDom = true;				
		if( mw.isMobileSafari() ){
			// Check for a current video:	
			var $inDomVideo = $j( _this.target + ' .media-rss-video-player video' );			
			if( $inDomVideo.length == 0 ){
				addVideoPlayerToDom= true;
			} else {
				addVideoPlayerToDom = false;
				// Update the inDomVideo object:
				// NOTE: this hits a lot of internal stuff should !  
				// XXX Should refactor to use embedPlayer interfaces!
				var vidInterface = $j( _this.target + ' .media-rss-video-player' ).find('.mwplayer_interface div').get(0)
				vidInterface.id = $video.attr('id');
				vidInterface.pid = 'pid_' + $video.attr('id');
				vidInterface.duration = null;
				if( $video.attr('kentryid') ){						
					vidInterface.kentryid = $video.attr('kentryid');
				}
				// Update the current video target source
				$inDomVideo.attr({
					'id' : 'pid_' + $video.attr('id'),
					'src':  $video.find( 'source').attr('src') 
				});
				
			}
		} else {
			// Remove the old video player ( non-mobile safari ) 
			// xxx NOTE: need to check fullscreen support might be better to universally swap the src )
			$j( _this.target + ' .media-rss-video-player' ).remove( 'video' );
		}
		
		if( addVideoPlayerToDom ) {
			// replace the video: 
			$j( _this.target + ' .media-rss-video-player' ).append( $video );
		}
		
		// Update the video tag with the embedPlayer
		$j.embedPlayers( function(){						
			// Setup ondone playing binding to play next clip			
			$j( '#mrss_' + _this.id + '_' + _this.clipIndex ).unbind('ended').bind( 'ended', function(event, onDoneActionObject ){										
				// Play next clip
				if( _this.clipIndex + 1 < _this.sourceHandler.getClipCount() ){
					// Update the onDone action object to not run the base control done: 
					onDoneActionObject.runBaseControlDone = false;
					_this.clipIndex++;
										
					// update the player and play the next clip						
					_this.updatePlayer( _this.clipIndex, function(){						
						_this.play();
					})					
					
				} else {
					mw.log("Reached end of playlist run normal end action" );
					// Update the onDone action object to not run the base control done: 
					onDoneActionObject.runBaseControlDone = true;
				}
			})			
			// Run the callback if its set
			if( callback ){
				callback();
			}				 
		} );	
	},
	
	/** 
	* Add the media list with the selected clip highlighted
	*/
	addMediaList: function() {
		var _this = this;
		$targetItemList = $j( this.target + ' .media-rss-video-list');
		
		$j.each( this.sourceHandler.getClipList(), function( inx, clip ){
			mw.log( 'mw.Playlist::addMediaList: On clip: ' + inx);
			
			// Output each item with the current selected index:				
			$itemBlock = $j('<div />')
				.addClass( 'ui-widget-content ui-corner-all' )
				
			if( _this.clipIndex == inx ){
				$itemBlock.addClass( 'ui-state-active');
			} else {
				$itemBlock.addClass( 'ui-state-default' );
			}
			
			// Add a single row table with image, title then duration 
			$itemBlock.append( 
				$j( '<table />')
				.css( {
					'border': '0px',
					'width' : '100%' 
				})
				.append(
					$j('<tr />')							
					.append( 
						$j( '<td />')
						.css('width', _this.itemThumbWidth )
						.append( 
							$j('<img />')
							.attr({ 
								'alt' : _this.sourceHandler.getClipTitle( inx ),
								'src' : _this.sourceHandler.getClipPoster( inx )
							})
							.css( 'width', _this.itemThumbWidth ) 
						),
						$j( '<td />')
						.text( _this.sourceHandler.getClipTitle( inx ) ),
						
						$j( '<td />')
						.css( 'width', '50px') 
						.text( 
							mw.seconds2npt(
								_this.sourceHandler.getClipDuration( inx )
							)
						)
						
					)											
				) // table row
			) // table block
			.data( 'clipIndex', inx )
			.buttonHover()
			.addClass( 'clipItemBlock' 	)
			.css( {
				'cursor': 'pointer' 
			} )
			.click( function(){
				mw.log( 'clicked on: ' + $j( this ).data( 'clipIndex') ); 
				// Update _this.clipIndex
				_this.clipIndex = $j( this ).data( 'clipIndex' );
				_this.updatePlayer( _this.clipIndex, function(){
					_this.play();
				} );
			}) //close $itemBlock

			// Add the itemBlock to the targetItem list
			$targetItemList.append( 
				$itemBlock
			)
			mw.log("added item block : " + $targetItemList.children().length );
		});
	},
	
	/**
	* Start playback for current clip
	*/
	play: function(){
		// Get the player and play:
		var vid = $j('#mrss_' + this.id + '_' + this.clipIndex ).get(0);	
		//alert( 'play: '+ )
		if( vid && vid.play ){			
			vid.load();
			vid.play();
		}
	},
	
	
	/**
	 * Load the playlist driver from a source
	 */
	loadPlaylistHandler: function( callback ){
		var _this = this;		
		if( !_this.sourceHandler ){
			switch( this.type ){
				case 'application/rss+xml':			
					_this.sourceHandler = new mw.PlaylistHandlerMediaRss( this );
				break;
			}
		};		
		// load the playlist 
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
}
