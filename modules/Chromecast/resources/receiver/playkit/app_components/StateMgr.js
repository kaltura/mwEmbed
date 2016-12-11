function StateManager() {
    this.currState = null;
    this.idleManager = new IdleManager();
    this.LOGO = 'logo';
    this.WATERMARK = 'cast-watermark';
    this.SPINNER = 'loading-spinner';
}

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
    AppLogger.log( "StateManager", "Setting new state for receiver: " + state );
    // Sets a 'state' attribute to the wrapper div
    receiverWrapper.setAttribute( "state", state.toLowerCase() );
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
 * Handle the application UI according to the new state.
 * @private
 */
StateManager.prototype._handleStateScreen = function () {
    var _this = this;

    var clearIdleScreenElements = function () {
        $( '#' + _this.LOGO ).children().fadeOut();
    };

    var hideIdleScreen = function () {
        $( '#' + _this.LOGO ).fadeOut();
    };

    var showIdleScreen = function () {
        $( '#' + _this.LOGO ).fadeIn();
    };

    var showCastWatermark = function () {
        $( '#' + _this.WATERMARK ).fadeIn();
    };

    var hideCastWatermark = function () {
        $( '#' + _this.WATERMARK ).fadeOut();
    };

    var showSpinner = function () {
        $( '#' + _this.SPINNER ).fadeIn();
    };

    switch ( this.currState ) {
        case StateManager.State.LAUNCHING:
            this._setLogo();
            showCastWatermark();
            showIdleScreen();
            break;
        case StateManager.State.IDLE:
            clearIdleScreenElements();
            showCastWatermark();
            showIdleScreen();
            break;
        case StateManager.State.LOADING:
        case StateManager.State.BUFFERING:
            hideCastWatermark();
            showSpinner();
            break;
        case StateManager.State.PLAYING:
            clearIdleScreenElements();
            hideIdleScreen();
            break;
    }
};

/**
 * Sets the receiver's idle screen logo.
 * If a query string with a logoUrl key added to the
 * receiver application's url it will set it. Else,
 * it will set Kaltura logo.
 */
StateManager.prototype._setLogo = function () {

    /**
     * Gets the value from the url's query string.
     * @param variable the key in the query string.
     * @returns {*}
     */
    var getQueryVariable = function ( variable ) {
        var query = decodeURIComponent( window.location.search.substring( 1 ) );
        var vars = query.split( "&" );
        for ( var i = 0; i < vars.length; i++ ) {
            var pair = vars[ i ].split( "=" );
            if ( pair[ 0 ] == variable ) {
                return pair[ 1 ];
            }
        }
        return false;
    };

    var logoUrl = getQueryVariable( 'logoUrl' );
    if ( logoUrl ) {
        // Set partner's logo
        AppLogger.log( "StateManager", "Displaying partner's idle screen.", { 'logoUrl': logoUrl } );
        $( "#" + this.LOGO ).css( 'background-image', 'url(' + logoUrl + ')' );
    } else {
        // Set Kaltura's default logo
        AppLogger.log( "StateManager", "Displaying Kaltura's idle screen." );
        $( "#" + this.LOGO ).css( 'background-image', "url('assets/kaltura_logo_small.png')" );
    }
};