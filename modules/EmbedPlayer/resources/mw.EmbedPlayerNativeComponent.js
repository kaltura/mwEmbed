/**
* Native embed library:
*
* Enables embedPlayer support for native iOS/Android webView playback system
*/

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
//    (play, pause, seek, current_time, duration, fullscreen(enter,exit))  -methods
//    (loaded,playing,puesed,ended,buffreing,progress,error) - _on

        'stop',
		'play',
		'pause',
//		'waiting',
		'playing'
//		'canplay',
//		'seeking',
//		'seeked',
//		'ended',
	],

	// Native player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'sourceSwitch': true,
		'timeDisplay' : true
	},

    embedPlayerHTML : function() {
        mw.log( "NativeComponent:: embedPlayerHTML" );
        // remove any existing pid ( if present )
        $( '#' + this.pid ).remove();

        var orgJsReadyCallback = window.jsCallbackReady;
        window.jsCallbackReady = function( playerId ){
            _this.postEmbedActions();
            window.jsCallbackReady = orgJsReadyCallback;
        };

        var divElement = document.createElement("div");
        divElement.setAttribute('id', 'proxy');
        divElement.innerHTML = "Just Div Test";
        document.body.appendChild(divElement);

        this.proxyElement = divElement;

        if(parent.cordova.videoPlayer){
            parent.cordova.videoPlayer.registePlayer(this.getPlayerElement());
        }

        this.applyMediaElementBindings();
        this.setPlayerSource( this.getSrc() );
    },

	/**
	 * Apply media element bindings
	 */
	applyMediaElementBindings: function() {
		var _this = this;
		mw.log("EmbedPlayerNative::MediaElementBindings");

		$.each( _this.nativeEvents, function( inx, eventName ){
			$( _this.getPlayerElement() ).unbind( eventName ).bind( eventName , function(){
				// make sure we propagating events, and the current instance is in the correct closure.
				if( _this._propagateEvents && _this.instanceOf == 'NativeComponent' ){
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

    /**
     * Get /update the playerElement value
     */
    getPlayerElement: function () {
        return this.proxyElement;
    },

    /**
     * Stop the player ( end all listeners )
     */
    stop: function(){
        this.parent_stop();
        if( this.getPlayerElement() ) {// && this.playerElement.currentTime){
//            this.playerElement.currentTime = 0;
            this.getPlayerElement().stop( [] );
        }
    },

    /**
     * Play back the video stream
     * calls parent_play to update the interface
     */
    play: function() {

//        if(this.firstPlay){
            this.drawVideoNativeComponent();
//        }
//        this.getPlayerElement().play( [] );

//        var vid = this.getPlayerElement();
//        // parent.$('body').append( $('<a />').attr({ 'style': 'position: absolute; top:0;left:0;', 'target': '_blank', 'href': this.getPlayerElement().src }).text('SRC') );
//        var _this = this;
//        // if starting playback from stoped state and not in an ad or otherise blocked controls state:
//        // restore player:
//        if( this.isStopped() && this._playContorls ){
//            this.restorePlayerOnScreen();
//        }
//
//        // Run parent play:
//        if( _this.parent_play() ){
//            if ( this.getPlayerElement() && this.getPlayerElement().play ) {
//                mw.log( "EmbedPlayerNative:: issue native play call:" );
//                // make sure the source is set:
//                if( $( vid).attr( 'src' ) !=  this.getSrc()  ){
//                    $( vid ).attr( 'src', this.getSrc() );
//                }
//                // If in pauseloading state make sure the loading spinner is present:
//                if( this.isPauseLoading ){
//                    this.hideSpinnerOncePlaying();
//                }
//                // make sure the video tag is displayed:
//                $( this.getPlayerElement() ).show();
//                // Remove any poster div ( that would overlay the player )
//                if( ! _this.isAudio() ) {
//                    $( this ).find( '.playerPoster' ).remove();
//                }
//                // if using native controls make sure the inteface does not block the native controls interface:
//                if( this.useNativePlayerControls() && $( this ).find( 'video ').length == 0 ){
//                    $( this ).hide();
//                }
//                // update the preload attribute to auto
//                $( this.getPlayerElement() ).attr('preload',"auto" );
//                // issue a play request
//                this.getPlayerElement().play();
//                // re-start the monitor:
//                this.monitor();
//            }
//        } else {
//            mw.log( "EmbedPlayerNative:: parent play returned false, don't issue play on native element");
//        }
    },

    /**
	* Pause the video playback
	* calls parent_pause to update the interface
	*/
	pause: function() {
		this.parent_pause( [] ); // update interface
		if ( this.getPlayerElement() ) { // update player
            this.getPlayerElement().pause();
		}
	},

    _onplaying: function(){
        mw.log('playing event was fired');

    },

	/**
	* Handle the native paused event
	*/
	_onpause: function(){
		var _this = this;
//		if( this.ignoreNextNativeEvent ){
//			this.ignoreNextNativeEvent = false;
//			return ;
//		}
//		var timeSincePlay =  Math.abs( this.absoluteStartPlayTime - new Date().getTime() );
//		mw.log( "EmbedPlayerNative:: OnPaused:: propagate:" +  this._propagateEvents + ' time since play: ' + timeSincePlay  + ' isNative=true' );
//		// Only trigger parent pause if more than MonitorRate time has gone by.
//		// Some browsers trigger native pause events when they "play" or after a src switch
//		if( timeSincePlay > mw.getConfig( 'EmbedPlayer.MonitorRate' ) ){
//			_this.parent_pause();
//			//in iphone when we're back from the native payer we need to show the image with the play button
//			if (mw.isIphone())
//			{
//				_this.updatePosterHTML();
//			}
//		} else {
//			// continue playback:
//			this.getPlayerElement().play();
//		}
	},

	/*
	 * Write the Embed html to the target
	 */
    setPlayerSource: function(videoUrl){
        this.getPlayerElement().setPlayerSource( [videoUrl] );
    },

    drawVideoNativeComponent: function(){
        var videoElementPosition = this.getVideoElementPosition();
        var x = videoElementPosition.left;
        var y = videoElementPosition.top;
        var w = videoElementPosition.right - videoElementPosition.left;
        var h = videoElementPosition.bottom - videoElementPosition.top;

        this.getPlayerElement().drawVideoNativeComponent( [x, y, w, h] );
    },

    getVideoElementPosition: function(){
        var videoElementDiv = parent.document.getElementById( this.id );
        var videoElementRect = videoElementDiv.getBoundingClientRect();

        return videoElementRect;
    }
};
} )( mediaWiki, jQuery );


