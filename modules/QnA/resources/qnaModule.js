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
            this.myObservableArray = qnaService.getQnaThreads();
            this.currentTime = ko.observable(new Date().getTime());

            this.myObservableArray.subscribe(function(newVal){
                _this.applyLayout();
                qnaPlugin.updateUnreadBadge();
            });

            this.itemRead= function(thread, event) {
                console.log("thread with id " + thread.ThreadID + " was clicked");

                if (!thread.isRead()) {
                    _this.qnaService.markAsRead(thread);
                }
            };

            // update current time to update display
            setInterval(function () {
                _this.currentTime(new Date().getTime());
            }, mw.getConfig("qnaPollingInterval") || 10000);

        },
        destroy: function () {

            $(this.embedPlayer).unbind(this.bindPostfix);
        },
        applyLayout:function() {
            var _this = this;
            var scroll = _this.qnaPlugin.getQnaContainer().find(".nano")
            //var scroll=$( window['parent'].document ).find(".nano");
            scroll.find(".nano-content" ).css("z-index", -1);

            if ($(".qnaInterface").length > 0){
                scroll.nanoScroller();
            }
            else{
                scroll.nanoScroller({ documentContext: window['parent'].document});
            }
            scroll.find(".nano-content" ).css("z-index", "");
        },
        getUnreadCount: function(){
            var _this = this;
            // The commented line below is correct, but it also counts regular questions
            // so for now we do something else
            //return _this.myObservableArray().length - _this.qnaService.readThreadsCount();

            var count = 0;
            ko.utils.arrayForEach(_this.myObservableArray(), function(thread) {
                if (thread().entries()[0]().getType() == "Announcement" && !thread().isRead()){
                    count++;
                }
            });
            return count;
        }
    };
})(window.mw, window.jQuery);
