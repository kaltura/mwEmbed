(function (mw, $) {
    "use strict";

    function QnaThread(threadId){
        this.threadID = threadId;
        this.entries = ko.observableArray();
    };

    function QnaEntry(cuePoint){

        this.cuePoint=cuePoint;

        //this.type = cuePoint.metadata.Type ? QandA_cuePointEnums[cuePoint.metadata.Type] : undefined;
        //
        //this.getContent = function(){
        //    return this.cuePoint.text;
        //};
        //
        //this.wasEntryCreatedByMe = function(){
        //    return this.cuePoint.userId === myUserId;
        //};
        //
        //this.getTime = function(){
        //    return this.cuePoint.createdAt;
        //};
        //
        //this.getOwner = function(){
        //    return this.cuePoint.userId;
        //};
        //this.getThreadId = function(){
        //    return this.cuePoint.metadata.ThreadId;
        //};
        //
        //this.isAnnouncement = function(){
        //    return this.type===QandA_cuePointEnums.Announcement;
        //};
        //
        //
        //this.reply=function (msgContent) {
        //    return createItem(msgContent,"Answer",this.cuePoint.metadata.ThreadId,this.cuePoint.id);
        //};

    }

})(window.mw, window.jQuery);