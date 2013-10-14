/**
* Native embed library:
*
* Enables embedPlayer support for native iOS/Android webView playback system
*/

( function( mw, $ ) { "use strict";
    //make the player transparent to see the native iOS/Android player
    if(mw.getConfig( "EmbedPlayer.ForceNativeComponent")){
        $('body,.videoHolder').css('background-color', 'transparent' );
    }

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
        'stop',
		'play',
		'pause',
		'canplay',
		'seeking',
		'seeked',
		'ended',
        'error',
        'stalled',
        'loadedmetadata',
        'timeupdate',
        'progress',
        'enterfullscreen',
        'exitfullscreen'
	],
	// Native player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'SourceSelector': false,
		'timeDisplay' : true,
		'volumeControl' : false,
		'overlays' : true
	},

    embedPlayerHTML : function() {
        var _this = this;
        if ( !this.playerIsLoaded ){
            mw.log( "NativeComponent:: embedPlayerHTML" );
            // remove any existing pid ( if present )
            $( '#' + this.pid ).remove();

            var divElement = document.createElement("div");
            divElement.setAttribute('id', 'proxy');
            document.body.appendChild(divElement);

            this.proxyElement = divElement;
            try{
                if(NativeBridge.videoPlayer){
                    NativeBridge.videoPlayer.registePlayer(this.getPlayerElement());
                }
            }
            catch(e){
                alert( e );
            }

            this.applyMediaElementBindings();
            this.getPlayerElement().attr('src', this.getSrc());
            this.playerIsLoaded = true;
        }
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
     * Get the embed player time
     */
    getPlayerElementTime: function() {
        var _this = this;
        // Make sure we have .vid obj

        if ( !this.getPlayerElement() ) {
            mw.log( 'EmbedPlayerNative::getPlayerElementTime: ' + this.id + ' not in dom ( stop monitor)' );
            this.stop();
            return false;
        }
        var ct =  this.getPlayerElement().attr('currentTime');
        // Return 0 or a positive number:
        if( ! ct || isNaN( ct ) || ct < 0 || ! isFinite( ct ) ){
            return 0;
        }
        // Return the playerElement currentTime
        return  ct ;
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
        if( this.getPlayerElement() && this.getPlayerElement().attr('currentTime')){
            this.getPlayerElement().attr('currentTime', '0');
            this.getPlayerElement().stop();
        }
    },

    /**
     * Play back the video stream
     * calls parent_play to update the interface
     */

    play: function() {
        $( this ).find( '.playerPoster' ).remove();

        if ( this.getPlayerElement() ) { // update player
            this.getPlayerElement().play();
        }
        $( this ).trigger( "playing" );

        if( this.parent_play() ){
            this.monitor();
        }
    },

    /**
	* Pause the video playback
	* calls parent_pause to update the interface
	*/
	pause: function() {
		this.parent_pause(); // update interface
		if ( this.getPlayerElement() ) { // update player
            this.getPlayerElement().pause();
		}
	},

	seek: function( percentage ) {
		var seekTime = percentage * this.getDuration();
		this.getPlayerElement().attr('currentTime', seekTime);
		this.parent_seek( percentage );
	},

    /**
     * Handle the native play event
     */
    _onplay: function(){
        mw.log("EmbedPlayerNativeComponent:: OnPlay::");

        this.updatePlayhead();
        $( this ).trigger( "playing" );

        if( this.paused  && this.parent_play() ){
            this.monitor();
        }
    },

	/**
	* Handle the native paused event
	*/
    /**
     * Handle the native paused event
     */
    _onpause: function(){
        mw.log("EmbedPlayerNativeComponent:: OnPause::");
        this.parent_pause();
    },

    /**
     * Local method for seeking event
     * fired when "seeking"
     */
    _onseeking: function() {
        mw.log( "EmbedPlayerNative::onSeeking " );

        // Trigger the html5 "seeking" trigger
        mw.log("EmbedPlayerNative::seeking:trigger:: ");
        if( this._propagateEvents ){
            this.triggerHelper( 'seeking' );
        }
    },

    /**
     * Local method for seeked event
     * fired when done seeking
     */
    _onseeked: function() {
        mw.log("EmbedPlayerNative::onSeeked " );

        if( this._propagateEvents ){
            mw.log( "EmbedPlayerNative:: trigger: seeked" );
            this.triggerHelper( 'seeked' );
        }

        this.monitor();
    },

    /**
     * Local method for metadata ready
     * fired when metadata becomes available
     *
     * Used to update the media duration to
     * accurately reflect the src duration
     */
    _onloadedmetadata: function() {
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
     * Local method for end of media event
     */
    _onended: function( event ) {
        if( this.getPlayerElement() ){
            mw.log( 'EmbedPlayer:native: onended:');
            if( this._propagateEvents ){
                this.onClipDone();
            }
        }
    },

    /**
     * Local onClip done function for native player.
     */
    onClipDone: function(){
        this.parent_onClipDone();
    },

    /**
     * playback error
     */
    _onerror: function ( event ) {
        this.triggerHelper( 'embedPlayerError' );
    },

	/**
	 * buffer progress
	 * @param event
	 * @param progress
	 * @private
	 */
	_onprogress: function( event , progress ) {
		if ( typeof progress !== 'undefined' ) {
			this.updateBufferStatus( progress );
		}
	},

	/*
	 * Write the Embed html to the target
	 */
    getVideoElementPosition: function(){
        var videoElementDiv = parent.document.getElementById( this.id );
        var videoElementRect = videoElementDiv.getBoundingClientRect();

        return videoElementRect;
    },

    drawVideoNativeComponent: function(){
        var videoElementPosition = this.getVideoElementPosition();
        var x = videoElementPosition.left;
        var y = videoElementPosition.top;
        var w = videoElementPosition.right - videoElementPosition.left;
        var h = videoElementPosition.bottom - videoElementPosition.top;

        this.getPlayerElement().drawVideoNativeComponent( [x, y, w, h] );
    },

    showNativePlayer: function(){
        this.getPlayerElement().showNativePlayer();
    },

    hideNativePlayer: function(){
        this.getPlayerElement().hideNativePlayer();
    },

    useNativePlayerControls: function() {
        return false;
    },

    /**
     * Passes a fullscreen request to the layoutBuilder interface
     */
	toggleFullscreen: function() {
        this.getPlayerElement().toggleFullscreen();
    }
};
} )( mediaWiki, jQuery );


