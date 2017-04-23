/**
 * @constructor
 */
function StateManager() {
    this.CLASS_NAME = "ReceiverStateManager";
    this.KALTURA_DEFAULT_LOGO_URL = "assets/kaltura-logo.png";
    this.PAUSE_TIMEOUT_DURATION = 5 * 1000;
    this.currState = null;
    this.idleManager = new IdleManager();
    this.logoUrl = null;
    this.backgroundColor = null;
    this.isPlaying = false;
    this.isOverlayShown = false;
    this.pauseTimeout = null;
    this.countdownInterval = null;
    this.beforePlayControls = $( '#cast-before-play-controls' );
    this.inPlayControls = $( '#cast-in-play-controls' );
    this.mediaInfoContainer = $( '#cast-media-info' );
    this.nextMediaInfoContainer = $( '#cast-media-info-next' );
    this.logoDiv = $( '#logo' );
    this.stateBtnContainer = $( '#cast-state-button-container' );
    this.pauseBtn = $( '#cast-pause-button' );
    this.loadingSpinner = $( '#cast-loading-spinner' );
    this.bufferingSpinner = $( '#cast-buffering-spinner' );
    this.gradient = $( '#cast-gradient' );
    this.curTimeDiv = $( '#cast-current-time' );
    this.totalTimeDiv = $( '#cast-total-time' );
    this.progressFill = $( '.cast-media-progress-fill' );
    this.waitMsg = $( '.cast-wait-msg' );
    this.countdown = $( '#cast-up-next-countdown' );
    this.insertRemoveFromQueueMsg = $( '.cast-added-removed-from-queue-msg' );
    this.insertRemoveFromQueueTimeout = null;
}

/**
 * The possible states for the receiver application.
 * @type {{LAUNCHING: string, LOADING: string, BUFFERING: string, PLAYING: string, PAUSED: string, IDLE: string}}
 */
StateManager.State = {
    LAUNCHING: 'LAUNCHING',
    LOADING: 'LOADING',
    BUFFERING: 'BUFFERING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    IDLE: 'IDLE'
};

StateManager.prototype = {

    configure: function ( config ) {
        if ( config.fadeOutPauseTime && $.isNumeric( config.fadeOutPauseTime ) ) {
            this.PAUSE_TIMEOUT_DURATION = config.fadeOutPauseTime * 1000;
        }
        if ( config.switchingAudioTracksMsg && typeof (config.switchingAudioTracksMsg) === 'string' ) {
            this.waitMsg.text( config.switchingAudioTracksMsg );
        }
        if ( config.switchingAudioTracksMsgColor ) {
            this.waitMsg.css( "color", config.switchingAudioTracksMsgColor );
        }
        if ( config.subtitleSize ) {
            $( '.cast-subtitle' ).css( "font-size", config.subtitleSize + "px" );
        }
        if ( config.subtitleFont ) {
            $( '.cast-subtitle' ).css( "font-family", config.subtitleFont );
        }
        if ( config.titleSize ) {
            $( '.cast-title' ).css( "font-size", config.subtitleSize + "px" );
        }
        if ( config.titleFont ) {
            $( '.cast-title' ).css( "font-family", config.subtitleFont );
        }
        if ( config.progressFillColor ) {
            $( '.cast-progress-loading-fill' ).css( "background-color", config.progressFillColor );
            $( '.cast-media-progress-fill' ).css( "background-color", config.progressFillColor );
        }
        if ( config.spinnerFillColor ) {
            $( '.cast-buffering-spinner' ).css( "border-top", '6px solid ' + config.spinnerFillColor );
            $( '.cast-loading-spinner' ).css( "border-top", '6px solid ' + config.spinnerFillColor );
        }
        this.idleManager.configure( config );
    },

    /**
     * Sets the new state of the receiver application.
     * @param state
     */
    setState: function ( state ) {
        ReceiverLogger.log( this.CLASS_NAME, "Setting new state for receiver: " + state );
        // Start timeout for the new state
        this.idleManager.setIdleTimeout( state );
        // Save the new state
        this.currState = state;
        // Change the screen according to the new state
        this._handleStateScreen();
    },

    /**
     * Returning the current state of the receiver application.
     * @returns {*|null}
     */
    getState: function () {
        return this.currState;
    },

    toggleInsertRemoveFromQueue: function ( type, title, subtitle ) {
        if ( this.insertRemoveFromQueueTimeout !== null ) {
            clearTimeout( this.insertRemoveFromQueueTimeout );
            this.insertRemoveFromQueueTimeout = null;
        }
        var mediaTxt = title + ' - ' + subtitle;
        var msgTxt = (type === "insert" ? "added to queue" : "removed from queue");
        this.insertRemoveFromQueueMsg.html( '<b>' + mediaTxt + '</b> ' + msgTxt );
        this.insertRemoveFromQueueMsg.slideDown( 500 );
        this.insertRemoveFromQueueTimeout = setTimeout( function () {
            this.insertRemoveFromQueueMsg.slideUp( 500 );
        }.bind( this ), 4000 );
    },

    /**
     * Handles first play.
     */
    onEditTracks: function () {
        this.waitMsg.fadeIn();
    },

    /**
     * Displays the media metadata UI on screen.
     * @param showPreview
     */
    onShowMediaMetadata: function ( showPreview ) {
        if ( this.loadingSpinner.is( ":visible" ) ) {
            this.loadingSpinner.fadeOut();
        }
        this._toggleComponents( (showPreview ? 'show' : 'hide'),
            [ this.mediaInfoContainer, this.beforePlayControls, this.gradient ] );
    },

    /**
     * Displays the next media metadata UI on screen.
     * @param showPreview
     */
    onShowNextMediaMetadata: function ( showPreview ) {
        this.countdownInterval = setInterval( this._updateCountdown.bind( this ), 1000 );
        this._toggleComponents( (showPreview ? 'show' : 'hide'),
            [ this.nextMediaInfoContainer, this.gradient ] );
    },

    /**
     * Clear the next media metadata UI.
     */
    clearNextMediaMetadata: function () {
        if ( this.countdownInterval !== null ) {
            this._toggleComponents( 'hide', [ this.nextMediaInfoContainer, this.gradient ] );
            clearInterval( this.countdownInterval );
            this.countdownInterval = null;
        }
    },

    /**
     * Handles first play.
     */
    onCanPlay: function () {
        if ( !this.isPlaying ) {
            this.isPlaying = true;
        }
        this._toggleComponents( 'hide', [ this.beforePlayControls, this.mediaInfoContainer, this.gradient ] );
        this.logoDiv.css( 'background', 'transparent' );
    },

    /**
     * Handles seek start.
     */
    onSeekStart: function () {
        if ( this.isPlaying ) {
            this._clearPauseTimeout();
            if ( this.pauseBtn.is( ":visible" ) ) {
                this._toggleComponents( 'hide', [ this.pauseBtn, this.stateBtnContainer ] );
            }
            if ( !this.inPlayControls.is( ":visible" ) ) {
                this.inPlayControls.fadeIn();
            }
            this.bufferingSpinner.fadeIn();
        }
    },

    /**
     * Handles seek end.
     */
    onSeekEnd: function () {
        if ( this.isPlaying ) {
            this.bufferingSpinner.fadeOut();
            if ( this.currState !== StateManager.State.PAUSED ) {
                this.inPlayControls.fadeOut();
            }
            this._handleStateScreen( true );
        }
    },

    /**
     * Handles on progress (i.e. updates the progress bar).
     * @param curTime
     * @param totalTime
     */
    onProgress: function ( curTime, totalTime ) {
        var formatDuration = function ( dur ) {
            dur = Math.floor( dur );
            function digit( n ) {
                return ('00' + Math.round( n )).slice( -2 );
            }

            var hr = Math.floor( dur / 3600 );
            var min = Math.floor( dur / 60 ) % 60;
            var sec = dur % 60;
            if ( !hr ) {
                return digit( min ) + ':' + digit( sec );
            } else {
                return digit( hr ) + ':' + digit( min ) + ':' + digit( sec );
            }
        };

        if ( !isNaN( curTime ) && !isNaN( totalTime ) ) {
            var pct = (curTime / totalTime);
            var pix = pct * 780;
            this.curTimeDiv.text( formatDuration( curTime ) + ' ' );
            if ( totalTime !== Infinity ) {
                var totalTime_formatted = formatDuration( totalTime );
                if ( (totalTime_formatted.split( ":" ).length - 1) === 1 ) {
                    this.totalTimeDiv.css( 'left', 1005 );
                    this.curTimeDiv.css( 'left', 942 );
                } else if ( (totalTime_formatted.split( ":" ).length - 1) === 2 ) {
                    this.totalTimeDiv.css( 'left', 970 );
                    this.curTimeDiv.css( 'left', 860 );
                }
                this.totalTimeDiv.text( '/ ' + totalTime_formatted );
            } else {
                this.curTimeDiv.css( 'left', 990 );
            }
            this.progressFill.css( 'width', pix + 'px' );
        }
    },

    /**
     * Handle the application UI according to the current state.
     * @param opt_afterSeek - optional parameter which indicates if we just finished to seek.
     * @private
     */
    _handleStateScreen: function ( opt_afterSeek ) {
        switch ( this.currState ) {
            case StateManager.State.LAUNCHING:
                this._onLaunching();
                break;
            case StateManager.State.IDLE:
                this._onIdle();
                break;
            case StateManager.State.LOADING:
                this._onLoading();
                break;
            case StateManager.State.BUFFERING:
                this._onBuffering();
                break;
            case StateManager.State.PLAYING:
                this._onPlaying( opt_afterSeek );
                break;
            case StateManager.State.PAUSED:
                this._onPause( opt_afterSeek );
                break;
            default:
                break;
        }
    },

    /**
     * Handles the launching state.
     * @private
     */
    _onLaunching: function () {
        this._setLogo();
        this._setBackgroundColor();
    },

    /**
     * Sets the receiver's idle screen logo.
     * If a query string with a logoUrl key added to the
     * receiver application's url it will set it. Else,
     * it will set Kaltura logo.
     * @private
     */
    _setLogo: function () {
        var logoUrl = ReceiverUtils.getQueryVariable( 'logoUrl' );
        if ( logoUrl ) {
            // Set partner's logo
            ReceiverLogger.log( this.CLASS_NAME, "Setting partner's logo.", { 'logoUrl': logoUrl } );
            this.logoUrl = logoUrl;
        } else {
            // Set Kaltura's default logo
            ReceiverLogger.log( this.CLASS_NAME, "Setting Kaltura's logo." );
            this.logoUrl = this.KALTURA_DEFAULT_LOGO_URL;
        }
        this.logoDiv.css( 'background-image', 'url(' + this.logoUrl + ')' );
    },

    /**
     * Sets the background color of the idle screen.
     * @private
     */
    _setBackgroundColor: function () {
        var backgroundColor = ReceiverUtils.getQueryVariable( 'backgroundColor' );
        if ( backgroundColor ) {
            ReceiverLogger.log( this.CLASS_NAME, "Setting background color: " + backgroundColor );
            this.backgroundColor = backgroundColor;
            this.logoDiv.css( 'background-color', this.backgroundColor );
        }
    },

    /**
     * BUFFERING state handling.
     * @private
     */
    _onBuffering: function () {
        this.clearNextMediaMetadata();
        if ( this.loadingSpinner.is( ":visible" ) ) {
            this.loadingSpinner.fadeOut();
        }
    },

    /**
     * LOADING state handling.
     * @private
     */
    _onLoading: function () {
        this.loadingSpinner.fadeIn();
    },


    /**
     * IDLE state handling.
     * @private
     */
    _onIdle: function () {
        this._resetScreen();
        this.logoDiv.css( 'background', '' );
        this.logoDiv.css( 'background-image', 'url(' + this.logoUrl + ')' );
        if ( this.backgroundColor ) {
            this.logoDiv.css( 'background-color', this.backgroundColor );
        }
        this.logoDiv.fadeIn();
    },

    /**
     * PLAYING state handling.
     * @param opt_afterSeek - optional parameter which indicates if we reached this
     * state after seek.
     * @private
     */
    _onPlaying: function ( opt_afterSeek ) {
        if ( this.isPlaying && !opt_afterSeek ) {
            this._clearPauseTimeout();
            if ( this.waitMsg.is( ":visible" ) ) {
                this.waitMsg.fadeOut();
            }
            if ( this.pauseBtn.is( ':visible' ) ) {
                this._toggleComponents( 'hide', [ this.pauseBtn, this.stateBtnContainer, this.inPlayControls ] );
            }
            if ( this.isOverlayShown ) {
                this._toggleComponents( 'hide', [ this.mediaInfoContainer, this.gradient ] );
            }
        }
    },

    /**
     * PAUSE state handling.
     * @param opt_afterSeek - optional parameter which indicates if we reached this
     * state after seek.
     * @private
     */
    _onPause: function ( opt_afterSeek ) {
        var _this = this;
        this.clearNextMediaMetadata();
        this._toggleComponents( 'show', [ this.pauseBtn, this.stateBtnContainer, this.inPlayControls ] );
        if ( this.waitMsg.is( ":visible" ) ) {
            this.waitMsg.fadeOut();
        }
        if ( opt_afterSeek ) {
            if ( this.isOverlayShown ) {
                this._toggleComponents( 'show', [ this.gradient, this.mediaInfoContainer ] );
                this.pauseTimeout = setTimeout( function () {
                    _this._toggleComponents( 'hide', [ _this.gradient, _this.mediaInfoContainer ] );
                    _this.isOverlayShown = false;
                }, this.PAUSE_TIMEOUT_DURATION );
            }
        } else {
            this._clearPauseTimeout();
            this._toggleComponents( 'show', [ this.gradient, this.mediaInfoContainer ] );
            this.isOverlayShown = true;
            this.pauseTimeout = setTimeout( function () {
                _this._toggleComponents( 'hide', [ _this.gradient, _this.mediaInfoContainer ] );
                _this.isOverlayShown = false;
            }, this.PAUSE_TIMEOUT_DURATION );
        }
    },

    /**
     * Clears all the timeouts because of a change in state.
     * @private
     */
    _clearPauseTimeout: function () {
        if ( this.pauseTimeout !== null ) {
            clearTimeout( this.pauseTimeout );
            this.pauseTimeout = null;
        }
    },

    /**
     * Reset all the elements that can be on screen while playing.
     * @private
     */
    _resetScreen: function () {
        this.isPlaying = false;
        this._clearPauseTimeout();
        this._toggleComponents( 'hide', [ this.pauseBtn, this.stateBtnContainer, this.inPlayControls, this.gradient, this.mediaInfoContainer ] );
        this.isOverlayShown = false;
    },

    /**
     * Shows or hides cast UI components.
     * @param selector - 'show' or 'hide'
     * @param components - the UI components
     * @private
     */
    _toggleComponents: function ( selector, components ) {
        var show = (selector === 'show');
        for ( var i = 0; i < components.length; i++ ) {
            show ? components[ i ].fadeIn() : components[ i ].fadeOut();
        }
    },

    /**
     * Updates a countdown until the next media in the queue will start.
     * @private
     */
    _updateCountdown: function () {
        var countdown = Math.round( mediaElement.duration - mediaElement.currentTime );
        if ( countdown === 0 || countdown > 5 ) {
            this.clearNextMediaMetadata();
        } else {
            this.countdown.text( countdown );
        }
    }
};