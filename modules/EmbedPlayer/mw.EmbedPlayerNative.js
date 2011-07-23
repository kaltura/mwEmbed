/**
* Native embed library:
*
* Enables embedPlayer support for native html5 browser playback system
*/
mw.EmbedPlayerNative = {

	//Instance Name
	instanceOf: 'Native',

	// Flag to only load the video ( not play it )
	onlyLoadFlag:false,

	//Callback fired once video is "loaded"
	onLoadedCallback: null,

	// The previous "currentTime" to sniff seek actions
	// NOTE the bug where onSeeked does not seem fire consistently may no longer be applicable
	prevCurrentTime: -1,

	// Store the progress event ( updated during monitor )
	progressEventData: null,

	// If the media loaded event has been fired
	mediaLoadedFlag: null,

	// All the native events per:
	// http://www.w3.org/TR/html5/video.html#mediaevents
	nativeEvents : [
		'loadstart',
		'progress',
		'suspend',
		'abort',
		'error',
		'emptied',
		'stalled',
		'play',
		'pause',
		'loadedmetadata',
		'loadeddata',
		'waiting',
		'playing',
		'canplay',
		'canplaythough',
		'seeking',
		'seeked',
		'timeupdate',
		'ended',
		'ratechange',
		'durationchange',
		'volumechange'
	],

	// Native player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'timeDisplay' : true,
		'volumeControl' : true,
		'overlays' : true
	},

	/**
	 * Updates the supported features given the "type of player"
	 */
	updateFeatureSupport: function(){
		// The native controls function checks for overly support
		// especially the special case of iPad in-dom or not support
		if( this.useNativePlayerControls() ) {
			this.supports.overlays = false;
			this.supports.volumeControl = false;
		}
		// iOS  does not support volume control ( only iPad can have controls ) 
		if( mw.isIpad() ){
			this.supports.volumeControl = false;
		}
		this.parent_updateFeatureSupport();
	},

	/**
	* Return the embed code
	*/
	doEmbedHTML : function () {
		var _this = this;
		var vid = _this.getPlayerElement();
		if( vid && $j( vid ).attr('src') == this.getSrc( this.currentTime ) ){
			_this.postEmbedJS();
			return ;
		}
		mw.log( "EmbedPlayerNative::doEmbedHTML > play url:" + this.getSrc( this.currentTime  ) + ' startOffset: ' + this.start_ntp + ' end: ' + this.end_ntp );
		
		// Check if using native controls and already the "pid" is already in the DOM
		if( this.isPersistentNativePlayer() && vid ) {
			_this.postEmbedJS();
			return ;
		}
		
		// Reset some play state flags:
		_this.bufferStartFlag = false;
		_this.bufferEndFlag = false;
		
		$j( this ).html(
			_this.getNativePlayerHtml()
		);

		// Directly run postEmbedJS ( if playerElement is not available it will retry )
		_this.postEmbedJS();
	},
	
	/**
	 * Get the native player embed code.
	 *
	 * @param {object} playerAttribtues Attributes to be override in function call
	 * @return {object} cssSet css to apply to the player
	 */
	getNativePlayerHtml: function( playerAttribtues, cssSet ){
		if( !playerAttribtues) {
			playerAttribtues = {};
		}
		// Update required attributes
		if( !playerAttribtues['id'] ) playerAttribtues['id'] = this.pid;
		if( !playerAttribtues['src'] ) playerAttribtues['src'] = this.getSrc( this.currentTime);

		// If autoplay pass along to attribute
		if( this.autoplay ) {
			playerAttribtues['autoplay'] = 'true';
		}
		
		if( !cssSet ){
			cssSet = {};
		}
		// Set default width height to 100% of parent container
		if( !cssSet['width'] ) cssSet['width'] = '100%';
		if( !cssSet['height'] ) cssSet['height'] = '100%';

		// Also need to set the loop param directly for iPad / iPod
		if( this.loop ) {
			playerAttribtues['loop'] = 'true';
		}

		var tagName = ( this.isAudio() ) ? 'audio' : 'video';

		return	$j( '<' + tagName + ' />' )
			// Add the special nativeEmbedPlayer to avoid any rewrites of of this video tag.
			.addClass( 'nativeEmbedPlayerPid' )
			.attr( playerAttribtues )
			.css( cssSet );
	},

	/**
	* Post element javascript, binds event listeners and starts monitor
	*/
	postEmbedJS: function() {
		var _this = this;

		// Setup local pointer:
		var vid = this.getPlayerElement();
		if(!vid){
			return ;
		}
		// Update the player source ( if needed ) 
		if( $j( '#' + this.pid ).attr( 'src') !=  this.getSrc( this.currentTime )  ){
			$j( '#' + this.pid ).attr( 'src', this.getSrc( this.currentTime ) );
		}

		// Apply media element bindings:
		this.applyMediaElementBindings();

		// Make sure we start playing in the correct place:
		if( this.currentTime != vid.currentTime ){
			vid.currentTime = this.currentTime;
		}
		
		// Check for load flag
		if ( this.onlyLoadFlag ) {
			vid.pause();
			vid.load();
		} else {
			// Some mobile devices ( iOS need a load call before play will work )
			vid.load();
			vid.play();
		}
		
		setTimeout( function() {
			_this.monitor();
		}, 100 );
	},
	applyIntrinsicAspect: function(){
		var vid = this.getPlayerElement();
		// check if a video tag is present 
		if( !vid ){
			return this.parent_applyIntrinsicAspect();
		}

		var pHeight = $j( vid ).height();
		// Check for intrinsic width and maintain aspect ratio
		if( vid.videoWidth && vid.videoHeight ){
			var pWidth = parseInt(  vid.videoWidth / vid.videoHeight * pHeight);
			if( pWidth > this.$interface.width() ){
				pWidth = this.$interface.width();
				pHeight =  parseInt( vid.videoHeight / vid.videoWidth * pWidth );
			}
			mw.log( 'left:' + ( ( $j( this ).width() - pWidth ) * .5 ) + ' this width:' +  $j( this ).width() );
			// see if we need to leave room for controls: 
			var controlBarOffset = 0;
			if( ! this.controlBuilder.isOverlayControls() ){
				controlBarOffset = this.controlBuilder.height;
			}
			
			$j( vid ).css({
				'height' : pHeight + 'px',
				'width':  pWidth + 'px',
				'left': ( ( this.$interface.width() - pWidth ) * .5 ) + 'px',
				'top': ( ( this.$interface.height() - controlBarOffset - pHeight ) * .5 ) + 'px',
				'position' : 'absolute'
			});
		}
	},
	
	/**
	 * Apply media element bindings
	 */
	applyMediaElementBindings: function(){
		var _this = this;
		var vid = this.getPlayerElement();
		if( ! vid ){
			mw.log( " Error: applyMediaElementBindings without player elemnet");
			return ;
		}
		$j.each( _this.nativeEvents, function( inx, eventName ){
			$j( vid ).unbind( eventName + '.embedPlayerNative').bind( eventName + '.embedPlayerNative', function(){
				if( _this._propagateEvents ){
					var argArray = $j.makeArray( arguments );
					// Check if there is local handler:
					if( _this['on' + eventName ] ){
						_this['on' + eventName ].apply( _this, argArray);
					} else {
						// No local handler directly propagate the event to the abstract object:
						$j( _this ).trigger( eventName, argArray );
					}
				}
			});
		});
	},

	// basic monitor function to update buffer
	monitor: function(){
		var _this = this;
		var vid = _this.getPlayerElement();
		
		// Update duration
		if( vid && vid.duration ){
			this.duration = vid.duration; 
		}
		// Update the bufferedPercent
		if( vid && vid.buffered && vid.buffered.end && vid.duration ) {
			this.bufferedPercent = ( vid.buffered.end(0) / vid.duration );
		}
		_this.parent_monitor();
	},


	/**
	* Issue a seeking request.
	*
	* @param {Float} percent
	*/
	doSeek: function( percent ) {
		// bounds check
		if( percent < 0 )
			percent = 0;
		
		if( percent > 1 )
			percent = 1;
		
		mw.log( 'Native::doSeek p: ' + percent + ' : ' + this.supportsURLTimeEncoding() + ' dur: ' + this.getDuration() + ' sts:' + this.seek_time_sec );
		this.seeking = true;
		// Update the current time
		this.currentTime = ( percent * this.duration ) ;
		
		// trigger the seeking event: 
		mw.log('Native::doSeek:trigger');
		$j( this ).trigger( 'seeking' );
		
		// Run the onSeeking interface update
		this.controlBuilder.onSeek();

		// @@todo check if the clip is loaded here (if so we can do a local seek)
		if ( this.supportsURLTimeEncoding() ) {
			// Make sure we could not do a local seek instead:
			if ( percent < this.bufferedPercent && this.playerElement.duration && !this.didSeekJump ) {
				mw.log( "EmbedPlayer::doSeek local seek " + percent + ' is already buffered < ' + this.bufferedPercent );
				this.doNativeSeek( percent );
			} else {
				// We support URLTimeEncoding call parent seek:
				this.parent_doSeek( percent );
			}
		} else if ( this.playerElement && this.playerElement.duration ) {
			// (could also check bufferedPercent > percent seek (and issue oggz_chop request or not)
			this.doNativeSeek( percent );
		} else {
			// try to do a play then seek:
			this.doPlayThenSeek( percent );
		}
	},

	/**
	* Do a native seek by updating the currentTime
	* @param {float} percent
	* 		Percent to seek to of full time
	*/
	doNativeSeek: function( percent ) {
		var _this = this;
		mw.log( 'EmbedPlayerNative::doNativeSeek::' + percent );
		this.seeking = true;
		
		this.seek_time_sec = 0;
		this.setCurrentTime( ( percent * this.duration ) , function(){
			_this.seeking = false;
			// done seeking: 
			$j( this ).trigger( 'seeked' );
			_this.monitor();
		});
	},

	/**
	* Seek in a existing stream
	*
	* @param {Float} percent
	* 		percent of the stream to seek to between 0 and 1
	*/
	doPlayThenSeek: function( percent ) {
		mw.log( 'native::doPlayThenSeek::' + percent );
		var _this = this;
		this.play();
		var retryCount = 0;
		var readyForSeek = function() {
			_this.getPlayerElement();
			// If we have duration then we are ready to do the seek
			if ( _this.playerElement && _this.playerElement.duration ) {
				_this.doNativeSeek( percent );
			} else {
				// Try to get player for  30 seconds:
				// (it would be nice if the onmetadata type callbacks where fired consistently)
				if ( retryCount < 800 ) {
					setTimeout( readyForSeek, 50 );
					retryCount++;
				} else {
					mw.log( 'error:doPlayThenSeek failed :' + _this.playerElement.duration);
				}
			}
		};
		readyForSeek();
	},

	/**
	* Set the current time with a callback
	*
	* @param {Float} position
	* 		Seconds to set the time to
	* @param {Function} callback
	* 		Function called once time has been set.
	*/
	setCurrentTime: function( time , callback, callbackCount ) {
		var _this = this;
		if( !callbackCount )
			callbackCount = 0;
		this.getPlayerElement();
		if( _this.playerElement.readyState >= 1 ){
			if( _this.playerElement.currentTime == time ){
				callback();
				return;
			}
			var once = function( event ) {
				if( callback ){
					callback();
				}
				_this.playerElement.removeEventListener( 'seeked', once, false );
			};
			// Assume we will get to add the Listener before the seek is done
			_this.playerElement.addEventListener( 'seeked', once, false );
			try {
				_this.playerElement.currentTime = time;
			} catch (e) {
				mw.log("Could not seek to this point. Unbuffered point.");
				callback();
				return;
			}
		} else {
			if( callbackCount >= 300 ){
				mw.log("Error with seek request, media never in ready state");
				return ;
			}
			setTimeout( function(){
				_this.setCurrentTime( time, callback , callbackCount++);
			}, 10 );
		}
	},

	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		var _this = this;
		// Make sure we have .vid obj
		this.getPlayerElement();

		if ( !this.playerElement ) {
			mw.log( 'mwEmbedPlayer::getPlayerElementTime: ' + this.id + ' not in dom ( stop monitor)' );
			this.stop();
			return false;
		}
		// Return the playerElement currentTime
		return this.playerElement.currentTime;
	},
	
	// Update the poster src ( updates the native object if in dom ) 
	updatePosterSrc: function( src ){
		if( this.getPlayerElement() ){
			$j( this.getPlayerElement() ).attr('poster', src );
		}
		// Also update the embedPlayer poster 
		this.parent_updatePosterSrc( src );
	},
	
	/**
	 * switchPlaySrc switches the player source working around a few bugs in browsers
	 * 
	 * @param {string}
	 *            src Video url Source to switch to.
	 * @param {function}
	 *            switchCallback Function to call once the source has been switched
	 * @param {function}
	 *            doneCallback Function to call once the clip has completed playback
	 */
	switchPlaySrc: function( src, switchCallback, doneCallback ){
		var _this = this;
		mw.log( 'EmbedPlayerNative:: switchPlaySrc:' + src + ' native time: ' + this.getPlayerElement().currentTime );
		// Update some parent embedPlayer vars: 
		this.duration = 0;
		this.currentTime = 0;
		this.previousTime = 0;
		var vid = this.getPlayerElement();		
		if ( vid ) {
			try {
				// issue a play request on the source
				vid.play();
				setTimeout(function(){
					// Remove all native player bindings
					$j(vid).unbind();
					vid.pause();
					var orginalControlsState = vid.controls;
					// Hide controls ( to not display native play button while switching sources ) 
					vid.removeAttribute('controls');
					
					// Local scope update source and play function to work around google chrome bug
					var updateSrcAndPlay = function() {
						var vid = _this.getPlayerElement();
						if (!vid){
							mw.log( 'Error: switchPlaySrc no vid');
							return ;
						}
						vid.src = src;
						// Give iOS 50ms to figure out the src got updated ( iPad OS 4.0 )
						setTimeout(function() {
							var vid = _this.getPlayerElement();
							if (!vid){
								mw.log( 'Error: switchPlaySrc no vid');
								return ;
							}	
							vid.load();
							vid.play();
							// Wait another 100ms then bind the end event and any custom events
							// for the switchCallback
							setTimeout(function() {
								var vid = _this.getPlayerElement();			
								// restore controls 
								vid.controls = orginalControlsState;
								// add the end binding: 
								$j(vid).bind('ended', function( event ) {
									if(typeof doneCallback == 'function' ){
										doneCallback();
									}
									return false;
								});
								if (typeof switchCallback == 'function') {
									switchCallback(vid);
								}
							}, 100);
						}, 100);
					};
					if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
						// Null the src and wait 50ms ( helps unload video without crashing
						// google chrome 7.x )
						vid.src = '';
						setTimeout(updateSrcAndPlay, 100);
					} else {
						updateSrcAndPlay();
					}
				}, 100 );
			} catch (e) {
				mw.log("Error: Error in swiching source playback");
			}
		}
	},
	
	/**
	* Pause the video playback
	* calls parent_pause to update the interface
	*/
	pause: function( ) {
		this.getPlayerElement();
		this.parent_pause(); // update interface
		if ( this.playerElement ) { // update player
			if( !this.playerElement.paused ){
				this.playerElement.pause();
			}
		}
	},

	/**
	* Play back the video stream
	* calls parent_play to update the interface
	*/
	play: function( ) {
		this.getPlayerElement();
		this.parent_play(); // update interface
		if ( this.playerElement && this.playerElement.play ) {
			// issue a play request if the media is paused:
			if( this.playerElement.paused ){
				this.playerElement.play();
			}
			// re-start the monitor:
			this.monitor();
		}
	},
	/**
	 * Stop the player ( end all listeners )
	 */
	stop:function(){
		if( this.playerElement ){
			$j( this.playerElement ).unbind();
		}
		this.parent_stop();
	},

	/**
	* Toggle the Mute
	* calls parent_toggleMute to update the interface
	*/
	toggleMute: function() {
		this.parent_toggleMute();
		this.getPlayerElement();
		if ( this.playerElement )
			this.playerElement.muted = this.muted;
	},

	/**
	* Update Volume
	*
	* @param {Float} percent Value between 0 and 1 to set audio volume
	*/
	setPlayerElementVolume : function( percent ) {
		if ( this.getPlayerElement() ) {
			// Disable mute if positive volume
			if( percent != 0 ) {
				this.playerElement.muted = false;
			}
			this.playerElement.volume = percent;
		}
	},

	/**
	* get Volume
	*
	* @return {Float}
	* 	Audio volume between 0 and 1.
	*/
	getPlayerElementVolume: function() {
		if ( this.getPlayerElement() ) {
			return this.playerElement.volume;
		}
	},
	/**
	* get the native muted state
	*/
	getPlayerElementMuted: function(){
		if ( this.getPlayerElement() ) {
			return this.playerElement.muted;
		}
	},

	/**
	* Get the native media duration
	*/
	getNativeDuration: function() {
		if ( this.playerElement ) {
			return this.playerElement.duration;
		}
	},

	/**
	* load the video stream with a callback fired once the video is "loaded"
	*
	* @parma {Function} callbcak Function called once video is loaded
	*/
	load: function( callback ) {
		this.getPlayerElement();
		if ( !this.playerElement ) {
			// No vid loaded
			mw.log( 'native::load() ... doEmbed' );
			this.onlyLoadFlag = true;
			this.doEmbedHTML();
			this.onLoadedCallback = callback;
		} else {
			// Should not happen offten
			this.playerElement.load();
			if( callback)
				callback();
		}
	},

	/**
	* Get /update the playerElement value
	*/
	getPlayerElement: function () {
		this.playerElement = $j( '#' + this.pid ).get( 0 );
		return this.playerElement;
	},

	/**
 	* Bindings for the Video Element Events
 	*/

	/**
	* Local method for seeking event
	* fired when "seeking"
	*/
	onseeking: function() {
		mw.log( "native:onSeeking " + this.seeking);
		// Trigger the html5 seeking event
		//( if not already set from interface )
		if( !this.seeking ) {
			this.seeking = true;

			// Run the onSeeking interface update
			this.controlBuilder.onSeek();

			// Trigger the html5 "seeking" trigger
			mw.log("native:seeking:trigger:: " + this.seeking);
			$j( this ).trigger( 'seeking' );
		}
	},

	/**
	* Local method for seeked event
	* fired when done seeking
	*/
	onseeked: function() {
		mw.log("native:onSeeked " + this.seeking + ' ct:' + this.playerElement.currentTime );
		// sync the seek checks so that we don't re-issue the seek request
		this.previousTime = this.currentTime = this.playerElement.currentTime;
		// Trigger the html5 action on the parent
		if( this.seeking ){
			this.seeking = false;
			$j( this ).trigger( 'seeked' );
		}
		this.seeking = false;
	},

	/**
	* Handle the native paused event
	*/
	onpause: function(){
		mw.log( "EmbedPlayer:native: OnPaused:: " +  this._propagateEvents );
		if(  this._propagateEvents && ! this.paused){
			this.parent_pause();
		}
	},

	/**
	* Handle the native play event
	*/
	onplay: function(){
		mw.log("EmbedPlayer:native:: OnPlay:: propogate" +  this._propagateEvents + ' paused: ' + this.paused);
		// Update the interface ( if paused )
		if(  this._propagateEvents && this.paused ){
			this.parent_play();
		}
	},

	/**
	* Local method for metadata ready
	* fired when metadata becomes available
	*
	* Used to update the media duration to
	* accurately reflect the src duration
	*/
	onloadedmetadata: function() {
		this.getPlayerElement();
		if ( this.playerElement && ! isNaN( this.playerElement.duration ) ) {
			mw.log( 'f:onloadedmetadata metadata ready Update duration:' + this.playerElement.duration + ' old dur: ' + this.getDuration() );
			this.duration = this.playerElement.duration;
		}

		//Fire "onLoaded" flags if set
		if( typeof this.onLoadedCallback == 'function' ) {
			this.onLoadedCallback();
		}

		// Trigger "media loaded"
		if( ! this.mediaLoadedFlag ){
			$j( this ).trigger( 'mediaLoaded' );
			this.mediaLoadedFlag = true;
		}
	},

	/**
	* Local method for progress event
	* fired as the video is downloaded / buffered
	*
	* Used to update the bufferedPercent
	*
	* Note: this way of updating buffer was only supported in Firefox 3.x and
	* not supported in Firefox 4.x
	*/
	onprogress: function( event ) {
		var e = event.originalEvent;
		if( e && e.loaded && e.total ) {
			this.bufferedPercent = e.loaded / e.total;
			this.progressEventData = e.loaded;
		}
	},

	/**
	* Local method for progress event
	* fired as the video is downloaded / buffered
	*
	* Used to update the bufferedPercent
	*/
	onended: function() {
		var _this = this;
		if( this.getPlayerElement() ){
			mw.log( 'EmbedPlayer:native: onended:' + this.playerElement.currentTime + ' real dur:' + this.getDuration() + ' ended ' + this._propagateEvents );
			if( this._propagateEvents ){
				this.onClipDone();
			}
		}
	}
};
