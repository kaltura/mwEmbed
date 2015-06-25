
(function (mw, $) {
	"use strict";

	mw.PluginManager.add('qna', mw.KBasePlugin.extend({

		defaultConfig: {
			templatePath: '../QnA/resources/qna.tmpl.html',
			qnaMainCssFileName: 'modules/QnA/resources/css/qna.css',
			qnaAnnouncementsCssFileName: 'modules/QnA/resources/css/qna-announcements.css',
			qnaFontsCssFileName: 'modules/QnA/resources/css/qna-fonts.css',
			qnaNanoCssFileName: 'modules/QnA/resources/css/qna-nano.css',
			qnaThreadsListCssFileName: 'modules/QnA/resources/css/qna-threads-list.css',
			onPage: true
		},

		announcementOnlyStatus: ko.observable(false),

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
				onVideoTogglePluginButton.removeClass('icon-qna-close');
				onVideoTogglePluginButton.addClass('icon-qna-Ask');
			} else {
				onVideoTogglePluginButton.removeClass('icon-qna-Ask');
				onVideoTogglePluginButton.addClass('icon-qna-close');
			}
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();
            var qnaObject=null;
            var onVideoTogglePluginButton=null;

            this.bind('updateLayout ended', function () {
                _this.positionQAButtonOnVideoContainer();

				if (!_this.getConfig( 'onPage' )){
					$('.qnaModuleBackground').css({
						width: _this.getConfig( 'moduleWidth' ) + 'px',
						position: 'relative',
						float: 'right'
					});
				}
            });

			this.bind('layoutBuildDone ended', function (event, screenName) {
				// add the Q&A toggle button to be on the video
				embedPlayer.getVideoHolder().append('<div class="qna-on-video-btn icon-qna-close"><div class="qna-badge"></div></div>');
				_this.getQnaContainer();
				//qnaObject =  $(window['parent'].document.getElementById(embedPlayer.id )).parent().find( ".qnaInterface" );
				qnaObject = _this.getQnaContainer().find(".qnaModuleBackground");
				onVideoTogglePluginButton = $('.qna-on-video-btn');

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
				})

				_this.updateUnreadBadge();
			});

			this.bind('onOpenFullScreen', function() {
                qnaObject.hide();
				_this.changeVideoToggleIcon();
				if (!_this.getConfig( 'onPage' )) {
					$( ".videoHolder, .mwPlayerContainer" ).css( "width", "100%" );	}
			});
			this.bind('onCloseFullScreen', function() {
				_this.changeVideoToggleIcon();
				if (!_this.getConfig( 'onPage' )){
					setTimeout(function() {
						$(".videoHolder, .mwPlayerContainer").css("width", _this.$qnaListContainer.width() - _this.getConfig('moduleWidth') + "px");
					},0);
				}
			});
		},

		updateUnreadBadge: function(){
			var _this = this;
			// if its a number and is greater then 0 - show & update the badge
			var num = _this.KQnaModule.getUnreadCount();
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
				cssLink = cssLink.toLowerCase().indexOf("http") === 0 ? cssLink : kWidget.getPath() + cssLink; // support external CSS links
				$('head', window.parent.document).append('<link type="text/css" rel="stylesheet" href="' + cssLink + '"/>');
			} else {
				mw.log("Error: " + this.pluginName + " could not find CSS link");
			}
		},

		// load the Q&A template to the div with qnaTargetId
		getQnaContainer: function(){
            var embedPlayer = this.getPlayer();
			if (!this.$qnaListContainer) {
				if ( this.getConfig( 'onPage' ) ) {
					// Inject external CSS files
					this.injectCssToPage(this.getConfig('qnaMainCssFileName'));
					this.injectCssToPage(this.getConfig('qnaAnnouncementsCssFileName'));
					this.injectCssToPage(this.getConfig('qnaFontsCssFileName'));
					this.injectCssToPage(this.getConfig('qnaNanoCssFileName'));
					this.injectCssToPage(this.getConfig('qnaThreadsListCssFileName'));

					var iframeParent = window['parent'].document.getElementById(this.embedPlayer.id);
					$(iframeParent).parents().find("#" + this.getConfig('qnaTargetId')).html("<div class='qnaInterface'></div>");
					this.$qnaListContainer = $(iframeParent).parents().find(".qnaInterface");
				}
				else{
					// wrap the .mwPlayerContainer element with our qnaInterface div
					$('.mwPlayerContainer').wrap("<div class='qnaInterface' style='position: relative; width: 100%; height: 100%'>")

					this.$qnaListContainer = $( ".qnaInterface");
					// resize the video to make place for the playlist according to its position (left, top, right, bottom)
					if ( this.getConfig( 'containerPosition' ) == 'right' || this.getConfig( 'containerPosition' ) == 'left' ) {
						$( ".videoHolder, .mwPlayerContainer" ).css( "width", this.$qnaListContainer.width() - this.getConfig( 'moduleWidth' ) + "px" );
						this.videoWidth = (this.$qnaListContainer.width() - this.getConfig( 'moduleWidth' ));
					}
					if ( this.getConfig( 'containerPosition' ) == 'left' ) {
						$( ".mwPlayerContainer" ).css( "float", "right" );
					}
					else{
						$( ".mwPlayerContainer" ).css( "float", "left" );
					}
				}

				this.$qnaListContainer.append(this.getHTML());

				this.bindButtons();
				this.positionQAButtonOnVideoContainer();
                this.KQnaService = new mw.KQnaService( embedPlayer,this );
                this.KQnaModule = new mw.KQnaModule( embedPlayer,this, this.KQnaService  );
                ko.applyBindings(this.KQnaModule, this.$qnaListContainer[0]);
                this.KQnaModule.applyLayout();


			}
			return this.$qnaListContainer;
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

		bindButtons : function(){
			var _this = this;
			var sendButton = _this.getQnaContainer().find('.qnaSendButton');
			sendButton.text(gM('qna-send-button-text'));
			sendButton
				.off('click')
				.on('click', function(){
					var question = _this.getQnaContainer().find('.qnaQuestionTextArea').val();

					if (_this.getPlayer().isOffline() && !_this.getConfig( 'allowNewQuestionWhenNotLive' )){
						alert(gM('qna-cant-ask-while-not-live'));
					} else {
					if (question !== gM('qna-default-question-box-text')) {
						_this.KQnaService.submitQuestion(question);
						_this.resetTextArea(textArea);
					}
					}
				});
			var cancelButton = _this.getQnaContainer().find('.qnaCancelButton');
			cancelButton.text(gM('qna-cancel-button-text'));
			cancelButton
				.off('click')
				.on('click', function(){
					_this.resetTextArea(textArea);
				});

			var textArea = _this.getQnaContainer().find('.qnaQuestionTextArea');
			_this.resetTextArea(textArea);
			textArea
				.off('focus')
				.on('focus', function(){
					if (textArea.val() === gM('qna-default-question-box-text')) {
						textArea.css({'font-weight': 300});
						textArea.val('');
						textArea.css({'color': '#ffffff'});
					}
				});

			textArea
				.off('blur')
				.on('blur', function(){
					if (textArea.val() === '') {
						_this.resetTextArea(textArea);
					}
				});

			textArea.bind("mousewheel",function(ev) {
				ev.preventDefault();

				var ratio = $(this).height() / $(window).height();
				var deltaY = ev.originalEvent.deltaY * ratio;
				$(this).scrollTop($(this).scrollTop() - Math.round(deltaY));
			});

			textArea.bind("touchstart",function(ev) {
				var elem = ev.target;
				$(elem).css({'overflow':'auto'});
			});
		},

		resetTextArea : function(textArea){
			textArea.val(gM('qna-default-question-box-text'));
			textArea.css({'font-weight': 300});
			textArea.css({'color': 'rgba(255, 240, 240, 0.61)'});
		},

		getHTML : function(data){
			var templatePath = this.getConfig( 'templatePath' );
			var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

			return rawHTML;
		},

		hideModule: function(hide, announcementOnly) {
			var firstTime = false;
			var _this = this;
			if (_this.moduleStatus === undefined){
				_this.moduleStatus = hide;
				_this.announcementOnlyStatus(announcementOnly);
				firstTime = true;
			}
			else{
				if (_this.moduleStatus === hide && _this.announcementOnlyStatus() === announcementOnly){
					return;
				}
				else{
					_this.moduleStatus = hide;
					_this.announcementOnlyStatus(announcementOnly);
				}
			}
			if (hide) {
				_this.getQnaContainer().find(".qnaModuleBackground").hide();
				$('.qna-on-video-btn').hide();
			}
			else{
				if (firstTime) {
					_this.getQnaContainer().find(".qnaModuleBackground").show();
				}
				$('.qna-on-video-btn').show();

				if (announcementOnly){
					_this.getQnaContainer().find(".qnaQuestionArea").hide();
					$('.qnaReplyBox').hide();

					_this.getQnaContainer().find('.listHolder').height(this.getPlayer().getInterface().height());

				}
				else{
					_this.getQnaContainer().find(".qnaQuestionArea").show();
					$('.qnaReplyBox').show();
					var newHeight = this.getPlayer().getInterface().height() - _this.getQnaContainer().find('.qnaQuestionArea').height();
					_this.getQnaContainer().find('.listHolder').height(newHeight);
				}
			}

			_this.changeVideoToggleIcon();
			_this.KQnaModule.applyLayout();
		}

	}));

})(window.mw, window.jQuery);
