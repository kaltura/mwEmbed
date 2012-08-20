/**
 * Used to Overlay images and take over player controls
 *
 *  extends EmbedPlayerNative object image overlay support
 */

mw.EmbedPlayerImageOverlay = {

	instanceOf: 'ImageOverlay',

	// If the player is "ready to play"
	playerReady : true,

	// Pause time used to track player time between pauses
	lastPauseTime: 0,

	// currentTime updated via internal clockStartTime var
	currentTime:0,

	// StartOffset support seeking into the virtual player
	startOffset:0,

	// The local clock used to emulate playback time
	clockStartTime: 0,

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
			if( typeof mw.EmbedPlayerImageOverlay[ i ] != 'undefined' ){
				this['native_' + i ] = mw.EmbedPlayerNative[i];
			} else {
				this[ i ] = mw.EmbedPlayerNative[i];
			}
		}
	},

	/**
	 * When on playback method switch remove imageOverlay
	 * @param {function} callback
	 */
	updatePlaybackInterface: function( callback ){
		mw.log( 'EmbedPlayerImageOverlay:: updatePlaybackInterface remove imageOverlay: ' + $(this).siblings( '.imageOverlay' ).length );
		// Reset lastPauseTime
		this.lastPauseTime  = 0;
		// Clear imageOverlay sibling:
		$( this ).find( '.imageOverlay' ).remove();
		// Restore the video element on screen position:
		$( this.getPlayerElement() ).css('left', 0 );
		// Call normal parent updatePlaybackInterface
		this.parent_updatePlaybackInterface( callback );
	},

	/**
	 * The method called to "show the player"
	 * For image overlay we want to:
	 * 	Set black video urls for player source
	 * 	Add an image overlay
	 */
	updatePosterHTML: function(){
		var vid = this.getPlayerElement();
		$( vid ).empty()

		// Provide modules the opportunity to supply black sources ( for registering event click )
		// this is need for iPad to capture the play click to auto continue after "playing an image"
		// ( iOS requires a user gesture to initiate video playback )

		// We don't just include the sources as part of core config, since it would result in
		// a possible privacy leakage i.e hitting the kaltura servers when playing images.
		this.triggerHelper( 'AddEmptyBlackSources', [ vid ] );

		// embed the image:
		this.embedPlayerHTML();

		// add the play btn:
		this.addLargePlayBtn();
	},

	/**
	*  Play function starts the video playback
	*/
	play: function() {
		mw.log( 'EmbedPlayerImageOverlay::play> lastPauseTime:' + this.lastPauseTime + ' ct: ' + this.currentTime );
		this.applyIntrinsicAspect();
		// Check for image duration

		// Reset playback if currentTime > duration:
		if( this.currentTime > this.getDuration() ) {
			this.currentTime = this.pauseTime = 0;
		}

		// No longer in a stopped state:
		this.stopped = false;

		// Capture the play event on the native player: ( should just be black silent sources )
		// This is needed so that if a playlist starts with image, it can continue to play the
		// subsequent video without on iOS without requiring another click.
		if( ! $( this ).data('previousInstanceOf') ){
			// Update the previousInstanceOf flag:
			$( this ).data('previousInstanceOf', this.instanceOf );
			var vid = this.getPlayerElement();
			// populate the video with black video sources:
			this.triggerHelper( 'AddEmptyBlackSources', [ vid ] );
			// run play:
			vid.play();
			// inline pause
			setTimeout(function(){
				vid.pause();
			},0);
			// add another pause request after 500 ms ( iOS sometimes does not listen the first time )
			setTimeout(function(){
				vid.pause();
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) * 2 );
		}
		// call the parent play ( to update interface and call respective triggers )
		this.parent_play();
		// make sure we are in play interface:
		this.playInterfaceUpdate();

		this.clockStartTime = new Date().getTime();
		// Start up monitor:
		this.monitor();
	},
	getDuration: function(){
		if( this.duration ){
			return this.duration;
		}
		if( this.imageDuration ){
			this.duration = this.imageDuration ;
		} else {
			this.duration = mw.getConfig( "EmbedPlayer.DefaultImageDuration" );
		}
		// make sure duration has type float:
		this.duration = parseFloat( this.duration );
		return this.duration;
	},
	/**
	* Stops the playback
	*/
	stop: function() {
		this.currentTime = 0;
		this.parent_stop();
	},
	_onpause: function(){
		// catch the native event ( and do nothing )
	},
	/**
	* Preserves the pause time across for timed playback
	*/
	pause: function( ) {
		this.lastPauseTime = this.currentTime;
		mw.log( 'EmbedPlayerImageOverlay::pause, lastPauseTime: ' + this.lastPauseTime  );
		// run parent pause;
		this.parent_pause();
		this.stopMonitor();
	},

	monitor: function(){
		if( this.duration == 0 ){
			this.disablePlayControls();
			return ;
		}
		$( this ).trigger( 'timeupdate' );

		if ( this.currentTime >= this.duration ) {
			$( this ).trigger( 'ended' );
		} else {
			// Run the parent monitor:
			this.parent_monitor();
		}
	},
	/**
	* Seeks to a given percent and updates the lastPauseTime
	*
	* @param {Float} seekPercent Percentage to seek into the virtual player
	*/
	seek: function( seekPercent ) {
		this.lastPauseTime = seekPercent * this.getDuration();
		this.seeking = false;
		// start seeking:
		$( this ).trigger( 'seeking' );
		// Done seeking
		$( this ).trigger( 'seeked' );
		this.play();
	},

	/**
	* Sets the current Time
	*
	* @param {Float} perc Percentage to seek into the virtual player
	* @param {Function} callback Function called once time has been updated
	*/
	setCurrentTime: function( time, callback ) {
		this.lastPauseTime = time;
		// start seeking:
		$( this ).trigger( 'seeking' );
		// Done seeking
		$( this ).trigger( 'seeked' );
		if( callback ){
			callback();
		}
	},
	/**
	 * Switch the image playback
	 */
	playerSwitchSource: function(  source, switchCallback, doneCallback ){
		var _this = this;
		this.selectedSource = source;
		this.embedPlayerHTML();
		this.applyIntrinsicAspect();
		this.play();
		if( switchCallback ){
			switchCallback( this );
		}
		// Wait for ended event to tr
		$( this ).bind('ended.playerSwitchSource', function(){
			$( _this ).unbind('ended.playerSwitchSource');
			if( doneCallback ) {
				doneCallback( this );
			}
		})
	},
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		this.currentTime = ( ( new Date().getTime() - this.clockStartTime ) / 1000 ) + this.lastPauseTime;
		return this.currentTime;
	},
	/**
	* Get the "embed" html for the html player
	*/
	embedPlayerHTML: function() {
		var _this = this;
		// remove any old imageOverlay:
		this.$interface.find('.imageOverlay').remove();
		mw.log( 'EmbedPlayerImageOverlay :doEmbedHTML: ' + this.id );

		var currentSoruceObj = this.selectedSource;

		if( !currentSoruceObj ){
			mw.log("Error:: EmbedPlayerImageOverlay:embedPlayerHTML> missing source" );
			return ;
		}
		var $image =
			$( '<img />' )
			.css({
				'position': 'relative',
				'width': '100%',
				'height': '100%'
			})
			.attr({
				'src' : currentSoruceObj.getSrc()
			})
			.addClass( 'imageOverlay' )
			.load( function(){
				// reset clock time:
				_this.clockStartTime = new Date().getTime();
				_this.monitor();
			})

		// move the video element off screen:
		$( this.getPlayerElement() ).css({
			'left': this.getWidth()+50,
			'position' : 'absolute'
		});

		// Add the image before the video element or before the playerInterface
		$( this ).html( $image );

		this.applyIntrinsicAspect();
	},
	// wrap the parent rewize player to apply intensic apsect
	resizePlayer: function( size , animate, callback){
		this.parent_resizePlayer( size , animate, callback );
		this.applyIntrinsicAspect();
	},
	applyIntrinsicAspect: function(){
		var $this = this.$interface;
		// Check if a image thumbnail is present:
		/*if(  this.$interface && this.$interface.find('.imageOverlay').length ){
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
		}*/
	}
};