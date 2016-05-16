(function (mw, $) {
	"use strict";

	mw.PluginManager.add('webcastPolls', mw.KBaseScreen.extend({

		defaultConfig: {
			templatePath: '../WebcastPolls/resources/webcastPolls.tmpl.html'
		},
		locale:{
			startTimeLbl: gM( 'mwe-share-startTimeLbl' ),
			secureEmbedLbl: gM( 'mwe-share-secureEmbedLbl' ),
			copyLbl: gM( 'mwe-share-copyLbl' ),
			errDuration: gM( 'mwe-share-errDuration' ),
			errFormat: gM( 'mwe-share-errFormat' )
		},
		question : 'amir',

		setup: function () {
			if (mw.isMobileDevice()){
				console.log("mobile device");
			}
			this.addBindings();
		},

		addBindings: function () {
			// bind to cue point events
			var _this = this;
			setTimeout(function(){
				_this.showScreen();
				_this.getPlayer().addPlayerSpinner();
				// _this.hideScreen();
			},1000);

			setTimeout(function(){
				_this.getPlayer().hideSpinner();
				_this.question="hello";
				_this.removeScreen();
				_this.showScreen();
			},5000);
		},

		getTemplateData: function () {
			return {
				'name': this.question
			};
		},

		// bind to template UI events
		addScreenBindings: function(){

		},

		// called from template X button
		closeScreen: function(){
			this.removeScreen();
		}


	}));

})(window.mw, window.jQuery);
