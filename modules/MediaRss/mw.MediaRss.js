/**
* MediaRss Embeder. Enables the embeding of a mediaRss playlist using the mwEmbed player   
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
		
		this.updateTargetSize();
			
		this.getRss( function(){
			// Empty the target and setup player and playerList divs
			$j( _this.target )
			.empty()
			.append( 
				$j( '<div />' )							
					.addClass( 'media-rss-video-player')
					.css({
						'width' : _this.targetWidth + 'px',
						'height' : this.videoHeight + 'px';
					})
				,
				$j( '<div />')
					.addClass( 'media-rss-video-list' )
			);
			
			// Add the player
			this.updatePlayer(  _this.clipIndex  );
			
			// Add the selectable media list
			this.addMediaList(); 
		});	
	},
	
	/**
	* Update the target size of the player
	*/
	updateTargetSize: function(){
		// Get the target width and height: ( should be based on layout or 
		this.targetWidth = $j( this.target ).width();
		this.targetHeight = $j( this.target ).height();
		
		// Update the video height via the aspect ratio
		var pa = this.playerAspect.split(':');
		this.videoHeight = parseInt( ( pa[0] / pa[1] ) * this.targetWidth );
	
	}
	/**
	* addPlayer to the target output
	*/
	updatePlayer: function( clipIndex ){
			
		var $item = this.$rss.find('item')[ clipIndex ];
		
		$video = $j( '<video />');
		
		// Get the poster image:  
		if( $item.find( 'media:thumbnail' ).length && $item.find( 'media:thumbnail' ).attr('url' ) ){
			$video.attr( 'poster', $item.find( 'media:thumbnail' ).attr('url' ) );
		}
		
		// Get the sources
		$item.find( 'media:content' ).each( function( inx, mediaContent ){
			var $source = $j('<source />');
			if( $j( mediaContent ).attr('url' ) ){
				$source.attr('src', $j( mediaContent ).attr('url' ) ); 
			}
			if( $j( mediaContent ).attr('type' ) ){
				$source.attr('type', $j( mediaContent ).attr('type' ) );
			}
			// xxx could check for duration consistancy 
			if( $j( mediaContent ).attr('duration' ) ){
				$video.attr('durationHint', $j( mediaContent ).attr('duration' ) );
			}
			$video.append( $source );
		});
		
		
		$j( this.target + ' .media-rss-video-player' ).html( $video );
		
		// Get the items duration, description, 
		debugger;
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
		var _this.		
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