/*jshint bitwise: false*/

(function (mw, $) {
    "use strict";

    mw.PluginManager.add('transcript', mw.KBasePlugin.extend({

        defaultConfig: {
            templatePath: '../Transcript/resources/transcript.tmpl.html',
            transcriptMainCssFileName: 'modules/Transcript/resources/transcript.css',
            moduleWidth: '400',
            onPage: false
        },

        tmplHeaderHeight: 30,
        
        getBaseConfig: function() {
            var parentConfig = this._super();
            return $.extend({}, parentConfig, {
                transcriptTargetId: null
            });
        },

        setup: function () {
            this.addBindings();
        },

        destroy: function(){
            // var _this = this;
        },


        changeVideoToggleIcon: function() {
            var _this = this;
            var onVideoTogglePluginButton = $('.transcript-on-video-btn');
            var transcriptObject = _this.getTranscriptContainer().find(".transcriptModuleBackground");

            if (!transcriptObject.is(":visible")){
                onVideoTogglePluginButton.removeClass('transcript-icon-close');
                onVideoTogglePluginButton.addClass('transcript-icon-Ask');
            } else {
                onVideoTogglePluginButton.removeClass('transcript-icon-Ask');
                onVideoTogglePluginButton.addClass('transcript-icon-close');
            }
        },

        addBindings: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();
            var transcriptObject=null;
            var onVideoTogglePluginButton=null;
            var toggleTranscriptBodyWrapper=null;
            var searchInput=null;
            var transcriptBody=null;
            var printWrapper=null;
            var originalTMPLlHeight=null;

            this.bind('updateLayout ended', function () {
                _this.positionTranscriptButtonOnVideoContainer();
                _this.updateTranscriptListHolderSize();
                if (!_this.getConfig( 'onPage' )){
                    $('.transcriptModuleBackground').css({
                        width: _this.getConfig( 'moduleWidth' ) + 'px',
                        position: 'relative',
                        float: 'right'
                    });
                    $('.transcriptModuleBackgroundHider').css({
                        width: _this.getConfig( 'moduleWidth' ) + 'px',
                        position: 'relative',
                        float: 'right'
                    });
                }
            });

            this.bind('layoutBuildDone', function (event, screenName) {
                // add the Q&A toggle button to be on the video
                embedPlayer.getVideoHolder().append('<div class="transcript-on-video-btn transcript-icon-close"><div class="transcript-badge"></div></div>');
                _this.getTranscriptContainer();
                transcriptObject = _this.getTranscriptContainer().find(".transcriptModuleBackground");
                toggleTranscriptBodyWrapper = _this.getTranscriptContainer().find(".toggleTranscriptBodyWrapper");
                transcriptBody = _this.getTranscriptContainer().find(".transcript-body");
                searchInput = _this.getTranscriptContainer().find(".searchInput");
                printWrapper = _this.getTranscriptContainer().find(".printWrapper");
                originalTMPLlHeight = _this.getTranscriptContainer().parent().height();
                transcriptBody.height(originalTMPLlHeight - _this.tmplHeaderHeight+'px');//30px height of menu
                
                if (_this.getConfig( 'onPage' )){
                    toggleTranscriptBodyWrapper.on('click',function (e) {
                        e.preventDefault();
                        if ($(this).hasClass('open')) {
                            $(this).removeClass('open').addClass('close');
                            transcriptBody.hide();
                        } else {
                            $(this).removeClass('close').addClass('open');
                            transcriptBody.show();
                        }
                    });
                }else {
                    toggleTranscriptBodyWrapper.hide();
                }
                
                searchInput.on('keyup', function (e) {
                    var value = e.target.value;
                    var regex = new RegExp(value, "gi");
                    transcriptBody.html(transcriptBody.text().replace(regex, function(find) {
                        return '<span class="highlight">'+find+'</span>';
                    }));
                });
                printWrapper.on("click", function(e){
                    e.preventDefault();
                    var myWindow = window.open('', '', 'width=400,height=600');
                    myWindow.document.write(transcriptBody.html());
    
                    myWindow.document.close();
                    myWindow.focus();
                    myWindow.print();
                    myWindow.close();
                });
                // onVideoTogglePluginButton = $('.transcript-on-video-btn');

                // register to on click to change the icon of the toggle button
                onVideoTogglePluginButton.on("click", function(){

                    var openTranscriptContainer=!transcriptObject.is(":visible");

                    if (_this.getPlayer().layoutBuilder.fullScreenManager.isInFullScreen()) {
                        _this.getPlayer().toggleFullscreen() ;
                        openTranscriptContainer=true;
                    }

                    _this.getTranscriptContainer();
                    if (openTranscriptContainer){
                        transcriptObject.show();
                    } else {
                        transcriptObject.hide();
                    }
                    _this.changeVideoToggleIcon();
                });
                console.log(">>>>>","transcript ::");
                _this.updateUnreadBadge();
            });

            this.bind('onOpenFullScreen', function() {
                transcriptObject.hide();
                _this.changeVideoToggleIcon();
                if (!_this.getConfig( 'onPage' )) {
                    $( ".videoHolder, .mwPlayerContainer" ).css( "width", "100%" );	}
            });
            this.bind('onCloseFullScreen', function() {
                _this.changeVideoToggleIcon();
                if (!_this.getConfig( 'onPage' )){
                    $(".videoHolder, .mwPlayerContainer").css("width", _this.originalPlayerWidth + "px");
                }
            });
        },

        updateUnreadBadge: function(){
            var _this = this;
            // if its a number and is greater then 0 - show & update the badge
            var num = _this.KQnaModule ? _this.KQnaModule.getUnreadCount() : 0;
            if (isNaN(num) || num <=0 ){
                $('.qna-badge').hide();
            }
            else{
                $('.qna-badge').text(num);
                $('.qna-badge').show();
            }
        },


        injectCssToPage: function(cssLink){
            if (cssLink) {
                try{
                    cssLink = cssLink.toLowerCase().indexOf("http") === 0 ? cssLink : kWidget.getPath() + cssLink; // support external CSS links
                    $('head', window.parent.document).append('<link type="text/css" rel="stylesheet" href="' + cssLink + '"/>');
                }catch(e){
                    mw.log("Transcript :: failed to inject css " + cssLink + " to page. Exception: " + e);
                }
            } else {
                mw.log("Transcript :: Error: " + this.pluginName + " could not find CSS link");
            }
        },

        // wait for the css classes we have logic for are loaded
        // do it by verifying some properties get a value from css
        verifyCssLoaded : function(transcriptContainer){

            if (this.verifyCssLoadedPromise) {
                return this.verifyCssLoadedPromise;
            }
            var deferred = $.Deferred();
            this.verifyCssLoadedPromise = deferred;

            var waitCssLoaded = setInterval(function () {
                if ((transcriptContainer.find(".transcriptModuleBackground").css("display") === "none") &&
                    ($(".transcript-on-video-btn").css("position") === "absolute") &&
                    (transcriptContainer.find(".nano-content").css("position") === "absolute")) {

                    clearInterval(waitCssLoaded);
                    deferred.resolve();
                }
            }, 50);

            return deferred;
        },

        // load the transcript template to the div with transcriptTargetId
        getTranscriptContainer: function(){
            var _this = this;
            // var embedPlayer = this.getPlayer();
            if (!this.$transcriptListContainer) {
                // for unfriendly iFrames, where we can't access window['parent'] we set on page to false
                if ( this.getConfig( 'onPage' ) ) {
                    try{
                        var parent = window['parent'].document;
                        mw.log("Transcript :: On page transcript - accessed parent ");
                    }catch(e){
                        this.setConfig('onPage', false);
                        mw.log("Transcript :: cant access window['parent'] - setting to false");
                    }
                }
                if ( this.getConfig( 'onPage' ) ) {
                    // Inject external CSS files
                    this.injectCssToPage(this.getConfig('transcriptMainCssFileName'));

                    try{
                        var iframeParent = $('#'+this.embedPlayer.id, window['parent'].document)[0];
                        $(iframeParent).parents().find("#" + this.getConfig('transcriptTargetId')).html("<div class='transcriptInterface'></div>");
                        this.$transcriptListContainer = $(iframeParent).parents().find(".transcriptInterface");
                    }catch(e){
                        mw.warn("failed to access window['parent'] for creating $transcriptListContainer");
                    }
                }
                else{
                    // wrap the .mwPlayerContainer element with our transcriptInterface div
                    var floatDirection = this.getConfig( 'containerPosition' ) ? this.getConfig( 'containerPosition' ) : "right";
                    var transcriptInterfaceElementText = "<div class='transcriptInterface' style='position: relative; width: " + this.getConfig( 'moduleWidth' ) + "px; height: 100%; float:" + floatDirection + "'>";

                    $('.mwPlayerContainer').after(transcriptInterfaceElementText);

                    this.$transcriptListContainer = $( ".transcriptInterface");

                    // resize the video to make place for the playlist according to its position (left, top, right, bottom)
                    if ( this.getConfig( 'containerPosition' ) === 'right' || this.getConfig( 'containerPosition' ) === 'left' ) {
                        $( ".videoHolder, .mwPlayerContainer" ).css( "width", $( ".videoHolder").width() - this.getConfig( 'moduleWidth' ) + "px" );
                    }

                    if ( this.getConfig( 'containerPosition' ) === 'left' ) {
                        $( ".mwPlayerContainer" ).css( "float", "right" );
                    }
                    else{
                        $( ".mwPlayerContainer" ).css( "float", "left" );
                    }
                }

                this.$transcriptListContainer.append(this.getHTML());
                this.originalPlayerWidth = $( ".videoHolder").width();

                this.bindButtons();
                this.positionTranscriptButtonOnVideoContainer();
                this.updateTranscriptListHolderSize();

                // Create the KTranscriptService and KTranscriptModule after css were loaded
                if ( this.getConfig( 'onPage' ) ) {
                    this.verifyCssLoaded(_this.$transcriptListContainer).then(function(){
                        // _this.KTranscriptService = new mw.KTranscriptService(embedPlayer, _this);
                        // _this.KTranscriptModule = new mw.KTranscriptModule(embedPlayer, _this, _this.KTranscriptService);
                        // ko.applyBindings(_this.KTranscriptModule, _this.$transcriptListContainer[0]);
                        // _this.KTranscriptModule.applyLayout();
                    });
                }else{ // for in player plugin don't wait for css to load
                    // _this.KTranscriptService = new mw.KTranscriptService(embedPlayer, _this);
                    // _this.KTranscriptModule = new mw.KTranscriptModule(embedPlayer, _this, _this.KTranscriptService);
                    // ko.applyBindings(_this.KTranscriptModule, _this.$transcriptListContainer[0]);
                    // _this.KTranscriptModule.applyLayout();
                }

            }
            return this.$transcriptListContainer;
        },


        positionTranscriptButtonOnVideoContainer : function(){
            var onVideoTogglePluginButton = $('.transcript-on-video-btn');
            var videoHeight = this.getPlayer().getInterface().height();
            var buttonHeight = Math.round(videoHeight / 5);
            buttonHeight=Math.min(buttonHeight,70);
            var buttonWidth = Math.round(buttonHeight / 2);

            var borderRadius = buttonWidth + "px 0 0 " + buttonWidth + "px";

            var topOffset = (videoHeight-buttonHeight)/2 + "px";


            var textIndent = (buttonWidth - parseInt(onVideoTogglePluginButton.css('font-size'),10)) / 2;
            onVideoTogglePluginButton.css(
                {   '-moz-border-radius': borderRadius,
                    '-webkit-border-radius': borderRadius,
                    'border-radius': borderRadius,
                    height: buttonHeight + "px",
                    width: buttonWidth + "px",
                    top: topOffset,
                    'line-height': buttonHeight + "px",
                    'text-indent': textIndent + "px"});
        },

        updateTranscriptListHolderSize : function(){
            var _this = this;
            var newHeight = this.getPlayer().getInterface().height();
            _this.getTranscriptContainer().find('.listHolder').height(newHeight);
        },



        bindButtons : function(){
            // var _this = this;
        },
        //
        // resetTextArea : function(textArea){
        //     textArea.val(gM('transcript-default-question-box-text'));
        //     textArea.removeClass("transcriptInterface transcriptQuestionTextAreaTyping");
        //     textArea.addClass("transcriptInterface transcriptQuestionTextAreaNotTyping");
        // },

        getHTML : function(){
            var templatePath = this.getConfig( 'templatePath' );
            var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

            return rawHTML;
        },

        hideModule: function(hide) {
            return;
            var _this = this;
            var firstTime = (_this.moduleStatus() === undefined);

            _this.moduleStatus(hide);

            if (hide) {
                _this.getTranscriptContainer().find(".transcriptModuleBackground").hide();
                if (!_this.getConfig( 'onPage' )) {
                    _this.getTranscriptContainer().find(".transcriptModuleBackgroundHider").show();
                }
                $('.transcript-on-video-btn').css("display", "none");
            }
            else{
                // use css("display", "block") since .show() restores the previous value, and the previous value is hide
                $('.transcript-on-video-btn').css("display", "block");

                if (!_this.getConfig( 'onPage' )) {
                    _this.getTranscriptContainer().find(".transcriptModuleBackgroundHider").hide();
                }

                // open the module only if this is the first time
                if (firstTime) {
                    _this.getTranscriptContainer().find(".transcriptModuleBackground").show();
                }

//                 _this.getTranscriptContainer().find(".transcriptQuestionArea").show();
//                 $('.transcriptReplyBox').show();
            }
            _this.updateTranscriptListHolderSize();
            _this.changeVideoToggleIcon();
            // _this.KTranscriptModule.applyLayout();
        }
    }));

})(window.mw, window.jQuery, window.ko);
