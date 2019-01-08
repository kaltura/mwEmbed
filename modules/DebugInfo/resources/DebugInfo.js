( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'debugInfo', mw.KBaseComponent.extend({

	defaultConfig: {
		templatePath: '../DebugInfo/resources/DebugInfo.tmpl.html',
        cssFileName: 'modules/debugInfo/resources/DebugInfo.css',
        isVisible:false,
        emailButton:true,
        emailAddress:"kalturasupport@kaltura.com"
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

        this.emailButton = this.getConfig( 'emailButton' );


        if (_this.getConfig( 'isVisible' )) {
            _this.setVisible(true);
        }
        $(document).keydown(function(e){

            if ( e.altKey && e.ctrlKey && e.keyCode===68) {
               _this.setVisible(!_this.isVisible);

            }
        })


    },

    extractKES:function(url) {
        try {
            var $scope=this.$scope;
            var re = /https?:\/\/(?:([^\/]*)\/(?:kCache|kVOD|kMulticast)\/)(?:([^\/]*)\/(?:kCache|kVOD|kMulticast)\/)?(?:([^\/]*)\/(?:kCache|kVOD|kMulticast)\/)?(?:([^\/]*)\/(?:kCache|kVOD|kMulticast)\/)?([^\/]*)\//i;
            $scope.kesChain = "";
            var m2=re.exec(url);
            for (var i=1;i<m2.length;i++) {
                if (!m2[i]) {
                    continue;
                }
                if ($scope.kesChain.length > 0) {
                    $scope.kesChain += " => ";
                }
                $scope.kesChain += m2[i];
            }


        }catch(e) {
        }
    },
    bindToHlsEvents:function() {
        var _this = this;
        var $scope=_this.$scope;


        this.bind("debugInfoReceived", function( e, data ){
            if (data.uri) {
                _this.extractKES(data.uri);
            }
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
            $scope.hlsEngine="flash";
        });

        //HLS-JS debug info
        var hlsJSeventsMapping={
            "hlsCurrentBuffer": "bufferLength",
            "hlsDroppedFrames":"droppedFrames",
            "hlsDropFPS":"hlsDropFPS",
            "hlsCurrentBitrate":"currentBitrate",
            "hlsFPS":"hlsFPS",
            "hlsFragLoading":"hlsLastProcessedSegment",
            "hlsFragBuffered":"hlsDownloadingSegment"
        };

        for (var eventName in hlsJSeventsMapping) {
            (function(eventName) {
                if (hlsJSeventsMapping.hasOwnProperty(eventName)) {
                    _this.bind(eventName, function( e, data ){
                        $scope[hlsJSeventsMapping[eventName]]=data;
                    });
            }})(eventName);
        }
        var analyticsFunc = function( e, data ){
            if(data.userId){
                _this.$scope.userId=data.userId;
                _this.unbind("analyticsEvent", analyticsFunc);
            }
        };

        this.bind("analyticsEvent", analyticsFunc)

        this.bind("hlsFragChanged", function( e, data ){
            if (data.url) {
                _this.extractKES(data.url);
            }
            $scope.hlsCurrentSegment=data.url;
            $scope.startPTS=data.startPTS;
            $scope.endPTS=data.endPTS;
            $scope.hlsEngine="hls.js";
        });
    },

    bindToMulticastEvents:function() {
    },
    isVisible:false,
    setVisible:function(visible) {
        if (this.isVisible===visible) {
            return;
        }

        var _this = this;

        this.isVisible=visible;

        if (visible) {
            _this.embedPlayer.getVideoHolder().prepend("<div class='mw-debug-info'>");
            var elem=$(".mw-debug-info");


            elem.html(this.getHTML());

            _this.$scope.getFileName=function(url) {
                var index=url.lastIndexOf('/');
                var query_index=url.indexOf('?',index);
                if (query_index<0) {
                    query_index=undefined;
                }

                return index<0  ? url : url.substring(index+1,query_index);
            };

            _this.binder=new mw.HtmlBinderHelper(elem,_this.$scope);

            _this.binder.bind();

            $(elem).find(".mw-debug-info-close-btn").click(function() {

                _this.setVisible(false);
            });
            $(elem).find(".mw-debug-info-copy-btn").click(function() {
                alert( JSON.stringify(_this.getDiagnostics(), null, "\t"));
            });
            $(elem).find(".mw-debug-info-getIps-btn").click(function() {
                _this.getIps();
            });
            $(elem).find(".mw-debug-info-email-btn").click(function() {

                var emailAddress=_this.getConfig( 'emailAddress');
                var link = "mailto:"+emailAddress
                        + "?subject=" + encodeURIComponent("player debug information report from "+document.referrer)
                        + "&body=" + encodeURIComponent(JSON.stringify(_this.getDiagnostics(), null, "\t"));

                window.location.href = link;
            });


            _this.refresh();
            this.refreshInterval=setInterval(function() {
                try {
                    _this.refresh();
                }
                catch(e) {
                    mw.log('debugInfo refresh failed ' + e.message + ' ' + e.stack);
                }
            },1000);


            this.bindToHlsEvents();
            this.bindToMulticastEvents();


        } else {
            $( ".mw-debug-info").remove();
            clearInterval(this.refreshInterval);
            this.refreshInterval=null;
            this.unbind('debugInfoReceived');
        }
    },
    getDiagnostics: function() {
        var obj={};
        var _this=this;
        if(this.$scope.userId){
            obj["userId"] = this.$scope.userId; 
        }
        Object.getOwnPropertyNames(this.$scope).forEach(function(val, idx, array) {
            if(val != "userId"){
                obj[val]=_this.$scope[val];
            }
        });
        return obj;
    },
	isSafeEnviornment: function() {
		return !mw.isIE8(); //we don't support IE8 for now
	},
    getHTML : function(data){
        var templatePath = this.getConfig( 'templatePath' );
        var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

        return rawHTML;
    },
    getIps: function(){
        var _this=this;
        var ip_dups = {};
        _this.$scope.browserIps="";

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection
            || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        //bypass naive webrtc blocking using an iframe
        if(!RTCPeerConnection){
            //NOTE: you need to have an iframe in the page right above the script tag
            //
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            //<script>...getIPs called in here...
            //
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
        };

        var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            var ip_addr = ip_regex.exec(candidate)[1];

            //remove duplicates
            if(ip_dups[ip_addr] === undefined) {
                if (_this.$scope.browserIps.length>0) {
                    _this.$scope.browserIps+=", ";
                }
                _this.$scope.browserIps+=ip_addr;
            }

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice){

            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        //create a bogus data channel
        pc.createDataChannel("");

        //create an offer sdp
        pc.createOffer(function(result){

            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});

        }, function(){});

        //wait for a while to let everything done
        setTimeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 5000);
    },
    refresh: function() {
        var player=this.embedPlayer;
        this.$scope.emailButton=this.emailButton;
        this.$scope.version=MWEMBED_VERSION;
        this.$scope.entryid= player.kentryid;
        this.$scope.kuiconf= player.kuiconfid;
        this.$scope.src= player.getSrc();
        var source= player.getSource();
        if (source) {
            this.$scope.mimeType=source.mimeType;
            this.$scope.multicast= (source.mimeType==="video/multicast");
            this.$scope.hls= (source.mimeType==="application/vnd.apple.mpegurl");
        } else {
            this.$scope.hls=false;
            this.$scope.multicast=false;
        }
        this.$scope.currentState=player.currentState;
        this.$scope.isDVR= player.isDVR();
        this.$scope.buffering= player.buffering;

        if (this.$scope.multicast) {
            if( player && $.isFunction(player.getMulticastDiagnostics) ) {
                var data = player.getMulticastDiagnostics();
                this.$scope.currentBitrate=data.currentBitrate;
                this.$scope.mcAddress = data.mcAddress;
                this.$scope.mcInputFps = data.InputFps;
                this.$scope.mcRenderFps = data.RenderFps;
                this.$scope.mcRenderDroppedFps = data.RenderDroppedFps;
                this.$scope.multiastServerUrl=data.multiastServerUrl;
                this.$scope.mcPacketLoss=data.PacketLoss;
                this.$scope.mcPacketsPerSec=data.PacketRate;
                this.$scope.multicastSessionId=data.multicastSessionId;

                this.extractKES(data.multiastServerUrl);
            }
        }
    }

}));

} )( window.mw, window.jQuery );