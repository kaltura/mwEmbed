/**
 * @constructor
 */
function StateManager() {
    this.currState = null;
    this.idleManager = new IdleManager();
    this.logoUrl = null;
    this.KALTURA_DEFAULT_LOGO_URL = "assets/kaltura_logo_small.png";
    this.isPlaying = false;
    this.isOverlayShown = false;
    this.pauseTimeout = null;
    this.receiverWrapper = $( '#receiver-wrapper' );
    this.beforePlayControls = $( '#cast-before-play-controls' );
    this.inPlayControls = $( '#cast-in-play-controls' );
    this.mediaInfoContainer = $( '#cast-media-info' );
    this.logoDiv = $( '#logo' );
    this.stateBtnContainer = $( '#cast-state-button-container' );
    this.pauseBtn = $( '#cast-pause-button' );
    this.loadingSpinner = $( '#cast-loading-spinner' );
    this.bufferingSpinner = $( '#cast-buffering-spinner' );
    this.watermark = $( '#cast-watermark' );
    this.gradient = $( '#cast-gradient' );
    this.curTimeDiv = $( '#cast-current-time' );
    this.totalTimeDiv = $( '#cast-total-time' );
    this.progressFill = $( '.cast-media-progress-fill' );
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

/**
 * Sets the new state of the receiver application.
 * @param state
 */
StateManager.prototype.setState = function ( state ) {
    ReceiverLogger.log( "StateManager", "Setting new state for receiver: " + state );
    // Sets a 'state' attribute to the wrapper div
    this.receiverWrapper.attr( 'state', state.toLowerCase() );
    // Start timeout for the new state
    this.idleManager.setIdleTimeout( state );
    // Save the new state
    this.currState = state;
    // Change the screen according to the new state
    this._handleStateScreen();
};

/**
 * Returning the current state of the receiver application.
 * @returns {*|null}
 */
StateManager.prototype.getState = function () {
    return this.currState;
};

/**
 * Handles seek start.
 */
StateManager.prototype.onSeekStart = function () {
    if ( this.isPlaying ) {
        this._clearTimeouts();
        if ( this.pauseBtn.is( ":visible" ) ) {
            this.pauseBtn.fadeOut();
            this.stateBtnContainer.fadeOut();
        }
        this.bufferingSpinner.fadeIn();
        if ( !this.isOverlayShown ) {
            this.inPlayControls.fadeIn();
        }
    }
};

/**
 * Handles seek end.
 */
StateManager.prototype.onSeekEnd = function () {
    if ( this.isPlaying ) {
        var _this = this;
        this.bufferingSpinner.fadeOut();
        if ( !this.isOverlayShown ) {
            _this.inPlayControls.fadeOut();
        }
        this._handleStateScreen( true );
    }
};

/**
 * Handles on progress (i.e. updates the progress bar).
 * @param curTime
 * @param totalTime
 */
StateManager.prototype.onProgress = function ( curTime, totalTime ) {
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
        this.totalTimeDiv.text( '/ ' + formatDuration( totalTime ) );
        this.progressFill.css( 'width', pix + 'px' );
    }
};

/**
 * Handle the application UI according to the current state.
 * @param opt_seeked - optional parameter which indicates if we just finished to seek.
 * @private
 */
StateManager.prototype._handleStateScreen = function ( opt_seeked ) {
    switch ( this.currState ) {
        case StateManager.State.LAUNCHING:
            this._setLogo();
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
            this._onPlaying( opt_seeked );
            break;
        case StateManager.State.PAUSED:
            this._onPause( opt_seeked );
            break;
        default:
            break;
    }
};

/**
 * Sets the receiver's idle screen logo.
 * If a query string with a logoUrl key added to the
 * receiver application's url it will set it. Else,
 * it will set Kaltura logo.
 * @private
 */
StateManager.prototype._setLogo = function () {
    var logoUrl = getQueryVariable( 'logoUrl' );
    if ( logoUrl ) {
        // Set partner's logo
        ReceiverLogger.log( "StateManager", "Setting partner's logo.", { 'logoUrl': logoUrl } );
        this.logoUrl = logoUrl;
    } else {
        // Set Kaltura's default logo
        ReceiverLogger.log( "StateManager", "Setting Kaltura's logo." );
        this.logoUrl = this.KALTURA_DEFAULT_LOGO_URL;
    }
    this.logoDiv.css( 'background-image', 'url(' + this.logoUrl + ')' );
};

/**
 * BUFFERING state handling.
 * @private
 */
StateManager.prototype._onBuffering = function () {
    this.loadingSpinner.fadeOut();
};

/**
 * LOADING state handling.
 * @private
 */
StateManager.prototype._onLoading = function () {
    this.loadingSpinner.fadeIn();
    this.watermark.fadeOut();
};

/**
 * IDLE state handling.
 * @private
 */
StateManager.prototype._onIdle = function () {
    this.isPlaying = false;
    this.watermark.fadeIn();
    this.logoDiv.css( 'background', '' );
    this.logoDiv.css( 'background-image', 'url(' + this.logoUrl + ')' );
    this.logoDiv.fadeIn();
};

/**
 * PLAYING state handling.
 * @param opt_seeked - optional parameter which indicates if we reached this
 * state after seek.
 * @private
 */
StateManager.prototype._onPlaying = function ( opt_seeked ) {
    if ( !this.isPlaying ) {
        this.isPlaying = true;
        this.beforePlayControls.fadeOut();
        this.mediaInfoContainer.fadeOut();
        this.logoDiv.css( 'background', 'transparent' );
    } else if ( !opt_seeked ) {
        this._clearTimeouts();
        if ( this.pauseBtn.is( ':visible' ) ) {
            this.pauseBtn.fadeOut();
            this.stateBtnContainer.fadeOut();
        }
        if ( this.isOverlayShown ) {
            this._showHideOverlay( 'hide' );
        }
    }
};

/**
 * PAUSE state handling.
 * @param opt_seeked - optional parameter which indicates if we reached this
 * state after seek.
 * @private
 */
StateManager.prototype._onPause = function ( opt_seeked ) {
    var _this = this;
    this.pauseBtn.fadeIn();
    this.stateBtnContainer.fadeIn();
    if ( opt_seeked ) {
        if ( this.isOverlayShown ) {
            this._showHideOverlay( 'show' );
            this.pauseTimeout = setTimeout( function () {
                _this._showHideOverlay( 'hide' );
                _this.isOverlayShown = false;
            }, 4000 );
        }
    } else {
        this._clearTimeouts();
        this._showHideOverlay( 'show' );
        this.isOverlayShown = true;
        this.pauseTimeout = setTimeout( function () {
            _this._showHideOverlay( 'hide' );
            _this.isOverlayShown = false;
        }, 4000 );
    }
};

/**
 * Clears all the timeouts because of a change in state.
 * @private
 */
StateManager.prototype._clearTimeouts = function () {
    if ( this.pauseTimeout !== null ) {
        clearTimeout( this.pauseTimeout );
        this.pauseTimeout = null;
    }
};

/**
 * Shows or hides the overlay cast UI components.
 * @param selector - 'show' or 'hide'
 * @private
 */
StateManager.prototype._showHideOverlay = function ( selector ) {
    var show = (selector === 'show');
    var overlayComponents = [ this.gradient, this.mediaInfoContainer, this.inPlayControls ];
    for ( var i = 0; i < overlayComponents.length; i++ ) {
        show ? overlayComponents[ i ].fadeIn() : overlayComponents[ i ].fadeOut();
    }
};