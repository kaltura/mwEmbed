/*
DAL for Q&A Module


 */

(function (mw, $, ko) {
    "use strict";

    var viewedEntries=(function() {
        var _viewedEntries = [];
        if(window.localStorage) {
            if (localStorage["_viewedEntries"]) {
                _viewedEntries = JSON.parse(localStorage["_viewedEntries"]);
            }
        }else{
            mw.log("window.localStorage is not available");
        }

        return {
            markAsRead: function(EntryId) {
                // Write to localStorage this item was read
                if (_viewedEntries.indexOf(EntryId) < 0 ) {
                    _viewedEntries.push(EntryId);
                    if (window.localStorage) {
                        localStorage["_viewedEntries"] = JSON.stringify(_viewedEntries);
                    }

                }
            },
            isRead: function(EntryId) {
                return _viewedEntries.indexOf(EntryId) > -1;
            },
            readThreadsCount: function() {
                return _viewedEntries.length;
            }
        };
    })();

    function QnaThread(ThreadId){
        var _this = this;
        _this.ThreadID = ThreadId;
        _this.entries = ko.observableArray();

        this.getThreadID = function(){
            return _this.ThreadID;
        };

        this.isRead = ko.observable(viewedEntries.isRead(_this.ThreadID));
        this.isCollapsed = ko.observable(true);
        this.appendEntry = function(entry){
            entry.setThread(_this);
            if (!_this.isCollapsed()) {
                _this.entries.push(ko.observable(entry));
            }
            else{
                _this.entries.unshift(ko.observable(entry));
            }
        };

        this.hasUnreadEntries = ko.computed(function() {
            for (var i = 0; i < _this.entries().length; i++) {
                if(!_this.entries()[i]().isRead()){
                    return true;
                }
            }
            return false;
        });

        // Get the timestamp of the last Answer on the thread
        // If there are no answers on the thread - return first question (so thread won't jump on new question).
        this.lastTimeForSort = function(){

            if (_this.entries()[0]().getType() === "Announcement"){
                return _this.entries()[0]().getTime();
            }

            var q_time = undefined;
            var a_time = undefined;

            for(var i =0; i < _this.entries().length; ++i) {
                if (_this.entries()[i]().getType() === "Answer"){
                    if (a_time === undefined){
                        a_time = _this.entries()[i]().getTime();
                    }
                    else if (_this.entries()[i]().getTime() > a_time){
                        a_time = _this.entries()[i]().getTime();
                    }
                }
                else if (_this.entries()[i]().getType() === "Question"){
                    if (q_time === undefined){
                        q_time = _this.entries()[i]().getTime();
                    }
                    else if (_this.entries()[i]().getTime() < q_time){
                        q_time = _this.entries()[i]().getTime();
                    }

                }
            }

            if (a_time === undefined && q_time === undefined) {
                mw.log("both a_time and q_time are undefined - data error");
                return 0;
            }

            if (a_time === undefined){
                return q_time;
            }

            if (q_time === undefined){
                return a_time;
            }


            return Math.max(a_time,q_time);

        };

        // This is here so we will be able to save the reply in the context of the thread
        this.replyText = ko.observable(gM("qna-reply-here"));

        this.isTypingAnswer = ko.observable(false);
    };

    function QnaEntry(cuePoint){

        var _this = this;

        this.cuePoint= ko.observable(cuePoint);
        this.timestamp = ko.observable(this.cuePoint().createdAt);

        this.getType = function(){
            return this.cuePoint().metadata.Type;
        };

        this.isAnswer = function(){
            return this.getType() === "Answer";
        };

        this.isRead = ko.observable(viewedEntries.isRead(_this.cuePoint().id) || _this.getType() === "Question");

        this.setThread = function(thread){
            this._thread = thread;
        };

        this.getThread = function(){
            return this._thread;
        };

        this.getContent = function(){
            return this.cuePoint().text;
        };

        this.getTime = function(){
            return this.cuePoint().createdAt;
        };

        this.getOwner = function(){
            return this.cuePoint().userId;
        };

        this.getThreadID = function(){
            return this.cuePoint().metadata.ThreadId;
        };

        this.getTitle = function(){
            if (this.getType() === "Announcement"){
                return gM('qna-announcement-title');
            }
            else if (this.getType() === "Question"){
                return gM('qna-you-asked');
            }
            else if (this.getType() === "AnswerOnAir"){
                return gM('qna-answer-on-air');
            }
            else{
                return this.cuePoint().userId;
            }
        };

        this.getText = function(){
            if (this.getType() === "AnswerOnAir"){
                return '"' + this.cuePoint().text + '"';
            }
            return this.cuePoint().text;
        };

        this.getCurrentTime = function(){
            return this.currentTime;
        };
    }


    mw.KQnaService = function (embedPlayer,qnaPlugin) {
        return this.init(embedPlayer,qnaPlugin);
    };

    mw.KQnaService.prototype = {

        // The bind postfix:
        bindPostfix: '.KQnaService',
        liveAQnaIntervalId: null,
        QnaThreads: ko.observableArray(),
        AnswerOnAirQueue: ko.observableArray(),
        lastUpdateTime: -1,
        moduleStatusLastUpdateTime: -1,
        QandA_ResponseProfile: "QandA_ResponseProfile",
        QandA_ResponseProfileSystemName: "QandA",
        QandA_MetadataProfileSystemName: "Kaltura-QnA",
        QandA_cuePointTag: "qna",
        QandA_publicNotificationName: "PUBLIC_QNA_NOTIFICATIONS",
        QandA_UserNotificationName: "USER_QNA_NOTIFICATIONS_2",
        QandA_CodeNotificationName: "CODE_QNA_NOTIFICATIONS",
        QandA_cuePointTypes: {"Question":1,"Answer":2, "Announcement":3},
        bootPromise:null,
        fullCuePointFetchingCalled:false,
        socketWrappers:{},


        init: function (embedPlayer, qnaPlugin) {
            var _this = this;
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.qnaPlugin = qnaPlugin;

            if (embedPlayer.isLive()) {
                this.requestCuePoints();
            }

        },
        boot:function() {

            if (this.bootPromise) {
                return this.bootPromise;
            }
            var _this=this;
            this.bootPromise = $.Deferred();
            //we first register to all notification before continue to get the existing cuepoints, so we don't get races and lost cue points
            $.when( this.getMetaDataProfile(), this.registerPublicNotificationItems(),this.registerUserNotificationItems(),this.registerCodeNotificationItems())
                .done(function( ) {
                    ///todo should we setInterval?
                    _this.bootPromise.resolve();
            });

            return this.bootPromise;
        },
        getMetaDataProfile:function() {
            var _this=this;

            var listMetadataProfileRequest = {
                service: "metadata_metadataprofile",
                action: "list",
                "filter:systemNameEqual": this.QandA_MetadataProfileSystemName
            };
            this.userId=this.qnaPlugin.getUserID();


            var deferred = $.Deferred();
            this.getKClient().doRequest(listMetadataProfileRequest, function (result) {

                if (result.objectType==="KalturaAPIException") {
                    mw.log("Error getting metadata profile: "+result.message+" ("+result.code+")");
                    deferred.resolve(false);
                    return;
                }

                _this.metadataProfile = result.objects[0];
                deferred.resolve(true);
            });
            return deferred;
        },

        viewedEntries: viewedEntries,

        destroy: function () {

            if (this.liveAQnaIntervalId) {
                clearInterval(this.liveAQnaIntervalId);
                this.liveAQnaIntervalId = null;
            }
            $(this.embedPlayer).unbind(this.bindPostfix);
        },

        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },

        //returns questions, answers and announcement
        getQnaThreads: function () {
            return this.QnaThreads;
        },

        createMetadataXmlFromObject: function (obj) {
            var xml = "<metadata>";
            for (var propertyName in obj) {
                xml += "<" + propertyName + ">" + obj[propertyName] + "</" + propertyName + ">";
            }
            xml += "</metadata>";
            return xml;
        },

        submitQuestion: function (question, parent) {
            var embedPlayer = this.embedPlayer;
            var _this = this;
            this.boot().then(function() {
                var startTime = new Date();

                var metadata = {};
                if (parent) {
                    metadata.ThreadId = parent.cuePoint().metadata.ThreadId;
                }
                metadata.Type = "Question";
                metadata.ThreadCreatorId = _this.userId;

                var xmlData = _this.createMetadataXmlFromObject(metadata);


                var createCuePointRequest = {
                    "service": "cuePoint_cuePoint",
                    "action": "add",
                    "cuePoint:objectType": "KalturaAnnotation",
                    "cuePoint:entryId": embedPlayer.kentryid,
                    "cuePoint:startTime": embedPlayer.currentTime,
                    "cuePoint:text": question,
                    "cuePoint:isPublic": 1,
                    "cuePoint:searchableOnEntry": 0
                };
                if (parent) {
                    createCuePointRequest["cuePoint:parentId"] = parent.cuePoint().id;
                }

                var addMetadataRequest = {
                    service: "metadata_metadata",
                    action: "add",
                    metadataProfileId: _this.metadataProfile.id,
                    objectId: "{1:result:id}",
                    xmlData: xmlData,
                    objectType: "annotationMetadata.Annotation"
                };

                var updateCuePointRequestAddQnaTag = {
                    "service": "cuePoint_cuePoint",
                    "action": "update",
                    "id": "{1:result:id}",
                    "cuePoint:objectType": "KalturaAnnotation",
                    "cuePoint:tags": _this.QandA_cuePointTag
                };

                // mw.log("Submitting a new question: " + question);

                _this.getKClient().doRequest([createCuePointRequest, addMetadataRequest, updateCuePointRequestAddQnaTag], function (result) {

                        var endTime = new Date();
                        var cuePoint = result[2];
                        var metadata = result[1];
                        if (cuePoint.id && metadata.id) {

                            cuePoint.metadata = {xml: metadata.xml, id: metadata.id};

                            var item = _this.annotationCuePointToQnaEntry(cuePoint);

                            if (item) {
                                _this.addOrUpdateEntry(item);
                                _this.sortThreads();
                            }

                            mw.log("added Annotation cue point with id: " + cuePoint.id + " took " + (endTime - startTime) + " ms");

                        } else {
                            mw.log("error adding Annotation " + JSON.stringify(result));

                        }
                    },
                    false,
                    function (err) {
                        mw.log("Error: " + _this.bindPostfix + " could not add cue point. Error: " + err);
                    });
            });
        },

        // item can be either a QnaThread (for an announcement) or a QnaEntry (for a Q&A thread)
        markAsRead: function (item) {

            item.isRead(true);
            if (item.entries !== undefined){
                item.entries()[0]().isRead(true);
                viewedEntries.markAsRead(item.ThreadID);
                this.updateThread(item);
            }
            else{
                viewedEntries.markAsRead(item.cuePoint().id);
                this.addOrUpdateEntry(item);
                this.qnaPlugin.updateUnreadBadge();
            }
        },

        markThreadAsRead: function(qnaThread){
            var _this = this;
            for(var i=0; i < qnaThread.entries().length; i++){
                _this.markAsRead(qnaThread.entries()[i]());
            }
        },

        readThreadsCount: function () {
            return viewedEntries.readThreadsCount();
        },

        updateThread: function(qnaThread){
            var _this=this;
            for (var i = 0; i < _this.QnaThreads().length; i++) {
                if (_this.QnaThreads()[i]().getThreadID() === qnaThread.ThreadID){
                    _this.qnaPlugin.updateUnreadBadge();
                    break;
                }
            }
        },

        sortThreads: function(){
            var _this=this;
            _this.QnaThreads.sort(
                function(a, b){

                    return b().lastTimeForSort() - a().lastTimeForSort();
                }
            );
        },

        // look for a QnaThread for this QnaEntry
        // if we don't find on we will create it
        addOrUpdateEntry: function (qnaEntry) {

            var _this=this;
            var found = false;

            for (var i = 0; i < _this.QnaThreads().length; i++) {

                if (_this.QnaThreads()[i]().getThreadID() === qnaEntry.getThreadID())
                {
                    // look it this entry exists. If so replace it
                    for (var j = 0; j < _this.QnaThreads()[i]().entries().length; j++){
                        if (_this.QnaThreads()[i]().entries()[j]().cuePoint().id === qnaEntry.cuePoint().id){
                            qnaEntry.setThread(_this.QnaThreads()[i]());
                            _this.QnaThreads()[i]().entries.splice(j, 0, ko.observable(qnaEntry));
                            _this.QnaThreads()[i]().entries.splice(j+1, 1);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        _this.QnaThreads()[i]().appendEntry(qnaEntry);
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                var newThread = new QnaThread(qnaEntry.getThreadID());
                newThread.appendEntry(qnaEntry);
                _this.QnaThreads.push(ko.observable(newThread));
            }
        },

        metadataToObject: function(metadata) {
            var xml = $.parseXML(metadata.xml);

            var $xml = $( xml ).find('metadata').children();

            var obj={};
            $.each( $xml, function(inx, node){
                if (node.nodeType===1) {
                    obj[node.nodeName] = node.textContent;
                }
            });
            obj['xml'] = metadata.xml;
            return obj;
        },

        joinMetadataWithCuepoint:function(cuePoint,metadata ){
            if (!metadata)
                return false;

            var obj=this.metadataToObject(metadata);

            delete cuePoint.relatedObjects;

            $.extend(cuePoint,{ metadata: obj, metadataId: metadata.id});

            return true;

        },

        // convert a cuePoint from the server to a QnaEntry object
        annotationCuePointToQnaEntry: function(cuePoint) {

            var metadata=cuePoint.metadata;
            if (cuePoint.relatedObjects &&
                cuePoint.relatedObjects[this.QandA_ResponseProfile] &&
                cuePoint.relatedObjects[this.QandA_ResponseProfile].objects &&
                cuePoint.relatedObjects[this.QandA_ResponseProfile].objects.length>0) {

                metadata=cuePoint.relatedObjects[this.QandA_ResponseProfile].objects[0];

                delete cuePoint.relatedObjects;
            }

            if (!this.joinMetadataWithCuepoint(cuePoint,metadata)) {
                mw.log("Cue point "+cuePoint.id+ " was ignored since it's not a valid one" );
                return null;
            }

            if (!cuePoint.metadata.ThreadId) {
                //take the thread id from cue point id
                cuePoint.metadata.ThreadId=cuePoint.id;
            }

            return new QnaEntry(cuePoint);
        },

        AnswerOnAirQueueUpdate:function(currentPlayerTime){
            var _this = this;
            if (_this.AnswerOnAirQueue().length === 0){
                return;
            }

            // as long as the queue is not empty and it's head contains a cue point with a valid end time (defined and not 0) - remove it.
            while( _this.AnswerOnAirQueue().length > 0 &&
                    parseInt(_this.AnswerOnAirQueue()[0]().cuePoint().createdAt + (_this.AnswerOnAirQueue()[0]().cuePoint().endTime - _this.AnswerOnAirQueue()[0]().cuePoint().startTime)/1000) < currentPlayerTime &&
                    parseInt(_this.AnswerOnAirQueue()[0]().cuePoint().endTime) !== 0){
                _this.AnswerOnAirQueue.shift();
            }

            if (_this.AnswerOnAirQueue().length > 0){
                if (_this.AnswerOnAirQueue()[0]().cuePoint().endTime !== undefined && _this.AnswerOnAirQueue()[0]().cuePoint().endTime > 0){

                    setTimeout(function() {
                        _this.AnswerOnAirQueueUpdate(_this.qnaPlugin.embedPlayer.currentTime);
                    },parseInt(_this.AnswerOnAirQueue()[0]().cuePoint().endTime) - currentPlayerTime*1000);
                }
            }
        },

        addOrUpdateAnswerOnAir: function(item){
            var _this = this;

            for (var i = 0; i < _this.AnswerOnAirQueue().length; i++) {
                if (_this.AnswerOnAirQueue()[i]().cuePoint().id === item.cuePoint().id) {
                    _this.AnswerOnAirQueue()[i](item);
                    return;
                }
            }
            _this.AnswerOnAirQueue.push(ko.observable(item));
        },
        processQnA:function(cuePoints) {
            var _this=this;
            cuePoints.forEach(function(cuePoint) {

                var item=_this.annotationCuePointToQnaEntry(cuePoint);
                if (item) {

                    if (_this.fullCuePointFetchingCalled && _this.lastUpdateTime < cuePoint.updatedAt) {
                        _this.lastUpdateTime = cuePoint.updatedAt;
                    }
                    if (item.getType() === "AnswerOnAir"){

                        _this.addOrUpdateAnswerOnAir(item);
                        _this.AnswerOnAirQueueUpdate(_this.qnaPlugin.embedPlayer.currentTime);

                    }
                    else {
                        _this.addOrUpdateEntry(item);
                    }
                }
            });

            this.sortThreads();
        },
        processQnAState:function(cuePoint) {

            var disableModule = true;
            var announcementOnly = false;

            if (this.fullCuePointFetchingCalled) {
                this.moduleStatusLastUpdateTime = cuePoint.updatedAt;
            }
            //TODO remove this once all procuders app will be upgraded to latest
            if (cuePoint.code === "ENABLE_QNA"){
                disableModule = false;
                announcementOnly = false;
            }
            else if (cuePoint.code === "DISABLE_QNA"){
                disableModule = true;
                announcementOnly = false;
            }
            else if (cuePoint.code === "ENABLE_ANNOUNCEMENTS_ONLY"){
                disableModule = false;
                announcementOnly = true;
            }
            else if (cuePoint.code === "DISABLE_ANNOUNCEMENTS_ONLY"){
                disableModule = false;
                announcementOnly = false;
            }
            //for BC supporting both new and old QnA settings cue points
            if(cuePoint.tags) {
                //old QnA settings cue point convention //todo [sa] remove after releasing new producer version
                if (cuePoint.tags.indexOf("WEBCASTSTATETAG") >= 0) {
                    try {
                        var webCastingState=JSON.parse(cuePoint.code);
                        disableModule=!webCastingState["QnA"];
                        announcementOnly=!disableModule && webCastingState["AnnouncementsOnly"];
                    }
                    catch(e) {
                        mw.log("Error:: Error parsing WEBCASTSTATETAG code cue point "+ e.message+ " "+ e.stack);
                    }
                }
                //new QnA settings cue point convention
                else if (cuePoint.tags.indexOf("player-qna-settings-update") >= 0) {
                    try {
                        if(cuePoint.partnerData) {
                            var webCastingState = JSON.parse(cuePoint.partnerData);
                            webCastingState = webCastingState["qnaSettings"];
                            disableModule = !webCastingState["qnaEnabled"];
                            announcementOnly = !disableModule && webCastingState["announcementOnly"];
                        }
                    }
                    catch(e) {
                        mw.log("Error:: Error parsing player-qna-settings-update code cue point "+ e.message+ " "+ e.stack);
                    }
                }
            }
            this.qnaPlugin.hideModule(disableModule, announcementOnly);
        },

        requestCuePoints:function() {
            var _this = this;

            this.boot().then(function() {

                var entryId = _this.embedPlayer.kentryid;

                // build list annotation cue point request
                var request = {
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:tagsLike':_this.QandA_cuePointTag,
                    'filter:entryIdEqual': entryId,
                    'filter:objectType': 'KalturaAnnotationFilter',
                    'filter:orderBy': '+createdAt',
                    'filter:isPublicEqual': '1',
                    "responseProfile:objectType":"KalturaResponseProfileHolder",
                    "responseProfile:systemName":_this.QandA_ResponseProfileSystemName,

                    /*Search  metadata   */
                    'filter:advancedSearch:objectType': 'KalturaMetadataSearchItem',
                    'filter:advancedSearch:metadataProfileId': _this.metadataProfile.id,
                    'filter:advancedSearch:type': 2, //or

                    //search all messages on my session id
                    'filter:advancedSearch:items:item0:objectType': "KalturaSearchCondition",
                    'filter:advancedSearch:items:item0:field': "/*[local-name()='metadata']/*[local-name()='ThreadCreatorId']",
                    'filter:advancedSearch:items:item0:value': _this.userId,

                    //find all announcements
                    'filter:advancedSearch:items:item1:objectType': "KalturaSearchCondition",
                    'filter:advancedSearch:items:item1:field': "/*[local-name()='metadata']/*[local-name()='Type']",
                    'filter:advancedSearch:items:item1:value': "Announcement",

                    //find all AnswerOnAir cue points
                    'filter:advancedSearch:items:item2:objectType': "KalturaSearchCondition",
                    'filter:advancedSearch:items:item2:field': "/*[local-name()='metadata']/*[local-name()='Type']",
                    'filter:advancedSearch:items:item2:value': "AnswerOnAir"
                };

                var lastUpdatedAt = _this.lastUpdateTime;
                // Only add lastUpdatedAt filter if any cue points already received
                if (lastUpdatedAt > 0) {
                    request['filter:updatedAtGreaterThanOrEqual'] = lastUpdatedAt;
                }

                // build list code cue point request for qna settings (checking both new and old tags for BC)
                var codeCuePointListRequest = {
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:entryIdEqual': entryId,
                    'filter:tagsMultiLikeOr':'player-qna-settings-update,WEBCASTSTATETAG',
                    'filter:cuePointTypeEqual': 'codeCuePoint.Code',
                    'filter:orderBy': '-createdAt',
                    'pager:pageSize': 1,
                    'pager:pageIndex': 1
                };


                var moduleStatusLastUpdateTime = _this.moduleStatusLastUpdateTime + 1;
                // Only add lastUpdatedAt filter if any cue points already received
                if (moduleStatusLastUpdateTime > 0) {
                    codeCuePointListRequest['filter:updatedAtGreaterThanOrEqual'] = moduleStatusLastUpdateTime;
                }

                _this.getKClient().doRequest( [request, codeCuePointListRequest],
                    function (results) {

                        // process results from 1st request
                        var data = results[0];
                        // if an error pop out:
                        if (!data || data.code) {
                            // todo: add error handling
                            mw.log("Error:: KCuePoints could not retrieve live cuepoints");
                            return;
                        }
                        _this.fullCuePointFetchingCalled=true;

                        _this.processQnA(data.objects);

                        // process results from 2nd request
                        var data2 = results[1];
                        // if an error pop out:
                        if (!data2 || !data2.objects || data2.objects.length < 1) {
                            return;
                        }

                        var cuePoint = data2.objects[0];
                        if (cuePoint === undefined || cuePoint.code === undefined){
                            return;
                        }
                        _this.processQnAState(cuePoint);

                    }
                );
            });
        },
        
        registerUserNotificationItems: function() {
            var _this = this;

            return this.registerNotification(_this.QandA_UserNotificationName,
                {"entryId":_this.embedPlayer.kentryid,"userId":_this.userId},function(cuePoint) {
                _this.processQnA([cuePoint]);
            });
        },
        registerCodeNotificationItems: function() {
            var _this = this;

            return this.registerNotification(_this.QandA_CodeNotificationName,
                {"entryId":_this.embedPlayer.kentryid},function(cuePoint) {
                    _this.processQnAState([cuePoint]);
                });
        },
        registerPublicNotificationItems: function() {

            var _this = this;

            return this.registerNotification(this.QandA_publicNotificationName,
                {"entryId":_this.embedPlayer.kentryid},function(cuePoint) {
                _this.processQnA([cuePoint]);
            });

        },

        socketWrapper: function() {
            return {
                socket: null,
                callbacks:{},
                connect: function(eventName, url) {
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
                        log('push server was disconnected');
                    });
                    this.socket.on('reconnect', function () {
                        log('push server was reconnected');
                    });
                    this.socket.on('reconnect_error', function (e) {
                        log('push server reconnection failed '+e);
                    });

                    this.socket.on('connected', function(queueKey){
                        mw.log("Listening to queue [" + queueKey + "] for eventName "+eventName);
                    });

                    this.socket.on('message', function(queueKey, msg){
                        var message=String.fromCharCode.apply(null, new Uint8Array(msg.data))
                        mw.log("["+eventName+"][" + queueKey + "]: " +  message);
                        var obj=JSON.parse(message);
                        _this.callback(obj);
                        /*
                        if (_this.callbacks[queueKey]) {
                            _this.callbacks[queueKey](obj);
                        }*/
                    });
                    return this.deferred;

                },
                listen:function(eventName,cb) {
                   // this.callbacks[eventName] = cb;
                    this.callback = cb;
                },
                emit:function(key,msg) {
                    this.socket.emit(key,msg)
                }
            }
        },

        registerNotification:function(eventName,params,callback) {
            var deferred = $.Deferred();

            var _this=this;

            var request = {
                'service': 'eventNotification_eventNotificationTemplate',
                'action': 'register',
                'format': 1,
                "notificationTemplateSystemName": eventName,
            };
            var index=0;
            $.each( params, function(key,value) {
                request["userParamsArray:"+index+":objectType"]="KalturaEventNotificationParameter";
                request["userParamsArray:"+index+":key"]=key;
                request["userParamsArray:"+index+":value:objectType"]="KalturaStringValue";
                request["userParamsArray:"+index+":value:value"]=value;
                index++;
            });
            mw.log("registering to ",request)

            this.getKClient().doRequest(request, function(result) {
                if (result.objectType==="KalturaAPIException") {
                    mw.log("Error registering to "+eventName+" message:"+result.message+" ("+result.code+")");
                    deferred.resolve(false);
                    return;
                }
                var socket = _this.socketWrappers[result.url];
                if (!socket) {
                    socket= _this.socketWrapper();
                    _this.socketWrappers[result.url]=socket;
                }
                socket.listen(result.key,function(obj) {
                    callback(obj);
                });

                socket.connect(eventName, result.url).then(function() {

                    socket.emit('listen', result.key);
                    deferred.resolve(true);

                });
            });

            return deferred;
        }

    };
})(window.mw, window.jQuery, window.ko);
