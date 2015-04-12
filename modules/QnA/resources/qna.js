(function (mw, $) {
	"use strict";

	mw.PluginManager.add('qna', mw.KBasePlugin.extend({

		defaultConfig: {
			templatePath: '../QnA/resources/qna.tmpl.html',
			cssFileName: 'modules/QnA/resources/qna.css'
		},

		getBaseConfig: function() {
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				qnaTargetId: null
			});
		},

		iconBtnClass: "icon-flag",

		setup: function () {
			this.addBindings();
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('layoutBuildDone', function (event, screenName) {
				embedPlayer.getVideoHolder().append('<div class="qna-on-video-btn icon-qna-close"></div>');
				_this.getQnaContainer();
				var qnaObject =  $(window['parent'].document.getElementById(embedPlayer.id )).parent().find( ".qnaInterface" );
				var onVideoTogglePluginButton = $('.qna-on-video-btn');
				$(".qna-on-video-btn").on("click", function(){
					if (qnaObject.is(":visible")){
						qnaObject.hide();
						onVideoTogglePluginButton.removeClass('icon-qna-close');
						onVideoTogglePluginButton.addClass('icon-qna-Ask');
					} else {
						qnaObject.show();
						onVideoTogglePluginButton.removeClass('icon-qna-Ask');
						onVideoTogglePluginButton.addClass('icon-qna-close');
					}
				})
			});

			this.bind( 'sendQuestion', function(event, data){
				_this.submitQuestion(data.question);
			});

			this.bind('onOpenFullScreen', function() {
				$(".qna-on-video-btn").hide();
			});

			this.bind('onCloseFullScreen', function() {
				$(".qna-on-video-btn").show();
			});
		},

		// Create a cue-point in the server for the question
		submitQuestion: function(question){
			var embedPlayer = this.getPlayer();
			var _this = this;

			var entryRequest = {
				"service": "cuePoint_cuePoint",
				"action": "add",
				"ks": embedPlayer.getFlashvars("ks"),
				"cuePoint:objectType": "KalturaAnnotation",
				"cuePoint:entryId": embedPlayer.kentryid,
				"cuePoint:startTime": embedPlayer.currentTime,
				"cuePoint:text": question,
				"cuePoint:tags": "qna"
			};

			_this.getKClient().doRequest(entryRequest, function (result) {
				mw.log("added Annotation cue point with id: " + result.id);
			},
			false,
			function(err){
				mw.log( "Error: "+ this.pluginName +" could not add cue point. Error: " + err );
			});
		},

		getKClient: function () {
			if (!this.kClient) {
				this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
			}
			return this.kClient;
		},

		getTemplateData: function () {
			return {
				'qna': this
			};
		},

		// load the Q&A template to the div with qnaTargetId
		getQnaContainer: function(){
			if (!this.$qnaListContainer) {
				// Inject external CSS file
				var cssLink = this.getConfig('cssFileName');
				if (cssLink) {
					cssLink = cssLink.toLowerCase().indexOf("http") === 0 ? cssLink : kWidget.getPath() + cssLink; // support external CSS links
					$( 'head', window.parent.document ).append( '<link type="text/css" rel="stylesheet" href="' + cssLink + '"/>' );
				} else {
					mw.log( "Error: "+ this.pluginName +" could not find CSS link" );
				}

				var iframeParent = window['parent'].document.getElementById( this.embedPlayer.id );
				$( iframeParent ).parent().find( "#" + this.getConfig( 'qnaTargetId' ) ).html( "<div class='qnaInterface'></div>" );
				this.$qnaListContainer = $( iframeParent ).parent().find( ".qnaInterface" );
				this.$qnaListContainer.append(this.getHTML());

				this.bindButtons();
				this.positionOnVideoButton();
			}
			return this.$qnaListContainer;
		},

		positionOnVideoButton : function(){
			var onVideoTogglePluginButton = $('.qna-on-video-btn');
			var videoHeight = this.getPlayer().getVideoHolder().height();
			var buttonHeight = Math.round(videoHeight / 5);
			var buttonWidth = Math.round(videoHeight / 10);
			onVideoTogglePluginButton.css({height: buttonHeight + "px"});
			onVideoTogglePluginButton.css({width: buttonWidth + "px"});

			onVideoTogglePluginButton.css({'-moz-border-radius': buttonWidth + "px 0 0 " + buttonWidth + "px"});
			onVideoTogglePluginButton.css({'-webkit-border-radius': buttonWidth + "px 0 0 " + buttonWidth + "px"});
			onVideoTogglePluginButton.css({'border-radius': buttonWidth + "px 0 0 " + buttonWidth + "px"});

			var topOffset = (videoHeight-onVideoTogglePluginButton.height())/2 + "px";
			onVideoTogglePluginButton.css({top: topOffset});

			onVideoTogglePluginButton.css({'line-height': buttonHeight + "px"});

			var textIndent = (buttonWidth - parseInt(onVideoTogglePluginButton.css('font-size'))) / 2;
			onVideoTogglePluginButton.css({'text-indent': textIndent + "px"});

		},

		bindButtons : function(){
			var _this = this;
			var parentWindowDocument = $( window['parent'].document );
			var sendButton = parentWindowDocument.find('.qnaSendButton');
			sendButton.text(gM('qna-send-button-text'));
			sendButton
				.off('click')
				.on('click', function(){
					var question = parentWindowDocument.find('.qnaQuestionTextArea').val();
					if (_this.getPlayer().isOffline()){
						alert(gM('qna-cant-ask-while-not-live'));
					} else {
						if (question !== gM('qna-default-question-box-text')) {
							_this.submitQuestion(question);
							textArea.val(gM('qna-default-question-box-text'));
						}
					}
				});
			var cancelButton = parentWindowDocument.find('.qnaCancelButton');
			cancelButton.text(gM('qna-cancel-button-text'));
			cancelButton
				.off('click')
				.on('click', function(){
					textArea.val(gM('qna-default-question-box-text'));
					textArea.css({'font-weight': 200});
					textArea.css({'color': 'rgba(255, 240, 240, 0.61)'});
				});

			var textArea = parentWindowDocument.find('.qnaQuestionTextArea');
			textArea.val(gM('qna-default-question-box-text'));

			textArea.css({'font-weight': 200});
			textArea.css({'color': 'rgba(255, 240, 240, 0.61)'});
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
						textArea.val(gM('qna-default-question-box-text'));
						textArea.css({'font-weight': 200});
						textArea.css({'color': 'rgba(255, 240, 240, 0.61)'});
					}
				});

			textArea.bind("mousewheel",function(ev) {
				ev.preventDefault();
				var scrollTop = $(this).scrollTop();
				$(this).scrollTop(scrollTop-Math.round(ev.originalEvent.deltaY));
			});
		},

		getHTML : function(data){
			var templatePath = this.getConfig( 'templatePath' );
			var rawHTML = window.kalturaIframePackageData.templates[ templatePath ];

			var transformedHTML = mw.util.tmpl( rawHTML );
			transformedHTML = transformedHTML(data);
			return transformedHTML;
		}
	}));

})(window.mw, window.jQuery);
