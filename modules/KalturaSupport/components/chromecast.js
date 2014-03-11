( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'chromecast', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'topBarContainer',
			'order': 7,
            'align': "right",
            'tooltip': 'Chromecast'
		},

        applicationID: "DB6462E9",
        progressFlag: 1,
        currentMediaSession: null,
        mediaCurrentTime: 0,

        startCastTitle: gM( 'mwe-embedplayer-startCast' ),
        stopCastTitle: gM( 'mwe-embedplayer-stopCast' ),

		setup: function( embedPlayer ) {
            var _this = this;
            window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
                if (loaded) {
                    _this.initializeCastApi();
                } else {
                    mw.log(errorInfo);
                }
            }
		},

		getComponent: function() {
            var _this = this;
            if( !this.$el ) {
                this.$el = $( '<button />' )
                    .attr( 'title', this.startCastTitle )
                    .addClass( "btn icon-chromecast" + this.getCssClass() )
                    .click( function() {
                        alert("cast");
                    });
            }
            return this.$el;
		},

        getCssClass: function() {
            var cssClass = ' comp ' + this.pluginName + ' ';
            switch( this.getConfig( 'align' ) ) {
                case 'right':
                    cssClass += " pull-right";
                    break;
                case 'left':
                    cssClass += " pull-left";
                    break;
            }
            if( this.getConfig('cssClass') ) {
                cssClass += ' ' + this.getConfig('cssClass');
            }
            if( this.getConfig('displayImportance') ){
                var importance = this.getConfig('displayImportance').toLowerCase();
                if( $.inArray(importance, ['low', 'medium', 'high']) !== -1 ){
                    cssClass += ' display-' + importance;
                }
            }
            return cssClass;
        },

        initializeCastApi: function() {
            var sessionRequest = new chrome.cast.SessionRequest(this.applicationID); // 'Castv2Player'
            var apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener, this.receiverListener);
            chrome.cast.initialize(apiConfig, this.onInitSuccess, this.onError);
        },

        sessionListener: function(e) {
            mw.log('ChromeCast::New session ID: ' + e.sessionId);

            var session = e;
            if (session.media.length != 0) {
                mw.log('ChromeCast::Found ' + session.media.length + ' existing media sessions.');
                onMediaDiscovered('onRequestSessionSuccess_', session.media[0]);
            }
            session.addMediaListener(
                onMediaDiscovered.bind(this, 'addMediaListener'));
            session.addUpdateListener(sessionUpdateListener.bind(this));
        },

        onMediaDiscovered: function(how, mediaSession) {
            mw.log("ChromeCast::new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')');
            this.currentMediaSession = mediaSession;
            mediaSession.addUpdateListener(this.onMediaStatusUpdate);
            this.mediaCurrentTime = this.currentMediaSession.currentTime;
            //playpauseresume.innerHTML = 'Play';
            //document.getElementById("casticon").src = 'images/cast_icon_active.png';
        },

        onMediaStatusUpdate: function(isAlive) {
            if( this.progressFlag ) {
                //document.getElementById("progress").value = parseInt(100 * currentMediaSession.currentTime / currentMediaSession.media.duration);
            }
            //document.getElementById("playerstate").innerHTML = currentMediaSession.playerState;
        },

        receiverListener: function(e) {
            if( e === 'available' ) {
                mw.log("ChromeCast::receiver found");
            }
            else {
                mw.log("ChromeCast::receiver list empty");
            }
        },

        onInitSuccess: function() {
            mw.log("ChromeCast::init success");
        },

        onError: function() {
            mw.log("ChromeCast::error");
        }
	}));

} )( window.mw, window.jQuery );