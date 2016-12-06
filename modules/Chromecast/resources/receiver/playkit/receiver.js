/**
 * Indicates whether the embed player already been initialized.
 * @type {boolean}
 */
var embedPlayerInitialized = false;
/**
 * Indicates if we're running in debug mode.
 * @type {boolean}
 */
var debugMode = true;
/**
 * The Kaltura player
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
 * The application logger.
 */
var AppLogger = Logger.getInstance();
/**
 * The application state manager.
 * @type {StateManager}
 */
var AppState = new StateManager();
/**
 * Indicated if we're before preroll or after postroll.
 */
var isInSequence = false;
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
    //TODO: will be implemented after integration with the senders SDK v3
    'someMessage': function ( payload ) {
        // Write here the implementation to that message
    }
};

/**
 * Starts the receiver application and opening new session.
 * @param vidElement initial fake video tag that will be changed later.
 */
function startReceiver( vidElement ) {
    AppState.setState( StateManager.State.LAUNCHING );
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
            if ( isInSequence ) {
                // Override "IDLE" with "PLAYING" status since we're before or after an ad
                mediaStatus.playerState = StateManager.State.PLAYING;
                AppState.setState( StateManager.State.PLAYING );
            } else {
                showElement( LOGO_ID );
            }
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
    AppState.setState( StateManager.State.LOADING );
    AppLogger.log( "MediaManager", "onLoad" );
    if ( event && event.data ) {
        if ( !embedPlayerInitialized ) {
            AppLogger.log( "MediaManager", "Embed player isn't initialized yet. Starting dynamic embed.", event );
            embedPlayer( event );
        }
        else {
            var embedConfig = event.data.media.customData.embedConfig;
            // If same entry is sent then reload, else perform changeMedia
            if ( kdp.evaluate( '{mediaProxy.entry.id}' ) === embedConfig[ 'entryID' ] ) {
                AppLogger.log( "MediaManager", "Embed player already initialized with the same entry. Start replay.", event );
                kdp.sendNotification( "doReplay" );
            } else {
                AppLogger.log( "MediaManager", "Embed player already initialized with different entry. Change media.", event );
                kdp.sendNotification( "changeMedia", { "entryId": embedConfig[ 'entryID' ] } );
            }
        }
    }
}

function onEnded() {
    AppLogger.log( "MediaManager", "onEnded", { 'isInSequence': isInSequence } );
    // If ad is playing, do not perform onEnded, just broadcast your status
    if ( isInSequence ) {
        mediaManager.broadcastStatus( true );
    } else {
        mediaManager.onEndedOrig();
    }
}

// Receiver manager's events
function onReady() {
    AppLogger.log( "receiverManager", "Receiver is ready." );
    setLogo();
    showElement( LOGO_ID );
}

function onSenderConnected( event ) {
    AppLogger.log( "receiverManager", "Sender connected. Number of current senders: " + receiverManager.getSenders().length, event );
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
    //TODO: There's an issue for now that isVisible is always true
    if ( event.isVisible ) {
        // We're visible - resume playback
    } else {
        // We're not visible - pause playback
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
    var data = req.data;
    var embedInfo = data.media.customData.embedConfig;
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
                "flashvars": getFlashVars( data ),
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
 */
function addBindings() {
    // In case of ad plugin enabled, add bindings to support prerolls and postrolls
    if ( kdp.evaluate( '{doubleClick.plugin}' ) ) {

        kdp.kBind( "durationChange", function ( newDuration ) {
            var mediaInfo = mediaManager.getMediaInformation();
            if ( mediaInfo ) {
                mediaInfo.duration = newDuration;
                mediaManager.setMediaInformation( mediaInfo );
            }
        } );

        kdp.kBind( "preSequenceStart", function () {
            isInSequence = true;
        } );

        kdp.kBind( "postSequenceStart", function () {
            isInSequence = false;
        } );
    }
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

function getFlashVars( data ) {
    try {
        var senderFlashVars = data.media.customData.embedConfig.flashVars;

        // Embed media info params from onLoad event in mwEmbedChromecastReceiver
        receiverFlashVars.mediaProxy = { mediaPlayFrom: data.currentTime || 0 };
        receiverFlashVars.autoPlay = data.autoplay || true;

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

function setLogo() {
    var logoUrl = getQueryVariable( 'logoUrl' );
    if ( logoUrl ) {
        // Set partner's logo
        AppLogger.log( "receiver.js", "Displaying partner's splash screen.", { 'logoUrl': logoUrl } );
        $( "#" + LOGO_ID ).css( 'background-image', 'url(' + logoUrl + ')' );
    } else {
        // Set Kaltura's default logo
        AppLogger.log( "receiver.js", "Displaying Kaltura's splash screen." );
        $( "#" + LOGO_ID ).css( 'background-image', "url('assets/kalturalogo.png')" );
    }
}