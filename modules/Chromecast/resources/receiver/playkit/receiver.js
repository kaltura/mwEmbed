/**
 * Indicates whether the embed player already been initialized.
 * @type {boolean}
 */
var embedPlayerInitialized = false;
/**
 * Indicates if we're running in debug mode.
 * @type {boolean}
 */
var debugMode = false;
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
var AppLogger = Logger.getInstance( debugMode );
/**
 * The application state manager.
 * @type {StateManager}
 */
var AppState = new StateManager();
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
 * Starts the receiver application and opening a new session.
 */
function startReceiver() {
    if ( debugMode ) {
        cast.receiver.logger.setLevelValue( cast.receiver.LoggerLevel.DEBUG );
    }
    // Init receiver manager and setting his events
    receiverManager = cast.receiver.CastReceiverManager.getInstance();
    receiverManager.onReady = onReady.bind( this );
    receiverManager.onSenderConnected = onSenderConnected.bind( this );
    receiverManager.onSenderDisconnected = onSenderDisconnected.bind( this );

    // Init media manager and setting his events
    mediaManager = new cast.receiver.MediaManager( document.getElementById( 'initial-video-element' ) );
    mediaManager.customizedStatusCallback = customizedStatusCallback.bind( this );

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
 * In the next phases we will fully customize our application state here.
 */
function customizedStatusCallback( mediaStatus ) {
    AppLogger.log( "MediaManager", "customizedStatusCallback", mediaStatus );
    if ( mediaStatus.extendedStatus ) {
        mediaStatus.playerState = mediaStatus.extendedStatus.playerState;
    }
    if ( AppState.getState() !== mediaStatus.playerState ) {
        if ( mediaStatus.playerState !== StateManager.State.IDLE ) {
            AppState.setState( mediaStatus.playerState );
        } else if ( mediaStatus.idleReason === "FINISHED" ) {
            if ( !allAdsCompleted ) {
                mediaStatus.playerState = StateManager.State.PLAYING;
            }
            AppState.setState( mediaStatus.playerState );
        }
    }
    AppLogger.log( "MediaManager", "Returning senders status of " + mediaStatus.playerState );
    return mediaStatus;
}

/**
 * Override callback for media manager onPause.
 */
function onPause( event ) {
    AppLogger.log( "MediaManager", "onPause", event );
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        kdp.sendNotification( 'doPause' );
        mediaManager.broadcastStatus( true );
    } else {
        AppLogger.log( "MediaManager", "Preventing pause during ad!!!", event );
    }
}

/**
 * Override callback for media manager onPlay.
 */
function onPlay( event ) {
    AppLogger.log( "MediaManager", "onPlay", event );
    kdp.sendNotification( "doPlay" );
    mediaManager.broadcastStatus( true );
}

/**
 * Override callback for media manager onSeek.
 */
function onSeek( event ) {
    AppLogger.log( "MediaManager", "onSeek", event );
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        mediaManager.onSeekOrig( event );
    } else {
        AppLogger.log( "MediaManager", "Preventing seek during ad!!!", event );
    }
}

/**
 * Override callback for media manager onLoad.
 */
function onLoad( event ) {
    AppLogger.log( "MediaManager", "onLoad" );
    AppState.setState( StateManager.State.LOADING );

    loadMediaMetadata( event.data.media ).then( function ( showPreview ) {
        showPreviewMediaMetadata( showPreview );
    } );

    if ( !embedPlayerInitialized ) {
        AppLogger.log( "MediaManager", "Embed player isn't initialized yet. Starting dynamic embed.", event );
        embedPlayer( event );
    }
    else {
        var embedConfig = media.customData.embedConfig;
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

/**
 * Loads the metadata for the given media.
 * @param media
 * @param doneFunc
 */
function loadMediaMetadata( media ) {
    AppLogger.log( "MediaManager", "loadMediaMetadata", media );
    var deferred = $.Deferred();
    var metadata = media.metadata;
    if ( media.metadata ) {
        var titleElement = receiverWrapper.querySelector( '.media-title' );
        titleElement.innerText = metadata.title;

        var subtitleElement = receiverWrapper.querySelector( '.media-subtitle' );
        subtitleElement.innerText = metadata.subtitle;

        var imageUrl = getMediaImageUrl( media );
        var artworkElement = receiverWrapper.querySelector( '.media-artwork' );
        artworkElement.style.backgroundImage = (imageUrl ? 'url("' + imageUrl.replace( /"/g, '\\"' ) + '")' : 'none');
        artworkElement.style.display = (imageUrl ? '' : 'none');

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
    AppLogger.log( "MediaManager", "preloadMediaImages" );
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
        $( '#media-area' ).fadeIn();
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
    AppLogger.log( "ReceiverManager", "Receiver is ready." );
    AppState.setState( StateManager.State.LAUNCHING );
}

/**
 * Override callback for receiver manager onSenderConnected.
 */
function onSenderConnected( event ) {
    AppLogger.log( "ReceiverManager", "Sender connected. Number of current senders: " + receiverManager.getSenders().length, event );
}

/**
 * Override callback for receiver manager onSenderDisconnected.
 */
function onSenderDisconnected( event ) {
    AppLogger.log( "ReceiverManager", "Sender disconnected. Number of current senders: " + receiverManager.getSenders().length, event );
    if ( receiverManager.getSenders().length === 0
        && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER ) {
        AppLogger.log( "ReceiverManager", "Last or only sender is disconnected, stops the app from running on the receiver." );
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
    AppLogger.log( "MessageBus", "onMessage", event );
    try {
        var payload = JSON.parse( event.data );
        var msgType = payload.type;
        MESSAGE_BUS_MAP[ msgType ]( payload );
    }
    catch ( e ) {
        AppLogger.error( "MessageBus", e.message, event );
    }
}

/**
 * Loading the embed player to the Chromecast device.
 * @param event
 */
function embedPlayer( event ) {
    var media = event.data.media;
    var embedInfo = media.customData.embedConfig;
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
                    mediaElement = $( kdp ).contents().contents().find( "video" )[ 0 ];
                    mediaManager.setMediaElement( mediaElement );
                    $( "#initial-video-element" ).remove();
                    if ( kdp.evaluate( '{doubleClick.plugin}' ) ) {
                        addAdsBindings();
                    }
                },
                "flashvars": getFlashVars( event.data.currentTime, event.data.autoplay, embedInfo.flashVars ),
                "cache_st": 1438601385,
                "entry_id": embedInfo.entryID
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
    if ( embedInfo.debugKalturaPlayer == true ) {
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
    "controlBarContainer": { 'hover': true },
    "volumeControl": { 'plugin': false },
    "titleLabel": { 'plugin': true },
    "fullScreenBtn": { 'plugin': false },
    "scrubber": { 'plugin': true },
    "largePlayBtn": { 'plugin': true },
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
        if ( senderPlayFrom ) {
            receiverFlashVars.mediaProxy.mediaPlayFrom = senderPlayFrom;
        }
        if ( senderAutoPlay ) {
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