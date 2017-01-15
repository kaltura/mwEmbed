/**
 * Created by einatr on 6/8/15.
 */
(function(mw, $) {
    'use strict';

    $.extend(KalturaHeartbeatPluginDelegate.prototype, ADB.va.plugins.ah.AdobeHeartbeatPluginDelegate.prototype);

    function KalturaHeartbeatPluginDelegate() {
    }

    KalturaHeartbeatPluginDelegate.prototype.onError = function(errorInfo) {
        console.log("AdobeHeartbeatPlugin error: " + errorInfo.getMessage() + " | " + errorInfo.getDetails());
    };

    // Export symbols.
    window.KalturaHeartbeatPluginDelegate = KalturaHeartbeatPluginDelegate;
})(window.mw, window.jQuery);