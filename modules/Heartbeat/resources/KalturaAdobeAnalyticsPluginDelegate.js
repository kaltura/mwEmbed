/**
 * Created by einatr on 6/8/15.
 */
(function(mw, $) {
    'use strict';
    $.extend(KalturaAdobeAnalyticsPluginDelegate.prototype, ADB.va.plugins.aa.AdobeAnalyticsPluginDelegate.prototype);

    function KalturaAdobeAnalyticsPluginDelegate() {
    }

    KalturaAdobeAnalyticsPluginDelegate.prototype.onError = function(errorInfo) {
        mw.log("HeartBeat plugin :: AdobeAnalyticsPlugin error: " + errorInfo.getMessage() + " | " + errorInfo.getDetails());
    };

    // Export symbols.
    window.KalturaAdobeAnalyticsPluginDelegate = KalturaAdobeAnalyticsPluginDelegate;
})(window.mw, window.jQuery);