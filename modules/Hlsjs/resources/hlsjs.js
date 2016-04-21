( function( mw, $ , Hls ) {"use strict";

	//Currently use native support when available, e.g. Safari desktop and Edge
	if (Hls.isSupported() && !mw.isDesktopSafari() && !mw.isEdge() && mw.getConfig("LeadWithHLSOnJs")) {
		// Add HLS Logic player:
		//Force HLS streamer type
		mw.setConfig("streamerType", "hls");
		var config = mw.config.get("KalturaSupport.PlayerConfig");
		config.vars.streamerType = "hls";
		mw.config.set("KalturaSupport.PlayerConfig", config);
		var orig_supportsFlash = mw.supportsFlash;
		mw.supportsFlash = function () {
			return false;
		};
		$(mw).bind('EmbedPlayerUpdateMediaPlayers', function (event, mediaPlayers) {
			if (Hls.isSupported()) {
				//application/vnd.apple.mpegurl
				var hlsPlayer = new mw.MediaPlayer('hlsPlayer', ['video/h264', 'video/mp4', 'application/vnd.apple.mpegurl'], 'Native');
				mediaPlayers.addPlayer(hlsPlayer);
				mw.EmbedTypes.mediaPlayers.setMIMETypePlayers('application/vnd.apple.mpegurl', 'Native');
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
				this.log("version: " + Hls.version );
				mw.setConfig('isHLS_JS', true);
				this.addBindings();
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
				this.log("Clean");
				this.LoadHLS = false;
				this.loaded = false;
				this.unRegisterHlsEvents();
				this.restorePlayerMethods();
				this.hls.detachMedia();
				this.hls.destroy();
				this.hls = null;
			},
			/**
			 * Register the playback events and attach the playback engine to the video element
			 */
			initHls: function () {
				if (this.LoadHLS && !this.loaded) {
					this.log("Init");
					//Set streamerType to hls
					this.embedPlayer.streamerType = 'hls';
					//Init the HLS playback engine
					this.hls = new Hls(this.getConfig("options"));

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
				this.onMediaAttachedHandler = this.onMediaAttached.bind(this);
				this.hls.on(Hls.Events.MEDIA_ATTACHED, this.onMediaAttachedHandler);
				this.onManifestParsedHandler = this.onManifestParsed.bind(this);
				this.hls.on(Hls.Events.MANIFEST_PARSED, this.onManifestParsedHandler);
				this.onFragParsingMetadataHandler = this.onFragParsingMetadata.bind(this);
				this.hls.on(Hls.Events.FRAG_PARSING_METADATA, this.onFragParsingMetadataHandler);
				this.onLevelSwitchHandler = this.onLevelSwitch.bind(this);
				this.hls.on(Hls.Events.LEVEL_SWITCH, this.onLevelSwitchHandler);
				this.onFragChangedHandler = this.onFragChanged.bind(this);
				this.hls.on(Hls.Events.FRAG_CHANGED, this.onFragChangedHandler);
				this.onErrorHandler = this.onError.bind(this);
				this.hls.on(Hls.Events.ERROR, this.onErrorHandler);
			},
			/**
			 * Unregister HLS playback engine events
			 */
			unRegisterHlsEvents: function () {
				this.hls.off(Hls.Events.MEDIA_ATTACHED, this.onMediaAttachedHandler);
				this.onMediaAttachedHandler = null;
				this.hls.off(Hls.Events.MANIFEST_PARSED, this.onManifestParsedHandler);
				this.onManifestParsedHandler = null;
				this.hls.off(Hls.Events.FRAG_PARSING_METADATA, this.onFragParsingMetadataHandler);
				this.onFragParsingMetadataHandler = null;
				this.hls.off(Hls.Events.LEVEL_SWITCH, this.onLevelSwitchHandler);
				this.onLevelSwitchHandler = null;
				this.hls.off(Hls.Events.FRAG_CHANGED, this.onFragChangedHandler);
				this.onFragChangedHandler = null;
				this.hls.off(Hls.Events.ERROR, this.onErrorHandler);
				this.onErrorHandler = null;
			},
			//Event handlers
			/**
			 * Load source after media is attached
			 */
			onMediaAttached: function () {
				this.log("Media attached");
				//Once media is attached load the manifest
				var selectedSource = this.getPlayer().getSrc();
				this.getPlayer().resolveSrcURL( selectedSource ).then( function(source){
					this.hls.loadSource(source);
				}.bind(this));
			},
			/**
			 *
			 * @param event
			 * @param data
			 */
			onFragParsingMetadata: function (e, data) {
				//data: { samples : [ id3 pes - pts and dts timestamp are relative, values are in seconds]}

				//Get the data from the event + Unicode transform
				var id3TagData = String.fromCharCode.apply( null, new Uint8Array( data.samples[data.samples.length-1].data ) );
				//Get the JSON substring
				var id3TagString=id3TagData.substring(id3TagData.indexOf("{"), id3TagData.lastIndexOf("}")+1);
				//Parse JSON
				var id3Tag=JSON.parse(id3TagString);

				this.getPlayer().triggerHelper('onId3Tag', id3Tag);
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
				//Set and report bitrate change
				var source = this.hls.levels[data.level];
				this.getPlayer().currentBitrate = source.bitrate/ 1024;
				this.getPlayer().triggerHelper('bitrateChange', this.getPlayer().currentBitrate);
				//Notify sourceSwitchingStarted
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
				if ( data && data.frag && data.frag.duration){
					this.fragmentDuration = data.frag.duration;
				}
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
								this.log("fatal media error encountered, try to recover - switch audio codec");
								//Try to switch audio codec if first recoverMediaError call didn't work
								this.hls.swapAudioCodec();
							}
							this.log("fatal media error encountered, try to recover");
							this.hls.recoverMediaError();
							this.mediaErrorRecoveryCounter += 1;
							break;
						default:
							// cannot recover
							this.log("fatal media error encountered, cannot recover");
							this.clean();
							if( mw.supportsFlash() ) {
								this.log("Try flash fallback");
								this.fallbackToFlash();
							} else {
								mw.log("MediaError error code: " + error);
								this.triggerHelper('embedPlayerError', [ data ]);
							}
							break;
					}
				} else {
					//If not fatal then log issue, we can switch case errors for specific issues
					this.log("Error: " + data.type + ", " + data.details);
				}
			},
			fallbackToFlash: function(){
				//In case HLS js fails fallback to Flash OSMF if applicable
				//1. Remove hls from native players
				//2. Add Flash player
				//3. Set flag to force HLS on flash and not on JS
				//4. Stop current media playback
				//5. Set autoplay to restart playback after flash engine is loaded
				//6. Call setupSourcePlayer to reload playback engine
				mw.EmbedTypes.mediaPlayers.removeMIMETypePlayers('application/vnd.apple.mpegurl', 'Native');
				mw.EmbedTypes.mediaPlayers.setMIMETypePlayers('application/vnd.apple.mpegurl', 'Kplayer');
				mw.EmbedTypes.addFlashPlayer();
				var embedPlayer = this.getPlayer();
				embedPlayer.setKalturaConfig("", "LeadWithHLSOnJs", false);
				embedPlayer.setKalturaConfig("", "LeadWithHLSOnFlash", true);
				embedPlayer.stop();
				embedPlayer.autoplay = true;
				embedPlayer.setupSourcePlayer();
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
					this.getPlayer().setKDPAttribute('sourceSelector', 'visible', true);
					this.getPlayer().onFlavorsListChanged(flavors);
				}
			},
			/**
			 * Enable override player methods for HLS playback
			 */
			overridePlayerMethods: function () {
				this.orig_backToLive = this.getPlayer().backToLive;
				this.orig_switchSrc = this.getPlayer().switchSrc;
				this.orig_changeMediaCallback = this.getPlayer().changeMediaCallback;
				this.orig_load = this.getPlayer().load;
				this.getPlayer().backToLive = this.backToLive.bind(this);
				this.getPlayer().switchSrc = this.switchSrc.bind(this);
				this.getPlayer().changeMediaCallback = this.changeMediaCallback.bind(this);
				this.getPlayer().load = this.load.bind(this);
			},
			/**
			 * Disable override player methods for HLS playback
			 */
			restorePlayerMethods: function () {
				this.getPlayer().backToLive = this.orig_backToLive;
				this.getPlayer().switchSrc = this.orig_switchSrc;
				this.getPlayer().changeMediaCallback = this.orig_changeMediaCallback;
				this.getPlayer().load = this.orig_load;
				mw.supportsFlash = orig_supportsFlash;
			},
			//Overidable player methods, "this" is bound to HLS plugin instance!
			/**
			 * Override player method for back to live mode
			 */
			backToLive: function () {
				var _this = this;
				var vid = this.getPlayer().getPlayerElement();
				this.embedPlayer.goingBackToLive = true;
				vid.currentTime = vid.duration - (this.fragmentDuration || 10) * 3;
				//for some reason on Mac the isLive client response is a little bit delayed, so in order to get update
				// liveUI properly, we need to delay "movingBackToLive" helper
				setTimeout(function () {
					_this.getPlayer().triggerHelper('movingBackToLive');
					_this.embedPlayer.goingBackToLive = false;
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
							this.getPlayer().currentBitrate = source.getBitrate();
							this.getPlayer().triggerHelper('bitrateChange', source.getBitrate());
						} else {
							this.hls.nextLevel = sourceIndex;
						}
					}
				} else {
					this.hls.nextLevel = -1;
				}
			},
			/**
			 * Override player method for loading the video element
			 */
			load: function(){
				this.hls.startLoad();
			},
			/**
			 * Override player callback after changing media
			 */
			changeMediaCallback: function(){
				this.getPlayer().play();
				this.getPlayer().changeMediaStarted = false;
				this.getPlayer().triggerHelper('onChangeMediaDone');
			}
		});

		mw.PluginManager.add('hlsjs', hlsjs);
	}
} )( window.mw, window.jQuery ,window.Hls);