(function (mw, $) {
    "use strict";
    mw.KPushCuePointsManager = function (embedPlayer) {
        return this.init(embedPlayer);
    };

    mw.KPushCuePointsManager.getInstance = function (embedPlayer) {
        if (!embedPlayer.KPushCuePointsManager) {
            embedPlayer.KPushCuePointsManager = new mw.KPushCuePointsManager(embedPlayer);
        }
        return embedPlayer.KPushCuePointsManager;
    };

    mw.KPushCuePointsManager.prototype = {
        bindPostfix: '.KPushCuePointsManager',
        init: function (embedPlayer) {
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.listeners = {};
            this.embedPlayer = embedPlayer;
            this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            this.pushServerNotification = mw.KPushServerNotification.getInstance(this.embedPlayer);
            this.addBindings();
            this.lastDispatchedCpTime = null;
        },
        addBindings: function () {
            // bind to cue point events
            var _this = this;
            this.embedPlayer.bindHelper("monitorEvent onpause onplay", function (e) {
                _this.checkAllRegisteredNotifications(e);
            });
        },
        findCuePointdataByTime: function (t) {
            for (var key in this.listeners) {
                if (this.listeners[key].hasOwnProperty(t)) {
                    return {
                        cuepoint: this.listeners[key][t],
                        triggerCallback: this.listeners[key]["triggerCallback"],
                        loadedCallback: this.listeners[key]["loadCuePointCallback"],
                        scope: this.listeners[key]["scope"],
                        key: key
                    };
                }
            }
        },
        checkAllRegisteredNotifications: function (e) {
            if (e.type == "onplay" || e.type == "onpause") {
                //clear marked cuepoint
                this.lastDispatchedCpTime = null;
            }
            var _this = this;
            var currentTime = _this.embedPlayer.currentTime;
            if (currentTime == 0) {
                return; //no point calculate when time is 0
            }
            // assuming array is sorted - iterate from end to first. We care about the last one that has time less than
            // current live playhead
            var len = this.times.length;
            for (var i = len-1; i > 0; --i) {
                if (currentTime > this.times[i]) {
                    var latestActiveCpTime = this.times[i];
                    var cpData = this.findCuePointdataByTime(latestActiveCpTime);
                    var cuepoint = cpData.cuepoint;
                    if (latestActiveCpTime == this.lastDispatchedCpTime) {
                        // This CP was dispatched - no point to re-dispatch it
                        break
                    }
                    // found a cuepoint that was not dispatched - and valid - trigger now and store
                    this.lastDispatchedCpTime = latestActiveCpTime;
                    var callback = cpData.triggerCallback;
                    var scope = cpData.scope;
                    // this.embedPlayer.trigger() // dispatch generic event
                    if (callback) {
                        mw.log("KPushCuePointsManager triggering cuepoint from KPushCuePointsManager " , cuepoint);
                        callback(cuepoint, scope);
                    }
                    break
                }
            }
        },
        //store cuepoint on a per-registration array.
        setLocalCuePoint: function (cuePoint, notificationName) {
            // make sure we don't store the same cue point twice
            if(this.times.indexOf(cuePoint.createdAt) > -1){
                return;
            }

            this.times.push(cuePoint.createdAt); //TODO - handle DVR later
            this.listeners[notificationName][cuePoint.createdAt] = cuePoint;
            //after every insertion - sort
            this.times.sort(function(a, b){return a-b});
        },
        /**
         * API - register to pushNotifications, cue-point loading and cue-point-reached logic
         *
         * @param notificationName - String, system name of notification template in backend
         * @param userId - userid
         * @param cpLoadedFunc - will be triggered when a cue-point is loaded by server
         * @param cpTriggerFunc - will be triggered when a cue-point that was loaded here will be reached by playhead
         * @param scope - scope of callback functions
         * @param moduleName - mane of module (will be used for registration with the push service)
         */
        registerToNotification: function (notificationName, userId, cpLoadedFunc, cpTriggerFunc, scope, moduleName) {
            var _this = this;
            this.currentNotification = notificationName;
            //create a listener object to store cuepoints per notification
            this.listeners[notificationName] = {};
            this.listeners[notificationName]["scope"] = scope; //TODO - try to find an elegant way;
            if (cpTriggerFunc) {
                this.listeners[notificationName]["triggerCallback"] = cpTriggerFunc;
            } else {
                this.listeners[notificationName]["triggerCallback"] = function (a) {
                };
                // TODO - optimize?
            }
            if (cpLoadedFunc) {
                this.listeners[notificationName]["loadCuePointCallback"] = cpLoadedFunc;
            } else {
                this.listeners[notificationName]["loadCuePointCallback"] = function (a) {
                };
            }
            if (scope) {
                this.listeners[notificationName]["scope"] = scope;
            } else {
                this.listeners[notificationName]["scope"] = null;
            }
            //TODO - manage this on the module name level and not the notification level
            if (moduleName) {
                this.listeners[notificationName]["moduleName"] = moduleName;
            } else {
                this.listeners[notificationName]["moduleName"] = null;
            }
            //store all time (global notifications) for optimization
            this.times = [];
            this.getMetaDataProfile(notificationName, userId).then(function () {
                _this.registerPollingNotifications(notificationName, moduleName).then(function () {
                    mw.log(notificationName + "successful  registerNotifications");
                }, function (err) {
                    mw.log(notificationName + "failed  registerNotifications ", err);
                });
            });
        },
        /**
         Register to cuepoint loaded function
         */
        registerPollingNotifications: function (notificationName , moduleName) {
            var _this = this;
            // var _callback = callback;
            var tempNotification = this.pushServerNotification.createNotificationRequest(
                notificationName,
                {
                    "entryId": _this.embedPlayer.kentryid
                },
                function (cuePoint) {
                    mw.log("KPushCuePointsManager cuePoint loaded" + cuePoint[0].createdAt);
                    _this.cuePointloaded(cuePoint[0], notificationName);
                });
            return this.pushServerNotification.registerNotifications([tempNotification],moduleName)
        },
        cuePointloaded: function (cuePoint, notificationName) {
            this.setLocalCuePoint(cuePoint, notificationName);
            var cpObject = this.findCuePointdataByTime(cuePoint.createdAt);
            cpObject.loadedCallback(cpObject.key, cpObject.cuepoint, cpObject.scope);
        },
        getMetaDataProfile: function (notificationName, userId) {
            var _this = this;
            var listMetadataProfileRequest = {
                service: "metadata_metadataprofile",
                action: "list",
                "filter:systemNameEqual": notificationName
            };
            this.userId = userId;
            var deferred = $.Deferred();
            this.getKClient().doRequest(listMetadataProfileRequest, function (result) {

                if (result.objectType === "KalturaAPIException") {
                    mw.log("Error getting metadata profile: " + result.message + " (" + result.code + ")");
                    deferred.resolve(false);
                    return;
                }
                mw.log("metadata profile " + _this.currentNotification + " loaded.");
                _this.metadataProfile = result.objects[0];
                deferred.resolve(true);
            });
            return deferred;
        },
        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },

        destroy: function () {

        }


    }

})(window.mw, window.jQuery);

