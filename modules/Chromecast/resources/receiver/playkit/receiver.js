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
var AppLogger = Logger.getInstance();
/**
 * The application state manager.
 * @type {StateManager}
 */
var AppState = new StateManager();
/**
 * The id of the idle screen div.
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
 * Starts the receiver application and opening a new session.
 */
function startReceiver() {
    AppState.setState( StateManager.State.LAUNCHING );
    // Init receiver manager and setting his events
    receiverManager = cast.receiver.CastReceiverManager.getInstance();
    receiverManager.onReady = onReady.bind( this );
    receiverManager.onSenderConnected = onSenderConnected.bind( this );
    receiverManager.onSenderDisconnected = onSenderDisconnected.bind( this );

    // Init media manager and setting his events
    mediaManager = new cast.receiver.MediaManager( initialVidElement );
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
    if ( !embedPlayerInitialized ) {
        return null;
    }
    AppLogger.log( "MediaManager", "customizedStatusCallback", mediaStatus );
    if ( AppState.getState() !== mediaStatus.playerState ) {
        AppState.setState( mediaStatus.playerState );
        switch ( AppState.getState() ) {
            case StateManager.State.PLAYING:
                hideElement( LOGO_ID );
                break;
            case StateManager.State.IDLE:
                if ( allAdsCompleted ) {
                    showElement( LOGO_ID );
                } else {
                    mediaStatus.playerState = StateManager.State.PLAYING;
                    AppState.setState( StateManager.State.PLAYING );
                }
                break;
        }
    }
    AppLogger.log( "MediaManager", "Returning senders status of " + mediaStatus.playerState );
    return mediaStatus;
}

/**
 * Override callback for media manager onPause.
 */
function onPause( event ) {
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        AppLogger.log( "MediaManager", "onPause", event );
        kdp.sendNotification( 'doPause' );
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
}

/**
 * Override callback for media manager onSeek.
 */
function onSeek( event ) {
    if ( !kdp.evaluate( "{sequenceProxy.isInSequence}" ) ) {
        AppLogger.log( "MediaManager", "onSeek", event );
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
    if ( !embedPlayerInitialized ) {
        AppLogger.log( "MediaManager", "Embed player isn't initialized yet. Starting dynamic embed.", event );
        embedPlayer( event );
    }
    else {
        var media = event.data.media;
        var embedConfig = media.customData.embedConfig;
        loadMetadata( media );
        preloadMediaImages( media, function () {
            showPreviewMediaMetadata();
            // If same entry is sent then reload, else perform changeMedia
            if ( kdp.evaluate( '{mediaProxy.entry.id}' ) === embedConfig[ 'entryID' ] ) {
                AppLogger.log( "MediaManager", "Embed player already initialized with the same entry. Start replay.", event );
                kdp.sendNotification( "doReplay" );
            } else {
                AppLogger.log( "MediaManager", "Embed player already initialized with different entry. Change media.", event );
                kdp.sendNotification( "changeMedia", { "entryId": embedConfig[ 'entryID' ] } );
            }
        } );
    }
}

/**
 * Preloads media data that can be preloaded (usually images).
 * @param media
 * @param callback
 */
function preloadMediaImages( media, callback ) {
    var imagesToPreload = [];
    var counter = 0;
    var images = [];

    function imageLoaded() {
        if ( ++counter === imagesToPreload.length ) {
            callback();
        }
    }

    // Try to preload image metadata
    var thumbnailUrl = getMediaImageUrl( media );
    if ( thumbnailUrl ) {
        imagesToPreload.push( thumbnailUrl );
    }
    if ( imagesToPreload.length === 0 ) {
        callback();
    } else {
        for ( var i = 0; i < imagesToPreload.length; i++ ) {
            images[ i ] = new Image();
            images[ i ].src = imagesToPreload[ i ];
            images[ i ].onload = imageLoaded;
            images[ i ].onerror = imageLoaded;
        }
    }
}

/**
 * Loads the metadata for the given media.
 * @param media
 */
function loadMetadata( media ) {
    AppLogger.log( "MediaManager", "loadMetadata", media );
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
    }
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
function showPreviewMediaMetadata() {
    $( '.gradient, .overlay, .media-info' ).each( function () {
        $( this ).fadeIn();
    } );
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
    AppLogger.log( "receiverManager", "Receiver is ready." );

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

    /**
     * Sets the receiver's idle screen logo.
     * If a query string with a logoUrl key added to the
     * receiver application's url it will set it. Else,
     * it will set Kaltura logo.
     */
    var setLogo = function () {
        var logoUrl = getQueryVariable( 'logoUrl' );
        if ( logoUrl ) {
            // Set partner's logo
            AppLogger.log( "receiver.js", "Displaying partner's idle screen.", { 'logoUrl': logoUrl } );
            $( "#" + LOGO_ID ).css( 'background-image', 'url(' + logoUrl + ')' );
        } else {
            // Set Kaltura's default logo
            AppLogger.log( "receiver.js", "Displaying Kaltura's idle screen." );
            $( "#" + LOGO_ID ).css( 'background-image', "url('assets/kaltura_logo_small.png')" );
        }
    };

    setLogo();
    showElement( LOGO_ID );
}

/**
 * Override callback for receiver manager onSenderConnected.
 */
function onSenderConnected( event ) {
    AppLogger.log( "receiverManager", "Sender connected. Number of current senders: " + receiverManager.getSenders().length, event );
}

/**
 * Override callback for receiver manager onSenderDisconnected.
 */
function onSenderDisconnected( event ) {
    AppLogger.log( "receiverManager", "Sender disconnected. Number of current senders: " + receiverManager.getSenders().length, event );
    if ( receiverManager.getSenders().length === 0
        && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER ) {
        AppLogger.log( "receiverManager", "Last or only sender is disconnected, stops the app from running on the receiver." );
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
                    loadMetadata( media );
                    preloadMediaImages( media, function () {
                        showPreviewMediaMetadata();
                        /**
                         * Switching the initial video element to Kaltura's
                         * video element after the embed process finished.
                         */
                        var swapVideoElement = function () {
                            $( "#initial-video-element" ).remove();
                            mediaElement = $( kdp ).contents().contents().find( "video" )[ 0 ];
                            mediaManager.setMediaElement( mediaElement );
                        };
                        embedPlayerInitialized = true;
                        kdp = document.getElementById( playerID );
                        swapVideoElement();
                        if ( kdp.evaluate( '{doubleClick.plugin}' ) ) {
                            addAdsBindings();
                        }
                    } );
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
        mw.setConfig( "debugTarget", "kdebug" );
        mw.setConfig( "autoScrollDebugTarget", true );
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
        } else if ( typeof senderFlashVars === 'object' ) {
            return extend( receiverFlashVars, senderFlashVars );
        }
        else if ( typeof senderFlashVars === 'string' ) {
            return extend( receiverFlashVars, JSON.parse( senderFlashVars ) );
        }
    }
    catch ( e ) {
        return receiverFlashVars;
    }
}

/**
 * Hides DOM element from the receiver application UI.
 * @param id
 */
function hideElement( id ) {
    AppLogger.log( "receiver.js", "Hiding element with id: " + id );
    $( "#" + id ).fadeOut();
}

/**
 * Shows DOM element on the receiver application UI.
 * @param id
 */
function showElement( id ) {
    AppLogger.log( "receiver.js", "Showing element with id: " + id );
    $( "#" + id ).fadeIn();
}