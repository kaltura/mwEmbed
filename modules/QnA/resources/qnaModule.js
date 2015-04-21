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

            ko.observableArray.fn.refresh = function (item) {
                var index = this['indexOf'](item);
                if (index >= 0) {
                    this.splice(index, 1);
                    this.splice(index, 0, item);
                }
            };

            var _viewedThreads = [];
            if (localStorage["_viewedThreads"]) {
                _viewedThreads = JSON.parse(localStorage["_viewedThreads"]);
            }
            var _plugin = qnaPlugin;
            this.myObservableArray = ko.observableArray();

            this.numberOfClicks = ko.observable(0);

            _this.incrementClickCounter = function() {

                _this.myObservableArray.unshift(qnaService.getQnaData(_viewedThreads)[this.numberOfClicks() % qnaService.getQnaData(_viewedThreads).length]);

                var previousCount = this.numberOfClicks();
                this.numberOfClicks(previousCount + 1);

                $( window['parent'].document ).find(".nano").nanoScroller();
                //$(".nano").nanoScroller();
            };

            _this.itemRead = function(item, event) {
                console.log("item of type " + item.type + " with id " + item.threadId + " was clicked");

                // Write to localStorage this item was read
                if (_viewedThreads.indexOf(item.threadId) < 0 ) {
                    _viewedThreads.push(item.threadId);
                    localStorage["_viewedThreads"] = JSON.stringify(_viewedThreads);

                    item.entryClass = "qnaAnnouncementRead";

                    _this.myObservableArray[_this.myObservableArray.indexOf(item)] = item;
                    _this.myObservableArray.refresh(item);
                }
            };

            _this.incrementClickCounter();
            _this.incrementClickCounter();
            _this.incrementClickCounter();

            setInterval(function(){
                _this.incrementClickCounter()
            }, 5000);

        },
        destroy: function () {

            $(this.embedPlayer).unbind(this.bindPostfix);
        }
    };
})(window.mw, window.jQuery);
