/**
 * Created by einatr on 6/3/15.
 */
( function( mw, $ ) {
    "use strict";

    mw.PluginManager.add( 'heartbeat', mw.KBasePlugin.extend({

        defaultConfig: {
            trackEventMonitor: null, // A callback function to track what's being tracked / sent to heartbeat
            debugLogging: false
        },

        setup: function() {
            if ( !this.isValidConfiguration() ) {
                this.setupHeartBeatPluginFail("missing required configuration values");
                return;
            }
            this.loadAdobeClasses();
        },

        isValidConfiguration: function(){
            if( this.getConfig('visitorId') &&
                this.getConfig('visitorTrackingServer') &&
                this.getConfig('appMeasurementTrackingServer') &&
                this.getConfig('appMeasurementAccount') &&
                this.getConfig('appMeasurementVisitorID') &&
                this.getConfig('heartbeatTrackingServer') &&
                this.getConfig('heartbeatPublisher') ){
                return true;
            }
            return false;
        },

        loadAdobeClasses: function(){
            var _this = this;
            var loadVisitor = $.ajax({
                url: mw.getMwEmbedPath()+"modules/Heartbeat/resources/VisitorAPI.js",
                dataType : "script",
                timeout : 5000
            });
            var loadAppMeasurement = $.ajax({
                url: mw.getMwEmbedPath()+"modules/Heartbeat/resources/AppMeasurement.js",
                dataType : "script",
                timeout : 5000
            });
            $.when(loadVisitor, loadAppMeasurement).then(function() {
                _this.setupAdobeVars();
                _this.setupHeartBeatPlugin();
                _this.addBindings();
            }, function() {//error
                _this.setupHeartBeatPluginFail("failed to load Adobe scripts");
            });
        },

        setupAdobeVars: function(){
            //define visitor instance
            var visitor = new Visitor(this.getConfig('visitorId'));
            visitor.trackingServer = this.getConfig('visitorTrackingServer');

            //define appMeasurement component
            this.appMeasurement = new AppMeasurement();
            this.appMeasurement.visitor = visitor;
            this.appMeasurement.trackingServer = this.getConfig('appMeasurementTrackingServer');
            this.appMeasurement.account = this.getConfig('appMeasurementAccount');
            this.appMeasurement.pageName = this.getConfig('appMeasurementPageName');
            this.appMeasurement.charSet = this.getConfig('appMeasurementCharSet');
            this.appMeasurement.visitorID = this.getConfig('appMeasurementVisitorID');
        },

        addBindings: function() {
            var _this = this;
            this.embedPlayer.bindHelper( 'firstPlay', function(){ _this.trackSessionStart(); } );
            this.embedPlayer.bindHelper( 'onplay', function(){ _this.trackPlay(); } );
            this.embedPlayer.bindHelper('seeking', function(){ _this.trackSeekStart(); });
            this.embedPlayer.bindHelper('seeked', function(){ _this.trackSeekEnd(); });
            this.embedPlayer.bindHelper('onpause', function(){ _this.trackPaused(); });
            this.embedPlayer.bindHelper('postEnded', function(){ _this.trackComplete(); });
            this.embedPlayer.bindHelper('bufferStartEvent', function(){ _this.trackBufferStart(); });
            this.embedPlayer.bindHelper('bufferEndEvent', function(){ _this.trackBufferEnd(); });
            this.embedPlayer.bindHelper('sourceSwitchingEnd', function(){ _this.trackBitrateChangeEnd(); });

            this.embedPlayer.bindHelper('onAdPlay', function(event, adID, adSystem, type, adIndex, adDuration, podPosition, podStartTime, mediaName){
                _this.trackAdStart({id:adID, position:adIndex, length:adDuration, name:mediaName, podPosition:podPosition, podStartTime:podStartTime}); });
            this.embedPlayer.bindHelper('onAdComplete', function(){ _this.trackAdComplete(); });

            this.embedPlayer.bindHelper('embedPlayerError', function (e, data) { _this.trackPlayerError(_this.getPlayer().getErrorMessage(data)); });
        },

        setupHeartBeatPlugin: function(){
            // Setup the video-player plugin
            this.videoPlayerPlugin = new ADB.va.plugins.videoplayer.VideoPlayerPlugin(new KalturaVideoPlayerPluginDelegate(this.getPlayer(), this.getConfig()));
            this.configureVideoPlayerPlugin();
            //Setup the AppMeasurement plugin.
            this.adobeAnalyticsPlugin = new ADB.va.plugins.aa.AdobeAnalyticsPlugin(this.appMeasurement, new KalturaAdobeAnalyticsPluginDelegate());
            this.configureAdobeAnalyticsPlugin();

            // Setup the AdobeHeartbeat plugin.
            this.heartbeatPlugin = new ADB.va.plugins.ah.AdobeHeartbeatPlugin(new KalturaHeartbeatPluginDelegate());
            this.configureHeartbeatPlugin();

            var plugins = [this.videoPlayerPlugin, this.adobeAnalyticsPlugin, this.heartbeatPlugin];

            // Setup and configure the Heartbeat lib.
            this.heartbeatLib = new ADB.va.Heartbeat(new KalturaHeartbeatDelegate(), plugins);
            this.configureHeartbeatLib();
        },

        setupHeartBeatPluginFail: function(msg){
            mw.log("HeartBeat plugin :: setupHeartBeatPluginFail :: "+msg);
        },

        configureVideoPlayerPlugin: function(){
            var videoPlayerPluginConfig = new ADB.va.plugins.videoplayer.VideoPlayerPluginConfig();
            if (this.getConfig('AdobeVideoPlayerPluginDebugLogging') ){
                videoPlayerPluginConfig.debugLogging = this.getConfig('AdobeVideoPlayerPluginDebugLogging');
            }else{
                videoPlayerPluginConfig.debugLogging = this.getConfig('debugLogging');
            }
            this.videoPlayerPlugin.configure(videoPlayerPluginConfig);
        },

        configureAdobeAnalyticsPlugin: function(){
            var aaPluginConfig = new ADB.va.plugins.aa.AdobeAnalyticsPluginConfig();
            if ( this.getConfig('heartbeatChannel') ){
                aaPluginConfig.channel = this.getConfig('heartbeatChannel');
            }
            if (this.getConfig('adobeAnalyticsDebugLogging') ){
                aaPluginConfig.debugLogging = this.getConfig('adobeAnalyticsDebugLogging');
            }else{
                aaPluginConfig.debugLogging = this.getConfig('debugLogging');
            }
            this.adobeAnalyticsPlugin.configure(aaPluginConfig);
        },

        configureHeartbeatPlugin: function(){
            var ahPluginConfig = new ADB.va.plugins.ah.AdobeHeartbeatPluginConfig(
                this.getConfig('heartbeatTrackingServer'),
                this.getConfig('heartbeatPublisher'));

            if ( this.getConfig('heartbeatOVP') ){
                ahPluginConfig.ovp = this.getConfig('heartbeatOVP');
            }
            if (this.getConfig('heartbeatSDK') ) {
                ahPluginConfig.sdk = this.getConfig('heartbeatSDK');
            }
            if (this.getConfig('heartbeatSSL') ) {
                ahPluginConfig.ssl = this.getConfig('heartbeatSSL');
            }
            if (this.getConfig('heartbeatQuietMode') ) {
                ahPluginConfig.quietMode = this.getConfig('heartbeatQuietMode');
            }

            if (this.getConfig('heartbeatDebugLogging') ){
                ahPluginConfig.debugLogging = this.getConfig('heartbeatDebugLogging');
            }else{
                ahPluginConfig.debugLogging = this.getConfig('debugLogging');
            }
            this.heartbeatPlugin.configure(ahPluginConfig);
        },

        configureHeartbeatLib: function(){
            var configData = new ADB.va.HeartbeatConfig();
            if (this.getConfig('heartbeatLibDebugLogging') ){
                configData.debugLogging = this.getConfig('heartbeatLibDebugLogging');
            }else{
                configData.debugLogging = this.getConfig('debugLogging');
            }
            this.heartbeatLib.configure(configData);
        },

        trackVideoLoad: function(){
            this.adobeAnalyticsPlugin.setVideoMetadata({

            });
            this.videoPlayerPlugin.trackVideoLoad();
            this.sendTrackEventMonitor("trackVideoLoad");
        },

        trackSessionStart: function(){
            this.trackVideoLoad();
            this.videoPlayerPlugin.trackSessionStart();
            this.sendTrackEventMonitor("trackSessionStart");
        },

        trackPlay: function(){
            if( !this.getPlayer().isInSequence() ){// don't send trackPlay if the player plays an ad
                this.videoPlayerPlugin.trackPlay();
                this.sendTrackEventMonitor("trackPlay");
            }
        },

        trackComplete: function(){
            this.videoPlayerPlugin.trackComplete();
            this.sendTrackEventMonitor("trackComplete");
        },

        trackSeekStart: function(){
            this.videoPlayerPlugin.trackSeekStart();
            this.sendTrackEventMonitor("trackSeekStart");
        },


        trackSeekEnd: function(){
            this.videoPlayerPlugin.trackSeekComplete();
            this.sendTrackEventMonitor("trackSeekEnd");
        },

        trackPaused: function(){
            this.videoPlayerPlugin.trackPause();
            this.sendTrackEventMonitor("trackPaused");
        },

        trackBufferStart: function(){
            this.videoPlayerPlugin.trackBufferStart();
            this.sendTrackEventMonitor("trackBufferStart");
        },

        trackBufferEnd: function(){
            this.videoPlayerPlugin.trackBufferComplete();
            this.sendTrackEventMonitor("trackBufferEnd");
        },

        trackBitrateChangeEnd: function(){
            this.videoPlayerPlugin.trackBitrateChange();
            this.sendTrackEventMonitor("trackBitrateChangeEnd");
        },

        setAdInfo: function(adData){
            if( adData.podPosition ){
                this.setPodInfo(adData);
            }
            var data = {
                id: adData.id,
                position: adData.position,
                length: adData.length,
                name: adData.name ? adData.name : ""
            };
            this.videoPlayerPlugin._delegate.setAdInfo(data);
        },

        setPodInfo: function(adData){
            var data = {
                name: adData.name ? adData.name : "",
                startTime: adData.podStartTime,
                position: adData.podPosition
            };
            this.videoPlayerPlugin._delegate.setAdBreakInfo(data);
        },

        trackAdStart: function(adData){
            this.setAdInfo(adData);
            this.videoPlayerPlugin.trackAdStart();
            this.sendTrackEventMonitor("trackAdStart");
        },

        trackAdComplete: function(){
            this.videoPlayerPlugin.trackAdComplete();
            this.sendTrackEventMonitor("trackAdComplete");
        },

        //not implemented
        trackChapterStart: function(){
            //TODO: this.adobeAnalyticsPlugin.setChapterMetadata({ }); OR this.videoPlayerPlugin._delegate.setChapterInfo({ });
            this.videoPlayerPlugin.trackChapterStart();
            this.sendTrackEventMonitor("trackChapterStart");
        },

        //not implemented
        trackChapterComplete: function(){
            this.videoPlayerPlugin.trackChapterComplete();
            this.sendTrackEventMonitor("trackChapterComplete");
        },

        trackPlayerError: function(msg){
            this.videoPlayerPlugin.trackVideoPlayerError(msg);
            this.sendTrackEventMonitor("trackPlayerError");
        },

        sendTrackEventMonitor: function(methodName) {
            // Send the event to the trackEventMonitor ( if set in the initial options )
            if( this.getConfig( 'trackEventMonitor' ) ) {
                try {
                    window.parent[this.getConfig('trackEventMonitor')](
                        methodName
                    );
                } catch (e) {}
            }
            mw.log("HeartBeat plugin :: "+ methodName);
        }

    }));
} )( window.mw, window.jQuery );