(function ( mw, $ ) {

    "use strict";

    // Add Chromecast player:
    $( mw ).bind( 'EmbedPlayerUpdateMediaPlayers', function ( event, mediaPlayers ) {
        var chromecastSupportedProtocols = [ 'video/h264', 'video/mp4', 'application/vnd.apple.mpegurl' ];
        var chromecastReceiverPlayer = new mw.MediaPlayer( 'chromecastReceiver', chromecastSupportedProtocols, 'ChromecastReceiver' );
        mediaPlayers.addPlayer( chromecastReceiverPlayer );
    } );

    mw.EmbedPlayerChromecastReceiver = {
        // Instance name:
        instanceOf: 'ChromecastReceiver',
        bindPostfix: '.embedPlayerChromecastReceiver',
        // List of supported features:
        supports: {
            'playHead': true,
            'pause': true,
            'stop': true,
            'volumeControl': true,
            'overlays': true
        },
        seeking: false,
        triggerReplayEvent: false, // since native replay is not supported in the Receiver, we use this flag to send a replay event to Analytics
        currentTime: 0,
        nativeEvents: [
            'loadstart',
            'progress',
            'suspend',
            'abort',
            'error',
            'emptied',
            'stalled',
            'play',
            'pause',
            'loadedmetadata',
            'loadeddata',
            'waiting',
            'playing',
            'canplay',
            'canplaythrough',
            'seeking',
            'seeked',
            'timeupdate',
            'ended',
            'ratechange',
            'durationchange',
            'volumechange'
        ],
        mediaHost: null,
        mediaProtocol: null,
        mediaPlayer: null,
        wasPreload: false,
        videoQualityIndex: -1,
        videoStreamIndex: -1,
        audioQualityIndex: -1,
        audioStreamIndex: -1,
        textStreamIndex: -1,

        setup: function ( readyCallback ) {
            var _this = this;
            this.getPlayerElement().setAttribute( "preload", "auto" );
            this.addBindings();
            this.applyMediaElementBindings();
            $.getScript( "//www.gstatic.com/cast/sdk/libs/mediaplayer/1.0.0/media_player.js" ).then( function () {
                _this.preloadMediaSourceExtension();
                readyCallback();
            } );
        },

        preloadMediaSourceExtension: function () {
            mw.log( "EmbedPlayerChromecastReceiver::preloadMediaSourceExtension()" );
            if ( this.mediaPlayer !== null ) {
                this.mediaPlayer.unload();
                this.mediaPlayer = null;
            }

            this.mediaHost = new cast.player.api.Host( {
                'mediaElement': this.getPlayerElement(),
                'url': this.getSrc()
            } );

            var initStart = this.startTime || 0;
            var mimeType = this.getSource().getMIMEType();
            var licenseUrl = this.buildUdrmLicenseUri( mimeType );

            mw.log( "EmbedPlayerChromecastReceiver::url::" + this.getSrc() );
            mw.log( "EmbedPlayerChromecastReceiver::initStart::" + initStart );
            mw.log( "EmbedPlayerChromecastReceiver::mimeType::" + mimeType );
            mw.log( "EmbedPlayerChromecastReceiver::licenseUrl::" + licenseUrl );

            if ( licenseUrl ) {
                this.mediaHost.licenseUrl = licenseUrl;
            }

            switch ( mimeType ) {
                case "application/vnd.apple.mpegurl":
                    this.mediaProtocol = cast.player.api.CreateHlsStreamingProtocol( this.mediaHost );
                    break;
                case "application/dash+xml":
                    this.mediaProtocol = cast.player.api.CreateDashStreamingProtocol( this.mediaHost );
                    break;
                case "video/playreadySmooth":
                    this.mediaProtocol = cast.player.api.CreateSmoothStreamingProtocol( this.mediaHost );
                    break;
            }

            this.mediaHost.getQualityLevel = function ( streamIndex, qualityLevel ) {
                if ( streamIndex === this.videoStreamIndex && this.videoQualityIndex !== -1 ) {
                    return this.videoQualityIndex;
                } else if ( streamIndex === this.audioStreamIndex && this.audioQualityIndex !== -1 ) {
                    return this.audioQualityIndex;
                } else {
                    return qualityLevel;
                }
            }.bind( this );

            this.mediaHost.onAutoPause = function ( underflow ) {
                if ( underflow ) {
                    this.bufferStart();
                } else {
                    this.bufferEnd();
                }
            }.bind( this );

            this.mediaHost.onManifestReady = function () {
                var tracksInfo = this.parseTracks();
                if ( tracksInfo ) {
                    this.triggerHelper( "onTracksParsed", tracksInfo );
                }
            }.bind( this );

            this.mediaHost.onError = function ( errorCode ) {
                var message;
                if ( this.mediaPlayer !== null ) {
                    this.mediaPlayer.unload();
                    this.mediaPlayer = null;
                }
                switch ( errorCode ) {
                    case 1:
                        message = 'Error media playback';
                        break;
                    case 2:
                        message = 'Error fetching the keys or decrypting the content';
                        break;
                    case 3:
                        message = 'Network error';
                        break;
                    case 4:
                        message = 'Error loading or parsing the manifest';
                        break;
                    case 0:
                    default:
                        message = 'Unknown player error';
                        break;
                }
                this.triggerHelper( 'embedPlayerError', { message: message } );
            }.bind( this );

            if ( this.mediaProtocol === null ) {
                // Call on original handler
            } else {
                this.mediaPlayer = new cast.player.api.Player( this.mediaHost );
                if ( this.isLive() ) {
                    mw.log( "EmbedPlayerChromecastReceiver:: isLive()=true, load mediaPlayer" );
                    this.mediaPlayer.load( this.mediaProtocol, Infinity );
                } else {
                    mw.log( "EmbedPlayerChromecastReceiver:: preload mediaPlayer" );
                    this.mediaPlayer.preload( this.mediaProtocol, initStart );
                    this.wasPreload = true;
                }
            }
        },

        buildUdrmLicenseUri: function ( mimeType ) {
            mw.log( "EmbedPlayerChromecastReceiver::buildUdrmLicenseUri()" );
            var licenseServer = mw.getConfig( 'Kaltura.UdrmServerURL' );
            var licenseParams = this.mediaElement.getLicenseUriComponent();
            var licenseUri = null;

            if ( licenseServer && licenseParams ) {
                // Build licenseUri by mimeType.
                switch ( mimeType ) {
                    case "video/wvm":
                        // widevine classic
                        licenseUri = licenseServer + "/widevine/license?" + licenseParams;
                        break;
                    case "application/dash+xml":
                        // widevine modular, because we don't have any other dash DRM right now.
                        licenseUri = licenseServer + "/cenc/widevine/license?" + licenseParams;
                        break;
                    case "application/vnd.apple.mpegurl":
                        // fps
                        licenseUri = licenseServer + "/fps/license?" + licenseParams;
                        break;
                    default:
                        break;
                }
            }
            return licenseUri;
        },

        /**
         * Apply player bindings for getting events from receiver.js
         */
        addBindings: function () {
            mw.log( "EmbedPlayerChromecastReceiver::addBindings()" );

            var _this = this;

            this.bindHelper( "loadstart", function () {
                _this.stopped = false; // To always support autoPlay
            } );

            this.bindHelper( "replay", function () {
                _this.triggerReplayEvent = true;
                _this.triggerHelper( "playerReady" ); // Since we reload the media for replay, trigger playerReady to reset Analytics
            } );

            this.bindHelper( "postEnded", function () {
                _this.currentTime = _this.getPlayerElement().duration;
            } );
        },

        switchSrc: function ( event ) {
            mw.log( "EmbedPlayerChromecastReceiver::switchSrc()", event );
            var type = event.type;
            var tracks = event.tracks;
            switch ( type ) {
                case 'bitrates':
                    var activeBitratesIds = event.activeBitratesIds;
                    for ( var trackId in activeBitratesIds ) {
                        if ( activeBitratesIds.hasOwnProperty( trackId ) ) {
                            if ( this.isVideoTrack( tracks[ trackId ] ) ) {
                                this.videoQualityIndex = activeBitratesIds[ trackId ];
                            } else if ( this.isAudioTrack( tracks[ trackId ] ) ) {
                                this.audioQualityIndex = activeBitratesIds[ trackId ];
                            }
                        }
                    }
                    break;
                case 'tracks':
                    var getDifference = function ( array1, array2 ) {
                        var difference = [];
                        for ( var i = 0; i < array1.length; i++ ) {
                            if ( $.inArray( array1[ i ], array2 ) === -1 ) {
                                difference.push( array1[ i ] );
                            }
                        }
                        return difference;
                    };
                    var isActiveIds = event.activeTrackIds;
                    var wasActiveIds = [ this.audioStreamIndex, this.textStreamIndex ];
                    var enableStreams = getDifference( isActiveIds, wasActiveIds );
                    var disableStreams = getDifference( wasActiveIds, isActiveIds );
                    var i, track;
                    for ( i = 0; i < disableStreams.length; i++ ) {
                        track = tracks[ disableStreams[ i ] ];
                        if ( !track ) {
                            continue;
                        }
                        if ( this.isAudioTrack( track ) ) {
                            this.disableAudioTrack( disableStreams[ i ] );
                        } else if ( this.isTextTrack( track ) ) {
                            this.disableTextTrack( disableStreams[ i ] );
                        }
                    }
                    for ( i = 0; i < enableStreams.length; i++ ) {
                        track = tracks[ enableStreams[ i ] ];
                        if ( !track ) {
                            continue;
                        }
                        if ( this.isAudioTrack( track ) ) {
                            this.enableAudioTrack( enableStreams[ i ] );
                            event.handler();
                        } else if ( this.isTextTrack( track ) ) {
                            this.enableTextTrack( enableStreams[ i ] );
                        }
                    }
                    break;
                default:
                    break;
            }
        },

        isAudioTrack: function ( track ) {
            return track.type === top.cast.receiver.media.TrackType.AUDIO;
        },

        isTextTrack: function ( track ) {
            return track.type === top.cast.receiver.media.TrackType.TEXT;
        },

        isVideoTrack: function ( track ) {
            return track.type === top.cast.receiver.media.TrackType.VIDEO;
        },

        disableTextTrack: function ( activeTrackId ) {
            this.mediaPlayer.enableCaptions( false );
            this.mediaProtocol.enableStream( activeTrackId, false );
            this.textStreamIndex = -1;
            this.mediaPlayer.enableCaptions( true );
        },

        disableAudioTrack: function ( activeTrackId ) {
            this.mediaProtocol.enableStream( activeTrackId, false );
            this.audioStreamIndex = -1;
            this.mediaPlayer.reload();
        },

        enableTextTrack: function ( activeTrackId ) {
            this.mediaPlayer.enableCaptions( false );
            this.mediaProtocol.enableStream( activeTrackId, true );
            this.textStreamIndex = activeTrackId;
            this.mediaPlayer.enableCaptions( true );
        },

        enableAudioTrack: function ( activeTrackId ) {
            this.mediaProtocol.enableStream( activeTrackId, true );
            this.audioStreamIndex = activeTrackId;
            this.mediaPlayer.reload();
        },

        parseTracks: function () {
            mw.log( "EmbedPlayerChromecastReceiver::parseTracks()" );
            if ( this.mediaProtocol === null ) {
                return null;
            }
            var tracks = [];
            var activeTrackIds = [];
            var streamCount = this.mediaProtocol.getStreamCount();
            for ( var trackId = 0; trackId < streamCount; trackId++ ) {
                var trackType = null;
                var track = null;
                var isActive = this.mediaProtocol.isStreamEnabled( trackId );
                var info = this.mediaProtocol.getStreamInfo( trackId );
                if ( isActive ) {
                    activeTrackIds.push( trackId );
                }
                if ( info.mimeType.indexOf( 'text' ) === 0 ) {
                    trackType = top.cast.receiver.media.TrackType.TEXT;
                    if ( isActive ) {
                        this.textStreamIndex = trackId;
                    }
                } else if ( info.mimeType.indexOf( 'video' ) === 0 ) {
                    trackType = top.cast.receiver.media.TrackType.VIDEO;
                    if ( isActive ) {
                        this.videoStreamIndex = trackId;
                    }
                } else if ( info.mimeType.indexOf( 'audio' ) === 0 ) {
                    trackType = top.cast.receiver.media.TrackType.AUDIO;
                    if ( isActive ) {
                        this.audioStreamIndex = trackId;
                    }
                }
                if ( trackType ) {
                    track = new top.cast.receiver.media.Track( trackId, trackType );
                    track.trackContentType = info.mimeType;
                    track.language = info.language;
                    track.name = info.name || (trackType + '_TRACK_' + trackId);
                    track.customData = { bitrates: info.bitrates, codecs: info.codecs };
                    tracks.push( track );
                }
            }
            var tracksInfo = new top.cast.receiver.media.TracksInfo();
            tracksInfo.tracks = tracks;
            tracksInfo.activeTrackIds = activeTrackIds;
            return tracksInfo;
        },

        /**
         * Apply media element bindings
         */
        applyMediaElementBindings: function () {
            mw.log( "EmbedPlayerChromecastReceiver::applyMediaElementBindings()" );
            var _this = this;
            var vid = this.getPlayerElement();
            if ( !vid ) {
                return;
            }
            $.each( _this.nativeEvents, function ( inx, eventName ) {
                $( vid ).unbind( eventName + _this.bindPostfix ).bind( eventName + _this.bindPostfix, function () {
                    // make sure we propagating events, and the current instance is in the correct closure.
                    if ( _this._propagateEvents && _this.instanceOf == 'ChromecastReceiver' ) {
                        var argArray = $.makeArray( arguments );
                        // Check if there is local handler:
                        if ( _this[ '_on' + eventName ] ) {
                            _this[ '_on' + eventName ].apply( _this, argArray );
                        } else {
                            // No local handler directly propagate the event to the abstract object:
                            $( _this ).trigger( eventName, argArray );
                        }
                    }
                } );
            } );
        },

        /**
         * Player methods
         */
        play: function () {
            mw.log( "EmbedPlayerChromecastReceiver::play()" );
            if ( this.parent_play() ) {
                if ( this.wasPreload ) {
                    this.wasPreload = false;
                    this.mediaPlayer.load();
                }
                this.mediaPlayer.playWhenHaveEnoughData();
            }
        },

        pause: function () {
            mw.log( "EmbedPlayerChromecastReceiver::pause()" );
            this.parent_pause();
            this.getPlayerElement().pause();
        },

        replay: function () {
            mw.log( "EmbedPlayerChromecastReceiver::replay(), currentElementState::" + this.getPlayerElementCurrentState() );
            if ( this.getPlayerElementCurrentState() === "end" ) {
                this.restoreEventPropagation();
                this.preloadMediaSourceExtension();
                this.play();
            }
        },

        changeMediaCallback: function ( callback ) {
            mw.log( "EmbedPlayerChromecastReceiver::changeMediaCallback()" );
            this.changeMediaStarted = false;
            this.preloadMediaSourceExtension();
            if ( callback ) {
                callback();
            }
            this.play();
        },

        playerSwitchSource: function ( source, switchCallback, doneCallback ) {
            mw.log( "EmbedPlayerChromecastReceiver::playerSwitchSource()" );
            if ( switchCallback ) {
                switchCallback( this.getPlayerElement() );
            }
            setTimeout( function () {
                if ( doneCallback ) {
                    doneCallback();
                }
            }, 100 );
        },

        syncCurrentTime: function () {
            this.currentTime = this.getPlayerElementTime();
        },

        setPlayerElement: function ( mediaElement ) {
            this.playerElement = mediaElement;
        },

        getPlayerElementCurrentState: function () {
            return this.currentState;
        },

        getPlayerElement: function () {
            if ( !this.playerElement ) {
                this.playerElement = $( '#' + this.pid ).get( 0 );
            }
            return this.playerElement;
        },

        getPlayerElementTime: function () {
            return this.getPlayerElement().currentTime;
        },

        isVideoSiblingEnabled: function () {
            return false;
        },

        canAutoPlay: function () {
            return true;
        },

        /**
         * Native video tag methods
         */

        // When player started to play
        _onplaying: function () {
            this.triggerHelper( "playing" );
        },

        _onplay: function () {
            this.restoreEventPropagation();
        },

        // On perform seek
        _onseeking: function () {
            if ( !this.seeking ) {
                this.seeking = true;
            }
        },

        // After seeking ends
        _onseeked: function () {
            if ( this.seeking ) {
                this.seeking = false;
                if ( this._propagateEvents && !this.isLive() ) {
                    this.triggerHelper( 'seeked', [ this.getPlayerElementTime() ] );
                    this.triggerHelper( "onComponentsHoverEnabled" );
                    this.syncCurrentTime();
                    this.updatePlayheadStatus();
                }
            }
        },

        _ondurationchange: function ( event, data ) {
            if ( this.playerElement && !isNaN( this.playerElement.duration ) && isFinite( this.playerElement.duration ) ) {
                this.setDuration( this.getPlayerElement().duration );
            }
        },

        _onended: function () {
            if ( this._propagateEvents ) {
                this.onClipDone();
            }
        },

        playSegment: function () {
        }
    };
})( mediaWiki, jQuery );