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
        items:[],
        lastUpdateTime: -1,

        init: function (embedPlayer,qnaPlugin) {
            var _this = this;
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.qnaPlugin=qnaPlugin;
/*
            this.requestCuePoints();

            if (embedPlayer.isLive()) {
                this.registerItemNotification();
            }
*/

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
            return [];
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
                    mw.log("added Annotation cue point with id: " + result.id);
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

            _this.items=newItems;
        },
        requestCuePoints:function() {
            var _this = this;

            var entryId = _this.embedPlayer.kentryid;
            var request = {
                'service': 'cuepoint_cuepoint',
                'action': 'list',
                'filter:entryIdEqual': entryId,
                'filter:objectType': 'KalturaCuePointFilter',
                'filter:statusIn': '1,3',
                'filter:cuePointTypeEqual': 'KalturaAnnotation.Thumb'
            };
            var lastUpdatedAt = _this.getLastUpdateTime() + 1;
            // Only add lastUpdatedAt filter if any cue points already received
            if (lastUpdatedAt > 0) {
                request['filter:updatedAtGreaterThanOrEqual'] = lastUpdatedAt;
            }
            _this.getKalturaClient().doRequest( request,
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
            }, mw.getConfig("EmbedPlayer.LiveQandARequestInterval") || 10000);
        },


        // Get the Q&A data from the server.
        getQnaData : function(viewedThreads){

            var qnaEntryArray = [];
            var threadId = "s9oa3cc";
            qnaEntryArray.push( {
                threadId: threadId,
                type: "announcement",
                title: gM('qna-announcement-title'),
                entryText:"All your bases are belong to us",
                entryTitleClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTitleRead" : "qnaAnnouncementTitle",
                entryTextClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTextRead" : "qnaAnnouncementText",
                entryClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementRead" : "qnaAnnouncement"
            });
            // The below (commented out) is supposed to simulate a Q&A thread
            //qnaEntryArray[qnaEntryArray.length] = {
            //	threadId: "qyv78s1",
            //	type: "qna_thread",
            //	title: gM('qna-you-asked'),
            //	titleClass: "qnaThreadTitle",
            //	entryText: "gadol",
            //	entryClass: "qnaThread",
            //	qnalist: [
            //		{id: "d873j9", title:"aaa", text:"fdgfdgdfgsd sdf sf d"},
            //		{id: "i8a3xw", title:"aaa", text:"fdgfdgdfgsd sdf sf d"},
            //	]
            //};
            threadId = "qyv78a7";
            qnaEntryArray[qnaEntryArray.length] = {
                threadId: threadId,
                type: "announcement",
                title: gM('qna-announcement-title'),
                entryText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum a eros eu quam dictum sagittis. Nam sit amet odio turpis. Morbi mauris nisi, consequat et tortor a, vehicula pharetra sem. Nunc vitae lacus id sapien tristique pretium at non lorem. Integer venenatis lacus nec erat.",
                entryTitleClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTitleRead" : "qnaAnnouncementTitle",
                entryTextClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTextRead" : "qnaAnnouncementText",
                entryClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementRead" : "qnaAnnouncement"
            };
            threadId = "2dcdvcd";
            qnaEntryArray[qnaEntryArray.length] = {
                threadId: threadId,
                type: "announcement",
                title: gM('qna-announcement-title'),
                entryText:"This is a sample text for an announcement",
                entryTitleClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTitleRead" : "qnaAnnouncementTitle",
                entryTextClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTextRead" : "qnaAnnouncementText",
                entryClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementRead" : "qnaAnnouncement"
            };
            threadId = "cch74vv";
            qnaEntryArray[qnaEntryArray.length] = {
                threadId: threadId,
                type: "announcement",
                title: gM('qna-announcement-title'),
                entryText:"just one more announcement...",
                entryTitleClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTitleRead" : "qnaAnnouncementTitle",
                entryTextClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementTextRead" : "qnaAnnouncementText",
                entryClass: viewedThreads.indexOf(threadId) > -1 ? "qnaAnnouncementRead" : "qnaAnnouncement"
            };

            return qnaEntryArray;
        },
    };
})(window.mw, window.jQuery);
