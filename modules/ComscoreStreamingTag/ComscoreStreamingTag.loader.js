/**
 * comScore Streaming Analytics loader
 */
(function (mw) {
    "use strict";
    mw.kalturaPluginWrapper(function () {
        mw.PluginManager.add('comScoreStreamingTag', mw.KBaseComponent.extend({
            setup: function () {
                this.kalturaComScoreSTAPlugin = new mw.KalturaComScoreSTAPlugin(this);
            },

            destroy: function () {
                this.kalturaComScoreSTAPlugin.destroy();
            }
        }));
    });
})(window.mw);
