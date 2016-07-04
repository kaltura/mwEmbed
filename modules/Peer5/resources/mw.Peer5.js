(function (mw, $) {
    "use strict";

    // NOTE We assume that HlsJs plugin (a manifested dependency) is defined/added to this point

    var Peer5Plugin =  mw.KBasePlugin.extend({
        asyncInit: true,

        defaultConfig: {
            setupTimeout: 3000
            // peer5JsUrl: 'https://api.peer5.com/peer5.js?id=XXXXXX'
            // peer5HlsjsPluginJsUrl: 'https://api.peer5.com/peer5.hlsjs.plugin.js'
        },

        setup: function() {
            var that = this;
            var config = {};
            var configValid = true;
            var tAnyway = true;

            function setupCompleteCallback() {
                if (tAnyway) {
                    if (tAnyway !== true) {
                        clearTimeout(tAnyway);
                    }
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

            tAnyway = setTimeout(setupCompleteCallback, config.setupTimeout);

            $.ajax({ dataType: 'script', url: config.peer5JsUrl, cache: true })
                .done(function() {
                    $.ajax({ dataType: 'script', url: config.peer5HlsjsPluginJsUrl, cache: true })
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
