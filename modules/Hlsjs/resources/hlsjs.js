(function (mw, $, Hls) {
	"use strict";

	//Currently use native support when available, e.g. Safari desktop
	if (Hls.isSupported() && !mw.isDesktopSafari() && !mw.getConfig("disableHLSOnJs")) {
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
				options: {
					//debug:true
					liveSyncDurationCount: 3,
					liveMaxLatencyDurationCount: 6
				},
				hlsLogs: false
			},

			/** @type {Number} */
			mediaErrorRecoveryCounter: 0,
			playerErrorRecoveryCounter: 0,

			debugInfoInterval: 4,
			debugInfoCounter: 0,

			/** type {boolean} */
			LoadHLS: false,
			/** type {boolean} */
			loaded: false,
			/** type {boolean} */
			isLevelSwitching: false,
			/** type {Number} */
			levelIndex: -1,
			version: "v0.5.23",

			/** type {Object} */
			ptsID3Data: {},

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
				this.log("version: " + Hls.version ? Hls.version : this.version);
				mw.setConfig('isHLS_JS', true);
				this.addBindings();
			},
			/**
			 *
			 */
			addBindings: function () {
				this.bind("SourceChange", this.isNeeded.bind(this));
				this.bind("playerReady", this.initHls.bind(this));
				this.bind("seeking", this.onSeekBeforePlay.bind(this));
				this.bind("onChangeMedia", this.clean.bind(this));
				this.bind("onLiveOffSynchChanged", this.onLiveOffSyncChanged.bind(this));
				if (mw.getConfig("hlsLogs")) {
					this.bind("monitorEvent", this.monitorDebugInfo.bind(this));
				}
			},
			/**
			 * Check if HLS engine is required, e.g. the selected source is HLS
			 */
			isNeeded: function () {
				if (this.getPlayer().mediaElement.selectedSource.mimeType === "application/vnd.apple.mpegurl") {
					this.LoadHLS = true;
				} else {
					this.LoadHLS = false;
				}
			},
			/**
			 * Clean method
			 */
			clean: function () {
				this.log("Clean");
				if (this.LoadHLS && this.loaded) {
					this.LoadHLS = false;
					this.loaded = false;
					this.unRegisterHlsEvents();
					this.restorePlayerMethods();
					this.hls.detachMedia();
					this.hls.destroy();
					this.hls = null;
				}
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

					this.bind("firstPlay", function () {
						this.unbind("seeking");
						this.hls.attachMedia(this.getPlayer().getPlayerElement());
					}.bind(this));
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
				this.onFragLoadingHandler = this.onFragLoading.bind(this);
				this.hls.on(Hls.Events.FRAG_LOADING, this.onFragLoadingHandler);
				this.onFragLoadedHandler = this.onFragLoaded.bind(this);
				this.hls.on(Hls.Events.FRAG_LOADED, this.onFragLoadedHandler);
				this.onFragParsingMetadataHandler = this.onFragParsingMetadata.bind(this);
				this.hls.on(Hls.Events.FRAG_PARSING_METADATA, this.onFragParsingMetadataHandler);
				this.onFragParsingDataHandler = this.onFragParsingData.bind(this);
				this.hls.on(Hls.Events.FRAG_PARSING_DATA, this.onFragParsingDataHandler);
				this.onPTSUpdatedHandler = this.onPTSUpdated.bind(this);
				this.hls.on(Hls.Events.LEVEL_PTS_UPDATED, this.onPTSUpdatedHandler);
				this.onFragBufferedHandler = this.onFragBuffered.bind(this);
				this.hls.on(Hls.Events.FRAG_BUFFERED, this.onFragBufferedHandler);
				this.onLevelSwitchHandler = this.onLevelSwitch.bind(this);
				this.hls.on(Hls.Events.LEVEL_SWITCH, this.onLevelSwitchHandler);
				this.onFragChangedHandler = this.onFragChanged.bind(this);
				this.hls.on(Hls.Events.FRAG_CHANGED, this.onFragChangedHandler);
				this.onErrorHandler = this.onError.bind(this);
				this.hls.on(Hls.Events.ERROR, this.onErrorHandler);
				this.onDropFramesHandler = this.onDropFrames.bind(this);
				this.hls.on(Hls.Events.FPS_DROP, this.onDropFramesHandler);
			},
			/**
			 * Unregister HLS playback engine events
			 */
			unRegisterHlsEvents: function () {
				this.hls.off(Hls.Events.MEDIA_ATTACHED, this.onMediaAttachedHandler);
				this.onMediaAttachedHandler = null;
				this.hls.off(Hls.Events.MANIFEST_PARSED, this.onManifestParsedHandler);
				this.onManifestParsedHandler = null;
				this.hls.off(Hls.Events.FRAG_LOADING, this.onFragLoadingHandler);
				this.onFragLoadingHandler = null;
				this.hls.off(Hls.Events.FRAG_LOADED, this.onFragLoadedHandler);
				this.onFragLoadedHandler = null;
				this.hls.off(Hls.Events.FRAG_PARSING_METADATA, this.onFragParsingMetadataHandler);
				this.onFragParsingMetadataHandler = null;
				this.hls.off(Hls.Events.FRAG_PARSING_DATA, this.onFragParsingDataHandler);
				this.onFragParsingDataHandler = null;
				this.hls.off(Hls.Events.LEVEL_PTS_UPDATED, this.onPTSUpdatedHandler);
				this.onPTSUpdatedHandler = null;
				this.hls.off(Hls.Events.FRAG_BUFFERED, this.onFragBufferedHandler);
				this.onFragBufferedHandler = null;
				this.hls.off(Hls.Events.LEVEL_SWITCH, this.onLevelSwitchHandler);
				this.onLevelSwitchHandler = null;
				this.hls.off(Hls.Events.FRAG_CHANGED, this.onFragChangedHandler);
				this.onFragChangedHandler = null;
				this.hls.off(Hls.Events.ERROR, this.onErrorHandler);
				this.onErrorHandler = null;
				this.hls.off(Hls.Events.FPS_DROP, this.onDropFramesHandler);
				this.onDropFramesHandler = null;
			},
			//Event handlers
			/**
			 * Load source after media is attached
			 */
			onMediaAttached: function () {
				this.log("Media attached");
				//Once media is attached load the manifest
				var selectedSource = this.getPlayer().getSrc();
				if (selectedSource) {
					this.getPlayer().resolveSrcURL(selectedSource).then(
						function (source) {
							this.hls.loadSource(source);
						}.bind(this),
						function () { //error
							this.hls.loadSource(selectedSource);
						}.bind(this)
					);
				}
			},
			onFragLoading: function (e, data) {
				//fired when a fragment loading starts
				//data: { frag : fragment object}
				this.getPlayer().triggerHelper('hlsFragLoading', data.frag.url);
				//mw.log("hlsjs :: onFragLoading | url = "+data.frag.url);

			},
			onFragLoaded: function (e, data) {
				//fired when a fragment loading is completed
				//data: { frag : fragment object, payload : fragment payload, stats : { trequest, tfirst, tload, length}}
				this.getPlayer().triggerHelper('hlsFragLoaded', data.frag.url);
				//mw.log("hlsjs :: onFragLoaded | url = "+data.frag.url);

			},
			onFragParsingMetadata: function (e, data) {
				//data: { samples : [ id3 pes - pts and dts timestamp are relative, values are in seconds]}
				data.samples.forEach(function(sample){
					//Get the data from the event + Unicode transform
					var sampleData = String.fromCharCode.apply(null, new Uint8Array(sample.data));
					//Get the JSON substring
					var sampleString = sampleData.substring(sampleData.indexOf("{"), sampleData.lastIndexOf("}") + 1);
					//Parse JSON
					var id3Tag = JSON.parse(sampleString);
					//store ID3 data, use rounded pts value
					this.ptsID3Data[Math.round(sample.pts)] = id3Tag;
				}.bind(this));
			},
			onFragParsingData: function (e, data) {
				//fired when moof/mdat have been extracted from fragment
				//data: { moof : moof MP4 box, mdat : mdat MP4 box, startPTS : PTS of first sample, endPTS : PTS of last sample, startDTS : DTS of first sample, endDTS : DTS of last sample, type : stream type (audio or video), nb : number of samples}
				this.getPlayer().triggerHelper('hlsFragParsingData', data);
				/*
				 if(data.type === 'video') {
				 mw.log("hlsjs :: onFragParsingData | startPTS = " + mw.seconds2npt(data.startPTS) + " >> endPTS = " + mw.seconds2npt(data.endPTS) + " | startDTS = " + mw.seconds2npt(data.startDTS) + " >> endDTS = " + mw.seconds2npt(data.endDTS));
				 }
				 */
			},
			onPTSUpdated: function (e, data) {
				//fired when a level's PTS information has been updated after parsing a fragment
				//data: { details : levelDetails object, level : id of updated level, drift: PTS drift observed when parsing last fragment }
				this.getPlayer().triggerHelper('hlsUpdatePTS', data);
				//mw.log("hlsjs :: onPTSUpdated");
			},
			onFragBuffered: function (e, data) {
				//fired when fragment remuxed MP4 boxes have all been appended into SourceBuffer
				//data: { frag : fragment object, stats : { trequest, tfirst, tload, tparsed, tbuffered, length} }
				this.getPlayer().triggerHelper('hlsFragBuffered', data.frag.url);
				//mw.log("hlsjs :: onFragBuffered | url = "+data.frag.url);
			},
			onDropFrames: function (e, data) {
				//triggered when FPS drop in last monitoring period is higher than given threshold
				//data: {curentDropped : nb of dropped frames in last monitoring period, currentDecoded: nb of decoded frames in last monitoring period, totalDropped : total dropped frames on this video element}
				this.getPlayer().triggerHelper('hlsDropFPS', data.totalDropped);
				mw.log("hlsjs :: onDropFrames | totalDropped = " + data.totalDropped);
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
				var currentBitrate = source.bitrate / 1024;
				var previousBitrate = this.getPlayer().currentBitrate;
				this.getPlayer().currentBitrate = currentBitrate;
				this.getPlayer().triggerHelper('bitrateChange', currentBitrate);
				//Notify sourceSwitchingStarted
				if (this.isLevelSwitching && this.levelIndex == data.level) {
					this.getPlayer().triggerHelper("sourceSwitchingStarted", previousBitrate);
				}
				//fire debug info
				this.getPlayer().triggerHelper('hlsCurrentBitrate', currentBitrate);
				mw.log("hlsjs :: onLevelSwitch | level = " + data.level + " | current bitrate = " + currentBitrate);
			},
			/**
			 * Trigger source switch ended handler
			 * @param event
			 * @param data
			 */
			onFragChanged: function (event, data) {
				//fired when fragment matching with current video position is changing
				//data: { frag : fragment object }
				if (data && data.frag) {
					if (data.frag.duration) {
						this.fragmentDuration = data.frag.duration;
					}

					if (this.isLevelSwitching &&
						( this.levelIndex == data.frag.level)) {
						this.isLevelSwitching = false;
						this.getPlayer().triggerHelper("sourceSwitchingEnd", this.getPlayer().currentBitrate);
					}

					this.getPlayer().triggerHelper('hlsFragChanged', data.frag);
					//mw.log("hlsjs :: onFragChanged | startPTS = " + mw.seconds2npt(data.frag.startPTS) + " >> endPTS = " + mw.seconds2npt(data.frag.endPTS) + " | url = " + data.frag.url);
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
							if (mw.supportsFlash()) {
								this.log("Try flash fallback");
								this.fallbackToFlash();
							} else {
								mw.log("MediaError error code: " + error);
								this.triggerHelper('embedPlayerError', [data]);
							}
							break;
					}
				} else {
					switch (data.details) {
						case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
							this.getPlayer().bufferStart();
							break;
					}
					//If not fatal then log issue, we can switch case errors for specific issues
					this.log("Error: " + data.type + ", " + data.details);
				}
			},
			fallbackToFlash: function () {
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
				this.orig_playerSwitchSource = this.getPlayer().playerSwitchSource;
				this.orig_load = this.getPlayer().load;
				this.orig_onerror = this.getPlayer()._onerror;
				this.orig_ontimeupdate = this.getPlayer()._ontimeupdate;
				this.getPlayer().backToLive = this.backToLive.bind(this);
				this.getPlayer().switchSrc = this.switchSrc.bind(this);
				this.getPlayer().playerSwitchSource = this.playerSwitchSource.bind(this);
				this.getPlayer().load = this.load.bind(this);
				this.getPlayer()._onerror = this._onerror.bind(this);
				this.getPlayer()._ontimeupdate = this._ontimeupdate.bind(this);
			},
			/**
			 * Disable override player methods for HLS playback
			 */
			restorePlayerMethods: function () {
				this.getPlayer().backToLive = this.orig_backToLive;
				this.getPlayer().switchSrc = this.orig_switchSrc;
				this.getPlayer().playerSwitchSource = this.orig_playerSwitchSource;
				this.getPlayer().load = this.orig_load;
				this.getPlayer()._onerror = this.orig_onerror;
				this.getPlayer()._ontimeupdate = this.orig_ontimeupdate;
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

			onLiveOffSyncChanged: function (event, status) {
				if (this.getConfig("options") && !this.defaultLiveMaxLatencyDurationCount) {
					// Storing the default value as it configured in the defaultConfig for backing to live
					this.defaultLiveMaxLatencyDurationCount = this.getConfig("options").liveMaxLatencyDurationCount;
				}
				if (status) { // going to offSync - liveMaxLatencyDurationCount should be infinity
					this.hls.config.liveMaxLatencyDurationCount = Hls.DefaultConfig["liveMaxLatencyDurationCount"];
				} else { // back to live - restore the default as it configured in the defaultConfig
					this.hls.config.liveMaxLatencyDurationCount = this.defaultLiveMaxLatencyDurationCount;
				}
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
			load: function () {
				if(!this.getPlayer().isInSequence()){
					this.hls.startLoad();
				}
			},
			/**
			 * Override player callback after changing media
			 */
			playerSwitchSource: function (src, switchCallback, doneCallback) {
				this.getPlayer().play();
				if ($.isFunction(switchCallback)) {
					switchCallback();
				}
			},
			/**
			 * Override player method for playback error
			 */
			_onerror: function (evt) {
				var errorTxt, mediaError = evt.currentTarget.error;
				switch (mediaError.code) {
					case mediaError.MEDIA_ERR_ABORTED:
						errorTxt = "You aborted the video playback";
						break;
					case mediaError.MEDIA_ERR_DECODE:
						errorTxt = "The video playback was aborted due to a corruption problem or because the video used features your browser did not support. Trying to handle MediaError.";
						this.handleMediaError();
						break;
					case mediaError.MEDIA_ERR_NETWORK:
						errorTxt = "A network error caused the video download to fail part-way";
						break;
					case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
						errorTxt = "The video could not be loaded, either because the server or network failed or because the format is not supported";
						break;
				}
				mw.log("HLS.JS ERROR: " + errorTxt);
			},

			_ontimeupdate: function(e){
				this.getPlayer().triggerHelper(e.type, e);
				var time = Math.round(e.currentTarget.currentTime);
				if (this.ptsID3Data[time]){
					this.getPlayer().triggerHelper('onId3Tag', this.ptsID3Data[time]);
				}
			},

			onSeekBeforePlay: function(){
				if(this.LoadHLS){
					this.unbind("seeking");
					this.unbind("firstPlay");
					this.hls.attachMedia(this.getPlayer().getPlayerElement());
				}
			},

			handleMediaError: function () {
				if (this.canRecover()) {
					this.hls.recoverMediaError();
				}
			},

			canRecover: function () {
				if (this.playerErrorRecoveryCounter > 2) {
					this.playerErrorRecoveryCounter = 0;
					return false;
				}
				this.playerErrorRecoveryCounter += 1;
				return true;
			},

			monitorDebugInfo: function () {
				//each second trigger debug info: buffer length, dropped frames, current FPS
				this.debugInfoCounter++;
				if (this.debugInfoCounter === this.debugInfoInterval) {
					this.debugInfoCounter = 0;
					this.getPlayer().triggerHelper('hlsCurrentBuffer', mw.seconds2npt(this.getPlayer().getCurrentBufferLength()));

					//only webkit browsers expose dropped frames parameter
					if (mw.isChrome() || mw.isDesktopSafari()) {
						this.getPlayer().triggerHelper('hlsDroppedFrames', this.getPlayer().getPlayerElement().webkitDroppedFrameCount);
					} else {
						this.getPlayer().triggerHelper('hlsDroppedFrames', 'not supported');
					}

					//HTML5 video tag does not support real fps metric yet
					this.getPlayer().triggerHelper('hlsFPS', 'not supported');
				}
			}
		});

		mw.PluginManager.add('hlsjs', hlsjs);
	}
})(window.mw, window.jQuery, window.Hls);
