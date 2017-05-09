(function(mw, $) {
    "use strict";

    function SimplePlugin(playerPluginInstance) {
        log("SimplePlugin loaded!");

        var playerLifeCycleEvents = ["startUp","initiatApp","skinLoaded","skinLoadFailed","sourceReady","kdpReady","kdpEmpty","layoutReady","layoutBuildDone","playerReady","pluginsLoaded","singlePluginLoaded","singlePluginFailedToLoad","readyToPlay","readyToLoad","entryReady","entryFailed","entryNotAvailable","mediaReady","mediaError","mediaLoaded"];
        var playerStateEvents = ["firstPlay","firstQuartile","secondQuartile","thirdQuartile","playerPlayEnd","durationChange","rootResize","mediaViewableChange","playerStateChange","playerPaused","playerPlayed","userInitiatedPlay","userInitiatedPause","preSeek","seek","seeked","userInitiatedSeek","monitorEvent","playerUpdatePlayhead","openFullScreen","closeFullScreen","hasCloseFullScreen","hasOpenedFullScreen","volumeChanged","volumeChangedEnd","mute","unmute","bytesDownloadedChange","bytesTotalChange","bufferProgress","bufferChange","bufferStartEvent","bufferEndEvent","scrubberDragStart","scrubberDragEnd","intelliSeek","freePreviewEnd","changeMediaProcessStarted","metadataReceived","cuePointsReceived","cuePointReached","switchingChangeStarted","switchingChangeComplete","playbackComplete","closedCaptionsHidden","closedCaptionsDisplayed","changedClosedCaptions"];
        var playerAdRelatedEvents = ["adOpportunity","sequenceItemPlayStart","sequenceItemPlayEnd","preSequenceStart","preSequenceComplete","postSequenceStart","postSequenceComplete","midSequenceStart","midSequenceComplete","bumperStarted","bumperClicked","adStart","onAdPlay","adClick","adEnd","firstQuartileOfAd","midOfAd","ThirdQuartileOfAd","adErrorEvent"];
        var playlistAndRelatedEvents = ["relatedVideoSelect","playlistReady","playlistPlayNext","playlistPlayPrevious","playlistFirstEntry","playlistMiddleEntry","playlistLastEntry"];

        var adRelatedEvents = ['AdSupport_StartAdPlayback', 'AdSupport_EndAdPlayback', 'AdSupport_AdUpdateDuration', 'onAdComplete', 'onAdSkip'  ];

        var vpaid = ["AdLoaded", "AdLinearChange", "AdImpression", "AdStopped", "AdError", "AdLog", "durationChange", "AdSkipped", "AdStarted", "AdVolumeChange", "AdVideoStart", "AdVideoFirstQuartile", "AdVideoMidpoint", "AdVideoThirdQuartile", "AdVideoComplete", "AdUserAcceptInvitation", "AdUserMinimize", "AdUserClose", "AdPaused", "AdPlaying", "AdClickThru"];

        var vpaidWithOn = ["onAdLoaded", "onAdLinearChange", "onAdImpression", "onAdStopped", "onAdError", "onAdLog", "ondurationChange", "onAdSkipped", "onAdStarted", "onAdVolumeChange", "onAdVideoStart", "onAdVideoFirstQuartile", "onAdVideoMidpoint", "onAdVideoThirdQuartile", "onAdVideoComplete", "onAdUserAcceptInvitation", "onAdUserMinimize", "onAdUserClose", "onAdPaused", "onAdPlaying", "onAdClickThru"];

        var withForcedOn = ["onStartUp", "onInitiatApp", "onSkinLoaded", "onSkinLoadFailed", "onSourceReady", "onKdpReady", "onKdpEmpty", "onLayoutReady", "onLayoutBuildDone", "onPlayerReady", "onPluginsLoaded", "onSinglePluginLoaded", "onSinglePluginFailedToLoad", "onReadyToPlay", "onReadyToLoad", "onEntryReady", "onEntryFailed", "onEntryNotAvailable", "onMediaReady", "onMediaError", "onMediaLoaded", "onFirstPlay", "onFirstQuartile", "onSecondQuartile", "onThirdQuartile", "onPlayerPlayEnd", "onDurationChange", "onRootResize", "onMediaViewableChange", "onPlayerStateChange", "onPlayerPaused", "onPlayerPlayed", "onUserInitiatedPlay", "onUserInitiatedPause", "onPreSeek", "onSeek", "onSeeked", "onUserInitiatedSeek", "onMonitorEvent", "onPlayerUpdatePlayhead", "onOpenFullScreen", "onCloseFullScreen", "onHasCloseFullScreen", "onHasOpenedFullScreen", "onVolumeChanged", "onVolumeChangedEnd", "onMute", "onUnmute", "onBytesDownloadedChange", "onBytesTotalChange", "onBufferProgress", "onBufferChange", "onBufferStartEvent", "onBufferEndEvent", "onScrubberDragStart", "onScrubberDragEnd", "onIntelliSeek", "onFreePreviewEnd", "onChangeMediaProcessStarted", "onMetadataReceived", "onCuePointsReceived", "onCuePointReached", "onSwitchingChangeStarted", "onSwitchingChangeComplete", "onPlaybackComplete", "onClosedCaptionsHidden", "onClosedCaptionsDisplayed", "onChangedClosedCaptions", "onAdOpportunity", "onSequenceItemPlayStart", "onSequenceItemPlayEnd", "onPreSequenceStart", "onPreSequenceComplete", "onPostSequenceStart", "onPostSequenceComplete", "onMidSequenceStart", "onMidSequenceComplete", "onBumperStarted", "onBumperClicked", "onAdStart", "onOnAdPlay", "onAdClick", "onAdEnd", "onFirstQuartileOfAd", "onMidOfAd", "onThirdQuartileOfAd", "onAdErrorEvent", "onRelatedVideoSelect", "onPlaylistReady", "onPlaylistPlayNext", "onPlaylistPlayPrevious", "onPlaylistFirstEntry", "onPlaylistMiddleEntry", "onPlaylistLastEntry"];

        var filterEvents = ['monitorEvent', 'playerUpdatePlayhead'];


        []
            .concat(playerLifeCycleEvents)
            .concat(playerStateEvents)
            .concat(playerAdRelatedEvents)
            .concat(playlistAndRelatedEvents)
            .concat(adRelatedEvents)
            .concat(vpaid)
            .concat(vpaidWithOn)
            .concat(withForcedOn)
            .filter(function (currentValue) {
                return filterEvents.indexOf(currentValue) == -1;
            })
            .forEach(function (eventName) {
                playerPluginInstance.bind(eventName, function () {
                    var _arguments = Array.prototype.slice.call(arguments, 1);

                    log.apply(null, ['bind', eventName].concat(_arguments));
                });

                playerPluginInstance.getPlayer().addJsListener(eventName, function () {
                    var _arguments = Array.prototype.slice.call(arguments, 1);

                    log.apply(null, ['jsli', eventName].concat(_arguments));
                });
            });

        function log() {
            var _arguments = Array.prototype.slice.call(arguments);

            var now = +new Date();
            var args = ['slog', now, getCurrentPosition(playerPluginInstance), playerPluginInstance.getPlayer().evaluate('{duration}')].concat( _arguments );

            if(/^((?!chrome|android).)*safari/i.test(navigator.userAgent) && true) {
                console.log.apply(console, [args.join(' ')]);
            } else {
                console.log.apply(console, args);
            }


        }
    }

    function getCurrentPosition(playerPluginInstance) {
        return Math.floor(playerPluginInstance.getPlayer().evaluate('{video.player.currentTime}'));
    }

    mw.kalturaPluginWrapper(function(){
        mw.PluginManager.add('myCustomPluginName', mw.KBaseComponent.extend({
            setup: function () {
                this.simplePlugin = new SimplePlugin(this);
                window.parent.window.playerPluginInstance = this;
            }
        }));
    });

})(mw, jQuery);