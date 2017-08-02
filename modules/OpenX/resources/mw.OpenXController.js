(function(mw, $) { "use strict";

mw.setDefaultConfig({
    'OpenX.skip': 'Skip Ad',
    'OpenX.notice': 'Advertisment {sequenceProxy.timeRemaining|timeFormat}',
});

mw.OpenXController = function(embedPlayer, callback) {
    return this.init(embedPlayer, callback);
};

mw.OpenXController.prototype = {
    // OpenX bindPostfix
    bindPostfix: '.OpenX',

    // PD iframe element id
    pdIframeElementId: 'OpenX-PD',

    // Ad config
    adConfig: {}, 

    /**
     * Init plugin,
     *
     * @param embedPlayer player instance.
     * @param callback player callback.
     */
    init: function(embedPlayer, callback) {
        var self = this;

        self.log('Initializing plugin');
        mw.inherit(this, new mw.BaseAdPlugin(embedPlayer, callback));

        self.adLoader = new mw.AdLoader(self.embedPlayer);
        self.adPlayer = new mw.KAdPlayer(self.embedPlayer);

        // Add cookie sync iframe
        self.addCookieSyncIframe();

        // Ad configuration
        self.initAdConfig();

        // Clear bindings
        self.destroy();

        // Add ad bindings for the defined ad types
        $.each(['preroll', 'postroll'], function(index, adType) {
            if (self.getConfig(adType) != null) {
                self.log('Binding ad type ' + adType);
                self.addAdBinding(adType);
            }
        });

        callback();
    },

    /**
     * Init the ad configuration.
     */
    initAdConfig: function() {
        var self = this;

        var skip = self.getConfig('skip');
        if (skip != null) {
            self.adConfig.skipBtn = {
                text: skip
            }
        }

        var notice = self.getConfig('notice');
        if (notice != null) {
            self.adConfig.skipNotice = {
                evalText: notice
            }
        }
    },

    /**
     * Adds the ad support binding for the given ad type. Supported ad
     * types are preroll and postroll.
     *
     * @param adType ad type.
     */
    addAdBinding: function(adType) {
        var self = this;

        self.embedPlayer.bindHelper('AdSupport_' + adType + self.bindPostfix, function(event, sequenceProxy) {
            self.log('Ad slot for ' + adType);

            var sequenceIndex = self.getSequenceIndex(adType);

            sequenceProxy[sequenceIndex] = function(callback) {
                // Disable UI while playing ad
                self.embedPlayer.adTimeline.updateUiForAdPlayback(adType);

                // Load ad
                self.loadAd(self.getConfig(adType), function(ad) {
                    // Play ad
                    self.playAd(ad, callback);
                });
            };
        });
    },

    /**
     * Loads the ad from the given VAST URL.
     *
     * @param vastUrl VAST URL.
     * @param callback done callback.
     */
    loadAd: function(vastUrl, callback) {
        var self = this;

        self.adLoader.load(vastUrl, function(adResponse) {
           callback($.extend({}, self.adConfig, adResponse));
        });
    },

    /**
     * Plays the given ad if there is any.
     *
     * @param ad ad value.
     * @param callback done callback.
     */
    playAd: function(ad, callback) {
        var self = this;

        if (ad.ads && ad.ads.length > 0) {
            self.log('Start playing the ad');
            self.adPlayer.display(ad, function() {
                callback();
            });
        } else {
            self.log('No ad is received');
            callback();
        }
    },

    /**
     * Adds the iframe to make the pd call to start
     * the cookie sync.
     */
    addCookieSyncIframe: function() {
        var self = this;

        var pdUrl = self.getConfig('pd');

        // Insert the iframe if it is not inserted before
        if (pdUrl != null && document.getElementById(self.pdIframeElementId) == null) {
            $('<iframe>', {
                id: self.pdIframeElementId,
                src: pdUrl,
                width: 0,
                height: 0,
                frameborder: 0,
                style: 'display: none;'
            }).appendTo(document.currentScript.parentElement);
        }
    },

    /**
     * Gets the configuration value for the given key.
     *
     * @param key configuration key.
     * @return configuration value.
     */
    getConfig: function(key) {
        // return this.embedPlayer.getKalturaConfig('OpenX', key);
        return mw.getConfig('OpenX.' + key);
    },

    /**
     * Logs the given messages.
     *
     * @param message log message.
     */
    log: function(message) {
        // console.log('OpenX: ' + message);
    }
};

})(window.mw, window.jQuery);

