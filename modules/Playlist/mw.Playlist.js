/**
* Playlist Embed. Enables the embedding of a playlist playlist using the mwEmbed player   
*/ 
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
		
		this.id = ( options.id )? options.id : $j( this.target ).attr('id');
		if( !this.id ){
			// Give it a random id if unset:
			this.id = 'playlist_' + Math.random();
		}
		
		// Set the sourceHandler if proivded
		if( options.sourceHandler )
			this.sourceHandler = options.sourceHandler;
		
		
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
		$j( this.target ).loadingSpinner();
		
		this.getSourceHandler( function( sourceHandler ){					
			// Empty the target and setup player and playerList divs
			$j( _this.target )
			.empty()
			.append(
				$j( '<span />' )							
					.addClass( 'media-rss-video-player')
					.css( {
						'float' : 'left'
					})
				,
				$j( '<div />')					
					.addClass( 'media-rss-video-list' )					
					.css({ 
						'float' : 'right',
						'overflow-y' : 'auto' ,
						'overflow-x' : 'hidden'
					})			
					.hide()		
			);
			
			// Add the selectable media list
			_this.addMediaList(); 
			
			// Add the player
			_this.updatePlayer( _this.clipIndex, function(){
				// Update the list height ( vertical layout )
				if( _this.layout == 'vertical' ){
					var targetListHeight = ( $j( _this.target ).height() - $j( _this.target + ' .media-rss-video-player' ).height() );
					mw.log( ' targetHeight: ' + $j( _this.target ).height()  + ' - ' + $j( _this.target + ' .media-rss-video-player' ).height() + ' = ' + targetListHeight );
					$j( _this.target + ' .media-rss-video-list').css( {
						'height' : targetListHeight,
						'width' : '100%'
					} ).fadeIn();		
				} else {
					var targetListWidth = ( $j( _this.target ).width() - $j( _this.target + ' .media-rss-video-player' ).width() );
					mw.log( 'targetListWidth:' + $j( _this.target ).width() + ' - pw: ' +   $j( _this.target + ' .media-rss-video-player' ).width()  + ' = '  + targetListWidth );
					$j( _this.target + ' .media-rss-video-list').css( {
						'width' : targetListWidth,
						'height' : '100%'
					} )
					.fadeIn();					
				}					
			}  );
										
					
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
		
		return this.targetPlayerSize;	
	},
	
	/**
	* addPlayer to the target output
	*/
	updatePlayer: function( clipIndex , callback ){
		var _this = this;
					
		var playerSize = _this.getTargetPlayerSize() ;
		
		// xxx some enhacements to embedPlayer could support storing data with a video embed
		// so we don't have to overload the id
		var $video = $j( '<video />' )
			.attr({
				'id' : 'mrss_' + this.id + '_' + clipIndex,
				'poster' : _this.sourceHandler.getClipPoster( clipIndex ) 
			})
			.css(
				playerSize
			);
		
		// Get the sources ( jquery does not support namespaces so use native selector )
		// xxx Chrome chokes on a normal find so we can't use: 
		// $item.find( 'media\\:content' ).each( function( inx, mediaContent ){
		var clipSources = this.sourceHandler.getClipSources( clipIndex );
		if( clipSources ){
			for( var i =0; i < clipSources.length; i++ ){
				var $source = $j('<source />')
					.attr(  clipSources[i] );															
				$video.append( $source );
			}
		}
				
		// Build the title
		var $title = $j('<div />' )
			.css( { 
				'height' : _this.titleHeight,
				'font-size' : '85%',
				'width' :  playerSize.width
			} )
			.text( 
				_this.sourceHandler.getClipTitle( clipIndex ) 
			)
			.addClass( 'ui-state-default ui-widget-header' )
			
			
		$j( this.target + ' .media-rss-video-player' )
			.empty()
			.append(
				$title, 		
				$video
			);
		
		// Update the video tag with the embedPlayer
		$j.embedPlayers( function(){			
			
			// Setup ondone playing binding to play next clip			
			$j( '#mrss_' + _this.id + '_' + _this.clipIndex ).bind( 'ended', function(event, onDoneActionObject ){										
				// Play next clip
				if( _this.clipIndex + 1 < _this.sourceHandler.getClipCount() ){
					// Update the onDone action object to not run the base control done: 
					onDoneActionObject.runBaseControlDone = false;
					_this.clipIndex++;
										
					// ( if on ipad update the src and don't refresh )
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
		
		// Update the player list if present: 
		 
		$j( _this.target + ' .clipItemBlock')
			.removeClass( 'ui-state-active' )
			.addClass( 'ui-state-default' )
			.eq( clipIndex ) 
			.addClass( 'ui-state-active' )
		
	},
	
	/** 
	* Add the media list with the selected clip highlighted
	*/
	addMediaList: function() {
		var _this = this;
		$targetItemList = $j( this.target + ' .media-rss-video-list');

		$j.each( this.sourceHandler.getClipList(), function( inx, clip ){
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
						.text( _this.sourceHandler.getClipDuration( inx ) )
						
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
		});
	},
	
	/**
	* Start playback for current clip
	*/
	play: function(){
		// Get the player and play: 
		$j( this.target + ' .media-rss-video-player .interface_wrap').children().get(0).play();
	},
	
	
	/**
	 * Load the playlist driver from a source
	 */
	getSourceHandler: function( callback ){
		var _this = this;		
		if( _this.sourceHandler ){
			callback( _this.sourceHandler );
			return ;
		};
		switch( this.type ){
			case 'application/rss+xml':			
				_this.sourceHandler = new mw.PlaylistHandlerMediaRss( this );
			break;
		}
		// load playlist
		_this.sourceHandler.loadFromSrc( function(){			
			callback( _this.sourceHandler );
		});
	}, 
	
	setSourceHandler: function ( sourceHandler ){
		this.sourceHandler = sourceHandler;
	}
}
