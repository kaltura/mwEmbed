/*
DAL for Q&A Module


 */

(function (mw, $) {
    "use strict";

    var viewedThreads=(function() {
        var _viewedThreads = [];
        if (localStorage["_viewedThreads"]) {
            _viewedThreads = JSON.parse(localStorage["_viewedThreads"]);
        }
        return {
            markAsRead: function(ThreadId) {
                // Write to localStorage this item was read
                if (_viewedThreads.indexOf(ThreadId) < 0 ) {
                    _viewedThreads.push(ThreadId);
                    localStorage["_viewedThreads"] = JSON.stringify(_viewedThreads);

                }
            },
            isRead:function(ThreadId) {
                return _viewedThreads.indexOf(ThreadId) > -1;
            },
            readThreadsCount: function() {
                return _viewedThreads.length;
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

        this.isRead = ko.observable(viewedThreads.isRead(_this.threadID));

        this.appendEntry = function(entry){
            _this.entries.push(ko.observable(entry));
        };
    };

    function QnaEntry(cuePoint){

        this.cuePoint=ko.observable(cuePoint);
        this.timestamp = ko.observable(this.cuePoint().createdAt);

        //this.type = cuePoint.metadata.Type ? QandA_cuePointTypes.Announcement[cuePoint.metadata.Type] : undefined;

        this.getType = function(){
            return this.cuePoint().metadata.Type;
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

        this.isAnnouncement = function(){
            return this.type === "Announcement";
        };

        this.getTitle = function(){
            if (this.getType() === "Announcement"){
                return gM('qna-announcement-title');
            }
            else{
                return gM('qna-you-asked');
            }
        };

        this.getText = function(){
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
        lastUpdateTime: -1,
        QandA_ResponseProfile: "QandA_ResponseProfile",
        QandA_ResponseProfileSystemName: "QandA",
        QandA_MetadataProfileSystemName: "QandA",
        QandA_cuePointTag: "qna",
        useResponseProfile: false,
        QandA_cuePointTypes: {"Question":1,"Answer":2, "Announcement":3},


        init: function (embedPlayer, qnaPlugin) {
            var _this = this;
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.qnaPlugin = qnaPlugin;

            this.requestCuePoints();

            if (embedPlayer.isLive()) {
                this.registerItemNotification();
            }

        },

        viewedThreads: viewedThreads,

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

            var startTime = new Date();

            var metadata= { };
            if (parent) {
                metadata.ThreadId = parent.metadata.ThreadId;
                metadata.Type="Answer";
            } else {
                //no threadid!
                metadata.Type="Question";
            }

            var xmlData = _this.createMetadataXmlFromObject(metadata);


            var createCuePointRequest = {
                "service": "cuePoint_cuePoint",
                "action": "add",
                "cuePoint:objectType": "KalturaAnnotation",
                "cuePoint:entryId": embedPlayer.kentryid,
                "cuePoint:startTime": embedPlayer.currentTime,
                "cuePoint:text": question,
                "cuePoint:tags": this.QandA_cuePointTag,
                "cuePoint:partnerData": xmlData
            };
            if (parent) {
                createCuePointRequest["cuePoint:parentId"] = parent.id;
            }

            var listMetadataProfileRequest = {
                service: "metadata_metadataprofile",
                action: "list",
                "filter:systemNameEqual": this.QandA_MetadataProfileSystemName
            };
            var addMetadataRequest = {
                service: "metadata_metadata",
                action: "add",
                metadataProfileId: "{2:result:objects:0:id}",
                objectId: "{1:result:id}",
                xmlData: xmlData,
                objectType: "annotationMetadata.Annotation"
            };


            // mw.log("Submitting a new question: " + question);

            _this.getKClient().doRequest([createCuePointRequest, listMetadataProfileRequest, addMetadataRequest], function (result) {
                    var endTime = new Date();
                    var cuePoint = result[0];
                    var metadata = result[2];
                    if (cuePoint.id) {


                        var item=_this.annotationCuePointToQnaEntry(cuePoint);

                        if (item) {

                            _this.addOrUpdateEntry(item);
                        }
                        mw.log("added Annotation cue point with id: " + cuePoint.id + " took " + (endTime - startTime) + " ms");


                    } else {
                        mw.log("error adding Annotation " + JSON.stringify(cuePoint));

                    }
                },
                false,
                function (err) {
                    mw.log("Error: " + this.bindPostfix + " could not add cue point. Error: " + err);
                });
        },

        markAsRead: function (thread) {
            viewedThreads.markAsRead(thread.threadID);
            this.updateThread(thread);
        },

        readThreadsCount: function () {
            return viewedThreads.readThreadsCount();
        },

        updateThread: function(qnaThread){
            var _this=this;
            for (var i = 0; i < _this.QnaThreads().length; i++) {
                if (_this.QnaThreads()[i]().getThreadID() === qnaThread.threadID){
                    qnaThread.isRead(true);
                    _this.qnaPlugin.updateUnreadBadge();
                    break;
                }
            }
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

                    _this.QnaThreads.splice(i, 0, _this.QnaThreads()[i]);
                    _this.QnaThreads.splice(i+1, 1);

                    break;
                }
            }

            if (!found) {
                var newThread = new QnaThread(qnaEntry.getThreadID());
                newThread.appendEntry(qnaEntry);
                _this.QnaThreads.unshift(ko.observable(newThread));
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

            if (!cuePoint.metadata) {

                metadata={ xml: cuePoint.partnerData, id: null };
            }

            if (!this.joinMetadataWithCuepoint(cuePoint,metadata)) {
                mw.log("Cue point "+cuePoint.id+ " was ignored since it's not a valid one" );
                return null;
            }

            if (!cuePoint.metadata.ThreadId) {
                //take the thread id from cue point id
                cuePoint.metadata.ThreadId=cuePoint.id;
            }

            var tempType=this.QandA_cuePointTypes[cuePoint.metadata.Type];

            return new QnaEntry(cuePoint);
        },

        requestCuePoints:function() {
            var _this = this;

            var entryId = _this.embedPlayer.kentryid;
            var request = {
                'service': 'cuepoint_cuepoint',
                'action': 'list',
                'filter:tagsLike':_this.QandA_cuePointTag,
                'filter:entryIdEqual': entryId,
                'filter:objectType': 'KalturaAnnotationFilter',
                'filter:orderBy': '+createdAt'
            };

            if (_this.useResponseProfile) {
                request["responseProfile:objectType"]="KalturaResponseProfileHolder";
                request["responseProfile:systemName"]=_this.QandA_ResponseProfileSystemName;
            }
            var lastUpdatedAt = _this.lastUpdateTime + 1;
            // Only add lastUpdatedAt filter if any cue points already received
            if (lastUpdatedAt > 0) {
                request['filter:updatedAtGreaterThanOrEqual'] = lastUpdatedAt;
            }
            _this.getKClient().doRequest( request,
                function (data) {
                    // if an error pop out:
                    if (!data || data.code) {
                        // todo: add error handling
                        mw.log("Error:: KCuePoints could not retrieve live cuepoints");
                        return;
                    }

                    data.objects.forEach(function(cuePoint) {

                        var item=_this.annotationCuePointToQnaEntry(cuePoint);

                        if (item) {

                            if (_this.lastUpdateTime < cuePoint.updatedAt) {
                                _this.lastUpdateTime = cuePoint.updatedAt;
                            }
                            _this.addOrUpdateEntry(item);
                        }
                    });
                }
            );
        },

        //Currently there is no notification, so we poll the API
        registerItemNotification: function () {
            var _this = this;

            //Start live cuepoint pulling
            this.liveAQnaIntervalId = setInterval(function () {
                _this.requestCuePoints();
            }, mw.getConfig("qnaPollingInterval") || 10000);
        }
    };
})(window.mw, window.jQuery);
