/**
 * Created by karol.bednarz on 2/11/2016.
 * hiding mouse on full screen
 * default hide mouse cursor after 3 seconds, can be change in flashvars via setting delayTime
 * plugin version 1.0
 */
(function (mw, $, kWidget) {
    "use strict";

    mw.PluginManager.add('mouseHide', mw.KBaseComponent.extend({

        defaultConfig: {
            'order': 22,
            'delayTime': 3,
            'parent': ''
        },

        timeout: null,

        setup: function () {
            this.addPlayerBindings();
        },

        /**
         *  Add the player bindings
         */
        addPlayerBindings: function () {
            var _this = this;

            $(document).on('mousemove', function () {
                clearTimeout(_this.timeout);
                _this.embedPlayer.style.cursor = 'pointer';
                var delay = ( _this.getConfig('delayTime') - 1 ) * 1000;
                if (_this.embedPlayer.layoutBuilder.isInFullScreen() && _this.embedPlayer.currentState == "play") {
                    _this.timeout = setTimeout(function () {
                        if(_this.embedPlayer.currentState == "play")
                        _this.embedPlayer.style.cursor = 'none';

                    }, delay);
                }
            });
        }

    }));

})(window.mw, window.jQuery, kWidget);
