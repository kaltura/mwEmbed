(function(mw, $) {
    "use strict";

    var Peer5Plugin = mw.KBasePlugin.extend({
        asyncInit: true,

        setup: function() {
            var thi$ = this;
            var completed = 0;

            var apiKey = this.getConfig('apiKey');
            if (!apiKey) {
                mw.log('Peer5: A required config attribute "apiKey" is missing. Plugging out.');
                return this.initCompleteCallback()
            }

            function setupCompleteCallback() {
                completed++;
                if (completed < 2) return;
                thi$.initCompleteCallback();
            }

            $.ajax({dataType: 'script', url: 'https://api.peer5.com/peer5.js?id=' + apiKey, cache: true})
                .done(setupCompleteCallback)
                .fail(function() {
                    mw.log('Peer5: Error loading peer5 client. Plugging out.');
                    thi$.initCompleteCallback()
                });
            $.ajax({dataType: 'script', url: 'https://api.peer5.com/peer5.kaltura.plugin.js', cache: true})
                .done(setupCompleteCallback)
                .fail(function() {
                    mw.log('Peer5: Error loading peer5.kaltura.plugin Plugging out.');
                    thi$.initCompleteCallback()
                });
        }
    });

    mw.PluginManager.add('peer5', Peer5Plugin);
}(window.mw, window.jQuery));
