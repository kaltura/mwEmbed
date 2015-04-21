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


            this.itemRead= function(item, event) {
                console.log("item of type " + item.type + " with id " + item.threadId + " was clicked");

                _this.qnaService.markAsRead(item);
            }

        },
        destroy: function () {

            $(this.embedPlayer).unbind(this.bindPostfix);
        },
        applyLayout:function() {

            $( window['parent'].document ).find(".nano").nanoScroller();
        },
    };
})(window.mw, window.jQuery);
