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

        setup: function () {
            this.addBinding();
        },

        isSafeEnviornment: function () {
            return true;
        },

        canRender: function(){
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
            this.bind("removePoster", function () {
                _this.removePoster();
            });

            //adaptive bitrate or
            this.bind("bitrateChange", function (e, newBitrate) {
                mw.log("DualScreen :: MASTER :: bitrateChange :: newBitrate = " + newBitrate);
                //TODO: find closest bitrate and send notification to flash (should be supported only for adaptive bitrate)
                //switchSrc(newBitrate);

                // progressive download via flash should be dealt by dual screen (findClosestPlayableFlavor)
            });

            //progressive download native
            this.bind("sourceSwitchingEnd", function (e, newBitrate) {
                mw.log("DualScreen :: MASTER :: sourceSwitchingEnd :: newBitrate = " + newBitrate.newBitrate ? newBitrate.newBitrate : newBitrate);
                //TODO: should be dealt by dual screen (findClosestPlayableFlavor)
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

        setUrl: function(url){
            this.url = url;
        },

        getComponent: function () {
            if (!this.$el) {
                this.initPlayerElement();
            }
            return this.$el;
        },

        initPlayerElement: function(){
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
                case "splayer":
                    _this.initSender();
                    break;
            }
            this.updatePosterHTML();
            this.videoElementReady = true;
        },

        initNativePlayer: function(){
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

        initKPlayer: function(){
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
                //current solution brings only one bitrate, so there is no way to change bitrate in the future to the bigger one. TODO: we should be able to load all the flavors, but fix the stream on the lowest bitrate.
                fv.KalturaHLS["targetBitrate"] = 100; //TODO: implement 'mediaProxy.preferedFlavorBR' for EmbedPlayerKplayer. source selector should still get all the bitrates and select the current selected.
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
                    'switchingChangeStarted': 'onSwitchingChangeStarted',
                    'switchingChangeComplete': 'onSwitchingChangeComplete',
                    'flavorsListChanged': 'onFlavorsListChanged',

                    'bufferChange': 'onBufferChange',

                    'mediaLoaded': 'onMediaLoaded',

                    'mediaError': 'onMediaError',
                    'bitrateChange': 'onBitrateChange',
                    'debugInfoReceived': 'onDebugInfoReceived'
                };
                _this.playerObject = this.getElement();
                $.each(bindEventMap, function (bindName, localMethod) {
                    _this.playerObject.addJsListener(bindName, localMethod);
                });
                _this.sync();
                this.playerElement.play = this.play;
                this.playerElement.pause = this.pause;
                this.playerElement.setCurrentTime = this.seek;
                this.load();
            }, null, "secondElementJsReadyFunc" );

            this.$el = $("#vidSibling_obj");
            this.$el.get(0).supportsPlaybackrate =  false;
        },

        initSPlayer: function(){
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
        },

        applyIntrinsicAspect: function () {
            // Check if a image thumbnail is present:

        },

        sync: function(){
            if (!this.videoSync) {
                this.videoSync = new mw.dualScreen.videoSync(this.getPlayer(), function () {
                }, "videoSync");
                this.videoSync.setMediaGroups([this.$el]);
            }
        },

        //kplayer events
        onFlavorsListChanged: function (data) {
            mw.log("DualScreen :: second screen :: videoPlayer :: got FlavorsList");
            this.manifestAdaptiveFlavors = data.flavors;
            for(var i=0; i<this.manifestAdaptiveFlavors.length; i++){
                mw.log("DualScreen :: second screen :: videoPlayer :: onFlavorsListChanged :: AdaptiveFlavor = " + this.manifestAdaptiveFlavors[i].bandwidth);
            }
            //TODO: after the master stabilized on some bitrate, find closest bitrate inside manifestAdaptiveFlavors and switch the bitrate of the slave player
        },

        onMediaLoaded: function(){
            mw.log("DualScreen :: second screen :: videoPlayer :: onMediaLoaded");
            //lock second player on lowest bitrate
            //this.playerObject.sendNotification('doSwitch', { flavorIndex: 0 });
        },

        onSwitchingChangeStarted: function (data) {
            mw.log("DualScreen :: second screen :: videoPlayer :: onSwitchingChangeStarted :: currentBitrate = " + data.currentBitrate + "  |  data.currentIndex = " + data.currentIndex);
        },

        onSwitchingChangeComplete: function (data, id) {
            if ( data && data.newBitrate ) {
                mw.log("DualScreen :: second screen :: videoPlayer :: onSwitchingChangeComplete :: data.newBitrate = " + data.newBitrate);
            }
        },

        switchSrc: function (source) {
            this.playerObject.sendNotification('doSwitch', { flavorIndex: this.getSourceIndex(source) });
        },

        getSourceIndex: function (source) {
            var sourceIndex = 0; //autoDynamicStreamSwitch (adaptive bitrate) can't be enabled in the slave player, so sourceIndex can't ever be -1
            //TODO: if this.manifestAdaptiveFlavors !== undefined -> find closest flavor index for adaptive bitrate, else -> find closest source index for progressive download
            return sourceIndex;
        },

        onMediaError: function(data){
            mw.log("DualScreen :: second screen :: videoPlayer :: onMediaError :: error: " + data);
            //TODO: handle error
        },

        onBitrateChange: function(data){
            mw.log("DualScreen :: second screen :: videoPlayer :: onBitrateChange " + data);
        },

        onDebugInfoReceived: function(data){
            /*
            var msg = '';
            for (var prop in data) {
                msg += prop + ': ' + data[prop]+' | ';
            }
            mw.log("--- DualScreen :: second screen :: videoPlayer :: onDebugInfoReceived | " + msg);
            */
        },
        getPoster: function(){
            return this.poster;
        },
        setPoster: function(thumbnailUrl){
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
        removePoster: function(){
            $("#secondScreen").find('.playerPoster').remove();
            this.hasPoster = false;
        }
    });
})( window.mw, window.jQuery );