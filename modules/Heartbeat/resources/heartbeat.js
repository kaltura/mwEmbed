/**
 * Created by einatr on 6/3/15.
 */
( function( mw, $ ) {
    "use strict";

    mw.PluginManager.add( 'heartbeat', mw.KBasePlugin.extend({

        defaultConfig: {
            debugLogging: true //TODO: set this parameter to false by the end of development

             /*HEARTBEAT: {
                TRACKING_SERVER: 'http://metrics.adobeprimetime.com',
                JOB_ID: 'j2',
                PUBLISHER: 'test-publisher',
                CHANNEL: 'test-channel',
                OVP: 'test-ovp',
                SDK: 'test-sdk'
            }*/
        },

        setup: function() {
            this.setupAdobeVars();
            this.setupHeartBeatPlugin();
            this.addMetadata(); //TODO: move to events
            this.addBindings();
        },

        addBindings: function() {
            var _this = this;

        },

        setupAdobeVars: function(){
            //TODO: add validations

            //define visitor instance
            var visitor = new Visitor(this.getConfig().visitorId);
            visitor.trackingServer = this.getConfig().visitorTrackingServer;

            //define appMeasurment component
            this.appMeasurement = new AppMeasurement();
            this.appMeasurement.visitor = visitor;
            this.appMeasurement.trackingServer = this.getConfig().appMeasurmentTrackingServer;
            this.appMeasurement.account = this.getConfig().appMeasurmentAccount;
            this.appMeasurement.pageName = this.getConfig().appMeasurmentPageName;
            this.appMeasurement.charSet = this.getConfig().appMeasurmentCharSet;
            this.appMeasurement.visitorID = this.getConfig().appMeasurmentVisitorID;

            //TODO: add validations for heartbeat MANDATORY config params as well: this.getConfig().heartbeatTrackingServer, this.getConfig().heartbeatPublisher

            //TODO: add error handling for missing configuration case
        },

        setupHeartBeatPlugin: function(){
            // Setup the video-player plugin
            this.videoPlayerPlugin = new ADB.va.plugins.videoplayer.VideoPlayerPlugin(new KalturaVideoPlayerPluginDelegate(this.getPlayer(), this.getConfig()));
            this.configureVideoPlayerPlugin();

            // Setup the AppMeasurement plugin.
            this.adobeAnalyticsPlugin = new ADB.va.plugins.aa.AdobeAnalyticsPlugin(this.appMeasurement, new KalturaAdobeAnalyticsPluginDelegate());
            this.configureAdobeAnalyticsPlugin();

            // Setup the AdobeHeartbeat plugin.
            this.heartbeatPlugin = new ADB.va.plugins.ah.AdobeHeartbeatPlugin(new KalturaHeartbeatPluginDelegate());
            this.configureHeartbeatPlugin();

            var plugins = [this.videoPlayerPlugin, this.adobeAnalyticsPlugin, this.heartbeatPlugin];

            // Setup and configure the Heartbeat lib.
            debugger;
            this.heartbeatLib = ADB.va.Heartbeat(new KalturaHeartbeatDelegate(), plugins);
            alert("Heart plugin :: setupHeartBeatPlugin function :: this.heartbeatLib = "+ this.heartbeatLib);
            //this.configureHeartbeatLib();

        },

        configureVideoPlayerPlugin: function(){
            var videoPlayerPluginConfig = new ADB.va.plugins.videoplayer.VideoPlayerPluginConfig();

            //TODO: check and add all possible configuration parameters

            videoPlayerPluginConfig.debugLogging = this.getConfig().debugLogging;
            this.videoPlayerPlugin.configure(videoPlayerPluginConfig);
        },

        configureAdobeAnalyticsPlugin: function(){
            var aaPluginConfig = new ADB.va.plugins.aa.AdobeAnalyticsPluginConfig();
            if ( this.getConfig().heartbeatChannel )
                aaPluginConfig.channel = this.getConfig().heartbeatChannel;

            //TODO: check and add all possible configuration parameters

            aaPluginConfig.debugLogging = this.getConfig().debugLogging;
            this.adobeAnalyticsPlugin.configure(aaPluginConfig);
        },

        configureHeartbeatPlugin: function(){
            var ahPluginConfig = new ADB.va.plugins.ah.AdobeHeartbeatPluginConfig(
                this.getConfig().heartbeatTrackingServer,
                this.getConfig().heartbeatPublisher);
            if ( this.getConfig().heartbeatOVP )
                ahPluginConfig.ovp = this.getConfig().heartbeatOVP;
            if (this.getConfig().heartbeatSDK )
                ahPluginConfig.sdk = this.getConfig().heartbeatSDK;

            //TODO: check and add all possible configuration parameters

            ahPluginConfig.debugLogging = this.getConfig().debugLogging;
            this.heartbeatPlugin.configure(ahPluginConfig);
        },

        configureHeartbeatLib: function(){
            var configData = new ADB.va.HeartbeatConfig();

            //TODO: check and add all possible configuration parameters

            configData.debugLogging = this.getConfig().debugLogging;
            this.heartbeatLib.configure(configData);
        },

        addMetadata: function(){
            //TODO: check for all kind of metadata that can be added to this.adobeAnalyticsPlugin object

            //add before calling trackVideoLoad()
            this.adobeAnalyticsPlugin.setVideoMetadata({

            });

            //add before calling trackAdStart()
            this.adobeAnalyticsPlugin.setAdMetadata({

            });

            //add before calling trackChapterStart()
            this.adobeAnalyticsPlugin.setChapterMetadata({

            });
        }

    }));
} )( window.mw, window.jQuery );