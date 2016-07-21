(function (mw, $, shaka) {
	"use strict";
	if (!window.Promise) {
		shaka.polyfill.installAll();
	}
	shaka.Player.support().then(function (support) {
		if (support.supported && !mw.isDesktopSafari()) {
			$(mw).bind('EmbedPlayerUpdateMediaPlayers', function (event, mediaPlayers) {
				var shakaPlayer = new mw.MediaPlayer('shakaPlayer', ['application/dash+xml'], 'Native');
				mediaPlayers.addPlayer(shakaPlayer);
				mw.EmbedTypes.mediaPlayers.setMIMETypePlayers('application/dash+xml', 'Native');
			});
			var dash = mw.KBasePlugin.extend({

				/** type {boolean} */
				loaded: false,

				/**
				 * Check is shaka is supported
				 * @returns {boolean}
				 */
				isSafeEnviornment: function () {
					return shaka.Player.support();
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
					this.bind("playerReady", this.initShaka.bind(this));
					this.bind("sourceSwitchingEnd", this.onSwitchAbrTrack.bind(this));
					this.bind("switchAudioTrack", this.onSwitchAudioTrack.bind(this));
					this.bind("selectClosedCaptions", this.onSwitchTextTrack.bind(this));
					//this.bind("sourceSwitchingStarted", function(o,d){debugger});
					//this.bind("SourceChange", function(o,d){debugger});
				},

				/**
				 * Register the playback events and attach the playback engine to the video element
				 */
				initShaka: function () {
					if (!this.loaded) {
						var _this = this;
						//Disable update of video source tag, MSE uses blob urls!
						this.getPlayer().skipUpdateSource = true;

						//Set streamerType to dash
						this.embedPlayer.streamerType = 'dash';

						this.setEmbedPlayerConfig(this.getPlayer());

						// Create a Player instance.
						var player = new shaka.Player(this.getPlayer().getPlayerElement());

						player.configure(this.getConfig("shakaConfig"));

						// Attach player to the window to make it easy to access in the JS console.
						window.player = player;

						// Listen for error events.
						player.addEventListener('error', this.onErrorEvent.bind(this));

						var manifestSrc = this.getPlayer().getSrc();

						// Try to load a manifest.
						player.load(manifestSrc).then(function () {
							//player.load("https://media.axprod.net/TestVectors/v6-MultiDRM/Manifest.mpd").then(function () {
							//	player.load("http://192.168.161.138/test1.mpd").then(function () {
							//player.load("https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd").then(function () {
							// This runs if the asynchronous load is successful.
							_this.log('The video has now been loaded!');
							_this.addTracks();
						}).catch(this.onError.bind(this));  // onError is executed if the asynchronous load fails.
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

				addTracks: function () {
					this.addAbrFlavors();
					this.addAudioTracks();
					this.addSubtitleTracks();
					if (mw.isEdge() || mw.isIE()) {
						// Shaka handles the tracks by itself,
						// so the native player doesn't need to handle them on 'firstPlay'
						this.getPlayer().unbindHelper('firstPlay');
					}
				},

				getTracksByType: function (trackType) {
					var tracks = player.getTracks().filter(function (track) {
						return track.type == trackType;
					});
					return tracks;
				},

				addAbrFlavors: function () {
					var videoTracks = this.getTracksByType("video");
					if (videoTracks && videoTracks.length > 0) {
						var flavors = videoTracks.map(function (rep) {
							var sourceAspect = Math.round(( rep.width / rep.height ) * 100) / 100;
							// Setup a source object:
							return {
								'data-bandwidth': rep.bandwidth,
								'data-width': rep.width,
								'data-height': rep.height,
								'data-aspect': sourceAspect,
								'type': 'video/mp4',
								'data-assetid': rep.id
							};
						});
						this.getPlayer().onFlavorsListChanged(flavors);
					}
				},

				addAudioTracks: function () {
					var audioTracks = this.getTracksByType("audio");
					if (audioTracks && audioTracks.length) {
						var audioTrackData = {languages: []};
						$.each(audioTracks, function (index, audioTrack) {
							audioTrackData.languages.push({
								'kind': 'audioTrack',
								'language': audioTrack.language,
								'srclang': audioTrack.language,
								'label': audioTrack.language,
								'title': audioTrack.language,
								'id': audioTrack.id,
								'index': audioTrackData.languages.length
							});
						});
						this.onAudioTracksReceived(audioTrackData);
					}
				},

				addSubtitleTracks: function () {
					var textTracks = this.getTracksByType("text");
					if (textTracks && textTracks.length) {
						window.VTTCue = this.getPlayer().getOriginalVTTCue();
						var textTrackData = {languages: []};
						$.each(textTracks, function (index, subtitleTrack) {
							textTrackData.languages.push({
								'kind': 'subtitle',
								'language': subtitleTrack.language,
								'srclang': subtitleTrack.language,
								'label': subtitleTrack.language,
								'title': subtitleTrack.language,
								'id': subtitleTrack.id,
								'index': textTrackData.languages.length
							});
						});
						this.onTextTracksReceived(textTrackData);
					}
				},

				onAudioTracksReceived: function (data) {
					this.getPlayer().triggerHelper('audioTracksReceived', data);
				},

				onTextTracksReceived: function (data) {
					this.getPlayer().triggerHelper('textTracksReceived', data);
				},

				onSwitchAbrTrack : function(event, data){
					player.configure({
						abr: {
							enabled:false
						}
					});
				},

				onSwitchAudioTrack: function (event, data) {
					var selectedAudioTracks = this.getTracksByType("audio")[data.index];
					player.configure({
						preferredAudioLanguage: selectedAudioTracks.language
					});
				},

				onSwitchTextTrack: function (event, data) {
					if (data === "Off") {
						player.setTextTrackVisibility(false);
					} else {
						player.configure({
							preferredTextLanguage: data
						});
					}
				},

				onErrorEvent: function (event) {
					// Extract the shaka.util.Error object from the event.
					this.onError(event.detail);
				},

				/**
				 * Error handler
				 * @param event
				 * @param data
				 */
				onError: function (event, data) {
					var errorData = data ? data.type + ", " + data.details : event;
					this.log("Error: " + errorData);
				}

			});

			mw.PluginManager.add('dash', dash);
		}
	});
})(window.mw, window.jQuery, window.shaka);