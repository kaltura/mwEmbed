var ReceiverQueueManager = null;

$( window ).bind( 'onReceiverKDPReady', function ( event ) {
    ReceiverLogger.log( "ReceiverQueueManager", "event-->onReceiverKDPReady", { 'adsEnabled?': kdp.evaluate( '{doubleClick.plugin}' ) } );
    if ( ReceiverQueueManager.isQueueActive() ) {
        mediaElement.addEventListener( 'timeupdate', ReceiverQueueManager._onProgress.bind( ReceiverQueueManager ), false );
    }
} );

$( window ).bind( 'onReceiverReplay', function () {
    ReceiverLogger.log( "ReceiverQueueManager", "event-->onReceiverReplay" );
    if ( ReceiverQueueManager.isQueueActive() ) {
    }
} );

$( window ).bind( 'onReceiverChangeMedia', function ( event, withAds ) {
    ReceiverLogger.log( "ReceiverQueueManager", "event-->onReceiverChangeMedia", { "withAds": withAds } );
    if ( ReceiverQueueManager.isQueueActive() ) {
        ReceiverQueueManager.clearNextMediaMetadata();
    }
} );

function QueueManager() {
    this.CLASS_NAME = 'ReceiverQueueManager';
    this._init();
}

QueueManager.prototype = {
    isQueueActive: function () {
        return this._isQueueActive;
    },

    clearNextMediaMetadata: function () {
        this.isCountdownDisplayed = false;
        ReceiverStateManager.clearNextMediaMetadata();
    },

    mediaStatusCallbackSubscribe: function ( func ) {
        ReceiverLogger.log( this.CLASS_NAME, "mediaStatusCallbackSubscribe", func );
        this._adsMediaStatusCallback = func;
    },

    mediaStatusCallbackUnSubscribe: function () {
        ReceiverLogger.log( this.CLASS_NAME, "mediaStatusCallbackUnSubscribe" );
        this._adsMediaStatusCallback = null;
    },

    _init: function () {
        this.isCountdownDisplayed = false;
        this._isPlayingWithQueue = false;
        this._isQueueActive = false;
        this._adsMediaStatusCallback = null;

        mediaManager.onQueueLoadOrig = mediaManager.onQueueLoad.bind( mediaManager );
        mediaManager.onQueueLoad = this._onQueueLoad.bind( this );

        mediaManager.onQueueInsertOrig = mediaManager.onQueueInsert.bind( mediaManager );
        mediaManager.onQueueInsert = this._onQueueInsert.bind( this );

        mediaManager.onQueueRemoveOrig = mediaManager.onQueueRemove.bind( mediaManager );
        mediaManager.onQueueRemove = this._onQueueRemove.bind( this );

        mediaManager.onQueueEndedOrig = mediaManager.onQueueEnded.bind( mediaManager );
        mediaManager.onQueueEnded = this._onQueueEnded.bind( this );
    },

    _destroy: function () {
        mediaManager.customizedStatusCallback = mediaManager.customizedStatusCallbackOrig_ReceiverQueueManager;
        mediaElement.removeEventListener( 'timeupdate', this._onProgress );
        this._isQueueActive = false;
        this._isPlayingWithQueue = false;
    },

    _onQueueLoad: function ( event ) {
        ReceiverLogger.log( this.CLASS_NAME, "_onQueueLoad", event );

        this._isQueueActive = true;
        mediaManager.customizedStatusCallbackOrig_ReceiverQueueManager = mediaManager.customizedStatusCallback;
        mediaManager.customizedStatusCallback = this._customizedStatusCallback.bind( this );

        mediaManager.onQueueLoadOrig( event );
    },

    _onQueueInsert: function ( event ) {
        ReceiverLogger.log( this.CLASS_NAME, "_onQueueInsert", event );

        var insertedItem = event.data.items[ 0 ];
        if ( insertedItem.preloadTime !== 0 ) {
            event.data.items[ 0 ].preloadTime = 0;
        }
        ReceiverStateManager.toggleInsertRemoveFromQueue( 'insert', insertedItem.media.metadata.title, insertedItem.media.metadata.subtitle );

        mediaManager.onQueueInsertOrig( event );
    },

    _onQueueRemove: function ( event ) {
        ReceiverLogger.log( this.CLASS_NAME, "_onQueueRemove", event );

        var insertedItem = event.data.items[ 0 ].media;
        ReceiverStateManager.toggleInsertRemoveFromQueue( 'remove', insertedItem.media.metadata.title, insertedItem.media.metadata.subtitle );

        mediaManager.onQueueRemoveOrig( event );
    },

    _onQueueEnded: function ( event ) {
        ReceiverLogger.log( this.CLASS_NAME, "_onQueueEnded", event );
        this._destroy();
        mediaManager.onQueueEndedOrig( event );
    },

    _customizedStatusCallback: function ( mediaStatus ) {
        mediaStatus = this._adsMediaStatusCallback ? this._adsMediaStatusCallback( mediaStatus ) : mediaStatus;
        if ( this._isPlayingWithQueue ) {
            if ( mediaStatus.playerState === StateManager.State.IDLE ) {
                if ( mediaStatus.idleReason === 'FINISHED' || mediaStatus.idleReason === 'CANCELED' || mediaStatus.idleReason === 'INTERRUPTED' ) {
                    mediaStatus.idleReason = null;
                }
                mediaStatus.playerState = StateManager.State.PLAYING;
            }
        } else if ( mediaStatus.playerState === StateManager.State.PLAYING ) {
            this._isPlayingWithQueue = true;
        }
        ReceiverLogger.log( this.CLASS_NAME, "_customizedStatusCallback_" + this.CLASS_NAME + " - Returning sender playerState of: "
            + mediaStatus.playerState, mediaStatus );
        return mediaStatus;
    },

    _onProgress: function () {
        var countdown = Math.round( mediaElement.duration - mediaElement.currentTime );
        if ( (countdown <= 5 && !this.isCountdownDisplayed) && (!ReceiverAdsManager || !ReceiverAdsManager.isPlayingAd()) ) {
            this.isCountdownDisplayed = true;
            this._loadNextMediaMetadataOnScreen();
        }
    },

    _loadNextMediaMetadataOnScreen: function () {
        ReceiverLogger.log( this.CLASS_NAME, "_loadNextMediaMetadataOnScreen" );
        var mediaQueue = mediaManager.getMediaQueue();
        var nextItemIndex = this._getCurrentItemIndex() + 1;
        if ( nextItemIndex < mediaQueue.getLength() ) {
            var nextItemObj = mediaQueue.getItems()[ nextItemIndex ];
            var nextItemMetadata = nextItemObj.media.metadata;
            ReceiverUtils.loadMediaMetadata( nextItemMetadata, false ).then( function ( showPreview ) {
                ReceiverStateManager.onShowNextMediaMetadata( showPreview );
            } );
        }
    },

    _getCurrentItemIndex: function () {
        var mediaQueue = mediaManager.getMediaQueue();
        var currentItemId = mediaQueue.getCurrentItemId();
        var queueItems = mediaQueue.getItems();
        for ( var i = 0; i < mediaQueue.getLength(); i++ ) {
            var item = queueItems[ i ];
            if ( item.itemId === currentItemId ) {
                return i;
            }
        }
    }
};