(function (mw, $, shaka) {
	"use strict";
	/*
	for browsers which don't have VTT cue we need to install a polyfill for both isBrowserSupported	check
	and also for playback, but we might not use Shaka so if we install the polyfill now just for browser support check
	then uninstall it after, and call it again if we actually use Shaka for playback on init
	this is in order to avoid collisions with other libs
	 */
	var resetVttPolyfill = false;
	if (!window.VTTCue) {
		resetVttPolyfill = true;
	}
	shaka.polyfill.installAll();
	if (resetVttPolyfill) {
		window.VTTCue = undefined;
	}

	if (shaka.Player.isBrowserSupported() &&
		!mw.getConfig("EmbedPlayer.ForceNativeComponent") &&
		!mw.isDesktopSafari() &&
		!mw.isAndroid()) {
		$(mw).bind('EmbedPlayerUpdateMediaPlayers', function (event, mediaPlayers) {
			mw.log("Dash::Register shaka player for application/dash+xml mime type");
			var shakaPlayer = new mw.MediaPlayer('shakaPlayer', ['application/dash+xml'], 'Native');
			mediaPlayers.addPlayer(shakaPlayer);
			mw.EmbedTypes.mediaPlayers.setMIMETypePlayers('application/dash+xml', 'Native');
		});
		var dash = mw.KBasePlugin.extend({


		/** type {boolean} */
		loaded: false,

			/** type {boolean} */
			LoadShaka: false,

			/** type {boolean} */
			manifestLoaded: false,

			destroyPromise: null,

		currentBitrate: null,
		/**
		 * Check is shaka is supported
		 * @returns {boolean}
		 */
		isSafeEnviornment: function () {
			return shaka.Player.isBrowserSupported() ;
		},
		/**
		 * Setup the shaka playback engine wrapper with supplied config options
		 */
		setup: function () {
			this.addBindings();
		},
		/**
		 *
		 */
		addBindings: function () {

			this.bind("SourceChange", this.isNeeded.bind(this));
			this.bind("playerReady", this.initShaka.bind(this));
			this.bind("switchAudioTrack", this.onSwitchAudioTrack.bind(this));

			this.bind("onChangeMedia", this.clean.bind(this));
		},

			/**
			 * Check if Shaka engine is required, e.g. the selected source is dash
			 */
			isNeeded: function () {
				if (this.getPlayer().mediaElement.selectedSource.mimeType === "application/dash+xml") {
					this.LoadShaka = true;
				} else {
					this.LoadShaka = false;
				}
			},

			/**
			 * Register the playback events and attach the playback engine to the video element
			 */
			initShaka: function () {
				if (this.LoadShaka && !this.loaded) {
					this.log("Init shaka version " + shaka.Player.version);

					//Set streamerType to dash
					this.embedPlayer.streamerType = 'mpegdash';

					this.loaded = true;

					//Disable update of video source tag, MSE uses blob urls!
					this.getPlayer().skipUpdateSource = true;
					this.overridePlayerMethods();

					this.setEmbedPlayerConfig(this.getPlayer());

                    if ( this.destroyPromise ) {
						// after change media we should wait till the destroy promise will be resolved
                        this.destroyPromise.then( function () {
                            this.onShakaDestroyEnded();
                            this.createPlayer();
                        }.bind( this ) );
                    } else {
                        this.createPlayer();
                    }
                }
			},

			setEmbedPlayerConfig: function (embedPlayer) {
				//Get user configuration
				var userConfig = embedPlayer.getKalturaConfig("dash");
				//Get default config
				var dashConfig = this.getDefaultDashConfig();
				//Deep extend custom config
				$.extend(true, dashConfig, userConfig);
				embedPlayer.setKalturaConfig("dash", dashConfig);
			},

			getDefaultDashConfig: function () {
				var drmConfig = this.getDrmConfig();
				var defaultConfig = {
					shakaConfig: {
						drm: {
							servers: {
								'com.widevine.alpha': drmConfig.licenseBaseUrl + "/cenc/widevine/license?" + drmConfig.licenseData,
								'com.microsoft.playready': drmConfig.licenseBaseUrl + "/cenc/playready/license?" + drmConfig.licenseData
							}
						}
					}
				};
				if (mw.isChrome()){
					defaultConfig.shakaConfig.advanced = {
						'com.widevine.alpha': {
							'videoRobustness': 'SW_SECURE_CRYPTO',
							'audioRobustness': 'SW_SECURE_CRYPTO'
						}
					};
				}
				return defaultConfig;
			},

			getDrmConfig: function () {
				var licenseBaseUrl = mw.getConfig('Kaltura.UdrmServerURL');
				if (!licenseBaseUrl) {
					this.log('Error:: failed to retrieve UDRM license URL ');
				}

				var licenseData = this.getPlayer().mediaElement.getLicenseUriComponent();
				var drmConfig = {
					licenseBaseUrl: licenseBaseUrl,
					licenseData: licenseData
				};
				return drmConfig;
			},

		getShakaConfig: function(){
            var config = this.getConfig("shakaConfig");
            if (this.getPlayer().plugins && this.getPlayer().plugins.closedCaptions) {
                try {
                    var closedCaptions = this.getPlayer().plugins.closedCaptions;
                    var textLang = closedCaptions.getUserLanguageKeyPrefrence() || closedCaptions.getConfig('defaultLanguageKey');
                    if (textLang) {
                        config.preferredTextLanguage = textLang;
                    }
                } catch(e) {
                	this.log("Unable to get default captions config");
				}
            }
            return config;
		},

		createPlayer: function () {
			//Reinstall the polyfills to make sure they weren't ran over by others(VTT.js runs over VTTCue polyfill)
			shaka.polyfill.installAll();
			// Create a Player instance.
			var player = new shaka.Player(this.getPlayer().getPlayerElement());

				player.configure(this.getShakaConfig());

				// Attach player to the window to make it easy to access in the JS console.
				window.player = player;

				this.registerShakaEvents();

				var unbindAndLoadManifest = function () {
					this.unbind("firstPlay");
					this.unbind("seeking");
					this.loadManifest();
				}.bind(this);

				this.bind("firstPlay", function () {
					unbindAndLoadManifest();
				});

				this.bind("seeking", function () {
					unbindAndLoadManifest();
				});
			},

			registerShakaEvents: function () {
				player.addEventListener('error', this.onErrorEvent.bind(this));
				player.addEventListener('adaptation', this.onAdaptation.bind(this));
			},

			loadManifest: function () {
				var _this = this;
				var selectedSource = this.getPlayer().getSrc();
				if (!this.manifestLoaded) {
					this.manifestLoaded = true;
					this.log('Loading manifest...');
					this.getPlayer().resolveSrcURL(selectedSource)
						.done(function (manifestSrc) {  // success
							selectedSource = manifestSrc;
						})
						.always(function () {  // both success or error
								player.configure(_this.getDefaultDashConfig()["shakaConfig"]);
								// Try to load a manifest.
								player.load(selectedSource).then(function () {
									// This runs if the asynchronous load is successful.
									_this.log('The manifest has been loaded');
									_this.addTracks();
								}).catch(_this.onError.bind(_this));  // onError is executed if the asynchronous load fails.
							}
						);
				}
			},

			addTracks: function () {
				this.addAbrFlavors();
				this.addAudioTracks();
				this.addSubtitleTracks();
			},

			getVideoTracks: function () {
				var variantTracks = player.getVariantTracks();
				var activeVariantTrack = variantTracks.filter(function (variantTrack) {
					return variantTrack.active;
				})[0];
				var videoTracks = variantTracks.filter(function (variantTrack) {
					return variantTrack.audioId === activeVariantTrack.audioId;
				});
				return videoTracks;
			},

			getAudioTracks: function () {
				var variantTracks = player.getVariantTracks();
				var activeVariantTrack = variantTracks.filter(function (variantTrack) {
					return variantTrack.active;
				})[0];
				var audioTracks = variantTracks.filter(function (variantTrack) {
					return variantTrack.videoId === activeVariantTrack.videoId;
				});
				return audioTracks;
			},

			addAbrFlavors: function () {
				var videoTracks = this.getVideoTracks();
				if (videoTracks && videoTracks.length > 0) {
					var flavors = videoTracks.map(function (rep, index) {
						var sourceAspect = Math.round(( rep.width / rep.height ) * 100) / 100;
						// Setup a source object:
						return {
							'data-bandwidth': rep.bandwidth,
							'data-width': rep.width,
							'data-height': rep.height,
							'data-aspect': sourceAspect,
							'type': 'video/mp4',
							'data-assetid': rep.id,
							'data-flavorid': index
						};
					});
					mw.log("Dash::" + videoTracks.length + " ABR flavors were found: ", videoTracks);
					this.getPlayer().setKDPAttribute('sourceSelector', 'visible', true);
					this.getPlayer().onFlavorsListChanged(flavors);
				}
			},

			addAudioTracks: function () {
				var audioTracks = this.getAudioTracks();
				if (audioTracks && audioTracks.length > 0) {
					var audioTrackData = {languages: []};
					var audioTrackLangs = {};
					$.each(audioTracks, function (index, audioTrack) {
						if (audioTrackLangs[audioTrack.language] === undefined) {
							audioTrackLangs[audioTrack.language] = 1;
							audioTrackData.languages.push({
								'kind': 'audioTrack',
								'language': audioTrack.language,
								'srclang': audioTrack.language,
								'label': audioTrack.label || audioTrack.language,
								'title': audioTrack.language,
								'id': audioTrack.id,
								'index': audioTrackData.languages.length
							});
						}
					});
					mw.log("Dash::" + audioTracks.length + " audio tracks were found: ", audioTracks);
					//Set default audio track
					var audioTrack = this.getPlayer().audioTrack;
					if (audioTrack && audioTrack.defaultTrack && audioTrack.defaultTrack < audioTracks.length) {
						this.onSwitchAudioTrack({}, {index: audioTrack.defaultTrack});
					}
					this.onAudioTracksReceived(audioTrackData);
				}
			},

			addSubtitleTracks: function () {
				var textTracks = player.getTextTracks();
				if (textTracks && textTracks.length > 0) {
					var textTrackData = {languages: []};
					$.each(textTracks, function (index, subtitleTrack) {
						textTrackData.languages.push({
							'kind': 'subtitle',
							'language': subtitleTrack.language,
							'srclang': subtitleTrack.language,
							'label': subtitleTrack.label || subtitleTrack.language,
							'title': subtitleTrack.language,
							'id': subtitleTrack.id,
							'index': textTrackData.languages.length
						});
					});
					mw.log("Dash::" + textTracks.length + " text tracks were found: ", textTracks);
					this.onTextTracksReceived(textTrackData);
				}
			},

			onAudioTracksReceived: function (data) {
				this.getPlayer().triggerHelper('audioTracksReceived', data);
			},

			onTextTracksReceived: function (data) {
				this.getPlayer().triggerHelper('textTracksReceived', data);
			},

			/**
			 * Override player method for source switch
			 * @param source
			 */
			switchSrc: function (source) {
				if (source !== -1) {
					var selectedAbrTrack = this.getVideoTracks()[source.flavorid];
					if (selectedAbrTrack) {
						player.configure({abr:{enabled: false}});
						player.selectVariantTrack(selectedAbrTrack, false);
						this.getPlayer().triggerHelper("sourceSwitchingStarted", this.currentBitrate);
						var _this = this;
						setTimeout(function () {
							_this.getPlayer().triggerHelper("sourceSwitchingEnd", Math.round(source.getBitrate()));
						}, 1000);
						mw.log("Dash::switchSrc to ", selectedAbrTrack);
					}
				} else { // "Auto" option is selected
					player.configure({abr:{enabled: true}});
					this.log("switchSrc to Auto");
				}
			},

			/**
			 * Override player callback after changing media
			 */
			playerSwitchSource: function (src, switchCallback, doneCallback) {
				var loadManifestAfterSwitchSource = function () {
					this.unbind("firstPlay");
					this.unbind("seeking");
					this.loadManifest();
					this.getPlayer().play();
					if ($.isFunction(switchCallback)) {
						switchCallback();
					}
				}.bind(this);

				if (this.destroyPromise) {
					this.destroyPromise.then(function () {
						loadManifestAfterSwitchSource();
					}.bind(this));
				} else {
					loadManifestAfterSwitchSource();
				}
			},

			/**
			 * Override player method for loading the video element
			 */
			load: function () {
			},

			/**
			 * Override player method for parsing tracks
			 */
			parseTracks: function () {
			},

			/**
			 * Override player method for switching audio track tracks
			 */
			switchAudioTrack: function () {
			},

			onSwitchAudioTrack: function (event, data) {
				if (this.loaded) {
					var selectedAudioTracks = this.getAudioTracks()[data.index];
					player.selectAudioLanguage(selectedAudioTracks.language);
					mw.log("Dash::onSwitchAudioTrack switch to ", selectedAudioTracks);
				}
			},

			onSwitchTextTrack: function (event, data) {
				if (this.loaded) {
					if (!data) {
						player.setTextTrackVisibility(false);
						this.log("onSwitchTextTrack disable subtitles");
					} else {
						var selectedTextTracks = player.getTextTracks()[data.index];
						player.setTextTrackVisibility(true);
						player.selectTextTrack(selectedTextTracks, false);
						mw.log("Dash::onSwitchTextTrack switch to ", selectedTextTracks);
					}
				}
			},

			_ondurationchange: function (event, data) {
				if (this.getPlayer().isLive() && this.getPlayer().isDVR()) {
					// The live stream duration is not relative, therefore the time preview shown by the scrubber (in DVR) is incorrect.
					// We have to calculate the relative duration by the time range.
					var seekRange = player.seekRange();
					this.getPlayer().setDuration(seekRange.end - seekRange.start);
				} else {
					this.orig_ondurationchange.call(this.getPlayer(), event, data);
				}
			},

			doSeek: function (seekTime) {
				if (this.getPlayer().isLive() && this.getPlayer().isDVR()) {
					// In live stream the vid.currentTime is not relative, therefore the seek time target from the scrubber (in DVR) is incorrect.
					// We have to calculate the seek time target for the vid.currentTime by the delta between the relative duration and the relative seek time target.
					var delta = this.getPlayer().getDuration() - seekTime;
					var seekRange = player.seekRange();
					var seekTimeTarget = seekRange.end - delta;
					this.getPlayer().currentSeekTargetTime = seekTimeTarget;
					this.getPlayer().getPlayerElement().currentTime = seekTimeTarget;
				} else {
					this.orig_doSeek.call(this.getPlayer(), seekTime);
				}
			},

			backToLive: function () {
				this.getPlayer().goingBackToLive = true;
				var seekRange = player.seekRange();
				this.getPlayer().getPlayerElement().currentTime = seekRange.end;
				this.getPlayer().triggerHelper('movingBackToLive');
				if (this.getPlayer().isDVR()) {
					var _this = this;
					this.once('seeked', function () {
						_this.getPlayer().goingBackToLive = false;
					});
				} else {
					this.getPlayer().goingBackToLive = false;
				}
			},

			updatePlayheadStatus: function () {
				var embedPlayer = this.getPlayer();
				if ( embedPlayer.isLive() && embedPlayer.isDVR() ) {
					// embedPlayer.duration is irrelevant for dash live, we have to calculate the playHeadPercent via player.seekRange().end instead.
					if ( embedPlayer.currentTime >= 0 && embedPlayer.duration && !embedPlayer.userSlide && !embedPlayer.seeking ) {
						var delta = player.seekRange().end - embedPlayer.currentTime;
						var playHeadPercent = ( embedPlayer.duration - delta ) / embedPlayer.duration;
						embedPlayer.updatePlayHead(playHeadPercent);
						//update liveEdgeOffset
						if (embedPlayer.isDVR()) {
							var perc = parseInt(playHeadPercent * 1000);
							if (perc > 998) {
								embedPlayer.liveEdgeOffset = 0;
							} else {
								embedPlayer.liveEdgeOffset = embedPlayer.duration - perc / 1000 * embedPlayer.duration;
							}
						}
					}
				} else {
					this.orig_updatePlayheadStatus.call(embedPlayer);
				}
			},

		onErrorEvent: function (event) {
			// Extract the shaka.util.Error object from the event.
			var error = event &&event.detail;
try {
                var errorString = JSON.stringify(error, null, "\t");
                this.log("error: " + errorString);
			} catch (e){
                this.log("error: unable to stringify Shaka error");
			}
            //Only throw critical error
			if (error &&
				error.severity &&
				error.severity === shaka.util.Error.Severity.CRITICAL) {
                this.onError(error);
            }
		},

		/**
		 * Error handler
		 * @param event
		 */
		onError: function (error) {
				var errorMessage = error.name === "TypeError" ? error.stack : JSON.stringify(error);
				var errorObj = {
					message: errorMessage
				};
				if (error.category) {
					errorObj.code = error.category + "000";
				}
				this.getPlayer().triggerHelper('embedPlayerError', errorObj);
			mw.log("Dash::Error: ", error);
		},

            onShakaDestroyEnded:function (  ) {
                this.log( "The player has been destroyed" );
                this.destroyPromise = null;
                this.manifestLoaded = false;
                // Firefox 50 and chrome 51 has an issue with mediaSource when preload attr is none
                // see:
				// https://bugs.chromium.org/p/chromium/issues/detail?id=539707
                // https://bugzilla.mozilla.org/show_bug.cgi?id=1211752
                // we store the previews preload value and restore it on clean method.
                this.preloadVal = $(this.getPlayer().getPlayerElement()).attr("preload");
                $(this.getPlayer().getPlayerElement()).attr("preload",true);
            },

			/**
			 * Clean method
			 */
			clean: function () {
				if (this.LoadShaka && this.loaded) {
					this.log("Clean");
					this.LoadShaka = false;
					this.loaded = false;
					this.currentBitrate = null;
                    this.destroyPromise = player.destroy().then(this.onShakaDestroyEnded.bind(this));
					if(this.preloadVal){
						$(this.getPlayer().getPlayerElement()).attr("preload",this.preloadVal);
					}
					this.restorePlayerMethods();
				}
			},

			onAdaptation: function () {
				var selectedAbrTrack = this.getVideoTracks().filter(function (videoTrack) {
					return videoTrack.active;
				})[0];
				if (selectedAbrTrack) {
					var currentBitrate = Math.round(selectedAbrTrack.bandwidth / 1024);
					if (this.currentBitrate !== currentBitrate) {
						this.currentBitrate = currentBitrate;
						this.embedPlayer.triggerHelper('bitrateChange', currentBitrate);
						this.log('The bitrate has changed to ' + currentBitrate);
					}
				}
			},

		/**
		 * Enable override player methods for Dash playback
		 */
		overridePlayerMethods: function () {
			this.orig_switchSrc = this.getPlayer().switchSrc;
			this.orig_playerSwitchSource = this.getPlayer().playerSwitchSource;
			this.orig_load = this.getPlayer().load;
			this.orig_parseTracks = this.getPlayer().parseTracks;
			this.orig_switchAudioTrack = this.getPlayer().switchAudioTrack;
			this.orig_onSwitchTextTrack = this.getPlayer().onSwitchTextTrack;
			this.orig_ondurationchange = this.getPlayer()._ondurationchange;
			this.orig_backToLive = this.getPlayer().backToLive;
			this.orig_doSeek = this.getPlayer().doSeek;
			this.orig_updatePlayheadStatus = this.getPlayer().updatePlayheadStatus;
			this.orig_clean = this.getPlayer().clean;
			this.getPlayer().switchSrc = this.switchSrc.bind(this);
			this.getPlayer().playerSwitchSource = this.playerSwitchSource.bind(this);
			this.getPlayer().load = this.load.bind(this);
			this.getPlayer().parseTracks = this.parseTracks.bind(this);
			this.getPlayer().switchAudioTrack = this.switchAudioTrack.bind(this);
			this.getPlayer().onSwitchTextTrack = this.onSwitchTextTrack.bind(this);
			this.getPlayer()._ondurationchange = this._ondurationchange.bind(this);
			this.getPlayer().backToLive = this.backToLive.bind(this);
			this.getPlayer().doSeek = this.doSeek.bind(this);
			this.getPlayer().updatePlayheadStatus = this.updatePlayheadStatus.bind(this);
			this.getPlayer().clean = this.clean.bind(this);
		},
		/**
		 * Disable override player methods for Dash playback
		 */
		restorePlayerMethods: function () {
			this.getPlayer().switchSrc = this.orig_switchSrc;
			this.getPlayer().playerSwitchSource = this.orig_playerSwitchSource;
			this.getPlayer().onSwitchTextTrack = this.orig_onSwitchTextTrack;
			this.getPlayer().load = this.orig_load;
			this.getPlayer().parseTracks = this.orig_parseTracks;
			this.getPlayer().switchAudioTrack = this.orig_switchAudioTrack;
			this.getPlayer()._ondurationchange = this.orig_ondurationchange;
			this.getPlayer().backToLive = this.orig_backToLive;
			this.getPlayer().doSeek = this.orig_doSeek;
			this.getPlayer().updatePlayheadStatus = this.orig_updatePlayheadStatus;
			this.getPlayer().clean = this.orig_clean;
		}
	});

		mw.PluginManager.add('Dash', dash);

		// register dash plugin by default
		var playerConfig = window.kalturaIframePackageData.playerConfig;
		if (playerConfig && playerConfig.plugins && !playerConfig.plugins["dash"]) {
			playerConfig.plugins["dash"] = {
				plugin: true
			};
			mw.setConfig('KalturaSupport.PlayerConfig', playerConfig);
		}
	}
})
(window.mw, window.jQuery, window.shaka);
