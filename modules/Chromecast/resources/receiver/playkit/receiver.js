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
 * Promise for the embed player process.
 */
var embedPlayerPromise;

/**
 * Initialized the receiver with the relevant data before starting.
 */
function initReceiver() {
    // Take params out of the query string
    debugReceiver = ReceiverUtils.getQueryVariable( 'debugReceiver' );
    debugKalturaPlayer = ReceiverUtils.getQueryVariable( 'debugKalturaPlayer' );
    // Set the receiver debug mode
    ReceiverLogger = Logger.getInstance( debugReceiver );
    if ( debugReceiver ) {
        cast.receiver.logger.setLevelValue( cast.receiver.LoggerLevel.DEBUG );
    }
    ReceiverStateManager = new StateManager();
    ReceiverStateManager.setState( StateManager.State.LAUNCHING );
    // Take embed params out of the query string
    var uiConfId = ReceiverUtils.getQueryVariable( 'uiConfId' );
    var partnerId = ReceiverUtils.getQueryVariable( 'partnerId' );
    startEmbed( uiConfId, partnerId );
    ReceiverStateManager.setState( StateManager.State.IDLE );
    startReceiver();
}

/**
 * Loading the Kaltura player into the Chromecast device.
 * @param uiConfId
 * @param partnerId
 */
function startEmbed( uiConfId, partnerId ) {
    ReceiverLogger.log( "receiver.js", "Embed player isn't initialized yet. Starting dynamic embed.", {
        'uiConfId': uiConfId,
        'partnerId': partnerId
    } );
    embedPlayerPromise = $.Deferred();
    embedPlayerInitialized.setState( EmbedPhase.Started );
    var fullEmbedLoaderPath = ReceiverUtils.resolve( '../../../../../mwEmbedLoader.php', window.location.href );
    $.getScript( fullEmbedLoaderPath ).then( function () {
        setConfiguration();
        kWidget.embed( {
            "targetId": "kaltura_player",
            "wid": "_" + partnerId,
            "uiconf_id": uiConfId,
            "readyCallback": function ( playerID ) {
                kdp = document.getElementById( playerID );
                $( '#initial-video-element' ).remove();
                mediaElement = $( kdp ).contents().contents().find( 'video' )[ 0 ];
                mediaManager.setMediaElement( mediaElement );
                $( window ).trigger( "onReceiverKDPReady" );
                setMediaElementEvents();
                addBindings();
                embedPlayerPromise.resolve();
            },
            "flashvars": ReceiverFlashVars,
            "cache_st": 1438601385
        } );
    } );
}

/**
 * Starts the receiver application and opening a new session.
 */
function startReceiver() {
    // Init receiver manager and setting his events
    receiverManager = cast.receiver.CastReceiverManager.getInstance();
    receiverManager.onSenderConnected = onSenderConnected.bind( this );
    receiverManager.onSenderDisconnected = onSenderDisconnected.bind( this );

    // Init media manager and setting his events
    mediaManager = new cast.receiver.MediaManager( document.getElementById( 'initial-video-element' ) );

    mediaManager.onMediaStatusOrig = mediaManager.onMediaStatus.bind( mediaManager );
    mediaManager.onMediaStatus = onMediaStatus.bind( this );

    mediaManager.onEditTracksInfoOrig = mediaManager.onEditTracksInfo.bind( mediaManager );
    mediaManager.onEditTracksInfo = onEditTracksInfo.bind( this );

    mediaManager.onPauseOrig = mediaManager.onPause.bind( mediaManager );
    mediaManager.onPause = onPause.bind( this );

    mediaManager.onPlayOrig = mediaManager.onPlay.bind( mediaManager );
    mediaManager.onPlay = onPlay.bind( this );

    mediaManager.onLoadOrig = mediaManager.onLoad.bind( mediaManager );
    mediaManager.onLoad = onLoad.bind( this );

    mediaManager.onErrorOrig = mediaManager.onError.bind( mediaManager );
    mediaManager.onError = onError.bind( this );

    // Init message bus and setting his event
    messageBus = receiverManager.getCastMessageBus( 'urn:x-cast:com.kaltura.cast.player' );
    messageBus.onMessage = onMessage.bind( this );

    receiverManager.start();
}

/***** Media Manager Events *****/

/**
 * Override callback for media manager onError.
 */
function onError( error ) {
    ReceiverLogger.error( "MediaManager", "onError" );
    broadcastError( error );
    mediaManager.onErrorOrig( error );
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
    mediaManager.broadcastStatus( false );
}

/**
 * Override callback for media manager onPlay.
 */
function onPlay( event ) {
    ReceiverLogger.log( "MediaManager", "onPlay", event );
    kdp.sendNotification( "doPlay" );
}

/**
 * Override callback for media manager onLoad.
 */
function onLoad( event ) {
    ReceiverLogger.log( "MediaManager", "onLoad" );

    if ( !embedPlayerInitialized.is( EmbedPhase.Completed ) ) {
        configure( event.data.media.customData.receiverConfig );
        ReceiverStateManager.setState( StateManager.State.LOADING );
    }

    // Show media metadata when ready
    ReceiverUtils.loadMediaMetadata( event.data.media.metadata ).then( function ( showPreview ) {
        ReceiverStateManager.onShowMediaMetadata( showPreview );
    } );

    var embedConfig = event.data.media.customData.embedConfig;

    // Wait for the embed player process to finish
    embedPlayerPromise.then( function () {
        if ( !kdp.evaluate( '{mediaProxy.entry.id}' ) ) {
            embedPlayerInitialized.setState( EmbedPhase.Completed );

            var senderFlashVars = embedConfig.flashVars;
            var senderCurrentTime = event.data.currentTime;
            var senderAutoPlay = event.data.autoplay;

            if ( senderFlashVars && senderFlashVars.doubleClick && senderFlashVars.doubleClick.plugin ) {
                kdp.setKDPAttribute( 'doubleClick', 'adTagUrl', senderFlashVars.doubleClick.adTagUrl );
            }
            if ( $.isNumeric( senderCurrentTime ) ) {
                kdp.setKDPAttribute( 'mediaProxy', 'mediaPlayFrom', senderCurrentTime );
                if ( senderCurrentTime > 0 ) {
                    kdp.setKDPAttribute( 'doubleClick', 'adTagUrl', '' );
                }
            }
            if ( typeof senderAutoPlay === 'boolean' ) {
                kdp.setKDPAttribute( 'autoPlay', senderAutoPlay );
            }

            kdp.sendNotification( "changeMedia", {
                "entryId": embedConfig[ 'entryID' ],
                "proxyData": embedConfig[ 'flashVars' ] ? embedConfig[ 'flashVars' ][ 'proxyData' ] : undefined
            } );
        } else {
            // Reset progress bar
            ReceiverStateManager.onProgress( 0, 0 );

            // Rest mediaPlayFrom if needed
            kdp.setKDPAttribute( 'mediaProxy', 'mediaPlayFrom', 0 );

            // Set app state as idle
            ReceiverStateManager.setState( StateManager.State.IDLE );

            if ( kdp.evaluate( '{mediaProxy.entry.id}' ) === embedConfig[ 'entryID' ] ) {
                doReplay( embedConfig );
            } else {
                doChangeMedia( embedConfig );
            }
        }
    } );
}

/**
 * Configures the receiver configuration from the sender.
 */
function configure( config ) {
    if ( config ) {
        ReceiverLogger.log( "MediaManager", "configure", config );
        ReceiverStateManager.configure( config );
    }
}

/**
 * Replays the video on the same entry id.
 * @param embedConfig
 */
function doReplay( embedConfig ) {
    ReceiverLogger.log( "MediaManager", "Embed player already initialized with the same entry. Start replay.", embedConfig );
    $( window ).trigger( "onReceiverReplay" );
    kdp.sendNotification( "doReplay" );
}

/**
 * Change media with a different entry id.
 * @param embedConfig
 */
function doChangeMedia( embedConfig ) {
    ReceiverLogger.log( "MediaManager", "Embed player already initialized with different entry. Change media.", embedConfig );
    var adsPluginEnabledNext = !!(embedConfig.flashVars && embedConfig.flashVars.doubleClick && embedConfig.flashVars.doubleClick.adTagUrl !== '');
    var adsPluginEnabledNow = kdp.evaluate( '{doubleClick.plugin}' );

    if ( adsPluginEnabledNow && adsPluginEnabledNext ) {
        ReceiverLogger.log( "MediaManager", "doChangeMedia - before: ads, now: ads" );
        $( window ).trigger( "onReceiverChangeMedia", true );
        kdp.setKDPAttribute( 'doubleClick', 'adTagUrl', embedConfig.flashVars.doubleClick.adTagUrl );

    } else if ( !adsPluginEnabledNow && adsPluginEnabledNext ) {
        ReceiverLogger.log( "MediaManager", "doChangeMedia - before: no ads, now: ads" );
        // Seems that this scenario is not possible right now
        // Play without ads here also
        $( window ).trigger( "onReceiverChangeMedia", false );

    } else if ( adsPluginEnabledNow && !adsPluginEnabledNext ) {
        ReceiverLogger.log( "MediaManager", "doChangeMedia - before: ads, now: no ads" );
        $( window ).trigger( "onReceiverChangeMedia", false );
        kdp.setKDPAttribute( 'doubleClick', 'adTagUrl', '' );
    }
    kdp.sendNotification( "changeMedia", {
        "entryId": embedConfig[ 'entryID' ],
        "proxyData": embedConfig[ 'flashVars' ] ? embedConfig[ 'flashVars' ][ 'proxyData' ] : undefined
    } );
}

/***** Receiver Manager Events *****/

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
    } catch ( error ) {
        broadcastError( error );
    }
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

/**
 * Add bindings to the kdp.
 */
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

    kdp.kBind( "embedPlayerError", function ( error ) {
        broadcastError( error );
    } );

    kdp.kBind( "playing", function () {
        mediaManager.broadcastStatus( false );
    } );
}

/**
 * Sets the configuration for the embed player.
 */
function setConfiguration() {
    mw.setConfig( "EmbedPlayer.HidePosterOnStart", true );
    if ( debugKalturaPlayer ) {
        mw.setConfig( "debug", true );
    }
    mw.setConfig( "chromecastReceiver", true );
    mw.setConfig( "Kaltura.ExcludedModules", "chromecast" );
}

/**
 * Broadcasts an error object thorough the broadcastStatus API.
 * @param error
 */
function broadcastError( error ) {
    ReceiverLogger.error( "MediaManager", "broadcastError", error );
    mediaManager.broadcastStatus( false, null, { error: error } );
    ReceiverStateManager.setState( StateManager.State.IDLE );
}