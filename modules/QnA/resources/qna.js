(function (mw, $) {
	"use strict";

	mw.PluginManager.add('qna', mw.KBasePlugin.extend({

		defaultConfig: {
			templatePath: '../QnA/resources/qna.tmpl.html',
			cssFileName: 'modules/QnA/resources/qna.css',
			defaultTextAreaValue: 'Type new question here'
		},

		getBaseConfig: function() {
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				//templatePath: '../QnA/resources/qna.tmpl.html',
				qnaTargetId: null
			});
		},

		iconBtnClass: "icon-flag",

		setup: function () {
			this.addBindings();
			this.getQnAContainer();
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('layoutBuildDone', function (event, screenName) {
				embedPlayer.getVideoHolder().append('<div class="qna-on-video-btn">hello</div>');
				var _this = this;
				var qnaObject =  $(window['parent'].document.getElementById(embedPlayer.id )).parent().find( ".qnaInterface" );
				$(".qna-on-video-btn").on("click", function(){
					if (qnaObject.is(":visible")){
						qnaObject.hide();
					} else {
						qnaObject.show();
					}

					//debugger;
				})
			});

			this.bind( 'sendQuestion', function(event, data){
				alert(data);
				_this.submitQuestion(data.question);
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
				"tags": "qna",
				"text": question
			};

			_this.getKClient().doRequest(entryRequest, function (result) {
				debugger;
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
		getQnAContainer: function(){
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
			}
			return this.$qnaListContainer;
		},

		bindButtons : function(){
			var _this = this;
			var parentWindowDocument = $( window['parent'].document );
			var sendButton = parentWindowDocument.find('.qnaSendButton');
			sendButton
				.off('click')
				.on('click', function(){
					var question = parentWindowDocument.find('.qnaQuestionTextArea').val();
					_this.submitQuestion(question);
				});

			var textArea = parentWindowDocument.find('.qnaQuestionTextArea');
			textArea.val(_this.getConfig('defaultTextAreaValue'));

			textArea
				.off('focus')
				.on('focus', function(){
					if (textArea.val() === _this.getConfig('defaultTextAreaValue')) {
						textArea.val('');
					}
				});

			textArea
				.off('blur')
				.on('blur', function(){
					if (textArea.val() === '') {
						textArea.val(_this.getConfig('defaultTextAreaValue'));
					}
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
