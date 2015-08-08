(function (mw, $) {
	"use strict";

	mw.PluginManager.add('aria', mw.KBaseComponent.extend({

		defaultConfig: {
			'readTooltips': true,
			'locale': 'en',
			'voiceCommands': false
		},

		sound: null,

		setup: function (embedPlayer) {
			if (mw.isIE8()) {
				mw.log("aria::aria plugin not supported in IE8");
				return;
			}
			this.sound = new Audio();
			this.addBindings();
			if (this.getConfig("voiceCommands")) {
				this.setupVoiceCommands()
			}
		},

		addBindings: function () {
			var _this = this;
			if (this.getConfig("readTooltips")) {
				this.bind('playerReady', function (event) {
					var buttonsArr = _this.embedPlayer.getInterface().find(".btn");
					for (var i = 0; i < buttonsArr.length; i++) {
						$(buttonsArr[i]).on("mouseenter", function (e) {
							if (!!$(this).attr("title")) {
								_this.sound.src = kWidget.getPath() + "/modules/KalturaSupport/components/aria/tts.php?tl=" + _this.getConfig('locale') + "&q=" + $(this).attr("title");
								_this.sound.play();
							}
						})
					}
				});
			}
		},

		setupVoiceCommands: function () {
			var _this = this;
			if (!('webkitSpeechRecognition' in window)) {
				mw.log("aria::Voice commands are supported only in Google Chrome");
				return;
			}
			var recognition = new webkitSpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = false;
			recognition.lang = "en";
			recognition.start();
			recognition.onresult = function (event) {
				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						_this.executeCommand(event.results[i][0].transcript.trim().toLowerCase());
					}
				}
			};
		},

		executeCommand: function (transcript) {
			mw.log("aria::got transcript: " + transcript);
			var command = null;
			var playArr = [ "play" ];
			if (playArr.indexOf(transcript) !== -1) {
				command = "play";
			}
			var pauseArr = [ "pause", "pulse", "pose", "pose" , "both", "post", "phone", "pal", "pals", "Powell's", "pout" ];
			if (pauseArr.indexOf(transcript) !== -1) {
				command = "pause";
			}
			mw.log("aria::executing command: " + command);
			if (command) {
				switch (command) {
					case "play":
						this.embedPlayer.sendNotification("doPlay");
						break;
					case "pause":
						this.embedPlayer.sendNotification("doPause");
						break;
				}
			}
		}
	})

	);

})(window.mw, window.jQuery);