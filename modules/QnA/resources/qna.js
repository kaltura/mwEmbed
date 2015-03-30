(function (mw, $) {
	"use strict";

	mw.PluginManager.add('qna', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "controlsContainer",
			order: 5,
			align: "right",
			tooltip:  gM( 'qna-tooltip' ),
			visible: true,
			showTooltip: true,
			displayImportance: 'medium',
			templatePath: '../QnA/resources/qna.tmpl.html',

			usePreviewPlayer: false,
			previewPlayerEnabled: false

		},

		iconBtnClass: "icon-flag",

		setup: function () {
			this.addBindings();
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('layoutBuildDone', function (event, screenName) {
				embedPlayer.getVideoHolder().append('<div style="bottom: 50px; margin: 0 auto; left: 50%; background-color: red; position: absolute">hello</div>');
			});

			this.bind('preShowScreen', function (event, screenName) {
				if ( screenName === "qna" ){
					// prevent keyboard key actions to allow typing in share screen fields
					embedPlayer.triggerHelper( 'onDisableKeyboardBinding' );
				}
			});
			this.bind('preHideScreen', function (event, screenName) {
				if ( screenName === "qna" ){
					// restore keyboard actions
					embedPlayer.triggerHelper( 'onEnableKeyboardBinding' );
				}
			});

		},

		submitQuestion: function(){
			var embedPlayer = this.getPlayer();
			var _this = this;
			alert("submit: "+$(".qna .question-input").val());
			var entryRequest = {
				'service': 'baseEntry',
				'action': 'get',
				'entryId': embedPlayer.kentryid
			};
			_this.getKClient().doRequest(entryRequest, function (entryDataResult) {
				alert("Got entry: "+entryDataResult.name);
				_this.hideScreen();
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
		}

	}));

})(window.mw, window.jQuery);
