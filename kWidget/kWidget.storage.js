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
            storage.setItem(NS + md5(cacheKey), value);
        },
        setWithTTL: function (cacheKey, value, ttl) {
            this.set(cacheKey, value);
            storage.setItem(NS + md5(cacheKey) + ttlSuffix, (new Date().getTime() + ttl));
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
        }
    };
    kWidget.storage = storageManger;
}( window.kWidget, window, md5 ));