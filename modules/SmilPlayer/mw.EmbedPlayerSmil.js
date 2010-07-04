/**
* Extends EmbedPlayer to wrap smil playback in the html5 video tag abstraction. 
*/

//Get all our message text
mw.includeAllModuleMessages();

// Setup the EmbedPlayerSmil object:
mw.EmbedPlayerSmil = {

	// Instance Name
	instanceOf: 'Smil',
	
	// The jQuery target location to render smil html
	$renderTarget: null, 
	
	// Store the actual play time
	smilPlayTime: 0,
	
	// Store the pause time 
	smilPauseTime: 0,
	
	// flag to register when video is paused to fill a buffer. 
	pausedForBuffer: false,
	
	// The virtual volume for all underling clips
	volume: .75,
	
	// The max out of sync value before pausing playback 
	// set to .5 second: 
	maxSyncDelta: .5,
	
	// Player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'timeDisplay' : true,
		'volumeControl' : true,		
		'overlays' : true
	},	
	 	
	/**
	* Put the embed player into the container
	*/
	doEmbedPlayer: function() {
		var _this = this;
		mw.log("EmbedPlayerSmil::doEmbedPlayer: " + this.id ) ;
				
		this.setCurrentTime( 0, function(){
			mw.log("EmbedPlayerSmil::doEmbedPlayer:: render callback ready " );
		}); 				
	},
	
	/**
	 * set the virtual smil volume ( will key all underling assets against this volume )
	 * ( of course we don't try to normalize across clips anything like that right now )
	 */
	setPlayerElementVolume: function( percent ){
		this.volume = percent;
	},
	
	/**
	 * Seeks to the requested time and issues a callback when ready / displayed
	 * @param {float} time Time in seconds to seek to
	 * @param {function} callback Function to be called once currentTime is loaded and displayed 
	 */
	setCurrentTime: function( time, callback ) {
		//mw.log('EmbedPlayerSmil::setCurrentTime: ' + time );		
		// Set "loading" spinner here)
		$j( this ).append(
			$j( '<div />')			
			.attr('id', 'loadingSpinner_' + this.id )
			.loadingSpinner()
		);
		// Start seek
		this.controlBuilder.onSeek();
		this.smilPlayTime = time;
		var _this = this;
		this.getSmil( function( smil ){	
			smil.renderTime( time, function(){
				//mw.log( "setCurrentTime:: renderTime callback" );
				$j('#loadingSpinner_' + _this.id ).remove();
				
				_this.monitor();
				if( callback ){
					callback();
				}
			} );
		});
	},
	
	/**
	* Return the render target for output of smil html
	*/
	getRenderTarget: function(){
		if( !this.$renderTarget ){
			if( $j('#smilCanvas_' + this.id ).length === 0  ) {
				// If no render target exist create one: 
				$j( this ).html( 	
					$j( '<div />')
					.attr('id', 'smilCanvas_' + this.id )
					.css( {
						'width' : '100%',
						'height' : '100%',
						'position' : 'relative'
					})	
				);
			}
			this.$renderTarget =  $j('#smilCanvas_' + this.id );
		}
		return this.$renderTarget;		
	},
	
	play: function(){
		var _this = this;
		mw.log(" EmbedPlayerSmil::play " );		

		// Update the interface
		this.parent_play();
		
		// Make sure this.smil is ready : 
		this.getSmil( function( smil ){
			// update the smil element
			_this.smil = smil;
			
			// Start buffering the movie if not already doing so: 
			_this.smil.startBuffer();
			
			// Set start clock time: 		
			_this.clockStartTime = new Date().getTime();							
			
			// Start up monitor:
			_this.monitor();
		});
	},
	/**
	 * Maps a "load" call to startBuffer call in the smil engine 
	 */
	load: function(){
		var _this = this;
		this.play();
		this.pause();
	},
	
	stop: function(){
		this.smilPlayTime = 0;
		this.smilPauseTime = 0;
		this.setCurrentTime( 0 );		
		this.parent_stop();
	},
	
	/**
	* Preserves the pause time across for timed playback 
	*/
	pause: function() {
		mw.log( 'EmbedPlayerSmil::pause at time' +  this.smilPlayTime );
		this.smilPauseTime = this.smilPlayTime;
		
		// Issue pause to smil engine
		this.smil.pause( this.smilPlayTime  );
		
		// Update the interface
		this.parent_pause();							
	},
	
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		return this.smilPlayTime;
	},
		
	
	/**
	 * Monitor function render a given time
	 */
	monitor: function(){		
		// Get a local variable of the new target time: 		
		
		// Update the bufferedPercent		
		this.bufferedPercent = this.smil.getBufferedPercent();
		
		// Update the smilPlayTime if playing
		if( this.isPlaying() ){
		
			// Check for buffer under-run if so don't update time
			var syncDelta = this.smil.getPlaybackSyncDelta( this.smilPlayTime );
			// if not in sync update the master playhead
			if( syncDelta != 0 && 
				( syncDelta > this.maxSyncDelta 
				||
				this.pausedForBuffer
				)
			){			
				this.pausedForBuffer = true;
				this.clockStartTime += syncDelta + this.monitorRate;			
				this.parent_monitor();
				this.controlBuilder.setStatus( gM('mwe-embedplayer-buffering') );				
				return ;
			}{
				// Update playtime if not pausedForBuffer
				this.smilPlayTime =  this.smilPauseTime + ( ( new Date().getTime() - this.clockStartTime ) / 1000 );
			}
			// Done with sync delay: 
			this.pausedForBuffer = false;
				
			// Issue an animate time request with monitorDelta 
			this.smil.animateTime( this.smilPlayTime, this.monitorRate ); 
		}

		this.parent_monitor();
	},
	
	/**
	* Get the smil object. If the smil object does not exist create one with the source url:
	* @param callback 
	*/
	getSmil: function( callback ){
		if( !this.smil ) {
			// Create the Smil engine object 
			this.smil = new mw.Smil( this );
			
			// Load the smil 
			this.smil.loadFromUrl( this.getSrc(), function(){
				callback( this.smil ); 
			});			
		} else { 
			callback( this.smil );
		}
	},
	
	/**
	* Get the duration of smil document. 
	*/
	getDuration: function(){
		if( !this.duration ){
			if( this.smil ){
				this.duration = this.smil.getDuration();
			} else {
				this.duration = this.parent_getDuration();
			}
		}
		return this.duration;
	},
	
	/**
	* Return the virtual canvas element
	*/ 
	getPlayerElement: function(){
		// return the virtual canvas
		return $j( '#smilCanvas_' + this.id ).get(0);
	},
	
	/**
	* Update the thumbnail html
	*/
	updatePosterHTML: function() {
		// If we have a "poster" use that;		
		if(  this.poster ){
			this.parent_updatePosterHTML();
			return ;
		}
		// If no thumb could be found use the first frame of smil: 
		this.doEmbedPlayer(); 
	},
	
	/**
	 * Smil Engine utility functions
	 */
	
	/**
	 * Returns an array of audio urls, start and end points.
	 * 
	 * This is used to support flattening by building a set of 
	 * start and end points for a series of audio files or audio
	 * tracks from movie files. 
	 */
	getAudioTimeSet: function(){
		if(!this.smil){
			return null;
		}		
		return this.smil.getAudioTimeSet();		
	}
	
}
