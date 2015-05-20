(function (mw, $) {
    "use strict";
    mw.KQnaModule = function (embedPlayer,qnaPlugin,qnaService) {
        return this.init(embedPlayer,qnaPlugin,qnaService);
    };
    if (!(mw.KQnaModule.prototype = {

            // The bind postfix:
            bindPostfix: '.KQnaModule',
            qnaPlugin: null,
            qnaService: null,

            init: function (embedPlayer, qnaPlugin, qnaService) {

                var _this = this;
                // Remove any old bindings:
                this.destroy();
                // Setup player ref:
                this.embedPlayer = embedPlayer;
                this.qnaPlugin = qnaPlugin;
                this.qnaService = qnaService;
                this.myObservableArray = qnaService.getQnaThreads();
                this.currentTime = ko.observable(new Date().getTime());

                this.myObservableArray.subscribe(function (newVal) {
                    _this.applyLayout();
                    qnaPlugin.updateUnreadBadge();
                });

                // An entry in a Q&A thread (not an announcement) was clicked
                // if it's the first one in the thread - collapse / Expand the thread
                // if it's not - call itemRead
                this.EntryClicked = function (entry, event) {
                    if (entry.getThread().entries()[0]() == entry){
                        entry.getThread().entries.reverse();
                        _this.collapseExpandThread(entry, event);
                    }
                    else{
                        _this.itemRead(entry, event);
                    }
                };

                this.itemRead = function (item, event) {
                    if (!item.isRead()) {
                        _this.qnaService.markAsRead(item);
                    }
                };

                this.inThreadReply = function(replyText, qnaThread) {
                    if (replyText() === gM("qna-reply-here")){
                        return;
                    }
                    _this.qnaService.submitQuestion(replyText(), qnaThread.entries()[qnaThread.entries().length-1]());
                    qnaThread.replyText(gM("qna-reply-here"));
                };

                this.clearTextArea = function(qnaThread, event){
                    if (qnaThread.replyText() === gM("qna-reply-here")){
                        qnaThread.replyText("");
                        qnaThread.isTypingAnswer(true);
                    }
                };

                this.resetTextArea = function(qnaThread, event){
                    if (qnaThread.replyText() === ""){
                        qnaThread.replyText(gM("qna-reply-here"));
                        qnaThread.isTypingAnswer(false);
                    }
                };

                this.textAreaScrolled = function(data, event) {
                    var elem = event.target;
                    //if (elem.scrollHeight > elem.offsetHeight){
                        $(elem).scrollTop(elem.scrollTop - Math.round(event.originalEvent.deltaY));

                        if (elem.scrollTop !== 0 && elem.scrollHeight !== elem.offsetHeight+elem.scrollTop) {
                            return;
                        }
                    //}
                    // return true to let the default action proceed
                    return true;
                };

                this.collapseExpandThread = function (entry, event) {
                    console.log("collapse / expand for thread with id " + entry.getThreadID() + " was clicked");

                    if (entry.getThread().entries().length < 2)
                        return;

                    // Get thread by ID and set it to be collapsed / Expanded
                    entry.getThread().isCollapsed(!entry.getThread().isCollapsed());
                };

                // update current time to update display
                setInterval(function () {
                    _this.currentTime(new Date().getTime());
                }, mw.getConfig("qnaPollingInterval") || 10000);

            },
            destroy: function () {

                $(this.embedPlayer).unbind(this.bindPostfix);
            },
            applyLayout: function () {
                var _this = this;
                var scroll = _this.qnaPlugin.getQnaContainer().find(".nano")
                //var scroll=$( window['parent'].document ).find(".nano");
                scroll.find(".nano-content").css("z-index", -1);

                if ($(".qnaInterface").length > 0) {
                    scroll.nanoScroller();
                }
                else {
                    scroll.nanoScroller({documentContext: window['parent'].document});
                }
                scroll.find(".nano-content").css("z-index", "");
            },
            getUnreadCount: function () {
                var _this = this;
                // The commented line below is correct, but it also counts regular questions and read counts from other web-cast events
                // so for now we do something else.
                // @todo refactor - store the read entryIDs by kep per thread and move the counting loop to the qnaService
                //return _this.qnaService.entriesCount() - _this.qnaService.readThreadsCount();

                var count = 0;
                ko.utils.arrayForEach(_this.myObservableArray(), function (thread) {
                    for (var i = 0; i < thread().entries().length; i++) {
                        if (thread().entries()[i]().getType() !== 'Question' && !thread().entries()[i]().isRead()) {
                            count++;
                        }
                    }
                });
                return count;
            }
        })) {
    }
})(window.mw, window.jQuery);
