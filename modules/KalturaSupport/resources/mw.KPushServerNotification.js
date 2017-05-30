(function (mw, $) {
    "use strict";
    mw.KPushServerNotification = function (embedPlayer) {
        return this.init(embedPlayer);
    };

    mw.KPushServerNotification.getInstance=function(embedPlayer) {
        if (!embedPlayer.kPushServerNotification) {
            embedPlayer.kPushServerNotification = new mw.KPushServerNotification(embedPlayer);
        }
        return embedPlayer.kPushServerNotification;
    };

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
        var options = {};
        this.socket = io.connect(url,options);

        this.socket.on('validated', function(){
            mw.log("KPushServerNotification:: Connected to socket for "+url);
            deferred.resolve(true);
            _this.connected=true;

            $.each(_this.listenKeys,function(key, obj) {
                mw.log("KPushServerNotification:: SocketWrapper: calling emit for  "+key+ " eventName: "+eventName+" queueNameHash:"+obj.queueNameHash+" queueKeyHash:"+obj.queueKeyHash);
                _this.socket.emit('listen', obj.queueNameHash,obj.queueKeyHash);
            });
        });
        this.socket.on('disconnect', function () {
            mw.log('KPushServerNotification:: push server was disconnected');
        });
        this.socket.on('reconnect', function () {
            mw.log('KPushServerNotification:: push server was reconnected');
        });

        this.socket.on('reconnect_error', function (e) {
            mw.log('KPushServerNotification:: push server reconnection failed '+e);
        });

        this.socket.on('connected', function(queueKey, queueKeyHash) {
            if (_this.listenKeys[queueKeyHash]) {
                _this.listenKeys[queueKeyHash].deferred.resolve(queueKey);
                _this.callbackMap[queueKey] = _this.listenKeys[queueKeyHash];
                mw.log("KPushServerNotification:: Listening to queue [" + queueKey + "] for eventName " + eventName+ " queueKeyHash "+queueKeyHash);
            } else {
                mw.log("KPushServerNotification:: Cannot listen to queue [" + queueKey + "] for eventName " + eventName+ " queueKeyHash "+queueKeyHash+" queueKeyHash not found");
            }
        });

        this.socket.on('message', function(queueKey, msg){
            mw.log("KPushServerNotification:: ["+eventName+"][" + queueKey + "]: onMessage" ,msg);

            if (_this.callbackMap[queueKey]) {
                _this.callbackMap[queueKey].cb(msg);
            } else {
                mw.log("KPushServerNotification:: ["+eventName+"][" + queueKey + "]: onMessage Error couldn't find queueKey in map");

            }

        });
        this.socket.on('errorMsg', function( msg){
            mw.log("KPushServerNotification:: ["+eventName+"]"+msg);
        });

        return deferred;

    };
    SocketWrapper.prototype.listen=function(eventName,queueNameHash, queueKeyHash, cb) {

        var deferred = $.Deferred();

        mw.log("KPushServerNotification:: Listening to ",eventName," queueNameHash: ",queueNameHash, " queueKeyHash: ",queueKeyHash);

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
        createNotificationRequest:function(eventName, eventParams, onMessage) {
            var request = {
                'service': 'eventnotification_eventnotificationtemplate',
                'action': 'register',
                'format': 1,
                "notificationTemplateSystemName": eventName,
                "pushNotificationParams:objectType": "KalturaPushNotificationParams"
            };
            var index=0;
            $.each( eventParams, function(key,value) {
                request["pushNotificationParams:userParams:item"+index+":objectType"]="KalturaPushNotificationParams";
                request["pushNotificationParams:userParams:item"+index+":key"]=key;
                request["pushNotificationParams:userParams:item"+index+":value:objectType"]="KalturaStringValue";
                request["pushNotificationParams:userParams:item"+index+":value:value"]=value;
                request["pushNotificationParams:userParams:item"+index+":isQueueKeyParam"]=1;
                index++;
            });

            return  {
                eventName: eventName,
                apiRequest: request,
                onMessage: onMessage
            };
        },
        registerNotifications:function(registerRequests,moduleName) {
            var deferred = $.Deferred();

            var _this=this;

            var apiRequests = $.map(registerRequests,function(request) {
                return request.apiRequest;
            });

            //don't do unnesseary multi-requests
            if (apiRequests.length==1) {
                apiRequests=apiRequests[0];
            }

            mw.log("KPushServerNotification:: registering to ",apiRequests);

            function processResult(registerRequest,result) {
                var deferred = $.Deferred();
                if (result.objectType==="KalturaAPIException") {
                    mw.log("KPushServerNotification:: Error registering to "+registerRequest.eventName+" message:"+result.message+" ("+result.code+")");
                    deferred.resolve(result.message);
                    return deferred;
                }

                //cache sockets by host name
                var socketKey = result.url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
                // check if there is an existing socket for that specific module by name
                var socket = _this.socketPool[socketKey];
                if (!socket) {
                    //does not exist - create one for that specific module
                    socket = new SocketWrapper(socketKey);
                    //store it in case there are more events for this specific module
                    _this.socketPool[socketKey]=socket;
                    socket.connect(result.url,registerRequest.eventName);
                }

                socket.listen(registerRequest.eventName,result.queueName, result.queueKey,function(obj) {
                    mw.log('KPushServerNotification:: received event for '+registerRequest.eventName+ " key: "+result.queueKey);
                    registerRequest.onMessage(obj);
                }).then(function() {

                    if (deferred.state()!=="rejected") {
                        mw.log('KPushServerNotification:: Listening to '+registerRequest.eventName+ " for key: "+result.queueKey);
                        deferred.resolve(true);
                    } else {
                        mw.log('KPushServerNotification:: Listening result for  '+registerRequest.eventName+ " for key: "+result.queueKey+ " came too late! ignoring!");

                    }
                });

                setTimeout(function() {
                    if (deferred.state()!=="resolved") {
                        mw.log('KPushServerNotification:: Timeout waiting for connection  '+registerRequest.eventName+ " for key: "+result.queueKey);
                        deferred.reject();
                    }
                },mw.KPushServerNotification.connectionTimeout);
                return deferred;

            }

            this.kClient.doRequest(apiRequests, function(results) {
                if (results.objectType==="KalturaAPIException") {
                    mw.log("KPushServerNotification:: Error registering to event tempalte service :"+results.message+" ("+results.code+")");
                    deferred.reject(results.message);
                    return deferred;
                }

                var deffers=[];

                if (!apiRequests.length) { //incase of single-request
                    deffers.push(processResult(registerRequests[0],results));
                } else {
                    deffers=$.map(results,function(result, index) {
                        return processResult(registerRequests[index],result)
                    });
                }

                $.when(deffers).then(function() {
                    deferred.resolve(true);
                },function(err) {
                    deferred.reject(err);
                });
            },
            false,
            function(error) {
                mw.log('KPushServerNotification:: Error registering to events  '+error);
                deferred.reject(error);
            });

            return deferred;
        }
    }

})(window.mw, window.jQuery);

