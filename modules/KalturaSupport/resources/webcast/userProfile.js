(function (mw, $) {
    "use strict";
    mw.webcast = mw.webcast || {};

    mw.webcast.UserProfile = mw.KBasePlugin.extend({
        defaultConfig : {
            /* IMPORTANT : don't use this plugin config feature since it is a detached plugin. A detached plugin cannot access the player configuration to support overrides */
        },
        // get an hash code from a ks
        getKSHash: function(ks) {
            var hash = 0, i, chr, len;
            if (ks.length === 0){
                return hash;
            }
            for (i = 0, len = ks.length; i < len; i++) {
                chr   = ks.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }

            return hash.toString();
        },

        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        // return something like ##guestHashSeparator-186168013885295##
        generateUserId: function(){
            var _this = this;

            return	"##" +
                _this.getConfig("userId") + "HashSeparator" +
                _this.getKSHash(_this.getPlayer().getFlashvars().ks) +
                _this.getRandomInt(10000,99999999).toString() +
                "##";
        },

        getUserID: function(pluginGetConfig){
            var _this = this;

            if (!pluginGetConfig)
            {
                mw.log('Owner plugin must provide its get config function');
                return null;
            }

            // If our user ID is the same as the configured anonymousUserId we need to generate one, or get it from localStorage (if exists)
            if (!pluginGetConfig("userRole") || pluginGetConfig("userRole") === "anonymousRole"){

                //if localStorage is available, get & store the user id from it;
                if(window.localStorage) {
                    if (!localStorage.kAnonymousUserId) {
                        localStorage.kAnonymousUserId = _this.generateUserId();
                    }
                    return localStorage.kAnonymousUserId;
                }else{
                    // localStorage is not available. Just generate a user id
                    return _this.generateUserId();
                }
            }
            return pluginGetConfig("userId");
        }
    });
})(window.mw, window.jQuery);