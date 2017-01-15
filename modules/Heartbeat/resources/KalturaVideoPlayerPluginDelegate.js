/**
 * Created by einatr on 6/8/15.
 */
(function(mw, $) {
    'use strict';
    $.extend(KalturaVideoPlayerPluginDelegate.prototype, ADB.va.plugins.videoplayer.VideoPlayerPluginDelegate.prototype);

    var _this;

    function KalturaVideoPlayerPluginDelegate(player, config) {
        _this = this;
        _this.player = player;
        _this.config = config;
        _this.videoInfo = null;
        _this.qos = null;
        _this.adInfo = null;
        _this.adBreakInfo = null;
        _this.chapterInfo = null;


        _this.initVideoInfo = function(){
            _this.videoInfo = new ADB.va.plugins.videoplayer.VideoInfo();
            _this.videoInfo.playerName = _this.config.playerPlayerName || _this.player.kuiconfid;
            var duration = -1;
            if(_this.player.evaluate('{mediaProxy.entry}')) {
                var id = _this.player.evaluate('{mediaProxy.entry}').id ? _this.player.evaluate('{mediaProxy.entry}').id : _this.player.evaluate('{mediaProxy.entry}').name;
                if ( !_this.player.isLive() && ( _this.player.evaluate('{mediaProxy.entry}').duration || _this.player.duration ) ){
                    duration = _this.player.evaluate('{mediaProxy.entry}').duration ? _this.player.evaluate('{mediaProxy.entry}').duration : _this.player.duration;
                }
                _this.videoInfo.id = _this.config.playerId || id;
                _this.videoInfo.name = _this.config.playerName || _this.player.evaluate('{mediaProxy.entry}').name;
                _this.videoInfo.length = _this.config.playerLength || duration;
            } else {
                _this.videoInfo.id = _this.config.playerId || _this.player.playerConfig.widgetId;
                _this.videoInfo.name = _this.config.playerName || _this.player.playerConfig.widgetId;
                _this.videoInfo.length = _this.config.playerLength || _this.player.duration || duration;
            }

            if ( _this.config.playerStreamType ) {
                _this.videoInfo.streamType = _this.config.playerStreamType;
            }else {
                _this.videoInfo.streamType = _this.player.isLive() ? ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_LIVE : ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_VOD;
            }
        };

        _this.initadBreakInfo = function(){
            _this.adBreakInfo = new ADB.va.plugins.videoplayer.AdBreakInfo();
            _this.adBreakInfo.playerName = _this.config.playerPlayerName || _this.player.kuiconfid;
            _this.adBreakInfo.name = "";
            _this.adBreakInfo.position = 1;
            _this.adBreakInfo.startTime = -1;
        };

        _this.initAdInfo = function(){
            _this.adInfo = new ADB.va.plugins.videoplayer.AdInfo();
            _this.adInfo.id = "";
            _this.adInfo.name = "";
            _this.adInfo.length = -1;
            _this.adInfo.position = 1;
        };

        _this.setAdInfo = function(info){
            if ( !_this.adInfo ){
                _this.initAdInfo();
            }
            if ( info.id ) {
                _this.adInfo.id = info.id;
            }
            if ( info.name ) {
                _this.adInfo.name = info.name;
            }
            if ( info.length ) {
                _this.adInfo.length = info.length;
            }
            if ( info.position ) {
                _this.adInfo.position = info.position;
            }
        };

        _this.setAdBreakInfo = function (info){
            if( !_this.adBreakInfo ){
                _this.initadBreakInfo();
            }
            if ( info.name ) {
                _this.adBreakInfo.name = info.name;
            }
            if ( info.position ) {
                _this.adBreakInfo.position = info.position;
            }
            if ( info.startTime ) {
                _this.adBreakInfo.startTime = info.startTime;
            }
        };

        _this.setChapterInfo = function (info){
            if ( !_this.chapterInfo ){
                _this.chapterInfo = new ADB.va.plugins.videoplayer.chapterInfo();
                _this.chapterInfo.name = "";
                _this.chapterInfo.length = -1;
                _this.chapterInfo.position = 1;
                _this.chapterInfo.startTime = -1;
            }
            if ( info.name ) {
                _this.chapterInfo.name = info.name;
            }
            if ( info.length ) {
                _this.chapterInfo.length = info.length;
            }
            if ( info.position ) {
                _this.chapterInfo.position = info.position;
            }
            if ( info.startTime ) {
                _this.chapterInfo.startTime = info.startTime;
            }
        };

    }

    KalturaVideoPlayerPluginDelegate.prototype.getVideoInfo = function() {
        if( !_this.videoInfo ) {
            _this.initVideoInfo();
        }
        if ( !_this.player.isLive() && _this.player.duration ){
            _this.videoInfo.length = _this.player.duration;
        }
        _this.videoInfo.playhead = _this.player.getPlayerElementTime();

        return _this.videoInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getAdBreakInfo = function() {
        if( !_this.adBreakInfo ) {
            _this.initadBreakInfo();
        }
        return _this.adBreakInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getAdInfo = function() {
        return _this.adInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getChapterInfo = function() {
        return _this.chapterInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getQoSInfo = function() {
        if( !_this.qos ){
            _this.qos = new ADB.va.plugins.videoplayer.QoSInfo();
        }
        var bitrate = _this.player.getCurrentBitrate();
        if( bitrate !== -1 ){
            _this.qos.bitrate = bitrate;
        }

        //TODO: add additional parameters
        //qos.fps =
        //qos.droppedFrames =
        //qos.startupTime =

        return _this.qos;
    };

    KalturaVideoPlayerPluginDelegate.prototype.onError = function(errorInfo) {
        mw.log("HeartBeat plugin :: VideoPlayerPluginDelegate error: " + errorInfo.getMessage() + " | " + errorInfo.getDetails());
    };

    // Export symbols.
    window.KalturaVideoPlayerPluginDelegate = KalturaVideoPlayerPluginDelegate;
})(window.mw, window.jQuery);
