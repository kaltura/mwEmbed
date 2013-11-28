/**
 * Used to Overlay images and take over player controls
 *
 *  extends EmbedPlayerNative object image overlay support
 */

( function( mw, $ ) {"use strict";

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
		
		// A flag to set if image is loaded
		imageLoaded: false,

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
			mw.log( 'EmbedPlayerImageOverlay:: updatePlaybackInterface: ' + $(this).siblings( '.playerPoster' ).length );
			// Clear imageOverlay sibling:
			// Restore the video element on screen position:
			$( this.getPlayerElement() ).css( 'left', 0 );
			// Call normal parent updatePlaybackInterface
			this.parent_updatePlaybackInterface( callback );
		},

		/**
		 * The method called to "show the player"
		 * For image overlay we want to:
		 * Set black video urls for player source
		 * Add an image overlay
		 */
		updatePosterHTML: function(){
			var vid = this.getPlayerElement();
			$( vid ).empty();

			// embed the image:
			this.embedPlayerHTML();
		},

		removePoster: function() {},

		/**
		*  Play function starts the video playback
		*/
		play: function() {
			mw.log( 'EmbedPlayerImageOverlay::play> lastPauseTime:' + this.lastPauseTime + ' ct: ' + this.currentTime );
			// capture the user gesture ( if need )
			this.captureUserGesture();

			this.applyIntrinsicAspect();
			// Check for image duration

			// Reset playback if currentTime > duration:
			if( this.currentTime > this.getDuration() ) {
				this.currentTime = this.pauseTime = 0;
			}
			// No longer in a stopped state:
			this.stopped = false;
			// call the parent play ( to update interface and call respective triggers )
			this.parent_play();
			// Make sure we are in play interface:
			this.playInterfaceUpdate();
			// Reset clock time for load
			this.clockStartTime = new Date().getTime();
			
			// Reset buffer:
			this.bufferedPercent = 0;
			
			// Start up monitor:
			this.monitor();
		},
		getDuration: function(){
			if( this.duration ){
				return this.duration;
			}
			// update the duration if we don't have it:
			this.updateDuration();
			// make sure duration has type float:
			return this.duration;
		},
		updateDuration: function(){
			if( $( this ).data('imageDuration') ){
				this.duration = parseFloat(  $( this ).data('imageDuration') ) ;
			} else {
				this.duration = parseFloat( mw.getConfig( "EmbedPlayer.DefaultImageDuration" ) );
			}
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
		pause: function() {
			mw.log( 'EmbedPlayerImageOverlay::pause, lastPauseTime: ' + this.lastPauseTime  );
			this.lastPauseTime = this.currentTime;
			// run parent pause;
			this.parent_pause();
		},

		monitor: function(){
			if( this.duration === 0 ){
				return ;
			}
			var oldCurrentTime = this.currentTime;
			if ( this.currentTime >= this.duration ) {
				// reset playhead on complete.
				this.updatePlayHead( 0 );
				this.stopMonitor();
				$( this ).trigger( 'ended' );
			} else {
				// Run the parent monitor:
				this.parent_monitor();
			}
			if( oldCurrentTime != this.currentTime ){
				$( this ).trigger( 'timeupdate' );
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
		 * @param {Object} source
		 */
		playerSwitchSource: function(  source, switchCallback, doneCallback ){
			mw.log( "EmbedPlayerImageOverlay:: playerSwitchSource" );
			var _this = this;
			this.mediaElement.selectedSource = source;
			this.addPlayerSpinner();
			this.captureUserGesture();
			this.embedPlayerHTML( function(){
				mw.log( "EmbedPlayerImageOverlay:: playerSwitchSource, embedPlayerHTML callback" );
				_this.applyIntrinsicAspect();
				_this.play();
				if( switchCallback ){
					switchCallback( _this );
				}
				// Wait for ended event to trigger
				$( _this ).bind( 'ended.playerSwitchSource', function(){
					_this.stopMonitor();
					$( _this ).unbind( 'ended.playerSwitchSource' );
					if( doneCallback ) {
						doneCallback( _this );
					}
				});
			});
		},
		/** issue a load call on native element, so we can play it in the future */
		captureUserGesture: function(){
			// Capture the play event on the native player: ( should just be black silent sources )
			// This is needed so that if a playlist starts with image, it can continue to play the
			// subsequent video without on iOS without requiring another click.
			if( ! $( this ).data('previousInstanceOf') ){
				// Update the previousInstanceOf flag:
				$( this ).data('previousInstanceOf', this.instanceOf );
				var vid = this.getPlayerElement();
				$( vid ).attr('src', null);
				// populate the video with black video sources:
				this.triggerHelper( 'AddEmptyBlackSources', [ vid ] );
				// run load ( to capture the play event for iOS ) :
				vid.load();
			}
		},
		updatePoster: function ( posterSrc ){
			var _this = this;
			if( ! posterSrc ) {
				posterSrc = mw.getConfig( 'EmbedPlayer.BlackPixel' );
			}
			this.poster = posterSrc;
			$( this ).find('img.playerPoster')
				.attr('src', this.poster )
				.load(function(){
					_this.applyIntrinsicAspect();
				});
		},
		embedPlayerHTML: function( callback ) {
			var _this = this;
			mw.log( 'EmbedPlayerImageOverlay::embedPlayerHTML: ' + this.id );
			
			// Update the duration per stored image duration type
			this.updateDuration();
			
			var currentSoruceObj = this.mediaElement.selectedSource;
			// Rest imageLoaded flag: 
			_this.imageLoaded = false;
			
			if( !currentSoruceObj ){
				mw.log("Error:: EmbedPlayerImageOverlay:embedPlayerHTML> missing source" );
				return ;
			}
			var loadedCallback = function(){
				
				_this.applyIntrinsicAspect();
				// reset clock time for loa
				_this.clockStartTime = new Date().getTime();
				// update image loaded:
				_this.imageLoaded = true;
				_this.monitor();
				if( $.isFunction( callback ) ) {
					callback();
				}
			};
			
			var $image =
				$( '<img />' )
				.attr({
					'src' : currentSoruceObj.getSrc()
				})
				.addClass( 'playerPoster' )
				.one('load', function(){
					if( $.isFunction( loadedCallback ) ) {
						loadedCallback();
						loadedCallback = null;
					}
				})
				.each( function() {
					if( this.complete ){
						$(this).load();
					}
				});
			// move the video element off screen:
			$( this.getPlayerElement() ).css({
				'left': this.getWidth()+50,
				'position' : 'absolute'
			});

			// Add the image before the video element or before the playerInterface
			$( this ).html( $image );

		},
		/**
		* Get the embed player time
		*/
		getPlayerElementTime: function() {
			if( ! this.imageLoaded ){
				mw.log( 'image not loaded: 0' );
				this.currentTime = 0;
			} else if( this.paused ) {
				this.currentTime = this.lastPauseTime;
				mw.log( 'paused time: ' + this.currentTime );
			} else {
				this.currentTime = ( ( new Date().getTime() - this.clockStartTime ) / 1000 ) + this.lastPauseTime;
				mw.log( 'clock time: ' + this.currentTime );
			}
			return this.currentTime;
		}
	};

})( window.mw, window.jQuery );
