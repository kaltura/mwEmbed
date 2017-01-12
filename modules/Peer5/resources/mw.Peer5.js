(function (mw, $) {
    "use strict";

    // NOTE We assume that HlsJs plugin (a manifested dependency) is defined/added to this point

    var Peer5Plugin =  mw.KBasePlugin.extend({
        asyncInit: true,

        defaultConfig: {
            setupTimeout: 3000
            // peer5JsUrl: 'https://peer5.com/peer5.js?id=XXXXXX'
            // peer5HlsjsPluginJsUrl: 'https://peer5.com/peer5.hlsjs.plugin.js'
        },

        setup: function() {
            var that = this;
            var config = {};
            var configValid = true;

            var tAnyway = setTimeout(setupCompleteCallback, setTimeout);

            function setupCompleteCallback() {
                if (tAnyway) {
                    clearTimeout(tAnyway);
                    tAnyway = null;
				            that.initCompleteCallback();
                }
            }

            ['setupTimeout', 'peer5JsUrl', 'peer5HlsjsPluginJsUrl'].forEach(function(key) {
                config[key] = that.getConfig(key);
                if (!config[key]) {
                    mw.log('Peer5: A required config attribute "' + key + '" is missing. Plugging out.');
                    configValid = false;
                }
            });
            if (!configValid) {
                return setupCompleteCallback();
            }
            if (!isFinite(config.setupTimeout)) {
                mw.log('Peer5: A required config attribute "setupTimeout" is invalid. Plugging out.');
                return setupCompleteCallback();
            }

            $.getScript(config.peer5JsUrl)
                .done(function() {
                    $.getScript(config.peer5HlsjsPluginJsUrl)
                        .done(setupCompleteCallback)
                        .fail(function(jqxhr, settings, exception) {
                            mw.log('Peer5: Error loading "' + config.peer5HlsjsPluginJsUrl + '". Plugging out.');
                            setupCompleteCallback();
                        });
                })
                .fail(function( jqxhr, settings, exception ) {
                    mw.log('Peer5: Error loading "' + config.peer5JsUrl + '". Plugging out.');
                    setupCompleteCallback();
                });
		    }
	  });

	mw.PluginManager.add('peer5', Peer5Plugin);
}(window.mw, window.jQuery));
