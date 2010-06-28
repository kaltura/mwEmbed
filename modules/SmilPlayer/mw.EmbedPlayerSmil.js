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
	 * Seeks to the requested time and issues a callback when ready / displayed
	 * @param {float} time Time in seconds to seek to
	 * @param {function} callback Function to be called once currentTime is loaded and displayed 
	 */
	setCurrentTime: function( time, callback ) {
		mw.log('EmbedPlayerSmil::setCurrentTime: ' + time );		
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
				mw.log( "setCurrentTime:: renderTime callback" );
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
		mw.log(" EmbedPlayerSmil::play " );		
		// update the interface
		this.parent_play();
		
		// Set start clock time: 		
		this.clockStartTime = new Date().getTime();		
		
		this.getSmil( function( smil ){
			this.smil = smil;
		})
		// Start up monitor:
		this.monitor();
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
		// Update the smilPlayTime
		if( !this.isPaused() ){
			this.smilPlayTime = this.smilPauseTime + ( ( new Date().getTime() - this.clockStartTime ) / 1000 );

			// xxx check buffer to see if we need to pause playback
				
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
		return $j( 'smilCanvas_' + this.id ).get(0);
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
	}
}
