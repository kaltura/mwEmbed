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

            this.bind("bitrateChange", function (e, newBitrate) {
                mw.log("DualScreen :: master screen :: sourceSwitchingStarted :: newBitrate = " + newBitrate);
                //TODO: find closest bitrate and send notification to flash
                //switchSrc(newBitrate);
            });

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
            this.$el.get(0).setCurrentTime = function(time){
                try{
                    _this.$el.get(0).currentTime = time;
                }catch(err){
                    mw.log("--- err = "+err.message);
                }

            };
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
            }else{
                fv.isMp4 = true;
                if( mw.getConfig('streamerType') ){
                    fv.streamerType = mw.getConfig('streamerType');
                }else {
                    fv.streamerType = "http";
                }
            }

            var vidSibling = new mw.PlayerElementFlash( "secondScreen", "vidSibling_obj", fv, null, function () {
                /*
                var bindEventMap = {
                    'switchingChangeStarted': 'onSwitchingChangeStarted',
                    'switchingChangeComplete': 'onSwitchingChangeComplete',
                    'flavorsListChanged': 'onFlavorsListChanged',

                    'loadEmbeddedCaptions': 'onLoadEmbeddedCaptions',
                    'bufferChange': 'onBufferChange',

                    'mediaLoaded': 'onMediaLoaded',

                    'mediaError': 'onMediaError',
                    'bitrateChange': 'onBitrateChange',
                    'textTracksReceived': 'onTextTracksReceived',
                    'debugInfoReceived': 'onDebugInfoReceived'
                };
                _this.playerObject = this.getElement();
                $.each(bindEventMap, function (bindName, localMethod) {
                    _this.playerObject.addJsListener(bindName, localMethod);
                });
                if (_this.startTime !== undefined && _this.startTime != 0 && !_this.supportsURLTimeEncoding()) {
                    _this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', _this.startTime);
                }
                */
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
        onFlavorsListChanged: function (data, id) {
            var newFlavors = data.flavors;
            this.manifestAdaptiveFlavors = [];
            var _this = this;
            $.each(newFlavors, function(inx, flavor){
                _this.manifestAdaptiveFlavors.push( new mw.MediaSource( flavor ) );
            });
            mw.log("DualScreen :: second screen :: videoPlayer :: onFlavorsListChanged :: manifestAdaptiveFlavors = " + this.manifestAdaptiveFlavors.toString());
        },

        onSwitchingChangeStarted: function (data, id) {
            mw.log("DualScreen :: second screen :: videoPlayer :: onSwitchingChangeStarted :: data = " + data +" :: id = "+ id);
        },

        onSwitchingChangeComplete: function (data, id) {
            if ( data && data.newBitrate ) {
                mw.log("DualScreen :: second screen :: videoPlayer :: onSwitchingChangeComplete :: data.newBitrate = " + data.newBitrate);
            }
        },

        switchSrc: function (source) {
            /*
            var _this = this;
            //http requires source switching, all other switch will be handled by OSMF in KDP
            if (this.streamerType == 'http' && !this.getKalturaAttributeConfig('forceDynamicStream')) {
                //other streamerTypes will update the source upon "switchingChangeComplete"
                this.mediaElement.setSource(source);
                this.getEntryUrl().then(function (srcToPlay) {
                    _this.playerObject.setKDPAttribute('mediaProxy', 'entryUrl', srcToPlay);
                    _this.playerObject.sendNotification('doSwitch', { flavorIndex: _this.getSourceIndex(source) });
                });
                return;
            }
            var sourceIndex = -1; //autoDynamicStreamSwitch = true for adaptive bitrate (Auto)
            if( source !== -1 ){
                sourceIndex = this.getSourceIndex(source);
            }
            this.playerObject.sendNotification('doSwitch', { flavorIndex: sourceIndex });
            */
        },
        getSourceIndex: function (source) {
            /*
            var sourceIndex = null;
            $.each( this.getSources(), function( currentIndex, currentSource ) {
                if (source.getAssetId() == currentSource.getAssetId()) {
                    sourceIndex = currentIndex;
                    return false;
                }
            });
            // check for null, a zero index would evaluate false
            if( sourceIndex == null ){
                mw.log("EmbedPlayerKplayer:: Error could not find source: " + source.getSrc());
            }
            return sourceIndex;
            */
        }
    });
})( window.mw, window.jQuery );