/**
* Native embed library:
* 
* Enables embedPlayer support for native html5 browser playback system
*/
var nativeEmbed = {

	//Instance Name
	instanceOf:'nativeEmbed',
	
	// Counts the number of times we tried to access the video element 
	grab_try_count:0,
	
	// Flag to only load the video ( not play it ) 
	onlyLoadFlag:false,	
	
	//Callback fired once video is "loaded" 
	onLoadedCallback: null,
	
	//For retrying a player embed with a distinct url
	// NOTE: this bug workaround may no longer be applicable	
	urlAppend:'',
	
	// The previous "currentTime" to sniff seek actions 
	// NOTE the bug where onSeeked does not seem fire consistently may no longer be applicable	 
	prevCurrentTime: -1,
	
	// Store the progress event ( updated durring monitor )
	progressEventData: null,
	
	// If the media loaded event has been fired  
	mediaLoadedFlag: null,
	
	// Native player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'timeDisplay' : true,
		'volumeControl' : true,
		
		'overlays' : true,
		// if the object supports playlist functions
		'playlist_swap_loader' : true 		
	},	
	/** 
	 * updates the supported features given the "type of player" 
	 */
	updateFeatureSupport: function(){
		// iWhatever devices appear to have a broken
		// dom overlay implementation of video atm. (hopefully iphone OS 4 fixes this )
		if( mw.isMobileSafari() ) {
			this.supports.overlays = false;
		}				
	},
	
	/**
	* Return the embed code
	*/
	doEmbedHTML : function () {
		var _this = this;
		
		mw.log( "native play url:" + this.getSrc() + ' startOffset: ' + this.start_ntp + ' end: ' + this.end_ntp );
		
		// Check if using native contorls and already the "pid" is already in the DOM
		if( this.useNativeControls && $j( '#' + this.pid ).length &&
			typeof $j( '#' + this.pid ).get(0).play != 'undefined' ) {
			_this.postEmbedJS();
			return ;
		}
				
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
	 * @return {object} jQuery player code object 
	 */
	getNativePlayerHtml: function( playerAttribtues, cssSet ){
		if( !playerAttribtues) {
			playerAttribtues = {};
		}
		// Update required attributes
		if( !playerAttribtues[ 'id'] ) playerAttribtues['id'] = this.pid;		
		if( !playerAttribtues['src'] ) playerAttribtues['src'] = this.getSrc();
		
		// If autoplay pass along to attribute ( needed for iPad / iPod no js autoplay support
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
			.attr( playerAttribtues )
			.css( cssSet );
	},		
	
	/**
	* Post element javascript, binds event listeners and starts monitor 
	*/	
	postEmbedJS: function() {
		var _this = this;
		mw.log( "f:native:postEmbedJS:" );

		// Setup local pointer: 
		var vid = this.getPlayerElement();
		if ( typeof this.playerElement != 'undefined' ) {					
			// Apply media element bindings: 			
			this.applyMediaElementBindings();
			
			// Check for load flag
			if ( this.onlyLoadFlag ) {
				vid.pause();
				vid.load();
			} else {
				// Issue play request				
				vid.play();
			}			
			
			setTimeout( function() {
				_this.monitor();
			}, 100 );
			
		} else {		
			// False inserts don't seem to be as much of a problem as before: 
			mw.log( 'Could not grab vid obj trying again:' + typeof this.playerElement );
			this.grab_try_count++;
			if ( this.grab_count == 20 ) {
				mw.log( 'Could not get vid object after 20 tries re-run: getEmbedObj() ?' ) ;
			} else {
				setTimeout( function() {
					_this.postEmbedJS();
				}, 150 );
			}
			
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
		// Bind events to local js methods:			
		vid.addEventListener( 'canplaythrogh',  function() { $j( _this ).trigger('canplaythrough'); }, true);			 
		vid.addEventListener( 'loadedmetadata', function() { _this.onloadedmetadata() }, true);
		vid.addEventListener( 'progress', function( e ) { _this.onprogress( e );  }, true);
		vid.addEventListener( 'ended', function() {  _this.onended() }, true);		
		vid.addEventListener( 'seeking', function() { _this.onSeeking() }, true);
		vid.addEventListener( 'seeked', function() { _this.onSeeked() }, true);			
		
		vid.addEventListener( 'pause', function() { _this.onPaused() }, true );
		vid.addEventListener( 'play', function(){ _this.onPlay() }, true );			
		vid.addEventListener( 'volumechange', function(){ _this.onVolumeChange() } , true );
	},
	
	// basic monitor function to update buffer
	monitor: function(){
		var _this = this;
		var vid = _this.getPlayerElement();
		
		// Update the bufferedPercent
		if( vid.buffered && vid.buffered.end && vid.duration ) {		
			this.bufferedPercent = (vid.buffered.end(0) / vid.duration);
		}		
		_this.parent_monitor();
	},
	
	
	/**
	* Issue a seeking request. 
	*
	* @param {Float} percentage
	*/
	doSeek: function( percentage ) {
		mw.log( 'Native::doSeek p: ' + percentage + ' : '  + this.supportsURLTimeEncoding() + ' dur: ' + this.getDuration() + ' sts:' + this.seek_time_sec );
		this.seeking = true;
		// Run the seeking hook
		$j( this.embedPlayer ).trigger( 'onSeek' );
		
		
		// Run the onSeeking interface update
		this.ctrlBuilder.onSeek();
		
		// @@todo check if the clip is loaded here (if so we can do a local seek)
		if ( this.supportsURLTimeEncoding() ) {
			// Make sure we could not do a local seek instead:
			if ( percentage < this.bufferedPercent && this.playerElement.duration && !this.didSeekJump ) {
				mw.log( "do local seek " + percentage + ' is already buffered < ' + this.bufferedPercent );
				this.doNativeSeek( percentage );
			} else {
				// We support URLTimeEncoding call parent seek: 
				this.parent_doSeek( percentage );
			}
		} else if ( this.playerElement && this.playerElement.duration ) {
			// (could also check bufferedPercent > percentage seek (and issue oggz_chop request or not) 
			this.doNativeSeek( percentage );
		} else {
			// try to do a play then seek: 
			this.doPlayThenSeek( percentage )
		}
	},
	
	/**
	* Do a native seek by updating the currentTime
	* @param {float} percentage Percent to seek to of full time
	*/
	doNativeSeek: function( percentage ) {
		var _this = this;
		mw.log( 'native::doNativeSeek::' + percentage );
		this.seeking = true;
		this.seek_time_sec = 0;		
		this.doSeekedCallback( ( percentage * this.duration ) , function(){
			_this.seeking = false;
			_this.monitor();
		})
		
	},
	
	/**
	* Seek in a existing stream
	*
	* @param {Float} percentage Percentage of the stream to seek to between 0 and 1
	*/
	doPlayThenSeek: function( percentage ) {
		mw.log( 'native::doPlayThenSeek::' );
		var _this = this;
		this.play();
		var retryCount = 0;
		var readyForSeek = function() {
			_this.getPlayerElement();			
			// If we have duration then we are ready to do the seek
			if ( _this.playerElement && _this.playerElement.duration ) {
				_this.doNativeSeek( percentage );
			} else {
				// Try to get player for 40 seconds: 
				// (it would be nice if the onmetadata type callbacks where fired consistently)
				if ( retryCount < 800 ) {
					setTimeout( readyForSeek, 50 );
					retryCount++;
				} else {
					mw.log( 'error:doPlayThenSeek failed' );
				}
			}
		}
		readyForSeek();
	},
	
	/**
	* Set the current time with a callback
	* 
	* @param {Float} position Seconds to set the time to
	* @param {Function} callback Function called once time has been set. 
	*/
	setCurrentTime: function( position , callback ) {	
		var _this = this;
		//mw.log( 'native:setCurrentTime::: ' + position + ' :  dur: ' + _this.getDuration() );
		this.getPlayerElement();
		if ( !this.playerElement ) {
			this.load( function() {				
				_this.doSeekedCallback( position, callback );		
			} );
		} else {
			_this.doSeekedCallback( position, callback );		
		}
	},
	
	/**
	* Do the seek request with a callback
	* 
	* @param {Float} position Position in seconds
	* @param {Function} callback Function to call once seeking completes
	*/
	doSeekedCallback : function( position, callback ) {
		var _this = this;			
		this.getPlayerElement();		
		var once = function( event ) {			
			callback();
			_this.playerElement.removeEventListener( 'seeked', once, false );
		};		
		// Assume we will get to add the Listener before the seek is done
		_this.playerElement.currentTime = position;
		_this.playerElement.addEventListener( 'seeked', once, false );						
	},
	
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {		
		var _this = this;		
		// Make sure we have .vid obj
		this.getPlayerElement(); 
		
		if ( !this.playerElement ) {
			mw.log( 'could not find video embed: ' + this.id + ' stop monitor' );
			return false;
		}									
		// Return the playerElement currentTime				
		return this.playerElement.currentTime;
	},
	
	/**
	* Get video src URI
	* appends this.urlAppend for unique urls for re-requesting src urls on broken playback 
	*/
	getSrc: function() {
		var src = this.parent_getSrc();
		if (  this.urlAppend != '' )
			return src + ( ( src.indexOf( '?' ) == -1 ) ? '?':'&' ) + this.urlAppend;
		return src;
	},	
	
	/**
	* Pause the video playback
	* calls parent_pause to update the interface
	*/
	pause: function() {
		this.getPlayerElement();
		this.parent_pause(); // update interface		
		if ( this.playerElement ) {
			this.playerElement.pause();
		}
	},
	
	/**
	* Play back the video stream
	*  calls parent_play to update the interface
	*/
	play: function() {
		this.getPlayerElement();
		this.parent_play(); // update interface
		if ( this.playerElement && this.playerElement.play ) {
			this.playerElement.play();
			// re-start the monitor: 
			this.monitor();
		}
	},
	
	/**
	* Toggle the Mute
	*  calls parent_toggleMute to update the interface
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
	* @param {Float} percentage Value between 0 and 1 to set audio volume
	*/	
	setPlayerElementVolume : function( percentage ) {
		if ( this.getPlayerElement() ) {
			// Disable mute if positive volume			
			if( percentage != 0 ) {
				this.playerElement.muted = false;
			}
			this.playerElement.volume = percentage;
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
	* Handle volume change are handled via "monitor" as to not do too many binding triggers per seconds.
	*/
	onVolumeChange: function(){
		//mw.log( "native::volumechange::trigger" );
		//this.volume = this.playerElement.volume;
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
			this.doEmbedPlayer();
			this.onLoadedCallback =  callback;
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
	*  fired when "seeking" 
	*/
	onSeeking: function() {	
		mw.log( "native:onSeeking");
		// Trigger the html5 seeking event 
		//( if not already set from interface )
		if( !this.seeking ) {	
			this.seeking = true;
			// Run the seeking hook (somewhat redundant )
			$j( this ).trigger( 'onSeek' );
			
			// Run the onSeeking interface update
			this.ctrlBuilder.onSeek();			
			
			// Trigger the html5 "seeking" trigger
			mw.log("native:seeking:trigger:: " + this.seeking);			
			$j( this ).trigger( 'seeking' );
		}
	},
	
	/**
	* Local method for seeked event
	*  fired when done seeking 
	*/
	onSeeked: function() {
		mw.log("native:onSeeked");
		this.seeking = false;
		mw.log("native:onSeeked:trigger");
		// Trigger the html5 action on the parent 
		$j( this ).trigger( 'seeked' );
	},
	
	/**
	* Handle the native paused event
	*/ 
	onPaused: function(){
		mw.log("native:paused:trigger");
		this.pause();
		$j( this ).trigger( 'pause' );
	},
	
	/**
	* Handle the native play event 
	*/
	onPlay: function(){
		mw.log("native::play::trigger");
		if( !this.isPlaying () ){
			this.play();
		}
	},
	
	/**	
	* Local method for metadata ready
	*  fired when metadata becomes available
	*
	* Used to update the media duration to 
	* accurately reflect the src duration 
	*/
	onloadedmetadata: function() {
		this.getPlayerElement();
		mw.log( 'f:onloadedmetadata metadata ready Update duration:' + this.playerElement.duration + ' old dur: ' + this.getDuration() );		
		if ( ! isNaN( this.playerElement.duration ) ) {
			this.duration = this.playerElement.duration;
		}
		
		//Fire "onLoaded" flags if set
		if( typeof this.onLoadedCallback == 'function' ) {
			this.onLoadedCallback();
		}
		
		// Tigger "media loaded"
		if( ! this.mediaLoadedFlag ){
			$j( this ).trigger( 'mediaLoaded' );
			this.mediaLoadedFlag = true;
		}
	},
	
	/**
	* Local method for progress event
	*  fired as the video is downloaded / buffered
	*
	*  Used to update the bufferedPercent
	*/
	onprogress: function( e ) {			
		if( e.loaded && e.total ) {
			this.bufferedPercent =   e.loaded / e.total;				
			this.progressEventData = e.loaded;
		}		
	},
	
	/**
	* Local method for progress event
	*  fired as the video is downloaded / buffered
	*
	*  Used to update the bufferedPercent
	*/	
	onended: function() {
		var _this = this;
		//mw.log( 'native:onended:' + this.playerElement.currentTime + ' real dur:' +  this.getDuration() );							
		// run abstract player onEned if the abstract player still things we are playing
		
		if( this.isPlaying() ){
			this.onClipDone();
		}
	}
};
