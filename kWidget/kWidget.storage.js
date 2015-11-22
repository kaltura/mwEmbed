(function( kWidget, win, md5 ) {
    "use strict";

    var NS = "kalturaCache__";
    var ttlSuffix = "_ttl";
    var storage = window.localStorage;

    var storageManger = {
        get: function (cacheKey) {
            return storage.getItem(NS + md5(cacheKey));
        },
        getWithTTL: function (cacheKey) {
            var value = this.get(cacheKey);
            if (value) {
                var timestamp = storage.getItem(NS + md5(cacheKey) + ttlSuffix);
                if (timestamp && (timestamp - (new Date().getTime()) < 0)) {
                    this.delete(md5(cacheKey));
                    this.delete(md5(cacheKey) + ttlSuffix);
                    value = null;
                }
            }
            return value;

        },
        set: function (cacheKey, value) {
            var success = true;
            try {
                storage.setItem(NS + md5(cacheKey), value);
            } catch (err){
                if (this.isQuotaExceeded(err)){
                    success = false;
                }
            }
            return success;
        },
        setWithTTL: function (cacheKey, value, ttl) {
            var success = this.set(cacheKey, value);
            try {
                if (success) {
                    storage.setItem(NS + md5(cacheKey) + ttlSuffix, (new Date().getTime() + ttl));
                    success = true;
                }
            } catch (err){
                if (this.isQuotaExceeded(err)){
                    this.delete(cacheKey);
                    success = false;
                }
            }
            return success;
        },
        delete: function (cacheKey) {
            storage.removeItem(NS + md5(cacheKey));
        },
        clearNS: function () {
            var arr = [];
            var i;
            for (i = 0; i < storage.length; i+=1) {
                if (storage.key(i).indexOf(NS) === 0) {
                    arr.push(storage.key(i));
                }
            }
            for (i = 0; i < arr.length; i+=1) {
                storage.removeItem(arr[i]);
            }
        },
        isSupported: function() {
            try {
                return (('localStorage' in win) && (win['localStorage'] != null) && (win['localStorage'] != undefined));
            }
            catch(err) {
                return false;
            }
        },
        isQuotaExceeded: function(e) {
            var quotaExceeded = false;
            if (e) {
                if (e.code) {
                    switch (e.code) {
                        case 22:
                            quotaExceeded = true;
                            break;
                        case 1014:
                            // Firefox
                            if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                                quotaExceeded = true;
                            }
                            break;
                    }
                } else if (e.number === -2147024882) {
                    // Internet Explorer 8
                    quotaExceeded = true;
                }
            }
            return quotaExceeded;
        }
    };
    kWidget.storage = storageManger;
}( window.kWidget, window, md5 ));