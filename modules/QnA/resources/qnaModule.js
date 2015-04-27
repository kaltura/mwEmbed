(function (mw, $) {
    "use strict";
    mw.KQnaModule = function (embedPlayer,qnaPlugin,qnaService) {
        return this.init(embedPlayer,qnaPlugin,qnaService);
    };
    mw.KQnaModule.prototype = {

        // The bind postfix:
        bindPostfix: '.KQnaModule',
        qnaPlugin: null,
        qnaService: null,

        init: function (embedPlayer,qnaPlugin,qnaService) {

            var _this = this;
            // Remove any old bindings:
            this.destroy();
            // Setup player ref:
            this.embedPlayer = embedPlayer;
            this.qnaPlugin = qnaPlugin;
            this.qnaService = qnaService;
            this.myObservableArray = qnaService.getItems();

            this.myObservableArray.subscribe(function(newVal){
                _this.applyLayout();
                qnaPlugin.updateUnreadBadge();
            });
            this.applyLayout();

            this.itemRead= function(item, event) {
                console.log("item of type " + item.type + " with id " + item.threadId + " was clicked");

                _this.qnaService.markAsRead(item);
            }

        },
        destroy: function () {

            $(this.embedPlayer).unbind(this.bindPostfix);
        },
        applyLayout:function() {

            var scroll=$( window['parent'].document ).find(".nano");
            scroll.find(".nano-content" ).css("z-index", -1);
            scroll.nanoScroller({ documentContext: window['parent'].document});
            scroll.find(".nano-content" ).css("z-index", "");
        },
        getUnreadCount: function(){
            var _this = this;
            // The commented line below is correct, but it also counts regular questions
            // so for now we do something else
            //return _this.myObservableArray().length - _this.qnaService.readThreadsCount();

            var count = 0;
            ko.utils.arrayForEach(_this.myObservableArray(), function(entry) {
                if (entry.tags == "QnaAnnouncement" && !_this.qnaService.viewedThreads.isRead(entry.id)){
                    count++;
                }
            });
            return count;
        }
    };
})(window.mw, window.jQuery);
