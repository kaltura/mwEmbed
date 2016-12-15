/**
 * The embed process phases.
 * @type {{Pending: number, Started: number, Completed: number}}
 */
var EmbedPhase = {
    Pending: 0,
    Started: 1,
    Completed: 2
};
/**
 * Indicates whether the embed player already been initialized
 * and in what phase of the initialization is in.
 * @type {object}
 */
var embedPlayerInitialized = {
    phase: EmbedPhase.Pending,
    setState: function ( phase ) {
        this.phase = phase;
    },
    is: function ( phase ) {
        return this.phase === phase;
    }
};
/**
 * Indicates if we're running in debug mode for the receiver.
 * @type {boolean}
 */
var debugReceiver;
/**
 * Indicates if we're running in debug mode for the kaltura player.
 * @type {boolean}
 */
var debugKalturaPlayer;
/**
 * The Kaltura player.
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
 * The Google cast message bus.
 * Using to pass custom messages from sender to receiver.
 */
var messageBus;
/**
 * The Kaltura video element.
 */
var mediaElement;
/**
 * Indicator to know when all ads completed.
 * Will be called according to the adTagUrl.
 * For example:
 * If the adTagUrl contains only prerolls it will be called in the end of pre sequence.
 * If the adTagUrl contains only postrolls it will be called in the end of post sequence.
 * If the adTagUrl contains both prerolls & postrolls it will be called in the end of post sequence.
 * @type {boolean}
 */
var allAdsCompleted = true;
/**
 * Indicator to know when post sequence start to play (postrolls).
 * It's because we need to know when to call onEnded explicitly.
 * For example:
 * In the scenario of just prerolls, onAllAdsCompleted event will be called
 * before the content has start to play. In that case, we don't want to
 * call onEnded explicitly because it will then shutdown the receiver application.
 * To make a long story short, the only scenarios we will want to call onEnded explicitly
 * are when we playing postrolls.
 * @type {boolean}
 */
var postSequenceStart = false;
/**
 * The application logger.
 */
var ReceiverLogger;
/**
 * The application state manager.
 * @type {StateManager}
 */
var ReceiverStateManager = new StateManager();
/**
 * The possible messages that sender can send to receiver
 * on the message bus and their callbacks.
 * @type {object}
 */
var MessageBusMap = {
    //TODO: will be implemented after integration with the senders SDK v3
    'someMessage': function ( payload ) {
        // Write here the implementation to that message
    }
};

/**
 * Initialized the receiver with the relevant data before starting.
 */
function initReceiver() {
    // Take params out of the query string
    debugReceiver = (getQueryVariable( 'debugReceiver' ) === 'true');
    debugKalturaPlayer = (getQueryVariable( 'debugKalturaPlayer' ) === 'true');

    // Set the receiver debug mode
    ReceiverLogger = Logger.getInstance( debugReceiver );
    if ( debugReceiver ) {
        cast.receiver.logger.setLevelValue( cast.receiver.LoggerLevel.DEBUG );
    }

    // Init DOM elements in state manager
    ReceiverStateManager.init();
}

/**
 * Starts the receiver application and opening a new session.
 */
function startReceiver() {
    ReceiverStateManager.setState( StateManager.State.LAUNCHING );
    // Init receiver manager and setting his events
    receiverManager = cast.receiver.CastReceiverManager.getInstance();
    receiverManager.onReady = onReady.bind( this );
    receiverManager.onSenderConnected = onSenderConnected.bind( this );
    receiverManager.onSenderDisconnected = onSenderDisconnected.bind( this );

    // Init media manager and setting his events
    mediaManager = new cast.receiver.MediaManager( document.getElementById( 'initial-video-element' ) );
    mediaManager.customizedStatusCallback = customizedStatusCallback.bind( this );

    mediaManager.onMediaStatusOrig = mediaManager.onMediaStatus;
    mediaManager.onMediaStatus = onMediaStatus.bind( this );

    mediaManager.onMetadataLoadedOrig = mediaManager.onMetadataLoaded;
    mediaManager.onMetadataLoaded = onMetadataLoaded.bind( this );

    mediaManager.onEndedOrig = mediaManager.onEnded;
    mediaManager.onEnded = onEnded.bind( this );

    mediaManager.onPauseOrig = mediaManager.onPause;
    mediaManager.onPause = onPause.bind( this );

    mediaManager.onPlayOrig = mediaManager.onPlay;
    mediaManager.onPlay = onPlay.bind( this );

    mediaManager.onSeekOrig = mediaManager.onSeek;
    mediaManager.onSeek = onSeek.bind( this );

    mediaManager.onLoadOrig = mediaManager.onLoad;
    mediaManager.onLoad = onLoad.bind( this );

    // Init message bus and setting his event
    messageBus = receiverManager.getCastMessageBus( 'urn:x-cast:com.kaltura.cast.player' );
    messageBus.onMessage = onMessage.bind( this );

    receiverManager.start();
}

/***** Media Manager Events *****/

/**
 * Override callback for media manager customizedStatusCallback.
 */
function customizedStatusCallback( mediaStatus ) {
    ReceiverLogger.log( "MediaManager", "customizedStatusCallback", mediaStatus );
    var playerState = mediaStatus.playerState;
    var isIdle = (playerState === StateManager.State.IDLE);
    var isIdleBecauseOfFinished = (mediaStatus.idleReason === "FINISHED");
    var idleBecauseOfLoading = (typeof mediaStatus.extendedStatus !== "undefined");
    // If its idle because of loading state do not return status update
    if ( idleBecauseOfLoading ) {
        return null;
    } else {
        if ( isIdle && isIdleBecauseOfFinished && !allAdsCompleted ) {
            mediaStatus.playerState = StateManager.State.PLAYING;
        }
        return mediaStatus;
    }
}

function onMediaStatus( mediaStatus ) {
    if ( mediaStatus ) {
        ReceiverLogger.log( "MediaManager", "onMediaStatus" );
        var playerState = mediaStatus.playerState;
        var appState = ReceiverStateManager.getState();
        var stateChanged = (playerState !== appState);
        var idleBecauseOfLoading = (typeof mediaStatus.extendedStatus !== "undefined");
        if ( !idleBecauseOfLoading && stateChanged ) {
            ReceiverStateManager.setState( playerState );
        }
    }
}

function onMetadataLoaded( loadInfo ) {
    ReceiverLogger.log( "MediaManager", "onMetadataLoaded" );
    loadMediaMetadata( loadInfo.message.media ).then( function ( showPreview ) {
        showPreviewMediaMetadata( showPreview );
    } );
    mediaManager.onMetadataLoadedOrig( loadInfo );
}

/**
 * Override callback for media manager onPause.
 */
function onPause( event ) {
    ReceiverLogger.log( "MediaManager", "onPause", event );
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        kdp.sendNotification( 'doPause' );
        mediaManager.broadcastStatus( true );
    } else {
        ReceiverLogger.log( "MediaManager", "Preventing pause during ad!!!", event );
    }
}

/**
 * Override callback for media manager onPlay.
 */
function onPlay( event ) {
    ReceiverLogger.log( "MediaManager", "onPlay", event );
    kdp.sendNotification( "doPlay" );
}

/**
 * Override callback for media manager onSeek.
 */
function onSeek( event ) {
    ReceiverLogger.log( "MediaManager", "onSeek", event );
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        mediaManager.onSeekOrig( event );
    } else {
        ReceiverLogger.log( "MediaManager", "Preventing seek during ad!!!", event );
    }
}

/**
 * Override callback for media manager onLoad.
 */
function onLoad( event ) {
    ReceiverLogger.log( "MediaManager", "onLoad" );
    ReceiverStateManager.setState( StateManager.State.LOADING );

    if ( embedPlayerInitialized.is( EmbedPhase.Pending ) ) {
        ReceiverLogger.log( "MediaManager", "Embed player isn't initialized yet. Starting dynamic embed.", event );
        embedPlayerInitialized.setState( EmbedPhase.Started );
        embedPlayer( event );
    }
    else {
        var embedConfig = event.data.media.customData.embedConfig;
        // If same entry is sent then reload, else perform changeMedia
        if ( kdp.evaluate( '{mediaProxy.entry.id}' ) === embedConfig[ 'entryID' ] ) {
            ReceiverLogger.log( "MediaManager", "Embed player already initialized with the same entry. Start replay.", event );
            kdp.sendNotification( "doReplay" );
        } else {
            ReceiverLogger.log( "MediaManager", "Embed player already initialized with different entry. Change media.", event );
            kdp.sendNotification( "changeMedia", { "entryId": embedConfig[ 'entryID' ] } );
        }
    }
}

/**
 * Loads the metadata for the given media.
 * @param media
 * @param doneFunc
 */
function loadMediaMetadata( media ) {
    ReceiverLogger.log( "MediaManager", "loadMediaMetadata", media );
    var deferred = $.Deferred();
    var metadata = media.metadata;
    if ( metadata ) {
        $( '#cast-title' ).text( metadata.title );
        $( '#cast-subtitle' ).text( metadata.subtitle );

        var imageUrl = getMediaImageUrl( media );
        var mediaArtwork = $( '#cast-artwork' );
        mediaArtwork.css( 'background-image', (imageUrl ? 'url("' + imageUrl.replace( /"/g, '\\"' ) + '")' : 'none') );
        mediaArtwork.css( 'display', (imageUrl ? '' : 'none') );

        preloadMediaImages( media ).then( function () {
            deferred.resolve( true );
        } );
    } else {
        deferred.resolve( false );
    }
    return deferred.promise();
}

/**
 * Preloads media data that can be preloaded (usually images).
 * @param media
 */
function preloadMediaImages( media ) {
    ReceiverLogger.log( "MediaManager", "preloadMediaImages" );
    var deferred = $.Deferred();
    var imagesToPreload = [];
    var counter = 0;
    var images = [];

    function imageLoaded() {
        if ( ++counter === imagesToPreload.length ) {
            deferred.resolve();
        }
    }

    // Try to preload image metadata
    var thumbnailUrl = getMediaImageUrl( media );
    if ( thumbnailUrl ) {
        imagesToPreload.push( thumbnailUrl );
    }
    if ( imagesToPreload.length === 0 ) {
        deferred.resolve();
    } else {
        for ( var i = 0; i < imagesToPreload.length; i++ ) {
            images[ i ] = new Image();
            images[ i ].src = imagesToPreload[ i ];
            images[ i ].onload = imageLoaded;
            images[ i ].onerror = imageLoaded;
        }
    }
    return deferred.promise();
}

/**
 * Returns the image url for the given media object.
 * @param media
 * @returns {*|Array}
 */
function getMediaImageUrl( media ) {
    var metadata = media.metadata || {};
    var images = metadata[ 'images' ] || [];
    return images && images[ 0 ] && images[ 0 ][ 'url' ];
}

/**
 * Display the media metadata UI on screen.
 */
function showPreviewMediaMetadata( showPreview ) {
    if ( showPreview ) {
        $( '#cast-media-info' ).fadeIn();
        $( '#cast-before-play-controls' ).fadeIn();
    }
}

/**
 * Override callback for media manager onEnded.
 */
function onEnded() {
    if ( allAdsCompleted ) {
        mediaManager.onEndedOrig();
    } else {
        mediaManager.broadcastStatus( true );
    }
}

/***** Receiver Manager Events *****/

/**
 * Override callback for receiver manager onReady.
 */
function onReady() {
    ReceiverLogger.log( "ReceiverManager", "Receiver is ready." );
    ReceiverStateManager.setState( StateManager.State.IDLE );
}

/**
 * Override callback for receiver manager onSenderConnected.
 */
function onSenderConnected( event ) {
    ReceiverLogger.log( "ReceiverManager", "Sender connected. Number of current senders: " + receiverManager.getSenders().length, event );
}

/**
 * Override callback for receiver manager onSenderDisconnected.
 */
function onSenderDisconnected( event ) {
    ReceiverLogger.log( "ReceiverManager", "Sender disconnected. Number of current senders: " + receiverManager.getSenders().length, event );
    if ( receiverManager.getSenders().length === 0
        && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER ) {
        ReceiverLogger.log( "ReceiverManager", "Last or only sender is disconnected, stops the app from running on the receiver." );
        receiverManager.stop();
    }
}

/**
 * Message Bus onMessage callback.
 * Will be called after one of the senders sent
 * some message through the custom channel.
 * @param event
 */
function onMessage( event ) {
    ReceiverLogger.log( "MessageBus", "onMessage", event );
    try {
        var payload = JSON.parse( event.data );
        var msgType = payload.type;
        MessageBusMap[ msgType ]( payload );
    }
    catch ( e ) {
        ReceiverLogger.error( "MessageBus", e.message, event );
    }
}

/**
 * Loading the embed player to the Chromecast device.
 * @param event
 */
function embedPlayer( event ) {
    var embedInfo = event.data.media.customData.embedConfig;
    var embedLoaderLibPath = embedInfo.lib ? embedInfo.lib + "mwEmbedLoader.php" : "../../../../../mwEmbedLoader.php";
    $.getScript( embedLoaderLibPath )
        .then( function () {
            setConfiguration( embedInfo );
            kWidget.embed( {
                "targetId": "kaltura_player",
                "wid": "_" + embedInfo.publisherID,
                "uiconf_id": embedInfo.uiconfID,
                "readyCallback": function ( playerID ) {
                    kdp = document.getElementById( playerID );
                    $( '#initial-video-element' ).remove();
                    mediaElement = $( kdp ).contents().contents().find( 'video' )[ 0 ];
                    mediaManager.setMediaElement( mediaElement );
                    setMediaElementEvents();
                    if ( kdp.evaluate( '{doubleClick.plugin}' ) ) {
                        addAdsBindings();
                    }
                    embedPlayerInitialized.setState( EmbedPhase.Completed );
                },
                "flashvars": getFlashVars( event.data.currentTime, event.data.autoplay, embedInfo.flashVars ),
                "cache_st": 1438601385,
                "entry_id": embedInfo.entryID || ''
            } );
        } );
}

/**
 * Sets the required bindings to the Kaltura player in case of ads are enabled.
 * Supporting only prerolls and postrolls (no midrolls).
 */
function addAdsBindings() {
    // If ad plugin enabled, sets this flag to false
    allAdsCompleted = false;

    // Bind the kdp to the relevant events
    kdp.kBind( "durationChange", function ( newDuration ) {
        var mediaInfo = mediaManager.getMediaInformation();
        if ( mediaInfo ) {
            mediaInfo.duration = newDuration;
            mediaManager.setMediaInformation( mediaInfo );
        }
    } );

    kdp.kBind( "postSequenceStart", function () {
        postSequenceStart = true;
    } );

    kdp.kBind( "onAllAdsCompleted", function () {
        allAdsCompleted = true;
        if ( postSequenceStart ) {
            onEnded();
        }
    } );
}

/**
 * Sets the configuration for the embed player.
 * @param embedInfo
 */
function setConfiguration( embedInfo ) {
    mw.setConfig( "EmbedPlayer.HidePosterOnStart", true );
    if ( embedInfo.debugKalturaPlayer == true || debugKalturaPlayer ) {
        mw.setConfig( "debug", true );
    }
    mw.setConfig( "chromecastReceiver", true );
    mw.setConfig( "Kaltura.ExcludedModules", "chromecast" );
}

/**
 * The receiver's embed player flashvars.
 * @type {{dash: {plugin: boolean}, multiDrm: {plugin: boolean}, embedPlayerChromecastReceiver: {plugin: boolean}, chromecast: {plugin: boolean}, playlistAPI: {plugin: boolean}, controlBarContainer: {hover: boolean}, volumeControl: {plugin: boolean}, titleLabel: {plugin: boolean}, fullScreenBtn: {plugin: boolean}, scrubber: {plugin: boolean}, largePlayBtn: {plugin: boolean}, mediaProxy: {mediaPlayFrom: number}, autoPlay: boolean}}
 */
var receiverFlashVars = {
    "dash": { 'plugin': false },
    "multiDrm": { 'plugin': false },
    "embedPlayerChromecastReceiver": { 'plugin': true },
    "chromecast": { 'plugin': false },
    "playlistAPI": { 'plugin': false },
    "controlBarContainer": { 'hover': false },
    "volumeControl": { 'plugin': false },
    "titleLabel": { 'plugin': false },
    "fullScreenBtn": { 'plugin': false },
    "scrubber": { 'plugin': false },
    "largePlayBtn": { 'plugin': false },
    "mediaProxy": { "mediaPlayFrom": 0 },
    "autoPlay": true
};

/**
 * Merge between the receiver's constant flashvars and the flashvars
 * that been sent from the sender who opened the session.
 * The sender usually will need to send ks or proxyData.
 * The sender can override playFrom and autoPlay flashvars.
 * @param senderPlayFrom
 * @param senderAutoPlay
 * @param senderFlashVars
 * @returns {{dash: {plugin: boolean}, multiDrm: {plugin: boolean}, embedPlayerChromecastReceiver: {plugin: boolean}, chromecast: {plugin: boolean}, playlistAPI: {plugin: boolean}, controlBarContainer: {hover: boolean}, volumeControl: {plugin: boolean}, titleLabel: {plugin: boolean}, fullScreenBtn: {plugin: boolean}, scrubber: {plugin: boolean}, largePlayBtn: {plugin: boolean}, mediaProxy: {mediaPlayFrom: number}, autoPlay: boolean}}
 */
function getFlashVars( senderPlayFrom, senderAutoPlay, senderFlashVars ) {

    var extend = function ( a, b ) {
        for ( var key in b )
            if ( b.hasOwnProperty( key ) )
                a[ key ] = b[ key ];
        return a;
    };

    try {
        // Embed the media info params from onLoad event into mwEmbedChromecastReceiver
        if ( $.isNumeric( senderPlayFrom ) ) {
            receiverFlashVars.mediaProxy.mediaPlayFrom = senderPlayFrom;
        }
        if ( typeof senderAutoPlay === 'boolean' ) {
            receiverFlashVars.autoPlay = senderAutoPlay;
        }
        if ( !senderFlashVars ) {
            return receiverFlashVars;
        } else if ( typeof senderFlashVars === 'string' ) {
            senderFlashVars = JSON.parse( senderFlashVars );
        }
        return extend( receiverFlashVars, senderFlashVars );
    }
    catch ( e ) {
        return receiverFlashVars;
    }
}

/**
 * Gets the value from the url's query string.
 * @param variable the key in the query string.
 * @returns {*}
 */
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

/**
 * Sets the necessary events for the media element.
 * Done for UI handling.
 */
function setMediaElementEvents() {
    mediaElement.addEventListener( 'timeupdate', onProgress.bind( this ), false );
    mediaElement.addEventListener( 'seeking', onSeekStart.bind( this ), false );
    mediaElement.addEventListener( 'seeked', onSeekEnd.bind( this ), false );
}

/**
 * Update the progress bar UI.
 */
function onProgress() {
    ReceiverStateManager.onProgress( mediaElement.currentTime, mediaElement.duration );
}

/**
 * Update the seek start state screen.
 */
function onSeekStart() {
    ReceiverStateManager.onSeekStart();
}

/**
 * Update the seek end state screen.
 */
function onSeekEnd() {
    ReceiverStateManager.onSeekEnd();
}