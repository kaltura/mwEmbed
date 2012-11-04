/**
* Native embed library:
*
* Enables embedPlayer support for native html5 browser playback system
*/
( function( mw, $ ) { "use strict";

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

	// A flag to keep the video tag offscreen.
	keepPlayerOffScreenFlag: null,

	// A flag to designate the first play event, as to not propagate the native event in this case
	ignoreNextNativeEvent: null,

	// A local var to store the current seek target time:
	currentSeekTargetTime: null,

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
		'canplaythrough',
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
		'sourceSwitch': true,
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
		}
		// iOS and Mobile Chrome do not support volume control
		if( !this.supportsVolumeControl() ){
			this.supports.volumeControl = false;
		}
		// Check if we already have a selected source and a player in the page,
		if( this.getPlayerElement() && this.getSrc() ){
			$( this.getPlayerElement() ).attr( 'src', this.getSrc() );
		}
		// Check if we already have a video element an apply bindings ( for native interfaces )
		if( this.getPlayerElement() ){
			this.applyMediaElementBindings();
		}

		this.parent_updateFeatureSupport();
	},
	supportsVolumeControl:function(){
		return  ! ( mw.isIpad() || mw.isMobileChrome() ||  this.useNativePlayerControls() )
	},
	/**
	 * Adds an HTML screen and moves the video tag off screen, works around some iPhone bugs
	 */
	addPlayScreenWithNativeOffScreen: function(){
		var _this = this;
		// Hide the player offscreen:
		this.hidePlayerOffScreen();
		this.keepPlayerOffScreenFlag = true;

		// Add a play button on the native player:
		this.addLargePlayBtn();

		// Add a binding to show loader once  clicked to show the loader
		// bad ui to leave the play button displayed
		this.$interface.find( '.play-btn-large' ).click( function(){
			_this.$interface.find( '.play-btn-large' ).hide();
			_this.addPlayerSpinner();
			_this.hideSpinnerOncePlaying();
		});

		// Add an image poster:
		var posterSrc = ( this.poster ) ? this.poster :
			mw.getConfig( 'EmbedPlayer.BlackPixel' );

		// Check if the poster is already present:
		if( $( this ).find( '.playerPoster' ).length ){
			$( this ).find( '.playerPoster' ).attr('src', posterSrc );
		} else {
			$( this ).append(
				$('<img />').css({
					'margin' : '0',
					'width': '100%',
					'height': '100%'
				})
				.attr( 'src', posterSrc)
				.addClass('playerPoster')
			)
		}
		$( this ).show();
	},
	/**
	* Return the embed code
	*/
	embedPlayerHTML : function () {
		var _this = this;
		var vid = _this.getPlayerElement();
		this.ignoreNextNativeEvent = true;
		// Check if we should have a play button on the native player:
		if( this.useLargePlayBtn() ){
			this.addLargePlayBtn();
		}
		// empty out any existing sources:
		if( vid ) {
			$( vid ).empty();
		}

		if( vid && $( vid ).attr('src') == this.getSrc( this.currentTime ) ){
			_this.postEmbedActions();
			return ;
		}
		mw.log( "EmbedPlayerNative::embedPlayerHTML > play url:" + this.getSrc( this.currentTime  ) + ' startOffset: ' + this.start_ntp + ' end: ' + this.end_ntp );

		// Check if using native controls and already the "pid" is already in the DOM
		if( this.isPersistentNativePlayer() && vid ) {
			_this.postEmbedActions();
			return ;
		}
		// Reset some play state flags:
		_this.bufferStartFlag = false;
		_this.bufferEndFlag = false;

		$( this ).html(
			_this.getNativePlayerHtml()
		);

		// Directly run postEmbedActions ( if playerElement is not available it will retry )
		_this.postEmbedActions();
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
		if( !playerAttribtues['id'] ){
			playerAttribtues['id'] = this.pid;
		}
		if( !playerAttribtues['src'] ){
			playerAttribtues['src'] = this.getSrc( this.currentTime);
		}

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

		var tagName = this.isAudio() ? 'audio' : 'video';

		return	$( '<' + tagName + ' />' )
			// Add the special nativeEmbedPlayer to avoid any rewrites of of this video tag.
			.addClass( 'nativeEmbedPlayerPid' )
			.attr( playerAttribtues )
			.css( cssSet )
	},
	/**
	 * returns true if device can auto play
	 */
	canAutoPlay: function(){
		return ! mw.isAndroid40() && ! mw.isMobileChrome() && ! mw.isIOS() ;
	},

	/**
	* Post element javascript, binds event listeners and starts monitor
	*/
	postEmbedActions: function() {
		var _this = this;

		// Setup local pointer:
		var vid = this.getPlayerElement();
		if( !vid ){
			return ;
		}
		// Update the player source ( if needed )
		if( $( vid).attr( 'src' ) !=  this.getSrc( this.currentTime )  ){
			$( vid ).attr( 'src', this.getSrc( this.currentTime ) );
		}
		// Update the WebKitPlaysInline value
		if( mw.getConfig( 'EmbedPlayer.WebKitPlaysInline') ){
			$( vid ).attr( 'webkit-playsinline', 1 );
		}
		// Update the EmbedPlayer.WebKitAllowAirplay option:
		if( mw.getConfig( 'EmbedPlayer.WebKitAllowAirplay' ) ){
			$( vid ).attr( 'x-webkit-airplay', "allow" );
		}
		// make sure to display native controls if enabled:
		if( this.useNativePlayerControls() ){
			$( vid ).attr( 'controls', "true" );
		}
		// make sure the video is shown:
		$( vid ).show();

		// Apply media element bindings:
		_this.applyMediaElementBindings();

		// Make sure we start playing in the correct place:
		if( this.currentTime != vid.currentTime ){
			var waitReadyStateCount = 0;
			var checkReadyState = function(){
				if( vid.readyState > 0 ){
					vid.currentTime = this.currentTime;
					return ;
				}
				if( waitReadyStateCount > 1000 ){
					mw.log("Error: EmbedPlayerNative: could not run native seek");
					return ;
				}
				waitReadyStateCount++;
				setTimeout( function() {
					checkReadyState();
				}, 10 );
			};
		}

		// Some mobile devices ( iOS need a load call before play will work )
		// other mobile devices ( android 4, break if we call load at play time )
		if ( !_this.loop && mw.isIOS() ) {
			mw.log("EmbedPlayerNative::postEmbedActions: issue .load() call");
			vid.load();
		}
	},
	/**
	 * Apply media element bindings
	 */
	applyMediaElementBindings: function(){
		var _this = this;
		mw.log("EmbedPlayerNative::MediaElementBindings");
		var vid = this.getPlayerElement();
		if( ! vid ){
			mw.log( " Error: applyMediaElementBindings without player elemnet");
			return ;
		}
		$.each( _this.nativeEvents, function( inx, eventName ){
			$( vid ).unbind( eventName + '.embedPlayerNative').bind( eventName + '.embedPlayerNative', function(){
				if( _this._propagateEvents ){
					var argArray = $.makeArray( arguments );
					// Check if there is local handler:
					if( _this[ '_on' + eventName ] ){
						_this[ '_on' + eventName ].apply( _this, argArray);
					} else {
						// No local handler directly propagate the event to the abstract object:
						$( _this ).trigger( eventName, argArray );
					}
				}
			});
		});
	},

	// basic monitor function to update buffer
	monitor: function(){
		var _this = this;
		var vid = _this.getPlayerElement();
		// Update the bufferedPercent
		if( vid && vid.buffered && vid.buffered.end && vid.duration ) {
			try{
				this.bufferedPercent = ( vid.buffered.end( vid.buffered.length-1 ) / vid.duration );
			} catch ( e ){
				// opera does not have buffered.end zero index support ?
			}
		}
		_this.parent_monitor();
	},


	/**
	* Issue a seeking request.
	*
	* @param {Float} percent
	* @param {bollean} stopAfterSeek if the player should stop after the seek
	*/
	seek: function( percent, stopAfterSeek ) {
		var _this = this;
		// bounds check
		if( percent < 0 ){
			percent = 0;
		}

		if( percent > 1 ){
			percent = 1;
		}
		mw.log( 'EmbedPlayerNative::seek p: ' + percent + ' : ' + this.supportsURLTimeEncoding() + ' dur: ' + this.getDuration() + ' sts:' + this.seekTimeSec );

		// Trigger preSeek event for plugins that want to store pre seek conditions.
		this.triggerHelper( 'preSeek', percent );

		this.seeking = true;
		// Update the current time ( local property )
		this.currentTime = ( percent * this.duration ).toFixed( 2 ) ;

		// trigger the seeking event:
		mw.log( 'EmbedPlayerNative::seek:trigger' );
		this.triggerHelper( 'seeking' );

		// Run the onSeeking interface update
		this.controlBuilder.onSeek();

		// @@todo check if the clip is loaded here (if so we can do a local seek)
		if ( this.supportsURLTimeEncoding() ) {
			// Make sure we could not do a local seek instead:
			if ( percent < this.bufferedPercent && this.playerElement.duration && !this.didSeekJump ) {
				mw.log( "EmbedPlayerNative::seek local seek " + percent + ' is already buffered < ' + this.bufferedPercent );
				this.doNativeSeek( percent );
			} else {
				// We support URLTimeEncoding call parent seek:
				this.parent_seek( percent );
			}
		} else {
			// Try to do a play then seek:
			this.doNativeSeek( percent, function(){
				if( stopAfterSeek ){
					_this.hideSpinnerAndPlayBtn();
					_this.pause();
					_this.updatePlayheadStatus();
				}
			} );
		}
	},

	/**
	* Do a native seek by updating the currentTime
	* @param {float} percent
	* 		Percent to seek to of full time
	*/
	doNativeSeek: function( percent, callback ) {
		// If player already seeking, exit
		var _this = this;
		// chrome crashes with multiple seeks:
		if( (navigator.userAgent.indexOf('Chrome') === -1) && _this.playerElement.seeking ) {
			return ;
		}

		mw.log( 'EmbedPlayerNative::doNativeSeek::' + percent );
		this.seeking = true;

		this.seekTimeSec = 0;

		// Hide iPad video off screen ( iOS shows quicktime logo during seek )
		if( mw.isIOS() ){
			this.hidePlayerOffScreen();
		}

		this.setCurrentTime( ( percent * this.duration ) , function(){
			// Update the current time ( so that there is not a monitor delay in reflecting "seeked time" )
			_this.currentTime = _this.getPlayerElement().currentTime;
			// Done seeking ( should be a fallback trigger event ) :
			if( _this.seeking ){
				_this.seeking = false;
				$( _this ).trigger( 'seeked' );
			}
			// restore iPad video position:
			_this.restorePlayerOnScreen();

			_this.monitor();
			// issue the callback:
			if( callback ){
				callback();
			}
		});
	},

	/**
	* Seek in a existing stream, we first play then seek to work around issues with iPad seeking.
	*
	* @param {Float} percent
	* 		percent of the stream to seek to between 0 and 1
	*/
	doPlayThenSeek: function( percent ) {
		mw.log( 'EmbedPlayerNative::doPlayThenSeek::' + percent + ' isPaused ' + this.paused);
		var _this = this;
		var oldPauseState = this.paused;
		this.play();
		var retryCount = 0;
		var readyForSeek = function() {
			_this.getPlayerElement();
			// If we have duration then we are ready to do the seek
			if ( _this.playerElement && _this.playerElement.duration ) {
				_this.doNativeSeek( percent, function(){
					// restore pause if paused:
					if( oldPauseState ){
						_this.pause();
					}
				} );
			} else {
				// Try to get player for  30 seconds:
				// (it would be nice if the onmetadata type callbacks where fired consistently)
				if ( retryCount < 800 ) {
					setTimeout( readyForSeek, 10 );
					retryCount++;
				} else {
					mw.log( 'EmbedPlayerNative:: Error: doPlayThenSeek failed :' + _this.playerElement.duration);
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
	setCurrentTime: function( seekTime , callback, callbackCount ) {
		var _this = this;
		if( !callbackCount ){
			callbackCount = 0;
		}
		mw.log( "EmbedPlayerNative:: setCurrentTime seekTime:" + seekTime + ' count:' + callbackCount );

		// Make sure all the timeouts don't seek to an expired target:
		$( this ).data('currentSeekTarget', seekTime );

		var vid = this.getPlayerElement();
		// add a callback handler to null out callback:
		var callbackHandler = function(){
			// reset the seeking flag:
			_this.seeking = false;
			//null the seek target:
			if( $.isFunction( callback ) ){
				callback();
				callback = null;
			}
		}

		// Check if player is ready for seek:
		if( vid.readyState < 1 ){
			// if on the first call ( and video not ready issue load call )
			if( callbackCount == 0){
				vid.load();
			}
			// Try to seek for 4 seconds:
			if( callbackCount >= 40 ){
				mw.log("Error:: EmbedPlayerNative: with seek request, media never in ready state");
				callbackHandler();
				return ;
			}
			setTimeout( function(){
				// Check that this seek did not expire:
				if( $( _this ).data('currentSeekTarget') != seekTime ){
					mw.log("EmbedPlayerNative:: expired seek target");
					return ;
				}
				_this.setCurrentTime( seekTime, callback , callbackCount+1);
			}, 100 );
			return ;
		}
		// Check if currentTime is already set to the seek target:
		if( vid.currentTime.toFixed( 2 ) == seekTime.toFixed( 2 ) ){
			mw.log("EmbedPlayerNative:: setCurrentTime: current time matches seek target: " +
					vid.currentTime.toFixed(2) + ' == ' +  seekTime.toFixed(2) );
			callbackHandler();
			return;
		}
		// setup a namespaced seek bind:
		var seekBind = 'seeked.nativeSeekBind';

		// Bind a seeked listener for the callback
		$( vid ).unbind( seekBind ).bind( seekBind, function( event ) {
			// Remove the listener:
			$( vid ).unbind( seekBind );

			// Check if seeking to zero:
			if( seekTime == 0 && vid.currentTime == 0 ){
				callbackHandler();
				return ;
			}

			// Check if we got a valid seek:
			if( vid.currentTime > 0 ){
				callbackHandler();
			} else {
				mw.log( "Error:: EmbedPlayerNative: seek callback without time updatet " + vid.currentTime );
			}
		});
		setTimeout(function(){
			// Check that this seek did not expire:
			if( $( _this ).data('currentSeekTarget') != seekTime ){
				mw.log("EmbedPlayerNative:: Expired seek target");
				return ;
			}

			if( $.isFunction( callback ) ){
				// if seek is within 5 seconds of the target assume success. ( key frame intervals can mess with seek accuracy )
				// this only runs where the seek callback failed ( i.e broken html5 seek ? )
				if( Math.abs( vid.currentTime - seekTime ) < 5 ){
					mw.log( "EmbedPlayerNative:: Video time: " + vid.currentTime + " is within 5 seconds of target" + seekTime + ", sucessfull seek");
					callbackHandler();
				} else {
					mw.log( "Error:: EmbedPlayerNative: Seek still has not made a callback after 5 seconds, retry");
					_this.setCurrentTime( seekTime, callback , callbackCount++ );
				}
			}
		}, 5000);

		// Try to update the playerElement time:
		try {
			_this.seeking = true;
			_this.currentSeekTargetTime = seekTime.toFixed( 2 );
			// use toFixed ( iOS issue with float seek times )
			vid.currentTime = _this.currentSeekTargetTime;
		} catch ( e ) {
			mw.log("Error:: EmbedPlayerNative: Could not set video tag seekTime");
			callbackHandler();
			return ;
		}

		// Check for seeking state ( some player iOS / iPad can only seek while playing )
		if(! vid.seeking ){
			mw.log( "Error:: not entering seek state, play and wait for positive time" );
			vid.play();
			setTimeout(function(){
				_this.waitForPositiveCurrentTime( function(){
					mw.log("EmbedPlayerNative:: Got possitive time:" + vid.currentTime.toFixed( 2 ) + ", trying to seek again");
					_this.setCurrentTime( seekTime , callback, callbackCount+1 );
				});
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
		}
	},
	waitForPositiveCurrentTime: function( callback ){
		var _this = this;
		var vid = this.getPlayerElement();
		this.waitForPositiveCurrentTimeCount++;
		// Wait for playback for 10 seconds
		if( vid.currentTime > 0 ){
			mw.log( 'EmbedPlayerNative:: waitForPositiveCurrentTime success' );
			callback();
		} else if( this.waitForPositiveCurrentTimeCount > 200 ){
			mw.log( "Error:: waitForPositiveCurrentTime failed to reach possitve time");
			callback();
		} else {
			setTimeout(function(){ _this.waitForPositiveCurrentTime( callback ) }, 50 )
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
			mw.log( 'EmbedPlayerNative::getPlayerElementTime: ' + this.id + ' not in dom ( stop monitor)' );
			this.stop();
			return false;
		}
		var ct =  this.playerElement.currentTime;
		// Return 0 or a positive number:
		if( ! ct || isNaN( ct ) || ct < 0 || ! isFinite( ct ) ){
			return 0;
		}
		// Return the playerElement currentTime
		return this.playerElement.currentTime;
	},

	// Update the poster src ( updates the native object if in dom )
	updatePosterSrc: function( src ){
		if( this.getPlayerElement() ){
			$( this.getPlayerElement() ).attr('poster', src );
		}
		// Also update the embedPlayer poster
		this.parent_updatePosterSrc( src );
	},
	/**
	 * Empty player sources from the active video tag element
	 */
	emptySources: function(){
		// empty player source:
		$( this.getPlayerElement() ).attr( 'src', null );
		// empty out generic sources:
		this.parent_emptySources();
	},
	/**
	 * playerSwitchSource switches the player source working around a few bugs in browsers
	 *
	 * @param {Object}
	 *            Source object to switch to.
	 * @param {function}
	 *            switchCallback Function to call once the source has been switched
	 * @param {function}
	 *            doneCallback Function to call once the clip has completed playback
	 */
	playerSwitchSource: function( source, switchCallback, doneCallback ){
		var _this = this;
		var src = source.getSrc();
		var vid = this.getPlayerElement();
		var switchBindPostfix = '.playerSwitchSource';
		this.isPauseLoading = false;
		// Make sure the switch source is different:
		if( !src || src == vid.src ){
			if( $.isFunction( switchCallback ) ){
				switchCallback( vid );
			}
			// Delay done callback to allow any non-blocking switch callback code to fully execute
			if( $.isFunction( doneCallback ) ){
				doneCallback();
			}
			return ;
		}

		// only display switch msg if actually switching:
		mw.log( 'EmbedPlayerNative:: playerSwitchSource: ' + src + ' native time: ' + vid.currentTime );
		// set the first embed play flag to true, avoid duplicate onPlay event:
		this.ignoreNextNativeEvent = true;

		// Update some parent embedPlayer vars:
		this.currentTime = 0;
		this.previousTime = 0;
		if ( vid ) {
			try {
				// Remove all old switch player bindings
				$( vid ).unbind( switchBindPostfix );

				// pause before switching source
				vid.pause();

				var originalControlsState = vid.controls;
				// Hide controls ( to not display native play button while switching sources )
				vid.removeAttribute('controls');

				// dissable seeking ( if we were in a seeking state before the switch )
				_this.seeking = false;

				// add a loading indicator:
				_this.addPlayerSpinner();
				// empty out any existing sources:
				$( vid ).empty();
				// Do the actual source switch:
				vid.src = src;
				// load the updated src
				//vid.load();

				// hide the player offscreen while we switch
				_this.hidePlayerOffScreen();

				// restore position once we have metadata
				$( vid ).bind( 'loadedmetadata' + switchBindPostfix, function(){
					$( vid ).unbind( 'loadedmetadata' + switchBindPostfix);
					mw.log("EmbedPlayerNative:: playerSwitchSource> loadedmetadata callback for:" + src );
					_this.restorePlayerOnScreen();
					// ( do not update the duration )
					// Android and iOS <5 gives bogus duration, depend on external metadata

					// keep going towards playback! if  switchCallback has not been called yet
					// we need the "playing" event to trigger the switch callback
					if ( $.isFunction( switchCallback ) ){
						vid.play();
					}
				});

				var handleSwitchCallback = function(){
					// restore video position ( now that we are playing with metadata size  )
					_this.restorePlayerOnScreen();
					// play hide loading spinner:
					_this.hideSpinnerAndPlayBtn();
					// Restore
					vid.controls = originalControlsState;
					// check if we have a switch callback and issue it now:
					if ( $.isFunction( switchCallback ) ){
						mw.log("EmbedPlayerNative:: playerSwitchSource> call switchCallback");
						// restore event propagation:
						switchCallback( vid );
						switchCallback = null;
					}
				}

				// once playing issue callbacks:
				$( vid ).bind( 'playing' + switchBindPostfix, function(){
					$( vid ).unbind( 'playing' + switchBindPostfix );
					mw.log("EmbedPlayerNative:: playerSwitchSource> playing callback: " + vid.currentTime );
					handleSwitchCallback();
				});

				// Add the end binding if we have a post event:
				if( $.isFunction( doneCallback ) ){
					$( vid ).bind( 'ended' + switchBindPostfix , function( event ) {
						// remove end binding:
						$( vid ).unbind( switchBindPostfix );
						// issue the doneCallback
						doneCallback();

						// Support loop for older iOS
						// Temporarily disabled pending more testing or refactor into a better place.
						//if ( _this.loop ) {
						//	vid.play();
						//}
						return false;
					});
				}

				// issue the play request:
				vid.play();

				// check if ready state is loading or doing anything ( iOS play restriction )
				// give iOS 5 seconds to ~start~ loading media
				setTimeout(function(){
					// Check that the player got out of readyState 0
					if( vid.readyState === 0 && $.isFunction( switchCallback ) &&  !_this.canAutoPlay() ){
						mw.log("EmbedPlayerNative:: Error: possible play without user click gesture, issue callback");
						// hand off to the swtich callback method.
						handleSwitchCallback();
						// make sure we are in a pause state ( failed to change and play media );
						_this.pause();
						// show the big play button so the user can give us a user gesture:
						_this.addLargePlayBtn();
					}
				}, 5000 );


			} catch (e) {
				mw.log("Error: EmbedPlayerNative Error in switching source playback");
			}
		}
	},
	hidePlayerOffScreen:function( vid ){
		var vid = this.getPlayerElement();
		// Move the video offscreen while it switches ( hides quicktime logo only applies to iPad )
		$( vid ).css( {
			'position' : 'absolute',
			'left': '-4048px'
		});
	},
	restorePlayerOnScreen: function( vid ){
		var vid = this.getPlayerElement();
		if( this.keepPlayerOffScreenFlag ){
			return ;
		}

		// Remove any poster div ( that would overlay the player )
		$( this ).find( '.playerPoster' ).remove();
		// Restore video pos before calling sync syze
		$( vid ).css( {
			'left': '0px'
		});
	},
	/**
	* Pause the video playback
	* calls parent_pause to update the interface
	*/
	pause: function( ) {
		this.getPlayerElement();
		this.parent_pause(); // update interface
		if ( this.playerElement ) { // update player
			this.playerElement.pause();
		}
	},

	/**
	* Play back the video stream
	* calls parent_play to update the interface
	*/
	play: function() {
		var vid = this.getPlayerElement();
		// parent.$('body').append( $('<a />').attr({ 'style': 'position: absolute; top:0;left:0;', 'target': '_blank', 'href': this.getPlayerElement().src }).text('SRC') );
		var _this = this;
		// if starting playback from stoped state and not in an ad or otherise blocked controls state:
		// restore player:
		if( this.isStopped() && this._playContorls ){
			this.restorePlayerOnScreen();
		}

		
		// Run parent play:
		if( _this.parent_play() ){
			if ( this.getPlayerElement() && this.getPlayerElement().play ) {
				mw.log( "EmbedPlayerNative:: issue native play call:" );
				// make sure the source is set:
				if( $( vid).attr( 'src' ) !=  this.getSrc()  ){
					$( vid ).attr( 'src', this.getSrc() );
				}
				// If in pauseloading state make sure the loading spinner is present:
				if( this.isPauseLoading ){
					this.hideSpinnerOncePlaying();
				}
				// make sure the video tag is displayed:
				$( this.getPlayerElement() ).show();
				// Remove any poster div ( that would overlay the player )
				$( this ).find( '.playerPoster' ).remove();
				// if using native controls make sure the inteface does not block the native controls interface:
				if( this.useNativePlayerControls() && $( this ).find( 'video ').length == 0 ){
					$( this ).hide();
				}
				// issue a play request
				this.getPlayerElement().play();
				// re-start the monitor:
				this.monitor();
			}
		} else {
			mw.log( "EmbedPlayerNative:: parent play returned false, don't issue play on native element");
		}
	},

	/**
	 * Stop the player ( end all listeners )
	 */
	stop: function(){
		var _this = this;
		if( this.playerElement && this.playerElement.currentTime){
			this.playerElement.currentTime = 0;
			this.playerElement.pause();
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
	* Load the video stream with a callback fired once the video is "loaded"
	*
	* @parma {Function} callbcak Function called once video is loaded
	*/
	load: function( callback ) {
		this.getPlayerElement();
		if ( !this.playerElement ) {
			// No vid loaded
			mw.log( 'EmbedPlayerNative::load() ... doEmbed' );
			this.onlyLoadFlag = true;
			this.embedPlayerHTML();
			this.onLoadedCallback = callback;
		} else {
			// Should not happen offten
			this.playerElement.load();
			if( callback ){
				callback();
			}
		}
	},

	/**
	* Get /update the playerElement value
	*/
	getPlayerElement: function () {
		this.playerElement = $( '#' + this.pid ).get( 0 );
		return this.playerElement;
	},

	/**
 	* Bindings for the Video Element Events
 	*/

	/**
	* Local method for seeking event
	* fired when "seeking"
	*/
	_onseeking: function() {
		mw.log( "EmbedPlayerNative::onSeeking " + this.seeking + ' new time: ' + this.getPlayerElement().currentTime );
		if( this.seeking && Math.round( this.getPlayerElement().currentTime - this.currentSeekTargetTime ) > 2 ){
			mw.log( "Error:: EmbedPlayerNative Seek time missmatch: target:" + this.getPlayerElement().currentTime +
					' actual ' + this.currentSeekTargetTime + ', note apple HLS can only seek to 10 second targets');
		}
		// Trigger the html5 seeking event
		//( if not already set from interface )
		if( !this.seeking ) {
			this.currentSeekTargetTime = this.getPlayerElement().currentTime;
			this.seeking = true;
			// Run the onSeeking interface update
			this.controlBuilder.onSeek();

			// Trigger the html5 "seeking" trigger
			mw.log("EmbedPlayerNative::seeking:trigger:: " + this.seeking);
			if( this._propagateEvents ){
				this.triggerHelper( 'seeking' );
			}
		}
	},

	/**
	* Local method for seeked event
	* fired when done seeking
	*/
	_onseeked: function() {
		mw.log("EmbedPlayerNative::onSeeked " + this.seeking + ' ct:' + this.playerElement.currentTime );
		// sync the seek checks so that we don't re-issue the seek request
		this.previousTime = this.currentTime = this.playerElement.currentTime;

		// Trigger the html5 action on the parent
		if( this.seeking ){

			// HLS safari triggers onseek when its not even close to the target time,
			// we don't want to trigger the seek event for these "fake" onseeked triggers
			if( Math.abs( this.currentSeekTargetTime - this.getPlayerElement().currentTime ) > 2 ){
				mw.log( "Error:: EmbedPlayerNative:seeked triggred with time mismatch: target:" +
						this.currentSeekTargetTime +
						' actual:' + this.getPlayerElement().currentTime );
				return ;
			}
			this.seeking = false;
			if( this._propagateEvents ){
				mw.log( "EmbedPlayerNative:: trigger: seeked" );
				this.triggerHelper( 'seeked' );
			}
		}
		this.hideSpinner();
		// update the playhead status
		this.updatePlayheadStatus();
		// if stoped add large play button:
		if( this.isStopped() ){
			this.addLargePlayBtn();
		}
		this.monitor();
	},

	/**
	* Handle the native paused event
	*/
	_onpause: function(){
		var _this = this;
		if( this.ignoreNextNativeEvent ){
			this.ignoreNextNativeEvent = false;
			return ;
		}
		var timeSincePlay =  Math.abs( this.absoluteStartPlayTime - new Date().getTime() );
		mw.log( "EmbedPlayerNative:: OnPaused:: propagate:" +  this._propagateEvents + ' time since play: ' + timeSincePlay  + ' isNative=true' );
		// Only trigger parent pause if more than MonitorRate time has gone by.
		// Some browsers trigger native pause events when they "play" or after a src switch
		if( timeSincePlay > mw.getConfig( 'EmbedPlayer.MonitorRate' ) ){
			_this.parent_pause();
		} else {
			// continue playback:
			this.getPlayerElement().play();
		}
	},

	/**
	* Handle the native play event
	*/
	_onplay: function(){
		mw.log("EmbedPlayerNative:: OnPlay:: propogate:" +  this._propagateEvents + ' paused: ' + this.paused);
		// if using native controls make sure the inteface does not block the native controls interface:
		if( this.useNativePlayerControls() && $( this ).find( 'video ').length == 0 ){
			$( this ).hide();
		}
		// Update the interface ( if paused )
		if( ! this.ignoreNextNativeEvent && this._propagateEvents && this.paused ){
			this.parent_play();
		} else {
			// make sure the interface reflects the current play state if not calling parent_play()
			this.playInterfaceUpdate();
		}
		// Set firstEmbedPlay state to false to avoid initial play invocation :
		this.ignoreNextNativeEvent = false;
	},

	/**
	* Local method for metadata ready
	* fired when metadata becomes available
	*
	* Used to update the media duration to
	* accurately reflect the src duration
	*/
	_onloadedmetadata: function() {
		this.getPlayerElement();

		// only update duration if we don't have one: ( some browsers give bad duration )
		// like Android 4 default browser
		if ( !this.duration
				&&
				this.playerElement
				&&
				!isNaN( this.playerElement.duration )
				&&
				isFinite( this.playerElement.duration)
		) {
			mw.log( 'EmbedPlayerNative :onloadedmetadata metadata ready Update duration:' + this.playerElement.duration + ' old dur: ' + this.getDuration() );
			this.setDuration( this.playerElement.duration );
		}

		// Check if in "playing" state and we are _propagateEvents events and continue to playback:
		if( !this.paused && this._propagateEvents ){
			this.getPlayerElement().play();
		}

		//Fire "onLoaded" flags if set
		if( typeof this.onLoadedCallback == 'function' ) {
			this.onLoadedCallback();
		}

		// Trigger "media loaded"
		if( ! this.mediaLoadedFlag ){
			$( this ).trigger( 'mediaLoaded' );
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
	_onprogress: function( event ) {
		var e = event.originalEvent;
		if( e && e.loaded && e.total ) {
			this.bufferedPercent = e.loaded / e.total;
			this.progressEventData = e.loaded;
		}
	},

	/**
	* Local method for end of media event
	*/
	_onended: function( event ) {
		var _this = this;
		if( this.getPlayerElement() ){
			mw.log( 'EmbedPlayer:native: onended:' + this.playerElement.currentTime + ' real dur:' + this.getDuration() + ' ended ' + this._propagateEvents );
			if( this._propagateEvents ){
				this.onClipDone();
			}
		}
	},
	/**
	 * Local onClip done function for native player.
	 */
	onClipDone: function(){
		var _this = this;
		// add clip done binding ( will only run on sequence complete )
		$(this).unbind('onEndedDone.onClipDone').bind( 'onEndedDone.onClipDone', function(){
			_this.addPlayScreenWithNativeOffScreen();
			// if not a legitmate play screen don't keep the player offscreen when playback starts:
			if( !_this.isImagePlayScreen() ){
				_this.keepPlayerOffScreenFlag =false;
			}
		});
		this.parent_onClipDone();
	}
};

} )( mediaWiki, jQuery );
