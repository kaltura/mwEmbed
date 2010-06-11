/**
* MediaRss Embeder. Enables the embedding of a mediaRss playlist using the mwEmbed player   
*/ 
mw.MediaRss = function( options ){
	return this.init( options );
};

// Set the default config
mw.setDefaultConfig( {
	'MediaRss.layout' : 'vertical',
	'MediaRss.playerAspect' : '4:3'
} );


mw.MediaRss.prototype = {
	// Stores the current clip index to be played 
	clipIndex: 0,
	
	// Stores the list of clips
	clipList : [],
	
	// Stores the cached player size: 
	targetPlayerSize: null,
	
	init: function( options ) {
		this.src = options.src;			
		this.target = options.target;		
		// Set default options or use MediaRss 
		this.layout = ( options.layout ) ?  options.layout : mw.getConfig( 'MediaRss.layout' );
		this.playerAspect = ( options.playerAspect ) ?  options.playerAspect : mw.getConfig( 'MediaRss.playerAspect' );
				
	},
	
	/**
	* Draw the media rss playlist ui
	*/
	drawUI: function(){
		var _this = this;
		// Set the target to loadingSpinner: 
		$j( this.target ).loadingSpinner();
		
		this.getRss( function(){			
			// Empty the target and setup player and playerList divs
			$j( _this.target )
			.empty()
			.append(
				$j( '<div />' )							
					.addClass( 'media-rss-video-player')
					.css( _this.getTargetPlayerSize() )
				,
				$j( '<div />')
					.addClass( 'media-rss-video-list' )
			);
			
			// Add the player
			_this.updatePlayer(  _this.clipIndex  );
			
			// Add the selectable media list
			_this.addMediaList(); 
		});	
	},
	
	/**
	* Update the target size of the player
	*/
	getTargetPlayerSize: function( ){		
		if( this.targetPlayerSize ){
			return this.targetPlayerSize;
		} 
		// Get the target width and height: ( should be based on layout or 
		this.targetWidth = $j( this.target ).width();
		this.targetHeight = $j( this.target ).height();
		
		
		/* vertical layout */				
		
		var pa = this.playerAspect.split(':');
		this.targetPlayerSize = {
			'width' : this.targetWidth + 'px',
			'height' : parseInt( ( pa[1] / pa[0]  ) * this.targetWidth )
		};
		
		return this.targetPlayerSize;	
	},
	
	/**
	* addPlayer to the target output
	*/
	updatePlayer: function( clipIndex ){
		var _this = this;
		var $item = $j( this.$rss.find('item')[ clipIndex ] );
		
		var $video = $j( '<video />')
			.css(
				_this.getTargetPlayerSize() 
			);
		
		// Get the poster image:  
		if( $item.find( 'media:thumbnail' ).length && $item.find( 'media:thumbnail' ).attr('url' ) ){
			$video.attr( 'poster', $item.find( 'media:thumbnail' ).attr('url' ) );
		}
		mw.log( 'total media content: ' + this.$rss.find( 'media:content' ).length );
		mw.log( 'UpdatePlayer:: Item media content:  ' + $item.find( 'media:content' ).length );
		// Get the sources
		$item.find( 'media:content' ).each( function( inx, mediaContent ){
			mw.log( 'Update source:' + $j( mediaContent ).attr('url' ) );
			var $source = $j('<source />');
			if( $j( mediaContent ).attr('url' ) ){
				$source.attr('src', $j( mediaContent ).attr('url' ) ); 
			}
			if( $j( mediaContent ).attr('type' ) ){
				$source.attr('type', $j( mediaContent ).attr('type' ) );
			}
			// xxx could check for duration consistency between media and tag. 
			if( $j( mediaContent ).attr('duration' ) ){
				$video.attr('durationHint', $j( mediaContent ).attr('duration' ) );
			}
			$video.append( $source );
		});
		
		// Get the items duration, description, 
		$j( this.target + ' .media-rss-video-player' ).html( $video );					
	},
	
	/** 
	* Get an item title from the $rss source
	*/
	getItemTitle: function( clipIndex ){
		if( this.$rss.find('item')[ clipIndex ] && this.$rss.find('item')[ clipIndex ].find( 'media:title' )){
			return this.$rss.find('item')[ clipIndex ].find( 'media:title' ).text();
		}
		mw.log("Error could not find title for clip: " + clipIndex );
		return false;
	},
	
	
	getRss: function( callback ){
		var _this = this;		
		if( _this.$rss ){
			callback( _this.$rss );
			return ;
		};
				
		// Get the source content and put it into the $rss object 		
		$j.get( mw.absoluteUrl( this.src ), function( data ){
			// Store the local representation of the xml:
			_this.$rss = $j( data );
			callback( _this.$rss ); 
		});
	}	
}