/*
DAL for Q&A Module


 */

(function (mw, $) {
    "use strict";
    mw.KQnaService = function (embedPlayer,qnaPlugin) {
        return this.init(embedPlayer,qnaPlugin);
    };

    var viewedThreads=(function() {
        var _viewedThreads = [];
        if (localStorage["_viewedThreads"]) {
            _viewedThreads = JSON.parse(localStorage["_viewedThreads"]);
        }
        return {
            markAsRead: function(threadId) {
                // Write to localStorage this item was read
                if (_viewedThreads.indexOf(threadId) < 0 ) {
                    _viewedThreads.push(threadId);
                    localStorage["_viewedThreads"] = JSON.stringify(_viewedThreads);

                }
            },
            isRead:function(threadId) {
                return _viewedThreads.indexOf(threadId) > -1;
            },
            readThreadsCount: function() {
                return _viewedThreads.length;
            }
        };
    })();

    mw.KQnaService.prototype = {

        // The bind postfix:
        bindPostfix: '.KQnaService',
        liveAQnaIntervalId: null,
        items: ko.observableArray(),
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
        getItems: function () {
            return this.items;
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


                        var item=_this.annotationCuePointToItem(cuePoint);

                        if (item) {

                            _this.addOrUpdateItem(item);
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

        markAsRead: function (item) {
            viewedThreads.markAsRead(item.metadata.threadId);
            this.addOrUpdateItem(this.annotationCuePointToItem(item));
        },

        readThreadsCount: function () {
            return viewedThreads.readThreadsCount();
        },

        addOrUpdateItem: function (item) {

            var _this=this;

            var found = false;
            for (var i = 0; i < _this.items().length; i++) {
                if (_this.items()[i]().id === item().id) {
                    found = true;

                    _this.items.splice(i, 0, item);
                    _this.items.splice(i+1, 1);

                    break;
                }
            }
            ;

            if (!found) {
                _this.items.unshift(item);
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
        joinMetadataWithCuepoint:function(cuePoint,metadata )
        {
            if (!metadata)
                return false;

            var obj=this.metadataToObject(metadata);

            delete cuePoint.relatedObjects;

            $.extend(cuePoint,{ metadata: obj, metadataId: metadata.id});

            return true;

        },

        annotationCuePointToItem: function(cuePoint) {

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

            if (!cuePoint.metadata.threadId) {
                //take the thread id from cue point id
                cuePoint.metadata.threadId=cuePoint.id;
            }

            var tempType=this.QandA_cuePointTypes[cuePoint.metadata.Type];

            var type = "qnaThread";
            var title = gM('qna-you-asked');


            if (tempType === this.QandA_cuePointTypes.Announcement) {
                type = "announcement";
                title = gM('qna-announcement-title');
            }


            var threadId = cuePoint.id;
            return ko.observable(
                $.extend(cuePoint,{
                    isRead: ko.observable(viewedThreads.isRead(threadId)),
                    title: title,
                    entryText:cuePoint.text,
                    timestamp: ko.observable(cuePoint.createdAt),
                    currentTime: ko.observable(new Date().getTime())
                })
            );
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

                        var item=_this.annotationCuePointToItem(cuePoint);

                        if (item) {

                            if (_this.lastUpdateTime < cuePoint.updatedAt) {
                                _this.lastUpdateTime = cuePoint.updatedAt;
                            }
                            _this.addOrUpdateItem(item);
                        }
                    });

                   // _this.embedPlayer.triggerHelper('KalturaSupport_CuePointsUpdated', [data.totalCount]);
                }
            );

            // to cause the re-calculation of the timestamp
            for (var i = 0; i < _this.items().length; i++) {
                _this.items()[i]().currentTime(new Date().getTime());
            }
        },

        /*
        Currently there is no notification, so we poll the API
         */
        registerItemNotification: function () {
            var _this = this;

            //Start live cuepoint pulling
            this.liveAQnaIntervalId = setInterval(function () {
                _this.requestCuePoints();
            }, mw.getConfig("qnaPollingInterval") || 10000);
        }
    };
})(window.mw, window.jQuery);
