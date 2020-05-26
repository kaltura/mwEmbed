/*jshint bitwise: false*/

(function (mw, $, ko) {
	"use strict";
	var NUM_OF_MAX_CHAR = 500;


	mw.PluginManager.add('qna', mw.KBasePlugin.extend({

		defaultConfig: {
			templatePath: '../QnA/resources/qna.tmpl.html',
			qnaMainCssFileName: 'modules/QnA/resources/css/qna.css',
			qnaAnnouncementsCssFileName: 'modules/QnA/resources/css/qna-announcements.css',
			qnaFontsCssFileName: 'modules/QnA/resources/css/qna-fonts.css',
			qnaNanoCssFileName: 'modules/QnA/resources/css/qna-nano.css',
			qnaThreadsListCssFileName: 'modules/QnA/resources/css/qna-threads-list.css',
			onPage: true,
			overrideModeratorName: false
		},

		moduleStatus: ko.observable(undefined),
		announcementOnlyStatus: ko.observable(false),

		// get an hash code from a ks
		getKSHash: function(ks) {
			var hash = 0, i, chr, len;
			if (ks.length === 0){
				return hash;
			}
			for (i = 0, len = ks.length; i < len; i++) {
				chr   = ks.charCodeAt(i);
				hash  = ((hash << 5) - hash) + chr;
				hash |= 0; // Convert to 32bit integer
			}

			return hash.toString();
		},

		getRandomInt: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		// return something like ##guestHashSeparator-186168013885295##
		generateUserId: function(){
			var _this = this;

			return	"##" +
					_this.getConfig("userId") + "HashSeparator" +
					_this.getKSHash(_this.getPlayer().getFlashvars().ks) +
					_this.getRandomInt(10000,99999999).toString() +
					"##";
		},

		getUserID: function(){
			var _this = this;

			// If our user ID is the same as the configured anonymousUserId we need to generate one, or get it from localStorage (if exists)
			if (!_this.getConfig("userRole") || _this.getConfig("userRole") === "anonymousRole"){

				var userId = _this.generateUserId();
				//if localStorage is available, get & store the user id from it;
				if (window.localStorage) {
					try {
						if (!localStorage.kAnonymousUserId) {
							localStorage.kAnonymousUserId = userId;
						}
						userId = localStorage.kAnonymousUserId;
					}catch(e) {
						mw.log("Exception in getUserID: "+e);
					}
				}
				mw.log("Using kAnonymousUserId: ",userId);
				return userId;
			}
			return _this.getConfig("userId");
		},

		getBaseConfig: function() {
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				qnaTargetId: null
			});
		},

		setup: function () {
			this.addBindings();
		},

        destroy: function(){
            var _this = this;
            if (_this.KQnaModule) {
                _this.KQnaModule.destroy();
                _this.KQnaModule=null;
            }
            if (_this.KQnaService) {
                _this.KQnaService.destroy();
                _this.KQnaService=null;
            }
        },

		changeVideoToggleIcon: function() {
			var _this = this;
			var onVideoTogglePluginButton = $('.qna-on-video-btn');
			var qnaObject = _this.getQnaContainer().find(".qnaModuleBackground");

			if (!qnaObject.is(":visible")){
				onVideoTogglePluginButton.removeClass('qna-icon-close');
				onVideoTogglePluginButton.addClass('qna-icon-Ask');
			} else {
				onVideoTogglePluginButton.removeClass('qna-icon-Ask');
				onVideoTogglePluginButton.addClass('qna-icon-close');
			}
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();
            var qnaObject=null;
            var onVideoTogglePluginButton=null;

            this.bind('updateLayout ended', function () {
                _this.positionQAButtonOnVideoContainer();
				_this.updateQnaListHolderSize();

				if (!_this.getConfig( 'onPage' )){
					$('.qnaModuleBackground').css({
						width: _this.getConfig( 'moduleWidth' ) + 'px',
						position: 'relative',
						float: 'right'
					});
					$('.qnaModuleBackgroundHider').css({
						width: _this.getConfig( 'moduleWidth' ) + 'px',
						position: 'relative',
						float: 'right'
					});
				}
            });

			this.bind('layoutBuildDone', function (event, screenName) {
				// add the Q&A toggle button to be on the video
				embedPlayer.getVideoHolder().append('<div class="qna-on-video-btn qna-icon-close"><div class="qna-badge"></div></div>');
				_this.getQnaContainer();
				qnaObject = _this.getQnaContainer().find(".qnaModuleBackground");
				onVideoTogglePluginButton = $('.qna-on-video-btn');

                if ( _this.getConfig( 'onPage' ) ) {

				// register to on click to change the icon of the toggle button
                onVideoTogglePluginButton.on("click", function(){

                    var openQnaContainer=!qnaObject.is(":visible");

                    if (_this.getPlayer().layoutBuilder.fullScreenManager.isInFullScreen()) {
                        _this.getPlayer().toggleFullscreen() ;
                        openQnaContainer=true;
                    }

					_this.getQnaContainer();
					if (openQnaContainer){
						qnaObject.show();
					} else {
						qnaObject.hide();
					}
                    _this.changeVideoToggleIcon();
				});

				_this.updateUnreadBadge();

                }
                else {
                    $('.qna-on-video-btn').remove()
				}
			});

			this.bind('onOpenFullScreen', function() {
				if(!qnaObject.is(":hidden")){
					// Entring fullscreen will turn a flag to close it later
					this.hideOnFullscreen = true;
				}
                qnaObject.hide();
				_this.changeVideoToggleIcon();
				if (!_this.getConfig( 'onPage' )) {
					$( ".videoHolder, .mwPlayerContainer" ).css( "width", "100%" );	}
			});
			this.bind('onCloseFullScreen', function() {
				if(this.hideOnFullscreen){
					qnaObject.show();
				}
				this.hideOnFullscreen = false;
				_this.changeVideoToggleIcon();
				if (!_this.getConfig( 'onPage' )){
					$(".videoHolder, .mwPlayerContainer").css("width", _this.originalPlayerWidth + "px");
                    $(".qnaModuleBackground").css("display", "block");
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
					mw.log("failed to inject css " + cssLink + " to page. Exception: " + e);
				}
			} else {
				mw.log("Error: " + this.pluginName + " could not find CSS link");
			}
		},

		// wait for the css classes we have logic for are loaded
		// do it by verifying some properties get a value from css
		verifyCssLoaded : function(qnaContainer){

			if (this.verifyCssLoadedPromise) {
				return this.verifyCssLoadedPromise;
			}
			var deferred = $.Deferred();
			this.verifyCssLoadedPromise = deferred;

			var waitCssLoaded = setInterval(function () {
				if ((qnaContainer.find(".qnaModuleBackground").css("display") === "none") &&
					($(".qna-on-video-btn").css("position") === "absolute") &&
					(qnaContainer.find(".nano-content").css("position") === "absolute")) {

					clearInterval(waitCssLoaded);
					deferred.resolve();
				}
			}, 50);

			return deferred;
		},

		// load the Q&A template to the div with qnaTargetId
		getQnaContainer: function(){
			var _this = this;
            var embedPlayer = this.getPlayer();
			if (!this.$qnaListContainer && this.getPlayer().isLive()) {

				this.markIfCanAccessToIframesParent();

				if ( this.getConfig( 'onPage' ) ) {
					// Inject external CSS files
					this.injectCssToPage(this.getConfig('qnaAnnouncementsCssFileName'));
					this.injectCssToPage(this.getConfig('qnaFontsCssFileName'));
					this.injectCssToPage(this.getConfig('qnaNanoCssFileName'));
					this.injectCssToPage(this.getConfig('qnaThreadsListCssFileName'));
					this.injectCssToPage(this.getConfig('qnaMainCssFileName')); //should be last, since we we it to test css was loaded

					this.getQnaInterfaceInsideIframe();
				} else {
					// wrap the .mwPlayerContainer element with our qnaInterface div
					var floatDirection = this.getConfig( 'containerPosition' ) ? this.getConfig( 'containerPosition' ) : "right";
					var qnaInterfaceElementText = "<div class='qnaInterface' style='position: relative; width: " + this.getConfig( 'moduleWidth' ) + "px; height: 100%; float:" + floatDirection + "'>";

					$('.mwPlayerContainer').after(qnaInterfaceElementText);

					this.$qnaListContainer = $( ".qnaInterface");

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

				this.$qnaListContainer.append(this.getHTML());
				this.originalPlayerWidth = $( ".videoHolder").width();

				this.bindButtons();
				this.positionQAButtonOnVideoContainer();
				this.updateQnaListHolderSize();

				// Create the KQnaService and KQnaModule after css were loaded
				if ( this.getConfig( 'onPage' ) ) {
					this.verifyCssLoaded(_this.$qnaListContainer).then(function(){
						_this.KQnaService = new mw.KQnaService(embedPlayer, _this);
						_this.KQnaModule = new mw.KQnaModule(embedPlayer, _this, _this.KQnaService);
						ko.applyBindings(_this.KQnaModule, _this.$qnaListContainer[0]);
						_this.KQnaModule.applyLayout();
					});
				}else{ // for in player plugin don't wait for css to load
                    _this.KQnaService = new mw.KQnaService(embedPlayer, _this);
                    _this.KQnaModule = new mw.KQnaModule(embedPlayer, _this, _this.KQnaService);
                    ko.applyBindings(_this.KQnaModule, _this.$qnaListContainer[0]);
                    _this.KQnaModule.applyLayout();
                }
			}
            else if ( !this.getPlayer().isLive() ) {
				this.markIfCanAccessToIframesParent();

				if ( this.getConfig( 'onPage' ) ) {
					this.getQnaInterfaceInsideIframe();
				} else {
					this.$qnaListContainer = $(".qnaInterface");
				}
            }

            return this.$qnaListContainer;
		},

		markIfCanAccessToIframesParent: function() {
			// for unfriendly iFrames, where we can't access window['parent'] we set on page to false
			if ( this.getConfig( 'onPage' ) ) {
				try {
					var parent = window['parent'].document;
				} catch(e) {
					this.setConfig('onPage', false);
					mw.log("cant access window['parent'] - setting to false");
				}
			}
		},

		getQnaInterfaceInsideIframe: function() {
			try {
				var iframeParent = $('#'+this.embedPlayer.id, window['parent'].document)[0];
				this.$qnaListContainer = $(iframeParent).parents().find(".qnaInterface");

				if (!this.$qnaListContainer.length){
					$(iframeParent).parents().find("#" + this.getConfig('qnaTargetId')).html("<div class='qnaInterface'></div>");
					this.$qnaListContainer = $(iframeParent).parents().find(".qnaInterface");
				}

			} catch(e){
				mw.log("failed to access window['parent'] for creating $qnaListContainer");
			}
		},

		positionQAButtonOnVideoContainer : function(){
			var onVideoTogglePluginButton = $('.qna-on-video-btn');
			var videoHeight = this.getPlayer().getInterface().height();
			var buttonHeight = Math.round(videoHeight / 5);
            buttonHeight=Math.min(buttonHeight,70);
			var buttonWidth = Math.round(buttonHeight / 2);

			var borderRadius = buttonWidth + "px 0 0 " + buttonWidth + "px";

			var topOffset = (videoHeight-buttonHeight)/2 + "px";


			var textIndent = (buttonWidth - parseInt(onVideoTogglePluginButton.css('font-size'))) / 2;
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

		updateQnaListHolderSize : function(){
			var _this = this;
			var newHeight = this.getPlayer().getInterface().height();
			if (!_this.announcementOnlyStatus()){
				newHeight -= _this.getQnaContainer().find('.qnaQuestionArea').height();
			}
			_this.getQnaContainer().find('.listHolder').height(newHeight);
		},

		submitQuestion : function(){
			var _this = this;
			var textArea = _this.getQnaContainer().find('.qnaQuestionTextArea');
			var question = textArea.val();
            var questionCharCounter = _this.getQnaContainer().find('.qnaQuestionCharCounter');

            // protection from empty string
			if (!(/\S/.test(question))){
				return false;
			}

			if (_this.getPlayer().isOffline() && !_this.getConfig( 'allowNewQuestionWhenNotLive' )){
				alert(gM('qna-cant-ask-while-not-live'));
			} else {
				if (question !== gM('qna-default-question-box-text')) {
					_this.KQnaService.submitQuestion(question);
					_this.resetTextArea(textArea, questionCharCounter);
					return true;
				}
			}
			return false;
		},

		bindButtons : function(){
			var _this = this;
			var sendButton = _this.getQnaContainer().find('.qnaSendButton');
			var textArea = _this.getQnaContainer().find('.qnaQuestionTextArea');
			var questionCharCounter = _this.getQnaContainer().find('.qnaQuestionCharCounter');
			sendButton.text(gM('qna-send-button-text'));
			sendButton
				.off('click')
				.on('click', function(){
					_this.submitQuestion();
				});

			_this.resetTextArea(textArea, questionCharCounter);
			textArea
				.off('focus')
				.on('focus', function(){
					if (textArea.val() === gM('qna-default-question-box-text')) {
						textArea.val('');
						textArea.removeClass("qnaQuestionTextAreaNotTyping");
						textArea.addClass("qnaQuestionTextAreaTyping");
					}
				});

			textArea
				.off('blur')
				.on('blur', function(){
					if (textArea.val() === '') {
						_this.resetTextArea(textArea, questionCharCounter);
					}
				});

			textArea.keydown(function(e){
				// if its an enter, and the shift|alt|ctrl were not down - submit the question
				if (e.keyCode === 13 && !e.altKey && !e.shiftKey && !e.ctrlKey){
					if (_this.submitQuestion()) {
						e.target.blur();
					}
					e.preventDefault();
				}
				else {
                    countNumOfChars(this);
				}

				return true;
			});

            textArea.keyup(function() {
                countNumOfChars(this);
                return true;
            });

            textArea.on('paste cut',function(e) {
            	var _this = this;
            	setTimeout(function() {
                    countNumOfChars(_this);
                });
            });

            function countNumOfChars(element) {
                var qCharText = $(element).val();
                var counterText = qCharText.length + '/' + NUM_OF_MAX_CHAR;
                questionCharCounter.text(counterText);
            }

			textArea.bind("mousewheel",function(ev) {
				ev.preventDefault();

				var ratio = $(this).height() / $(window).height();
				var deltaY = ev.originalEvent.deltaY * ratio;
				$(this).scrollTop($(this).scrollTop() - Math.round(deltaY));
			});

			textArea.one("touchstart",function(ev) {
				var elem = ev.target;
				$(elem).css({'overflow':'auto'});
			});
		},

		resetTextArea : function(textArea, textCounter){
			textArea.val(gM('qna-default-question-box-text'));
			textArea.removeClass("qnaQuestionTextAreaTyping");
			textArea.addClass("qnaQuestionTextAreaNotTyping");

			if (textCounter) {
                textCounter.text('0/' + NUM_OF_MAX_CHAR);
			}
		},

		getHTML : function(){
			var templatePath = this.getConfig( 'templatePath' );
			var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

			return rawHTML;
		},

		hideModule: function(hide, announcementOnly) {
			var _this = this;
			var firstTime = (_this.moduleStatus() === undefined);

			_this.moduleStatus(hide);
			_this.announcementOnlyStatus(announcementOnly);

			if (hide) {
				_this.getQnaContainer().find(".qnaModuleBackground").hide();
				if (!_this.getConfig( 'onPage' )) {
					_this.getQnaContainer().find(".qnaModuleBackgroundHider").show();
				}
				$('.qna-on-video-btn').css("display", "none");
			}
			else{
				// use css("display", "block") since .show() restores the previous value, and the previous value is hide
				$('.qna-on-video-btn').css("display", "block");

				if (!_this.getConfig( 'onPage' )) {
					_this.getQnaContainer().find(".qnaModuleBackgroundHider").hide();
				}

				// open the module only if this is the first time
				if (firstTime) {
					_this.getQnaContainer().find(".qnaModuleBackground").show();
				}

				if (announcementOnly){
					_this.getQnaContainer().find(".qnaQuestionArea").hide();
					$('.qnaReplyBox').hide();
				}
				else{
					_this.getQnaContainer().find(".qnaQuestionArea").show();
					$('.qnaReplyBox').show();
				}
			}
			_this.updateQnaListHolderSize();
			_this.changeVideoToggleIcon();
			_this.KQnaModule.applyLayout();
		}
	}));

})(window.mw, window.jQuery, window.ko);
