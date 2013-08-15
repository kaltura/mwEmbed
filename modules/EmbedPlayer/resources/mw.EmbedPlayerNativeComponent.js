/**
* Native embed library:
*
* Enables embedPlayer support for native iOS/Android webView playback system
*/
// function HelloPlugin() {

// }

// HelloPlugin.prototype.createEvent = function(title,location,notes,startDate,endDate, successCallback, errorCallback) {
// 	alert('create event ins hp.js');
//     if (typeof errorCallback != "function")  {
//         console.log("HelloPlugin.createEvent failure: errorCallback parameter must be a function");
//         return
//     }
    
//     if (typeof successCallback != "function") {
//         console.log("HelloPlugin.createEvent failure: successCallback parameter must be a function");
//         return
//     }
//     parent.cordova.exec(successCallback,errorCallback,"HelloPlugin","createEvent", [title,location,notes,startDate,endDate]);
// };

// HelloPlugin.prototype.getVideoPos = function(x, y, width, height, successCallback, errorCallback) {
//     if (typeof errorCallback != "function")  {
//         console.log("HelloPlugin.getVideoPos failure: errorCallback parameter must be a function");
//         return
//     }
    
//     if (typeof successCallback != "function") {
//         console.log("HelloPlugin.getVideoPos failure: successCallback parameter must be a function");
//         return
//     }
//     parent.cordova.exec(successCallback,errorCallback,"HelloPlugin","getVideoPos", [x, y, width, height]);
// };

// HelloPlugin.install = function()
// {
//     if(!window.plugins)
//     {
//         window.plugins = {};
//     }
    
//     window.plugins.HelloPlugin = new HelloPlugin();
//     alert('hello plugin is setted');
//     alert(JSON.stringify(window.plugins.HelloPlugin));
//     return window.plugins.HelloPlugin;
// };

// if (parent)
// parent.cordova.addConstructor(HelloPlugin.install);

( function( mw, $ ) { "use strict";

mw.EmbedPlayerNativeComponent = {

	//Instance Name
	instanceOf: 'NativeComponent',

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
		'seeking',
		'seeked',
		'timeupdate',
		'ended',
		'ratechange',
		'durationchange'
	],

	// Native player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'sourceSwitch': true,
		'timeDisplay' : true
	},

		/**
	 * Apply media element bindings
	 */
	applyMediaElementBindings: function(){
            this.playerElement = $( '#' + this.pid ).get( 0 );
            this.playerElement.remove();
            return;
		var _this = this;
		mw.log("EmbedPlayerNative::MediaElementBindings");
		var vid = this.getPlayerElement();
            $( vid).remove();
            return;
		if( ! vid ){
			mw.log( " Error: applyMediaElementBindings without player elemnet");
			return ;
		}
		$.each( _this.nativeEvents, function( inx, eventName ){
			$( vid ).unbind( eventName + '.embedPlayerNative').bind( eventName + '.embedPlayerNative', function(){
				// make sure we propagating events, and the current instance is in the correct closure.
				if( _this._propagateEvents && _this.instanceOf == 'NativeComponent' ){
					var argArray = $.makeArray( arguments );
					// Check if there is local handler:
					if( _this[ '_on' + eventName ] ){
						_this[ '_on' + eventName ].apply( _this, argArray);
					} else {
						// No locasl handler directly propagate the event to the abstract object:
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
		alert(this.getSrc());
		


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
				if( ! _this.isAudio() ) {
					$( this ).find( '.playerPoster' ).remove();
				}
				// if using native controls make sure the inteface does not block the native controls interface:
				if( this.useNativePlayerControls() && $( this ).find( 'video ').length == 0 ){
					$( this ).hide();
				}
				// update the preload attribute to auto
				$( this.getPlayerElement() ).attr('preload',"auto" );
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

		// Clear the PreSeek time
		this.kPreSeekTime = null;
		
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
			//in iphone when we're back from the native payer we need to show the image with the play button
			if (mw.isIphone())
			{
				_this.updatePosterHTML();
			}
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
		if( ! this.ignoreNextNativeEvent && this._propagateEvents && this.paused && ( mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') === true ) ){
			this.parent_play();
		} else {
			// make sure the interface reflects the current play state if not calling parent_play()
			this.playInterfaceUpdate();
			this.absoluteStartPlayTime = new Date().getTime();
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
	* playback error
	*/
	_onerror: function ( event ) {
		this.triggerHelper( 'embedPlayerError' );
	},

		addPlayScreenWithNativeOffScreen: function(){
		var _this = this;
		// Hide the player offscreen:
		this.hidePlayerOffScreen();
		this.keepPlayerOffScreenFlag = true;

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
				.load(function(){
					_this.applyIntrinsicAspect();
				})
			)
		}
		$( this ).show();
	},
	
	/**
	 * Local onClip done function for native player.
	 */
	onClipDone: function(){
		var _this = this;
		// add clip done binding ( will only run on sequence complete )

		this.parent_onClipDone();
	}
	// embedPlayerHTML : function() {
	// 	var x = 20;//rect.left;
	// 	var y = 50;//rect.top;
	// 	var w = 150;//rect.right - rect.left;
	// 	var h = 150;//rect.bottom - rect.top;
	// 	parent.cordova.exec(null,null,"HelloPlugin","getVideoPos", [x, y, w, h]);
	// }
};

var x = 20;//rect.left;
		var y = 50;//rect.top;
		var w = 150;//rect.right - rect.left;
		var h = 150;//rect.bottom - rect.top;
		parent.cordova.exec(null,null,"HelloPlugin","getVideoPos", [x, y, w, h]);

} )( mediaWiki, jQuery );


