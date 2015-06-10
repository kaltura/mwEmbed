/**
 * Created by einatr on 6/8/15.
 */
(function() {
    'use strict';
    $.extend(KalturaVideoPlayerPluginDelegate.prototype, ADB.va.plugins.videoplayer.VideoPlayerPluginDelegate.prototype);

    function KalturaVideoPlayerPluginDelegate(player, config) {
        this.player = player;
        this.config = config;
    }

    KalturaVideoPlayerPluginDelegate.prototype.getVideoInfo = function() {
        var videoInfo = new ADB.va.plugins.videoplayer.VideoInfo();

        videoInfo.id = this.config.playerId ? this.config.playerId : this.player.evaluate('{mediaProxy.entry}').id;
        videoInfo.name = this.config.playerName ? this.config.playerName : this.player.evaluate('{mediaProxy.entry}').name;
        videoInfo.length = this.config.playerLength ? this.config.playerLength : this.player.evaluate('{mediaProxy.entry}').duration;
        videoInfo.playerName = this.config.playerPlayerName ? this.config.playerPlayerName : this.player.kuiconfid;
        videoInfo.playhead = this.player.currentTime;
        if ( this.config.playerStreamType )
            videoInfo.streamType = this.config.playerStreamType;
        else
            videoInfo.streamType = this.player.isLive() ? ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_LIVE : ADB.va.plugins.videoplayer.AssetType.ASSET_TYPE_VOD;

        return videoInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getAdBreakInfo = function() {
        var adBreakInfo = new ADB.va.AdBreakInfo();

        //adBreakInfo.playerName = "";
        //adBreakInfo.name = "";
        //adBreakInfo.position = 1;
        //adBreakInfo.startTime = -1;

        return adBreakInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getAdInfo = function() {
        var adInfo = new ADB.va.AdInfo();

        //adInfo.id = "";
        //adInfo.name = "";
        //adInfo.length = -1;
        //adInfo.position = "1";

        return adInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getChapterInfo = function() {
        var chapterInfo = new ADB.va.ChapterInfo();

        //chapterInfo.name = "";
        //chapterInfo.length = -1;
        //chapterInfo.position = "1";
        //chapterInfo.startTime = -1;

        return chapterInfo;
    };

    KalturaVideoPlayerPluginDelegate.prototype.getQoSInfo = function() {
        return null;
    };

    KalturaVideoPlayerPluginDelegate.prototype.onError = function(errorInfo) {
        mw.log("HeartBeat plugin :: VideoPlayerPluginDelegate error: " + errorInfo.getMessage() + " | " + errorInfo.getDetails());
    };

    // Export symbols.
    window.KalturaVideoPlayerPluginDelegate = KalturaVideoPlayerPluginDelegate;
})();
