var ReceiverQueueManager = null;

function QueueManager() {
    this.CLASS_NAME = 'ReceiverQueueManager';
    this._init();
}

QueueManager.prototype = {

    isQueueActive: function () {
        return this._isQueueActive;
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
        this._isQueueActive = false;
        this._isPlayingWithQueue = false;
        this._adsMediaStatusCallback = null;
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

        var removedItemId = event.data.itemIds[ 0 ];
        if ( mediaManager.getMediaQueue().getCurrentItemId() !== removedItemId ) {
            var removedItem = this._getItemById( removedItemId );
            if ( removedItem ) {
                ReceiverStateManager.toggleInsertRemoveFromQueue( 'remove', removedItem.media.metadata.title, removedItem.media.metadata.subtitle );
            }
        }
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

    _getItemById: function ( id ) {
        var mediaQueue = mediaManager.getMediaQueue();
        var queueItems = mediaQueue.getItems();
        for ( var i = 0; i < mediaQueue.getLength(); i++ ) {
            var item = queueItems[ i ];
            if ( item.itemId === id ) {
                return item;
            }
        }
        return null;
    }
};