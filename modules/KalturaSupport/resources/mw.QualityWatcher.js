/**
 * Created by itayk on 9/1/18.
 * Algorithm monitor the stream every 5sec
 * if we have more than 20% drop frames (configurable fpsDroppedMonitoringThreshold) we remove
 * the bitrate we tried from the adaptive set and try a lower one
 */
( function( mw, $ ) {
    "use strict";
    mw.PluginManager.add( "qualitywatcher" , mw.KBasePlugin.extend({
        defaultConfig: {
            fpsDroppedFramesPeriod:5000
        },
        isSupported:false,
        lastTime:null,
        lastDroppedFrames:0,
        lastDecodedFrames:0,
        weight:0,
        intervalId:null,

        setup: function( ) {
            this.addBindings();
        },
        resetFlags: function() {
            this.isSupported = false;
            this.lastTime = null;
            this.lastDroppedFrames = 0;
            this.lastDecodedFrames = 0;
            this.weight = 0;

        },
        addBindings : function() {
            var _this = this;
            this.embedPlayer.bindHelper('firstPlay', function () {
                _this.resetFlags();
                if (window.player && window.player.getVariantTracks ){
                    _this.isSupported = true;
                    if (_this.intervalId){
                        clearInterval(_this.intervalId);
                        _this.intervalId = null;
                    }
                    _this.intervalId = setInterval(_this.checkFPSInterval.bind(_this),_this.getConfig("fpsDroppedFramesPeriod"));
                }
            });
        },
        checkFPSInterval: function(){
            var _this = this;
            var vidObj = _this.embedPlayer.getVideoHolder()[0].getElementsByTagName("video")[0];
            if (typeof vidObj.getVideoPlaybackQuality === 'function') {
                var videoPlaybackQuality = vidObj.getVideoPlaybackQuality();
                _this.checkFPS( videoPlaybackQuality.droppedVideoFrames , videoPlaybackQuality.totalVideoFrames );
            } else {
                _this.checkFPS( vidObj.webkitDroppedFrameCount , vidObj.webkitDecodedFrameCount );
            }
        },
        checkFPS: function ( droppedFrames, decodedFrames) {
            try {
                var currentTime = performance.now();
                if (decodedFrames) {
                    if (this.lastTime) {
                        var currentPeriod = currentTime - this.lastTime,
                            currentDropped = droppedFrames - this.lastDroppedFrames,
                            currentDecoded = decodedFrames - this.lastDecodedFrames,
                            droppedFPS = 1000 * currentDropped / currentPeriod;
                        if (droppedFPS > 0) {
                            this.log('checkFPS : droppedFPS/decodedFPS:' + droppedFPS / (1000 * currentDecoded / currentPeriod));
                            if (currentDropped > (mw.getConfig("fpsDroppedMonitoringThreshold") || 0.1) * currentDecoded) {
                                var currentLevel = this.getCurrentQuality();
                                this.log('drop FPS ratio greater than max allowed value for currentLevel: ' + currentLevel);
                                if (currentLevel > 0) {
                                    this.removeQuality(currentLevel);
                                }
                            }
                        }
                    }
                    this.lastTime = currentTime;
                    this.lastDroppedFrames = droppedFrames;
                    this.lastDecodedFrames = decodedFrames;
                }
            } catch(e){this.log("Error occur while trying to check dropFrames");}
        },
        getSortedTracks: function(){
            var tracks = player.getVariantTracks();
            var sortedTracks = tracks.map((obj)=>{return {id:obj.id,bandwidth:obj.bandwidth,active:obj.active}}).sort((obj1,obj2)=>{return obj1.bandwidth>obj2.bandwidth});
            return sortedTracks;
        },
        getCurrentQuality:function(){
            var sortedTracks = this.getSortedTracks();
            var activeTrackId = 0;
            for (var index=0 ; index < sortedTracks.length ; index++){
                if (sortedTracks[index].active){
                    activeTrackId = index;
                }
            }
            return activeTrackId;
        },
        removeQuality:function(level){
            var sortedTracks = this.getSortedTracks();
            var bandWidthToRemove = sortedTracks[level].bandwidth;
            window.player.configure({abr:{restrictions:{maxBandwidth:bandWidthToRemove-1}}})
        },
        destroy:function(){
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        }));
} )( window.mw, window.jQuery );