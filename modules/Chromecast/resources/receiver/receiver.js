/**
 * Indicates whether the embed player already been initialized
 * @type {boolean}
 */
var embedPlayerInitialized = false;
/**
 * Indicates if we're running in debug mode
 * @type {boolean}
 */
var debugMode = true;
/**
 * The kaltura player
 * @type {object}
 */
var kdp = null;
/**
 * The Google cast receiver manager.
 * Responsible for the application management.
 */
var receiverManager;
/**
 * The Google cast media manager.
 * Using as a proxy for media actions (such as play,pause,seek,etc).
 */
var mediaManager;
/**
 * The video element.
 */
var mediaElement;
/**
 * The Google cast message bus.
 * Using to pass custom messages from sender to receiver.
 */
var messageBus;
/**
 * The last request that we received from loadMedia event.
 * @type {object}
 */
var lastLoadMediaReq = null;
/**
 * The application logger.
 */
var AppLogger = Logger.getInstance();
/**
 * The application state manager.
 * @type {StateManager}
 */
var AppState = new StateManager();

/**
 * The id of the splash screen div.
 * @type {string}
 */
var LOGO_ID = "logo";
/**
 * The possible messages that sender can send to receiver
 * on the message bus and their callbacks.
 * @type {object}
 */
var MESSAGE_BUS_MAP = {
    'notification': function ( payload ) {
        AppLogger.log( "MessageBus", "Pass notification " + payload[ 'event' ] + " to the player.", payload );
        kdp.sendNotification( payload[ 'event' ], [ payload[ 'data' ] ] );
    },
    'setKDPAttribute': function ( payload ) {
        AppLogger.log( "MessageBus", "Sets KDP attribute: " + payload[ 'property' ] + " to " + payload[ 'value' ], payload );
        kdp.setKDPAttribute( payload[ 'plugin' ], payload[ 'property' ], payload[ 'value' ] );
    }
};

/**
 * Starts the receiver application and opening new session.
 * @param vidElement initial fake video tag that will be changed later.
 */
function startReceiver( vidElement ) {
    // Init receiver manager and setting his events
    receiverManager = cast.receiver.CastReceiverManager.getInstance();
    receiverManager.onReady = onReady.bind( this );
    receiverManager.onSenderConnected = onSenderConnected.bind( this );
    receiverManager.onSenderDisconnected = onSenderDisconnected.bind( this );
    receiverManager.onVisibilityChanged = onVisibilityChanged.bind( this );

    // Init media manager and setting his events
    mediaManager = new cast.receiver.MediaManager( vidElement );
    mediaManager.customizedStatusCallback = customizedStatusCallback.bind( this );

    mediaManager[ 'onEndedOrig' ] = mediaManager.onEnded;
    mediaManager.onEnded = onEnded.bind( this );

    mediaManager[ 'onErrorOrig' ] = mediaManager.onError;
    mediaManager.onError = onError.bind( this );

    mediaManager[ 'onLoadMetadataErrorOrig' ] = mediaManager.onLoadMetadataError;
    mediaManager.onLoadMetadataError = onLoadMetadataError.bind( this );

    mediaManager[ 'onMetadataLoadedOrig' ] = mediaManager.onMetadataLoaded;
    mediaManager.onMetadataLoaded = onMetadataLoaded.bind( this );

    mediaManager[ 'onPauseOrig' ] = mediaManager.onPause;
    mediaManager.onPause = onPause.bind( this );

    mediaManager[ 'onPlayOrig' ] = mediaManager.onPlay;
    mediaManager.onPlay = onPlay.bind( this );

    mediaManager[ 'onSeekOrig' ] = mediaManager.onSeek;
    mediaManager.onSeek = onSeek.bind( this );

    mediaManager[ 'onStopOrig' ] = mediaManager.onStop;
    mediaManager.onStop = onStop.bind( this );

    mediaManager[ 'onLoadOrig' ] = mediaManager.onLoad;
    mediaManager.onLoad = onLoad.bind( this );

    // Init message bus and setting his event
    messageBus = receiverManager.getCastMessageBus( 'urn:x-cast:com.kaltura.cast.player' );
    messageBus.onMessage = onMessage.bind( this );

    receiverManager.start();
}

// Media manager's events
function customizedStatusCallback( mediaStatus ) {
    AppLogger.log( "MediaManager", "customizedStatusCallback", { 'playerState': mediaStatus.playerState } );
    if ( !AppState.isInState( mediaStatus.playerState ) ) {
        AppState.setState( mediaStatus.playerState );
        if ( AppState.isInState( StateManager.State.PLAYING ) ) {
            hideElement( LOGO_ID );
        }
        else if ( AppState.isInState( StateManager.State.IDLE ) ) {
            showElement( LOGO_ID );
        }
    }
    return mediaStatus;
}

function onError( event ) {
    AppLogger.log( "MediaManager", "onError", event );
    mediaManager[ 'onErrorOrig' ]( event );
}

function onLoadMetadataError( event ) {
    AppLogger.log( "MediaManager", "onLoadMetadataError", event );
    mediaManager[ 'onLoadMetadataErrorOrig' ]( event );
}

function onMetadataLoaded( info ) {
    AppLogger.log( "MediaManager", "onMetadataLoaded", info );
    mediaManager[ 'onMetadataLoadedOrig' ]( info );
}

function onPause( event ) {
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        AppLogger.log( "MediaManager", "onPause", event );
        kdp.sendNotification( 'doPause' );
        mediaManager[ 'onPauseOrig' ]( event );
    } else {
        AppLogger.log( "MediaManager", "Preventing pause during ad!!!", event );
    }
}

function onPlay( event ) {
    AppLogger.log( "MediaManager", "onPlay", event );
    kdp.sendNotification( "doPlay" );
    mediaManager[ 'onPlayOrig' ]( event );
}

function onSeek( event ) {
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        AppLogger.log( "MediaManager", "onSeek", event );
        mediaManager[ 'onSeekOrig' ]( event );
    } else {
        AppLogger.log( "MediaManager", "Preventing seek during ad!!!", event );
    }
}

function onStop( event ) {
    AppLogger.log( "MediaManager", "onStop", event );
    mediaManager[ 'onStopOrig' ]( event );
}

function onLoad( event ) {
    AppLogger.log( "MediaManager", "onLoad" );
    if ( event && event.data ) {
        lastLoadMediaReq = event;
        if ( !embedPlayerInitialized ) {
            AppLogger.log( "MediaManager", "Embed player isn't initialized yet. Starting dynamic embed.", event );
            embedPlayer( event );
        }
        else {
            var embedConfig = event.data.media.customData.embedConfig;
            // If same entry is sent then reload, else perform changeMedia
            if ( kdp.evaluate( '{mediaProxy.entry.id}' ) === embedConfig[ 'entryID' ] ) {
                AppLogger.log( "MediaManager", "Embed player already initialized with the same entry. Start replay.", event );
                kdp.sendNotification( "doPlay" );
            } else {
                AppLogger.log( "MediaManager", "Embed player already initialized with different entry. Change media.", event );
                kdp.sendNotification( "changeMedia", { "entryId": embedConfig[ 'entryID' ] } );
            }
        }
    }
}

function onEnded() {
    AppLogger.log( "MediaManager", "onEnded" );
    if ( kdp.evaluate( '{sequenceProxy.isInSequence}' ) ) {
        AppLogger.log( "MediaManager", "Set flag isIdleBecauseOfAdEnded to true." );
    } else {
        mediaManager[ 'onEndedOrig' ]();
    }
}

// Receiver manager's events
function onReady() {
    AppLogger.log( "receiverManager", "Receiver is ready." );
}

function onSenderConnected( event ) {
    AppLogger.log( "receiverManager", "Sender connected. Number of current senders: " + receiverManager.getSenders().length, event );
    if ( receiverManager.getSenders().length === 1 ) {
        displaySplashScreen();
    }
}

function onSenderDisconnected( event ) {
    AppLogger.log( "receiverManager", "Sender disconnected. Number of current senders: " + receiverManager.getSenders().length, event );
    if ( receiverManager.getSenders().length === 0
        && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER ) {
        AppLogger.log( "receiverManager", "Last or only sender is disconnected, stops the app from running on the receiver." );
        receiverManager.stop();
    }
}

function onVisibilityChanged( event ) {
    AppLogger.log( "receiverManager", "Visibility changed. isVisible: " + event.isVisible, event );
    if ( event.isVisible ) {
        // We're visible - resume playback
        onPlay( event );
    } else {
        // We're not visible - pause playback
        onPause( event );
    }
}

// Message bus's on message event
function onMessage( event ) {
    AppLogger.log( "MessageBus", "onMessage", event );
    if ( event && event.data ) {
        try {
            var payload = JSON.parse( event.data );
            var msgType = payload.type;
            MESSAGE_BUS_MAP[ msgType ]( payload );
        }
        catch ( e ) {
            AppLogger.error( "MessageBus", e.message, event );
        }
    }
}

// Class functions
function embedPlayer( req ) {
    var embedInfo = req.data.media.customData.embedConfig;
    $.getScript( embedInfo.lib + "mwEmbedLoader.php" )
        .then( function () {
            setConfiguration( embedInfo );
            kWidget.embed( {
                "targetId": "kaltura_player",
                "wid": "_" + embedInfo.publisherID,
                "uiconf_id": embedInfo.uiconfID,
                "readyCallback": function ( playerID ) {
                    embedPlayerInitialized = true;
                    kdp = document.getElementById( playerID );
                    addBindings();
                    swapVideoElement();
                },
                "flashvars": getFlashVars( embedInfo.flashVars ),
                "cache_st": 1438601385,
                "entry_id": embedInfo.entryID
            } );
        } );
}

/**
 * Switching the initial video element to Kaltura's
 * video element after the embed process finished.
 */
function swapVideoElement() {
    $( "#receiverVideoElement" ).remove();
    var kalturaVidElement = $( kdp ).contents().contents().find( "video" )[ 0 ];
    mediaManager.setMediaElement( kalturaVidElement );
}

/**
 * Sets the required bindings to the Kaltura player.
 * @param initialRequest
 */
function addBindings() {
    kdp.kBind( "onEmbedPlayerReceiverMsg", function ( msgObj ) {
        AppLogger.log( "kdp", "onEmbedPlayerReceiverMsg", msgObj );
        var msgType = msgObj.type;
        var opt_msgData = msgObj.data;
        var opt_msgCallback = msgObj.callback;
        switch ( msgType ) {
            case "doDefaultOnLoad":
                mediaManager[ 'onLoadOrig' ]( opt_msgData );
                break;
            case "getMediaInfo":
                opt_msgCallback( lastLoadMediaReq );
                break;
            case "hideLogo":
                hideElement( LOGO_ID );
        }
    } );
}

function setConfiguration( embedInfo ) {
    mw.setConfig( "EmbedPlayer.HidePosterOnStart", true );
    if ( embedInfo.debugKalturaPlayer == true ) {
        mw.setConfig( "debug", true );
        mw.setConfig( "debugTarget", "kdebug" );
        mw.setConfig( "autoScrollDebugTarget", true );
    }
    mw.setConfig( "chromecastReceiver", true );
    mw.setConfig( "Kaltura.ExcludedModules", "chromecast" );
}

var receiverFlashVars = {
    "dash": {
        'plugin': false
    },
    "multiDrm": {
        'plugin': false
    },
    "embedPlayerChromecastReceiver": {
        'plugin': true
    },
    "chromecast": {
        'plugin': false
    },
    "playlistAPI": {
        'plugin': false
    }
};

function getFlashVars( senderFlashVars ) {
    try {
        if ( typeof senderFlashVars !== 'object' ) {
            senderFlashVars = JSON.parse( senderFlashVars );
        }
        return extend( receiverFlashVars, senderFlashVars );
    }
    catch ( e ) {
        return receiverFlashVars;
    }
}

function extend( a, b ) {
    for ( var key in b )
        if ( b.hasOwnProperty( key ) )
            a[ key ] = b[ key ];
    return a;
}

function hideElement( id ) {
    AppLogger.log( "receiver.js", "Hiding element with id: " + id );
    $( "#" + id ).fadeOut();
}

function showElement( id ) {
    AppLogger.log( "receiver.js", "Showing element with id: " + id );
    $( "#" + id ).fadeIn();
}

function getQueryVariable( variable ) {
    var query = decodeURIComponent( window.location.search.substring( 1 ) );
    var vars = query.split( "&" );
    for ( var i = 0; i < vars.length; i++ ) {
        var pair = vars[ i ].split( "=" );
        if ( pair[ 0 ] == variable ) {
            return pair[ 1 ];
        }
    }
    return false;
}

function displaySplashScreen() {
    var logoUrl = getQueryVariable( 'logoUrl' );
    // Set partner logo
    if ( logoUrl ) {
        AppLogger.log( "receiver.js", "Displaying partner's splash screen.", { 'logoUrl': logoUrl } );
        $( "#" + LOGO_ID ).css( 'background-image', 'url(' + logoUrl + ')' );
    }
    // Set Kaltura's default logo
    else {
        AppLogger.log( "receiver.js", "Displaying Kaltura's splash screen." );
        $( "#" + LOGO_ID ).css( 'background-image', "url('assets/kalturalogo.png')" );
    }
    showElement( LOGO_ID );
}