/**
 * Created by einatr on 6/8/15.
 */
(function(mw, $) {
    'use strict';

    $.extend(KalturaHeartbeatDelegate.prototype, ADB.va.HeartbeatDelegate.prototype);

    function KalturaHeartbeatDelegate() {
    }

    KalturaHeartbeatDelegate.prototype.onError = function(errorInfo) {
        mw.log("HeartBeat plugin ::  HeartbeatDelegate error: " + errorInfo.getMessage() + " | " + errorInfo.getDetails());
    };

    // Export symbols.
    window.KalturaHeartbeatDelegate = KalturaHeartbeatDelegate;
})(window.mw, window.jQuery);
