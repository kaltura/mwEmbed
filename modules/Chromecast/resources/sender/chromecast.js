(function ( mw, $ ) {
    "use strict";

    // Add chromecast player:
    $( mw ).bind( 'EmbedPlayerUpdateMediaPlayers', function ( event, mediaPlayers ) {
        var chromecastSupportedProtocols = [ 'video/mp4' ];
        var chromecastPlayer = new mw.MediaPlayer( 'chromecast', chromecastSupportedProtocols, 'Chromecast' );
        mediaPlayers.addPlayer( chromecastPlayer );
    } );

    mw.PluginManager.add( 'chromecast', mw.KBaseComponent.extend( {

        defaultConfig: {
            'parent': 'controlsContainer',
            'order': 7,
            'visible': false,
            'align': "right",
            'applicationID': "276999A7", // DB6462E9: Chromecast default receiver, 276999A7: Kaltura custom receiver supporting DRM, HLS and smooth streaming
            'showTooltip': true,
            'tooltip': gM( 'mwe-chromecast-chromecast' ),
            'title': gM( 'mwe-chromecast-chromecast' )
        },
        startCastTitle: gM( 'mwe-chromecast-startcast' ),
        stopCastTitle: gM( 'mwe-chromecast-stopcast' ),
        savedPlayer: null,
        isDisabled: false,
        casting: false,
        remotePlayer: null,
        remotePlayerController: null,
        CAST_SENDER_V3_URL: '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1',

        /**
         * Setup the Chromecast plugin - loads Google Cast Chrome sender SDK and bind his handler.
         */
        setup: function () {
            if ( mw.getConfig( 'EmbedPlayer.IsFriendlyIframe' ) ) {
                try {
                    top[ '__onGCastApiAvailable' ] = this.toggleCastButton.bind( this );
                    kWidget.appendScriptUrl( this.CAST_SENDER_V3_URL, null, top.document );
                } catch ( e ) {
                    window[ '__onGCastApiAvailable' ] = this.toggleCastButton.bind( this );
                    kWidget.appendScriptUrl( this.CAST_SENDER_V3_URL );
                }
            } else {
                window[ '__onGCastApiAvailable' ] = this.toggleCastButton.bind( this );
                kWidget.appendScriptUrl( this.CAST_SENDER_V3_URL );
            }
        },

        /**
         * Setup the Chromecast plugin bindings.
         */
        addBindings: function () {
            this.bind( 'chromecastError', this.launchError.bind( this ) );
            this.bind( 'castSessionEnded', this.switchToLocalPlayer.bind( this ) );
        },

        /**
         * Handles the Chromecast player button when receiver is discovered.
         * @param isAvailable
         * @param reason
         */
        toggleCastButton: function ( isAvailable, reason ) {
            this.log( "toggleCastButton: isAvailable=" + isAvailable + ", reason=" + reason );
            if ( isAvailable ) {
                this.initializeCastApi();
                this.show();
            } else {
                this.hide();
            }
        },

        /**
         * Initialize the cast framework.
         * 1) Defines the application id of the receiver.
         * 2) Check if a session is already opened.
         */
        initializeCastApi: function () {
            this.log( "initializeCastApi" );
            window.chrome = top.chrome || window.chrome;
            window.cast = top.cast || window.cast;

            var options = {};
            options.receiverApplicationId = this.getConfig( "applicationID" ).toString();
            options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
            cast.framework.CastContext.getInstance().setOptions( options );

            this.remotePlayer = new cast.framework.RemotePlayer();
            this.remotePlayerController = new cast.framework.RemotePlayerController( this.remotePlayer );

            setTimeout( this.checkIfAlreadyConnected.bind( this ), 100 );
        },

        /**
         * Handles the use case of refreshing the page while casting.
         */
        checkIfAlreadyConnected: function () {
            if ( this.remotePlayer.isConnected ) {
                this.switchToRemotePlayer();
            }
        },

        /**
         * Responsible for the logic which happens when we clicking the cast button.
         * @returns {boolean}
         */
        toggleCast: function () {
            this.log( "toggleCast: isDisabled=" + this.isDisabled + ", isCasting=" + this.casting );
            if ( this.isDisabled ) {
                return false;
            }
            // If we're casting - disconnect
            if ( this.casting ) {
                this.switchToLocalPlayer();
            } else {
                // If we're not - connect
                this.showConnectingMessage();
                this.embedPlayer.disablePlayControls( [ "chromecast" ] );
                cast.framework.CastContext.getInstance().requestSession().then(
                    this.switchToRemotePlayer.bind( this ),
                    this.launchError.bind( this )
                );
            }
        },

        /**
         * Returning the cast button ui.
         */
        getComponent: function () {
            if ( !this.$el ) {
                this.$el = $( '<button/>' )
                    .attr( 'title', this.startCastTitle )
                    .addClass( "btn icon-chromecast" + this.getCssClass() )
                    .click( this.toggleCast.bind( this ) );
            }
            return this.$el;
        },

        /**
         * After cast session has opened, switch to Chromecast player and save the old one.
         */
        switchToRemotePlayer: function () {
            this.log( "switchToChromecastPlayer" );
            var _this = this;
            var playbackParams = this.getEmbedPlayerPlaybackParams();
            this.casting = true;
            this.embedPlayer.casting = true;
            $( this.embedPlayer ).trigger( 'casting', true );
            this.savedPlayer = this.embedPlayer.selectedPlayer;
            this.embedPlayer.clean();
            this.embedPlayer.selectPlayer( mw.EmbedTypes.mediaPlayers.getPlayerById( 'chromecast' ) );
            this.embedPlayer.updatePlaybackInterface( function () {
                _this.embedPlayer.layoutBuilder.closeAlert();
                _this.getComponent().css( "color", "#35BCDA" );
                _this.updateTooltip( _this.stopCastTitle );
                _this.showLoadingMessage();
                _this.embedPlayer.setupRemotePlayer( _this.remotePlayer, _this.remotePlayerController, playbackParams );
            } );
        },

        /**
         * Gets the current playback data.
         * @returns {{currentTime: *, duration: *, volume: (*|Float)}}
         */
        getEmbedPlayerPlaybackParams: function () {
            return {
                currentTime: this.embedPlayer.getPlayerElementTime(),
                duration: this.embedPlayer.getDuration(),
                volume: this.embedPlayer.getPlayerElementVolume(),
                state: this.embedPlayer.currentState,
                captions: this.embedPlayer.getInterface().find( '.track' )
            }
        },

        /**
         * After cast session has been closed, switch to the player that was active before casting.
         */
        switchToLocalPlayer: function () {
            this.log( "switchToSavedPlayer" );
            var _this = this;
            var seekTo = this.embedPlayer.currentTime;
            var stopAfterSeek = (this.embedPlayer.currentState === "pause");
            this.casting = false;
            $( this.embedPlayer ).trigger( 'casting', false );
            this.embedPlayer.shutdownRemotePlayer();
            this.getComponent().css( "color", "white" );
            this.updateTooltip( this.startCastTitle );
            this.embedPlayer.getInterface().find( ".chromecastScreen" ).remove();
            this.embedPlayer.selectPlayer( this.savedPlayer );
            this.embedPlayer.casting = false;
            this.embedPlayer.updatePlaybackInterface( function () {
                _this.embedPlayer.addPlayerSpinner();
                _this.embedPlayer.seek( seekTo, stopAfterSeek );
            } );
        },

        /**
         * Launch an error and restoring the player ui.
         * @param errorCode
         */
        launchError: function ( errorCode ) {
            this.log( "launchError: " + this.getErrorMessage( errorCode ) );
            this.embedPlayer.layoutBuilder.closeAlert();
            this.embedPlayer.enablePlayControls();
        },

        /**
         * Gets a human readable error message based on the errorCode which cast sdk provides.
         * @param errorCode
         * @returns {*}
         */
        getErrorMessage: function ( errorCode ) {
            this.log( "getErrorMessage: errorCode=" + errorCode );
            switch ( errorCode ) {
                case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
                    return 'The API is not initialized.';
                case chrome.cast.ErrorCode.CANCEL:
                    return 'The operation was canceled by the user';
                case chrome.cast.ErrorCode.CHANNEL_ERROR:
                    return 'A channel to the receiver is not available.';
                case chrome.cast.ErrorCode.EXTENSION_MISSING:
                    return 'The Cast extension is not available.';
                case chrome.cast.ErrorCode.INVALID_PARAMETER:
                    return 'The parameters to the operation were not valid.';
                case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
                    return 'No receiver was compatible with the session request.';
                case chrome.cast.ErrorCode.SESSION_ERROR:
                    return 'A session could not be created, or a session was invalid.';
                case chrome.cast.ErrorCode.TIMEOUT:
                    return 'The operation timed out.';
            }
        },

        /**
         * Displays connecting message on the player ui.
         */
        showConnectingMessage: function () {
            this.displayMessage( gM( 'mwe-chromecast-connecting' ) );
        },

        /**
         * Displays loading message on the player ui.
         */
        showLoadingMessage: function () {
            this.displayMessage( gM( 'mwe-chromecast-loading' ) );
        },

        /**
         * Displays a certain message on the player ui.
         * @param msg
         */
        displayMessage: function ( msg ) {
            this.embedPlayer.layoutBuilder.displayAlert( {
                    'title': 'Chromecast Player',
                    'message': msg,
                    'isModal': true,
                    'keepOverlay': true,
                    'noButtons': true,
                    'isError': true,
                    'props': {
                        'customAlertContainerCssClass': 'connectingMsg',
                        'customAlertTitleCssClass': 'hidden',
                        'textColor': '#ffffff'
                    }
                }
            );
        }
    } ) );
})( window.mw, window.jQuery );
