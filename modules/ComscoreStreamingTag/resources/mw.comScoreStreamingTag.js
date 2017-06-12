/**
 * comScore Streaming Analytics loader
 */
(function (mw) {
    "use strict";

    mw.PluginManager.add('comScoreStreamingTag', mw.KBasePlugin.extend({
        setup: function () {
            this.kalturaComScoreSTAPlugin = new mw.KalturaComScoreSTAPlugin(this);
        },

        destroy: function () {
            this.kalturaComScoreSTAPlugin.destroy();
        }
    }));

})(window.mw);
