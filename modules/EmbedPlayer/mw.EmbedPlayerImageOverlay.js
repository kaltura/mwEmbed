/**
 * Used to Overlay images and take over player controls
 * 
 *  extends EmbedPlayerNative with image overlay support
 */

mw.EmbedPlayerImageOverlay = {
	
	instanceOf: 'ImageOverlay',
		
	// If the player is "ready to play"
	playerReady : true,
	
	// Pause time used to track player time between pauses
	pauseTime:0,
	
	// currentTime updated via internal clockStartTime var
	currentTime:0,
	
	// StartOffset support seeking into the virtual player
	startOffset:0,
	
	// The local clock used to emulate playback time
	clockStartTime: 0,
	
	/**
	 * Extends nativePlayer methods to support image playback 
	 * @param {function} callback
	 */
	updatePlaybackInterface: function( callback ){
		mw.log( 'EmbedPlayerImageOverlay:: updatePlaybackInterface remove imageOverlay: ' + $(this).siblings( '.imageOverlay' ).length );
		// Clear imageOverlay sibling:
		$( this ).siblings( '.imageOverlay' ).remove();
		// Call normal parent updatePlaybackInterface
		this.parent_updatePlaybackInterface( callback );
	},
	
	/**
	 * Build the player interface:
	 */
	init: function(){
		// Check if features are already updated:
		if( this['native_instaceOf'] == 'Native' ){
			return ;
		}
		// inherit mw.EmbedPlayerNative ( 
		for( var i in mw.EmbedPlayerNative ){
			if( mw.EmbedPlayerImageOverlay[ i ] ){
				this['native_' + i ] = mw.EmbedPlayerNative[i];
			} else { 
				this[ i ] = mw.EmbedPlayerNative[i];
			}
		}		
	},
	
	/**
	*  Play function starts the video playback
	*/
	play: function() {
		mw.log( 'EmbedPlayerImageOverlay::play' );
		this.applyIntrinsicAspect();
		
		// Capture the play event on the native player: ( should just be black silent sources ) 
		var vid = this.getPlayerElement();
		vid.play();
		setTimeout(function(){
			
		}, mw.getConfig( ));
		
		// call the parent play ( to update interface and call respective triggers )
		this.parent_play();
		this.clockStartTime = new Date().getTime();
		// Start up monitor:
		this.monitor();
	},
	/**
	* Stops the playback
	*/
	stop: function() {
		this.currentTime = 0;
		this.pause();		
	},
	
	/**
	* Preserves the pause time across for timed playback 
	*/
	pause:function() {
		this.pauseTime = this.currentTime;
		mw.log( 'EmbedPlayerImageOverlay::pause, pauseTime: ' + this.pauseTime );
		// Stop monitor: 
		window.clearInterval( this.monitorTimerId );
	},
	
	monitor: function(){
		if( this.duration == 0 ){
			this.disablePlayControls();
			return ;
		}
		this_parent.monitor();
	},
	/**
	* Seeks to a given percent and updates the pauseTime
	*
	* @param {Float} seekPercent Percentage to seek into the virtual player
	*/
	doSeek:function( seekPercent ) {
		this.pauseTime = seekPercent * this.getDuration();
		this.play();
	},
	
	/** 
	* Sets the current Time 
	*
	* @param {Float} perc Percentage to seek into the virtual player
	* @param {Function} callback Function called once time has been updated
	*/
	setCurrentTime:function( time, callback ) {
		this.pauseTime = time;
		if( callback ){
			callback();
		}
	},
	
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		var currentTime = ( ( new Date().getTime() - this.clockStartTime ) / 1000 ) + this.pauseTime;		
		return currentTime;
	},
	/**
	* Get the "embed" html for the html player
	*/
	embedPlayerHTML: function() {
		mw.log( 'EmbedPlayerImageOverlay :doEmbedHTML: ' + this.id );
		// set up the css for our parent div:		 
		$( this ).css( {
			'overflow':"hidden"
		} );
		
		// Put the image stuff on top 
		$( this ).before( 
			$( '<img />' )
			.css({
				'position': 'relative',
				'width': '100%',
				'height': '100%'
			})
			.attr({
				'src' : this.poster
			})
			.addClass( 'imageOverlay' )		
		);
	},
	applyIntrinsicAspect: function(){
		var $this = $( this );
		// Check if a image thumbnail is present:
		if(  this.$interface && this.$interface.find('.imageOverlay').length ){
			var img = this.$interface.find('.imageOverlay')[0];
			var pHeight = $this.height();
			// Check for intrinsic width and maintain aspect ratio
			if( img.naturalWidth && img.naturalHeight ){
				var pWidth = parseInt(  img.naturalWidth / img.naturalHeight * pHeight);
				if( pWidth > $this.width() ){
					pWidth = $this.width();
					pHeight =  parseInt( img.naturalHeight / img.naturalWidth * pWidth );
				}
				$( img ).css({
					'height' : pHeight + 'px',
					'width':  pWidth + 'px',
					'left': ( ( $this.width() - pWidth ) * .5 ) + 'px',
					'top': ( ( $this.height() - pHeight ) * .5 ) + 'px',
					'position' : 'absolute'
				});
			}
		}
	},
};