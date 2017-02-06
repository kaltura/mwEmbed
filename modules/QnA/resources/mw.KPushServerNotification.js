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

    SocketWrapper.prototype.connect=function(url,eventName) {

        this.destory();

        var deferred = $.Deferred();

        var _this=this;
        this.socket = io.connect(url,{forceNew: true});

        this.socket.on('validated', function(){
            mw.log("Connected to socket for "+url);
            deferred.resolve(true);
            _this.connected=true;

            $.each(_this.listenKeys,function(key, obj) {
                mw.log("SocketWrapper: calling emit for  "+key+ " "+eventName);
                _this.socket.emit('listen', obj.queueNameHash,obj.queueKeyHash);
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

        this.socket.on('reconnect_error', function (e) {
            mw.log('push server reconnection failed '+e);
        });

        this.socket.on('connected', function(queueKeyHash, queueKey) {
            if (_this.listenKeys[queueKeyHash]) {
                _this.listenKeys[queueKeyHash].deferred.resolve(queueKey);
                _this.callbackMap[queueKey] = _this.listenKeys[queueKeyHash];
                mw.log("Listening to queue [" + queueKey + "] for eventName " + eventName+ " queueKeyHash "+queueKeyHash);
            } else {
                mw.log("Cannot listen to queue [" + queueKey + "] for eventName " + eventName+ " queueKeyHash "+queueKeyHash);
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
        this.socket.on('errorMsg', function( msg){
            mw.log("["+eventName+"]"+msg);
        });

        return deferred;

    };
    SocketWrapper.prototype.listen=function(eventName,queueNameHash, queueKeyHash, cb) {

        var deferred = $.Deferred();

        this.listenKeys[queueKeyHash] = {
            deferred: deferred,
            eventName: eventName,
            queueNameHash: queueNameHash,
            queueKeyHash: queueKeyHash,
            cb: cb
        };

        if (this.connected) {
            this.socket.emit('listen', queueKeyHash);
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
                "notificationTemplateSystemName": eventName,
                "pushNotificationParams:objectType": "KalturaPushNotificationParams"

            };
            var index=0;
            $.each( params, function(key,value) {
                request["pushNotificationParams:userParams:item"+index+":objectType"]="KalturaPushNotificationParams";
                request["pushNotificationParams:userParams:item"+index+":key"]=key;
                request["pushNotificationParams:userParams:item"+index+":value:objectType"]="KalturaStringValue";
                request["pushNotificationParams:userParams:item"+index+":value:value"]=value;
                request["pushNotificationParams:userParams:item"+index+":isQueueKeyParam"]=1;
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
                    socket.connect(result.url,eventName);
                    /*.catch( function(err) {
                     deferred.reject(err);
                     })*/
                }

                socket.listen(eventName,result.queueName, result.queueKey,function(obj) {
                    mw.log('received event for '+eventName+ " key: "+result.queueKey);
                    callback(obj);
                }).then(function() {
                    mw.log('Listening to '+eventName+ " for key: "+result.queueKey);

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

