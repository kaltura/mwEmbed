( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'abChecker', mw.KBasePlugin.extend({

		defaultConfig: {
			scriptPath: "modules/KalturaSupport/components/abChecker/advertisement.js",
			enableResumePlayback: false,
			title: gM( 'ks-abChecker-title' ),
			message: gM( 'ks-abChecker-message' ),
			buttons: [
				gM( 'ks-abChecker-btn-close' )
			],
			noButtons: true,
			callbackFunction: null,
			isExternal: false,
			props: {
				textColor: null,
				titleTextColor: null,
				buttonRowSpacing: null,
				buttonHeight: null,
				buttonSpacing: null
			}

		},
		setup: function(){
			// Bind player
			this.addBindings();
		},
		addBindings: function(){
			var _this = this;
			this.bind("KalturaSupport_DoneWithUiConf", function(){
				_this.tryAndDownload();
			});

		},
		tryAndDownload: function(){
			var _this = this;
			var basePath = mw.getMwEmbedPath();
			var fullScriptPath = basePath + this.getConfig("scriptPath");

			$.getScript( fullScriptPath )
				.done(function( script, textStatus ) {
					mw.log("abChecker::Check passed - no adblock detected on page");
				})
				.fail(function( jqxhr, settings, exception ) {
					mw.log("abChecker::Check failed - adblock detected on page");
					_this.raiseError();
				});
		},
		raiseError: function(){
			var _this = this;
			var alertConfig = _this.getConfig();

			//In case no buttons is set, clear the buttons array
			if ( alertConfig.noButtons ) {
				alertConfig.buttons = [];
			}

			//If enableResume is set then attach the callbackFunction handler
			if (alertConfig.enableResumePlayback){
				alertConfig.callbackFunction = function(){
					_this.enableContinue();
				}
				alertConfig.buttons = [gM( 'ks-abChecker-btn-resume' )];
			}

			//Set player error to prevent playback
			this.getPlayer().setError(alertConfig);
			//Display the error modal
			this.getPlayer().showPlayerError();
		},
		enableContinue: function(){
			//Set player error to null allow playback
			this.getPlayer().setError(null);
			//Remove the error modal
			this.getPlayer().sendNotification("removealert");
		}
	}));

} )( window.mw, window.jQuery );