(function (mw, $) {
	"use strict";

	mw.PluginManager.add('qna', mw.KBasePlugin.extend({

		defaultConfig: {
			templatePath: '../QnA/resources/qna.tmpl.html',
		},

		iconBtnClass: "icon-flag",

		setup: function () {
			this.addBindings();
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('layoutBuildDone', function (event, screenName) {
				embedPlayer.getVideoHolder().append('<div class="qna-btn">hello</div>');
				$(".qna-btn").on("click", function(){
					embedPlayer.triggerHelper( 'showQuestion');
				})
			});

			this.bind( 'sendQuestion', function(event, data){
				_this.submitQuestion(data.question);
			});
		},

		submitQuestion: function(question){
			var embedPlayer = this.getPlayer();
			var _this = this;
			var entryRequest = {
				'service': 'baseEntry',
				'action': 'get',
				'entryId': embedPlayer.kentryid
			};
			_this.getKClient().doRequest(entryRequest, function (entryDataResult) {
				alert("Got entry: "+entryDataResult.name);
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
