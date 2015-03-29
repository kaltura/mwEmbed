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

		entryData: null,

		setup: function () {
			this.addBindings();
		},

		addBindings: function () {
//			var _this = this;
//			var embedPlayer = this.getPlayer();
//			this.bind('layoutBuildDone', function () {
//
//				var entryRequest = {
//					'service': 'baseEntry',
//					'action': 'get',
//					'entryId': embedPlayer.kentryid
//				};
//				_this.getKClient().doRequest(entryRequest, function (entryDataResult) {
//					_this.entryData = entryDataResult;
//					_this.showScreen();
//				});
//
//			});
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
