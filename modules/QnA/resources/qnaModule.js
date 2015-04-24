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
        }
    };
})(window.mw, window.jQuery);
