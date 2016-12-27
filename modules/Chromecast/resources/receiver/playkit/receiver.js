/**
 * Promise for loading metadata process.
 */
var loadMetadataPromise;
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
 * Indicates whether the embed player already been initialized and in what phase of the initialization is in.
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
 * Indicates if we're running in debug mode for the Kaltura player.
 * @type {boolean}
 */
var debugKalturaPlayer;
/**
 * The Kaltura player.
 * @type {object}
 */
var kdp;
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
 * Indicates whether an ad plugin is enabled.
 */
var adsPluginEnabled;
/**
 * The ad info object which sent on media status update to all senders.
 * @type {{adsBreakInfo: Array, isPlayingAd: boolean}}
 */
var adsInfo = {
    adsBreakInfo: [],
    isPlayingAd: false
};
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
 * The receiver's embed player flashvars.
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
    "audioSelector": { 'plugin': false },
    "sourceSelector": { 'plugin': false },
    "closedCaptions": { 'plugin': false },
    "largePlayBtn": { 'plugin': false },
    "mediaProxy": { "mediaPlayFrom": 0 },
    "autoPlay": true
};
/**
 * The application logger.
 */
var ReceiverLogger;
/**
 * The application state manager.
 * @type {StateManager}
 */
var ReceiverStateManager;
/**
 * The possible messages that sender can send to receiver
 * on the message bus and their callbacks.
 * @type {object}
 */
var MessageBusMap = {
    'onEditBitratesInfo': function ( payload ) {
        ReceiverLogger.log( "MessageBus", "onEditBitratesInfo", payload );
        var mediaInfo = mediaManager.getMediaInformation();
        if ( !mediaInfo || !mediaInfo.tracks || mediaInfo.tracks.length === 0
            || event.data.activeBitratesIds.length === 0 ) {
            return;
        }
        var tracks = mediaInfo.tracks;
        var activeBitratesIds = event.data.activeBitratesIds;
        kdp.sendNotification( "switchSrc", {
            type: 'bitrates',
            activeBitratesIds: activeBitratesIds,
            tracks: tracks
        } );
    }
};

/**
 * Initialized the receiver with the relevant data before starting.
 */
function initReceiver() {
    // Take params out of the query string
    debugReceiver = getQueryVariable( 'debugReceiver' );
    debugKalturaPlayer = getQueryVariable( 'debugKalturaPlayer' );
    // Set the receiver debug mode
    ReceiverLogger = Logger.getInstance( debugReceiver );
    if ( debugReceiver ) {
        cast.receiver.logger.setLevelValue( cast.receiver.LoggerLevel.DEBUG );
    }
    ReceiverStateManager = new StateManager();
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

    mediaManager.onMediaStatusOrig = mediaManager.onMediaStatus.bind( mediaManager );
    mediaManager.onMediaStatus = onMediaStatus.bind( this );

    mediaManager.onEditTracksInfoOrig = mediaManager.onEditTracksInfo.bind( mediaManager );
    mediaManager.onEditTracksInfo = onEditTracksInfo.bind( this );

    mediaManager.onEndedOrig = mediaManager.onEnded.bind( mediaManager );
    mediaManager.onEnded = onEnded.bind( this );

    mediaManager.onPauseOrig = mediaManager.onPause.bind( mediaManager );
    mediaManager.onPause = onPause.bind( this );

    mediaManager.onPlayOrig = mediaManager.onPlay.bind( mediaManager );
    mediaManager.onPlay = onPlay.bind( this );

    mediaManager.onLoadOrig = mediaManager.onLoad.bind( mediaManager );
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
    if ( isIdle && !allAdsCompleted ) {
        mediaStatus.playerState = StateManager.State.PLAYING;
    }
    return mediaStatus;
}

/**
 * Override callback for media manager onMediaStatus.
 */
function onMediaStatus( mediaStatus ) {
    if ( mediaStatus ) {
        ReceiverLogger.log( "MediaManager", "onMediaStatus" );
        var playerState = mediaStatus.playerState;
        var appState = ReceiverStateManager.getState();
        var stateChanged = (playerState !== appState);
        var isIdle = (playerState === StateManager.State.IDLE);
        var isIdleBecauseOfLoading = isIdle && (typeof mediaStatus.extendedStatus !== "undefined");
        if ( !isIdleBecauseOfLoading && stateChanged ) {
            ReceiverStateManager.setState( playerState );
        }
        mediaManager.onMediaStatusOrig( mediaStatus );
    }
}

/**
 * Override callback for media manager onEditTracksInfo.
 */
function onEditTracksInfo( event ) {
    ReceiverLogger.log( "MediaManager", "onEditTracksInfo", event.data );
    var mediaInfo = mediaManager.getMediaInformation();
    if ( !mediaInfo || !mediaInfo.tracks || mediaInfo.tracks.length === 0
        || event.data.activeTrackIds.length === 0 ) {
        return;
    }
    mediaManager.onEditTracksInfoOrig( event );
    var activeTrackIds = event.data.activeTrackIds;
    var tracks = mediaInfo.tracks;
    kdp.sendNotification( "switchSrc", {
        type: 'tracks',
        activeTrackIds: activeTrackIds,
        tracks: tracks,
        handler: ReceiverStateManager.onEditTracks.bind( ReceiverStateManager )
    } );
}

/**
 * Override callback for media manager onPause.
 */
function onPause( event ) {
    ReceiverLogger.log( "MediaManager", "onPause", event );
    kdp.sendNotification( "doPause" );
    mediaManager.broadcastStatus( true, event.data.requestId );
}

/**
 * Override callback for media manager onPlay.
 */
function onPlay( event ) {
    ReceiverLogger.log( "MediaManager", "onPlay", event );
    kdp.sendNotification( "doPlay" );
    kdp.kBind( "playing", function () {
        mediaManager.broadcastStatus( true, event.data.requestId );
    } );
}

/**
 * Override callback for media manager onLoad.
 */
function onLoad( event ) {
    ReceiverLogger.log( "MediaManager", "onLoad" );
    ReceiverStateManager.setState( StateManager.State.LOADING );
    loadMetadataPromise = loadMediaMetadata( event.data.media );
    if ( embedPlayerInitialized.is( EmbedPhase.Pending ) ) {
        ReceiverLogger.log( "MediaManager", "Embed player isn't initialized yet. Starting dynamic embed.", event );
        embedPlayerInitialized.setState( EmbedPhase.Started );
        embedPlayer( event );
    } else {
        var embedConfig = event.data.media.customData.embedConfig;
        loadMetadataPromise.then( function ( showPreview ) {
            ReceiverStateManager.onShowMediaMetadata( showPreview );
            // If same entry is sent then reload, else perform changeMedia
            if ( kdp.evaluate( '{mediaProxy.entry.id}' ) === embedConfig[ 'entryID' ] ) {
                ReceiverLogger.log( "MediaManager", "Embed player already initialized with the same entry. Start replay.", event );
                kdp.sendNotification( "doReplay" );
            } else {
                ReceiverLogger.log( "MediaManager", "Embed player already initialized with different entry. Change media.", event );
                kdp.sendNotification( "changeMedia", { "entryId": embedConfig[ 'entryID' ] } );
            }
        } );
    }
}

/**
 * Loads the metadata for the given media.
 * @param media
 */
function loadMediaMetadata( media ) {
    ReceiverLogger.log( "MediaManager", "loadMediaMetadata", media.metadata );
    var deferred = $.Deferred();
    var metadata = media.metadata;
    if ( metadata ) {
        $( '#cast-title' ).text( metadata.title ? metadata.title : '' );
        $( '#cast-subtitle' ).text( metadata.subtitle ? metadata.subtitle : '' );
        var imageUrl = getMediaImageUrl( media );
        var mediaArtwork = $( '#cast-artwork' );
        if ( imageUrl ) {
            mediaArtwork.css( 'background-image', 'url("' + imageUrl.replace( /"/g, '\\"' ) + '")' );
            preloadMediaImages( media ).then( function () {
                deferred.resolve( true );
            } );
        } else {
            mediaArtwork.css( 'background-color', '#424242' );
            var img = $( '<img>' )
                .css( { 'position': 'relative', 'top': '25%', 'left': '10%' } )
                .attr( 'src', 'assets/media-placeholder.png' )
                .appendTo( mediaArtwork );
            deferred.resolve( true );
        }
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
    ReceiverLogger.log( "MediaManager", "preloadMediaImages", media.metadata.images );
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
    var images = metadata.images || [];
    return images && images[ 0 ] && images[ 0 ][ 'url' ];
}

/**
 * Override callback for media manager onEnded.
 */
function onEnded() {
    ReceiverLogger.log( "MediaManager", "onEnded" );
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
    ReceiverLogger.log( "MessageBus", "onMessage" );
    try {
        var payload = JSON.parse( event.data );
        var msgType = payload.type;
        MessageBusMap[ msgType ]( payload );
    }
    catch ( e ) {
        ReceiverLogger.error( "MessageBus", e.message );
    }
}

/**
 * Loading the embed player to the Chromecast device.
 * @param event
 */
function embedPlayer( event ) {
    ReceiverLogger.log( "MediaManager", "embedPlayer", event.data.media.customData.embedConfig );
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
                    loadMetadataPromise.then( function ( showPreview ) {
                        ReceiverStateManager.onShowMediaMetadata( showPreview );
                    } );
                    kdp = document.getElementById( playerID );
                    $( '#initial-video-element' ).remove();
                    mediaElement = $( kdp ).contents().contents().find( 'video' )[ 0 ];
                    mediaManager.setMediaElement( mediaElement );
                    adsPluginEnabled = kdp.evaluate( '{doubleClick.plugin}' );
                    setMediaElementEvents();
                    addBindings();
                    embedPlayerInitialized.setState( EmbedPhase.Completed );
                },
                "flashvars": getFlashVars( event.data.currentTime, event.data.autoplay, embedInfo.flashVars ),
                "cache_st": 1438601385,
                "entry_id": embedInfo.entryID
            } );
        } );
}

function addBindings() {
    kdp.kBind( "onTracksParsed", function ( tracksInfo ) {
        mediaManager.loadTracksInfo( tracksInfo );
        var mediaInfo = mediaManager.getMediaInformation();
        if ( mediaInfo ) {
            mediaInfo.tracks = tracksInfo.tracks;
            mediaManager.setMediaInformation( mediaInfo );
            mediaManager.broadcastStatus( true );
        }
    } );
    if ( adsPluginEnabled ) {
        addAdsBindings();
    }
}
/**
 * Sets the required bindings to the Kaltura player in case of ads are enabled.
 * Supporting only prerolls and postrolls (no midrolls).
 */
function addAdsBindings() {
    // If ad plugin enabled, sets this flag to false
    allAdsCompleted = false;

    kdp.kBind( "onCuePointsRevealed", function ( cuePoints ) {
        var adsBreakOrig = JSON.parse( cuePoints );
        for ( var i = 0; i < adsBreakOrig.length; i++ ) {
            var adBreak = adsBreakOrig[ i ];
            switch ( adBreak ) {
                case 0:
                    adsInfo.adsBreakInfo.push( adBreak );
                    break;
                case -1:
                    var mediaInfo = mediaManager.getMediaInformation();
                    if ( mediaInfo && mediaInfo.duration ) {
                        adsInfo.adsBreakInfo.push( mediaInfo.duration );
                    }
                    break;
                default:
                    break;
            }
        }
        mediaManager.broadcastStatus( false, null, { adsInfo: adsInfo } );
    } );

    /**
     * Bind the kdp to the relevant ads events
     */
    kdp.kBind( "durationChange", function ( event ) {
        var mediaInfo = mediaManager.getMediaInformation();
        if ( mediaInfo ) {
            mediaInfo.duration = event.newValue;
            mediaManager.setMediaInformation( mediaInfo );
        }
    } );

    kdp.kBind( "adErrorEvent", function () {
        ReceiverLogger.error( "kdp", "adErrorEvent" );
    } );

    kdp.kBind( "onAdPlay", function () {
        adsInfo.isPlayingAd = true;
        mediaManager.broadcastStatus( false, null, { adsInfo: adsInfo } );
    } );

    // Pre sequence handling
    kdp.kBind( "preSequenceStart", function () {
        ReceiverStateManager.onShowMediaMetadata( false );
    } );

    kdp.kBind( "preSequenceComplete", function () {
        adsInfo.isPlayingAd = false;
        mediaManager.broadcastStatus( false, null, { adsInfo: adsInfo } );
    } );

    // Post sequence handling
    kdp.kBind( "postSequenceStart", function () {
        postSequenceStart = true;
    } );

    kdp.kBind( "postSequenceComplete", function () {
        adsInfo.isPlayingAd = false;
        mediaManager.broadcastStatus( false, null, { adsInfo: adsInfo } );
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
    if ( embedInfo.debugKalturaPlayer || debugKalturaPlayer ) {
        mw.setConfig( "debug", true );
    }
    mw.setConfig( "chromecastReceiver", true );
    mw.setConfig( "Kaltura.ExcludedModules", "chromecast" );
}

/**
 * Merge between the receiver's constant flashvars and the flashvars
 * that been sent from the sender who opened the session.
 * The sender usually will need to send ks or proxyData.
 * The sender can override playFrom and autoPlay flashvars.
 * @param senderPlayFrom
 * @param senderAutoPlay
 * @param senderFlashVars
 * @returns object
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
        if ( pair[ 0 ] === variable ) {
            return (pair[ 1 ] ? pair[ 1 ] === 'true' : true);
        }
    }
    return false;
}

/**
 * Sets the necessary events for the media element.
 * Done for UI handling.
 */
function setMediaElementEvents() {
    mediaElement.addEventListener( 'canplay', onCanPlay.bind( this ), false );
    mediaElement.addEventListener( 'timeupdate', onProgress.bind( this ), false );
    mediaElement.addEventListener( 'seeking', onSeekStart.bind( this ), false );
    mediaElement.addEventListener( 'seeked', onSeekEnd.bind( this ), false );
}

/**
 * Handles the first time that media has start to play.
 */
function onCanPlay() {
    ReceiverStateManager.onCanPlay();
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