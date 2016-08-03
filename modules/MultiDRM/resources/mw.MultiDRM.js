(function (mw, $) {
	"use strict";
	var multiDrm = mw.KBasePlugin.extend({

		setup: function () {
			//If both FPS certificate is available and FPS is supported then
			//use hls on native html5 video tag and FPS plugin will handle DRM flow
			var player = this.getPlayer();
			var cert = this.getFpsCertificate(player);
			if (cert && mw.isDesktopSafari()) {
				mw.log("Loading HLS FPS player");
				this.loadHlsFpsHandler().then(function () {
					mw.fps = new mw.FPS(player, function () {
					}, "FPS");
					mw.EmbedTypes.mediaPlayers.removeMIMETypePlayers('video/playreadySmooth', 'Silverlight');
					mw.EmbedTypes.mediaPlayers.removeMIMETypePlayers('video/ism', 'Silverlight');
					player.setupSourcePlayer();
				});
			} else if (this.isCastLabsNeeded()) {
				this.registerCastLabsPlayer();
			}
		},

		isCastLabsNeeded: function () {
			return (mw.isChrome() && !mw.isMobileDevice()) || //for smoothStream over dash
				this.isOldIE() || mw.isDesktopSafari();  //for dash over silverLight
		},

		isOldIE: function () {
			return mw.isIE8() || mw.isIE9() || mw.isIE10Comp();
		},

		getFpsCertificate: function (embedPlayer) {
			var cert = null;
			if (window.kWidgetSupport) {
				cert = window.kWidgetSupport.getFairplayCert({contextData: embedPlayer.kalturaContextData});
			}
			return cert;
		},

		loadHlsFpsHandler: function () {
			var deferred = $.Deferred();
			mw.load(['mw.FPS'], function () {
				deferred.resolve();
			});
			return deferred;
		},

		registerCastLabsPlayer: function () {
			var _this = this;
			$(mw).bind('EmbedPlayerUpdateMediaPlayers', function (event, mediaPlayers) {
				mw.log("Register CastLabs player and extensions");

				_this.setEmbedPlayerConfig(_this.getPlayer());

				var multiDRMProtocols = ["video/ism", "video/playreadySmooth"];
				if (_this.isOldIE() || mw.isDesktopSafari()) {
					multiDRMProtocols.push("application/dash+xml");
				}

				var multiDRMPlayer = new mw.MediaPlayer('multidrm', multiDRMProtocols, 'MultiDRM');
				mediaPlayers.addPlayer(multiDRMPlayer);

				$.each(multiDRMProtocols, function (inx, mimeType) {
					if (mediaPlayers.defaultPlayers[mimeType]) {
						mediaPlayers.defaultPlayers[mimeType].unshift('MultiDRM');
						return true;
					}
					mediaPlayers.defaultPlayers[mimeType] = ['MultiDRM'];
				});
			});
		},

		setEmbedPlayerConfig: function (embedPlayer) {
			//Get user configuration
			var drmUserConfig = embedPlayer.getKalturaConfig("multiDrm");
			//Get default config
			var drmConfig = this.getDefaultDrmConfig(embedPlayer.kpartnerid);
			//Deep extend custom config
			$.extend(true, drmConfig, drmUserConfig);
			embedPlayer.setKalturaConfig("multiDrm", drmConfig);
			return drmConfig;
		},

		getDefaultDrmConfig: function (partnerId) {
			var defaultConfig = {
				"drm": "auto",
				"customData": {
					"userId": partnerId,
					"sessionId": "castlab-session",
					"merchant": "kaltura"
				},
				"sendCustomData": false,
				"generatePSSH": false,
				"authenticationToken": null,
				"widevineLicenseServerURL": null,
				"playReadyLicenseServerURL": null,
				"accessLicenseServerURL": null,
				"flashFile": mw.getConfig("EmbedPlayer.dashAsUrl") || mw.getMwEmbedPath() + "node_modules/mwEmbed-Dash-Everywhere/dashas/dashas.swf",
				"silverlightFile": mw.getConfig("EmbedPlayer.dashCsUrl") || mw.getMwEmbedPath() + "node_modules/mwEmbed-Dash-Everywhere/dashcs/dashcs.xap",
				"techs": ( mw.isFirefox() || mw.isDesktopSafari() ) ? ["dashcs"] : ["dashjs", "dashcs"],
				"debug": false
			};
			return defaultConfig;
		}
	});

	mw.PluginManager.add('multiDrm', multiDrm);

})(window.mw, window.jQuery);