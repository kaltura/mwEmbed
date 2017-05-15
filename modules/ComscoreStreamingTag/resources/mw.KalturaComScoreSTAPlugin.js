(function (mw) {
    "use strict";

    var PLUGIN_PLATFORM_NAME = 'kaltura',
        PLUGIN_VERSION = '1.2.2',
        PLAYER_VERSION = mw.getConfig('version');

    function KalturaComScoreSTAPlugin(playerPluginInstance) {
        var self = this;
        
        var gPlugin = null,
        eventsToListen = {
            playlistReady: onPlaylistReady,

            durationChange: onDurationChange,
            playerReady: onPlayerReady,
            bufferStartEvent: onBufferStartEvent,
            bufferEndEvent: onBufferEndEvent,
            preSeek: onPreSeek,

            mediaLoaded: onMediaLoaded,

            // We use these events to detect if playlist is automatically looping.
            playlistLastEntry: onPlaylistLastEntry,
            playlistPlayNext: onPlaylistPlayNext,

            volumeChanged: onVolumeChanged,
            onOpenFullScreen: onOnOpenFullScreen,
            onCloseFullScreen: onOnCloseFullScreen,

            AdSupport_StartAdPlayback: onAdSupport_StartAdPlayback,
            AdSupport_EndAdPlayback: onAdSupport_EndAdPlayback,
            onAdPlay: onOnAdPlay,
            onAdComplete: onOnAdComplete,
            onAdSkip: onOnAdSkip,
            adClick: onAdClick
        },
        eventsToListen_addJsListener = {
            "seek": onSeek,

            'playerPaused.ads': onPlayerPausedAds,
            'onPlayerStateChange.ads': onOnPlayerStateChangeAds,

            //liveStreams non-dvr
            "playerPlayed.live": onPlayerPlayedLive,
            "playerPaused.live": onPlayerPausedLive,
            "bufferStartEvent.live": onBufferStartEventLive,
            "bufferEndEvent.live": onBufferEndEventLive,
            "bufferProgress.live": onBufferProgressLive // We use that event to detect DVR from a live streams.
        };

        var eventTypeToAPICallMapping = {
            "0": "Play",
            "1": "Pause",
            "3": "End",
            "11": "SeekStart"
        };

        // Normal Playback
        var isPlaylistLoaded = false,
            isAd = false,
            clipPartNumber = 0,
            isFullScreen = false,
            adInfo,
            adNumber,
            isDVRStream = false,
            dvrInitialWindow = NaN,
            lastReportedPositionOffset = NaN,
            workaround_initial_play_live_streams,
            workaround_is_iphone_detect_seeking_events_set = false,
            isLiveStreamTypeConfigured = false,
            detectingAutomaticPlaylistLoop = false,
            detectedAutomaticPlaylistLoop = false,
            trackEventMonitorCallbackName = null;

        function init () {
            attachEvents();

            // Values as "{foo.bar}" are automatically processed by the kdp evaluation parser.
            var pluginOptions = playerPluginInstance.getConfig();

            // The labelMapping property is deprecated. Use labelmapping instead.
            pluginOptions['labelmapping'] = pluginOptions['labelmapping'] || pluginOptions['labelMapping'];

            // The persistentLabels property is deprecated. Use persistentlabels instead.
            pluginOptions['persistentlabels'] = pluginOptions['persistentlabels'] || pluginOptions['persistentLabels'];

            trackEventMonitorCallbackName = pluginOptions['trackEventMonitor'];

            gPlugin = new ns_.StreamingAnalytics.Plugin(pluginOptions, PLUGIN_PLATFORM_NAME, PLUGIN_VERSION, PLAYER_VERSION, {
                position: getCurrentPosition,
                preMeasurement: function (currentState, newEvent) {
                    var apiCallName = 'notify' + eventTypeToAPICallMapping[newEvent];

                    trackEventMonitorLoggingNotify(apiCallName, getCurrentPosition());

                    return true;
                }
            });
            gPlugin.setSmartStateDetection(false); // Disabled until setting the clip
            gPlugin.setDetectPlay(true);
            gPlugin.setDetectEnd(true);
            gPlugin.setDetectPause(true);

            gPlugin.setDetectSeek(false);

            setBasicPersistentLabels();
            exposeAPI();

            gPlugin.addMeasurementListener(extendDvrLiveStreamSupport);

            playerPluginInstance.getPlayer().triggerHelper("onComScoreStreamingTagReady", [self]);

            gPlugin.log("ComScore initialised");
        }

        function attachEvents() {
            for (var eventName in eventsToListen) {
                playerPluginInstance.bind(eventName + '.comscore', eventsToListen[eventName]);
            }

            for (eventName in eventsToListen_addJsListener) {
                playerPluginInstance.getPlayer().addJsListener(eventName + '.comscore', eventsToListen_addJsListener[eventName]);
            }
        }

        function getCurrentPosition() {
            if (isAd) return NaN;

            // Normal streams and DVR (live with seek support) streams will enable return a position.
            // In a DVR stream, the reported position is relative to the time the server started streaming to the user.
            // In Live Streams, the reported position will be always 0.
            var playerPosition = Math.floor(playerAPIHelpers.getCurrentTime() * 1000);

            if(isDVRStream) {
                lastReportedPositionOffset = Math.floor(playerAPIHelpers.getDuration() * 1000 - playerPosition);
            }

            return playerPosition;
        }

        // Callbacks

        function onPlaylistReady () {
            isPlaylistLoaded = true;

            var playbackSessionLabels = getPlaybackSessionLabels();

            trackEventMonitorLoggingApi('createPlaybackSession', playbackSessionLabels);
            gPlugin.createPlaybackSession(playbackSessionLabels);
        }

        // Dispatches when the player is ready to play the media. playerReady event is dispatched each time media is changed.
        function onPlayerReady () {
            // onPlaylistReady will be executed when there is an actual playlist.
            if (!isPlaylistLoaded) {
                var playbackSessionLabels = getPlaybackSessionLabels();

                trackEventMonitorLoggingApi('createPlaybackSession', playbackSessionLabels);
                gPlugin.createPlaybackSession(playbackSessionLabels);

                isPlaylistLoaded = true;
            }

            clipPartNumber = 1;

            var assetLabels = getAssetLabels();

            trackEventMonitorLoggingApi('setAsset', assetLabels, "detectedAutomaticPlaylistLoop=" + detectedAutomaticPlaylistLoop);
            gPlugin.setAsset(assetLabels, detectedAutomaticPlaylistLoop, getAssetMetadata(), true);

            detectedAutomaticPlaylistLoop = false;

            // Iphone native player do not trigger seek events.
            if(mw.isIphone() && !workaround_is_iphone_detect_seeking_events_set) {
                var iphoneVideoEl = playerPluginInstance.getPlayer().getPlayerElement();

                if(iphoneVideoEl == null) return;

                workaround_is_iphone_detect_seeking_events_set = true;

                iphoneVideoEl.addEventListener('seeking', function(e) {
                    trackEventMonitorLoggingNotify('notifySeekStart', getCurrentPosition());

                    // STA is smart enough to handle several and repetitive calls.
                    gPlugin.notifySeekStart();
                });
            }
        }
        
        function onPreSeek() {
            trackEventMonitorLoggingNotify('notifySeekStart', getCurrentPosition());
            gPlugin.notifySeekStart();
        }

        function onSeek() {
            trackEventMonitorLoggingNotify('notifySeekStart', getCurrentPosition());
            gPlugin.notifySeekStart();
        }
        
        function onMediaLoaded() {
            if(isAd) return;

            var enableSmartStateDetection = !playerAPIHelpers.isLive() || isDVRStream;
            gPlugin.setSmartStateDetection(enableSmartStateDetection);
        }

        function onPlaylistLastEntry() {
            detectingAutomaticPlaylistLoop = true;
        }

        function onPlaylistPlayNext() {
            detectedAutomaticPlaylistLoop = true;
        }

        /*
        * The plugin uses this event to determine whether or not the actual live stream is a DVR or a normal Live Stream.
        * Live Streams do not report stream position, in contrast with DVR streams.
        * It is expected that this event is fired only after the DVR positions are available to be retrieved.
        * If the event is fired and there is no position, then it will assume the stream is a Live stream (non-dvr).
        * */
        function onBufferProgressLive() {
            // Live streams but not DVR.
            if(!playerAPIHelpers.isLive()) return;

            if(isLiveStreamTypeConfigured) return;
            isLiveStreamTypeConfigured = true;

            if(getCurrentPosition()) {
                isDVRStream = true;
                gPlugin.setSmartStateDetection(true);
                dvrInitialWindow = Math.floor(playerAPIHelpers.getDuration() * 1000);
            } else {
                isDVRStream = false;
                gPlugin.setSmartStateDetection(false);

                // Initial play for live non-dvr streams
                trackEventMonitorLoggingNotify('notifyPlay', getCurrentPosition());
                gPlugin.notifyPlay();
            }
        }

        /*
        * This events only apply for pure live streams (non DVR streams).
        *
        * Each time the player starts playing, this event is fired.
        * After this event is fired, an immediate bufferStartEvent uses to appear.
        * Therefore we delay this event until we get a bufferEndEvent.
        *
        * playerPlayed -> bufferStartEvent -> bufferEndEvent -> starts playing
        * */
        function onPlayerPlayedLive() {
            // Live streams but not DVR.
            if(!playerAPIHelpers.isLive() || isDVRStream) return;

            clearTimeout(workaround_initial_play_live_streams);
            workaround_initial_play_live_streams = setTimeout(function() {
                trackEventMonitorLoggingNotify('notifyPlay', getCurrentPosition());
                gPlugin.notifyPlay();
            }, 250);
        }

        /*
        * See description in onPlayerPlayedLive method.
        * */
        function onBufferStartEventLive() {
            if(!playerAPIHelpers.isLive()) return;

            clearTimeout(workaround_initial_play_live_streams);
            workaround_initial_play_live_streams = null;
        }

        /*
         * See description in onPlayerPlayedLive method.
         * */
        function onBufferEndEventLive() {
            if(!playerAPIHelpers.isLive() || isDVRStream || !isLiveStreamTypeConfigured) return;

            trackEventMonitorLoggingNotify('notifyPlay', getCurrentPosition());
            gPlugin.notifyPlay();
        }

        function onPlayerPausedLive() {
            // Live streams but not DVR.
            if(!playerAPIHelpers.isLive() || isDVRStream) return;

            clearTimeout(workaround_initial_play_live_streams);
            workaround_initial_play_live_streams = null;

            trackEventMonitorLoggingNotify('notifyPause', getCurrentPosition());
            gPlugin.notifyPause();
        }

        function onDurationChange() {
            if (adInfo) return;

            // We do not report the clip length.
            if (playerAPIHelpers.isLive()) return;

            var newDuration = Math.floor(playerAPIHelpers.getDuration() * 1000);
            gPlugin.setAssetLabel("ns_st_cl", newDuration, true);
        }

        function onBufferStartEvent(){
            trackEventMonitorLoggingNotify('notifyBufferStart', getCurrentPosition());
            gPlugin.notifyBufferStart();
        }

        function onBufferEndEvent() {
            trackEventMonitorLoggingNotify('notifyBufferStop', getCurrentPosition());
            gPlugin.notifyBufferStop();
        }

        function onVolumeChanged() {
            updatePlayerVolume();
        }

        function onOnOpenFullScreen(){
            isFullScreen = true;

            updatePlayerWindowState();
        }

        function onOnCloseFullScreen(){
            isFullScreen = false;

            updatePlayerWindowState();
        }

        function onOnAdPlay(e, adId, adSystem, adType, adPosition, adDuration, adPodPosition, adPodStartTime, adTitle, traffickingParameters) {
            // Overlay does not set this as true.
            if (!isAd) return;

            if (adType != 'preroll' && adType != 'postroll' && adType != 'midroll') return;

            // Sometimes onAdPlay is executed several times for the same Ad.
            if (adInfo) return;

            adInfo = {
                adId: adId,
                adSystem: adSystem,
                adType: adType,
                adPosition: adPosition,
                adDuration: adDuration,
                adPodPosition: adPodPosition,
                adPodStartTime: adPodStartTime,
                adTitle: adTitle,
                traffickingParameters: traffickingParameters
            };

            adNumber++;

            var assetLabels = getAssetLabels();

            trackEventMonitorLoggingApi('setAsset', assetLabels, "detectedAutomaticPlaylistLoop=false");
            gPlugin.setAsset(assetLabels, false, null, true);

            trackEventMonitorLoggingNotify('notifyPlay', getCurrentPosition());
            gPlugin.notifyPlay();
        }

        function onOnAdSkip () {
            trackEventMonitorLoggingNotify('notifySkipAd', getCurrentPosition());
            gPlugin.notifySkipAd();

            adInfo = null;
        }

        function onOnAdComplete() {
            // If onAdSkip event was triggered, it ended the ad before.
            if (!adInfo) return;

            var currentPosition =  Math.floor(adInfo.adDuration * 1000);

            trackEventMonitorLoggingNotify('notifyEnd', currentPosition);
            gPlugin.notifyEnd( currentPosition );

            adInfo = null;
        }

        function onAdClick() {
            trackEventMonitorLoggingNotify('notifyCallToAction', getCurrentPosition());
            gPlugin.notifyCallToAction();
        }

        function onPlayerPausedAds() {
            if(!isAd || !adInfo) return;

            trackEventMonitorLoggingNotify('notifyPause', getCurrentPosition());
            gPlugin.notifyPause();
        }

        function onOnPlayerStateChangeAds(newState) {
            if(!isAd || !adInfo) return;

            if(newState == 'pause') {
                trackEventMonitorLoggingNotify('notifyPause', getCurrentPosition());
                gPlugin.notifyPause();
            } else if (newState == 'play') {
                trackEventMonitorLoggingNotify('notifyPlay', getCurrentPosition());
                gPlugin.notifyPlay();
            }

        }

        function onAdSupport_StartAdPlayback(adPosition) {
            isAd = true;
            adNumber = 0;

            gPlugin.setSmartStateDetection(false);
        }
        
        function onAdSupport_EndAdPlayback() {
            isAd = false;
            clipPartNumber++;

            var assetLabels = getAssetLabels();

            trackEventMonitorLoggingApi('setAsset', assetLabels, "detectedAutomaticPlaylistLoop=false");
            gPlugin.setAsset(assetLabels, false, getAssetMetadata(), true);

            var enableSmartStateDetection = !playerAPIHelpers.isLive() || isDVRStream;
            gPlugin.setSmartStateDetection(enableSmartStateDetection);
        }

        //Helper functions

        function exposeAPI() {
            self.destroy = destroyPlugin;
            self.addMeasurementListener = function (onMeasurementListener) {
                gPlugin.addMeasurementListener(onMeasurementListener);
            };
        }
        
        function destroyPlugin() {
            gPlugin.release();
        }

        function setBasicPersistentLabels() {
            updatePlayerVolume();
        }

        function extendDvrLiveStreamSupport(onMeasurementSendLabels) {
            if(!isDVRStream) return;

            onMeasurementSendLabels["ns_st_ldw"] = dvrInitialWindow + "";
            onMeasurementSendLabels["ns_st_ldo"] = lastReportedPositionOffset;

            // Playback rate is always going to be 1.
            onMeasurementSendLabels["ns_st_ap"] = onMeasurementSendLabels["ns_st_pt"];
            onMeasurementSendLabels["ns_st_dap"] = onMeasurementSendLabels["ns_st_dpt"];
        }

        function updatePlayerVolume() {
            var newPlayerVolume = Math.floor( playerAPIHelpers.getPlayerVolume() * 100 );

            trackEventMonitorLoggingNotifyChange("notifyChangeVolume", newPlayerVolume);
            gPlugin.notifyChangeVolume(newPlayerVolume);
        }

        function updatePlayerWindowState() {
            var newPlayerWindowState = isFullScreen ? 'full' : 'norm';

            trackEventMonitorLoggingNotifyChange("notifyChangeWindowState", newPlayerWindowState);
            gPlugin.notifyChangeWindowState(newPlayerWindowState);
        }

        function getAssetLabels() {
            var labels = {};

            var mediaProxyEntry = playerAPIHelpers.getMediaProxyEntry();

            // add common labels

            // Audio is not tested.
            labels.ns_st_ty = playerAPIHelpers.isAudio() ? "audio" : 'audio';

            labels.ns_st_pl = mediaProxyEntry.name;
            labels.ns_st_pr = mediaProxyEntry.name;
            labels.ns_st_ep = mediaProxyEntry.name;

            if (playerAPIHelpers.isLive())
                labels.ns_st_li = "1";

            // Audio only Ads needs to be tested.
            if (isAd) {
                labels.ns_st_ci = adInfo.adId;
                labels.ns_st_pn = "1"; // Current part number of the ad. Always assume part 1.
                labels.ns_st_tp = "1"; // Always assume ads have a total // Playlist title. of 1 parts.
                labels.ns_st_cl = Math.floor(adInfo.adDuration * 1000); // Length of the ad in milliseconds.

                labels.ns_st_an = adNumber + "";

                if (adInfo.adType == 'preroll') {
                    labels.ns_st_ad = "pre-roll";
                    labels.ns_st_ct = "va11";
                } else if (adInfo.adType == 'postroll') {
                    labels.ns_st_ad = "post-roll";
                    labels.ns_st_ct = "va13";
                } else if (adInfo.adType == 'midroll') {
                    labels.ns_st_ad = "mid-roll";
                    labels.ns_st_ct = "va12";
                } else {
                    // This should never happen.
                    labels.ns_st_ad = 1;
                }

                if(adInfo.adSystem)
                    labels.ns_st_ams = adInfo.adSystem.toLowerCase();

                if (adInfo.adTitle)
                    labels.ns_st_amt = adInfo.adTitle;

            } else {

                //It might not have the final value at this point (0x0 instead)
                if (mediaProxyEntry.width && mediaProxyEntry.height)
                    labels.ns_st_cs = mediaProxyEntry.width + "x" + mediaProxyEntry.height;
                else
                    labels.ns_st_cs = "0x0";

                if (mediaProxyEntry.downloadUrl)
                    labels.ns_st_cu = mediaProxyEntry.downloadUrl;

                //It might not have the final value at this point (0 instead)
                // In live streams it will always report 0.
                // However, the kdp duration will report a value in the case of DVR.
                labels.ns_st_cl = mediaProxyEntry.msDuration; // or .duration in seconds
                labels.ns_st_ci = mediaProxyEntry.id;
                labels.ns_st_pn = clipPartNumber + "";
                labels.ns_st_tp = "0";
                labels.ns_st_ct = "vc00"; //TODO when knowing the total parts?

                labels.ns_st_ct = playerAPIHelpers.isAudio() ? "ac00" : "vc00";
            }

            return labels;
        }

        function getPlaybackSessionLabels () {
            var labels = {};

            return labels;
        }

        function getAssetMetadata() {
            var mediaProxyEntry = playerAPIHelpers.getMediaProxyEntry();
            return [{
                prefix: '',
                map: mediaProxyEntry
            }];
        }

        function trackEventMonitorLoggingNotifyChange(notifyChangeApiCallName, newValue) {
            var apiCallArgs = [newValue];

            trackEventMonitorLoggingApi(notifyChangeApiCallName, apiCallArgs);
        }

        function trackEventMonitorLoggingNotify(apiCallName, position) {
            var apiCallArgs = [];

            if(!isNaN(position)) apiCallArgs.push(position);

            trackEventMonitorLoggingApi(apiCallName, apiCallArgs);
        }

        function trackEventMonitorLoggingApi(apiCallName, apiCallArgs) {
            if(!trackEventMonitorCallbackName) return;

            var trackEventMonitorCallback = parent.window[trackEventMonitorCallbackName];

            if(typeof trackEventMonitorCallback != 'function') return;

            trackEventMonitorCallback([apiCallName].concat(apiCallArgs));
        }

        // Player API helpers
        var playerAPIHelpers = {
            getKdpProp: function (componentObject) {
                return playerPluginInstance.getPlayer().evaluate('{' + componentObject + '}');
            },
            isLive: function () {
                // return true;
                return playerAPIHelpers.getKdpProp('mediaProxy.isLive');
            },
            getCurrentTime: function () {
                return playerAPIHelpers.getKdpProp('video.player.currentTime');
            },
            getDuration: function () {
                return playerAPIHelpers.getKdpProp('duration');
            },
            getMediaProxyEntry: function () {
                return playerAPIHelpers.getKdpProp('mediaProxy.entry');
            },
            getPlayerVolume: function () {
                return playerAPIHelpers.getKdpProp('video.volume');
            },
            isAudio: function () {
                return playerPluginInstance.getPlayer().isAudio();
            }
        };

        init();
    }

    mw.KalturaComScoreSTAPlugin = KalturaComScoreSTAPlugin;
})(window.mw);