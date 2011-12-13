/**
* Conviva Kaltura HTML5 Library
* 
*/

// To be replaced automatically by the set_version script
var ConvivaLivePassVersion = "2.39.0.49160";

(function(mw, $) {

mw.Conviva = function(embedPlayer, callback, config) {
    this.init(embedPlayer, callback, config);
};

mw.Conviva.prototype = {

    KALTURA_HTML5_VERSION: "1.5",
    
    LIST_DELIMITER: ";", // use ; as tags delimiter
    KEY_VALUE_DELIMITER: "|", // use | as key/value delimiter
    
    currentSession: null,
    videoElement: null,
    
    // Bind postfix for all Conviva bindings
    bindPostfix: ".Conviva",
    
    init: function(embedPlayer, callback, config) {
        this.embedPlayer = embedPlayer;
        this.callback = callback;
        this.config = config;
        
        // add player bindings earlier to prevent 'playerReady' not firing before 'firstPlay'
        this.addPlayerBindings();
        
        // load LivePass as early as we can too
        // skip if already loaded for cases when init is called repeatedly to refresh the uiConfig
        if (typeof Conviva == 'undefined') {
            this.loadLivePass();
        } else {
            this.postInit();
        }
    },
    
    addPlayerBindings: function() {
        var _this = this;
        
        this.embedPlayer.unbindHelper('playerReady' + this.bindPostfix);
        this.embedPlayer.bindHelper('playerReady' + this.bindPostfix, function() {
            // set reference to the <video> element
            _this.videoElement = _this.embedPlayer.getPlayerElement();
        });
        
        this.embedPlayer.unbindHelper('firstPlay' + this.bindPostfix);
        this.embedPlayer.bindHelper('firstPlay' + this.bindPostfix, function() {
            _this.startSession();
        });
    },
    
    loadLivePass: function() {
        var _this = this;
        
        $.ajax({
            type: 'GET',
            url: 'http://livepassdl.conviva.com/ver/' + ConvivaLivePassVersion + '/LivePass.js?c3.customerName=' + this.config['convivaCustomerId'],
            dataType: 'script',
            timeout: this.config['convivaAjaxTimeout'],
            success: function() {
                _this.onLivePassLoaded();
            },
            error: function() {
                mw.log('Conviva: Error: Conviva LivePass failed to load or timed out!');
                // proceed if Conviva's LivePass.js fails to load or times out
                _this.callback();
           }
        });
    },
    
    onLivePassLoaded: function() {
        // Initialize LivePass
        Conviva.LivePass.init(this.config['convivaServiceUrl'], this.config['convivaCustomerId'], this.livePassCallback);
        
        // Disable LivePass traces if Kaltura is NOT in the debug mode
        Conviva.LivePass.toggleTraces(mw.getConfig('debug'));
        
        this.postInit();
    },
    
    postInit: function() {
        this.addExtraConfig();
        this.parsePlayerTags();
        this.parseEntryMetadataTags();
        
        // Must issue the callback so the player build out continues
        this.callback();
    },
    
    livePassCallback: function(convivaNotification) {
        var s = '';
        if (convivaNotification.code == 0) {
            s = 'Conviva: LivePass initialized';
        } else if (convivaNotification.code == 30) {
            s = 'Conviva: Player Insight: Metrics Quota Exceeded';
        } else {
            s = 'Conviva: LivePass initialization failed';
        }
        mw.log(s + ' (code: ' + convivaNotification.code + '; message: ' + convivaNotification.message + '; contentName: ' + convivaNotification.objectId + ')');
    },
    
    addExtraConfig: function() {
        var extraConfig = this.embedPlayer.getKalturaConfig( 'Conviva', [ 'playerTags', 'tags', 'entryMetadataTags', 'cdnName', 'viewerId', 'deviceType', 'playerName' ] );
        
        var _this = this;
        
        $.each(extraConfig, function(key, value) {
            _this.config[key] = value;
        });
    },
    
    parsePlayerTags: function() {
    
        // A string of semi-colon (;) separated key|value pairs (e.g. "playerVersion|1.0;customTag|customValue;")
        var tagString = this.config['playerTags'];
        tagString = $.trim(tagString);
        
        // Legacy. Read from "tags" conf value if "playerTags" is not present
        if (! tagString) {
            tagString = this.config['tags'];
            tagString = $.trim(tagString);
        };
        
        if (! tagString) return;
        
        mw.log('Conviva: playerTags string: "' + tagString + '"');
        
        // remove trailing semi-colons
        while (tagString.lastIndexOf(this.LIST_DELIMITER) == tagString.length - 1 && tagString.length != 0) {
            tagString = tagString.substr(0, tagString.length - 1);
        }
        
        var tagsArray = tagString.split(this.LIST_DELIMITER);
        if (tagsArray.length <= 0) return;
        
        // A dictionary used to store processed tags
        this.tags = {};
        
        var _this = this;
        
        $.each(tagsArray, function(index, arrayElement) {
            var tagKeyValue = arrayElement.split(_this.KEY_VALUE_DELIMITER);
            
            if (! tagKeyValue || tagKeyValue.length != 2) {
                mw.log('Conviva: tag "' + this + '" is misconfigured');
                return;
            }
            
            _this.tags[$.trim(tagKeyValue[0])] = $.trim(tagKeyValue[1]);
        });
    },
    
    parseEntryMetadataTags: function() {
      
        // A string of semi-colon (;) separated keys to be mapped to extra tags populated with the Kaltura entry metadata
        // (e.g. "DisplayName;LegacyAssetId;Property;PropertyName;Provider;")
        var tagString = this.config['entryMetadataTags'];
        tagString = $.trim(tagString);
        if (! tagString) return;
        
        mw.log('Conviva: entryMetadataTags string: "' + tagString + '"');
        
        // remove trailing semi-colons
        while (tagString.lastIndexOf(this.LIST_DELIMITER) == tagString.length - 1 && tagString.length != 0) {
            tagString = tagString.substr(0, tagString.length - 1);
        }
        
        var tagsArray = tagString.split(this.LIST_DELIMITER);
        if (tagsArray.length <= 0) return;
        
        // An array to store individual keys
        this.entryMetadataTags = tagsArray;
    },
    
    startSession: function() {
        
        if (! this.videoElement || typeof Conviva == 'undefined') return;
        
        this.cleanupCurrentSession();
        
        var entryId       = this.embedPlayer.evaluate('{mediaProxy.entry.id}'      );
        var name          = this.embedPlayer.evaluate('{mediaProxy.entry.name}'    );
        var entryMetadata = this.embedPlayer.evaluate('{mediaProxy.entryMetadata}' );
        var isLive        = this.embedPlayer.evaluate('{mediaProxy.isLive}'        );
        debugger;
        var _this = this;
        
        // Add metadata based tags if entryMetadataTags parameter and entryMetadata are present
        if ( this.entryMetadataTags && entryMetadata ) {
            $.each(this.entryMetadataTags, function(index, arrayElement) {
                if ( entryMetadata[arrayElement] ) { // add extra tags only if a metadata value is present
                    _this.tags[arrayElement] = entryMetadata[arrayElement];
                }
            });
        }
        
        var assetName = '[' + (entryId ? entryId : 'N/A' ) + '] ' + (name ? name : 'N/A');
        
        var convivaMetadata = Conviva.ConvivaContentInfo.createInfoForLightSession( assetName );
        convivaMetadata.cdnName = this.config['cdnName'] ? this.config['cdnName'].toUpperCase() : Conviva.ConvivaContentInfo.CDN_NAME_OTHER;
        convivaMetadata.streamUrl = this.videoElement.src ? this.videoElement.src : 'N/A';
        convivaMetadata.isLive = isLive ? isLive : false;
        if (this.tags) convivaMetadata.tags = this.tags;
        
        if (this.config['viewerId'  ]) convivaMetadata.viewerId   = this.config['viewerId'  ];
        if (this.config['deviceType']) convivaMetadata.deviceType = this.config['deviceType'];
        if (this.config['playerName']) convivaMetadata.playerName = this.config['playerName'];
        
        convivaMetadata.pluginVersion    = ConvivaLivePassVersion;
        convivaMetadata.frameworkVersion = this.KALTURA_HTML5_VERSION;
        convivaMetadata.frameworkName    = Conviva.ConvivaContentInfo.FRAMEWORK_NAME_KALTURA;
        convivaMetadata.ovppName         = Conviva.ConvivaContentInfo.OVPP_NAME_KALTURA;
        convivaMetadata.pluginName       = Conviva.ConvivaContentInfo.PLUGIN_NAME_KALTURA;
        
        this.currentSession = Conviva.LivePass.createSession( this.videoElement, convivaMetadata );
    },
    
    cleanupCurrentSession: function() {
        if (this.currentSession) this.currentSession.stopMonitor();
        Conviva.LivePass.cleanupMonitoringSession(this.videoElement);
    }
    
};

})(window.mw, jQuery);