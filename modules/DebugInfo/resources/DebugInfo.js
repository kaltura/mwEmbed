( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'debugInfo', mw.KBaseComponent.extend({

	defaultConfig: {
		templatePath: '../DebugInfo/resources/DebugInfo.tmpl.html',
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

            _this.$scope.getFileName=function(url){
                var index=url.lastIndexOf('/');
                return index<0  ? url : url.substring(index+1);
            };

            _this.binder=new mw.HtmlBinderHelper(elem,_this.$scope);

            _this.binder.bind();

            $(elem).find(".mw-debug-info-close-btn").click(function() {

                _this.setVisible(false);
            });
            $(elem).find(".mw-debug-info-copy-btn").click(function() {
                alert( $("#mw-debug-info-values").text());
            });

            _this.refresh();
            this.refreshInterval=setInterval(function() {
                _this.refresh();
            },1000);


            this.bind("debugInfoReceived", function( e, data ){
                var $scope=_this.$scope;

                if( data.info && data.info == "Playing segment"){
                    $scope.hlsCurrentSegment=data.uri;
                }
                if( data.info && data.info == "Downloading segment"){
                    $scope.hlsDownloadingSegment=data.uri;
                }
                if( data.info && data.info == "Finished processing segment"){
                    $scope.hlsLastProcessedSegment=data.uri;
                }
                if( data.bufferLength ){
                    $scope.bufferLength=data.bufferLength;
                }
                if( data.droppedFrames ){
                    $scope.droppedFrames=data.droppedFrames;
                }
                if( data.currentBitrate ){
                    $scope.currentBitrate=data.currentBitrate;
                }
            });

        } else {
            $( ".mw-debug-info").remove();
            clearInterval(this.refreshInterval);
            this.refreshInterval=null;
            this.unbind('debugInfoReceived');
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
        this.$scope.hls=this.$scope.src.indexOf("m3u8")>=0;
    }

}));

} )( window.mw, window.jQuery );