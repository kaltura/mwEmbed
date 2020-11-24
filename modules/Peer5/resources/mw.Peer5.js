(function(mw) {
    "use strict";

    var Peer5Plugin = mw.KBasePlugin.extend({
        asyncInit: true,

        setup: function() {
            var thi$ = this;
            var completed = 0;
            var finished = false;

            var apiKey = this.getConfig('apiKey') || this.getConfig('apikey');
            if (!apiKey) {
                mw.log('Peer5: A required config attribute "apiKey" is missing. Plugging out.');
                return this.initCompleteCallback()
            }

            var scripts = [
                'https://api.peer5.com/peer5.js?id=' + apiKey,
                'https://api.peer5.com/peer5.kaltura.plugin.js'
            ];

            function onScriptLoad() {
                completed++;
                if (finished || completed < scripts.length) return;
                finished = true;
                mw.log('Peer5: Successfully loaded scripts, Peer5 is integrated.');
                thi$.initCompleteCallback();
            }

            function onScriptError() {
                if (finished) return;
                finished = true;
                mw.log('Peer5: Failed loading scripts, continuing without Peer5.');
                thi$.initCompleteCallback();
            }

            scripts.forEach(function(src) {
                var s = document.createElement('script');
                s.src = src;
                s.onload = onScriptLoad;
                s.onerror = onScriptError;
                (document.body || document.head).appendChild(s);
            });
        }
    });

    mw.PluginManager.add('peer5', Peer5Plugin);
}(window.mw, window.jQuery));
