(function (mw, $, ko) {
    "use strict";
    var NUM_OF_MAX_CHAR = 500;

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
                this.myObservableAnswerOnAirQueue = qnaService.AnswerOnAirQueue;
                this.currentTime = ko.observable(new Date().getTime());
                this.myObservableArray.subscribe(function() {
                    _this.applyLayout();
                    _this.qnaPlugin.updateUnreadBadge();
                });
                this.playerTime = ko.observable(embedPlayer.getPlayerElementTime());

                // An entry in a Q&A thread (not an announcement) was clicked
                // if it's the first one in the thread - collapse / Expand the thread
                // if it's not - call itemRead
                this.EntryClicked = function (entry, event) {
                    if (entry.getThread().entries()[0]() === entry){
                        entry.getThread().entries.reverse();
                        _this.collapseExpandThread(entry, event);

                        _this.applyLayout();

                        if (entry.getThread().isCollapsed()){
                            _this.qnaService.markThreadAsRead(entry.getThread());
                        }
                    }
                };

                this.itemRead = function (item, event) {
                    if (!item.isRead()) {
                        _this.qnaService.markAsRead(item);
                    }
                };
                this.openLinkInNewTab = function (item, event) {
                    var href = $(event.target).attr('href');
                    if(href){
                        window.open(href, '_blank');
                    }
                };

                this.inThreadReply = function(replyText, qnaThread) {
                    if (replyText() === gM("qna-reply-here")){
                        return false;
                    }
                    // protection from empty string
                    if (!(/\S/.test(replyText()))){
                        return false;
                    }

                    if (_this.qnaPlugin.getPlayer().isOffline() && !_this.qnaPlugin.getConfig( 'allowNewQuestionWhenNotLive' )){
                        alert(gM('qna-cant-ask-while-not-live'));
                    } else {

                        _this.qnaService.submitQuestion(replyText(), qnaThread.entries()[qnaThread.entries().length - 1]());
                        _this.qnaService.markThreadAsRead(qnaThread);
                        qnaThread.replyText(gM("qna-reply-here"));
                        qnaThread.isTypingAnswer(false);
                        return true;
                    }
                    return false;
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
                    var ratio = $(elem).height() / $(window).height();
                    var deltaY = event.originalEvent.deltaY * ratio;
                    $(elem).scrollTop(elem.scrollTop - Math.round(deltaY));

                    if (elem.scrollTop !== 0 && elem.scrollHeight !== elem.offsetHeight+elem.scrollTop) {
                        return;
                    }
                    return true;
                };

                this.textAreaTouched = function(data, event) {
                    var elem = event.target;
                    $(elem).css({'overflow':'auto'});
                    return true;
                };

                this.replyOnEnter=function(qnaThread,e){
                    // if its an enter, and the shift|alt|ctrl were not down - submit the question
                    if (e.keyCode === 13 && !e.altKey && !e.shiftKey && !e.ctrlKey){
                        if(_this.inThreadReply(qnaThread.replyText, qnaThread)) {
                            e.target.blur();
                        }
                        // Prevent default
                        return false;
                    }
                    return true;
                };

                this.updateNumOfChars = function (replayText) {
                    return replayText().length + '/' + NUM_OF_MAX_CHAR;
                };

                this.collapseExpandThread = function (entry, event) {
                    // Get thread by ID and set it to be collapsed / Expanded
                    entry.getThread().isCollapsed(!entry.getThread().isCollapsed());
                };

                $( embedPlayer ).bind('timeupdate', function () {
                    // in DVR mode embedPlayer.current time is in seconds - so we need to add dvrAbsoluteStartTime
                    if(embedPlayer.isDVR()){
                        _this.playerTime(this.dvrAbsoluteStartTime+this.currentTime);
                    }else{
                        // in live (non-dvr) mode embedPlayer.current time is in timestamp - no need to add baseline
                        _this.playerTime(this.LiveCurrentTime);
                    }
                });
            },
            destroy: function () {
                $(this.embedPlayer).unbind(this.bindPostfix);
            },
            applyLayout: function () {
                var _this = this;
                var scroll = _this.qnaPlugin.getQnaContainer().find(".nano")
                scroll.find(".nano-content").css("z-index", -1);

                if ($(".qnaInterface").length > 0) {
                    scroll.nanoScroller();
                }
                else {
                    try {
                        scroll.nanoScroller({documentContext: window['parent'].document});
                    }catch(e){
                        mw.log("failed to access window['parent'] for scroll.nanoScroller");
                    }
                }
                scroll.find(".nano-content").css("z-index", "");
            },
            getNoMessagesText: function(){
                return gM("qna-no-messages-text");
            },
            qnaListHiderText: function() {
                return gM('qna-list-hider-text');
            },
            announcementOnlyStatus: function(){
                var _this = this;
                return _this.qnaPlugin.announcementOnlyStatus();
            },
            moduleStatus: function(){
                var _this = this;
                return _this.qnaPlugin.moduleStatus();
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
                        if (thread().entries()[i]().getType() !== 'Question' && !thread().entries()[i]().isRead()
                                && (thread().entries()[i]().getType() === 'Announcement' ? thread().entries()[i]().cuePoint().metadata.State !== 'Deleted' : true)) {
                            count++;
                        }
                    }
                });
                return count;
            }
        })) {
    }
})(window.mw, window.jQuery, window.ko);

