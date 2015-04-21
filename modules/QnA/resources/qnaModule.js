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
/*
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





 */
            this.myObservableArray = qnaService.getItems();
        },
        destroy: function () {

            $(this.embedPlayer).unbind(this.bindPostfix);
        }
    };
})(window.mw, window.jQuery);
