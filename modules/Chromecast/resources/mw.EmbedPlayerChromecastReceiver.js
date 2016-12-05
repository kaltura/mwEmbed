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

        setup: function ( readyCallback ) {
            this.setPlayerElement( document.querySelector( 'video' ) );
            this.addBindings();
            this.applyMediaElementBindings();
            this.preloadMediaSourceExtension();
            readyCallback();
        },

        preloadMediaSourceExtension: function () {
            if ( this.mediaPlayer !== null ) {
                this.mediaPlayer.unload();
                this.mediaPlayer = null;
            }

            this.mediaHost = new top.cast.player.api.Host( {
                'mediaElement': this.getPlayerElement(),
                'url': this.getSrc()
            } );

            var initStart = this.startTime || 0;
            var mimeType = this.getSource().getMIMEType();
            var licenseUrl = this.buildUdrmLicenseUri( mimeType );

            if ( licenseUrl ) {
                this.mediaHost.licenseUrl = licenseUrl;
            }

            switch ( mimeType ) {
                case "application/vnd.apple.mpegurl":
                    this.mediaProtocol = top.cast.player.api.CreateHlsStreamingProtocol( this.mediaHost );
                    break;
                case "application/dash+xml":
                    this.mediaProtocol = top.cast.player.api.CreateDashStreamingProtocol( this.mediaHost );
                    break;
                case "video/playreadySmooth":
                    this.mediaProtocol = top.cast.player.api.CreateSmoothStreamingProtocol( this.mediaHost );
                    break;
            }

            this.mediaHost.onError = function ( errorCode ) {
                if ( this.mediaPlayer !== null ) {
                    this.mediaPlayer.unload();
                    this.mediaPlayer = null;
                }
            }.bind( this );

            if ( this.mediaProtocol === null ) {
                // Call on original handler
            } else {
                this.mediaPlayer = new top.cast.player.api.Player( this.mediaHost );
                this.mediaPlayer.preload( this.mediaProtocol, (this.isLive() ? Infinity : initStart) );
                this.wasPreload = true;
            }
        },

        buildUdrmLicenseUri: function ( mimeType ) {
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

        changeLanguage: function () {
            var currentLanguage = null;
            var streamCount = this.mediaProtocol.getStreamCount();
            var streamInfo;
            for ( var i = 0; i < streamCount; i++ ) {
                if ( this.mediaProtocol.isStreamEnabled( i ) ) {
                    streamInfo = this.mediaProtocol.getStreamInfo( i );
                    if ( streamInfo.mimeType.indexOf( 'audio' ) === 0 ) {
                        if ( streamInfo.language ) {
                            currentLanguage = i;
                            break;
                        }
                    }
                }
            }

            if ( currentLanguage === null ) {
                currentLanguage = 0;
            }

            i = currentLanguage + 1;
            while ( i !== currentLanguage ) {
                if ( i === streamCount ) {
                    i = 0;
                }

                streamInfo = this.mediaProtocol.getStreamInfo( i );
                if ( streamInfo.mimeType.indexOf( 'audio' ) === 0 ) {
                    this.mediaProtocol.enableStream( i, true );
                    this.mediaProtocol.enableStream( currentLanguage, false );
                    break;
                }

                i++;
            }

            if ( i !== currentLanguage ) {
                this.mediaPlayer.reload();
            }
        },

        changeCaptions: function () {
            var current, next;
            var streamCount = this.mediaProtocol.getStreamCount();
            var streamInfo;
            for ( current = 0; current < streamCount; current++ ) {
                if ( this.mediaProtocol.isStreamEnabled( current ) ) {
                    streamInfo = this.mediaProtocol.getStreamInfo( current );
                    if ( streamInfo.mimeType.indexOf( 'text' ) === 0 ) {
                        break;
                    }
                }
            }

            if ( current === streamCount ) {
                next = 0;
            } else {
                next = current + 1;
            }

            while ( next !== current ) {
                if ( next === streamCount ) {
                    next = 0;
                }

                streamInfo = this.mediaProtocol.getStreamInfo( next );
                if ( streamInfo.mimeType.indexOf( 'text' ) === 0 ) {
                    break;
                }

                next++;
            }

            if ( next !== current ) {
                if ( current !== streamCount ) {
                    this.mediaProtocol.enableStream( current, false );
                    this.mediaPlayer.enableCaptions( false );
                }

                if ( next !== streamCount ) {
                    this.mediaProtocol.enableStream( next, true );
                    this.mediaPlayer.enableCaptions( true );
                }
            }
        },

        /**
         * Apply player bindings for getting events from mpl.js
         */
        addBindings: function () {
            var _this = this;

            this.bindHelper( "loadstart", function () {
                mw.log( 'EmbedPlayerChromecastReceiver:: Setup. Video element: ' + _this.getPlayerElement().toString() );
                _this._propagateEvents = true;
                _this.stopped = false;
            } );

            this.bindHelper( "replay", function () {
                _this.triggerReplayEvent = true;
                _this.triggerHelper( "playerReady" ); // since we reload the media for replay, trigger playerReady to reset Analytics
            } );

            //TODO: Ads support
            // this.bindHelper( "onAdOpen", function ( event, id, system, type ) {
            //     _this.triggerHelper( "broadcastToAllSenders", [ "chromecastReceiverAdOpen" ] );
            // } );

            // this.bindHelper( "AdSupport_AdUpdateDuration", function ( event, duration ) {
            //     _this.triggerHelper( "broadcastToAllSenders", [ "chromecastReceiverAdDuration|" + duration ] );
            // } );

            // this.bindHelper( "onContentResumeRequested", function () {
            //     _this.triggerHelper( "broadcastToAllSenders", [ "chromecastReceiverAdComplete" ] );
            //     _this.triggerHelper( "cancelAllAds" );
            // } );

            //TODO: Closed captions
            // this.bindHelper( "ccSelectClosedCaptions sourceSelectedByLangKey", function ( e, label ) {
            //     _this.triggerHelper( "propertyChangedEvent", {
            //         "plugin": "closedCaptions",
            //         "property": "captions",
            //         "value": typeof label === "string" ? label : label[ 0 ]
            //     } );
            //     $( parent.document.getElementById( 'captionsOverlay' ) ).empty();
            // } );
        },

        /**
         * Apply media element bindings
         */
        applyMediaElementBindings: function () {
            var _this = this;
            this.log( "MediaElementBindings" );
            var vid = this.getPlayerElement();
            if ( !vid ) {
                this.log( " Error: applyMediaElementBindings without player elemnet" );
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

        play: function () {
            if ( this.parent_play() ) {
                if ( this.wasPreload ) {
                    this.wasPreload = false;
                    this.mediaPlayer.load();
                }
                this.mediaPlayer.playWhenHaveEnoughData();
            }
        },

        /**
         * Handle the native paused event
         */
        _onpause: function () {
            this.pause();
            $( this ).trigger( 'onPlayerStateChange', [ "pause", "play" ] );
        },

        // When player started to play
        _onplaying: function () {
            this.hideSpinner();
            this.triggerHelper( "playing" );
            this.triggerHelper( 'hidePlayerControls' );
        },

        /**
         * Handle the native play event
         */
        _onplay: function () {
            this.restoreEventPropagation();
            this.triggerHelper( 'hidePlayerControls' );
        },

        replay: function () {
            if ( this.getPlayerElementCurrentState() === "end" ) {
                this.restoreEventPropagation();
                this.preloadMediaSourceExtension();
                this.play();
            }
        },

        // On perform seek
        _onseeking: function () {
            this.addPlayerSpinner();
            this.triggerHelper( 'hidePlayerControls' );
            if ( !this.seeking ) {
                this.seeking = true;
                if ( this._propagateEvents && !this.isLive() ) {
                    this.triggerHelper( 'seeking' );
                }
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
                    this.hideSpinner();
                }
            }
        },

        changeMediaCallback: function ( callback ) {
            this.preloadMediaSourceExtension();
            this.changeMediaStarted = false;
            if ( callback ) {
                callback();
            }
            this.play();
        },

        // override these functions so embedPlayer won't try to sync time
        syncCurrentTime: function () {
            this.currentTime = this.getPlayerElementTime();
        },

        _ondurationchange: function ( event, data ) {
            if ( this.playerElement && !isNaN( this.playerElement.duration ) && isFinite( this.playerElement.duration ) ) {
                this.setDuration( this.getPlayerElement().duration );
                return;
            }
        },

        _onended: function () {
            if ( this._propagateEvents ) {
                this.onClipDone();
            }
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

        playerSwitchSource: function ( source, switchCallback, doneCallback ) {
            if ( switchCallback ) {
                switchCallback( this.playerObject );
            }
            setTimeout( function () {
                if ( doneCallback ) {
                    doneCallback();
                }
            }, 100 );
        },

        canAutoPlay: function () {
            return true;
        }
    };
})( mediaWiki, jQuery );