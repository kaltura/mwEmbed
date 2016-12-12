(function (mw, $) {
    "use strict";
    mw.KPushServerNotification = function (embedPlayer) {
        return this.init(embedPlayer);
    }

    mw.KPushServerNotification.connectionTimeout = 10000;


    function SocketWrapper(key) {
        this.socket=null;
        this.key=key;
        this.listenKeys={};
        this.callbackMap={};
        this.connected=false;
    }

    SocketWrapper.prototype.connect=function(eventName, url) {

        this.destory();

        var deferred = $.Deferred();

        var _this=this;
        this.socket = io.connect(url, {forceNew: true});

        this.socket.on('validated', function(){
            mw.log("Connected to socket for eventName "+eventName);
            deferred.resolve(true);
            _this.connected=true;

            $.each(_this.listenKeys,function(key) {
                mw.log("SocketWrapper: calling emit for  "+key);
                _this.socket.emit('listen', key);
            });
        });
        this.socket.on('disconnect', function () {
            mw.log('push server was disconnected');
        });
        this.socket.on('reconnect', function () {
            mw.log('push server was reconnected');
            if (_this.reconnectCB) {
                _this.reconnectCB();
            }
        });

        setTimeout(function() {
            if (_this.reconnectCB) {
                _this.reconnectCB();
            }

        },5000);
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

            if (_this.callbackMap[queueKey]) {
                _this.callbackMap[queueKey].cb(obj);
            }
        });

        return deferred;

    };
    SocketWrapper.prototype.listen=function(key, cb) {

        var deferred = $.Deferred();

        this.listenKeys[key] = {
            deferred: deferred,
            cb: cb
        };

        if (this.connected) {
            this.socket.emit('listen', key);
        }
        return deferred;

    };

    SocketWrapper.prototype.registerReconnect=function(cb) {
        this.reconnectCB=cb;
    };

    SocketWrapper.prototype.destory=function() {
        if (this.socket) {
            this.socket=null;
        }
    };

    mw.KPushServerNotification.prototype = {
        // The bind postfix:
        bindPostfix: '.KPushServerNotification',
        socketPool: {},
        events: {},
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
            this.events=[];
            $.each(this.socketPool,function(socketWrapper) {
                socketWrapper.destory();
            });
            this.socketPool={};
            $(this.embedPlayer).unbind(this.bindPostfix);
        },

        on:function(name,cb) {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(cb);
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

            function emitEvents(name) {

                var events=_this.events[name];

                if (events) {
                    $.each(_this.events[name],function(eventName,cb) {
                        try {
                            cb();
                        }catch(e) {
                            mw.log(e);
                        }
                    });
                }
            }

            this.kClient.doRequest(request, function(result) {

                if (result.objectType==="KalturaAPIException") {
                    mw.log("Error registering to "+eventName+" message:"+result.message+" ("+result.code+")");
                    deferred.resolve(false);
                    return;
                }

                //cache sockets by host name
                var socketKey = result.url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
                var socket = _this.socketPool[socketKey];
                if (!socket) {
                    socket = new SocketWrapper(socketKey);
                    _this.socketPool[socketKey]=socket;

                    socket.registerReconnect(function() {
                        emitEvents('reconnect');
                    });

                    socket.connect(eventName, result.url);
                    /*.catch( function(err) {
                        deferred.reject(err);
                    })*/
                }

                socket.listen(result.key,function(obj) {
                    mw.log('received event for '+eventName+ " key: "+result.key);
                    callback(obj);
                }).then(function() {
                    mw.log('Listening to '+eventName+ " for key: "+result.key);

                    if (deferred.state()!=="rejected") {
                        deferred.resolve(true);
                    }
                });

                setTimeout(function() {
                    if (deferred.state()!=="resolved") {
                        deferred.reject();
                    }
                },mw.KPushServerNotification.connectionTimeout);


            });

            return deferred;
        }
    }

})(window.mw, window.jQuery);

