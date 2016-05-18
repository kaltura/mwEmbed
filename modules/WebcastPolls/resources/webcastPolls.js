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
			var embedPlayer = this.getPlayer();

			//setTimeout(function(){
			//	embedPlayer.disablePlayControls(["volumeControl","scrubber","playPauseBtn","playlistAPI"]);
			//},0);

			this.bind('playerReady', function () {
				setTimeout(function(){
					_this.showScreen();
					//_this.getPlayer().addPlayerSpinner();
					// _this.hideScreen();

					//setTimeout(function(){
					//	_this.getPlayer().hideSpinner();
					//	_this.question="hello";
					//	_this.removeScreen();
					//	_this.showScreen();
					//},5000);
				},5000);
			});
			this.bind('preShowScreen', function (event, screenName) {
				if ( screenName === "webcastPolls" ){
					_this.getScreen().then(function(screen){
						screen.addClass('semiTransparentBkg'); // add semi-transparent background for share plugin screen only. Won't affect other screen based plugins
						_this.shareScreenOpened = true;
						// prevent keyboard key actions to allow typing in share screen fields
						embedPlayer.triggerHelper( 'onDisableKeyboardBinding' );
						// disable all player controls except play button, scrubber and volume control
						embedPlayer.disablePlayControls(["volumeControl","scrubber","playPauseBtn","playlistAPI"]);
						// setup embed code when the screen opens
						_this.setupEmbedCode();
						// set embed code in the UI as the template doesn't load it correctly when using data binding because of the double quotes inside the text
						$(".embed-input").val(_this.getConfig('embedCode'));
						// send event for analytics
						$(embedPlayer).trigger("showShareEvent");
						// enable playback when the share screen is opened
						_this.enablePlayDuringScreen = true;
						// set responsive size
						if (embedPlayer.getVideoHolder().width() < 400){
							$(".share").addClass("small");
						}
					});
				}
			});
			this.bind('showScreen', function (event, screenName) {
				if ( screenName === "webcastPolls" ){
					_this.getScreen().then(function(screen){
						$( "#" + embedPlayer.getPlayerElement().id ).addClass("blur");
						embedPlayer.getPlayerPoster().addClass("blur");
					});
				}
			});
			this.bind('preHideScreen', function (event, screenName) {
				if ( screenName === "webcastPolls" ){
					if ( !_this.enablePlayDuringScreen ){
						_this.shareScreenOpened = false;
					}
					// restore keyboard actions
					embedPlayer.triggerHelper( 'onEnableKeyboardBinding' );
					// re-enable player controls
					if ( !embedPlayer.isInSequence() ){
						embedPlayer.enablePlayControls();
					}
					// remove blur
					if (embedPlayer.getPlayerElement()) {
						$( "#" + embedPlayer.getPlayerElement().id ).removeClass( "blur" );
						embedPlayer.getPlayerPoster().removeClass( "blur" );
					}
				}
			});

			this.bind( 'onplay', function(event, data){
				if ( _this.shareScreenOpened ){

				}
			});

			this.bind( 'onpause', function(event, data){
				if ( _this.shareScreenOpened ){
					$( "#" + embedPlayer.getPlayerElement().id ).addClass("blur");
					embedPlayer.getPlayerPoster().addClass("blur");
				}
			});
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
