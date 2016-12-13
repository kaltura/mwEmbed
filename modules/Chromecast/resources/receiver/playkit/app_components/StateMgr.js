function StateManager() {
    this.currState = null;
    this.idleManager = new IdleManager();
    this.logo = null;
    this.KALTURA_DEFAULT_LOGO_URL = "assets/kaltura_logo_small.png";
    this.LOGO = 'logo';
    this.WATERMARK = 'cast-watermark';
    this.SPINNER = 'loading-spinner';
    this.MEDIA = 'media-area';
    this.GRADIENT = 'gradient';
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
    $( '#receiver-wrapper' ).attr( 'state', state.toLowerCase() );
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

    var showIdleScreen = function () {
        var logoDiv = $( '#' + _this.LOGO );
        logoDiv.css( 'background', '' );
        logoDiv.css( 'background-image', 'url(' + _this.logo + ')' );
        logoDiv.fadeIn();
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

    var hideSpinner = function () {
        $( '#' + _this.SPINNER ).fadeOut();
    };

    var makeBackgroundTransparent = function () {
        $( '#' + _this.LOGO ).css( 'background', 'transparent' );
    };

    var hideMediaMetadata = function () {
        $( '#' + _this.MEDIA ).fadeOut();
    };

    var changeGradient = function ( transperent ) {
        if ( transperent ) {
            $( '#' + _this.GRADIENT ).css( 'background', 'linear-gradient(to bottom, rgba(255, 255, 255, 0), black, black, black)' );
        } else {
            $( '#' + _this.GRADIENT ).css( 'background', 'linear-gradient(to bottom, rgba(255, 255, 255, 0), black)' );
        }
    };

    switch ( this.currState ) {
        case StateManager.State.LAUNCHING:
            this._setLogo();
            break;
        case StateManager.State.IDLE:
            changeGradient( false );
            clearIdleScreenElements();
            showCastWatermark();
            showIdleScreen();
            break;
        case StateManager.State.LOADING:
            showSpinner();
            hideCastWatermark();
            break;
        case StateManager.State.BUFFERING:
            hideSpinner();
            break;
        case StateManager.State.PLAYING:
            changeGradient( true );
            makeBackgroundTransparent();
            setTimeout( function () {
                hideMediaMetadata();
            }, 3500 );
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
        AppLogger.log( "StateManager", "Setting partner's logo.", { 'logoUrl': logoUrl } );
        this.logo = logoUrl;
    } else {
        // Set Kaltura's default logo
        AppLogger.log( "StateManager", "Setting Kaltura's logo." );
        this.logo = this.KALTURA_DEFAULT_LOGO_URL;
    }
    $( '#' + this.LOGO ).css( 'background-image', 'url(' + this.logo + ')' );
};