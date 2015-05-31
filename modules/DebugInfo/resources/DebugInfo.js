( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'debugInfo', mw.KBaseComponent.extend({

	defaultConfig: {
		templatePath: '../debugInfo/resources/DebugInfo.tmpl.html',
        onPage: true,
        cssFileName: 'modules/debugInfo/resources/DebugInfo.css'
	},
    getBaseConfig: function() {
        var parentConfig = this._super();
        return $.extend({}, parentConfig, {
        });
    },


    $scope:{ },

	iconBtnClass: "icon-debug-info",
	setup: function () {
        this.embedPlayer = this.getPlayer();
        var _this = this;


        this.bind('layoutBuildDone ended', function (event, screenName) {

        });

        this.bind('sourceSwitchingEnd',function(event,source){
            _this.$scope.source=source ? source.newBitrate : 0;
        });


        this.bind('playerReady', function () {
        });

       // _this.setVisible(true);
        $(document).keydown(function(e){

            if ( e.altKey && e.ctrlKey && e.keyCode===68) {
               _this.setVisible(!_this.isVisible);

            }
        })


    },


    isVisible:false,
    setVisible:function(visible) {
        if (this.isVisible===visible) {
            return;
        }

        var _this = this;

        this.isVisible=visible;

        if (visible) {
            _this.embedPlayer.getVideoHolder().append("<div class='mw-debug-info'>");
            var elem=$(".mw-debug-info");

            elem.html(this.getHTML());

            _this.binder=new mw.HtmlBinderHelper();

            _this.binder.bind(elem,_this.$scope);

            $(elem).find(".mw-debug-info-close-btn").click(function() {

                _this.setVisible(false);
            });

            _this.refresh();
            this.refreshInterval=setInterval(function() {
                _this.refresh();
            },1000);


        } else {
            $( ".mw-debug-info").remove();
            clearInterval(this.refreshInterval);
            this.refreshInterval=null;
        }
    },
	isSafeEnviornment: function() {
		return !mw.isIE8(); //we don't support IE8 for now
	},
    getHTML : function(data){
        var templatePath = this.getConfig( 'templatePath' );
        var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

        return rawHTML;
    },
    refresh: function() {
        var player=this.embedPlayer;
        this.$scope.version=MWEMBED_VERSION;
        this.$scope.entryid= player.kentryid;
        this.$scope.kuiconf= player.kuiconfid;
        this.$scope.src= player.getSrc();
        var source= player.getSource();
        if (source) {
            this.$scope.mimeType=source.mimeType;
        }
        this.$scope.currentState=player.currentState;
        this.$scope.isDVR= player.isDVR();
        this.$scope.buffering= player.buffering;
    }

}));

} )( window.mw, window.jQuery );