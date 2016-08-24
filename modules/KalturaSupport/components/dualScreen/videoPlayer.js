(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoPlayer = mw.KBaseComponent.extend({
        defaultConfig: {
            cuePointType: [{
                "main": mw.KCuePoints.TYPE.THUMB,
                "sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE]
            }],
            prefetch: {
                'durationPercentageUntilNextSequence': 60,
                'minimumSequenceDuration': 2
            }
        },
        cuePoints: [],
        syncEnabled: true,
        url:"",
        ABR: false, //adaptive bitrate video
        seeking :false, //seeking indicator is used by videoSync class and used for Flash-HLS only

        setup: function () {
            this.addBinding();
        },

        isSafeEnviornment: function () {
            return true;
        },

        canRender: function () {
          return true;
        },

        addBinding: function () {
            var _this = this;
            this.bind("onChangeMedia", function () {

            });
            this.bind("onChangeStream", function () {
                _this.syncEnabled = false;
            });
            this.bind("onChangeStreamDone", function () {
                _this.syncEnabled = true;
            });
            this.bind("setPlayerPoster", function () {
                if(this.videoElementReady) {
                    _this.updatePosterHTML();
                }
            });
            this.bind("removeVideoPoster", function () {
                _this.removeVideoPoster();
            });

            //adaptive bitrate
            this.bind("bitrateChange", function (e, newBitrate) {
                mw.log("DualScreen :: MASTER :: bitrateChange :: newBitrate = " + newBitrate);
            });

            //progressive download native
            this.bind("sourceSwitchingEnd", function (e, newBitrate) {
                mw.log("DualScreen :: MASTER :: sourceSwitchingEnd :: newBitrate = " + newBitrate.newBitrate ? newBitrate.newBitrate : newBitrate);
                //TODO: progressive download - should be dealt by dual screen (findClosestPlayableFlavor)
            });

            this.bind("bufferStartEvent", function () {
                //mw.log("DualScreen :: MASTER :: bufferStartEvent");
                //start timer. if buffering is more than a second -> pause the slave video
            });

            this.bind("bufferEndEvent", function () {
                //mw.log("DualScreen :: MASTER :: bufferEndEvent");
                //kill the timer (if exists and resume the slave video
            });

            //TODO: decide what to do in the case of slave player buffering
        },

        setUrl: function ( url ) {
            this.url = url;
        },

        getComponent: function () {
            if (!this.$el) {
                this.initPlayerElement();
            }
            return this.$el;
        },

        initPlayerElement: function () {
            mw.log("DualScreen :: second screen :: videoPlayer :: initPlayerElement");
            var _this = this;
            var player = this.getPlayer();
            switch(player.instanceOf){
                case "Native":
                    _this.initNativePlayer();
                    break;
                case "Kplayer":
                    _this.initKPlayer();
                    break;
                case "Silverlight":
                    _this.initSPlayer();
                    break;
            }
            this.updatePosterHTML();
            this.videoElementReady = true;
        },

        initNativePlayer: function () {
            var _this = this;
            this.$el =
                $('<video>')
                    .attr('id', 'vidSibling_obj')
                    .attr('muted', 'true')
                    .attr('src', this.url)
                    .addClass("videoPlayer")
                    .on("loadstart", this.sync.bind(this));
            this.$el.get(0).setCurrentTime = function(time){ _this.$el.get(0).currentTime = time; };
            this.$el.get(0).getCurrentTime = function(){ return _this.$el.get(0).currentTime;};
            this.$el.get(0).supportsPlaybackrate =  true;
        },

        initKPlayer: function () {
            //HLS case - add OSMF-HLS plugin if url includes 'm3u8' string
            // check for f4v (Akamai HD plugin?)
            //do we need to load any other flash plugins if master uses them?
            var _this = this;
            var fv = {
                "autoMute": true,
                "entryUrl": encodeURIComponent(this.url),
                "isLive": false,
                "stretchVideo": false
            };

            if(this.url.indexOf('m3u8') > 0){
                fv.KalturaHLS = { plugin: 'true', asyncInit: 'true', loadingPolicy: 'preInitialize' };
                fv.streamerType = "hls";
                //load slave video with the lowest bitrate. In order to save CPU resources, slave will switch to the higher bitrate only after the main video will reach stable bitrate.
                fv.KalturaHLS["prefBitrate"] = 50;
                fv.disableAutoDynamicStreamSwitch = true;
                this.ABR = true;
            }else{
                fv.isMp4 = true;
                if( mw.getConfig('streamerType') ){
                    fv.streamerType = mw.getConfig('streamerType');
                }else {
                    fv.streamerType = "http";
                }
            }

            var vidSibling = new mw.PlayerElementFlash( "secondScreen", "vidSibling_obj", fv, _this, function () {
                var bindEventMap = {
                    'playerSeekEnd': 'onPlayerSeekEnd',
                    'switchingChangeComplete': 'onSwitchingChangeComplete',
                    'flavorsListChanged': 'onFlavorsListChanged',
                    'mediaLoaded': 'onMediaLoaded',
                    'mediaError': 'onMediaError',
                    'debugInfoReceived': 'onDebugInfoReceived'
                };
                _this.playerObject = this.getElement();
                $.each(bindEventMap, function (bindName, localMethod) {
                    _this.playerObject.addJsListener(bindName, localMethod);
                });
                _this.sync();
                this.playerElement.play = this.play;
                this.playerElement.pause = this.pause;
                this.playerElement.setCurrentTime = function(val){
                    _this.seek(val);
                };
                this.playerElement.isFlashHLS = _this.isABR();
                this.playerElement.isSeeking = function(){
                    return _this.seeking;
                };
                this.load();
            }, null, "secondElementJsReadyFunc" );

            this.$el = $("#vidSibling_obj");
            this.$el.get(0).supportsPlaybackrate =  false;
        },

        initSPlayer: function(){
            //currently not supported
            /*
            var _this = this;
            var fv = {
                autoplay:false,
                isDVR:false,
                isLive:false,
                startvolume: 0,
                "entryUrl": encodeURI(this.url)

            };
            var vidSibling = new mw.PlayerElementSilverlight( "secondScreen", "vidSibling_obj", fv, null, function () {
                _this.sync();
                _this.playerElement.play = this.play;
                _this.playerElement.pause = this.pause;
                _this.playerElement.setCurrentTime = this.seek;
                _this.load();
            } );

            this.$el = $("#vidSibling_obj");
            this.$el.get(0).supportsPlaybackrate =  false;
            */
        },

        applyIntrinsicAspect: function () {
            // Check if a image thumbnail is present:

        },

        sync: function () {
            if (!this.videoSync) {
                this.videoSync = new mw.dualScreen.videoSync(this.getPlayer(), function () {
                }, "videoSync");
                this.videoSync.setMediaGroups([this.$el]);
            }
        },

        //kplayer events and functions
        seek: function ( val ) {
            this.seeking = true;
            this.playerObject.sendNotification( 'doSeek', val );
        },

        onMediaLoaded: function () {
            mw.log("DualScreen :: second screen :: videoPlayer :: onMediaLoaded");
        },

        onMediaError: function ( data ) {
            mw.log("DualScreen :: second screen :: videoPlayer :: onMediaError :: error: " + data);
            //TODO: handle error
        },

        onDebugInfoReceived: function ( data ) {
            /*
             var msg = '';
             for (var prop in data) {
             msg += prop + ': ' + data[prop]+' | ';
             }
             mw.log("--- DualScreen :: second screen :: videoPlayer :: onDebugInfoReceived | " + msg);
             */
        },

        onPlayerSeekEnd: function ( ) {
            this.seeking = false;
            //mw.log("DualScreen :: second screen :: videoPlayer :: onPlayerSeekEnd currentTime = "+this.playerObject.getCurrentTime());
        },

        onFlavorsListChanged: function ( data ) {
            this.manifestAdaptiveFlavors = [];
            mw.log("DualScreen :: second screen :: videoPlayer :: onFlavorsListChanged --------- START");
            for(var i=0; i<data.flavors.length; i++){
                this.manifestAdaptiveFlavors.push( Math.round( data.flavors[i].bandwidth / 1024 * 10 ) / 10 );
                mw.log("DualScreen :: second screen :: flavor "+ i +" = " + this.manifestAdaptiveFlavors[i]);
            }
            mw.log("DualScreen :: second screen :: videoPlayer :: onFlavorsListChanged --------- END");
        },

        onSwitchingChangeComplete: function ( data, id ) {
            if ( data && data.newBitrate ) {
                mw.log("DualScreen :: second screen :: videoPlayer :: onSwitchingChangeComplete :: currentBitrate = " + data.newBitrate);
            }
        },

        switchSrc: function ( sourceInd ) {
            this.playerObject.sendNotification('doSwitch', { flavorIndex: sourceInd });
        },
        //end of kplayer events and functions

        getPoster: function(){
            return this.poster;
        },

        setPoster: function ( thumbnailUrl ) {
            this.poster = kWidgetSupport.getKalturaThumbnailUrl({
                url: thumbnailUrl,
                width: this.getPlayer().getWidth(),
                height: this.getPlayer().getHeight()
            });
        },

        updatePosterHTML: function () {
            mw.log('DualScreen :: second screen :: updatePosterHTML ' + this.poster);
            if(this.hasPoster){
                return;
            }
            this.hasPoster = true;
            // Set by black pixel if no poster is found:
            var posterSrc = this.poster;
            var posterCss = {};
            if (!posterSrc) {
                posterSrc = mw.getConfig('EmbedPlayer.BlackPixel');
                posterCss = {
                    'position': 'absolute',
                    'height': '100%',
                    'width': '100%'
                };
            }

            $("#secondScreen").append($('<img />')
                .css(posterCss)
                .attr({
                    'src': this.poster
                })
                .addClass('playerPoster')
                .load(function () {
                    $('.playerPoster').attr('alt', gM('mwe-embedplayer-video-thumbnail'));
                }));
        },

        removeVideoPoster: function () {
            $("#secondScreen").find('.playerPoster').remove();
            this.hasPoster = false;
        },

        clearTimeout: function ( timeout ) {
            clearTimeout(timeout);
            timeout = null;
        },
        isABR: function () {
          return this.ABR;
        },

        destroy: function ( ) {
            this.getComponent().remove();
        }
    });
})( window.mw, window.jQuery );