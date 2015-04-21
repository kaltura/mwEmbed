/*
DAL for Q&A Module


 */

(function (mw, $) {
    "use strict";
    mw.KQnaService = function (embedPlayer,qnaPlugin) {
        return this.init(embedPlayer,qnaPlugin);
    };
    mw.KQnaService.prototype = {

        // The bind postfix:
        bindPostfix: '.KQnaService',
        liveAQnaIntervalId: null,
        items: ko.observableArray(),
        itemsIndexer: {},
        lastUpdateTime: -1,

        init: function (embedPlayer,qnaPlugin) {
            var _this = this;
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.qnaPlugin=qnaPlugin;

            this.requestCuePoints();

            if (embedPlayer.isLive()) {
                this.registerItemNotification();
            }


        },
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
        getItems : function() {
            return this.items;
        },
        submitQuestion: function(question){
            var embedPlayer = this.embedPlayer;
            var _this = this;

            var entryRequest = {
                "service": "cuePoint_cuePoint",
                "action": "add",
                "cuePoint:objectType": "KalturaAnnotation",
                "cuePoint:entryId": embedPlayer.kentryid,
                "cuePoint:startTime": embedPlayer.currentTime,
                "cuePoint:text": question,
                "cuePoint:tags": "qna"
            };
           // mw.log("Submitting a new question: " + question);

            _this.getKClient().doRequest(entryRequest, function (result) {
                    if (result.id) {
                        mw.log("added Annotation cue point with id: " + result.id);
                        _this.updateCuePoints([result]);
                    } else{
                        mw.log("error adding Annotation " + JSON.stringify(result));

                    }
                },
                false,
                function(err){
                    mw.log( "Error: "+ this.bindPostfix +" could not add cue point. Error: " + err );
                });
        },
        markAsRead:function(item) {

        },
        updateCuePoints:function(newItems) {

            var _this = this;
            $.each(newItems, function (cuePoint) {
                if (_this.lastUpdateTime < cuePoint.updatedAt) {
                    _this.lastUpdateTime = cuePoint.updatedAt;
                }
            });

            newItems.forEach(function(cuePoint) {
                if (_this.itemsIndexer.hasOwnProperty(cuePoint.id)) {
                    //update the item
                    var index=_this.itemsIndexer[cuePoint.id];
                    _this.items[index]=_this.annotationCuePointToQAItem(cuePoint);
                } else {
                    _this.items.unshift(_this.annotationCuePointToQAItem(cuePoint));
                }
            });
        },

        annotationCuePointToQAItem: function(cuePoint) {


            return $.extend(cuePoint,{
                threadId: "s9oa3cc",
                type: "announcement",
                title: gM('qna-announcement-title'),
                entryText:cuePoint.text,
                entryTitleClass:  "qnaAnnouncementTitle",
                entryTextClass:  "qnaAnnouncementText",
                entryClass:  "qnaAnnouncement"
            });
        },
        requestCuePoints:function() {
            var _this = this;

            var entryId = _this.embedPlayer.kentryid;
            var request = {
                'service': 'cuepoint_cuepoint',
                'action': 'list',
                'filter:entryIdEqual': entryId,
                'filter:objectType': 'KalturaAnnotationFilter',
               // 'filter:statusIn': '1,3',
                'filter:orderBy': '+createdAt'
            };
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
                    _this.updateCuePoints(data.objects);
                    _this.embedPlayer.triggerHelper('KalturaSupport_CuePointsUpdated', [data.totalCount]);
                }
            );
        },
        /*
        Currently there is no notification, so we poll the API
         */
        registerItemNotification: function () {
            var _this = this;


            //Start live cuepoint pulling
            this.liveAQnaIntervalId = setInterval(function () {
                _this.requestCuePoints();
            }, mw.getConfig("QandA.RequestInterval") || 10000);
        }
    };
})(window.mw, window.jQuery);
