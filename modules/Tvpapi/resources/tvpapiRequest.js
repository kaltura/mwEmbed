(function (mw, $) {
    "use strict";

    mw.tvpapiRequest = mw.KBasePlugin.extend( {

        defaultConfig: {
            "restMethod": "",
            "restApiBaseUrl": "",
            "proxyData":null
        },

        restMethod: null,

        init: function( embedPlayer, callback, pluginName ) {
            // parent init return true / false based on isSafeEnviornment, default true
            if( this._super( embedPlayer, callback, pluginName ) === false ) {
                return ;
            }
            if( !this.restMethod ) {
                this.restMethod = this.getConfig("restMethod");
            }
        },

        getProxyConfig: function( attr, raw ) {
            if ( this.getConfig( "proxyData" ) ) {
                var data = this.getConfig( "proxyData" );
                if ( attr ) {
                    return data[attr];
                }
                return data;
            }
            if ( raw ) {
                return this.embedPlayer.getRawKalturaConfig( "proxyData" , attr );
            }
            return this.embedPlayer.getKalturaConfig( "proxyData" , attr );
        },

        getInitObj: function( attr, raw ) {
            return this.getProxyConfig("initObj");
        },

        getRequestUrl: function(){
            var baseUrl = this.getConfig( "restApiBaseUrl" ) || this.getPlayer().getKalturaConfig( null, 'TVPAPIBaseUrl' );
            var restMethod = this.restMethod;
            var url;
            if (baseUrl !== "" && restMethod !== "") {
                url = baseUrl + restMethod;
            } else {
                this.log("error: unable to get request url!");
            }
            return url;
        },

        doRequest: function(url, data, options){
            var _this = this;
            options = options || {};
            var deferredAjax = $.ajax( {
                url: url,
                type: options.type || "POST",
                dataType: options.dataType || "json",
                contentType: options.contentType || "application/json",
                statusCode: {
                    401: function() {
                        _this.embedPlayer.triggerHelper("tvpapiTokenExpired");
                    }
                },
                data: JSON.stringify( data ),
                async: (typeof(options.async) === "boolean") ? options.async : true
            } );
            return deferredAjax.promise();
        }
    });
}(window.mw, window.jQuery));
