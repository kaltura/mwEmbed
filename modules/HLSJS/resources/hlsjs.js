( function( mw, $ , Hls ) {"use strict";

	if (Hls.isSupported() && mw.getConfig("leadWithHlsOnJs")) {
		// Add HLS Logic player:
		mw.setConfig("streamerType", "hls");
		mw.supportsFlash = function () {
			return false;
		};
		$(mw).bind('EmbedPlayerUpdateMediaPlayers', function (event, mediaPlayers) {
			if (Hls.isSupported()) {
				//application/vnd.apple.mpegurl
				var hlsPlayer = new mw.MediaPlayer('hlsPlayer', ['video/h264', 'video/mp4', 'application/vnd.apple.mpegurl'], 'Native');
				mediaPlayers.addPlayer(hlsPlayer);
				mw.EmbedTypes.mediaPlayers.defaultPlayers['application/vnd.apple.mpegurl'] = ['Native'];
			}
		});

		var hlsjs = mw.KBasePlugin.extend({

			defaultConfig: {
				options: {}
			},

			/** @type {Number} */
			mediaErrorRecoveryCounter: 0,
			/** type {boolean} */
			LoadHLS: false,
			/** type {boolean} */
			loaded: false,
			/** type {boolean} */
			isLevelSwitching: false,
			/** type {Number} */
			levelIndex: -1,

			/**
			 * Check is HLS is supported
			 * @returns {boolean}
			 */
			isSafeEnviornment: function () {
				return Hls.isSupported();
			},
			/**
			 * Setup the HLS playback engine wrapper with supplied config options
			 */
			setup: function () {
				this.addBindings();
				//Init the HLS playback engine
				this.hls = new Hls(this.getConfig("options"));
			},
			/**
			 *
			 */
			addBindings: function () {
				this.bind("onSelectSource", this.checkIfHLSNeeded.bind(this));
				this.bind("playerReady", this.initHls.bind(this));
				this.bind("onChangeMedia", this.clean.bind(this));
			},
			/**
			 * Check if HLS engine is required, e.g. sources contain HLS source
			 * @param event
			 * @param sources
			 */
			checkIfHLSNeeded: function (event, sources) {
				var _this = this;
				//Check if sources contain HLS source, if so then raise a flag to init the player
				$.each(sources, function (index, item) {
					if (item.mimeType === "application/vnd.apple.mpegurl") {
						_this.getPlayer().mediaElement.selectedSource = item;
						_this.LoadHLS = true;
					}
				});
			},
			/**
			 * Clean method
			 */
			clean: function () {
				this.LoadHLS = false;
				this.loaded = false;
				this.unRegisterHlsEvents();
				this.restorePlayerMehods();
				this.hls.off(Hls.Events.ERROR);
				this.hls.detachMedia();
				this.hls.destroy();
			},
			/**
			 * Register the playback events and attach the playback engine to the video element
			 */
			initHls: function () {
				if (this.LoadHLS && !this.loaded) {
					this.loaded = true;
					//Reset the error recovery counter
					this.mediaErrorRecoveryCounter = 0;
					//Disable update of video source tag, MSE uses blob urls!
					this.getPlayer().skipUpdateSource = true;

					this.registerHlsEvents();
					this.overridePlayerMethods();

					//Attach video tag to HLS engine
					this.hls.attachMedia(this.getPlayer().getPlayerElement());
				}
			},
			/**
			 * Register HLS playback engine events
			 */
			registerHlsEvents: function () {
				this.hls.on(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached.bind(this));
				this.hls.on(Hls.Events.MANIFEST_PARSED, this.onManifestParsed.bind(this));
				this.hls.on(Hls.Events.FRAG_PARSING_METADATA, this.onFragParsingMetadata.bind(this));
				this.hls.on(Hls.Events.LEVEL_SWITCH, this.onLevelSwitch.bind(this));
				this.hls.on(Hls.Events.FRAG_CHANGED, this.onFragChanged.bind(this));
				this.hls.on(Hls.Events.ERROR, this.onError.bind(this));
			},
			/**
			 * Unregister HLS playback engine events
			 */
			unRegisterHlsEvents: function () {
				this.hls.off(Hls.Events.MEDIA_ATTACHED);
				this.hls.off(Hls.Events.MANIFEST_PARSED);
				this.hls.off(Hls.Events.LEVEL_SWITCH);
				this.hls.off(Hls.Events.FRAG_CHANGED);
				this.hls.off(Hls.Events.ERROR);
			},
			//Event handlers
			/**
			 * Load source after media is attached
			 */
			onMediaAttached: function () {
				//Once media is attached load the manifest
				this.hls.loadSource(this.getPlayer().getSrc());
			},
			/**
			 *
			 * @param event
			 * @param data
			 */
			onFragParsingMetadata: function (data) {
				//TODO: parse ID3 tags
				//data: { samples : [ id3 pes - pts and dts timestamp are relative, values are in seconds]}
			},
			/**
			 * Extract metadata from parsed manifest data, e.g. ABR etc.
			 * @param event
			 * @param data
			 */
			onManifestParsed: function (event, data) {
				this.log("manifest loaded, found " + data.levels.length + " quality level");
				this.addAbrFlavors(data.levels);
			},
			/**
			 * Trigger source switch start handler
			 * @param event
			 * @param data
			 */
			onLevelSwitch: function (event, data) {
				if (this.isLevelSwitching && this.levelIndex == data.level) {
					this.getPlayer().triggerHelper("sourceSwitchingStarted");
				}
			},
			/**
			 * Trigger source switch ended handler
			 * @param event
			 * @param data
			 */
			onFragChanged: function (event, data) {
				if (this.isLevelSwitching &&
					(data && data.frag && (this.levelIndex == data.frag.level))) {
					this.isLevelSwitching = false;
					this.getPlayer().triggerHelper("sourceSwitchingEnd");
				}
			},
			/**
			 * Error handler
			 * @param event
			 * @param data
			 */
			onError: function (event, data) {
				//TODO: Need to decide when we dispatch player bug to be shown to viewer
				if (data.fatal) {
					switch (data.type) {
						case Hls.ErrorTypes.NETWORK_ERROR:
							// try to recover network error
							this.log("fatal network error encountered, try to recover");
							this.hls.startLoad();
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							if (this.mediaErrorRecoveryCounter > 1) {
								//Try to switch audio codec if first recoverMediaError call didn't work
								this.hls.swapAudioCodec();
							}
							this.log("fatal media error encountered, try to recover");
							this.hls.recoverMediaError();
							this.mediaErrorRecoveryCounter += 1;
							break;
						default:
							// cannot recover
							this.hls.destroy();
							break;
					}
				} else {
					//If not fatal then log issue, we can switch case errors for specific issues
					this.log("Error: " + data.type + ", " + data.details);
				}
			},
			/**
			 * Parse ABR data to model
			 * @param levels
			 */
			addAbrFlavors: function (levels) {
				if (levels && levels.length > 1) {
					var flavors = levels.map(function (level, index) {
						var sourceAspect = Math.round(( level.width / level.height ) * 100) / 100;
						// Setup a source object:
						return {
							'data-bandwidth': level.bitrate,
							'data-width': level.width,
							'data-height': level.height,
							'data-aspect': sourceAspect,
							'type': 'video/mp4',
							'data-frameRate': level.frameRate,
							'data-assetid': index
						};
					});
					this.getPlayer().onFlavorsListChanged(flavors);
				}
			},
			/**
			 * Enable override player methods for HLS playback
			 */
			overridePlayerMethods: function () {
				this.orig_backToLive = this.getPlayer().backToLive;
				this.orig_switchSrc = this.getPlayer().switchSrc;
				this.getPlayer().backToLive = this.backToLive.bind(this);
				this.getPlayer().switchSrc = this.switchSrc.bind(this);
			},
			/**
			 * Disable override player methods for HLS playback
			 */
			restorePlayerMehods: function () {
				this.getPlayer().backToLive = this.orig_backToLive;
				this.getPlayer().switchSrc = this.orig_switchSrc;
			},
			//Overidable player methods, "this" is bound to HLS plugin instance!
			/**
			 * Override player method for back to live mode
			 */
			backToLive: function () {
				var _this = this;
				var vid = this.getPlayer().getPlayerElement();
				vid.currentTime = vid.duration;
				//for some reason on Mac the isLive client response is a little bit delayed, so in order to get update
				// liveUI properly, we need to delay "movingBackToLive" helper
				setTimeout(function () {
					_this.getPlayer().triggerHelper('movingBackToLive');
				}, 1000);
			},
			/**
			 * Override player method for source switch
			 * @param source
			 */
			switchSrc: function (source) {
				if (source !== -1) {
					var sourceIndex = this.getPlayer().getSourceIndex(source);
					if (sourceIndex != null) {
						this.isLevelSwitching = true;
						this.levelIndex = sourceIndex;
						if (this.hls.currentLevel == sourceIndex) {
							this.onLevelSwitch(Hls.Events.LEVEL_SWITCH, {level: sourceIndex});
							this.onFragChanged(Hls.Events.LEVEL_LOADED, {frag: {level: sourceIndex}});
						} else {
							this.hls.nextLevel = sourceIndex;
						}
					}
				} else {
					this.hls.nextLevel = -1;
				}
			}

		});

		mw.PluginManager.add('hlsjs', hlsjs);
	}
} )( window.mw, window.jQuery ,window.Hls);