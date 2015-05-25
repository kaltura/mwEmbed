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

    //this is a trick to do "a-la angular" binding
    bindHtml: function(element) {

        var _this=this;
        var internal={};

        var $newscope={};


        element.find("*").each(function ($index, el) {

            var originalText=el.innerText;

            var matches=originalText.match(/{{(.*)}}/g);


            if (matches && matches.length>0) {
                matches.forEach(function(match) {
                    var name=match.slice(2,-2);

                    internal[name]=_this.$scope[name];

                    function updateHtml() {
                        var newContent = originalText.replace(match, internal[name]);
                        el.innerHTML = newContent;
                    }

                    updateHtml();

                    Object.defineProperty($newscope, name, {
                        get: function() {
                            return internal[name];
                        },
                        set: function(newValue) {
                            try {
                                if (internal[name] !== newValue) {
                                    internal[name] = newValue;
                                    updateHtml();
                                }
                            }
                            catch(e) {
                                alert(e);
                            }
                        }
                    });
                });
            }
        });



        this.$scope=$newscope;
    },
    isVisible:false,
    setVisible:function(visible) {
        if (this.isVisible===visible) {
            return;
        }

        var _this = this;

        this.isVisible=visible;

        if (visible) {
            _this.embedPlayer.getVideoHolder().append("<div class='debug-info'>");
            var elem=$(".debug-info");

            elem.html(this.getHTML());

            _this.bindHtml(elem);

            $(elem).find(".debug-info-close-btn").click(function() {

                _this.setVisible(false);
            });

            _this.refresh();
            this.refreshInterval=setInterval(function() {
                _this.refresh();
            },1000);


        } else {
            $( ".debug-info").remove();
            clearInterval(this.refreshInterval);
            this.refreshInterval=null;
        }
    },
	isSafeEnviornment: function() {
		return true;
	},
    getHTML : function(data){
        var templatePath = this.getConfig( 'templatePath' );
        var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

        return rawHTML;
    },
    fetchStaticVariable: function() {
        var html=this.getHTML();
        var player=this.embedPlayer;
        this.$scope.version=MWEMBED_VERSION;
        this.$scope.entryid= player.kentryid;
        this.$scope.kuiconf= player.kuiconfid;
        this.$scope.src= player.getSrc();
        var source= player.getSource();
        if (source) {
            this.$scope.mimeType=source.mimeType;
        }
    },
    refresh: function() {


        var player=this.embedPlayer;
        this.fetchStaticVariable();
        this.$scope.currentState=player.currentState;
        this.$scope.isDVR= player.isDVR();
        this.$scope.buffering= player.buffering;
    }

}));

} )( window.mw, window.jQuery );