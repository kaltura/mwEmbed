(function (mw, $) {
    "use strict";
    mw.KPushServerNotification = function (embedPlayer) {
        return this.init(embedPlayer);
    }


    function SocketWrapper(key) {
        this.socket=null;
        this.key=key;
        this.listenKeys={};
        this.callbackMap={};
    }

    SocketWrapper.prototype.connect=function(eventName, url) {
        if (this.deferred ) {
            return this.deferred;
        }
        this.deferred = $.Deferred();

        var _this=this;
        this.socket = io.connect(url);

        this.socket.on('validated', function(){
            mw.log("Connected to socket for eventName "+eventName);
            _this.deferred.resolve(true);
        });
        this.socket.on('disconnect', function () {
            mw.log('push server was disconnected');
        });
        this.socket.on('reconnect', function () {
            mw.log('push server was reconnected');
        });
        this.socket.on('reconnect_error', function (e) {
            mw.log('push server reconnection failed '+e);
        });

        this.socket.on('connected', function(queueKey, key) {
            if (_this.listenKeys[key]) {
                _this.listenKeys[key].deferred.resolve(queueKey);
                _this.callbackMap[queueKey] = _this.listenKeys[key];
                mw.log("Listening to queue [" + queueKey + "] for eventName " + eventName+ " key "+key);
            } else {
                mw.log("Cannot listen to queue [" + queueKey + "] for eventName " + eventName+ " key "+key);
            }
        });

        this.socket.on('message', function(queueKey, msg){
            var message=String.fromCharCode.apply(null, new Uint8Array(msg.data))
            mw.log("["+eventName+"][" + queueKey + "]: " +  message);
            var obj=JSON.parse(message);
            ///_this.callback(obj);
            if (_this.callbackMap[queueKey]) {
                _this.callbackMap[queueKey].cb(obj);
            }
        });
        return this.deferred;

    };
    SocketWrapper.prototype.listen=function(key, cb) {

        var deferred = $.Deferred();

        this.listenKeys[key] = {
            deferred: deferred,
            cb: cb
        };

        this.socket.emit('listen', key);

    };
    SocketWrapper.prototype.registerReconnect=function(cb) {

        this.socket.on('reconnect_error', cb);
    }


    mw.KPushServerNotification.prototype = {
        // The bind postfix:
        bindPostfix: '.KPushServerNotification',
        socketWrappers: {},
        init: function (embedPlayer) {
            var _this = this;
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);


            // Process cue points
        },
        destroy: function () {
            $(this.embedPlayer).unbind(this.bindPostfix);
        },

        registerNotification:function(eventName,params,callback) {
            var deferred = $.Deferred();

            var _this=this;

            var request = {
                'service': 'eventNotification_eventNotificationTemplate',
                'action': 'register',
                'format': 1,
                "notificationTemplateSystemName": eventName
            };
            var index=0;
            $.each( params, function(key,value) {
                request["userParamsArray:"+index+":objectType"]="KalturaEventNotificationParameter";
                request["userParamsArray:"+index+":key"]=key;
                request["userParamsArray:"+index+":value:objectType"]="KalturaStringValue";
                request["userParamsArray:"+index+":value:value"]=value;
                index++;
            });
            mw.log("registering to ",request);

            this.kClient.doRequest(request, function(result) {
                if (result.objectType==="KalturaAPIException") {
                    mw.log("Error registering to "+eventName+" message:"+result.message+" ("+result.code+")");
                    deferred.resolve(false);
                    return;
                }
                var socketKey=result.url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
                var socket = _this.socketWrappers[socketKey];
                if (!socket) {
                    socket= new SocketWrapper(socketKey);
                    _this.socketWrappers[socketKey]=socket;
                }

                socket.connect(eventName, result.url).then(function() {

                    socket.listen(result.key,function(obj) {
                        callback(obj);
                    });
                    deferred.resolve(true);

                });

            });

            return deferred;
        }
    }

})(window.mw, window.jQuery);

