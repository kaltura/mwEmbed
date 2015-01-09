( function( mw, $, kWidget ) {"use strict";

	mw.PluginManager.add( 'adBlockDetector', mw.KBasePlugin.extend({

		defaultConfig: {
			scriptPath: "modules/KalturaSupport/components/adBlockDetector/advertisement.js",
			enableResumePlayback: false,
			title: gM( 'ks-adBlockDetector-title' ),
			message: gM( 'ks-adBlockDetector-message' ),
			buttons: [
				gM( 'ks-adBlockDetector-btn-close' )
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
			},
			checkTimeout: 2000,
			suppressError: false

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
			this.bind("onChangeMedia", function(){
				_this.errorRaised = false;
			});
		},
		tryAndDownload: function(){
			var _this = this;
			var basePath = mw.getMwEmbedPath();
			var fullScriptPath = basePath + this.getConfig("scriptPath");

			var successHandler = function( ) {
				mw.log("adBlockDetector::Check passed - adblock not detected on page");
			};
			var errorHandler = function(){
				mw.log("adBlockDetector::Check failed - adblock detected on page");
				_this.raiseError();
			};

			//Issue call to dummy advertisment.js script
			kWidget.appendScriptUrl(fullScriptPath, successHandler, document, errorHandler);

			//Fallback check for cross-domain blocking issues
			setTimeout(function(){
				if (!(window["adBlockCheckVariable"] || _this.errorRaised)){
					_this.raiseError();
				}
				}, this.getConfig("checkTimeout")
			);
		},
		raiseError: function(){
			var _this = this;
			//Mark that error was raised to avoid double call
			this.errorRaised = true;
			//Raise error in order to allow other plugins or external subscribers to know ad block was detected
			this.getPlayer().triggerHelper("adBlockDetected");
			//Freeze the UI
			this.getPlayer().sendNotification("enableGui", false);

			//Show error only if suppress error was not set to true
			if (!this.getConfig("suppressError")){
				var alertConfig = _this.getConfig();

				//In case no buttons is set, clear the buttons array
				if ( alertConfig.noButtons ) {
					alertConfig.buttons = [];
				}

				//If enableResume is set then attach the callbackFunction handler
				if ( alertConfig.enableResumePlayback ) {
					alertConfig.callbackFunction = function () {
						_this.enableContinue();
					};
					alertConfig.buttons = [gM( 'ks-adBlockDetector-btn-resume' )];
				}

				//Remove data attribute flag used for empty players or a player where you want to dynamically set sources
				this.embedPlayer['data-blockPlayerDisplay'] = null;
				//Set player error to prevent playback
				this.getPlayer().setError( alertConfig );
				//Display the error modal
				this.getPlayer().showPlayerError();
			}
		},
		enableContinue: function(){
			//Set player error to null allow playback
			this.getPlayer().setError(null);
			//Remove the error modal
			this.getPlayer().sendNotification("removealert");
		}
	}));

} )( window.mw, window.jQuery, window.kWidget );