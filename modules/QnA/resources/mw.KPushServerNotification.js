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
        var options = {forceNew: true, transports: [ 'websocket' ]};
        this.socket = io.connect(url,options);

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
            mw.log("["+eventName+"][" + queueKey + "]: " +  msg);

            if (_this.callbackMap[queueKey]) {
                _this.callbackMap[queueKey].cb(msg);
            } else {
                mw.log("["+eventName+"][" + queueKey + "]: Error couldn't find queueKey in map");

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


    SocketWrapper.prototype.destory=function() {
        if (this.socket) {
            this.socket=null;
        }
    };

    mw.KPushServerNotification.prototype = {
        // The bind postfix:
        bindPostfix: '.KPushServerNotification',
        socketPool: {},
        init: function (embedPlayer) {
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);


            // Process cue points
        },
        destroy: function () {
            $.each(this.socketPool,function(socketWrapper) {
                socketWrapper.destory();
            });
            this.socketPool={};
            $(this.embedPlayer).unbind(this.bindPostfix);
        },


        registerNotifications:function(events) {
            var deferred = $.Deferred();

            var _this=this;

            function createRequest(event) {
                var request = {
                    'service': 'eventNotification_eventNotificationTemplate',
                    'action': 'register',
                    'format': 1,
                    "notificationTemplateSystemName": event.eventName,
                    "pushNotificationParams:objectType": "KalturaPushNotificationParams"

                };
                var index=0;
                $.each( event.params, function(key,value) {
                    request["pushNotificationParams:userParams:item"+index+":objectType"]="KalturaPushNotificationParams";
                    request["pushNotificationParams:userParams:item"+index+":key"]=key;
                    request["pushNotificationParams:userParams:item"+index+":value:objectType"]="KalturaStringValue";
                    request["pushNotificationParams:userParams:item"+index+":value:value"]=value;
                    request["pushNotificationParams:userParams:item"+index+":isQueueKeyParam"]=1;
                    index++;
                });
                return request;
            };

            var requests = $.map(events,createRequest);

            //don't do unnesseary multi-requests
            if (requests.length==1) {
                requests=requests[0];
            }

            mw.log("registering to ",requests);

            function processResult(event,result) {
                var deferred = $.Deferred();

                if (result.objectType==="KalturaAPIException") {
                    mw.log("Error registering to "+event.eventName+" message:"+result.message+" ("+result.code+")");
                    deferred.resolve(false);
                    return deferred;
                }

                //cache sockets by host name
                var socketKey = result.url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
                var socket = _this.socketPool[socketKey];
                if (!socket) {
                    socket = new SocketWrapper(socketKey);
                    _this.socketPool[socketKey]=socket;

                    socket.connect(result.url,event.eventName);
                }

                socket.listen(event.eventName,result.queueName, result.queueKey,function(obj) {
                    mw.log('received event for '+event.eventName+ " key: "+result.queueKey);
                    event.onMessage(obj);
                }).then(function() {

                    if (deferred.state()!=="rejected") {
                        mw.log('Listening to '+event.eventName+ " for key: "+result.queueKey);
                        deferred.resolve(true);
                    } else {
                        mw.log('Listening result for  '+event.eventName+ " for key: "+result.queueKey+ " came too late! ignoring!");

                    }
                });

                setTimeout(function() {
                    if (deferred.state()!=="resolved") {
                        mw.log('Timeout waiting for connection  '+event.eventName+ " for key: "+result.queueKey);
                        deferred.reject();
                    }
                },mw.KPushServerNotification.connectionTimeout);
                return deferred;

            }

            this.kClient.doRequest(requests, function(results) {

                var defs=[];
                if (!requests.length) { //incase of single-request
                    defs.push(processResult(events[0],results));
                } else {
                    defs=$.map(results,function(result, index) {
                        return processResult(events[index],result)
                    });
                }

                return $.when(defs);

            });

            return deferred;
        }
    }

})(window.mw, window.jQuery);

