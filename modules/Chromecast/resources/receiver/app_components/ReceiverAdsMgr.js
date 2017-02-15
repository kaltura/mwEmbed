var ReceiverAdsManager = null;

$( window ).bind( 'onReceiverKDPReady', function ( event ) {
    ReceiverLogger.log( "ReceiverAdsManager", "event-->onReceiverKDPReady", { 'adsEnabled?': kdp.evaluate( '{doubleClick.plugin}' ) } );
    if ( kdp.evaluate( '{doubleClick.plugin}' ) ) {
        ReceiverAdsManager = new AdsManager();
    }
} );

$( window ).bind( 'onReceiverReplay', function () {
    ReceiverLogger.log( "ReceiverAdsManager", "event-->onReceiverReplay" );
    if ( ReceiverAdsManager ) {
        ReceiverAdsManager.destroy();
    }
} );

$( window ).bind( 'onReceiverChangeMedia', function ( event, withAds ) {
    ReceiverLogger.log( "ReceiverAdsManager", "event-->onReceiverChangeMedia", { "withAds": withAds } );
    if ( ReceiverAdsManager ) {
        ReceiverAdsManager.destroy();
    }
    if ( withAds ) {
        ReceiverAdsManager = new AdsManager();
    }
} );

function AdsManager() {
    this.CLASS_NAME = 'ReceiverAdsManager';
    this._init();
}

AdsManager.prototype = {

    /**
     * Destroy the ads manager.
     */
    destroy: function () {
        ReceiverLogger.log( this.CLASS_NAME, "destroy" );
        /**
         * Return all the original implementations of media manager.
         * @type {*}
         */
        mediaManager.customizedStatusCallback = mediaManager.customizedStatusCallbackOrig_ReceiverAdsManager;
        mediaManager.onEnded = mediaManager.onEndedOrig;
        mediaManager.onPause = mediaManager.onPauseOrig;

        /**
         * Unbind kdp from all ads specific events.
         */
        kdp.kUnbind( "onCuePointsRevealed" );
        kdp.kUnbind( "durationChange" );
        kdp.kUnbind( "adErrorEvent" );
        kdp.kUnbind( "onAdPlay" );
        kdp.kUnbind( "preSequenceStart" );
        kdp.kUnbind( "preSequenceComplete" );
        kdp.kUnbind( "postSequenceStart" );
        kdp.kUnbind( "postSequenceComplete" );
        kdp.kUnbind( "onAllAdsCompleted" );

        ReceiverAdsManager = null;
    },

    /**
     * Returns whether the receiver playing an ad.
     * @returns {boolean}
     */
    isPlayingAd: function () {
        return this.adsInfo.isPlayingAd;
    },

    /**
     * Init the ads manager.
     * @private
     */
    _init: function () {
        ReceiverLogger.log( this.CLASS_NAME, "_init" );
        /**
         * The ad info object which sent on media status update to all senders.
         * @type {{adsBreakInfo: Array, isPlayingAd: boolean}}
         */
        this.adsInfo = { adsBreakInfo: [], isPlayingAd: false };
        /**
         * Indicator to know when all ads completed.
         * Will be called according to the adTagUrl.
         * For example:
         * If the adTagUrl contains only prerolls it will be called in the end of pre sequence.
         * If the adTagUrl contains only postrolls it will be called in the end of post sequence.
         * If the adTagUrl contains both prerolls & postrolls it will be called in the end of post sequence.
         * @type {boolean}
         */
        this.allAdsCompleted = false;
        /**
         * Indicator to know when post sequence starts to play (postrolls).
         * It's because we need to know when to call onEnded explicitly.
         * For example:
         * In the scenario of just prerolls, onAllAdsCompleted event will be called
         * before the content has start to play. In that case, we don't want to
         * call onEnded explicitly because it will then shutdown the receiver application.
         * To make a long story short, the only scenarios we will want to call onEnded explicitly
         * are when we playing postrolls.
         * @type {boolean}
         */
        this.postSequenceStart = false;
        /**
         * Indicates when the receiver has start to play for the first time when ads are enabled.
         * @type {boolean}
         */
        this.startPlayingWithAds = false;

        /**
         * Override all the necessary events of mediaManager to support IMA plugin on Chromecast.
         * @type {*}
         */
        mediaManager.customizedStatusCallbackOrig_ReceiverAdsManager = mediaManager.customizedStatusCallback;
        mediaManager.customizedStatusCallback = this._customizedStatusCallback.bind( this );

        mediaManager.onEndedOrig = mediaManager.onEnded.bind( mediaManager );
        mediaManager.onEnded = this._onEnded.bind( this );

        mediaManager.onPauseOrig = mediaManager.onPause;
        mediaManager.onPause = this._onPause.bind( this );

        /**
         * Bind to the kdp ads specific events.
         */
        kdp.kBind( "onCuePointsRevealed", this._onCuePointsRevealed.bind( this ) );
        kdp.kBind( "durationChange", this._onDurationChange.bind( this ) );
        kdp.kBind( "adErrorEvent", this._onAdErrorEvent.bind( this ) );
        kdp.kBind( "onAdPlay", this._onAdPlay.bind( this ) );
        kdp.kBind( "preSequenceStart", this._onPreSequenceStart.bind( this ) );
        kdp.kBind( "preSequenceComplete", this._onPreSequenceComplete.bind( this ) );
        kdp.kBind( "postSequenceStart", this._onPostSequenceStart.bind( this ) );
        kdp.kBind( "postSequenceComplete", this._onPostSequenceComplete.bind( this ) );
        kdp.kBind( "onAllAdsCompleted", this._onAllAdsCompleted.bind( this ) );
    },

    /**
     * Override callback for media manager customizedStatusCallback.
     * @param mediaStatus
     * @returns mediaStatus
     * @private
     */
    _customizedStatusCallback: function ( mediaStatus ) {
        if ( !mediaStatus.customData ) {
            mediaStatus.customData = {};
        }
        var isIdle = mediaStatus.playerState === StateManager.State.IDLE;
        if ( this.startPlayingWithAds ) {
            if ( mediaStatus.customData.forceStatus ) {
                mediaStatus.playerState = mediaStatus.customData.forceStatus;
            } else if ( isIdle && !this.allAdsCompleted ) {
                mediaStatus.playerState = StateManager.State.PLAYING;
            }
            // TODO: Remove this workaround when Google will handle the remotePlayer issue
            // TODO: https://code.google.com/p/google-cast-sdk/issues/detail?id=1104&q=remotePlayer
            /* -----> */
            else if ( isIdle && this.allAdsCompleted && mediaStatus.idleReason ) {
                if ( mediaStatus.idleReason === 'FINISHED' || mediaStatus.idleReason == 'CANCELED' || mediaStatus.idleReason == 'INTERRUPTED' ) {
                    mediaStatus.idleReason = null;
                }
                if ( mediaManager.getMediaQueue() ) {
                    mediaStatus.playerState = StateManager.State.PLAYING;
                }
            }
            /* <----- */
        } else if ( mediaStatus.playerState === StateManager.State.PLAYING ) {
            this.startPlayingWithAds = true;
        }
        mediaStatus.customData.adsInfo = this.adsInfo;
        ReceiverLogger.log( this.CLASS_NAME, "_customizedStatusCallback - Returning sender playerState of: " + mediaStatus.playerState, mediaStatus );
        return mediaStatus;
    },

    /**
     * Override callback for media manager onEnded.
     * @private
     */
    _onEnded: function () {
        ReceiverLogger.log( this.CLASS_NAME, "_onEnded", { 'allAdsCompleted': this.allAdsCompleted } );
        if ( this.allAdsCompleted ) {
            mediaManager.onEndedOrig();
        } else {
            mediaManager.broadcastStatus( false );
        }
    },

    /**
     * Override callback for media manager onPause.
     * @param event
     * @private
     */
    _onPause: function ( event ) {
        ReceiverLogger.log( this.CLASS_NAME, "_onPause", event );
        kdp.sendNotification( "doPause" );
        if ( this.adsInfo.isPlayingAd ) {
            // We have an issue that if sender pause in middle of an ad it sending the wrong status (PLAYING)
            // We need to understand the root cause
            mediaManager.broadcastStatus( false, null, {
                forceStatus: StateManager.State.PAUSED
            } );
        } else {
            mediaManager.broadcastStatus( false );
        }
    },

    /**
     * Handles the ads cue point which ima plugin revealed.
     * @param cuePoints
     * @private
     */
    _onCuePointsRevealed: function ( cuePoints ) {
        var adsBreakOrig = JSON.parse( cuePoints );
        ReceiverLogger.log( this.CLASS_NAME, "_onCuePointsRevealed", adsBreakOrig );
        for ( var i = 0; i < adsBreakOrig.length; i++ ) {
            var adBreak = adsBreakOrig[ i ];
            switch ( adBreak ) {
                case 0:
                    this.adsInfo.adsBreakInfo.push( adBreak );
                    break;
                case -1:
                    var mediaInfo = mediaManager.getMediaInformation();
                    if ( mediaInfo ) {
                        if ( mediaInfo.duration ) {
                            this.adsInfo.adsBreakInfo.push( Math.round( duration ) );
                        } else {
                            kdp.kBind( "receiverContentPlay", function ( contentDuration ) {
                                this.adsInfo.adsBreakInfo.push( Math.round( contentDuration ) );
                                mediaManager.broadcastStatus( false );
                                kdp.kUnbind( "receiverContentPlay" );
                            }.bind( this ) );
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        mediaManager.broadcastStatus( false );
    },

    /**
     * Handles the change of duration on the video element.
     * @param event
     * @private
     */
    _onDurationChange: function ( event ) {
        var mediaInfo = mediaManager.getMediaInformation();
        if ( mediaInfo ) {
            ReceiverLogger.log( this.CLASS_NAME, "_onDurationChange", { 'newDuration': event.newValue } );
            mediaInfo.duration = event.newValue;
            mediaManager.setMediaInformation( mediaInfo );
            mediaManager.broadcastStatus( true );
        }
    },

    /**
     * Dispatch when error occurred when trying to play an ad.
     * @private
     */
    _onAdErrorEvent: function () {
        ReceiverLogger.error( this.CLASS_NAME, "_onAdErrorEvent" );
    },

    /**
     * Dispatch when ad starts to play.
     * @private
     */
    _onAdPlay: function () {
        ReceiverLogger.log( this.CLASS_NAME, "_onAdPlay, isPlayingAd=true" );
        this.adsInfo.isPlayingAd = true;
        mediaManager.broadcastStatus( false );
    },

    /**
     * Dispatch when pre sequence of ads starts.
     * @private
     */
    _onPreSequenceStart: function () {
        ReceiverStateManager.onShowMediaMetadata( false );
    },

    /**
     * Dispatch when pre sequence of ads completed.
     * @private
     */
    _onPreSequenceComplete: function () {
        ReceiverLogger.log( this.CLASS_NAME, "_onPreSequenceComplete, isPlayingAd=false" );
        this.adsInfo.isPlayingAd = false;
        mediaManager.broadcastStatus( false );
    },

    /**
     * Dispatch when post sequence of ads starts.
     * @private
     */
    _onPostSequenceStart: function () {
        this.postSequenceStart = true;
    },

    /**
     * Dispatch when post sequence of ads completed.
     * @private
     */
    _onPostSequenceComplete: function () {
        ReceiverLogger.log( this.CLASS_NAME, "_onPostSequenceComplete, isPlayingAd=false" );
        this.adsInfo.isPlayingAd = false;
        mediaManager.broadcastStatus( false );
    },

    /**
     * Dispatch when all ads completed to play.
     * @private
     */
    _onAllAdsCompleted: function () {
        this.allAdsCompleted = true;
        if ( this.postSequenceStart ) {
            this._onEnded();
        }
    }
};