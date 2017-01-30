/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
(function ( mw, $ ) {
    "use strict";

    mw.EmbedPlayerChromecast = {
        instanceOf: 'Chromecast',
        bindPostfix: '.ccPlayer',
        supports: {
            'playHead': true,
            'pause': true,
            'stop': true,
            'volumeControl': true
        },
        supportedPlugins: [ 'doubleClick', 'youbora', 'kAnalony', 'related', 'comScoreStreamingTag', 'watermark', 'heartbeat' ],
        seeking: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        autoPlay: true,
        vid: {
            'readyState': 1
        },
        remotePlayerMonitorId: null,
        castContext: null,
        castSession: null,
        remotePlayer: null,
        remotePlayerState: null,
        remotePlayerController: null,
        receiverName: null,
        remotePlayerEvents: [
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
            cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED,
            cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED
        ],
        MONITOR_RATE: 1000,
        LOCAL_PLAYER_STATE: {
            START: "start",
            LOAD: "load",
            PLAY: "play",
            PAUSE: "pause",
            END: "end"
        },
        REMOTE_PLAYER_STATE: {
            IDLE: 'IDLE',
            PLAYING: 'PLAYING',
            PAUSED: 'PAUSED',
            BUFFERING: 'BUFFERING',
            LOADING: 'LOADING'
        },

        setup: function ( readyCallback ) {
            mw.log( 'EmbedPlayerChromecast:: setup' );
            $.extend( this.vid, { 'pause': this.pause, 'play': this.play } );
            this.addBindings();
            readyCallback();
        },

        addBindings: function () {
            this.bindHelper( "switchAudioTrack", this.switchAudioTracks.bind( this ) );
            this.bindHelper( "selectClosedCaptions", this.switchTextTracks.bind( this ) );
        },

        /**** Tracks ****/

        switchAudioTracks: function ( e, data ) {
            mw.log( 'EmbedPlayerChromecast:: switchAudioTracks', data );
            var trackId = data.index + 1;
            var mediaSession = this.castSession.getMediaSession();
            var activeTrackIds = mediaSession.activeTrackIds || [];
            var tracks = mediaSession.media.tracks || [];
            var audioTracks = tracks.filter( function ( track ) {
                return track.type === chrome.cast.media.TrackType.AUDIO;
            } );
            var trackIdToRemove = null;
            var trackIdToAdd = null;
            $.each( audioTracks, function ( index, track ) {
                if ( track.trackId !== trackId && $.inArray( track.trackId, activeTrackIds ) > -1 ) {
                    trackIdToRemove = track.trackId;
                }
                else if ( track.trackId === trackId && $.inArray( track.trackId, activeTrackIds ) === -1 ) {
                    trackIdToAdd = track.trackId;
                }
            } );
            this.editTracksInfoRequest( mediaSession, activeTrackIds, trackIdToRemove, trackIdToAdd );
        },

        switchTextTracks: function ( e, label, language ) {
            mw.log( 'EmbedPlayerChromecast:: switchTextTracks', language );
            var mediaSession = this.castSession.getMediaSession();
            var activeTrackIds = mediaSession.activeTrackIds || [];
            var tracks = mediaSession.media.tracks || [];
            var textTracks = tracks.filter( function ( track ) {
                return track.type === chrome.cast.media.TrackType.TEXT;
            } );
            var trackIdToRemove = null;
            var trackIdToAdd = null;
            if ( label === "Off" ) {
                $.each( textTracks, function ( index, track ) {
                    if ( $.inArray( track.trackId, activeTrackIds ) > -1 ) {
                        trackIdToRemove = track.trackId;
                    }
                } );
            } else {
                $.each( textTracks, function ( index, track ) {
                    if ( track.language !== language && $.inArray( track.trackId, activeTrackIds ) > -1 ) {
                        trackIdToRemove = track.trackId;
                    }
                    else if ( track.language === language && $.inArray( track.trackId, activeTrackIds ) === -1 ) {
                        trackIdToAdd = track.trackId;
                    }
                } );
            }
            this.editTracksInfoRequest( mediaSession, activeTrackIds, trackIdToRemove, trackIdToAdd );
        },

        editTracksInfoRequest: function ( mediaSession, activeTrackIds, trackIdToRemove, trackIdToAdd ) {
            mw.log( 'EmbedPlayerChromecast:: editTracksInfoRequest', {
                trackIdToRemove: trackIdToRemove,
                trackIdToAdd: trackIdToAdd
            } );
            if ( trackIdToRemove ) {
                var index = activeTrackIds.indexOf( trackIdToRemove );
                if ( index > -1 ) {
                    activeTrackIds.splice( index, 1 );
                }
            }
            if ( trackIdToAdd ) {
                activeTrackIds.push( trackIdToAdd );
            }
            var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest( activeTrackIds );
            mediaSession.editTracksInfo( tracksInfoRequest,
                function () {
                    mw.log( "EmbedPlayerChromecast:: editTracksInfoRequest:: Track loaded successfully." );
                }, function () {
                    mw.log( "EmbedPlayerChromecast:: editTracksInfoRequest:: Track loaded failed." );
                } );
        },

        /**** Setup & Shutdown Sender ****/

        setupRemotePlayer: function ( remotePlayer, remotePlayerController, playbackParams ) {
            mw.log( "EmbedPlayerChromecast:: setupRemotePlayer", { 'playbackParams': playbackParams } );
            this.remotePlayerState = this.REMOTE_PLAYER_STATE.IDLE;
            this.remotePlayer = remotePlayer;
            this.remotePlayerController = remotePlayerController;
            this.castContext = cast.framework.CastContext.getInstance();
            this.castSession = this.castContext.getCurrentSession();
            this.receiverName = this.getReceiverName();
            if ( this.castSession.getSessionState() === cast.framework.SessionState.SESSION_RESUMED ) {
                if ( !this.remotePlayer.playerState ) {
                    // TODO : We need to handle refresh page in the middle of loading media
                } else {
                    this.onMediaLoaded();
                }
            } else {
                this.updateDuration( playbackParams.duration );
                this.updateCurrentTime( playbackParams.currentTime );
                this.setEmbedPlayerVolume( playbackParams.volume, true );
                this.loadMedia();
            }
        },

        shutdownRemotePlayer: function () {
            mw.log( "EmbedPlayerChromecast:: shutdownRemotePlayer" );
            this.removeRemotePlayerBindings();
            this.stopRemotePlayerMonitor();
            this.unbindHelper( "switchAudioTrack" );
            this.unbindHelper( "selectClosedCaptions" );
            this.remotePlayerController.stop();
            this.castSession.endSession( true );
        },

        /**** Remote Player Events ****/

        addRemotePlayerBindings: function () {
            var _this = this;
            $.each( _this.remotePlayerEvents, function ( index, remotePlayerEventType ) {
                _this.remotePlayerController.addEventListener( remotePlayerEventType,
                    _this.onRemotePlayerEvent.bind( _this ) );
            } );
        },

        removeRemotePlayerBindings: function () {
            var _this = this;
            $.each( _this.remotePlayerEvents, function ( index, remotePlayerEventType ) {
                _this.remotePlayerController.removeEventListener( remotePlayerEventType,
                    _this.onRemotePlayerEvent );
            } );
        },

        onRemotePlayerEvent: function ( remotePlayerEvent ) {
            if ( !this.remotePlayer ) {
                return;
            }
            mw.log( "EmbedPlayerChromecast:: onRemotePlayerEvent", remotePlayerEvent );
            switch ( remotePlayerEvent.type ) {
                case cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED:
                    this.onPlayerStateChanged();
                    break;
                case cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED:
                    this.onVolumeLevelChanged();
                    break;
                case cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED:
                    this.onIsMutedChanged();
                    break;
                case cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED:
                    this.onIsConnectedChanged();
                    break;
            }
        },

        onPlayerStateChanged: function () {
            mw.log( "EmbedPlayerChromecast:: RemotePlayerEventType -> onPlayerStateChanged:: " + this.remotePlayer.playerState );
            if ( this.remotePlayer.playerState === this.REMOTE_PLAYER_STATE.PAUSED ) {
                this.pause();
            } else if ( this.remotePlayer.playerState === this.REMOTE_PLAYER_STATE.PLAYING ) {
                this.play();
            }
        },

        onVolumeLevelChanged: function () {
            mw.log( "EmbedPlayerChromecast:: RemotePlayerEventType -> onVolumeLevelChanged: " + this.remotePlayer.volumeLevel );
            this.volume = this.remotePlayer.volumeLevel;
            this.setVolume( this.volume, true );
        },

        onIsMutedChanged: function () {
            mw.log( "EmbedPlayerChromecast:: RemotePlayerEventType -> onIsMutedChanged: " + this.remotePlayer.isMuted );
            this.toggleMute( this.remotePlayer.isMuted );
        },

        onIsConnectedChanged: function () {
            mw.log( "EmbedPlayerChromecast:: RemotePlayerEventType -> onIsConnectedChanged: " + this.remotePlayer.isConnected );
            if ( !this.remotePlayer.isConnected ) {
                this.removeRemotePlayerBindings();
                this.stopRemotePlayerMonitor();
                this.remotePlayerController.stop();
                this.castSession.endSession( true );
                this.triggerHelper( "castSessionEnded" );
            }
        },

        /**** Load Media ****/

        loadMedia: function () {
            mw.log( "EmbedPlayerChromecast:: loadMedia" );
            this.remotePlayerState = this.REMOTE_PLAYER_STATE.LOADING;
            var contentId = this.getSrc();
            var contentType = this.getSource().mimeType;
            // Setup media info
            var mediaInfo = new chrome.cast.media.MediaInfo( contentId, contentType );
            mediaInfo.streamType = this.isLive() ? chrome.cast.media.StreamType.LIVE : chrome.cast.media.StreamType.BUFFERED;
            mediaInfo.customData = { embedConfig: this.getEmbedConfig() };
            mediaInfo.metadata = this.getMediaMetadata();
            // Setup load request
            var loadRequest = new chrome.cast.media.LoadRequest( mediaInfo );
            loadRequest.autoplay = this.autoPlay;
            loadRequest.currentTime = this.getCurrentTime();
            mw.log( "EmbedPlayerChromecast:: loadMedia:: Load request sent", loadRequest );
            // Call load media
            this.castSession.loadMedia( loadRequest ).then(
                this.onMediaLoaded.bind( this ),
                this.launchError.bind( this )
            );
        },

        onMediaLoaded: function () {
            mw.log( "EmbedPlayerChromecast:: onMediaLoaded" );
            this.addRemotePlayerBindings();
            this.startRemotePlayerMonitor();
            this.updateScreen();
            this.updatePosterHTML();
        },

        monitorRemotePlayer: function () {
            var mediaSession = this.castSession.getMediaSession();
            if ( !mediaSession ) {
                return;
            }
            var customData = mediaSession.customData;
            var playerState = mediaSession.playerState;
            var idleReason = mediaSession.idleReason;
            var currentTime = mediaSession.getEstimatedTime();
            var duration = mediaSession.media.duration;
            this.updateSenderUi( playerState, idleReason );
            this.updateAdsUi( customData );
            this.updateCurrentTimeUi( currentTime );
            this.updateDurationUi( duration );
            this.updateScrubberUi();
        },

        startRemotePlayerMonitor: function () {
            mw.log( "EmbedPlayerChromecast:: startRemotePlayerMonitor" );
            this.stopRemotePlayerMonitor();
            this.remotePlayerMonitorId =
                setInterval( this.monitorRemotePlayer.bind( this ), this.MONITOR_RATE );
        },

        stopRemotePlayerMonitor: function () {
            if ( this.remotePlayerMonitorId !== null ) {
                mw.log( "EmbedPlayerChromecast:: stopRemotePlayerMonitor" );
                clearInterval( this.remotePlayerMonitorId );
                this.remotePlayerMonitorId = null;
            }
        },

        updateCurrentTimeUi: function ( currentTime ) {
            if ( currentTime > 0 ) {
                this.updateCurrentTime( currentTime );
            }
        },

        updateDurationUi: function ( duration ) {
            if ( duration > 0 ) {
                if ( duration !== this.getDuration() ) {
                    this.updateCurrentTime( 0 );
                }
                this.updateDuration( duration );
            }
        },

        updateAdsUi: function ( customData ) {
            if ( customData && customData.adsInfo ) {
                if ( customData.adsInfo.isPlayingAd ) {
                    this.hideSpinner();
                    this.disablePlayControls( [ 'playPauseBtn', 'chromecast', 'fullScreenBtn', 'volumeControl' ] );
                } else {
                    this.enablePlayControls();
                }
            }
        },

        updateSenderUi: function ( playerState, opt_idleReason ) {
            if ( !playerState ) {
                return null;
            }
            if ( playerState === this.REMOTE_PLAYER_STATE.PLAYING || playerState === this.REMOTE_PLAYER_STATE.PAUSED ) {
                this.hideSpinner();
            } else if ( playerState === this.REMOTE_PLAYER_STATE.BUFFERING ) {
                this.addPlayerSpinner();
            } else if ( playerState === this.REMOTE_PLAYER_STATE.IDLE && opt_idleReason === "FINISHED" ) {
                this.endPlayback();
            }
        },

        /**** Play ****/

        play: function () {
            mw.log( "EmbedPlayerChromecast:: play" );
            if ( this.currentState === this.LOCAL_PLAYER_STATE.START ||
                this.currentState === this.LOCAL_PLAYER_STATE.END ) {
                this.replay();
            } else {
                this.remotePlayerState = this.REMOTE_PLAYER_STATE.PLAYING;
                this.embedPlayerPlay();
                this.remotePlayerPlay();
            }
        },

        embedPlayerPlay: function () {
            $( this.vid ).trigger( "onplay" );
            this.parent_play();
            $( this ).trigger( "playing" );
        },

        remotePlayerPlay: function () {
            if ( this.remotePlayer && this.remotePlayer.isPaused ) {
                this.remotePlayerController.playOrPause();
            }
        },

        /**** Replay ****/

        replay: function () {
            mw.log( 'EmbedPlayerChromecast:: replay' );
            this.embedPlayerPlay();
            this.loadMedia();
        },

        /**** Pause ****/

        pause: function () {
            mw.log( "EmbedPlayerChromecast:: pause" );
            this.remotePlayerState = this.REMOTE_PLAYER_STATE.PAUSED;
            this.embedPlayerPause();
            this.remotePlayerPause();
        },

        embedPlayerPause: function () {
            $( this.vid ).trigger( "onpause" );
            this.parent_pause();
        },

        remotePlayerPause: function () {
            if ( this.remotePlayer && !this.remotePlayer.isPaused && this.remotePlayer.canPause ) {
                this.remotePlayerController.playOrPause();
            }
        },

        /**** Seek ****/

        /*
         doSeek: function () {
         // TODO
         },

         canSeek: function () {
         // TODO
         },
         */

        seek: function ( seekTime ) {
            mw.log( "EmbedPlayerChromecast:: seek:: " + seekTime );
            this.stopRemotePlayerMonitor();
            this.embedPlayerSeek( seekTime );
            this.remotePlayerSeek( seekTime );
            this.startRemotePlayerMonitor();
        },

        embedPlayerSeek: function ( seekTime ) {
            this.seeking = true;
            $( this.vid ).trigger( 'seek' );
            this.updateCurrentTime( seekTime );
            $( this ).trigger( 'seeked' );
            this.seeking = false;
        },

        remotePlayerSeek: function ( seekTime ) {
            if ( this.remotePlayer && this.remotePlayer.canSeek ) {
                this.remotePlayer.currentTime = seekTime;
                this.remotePlayerController.seek();
            }
        },

        /**** Volume ****/

        setPlayerElementVolume: function ( percent ) {
            mw.log( "EmbedPlayerChromecast:: set volume to " + percent );
            this.setEmbedPlayerVolume( percent );
            this.setRemotePlayerVolume( percent );
        },

        setEmbedPlayerVolume: function ( percent ) {
            if ( this.volume !== percent ) {
                this.volume = percent;
            }
        },

        setRemotePlayerVolume: function ( percent ) {
            if ( this.remotePlayer ) {
                this.remotePlayer.volumeLevel = percent;
                this.remotePlayerController.setVolumeLevel();
            }
        },

        /**** End Playback ****/

        endPlayback: function () {
            mw.log( "EmbedPlayerChromecast:: endPlayback" );
            this.remotePlayerState = this.REMOTE_PLAYER_STATE.IDLE;
            this.removeRemotePlayerBindings();
            this.stopRemotePlayerMonitor();
            this.updateCurrentTime( this.getDuration() );
            this.updateScrubberUi();
            this.clipDone();
        },

        clipDone: function () {
            mw.log( "EmbedPlayerChromecast:: clipDone" );
            if ( this.vid.mediaFinishedCallback ) {
                this.vid.mediaFinishedCallback();
                this.vid.mediaFinishedCallback = null;
            }
            $( this.vid ).trigger( "ended" );
            this.onClipDone();
        },

        /**** Getters & Setters ****/

        updateScrubberUi: function () {
            $( this ).trigger( 'updatePlayHeadPercent', [ this.getCurrentTime() / this.getDuration() ] );
        },

        // Current time
        getCurrentTime: function () {
            return this.currentTime;
        },

        updateCurrentTime: function ( currentTime ) {
            this.currentTime = currentTime;
            this.vid.currentTime = currentTime;
            $( this ).trigger( 'timeupdate' );
        },

        // Duration
        getDuration: function () {
            return this.duration;
        },

        updateDuration: function ( duration ) {
            this.vid.duration = duration;
            this.duration = duration;
            $( this ).trigger( 'durationChange', [ duration ] );
        },

        getReceiverName: function () {
            var appMetadata = this.castSession.getApplicationMetadata();
            return appMetadata.name || '';
        },

        getEmbedConfig: function () {
            var embedConfig = {
                'publisherID': this.kwidgetid.substr( 1 ),
                'uiconfID': this.kuiconfid,
                'entryID': this.kentryid,
                'flashVars': this.getFlashVars()
            };
            mw.log( "EmbedPlayerChromecast:: getEmbedConfig", embedConfig );
            return embedConfig;
        },

        getMediaMetadata: function () {
            //TODO: Do we need to get external image also?
            // TODO: Change to this.getKalturaThumbnailUrl() api
            var embedPlayerMetadata = this.kalturaPlayerMetaData;
            var mediaMetadata = new chrome.cast.media.MovieMediaMetadata();
            mediaMetadata.images = [ new chrome.cast.Image( this.poster || embedPlayerMetadata.thumbnailUrl ) ];
            mediaMetadata.title = embedPlayerMetadata.name || '';
            mediaMetadata.subtitle = embedPlayerMetadata.description || '';
            mw.log( "EmbedPlayerChromecast:: getMediaMetadata", mediaMetadata );
            return mediaMetadata;
        },

        getFlashVars: function () {
            mw.log( "EmbedPlayerChromecast:: getFlashVars" );
            var _this = this;
            var fv = {};
            this.supportedPlugins.forEach( function ( plugin ) {
                if ( !$.isEmptyObject( _this.getRawKalturaConfig( plugin ) ) ) {
                    fv[ plugin ] = _this.getRawKalturaConfig( plugin );
                }
            } );
            var proxyData = this.getProxyData();
            if ( proxyData ) {
                fv[ "proxyData" ] = proxyData;
            }
            if ( this.getFlashvars( "ks" ) ) {
                fv[ "ks" ] = this.getFlashvars( "ks" );
            }
            return fv;
        },

        getProxyData: function () {
            mw.log( "EmbedPlayerChromecast:: getProxyData" );
            var proxyData = mw.getConfig( "proxyData" );
            if ( proxyData ) {
                var _this = this;
                var recursiveIteration = function ( object ) {
                    for ( var property in object ) {
                        if ( object.hasOwnProperty( property ) ) {
                            if ( typeof object[ property ] == "object" ) {
                                recursiveIteration( object[ property ] );
                            } else {
                                object[ property ] = _this.evaluate( object[ property ] );
                            }
                        }
                    }
                };
                recursiveIteration( proxyData );
                return proxyData;
            } else {
                proxyData = this.getKalturaConfig( "originalProxyData" );
                if ( !$.isEmptyObject( proxyData ) ) {
                    if ( proxyData.data ) {
                        return proxyData.data;
                    } else {
                        return proxyData;
                    }
                }
            }
        },

        /**** UI handling ****/

        updateScreen: function () {
            mw.log( "EmbedPlayerChromecast:: updateScreen" );
            var _this = this;
            this.getInterface().find( ".chromecastScreen" ).remove();
            this.getVideoHolder().append( this.getPlayingScreen() );
            $( ".chromecastThumb" ).load( function () {
                setTimeout( function () {
                    _this.setPlayingScreen();
                }, 0 );
            } );
        },

        getPlayingScreen: function () {
            return '<div class="chromecastScreen" style="background-color: rgba(0,0,0,0.7); width: 100%; height: 100%; font-family: Arial; position: absolute">' +
                '<div class="chromecastPlayback">' +
                '<div class="chromecastThumbBorder">' +
                '<img class="chromecastThumb" src="' + this.poster + '"/></div> ' +
                '<div class="titleHolder">' +
                '<span class="chromecastTitle"></span><br>' +
                '<div><i class="icon-chromecast chromecastPlayingIcon chromecastPlaying"></i>' +
                '<span class="chromecastPlaying">' + gM( 'mwe-chromecast-playing' ) + '</span>' +
                '<span id="chromecastReceiverName" class="chromecastPlaying chromecastReceiverName"></span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        },

        setPlayingScreen: function () {
            var factor = $( ".chromecastThumb" ).naturalWidth() / $( ".chromecastThumb" ).naturalHeight();
            var thumbWidth = 116;
            $( ".chromecastThumb" ).width( thumbWidth );
            $( ".chromecastThumbBorder" ).width( thumbWidth );
            $( ".chromecastThumb" ).height( thumbWidth / factor );
            $( ".chromecastThumbBorder" ).height( thumbWidth / factor );
            var title = this.evaluate( '{mediaProxy.entry.name}' );
            $( ".chromecastTitle" ).text( this.kalturaPlayerMetaData.name );
            $( "#chromecastReceiverName" ).text( this.receiverName );
        },

        launchError: function ( errorCode ) {
            mw.log( "EmbedPlayerChromecast:: launchError" );
            this.triggerHelper( "chromecastError", errorCode );
        },

        //TODO: Those are leftovers from previous sender - do we really needs them?

        monitor: function () {
        },

        isInSequence: function () {
            return false;
        },

        getPlayerElementTime: function () {
            return this.currentTime;
        },

        isDVR: function () {
            return false;
        },

        backToLive: function () {
        },

        getPlayerElement: function () {
            return this.vid;
        },

        isVideoSiblingEnabled: function () {
            return false;
        },

        switchPlaySource: function ( source, switchCallback ) {
            this.vid.mediaLoadedCallback = switchCallback;
        },

        canAutoPlay: function () {
            return true;
        },

        changeMediaCallback: function ( callback ) {
            var _this = this;
            // Check if we have source
            if ( !this.getSource() ) {
                callback();
                return;
            }
            this.switchPlaySource( this.getSource(), function () {
                mw.setConfig( 'EmbedPlayer.KeepPoster', true );
                mw.setConfig( 'EmbedPlayer.HidePosterOnStart', false );
                setTimeout( function () {
                    _this.updatePosterHTML();
                }, 0 );
                callback();
            } );
        }
    };
})( mediaWiki, jQuery );
