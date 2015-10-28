/**
 * MultiDRM loader
 */
( function( mw, $ ) {
	"use strict";
	var mseSupported = (window['MediaSource'] || window['WebKitMediaSource']);
	//Load 3rd party plugins if DRM sources are available
	mw.addKalturaConfCheck( function( embedPlayer, callback ){
		if( embedPlayer.isPluginEnabled( 'multiDrm' ) ) {
			if (mseSupported) {
				mw.log("Media Source Extensions supported on this browser");
				registerDashPlayer();
				var sources = embedPlayer.getSources();
				var drmSources = sources.filter( function ( source ) {
					return ( ( source.mimeType === "application/dash+xml" ) ||
					( source.mimeType === "video/ism" || source.mimeType === "video/playreadySmooth" && mw.isChrome() &&  !mw.isMobileDevice()) );
				} );
				var isDrmSourceAvailable = drmSources.length > 0;
				if ( isDrmSourceAvailable ) {
					mw.log("Media sources found, loading DASH player");
					var clDashPlayerUrl = embedPlayer.getKalturaConfig( "multiDrm", "clDashPlayerUrl" ) || mw.getMwEmbedPath() + "node_modules/mwEmbed-Dash-Everywhere/video.js";
					var dashJsUrl = embedPlayer.getKalturaConfig( "multiDrm", "dashJsUrl" ) || mw.getMwEmbedPath() + "node_modules/mwEmbed-Dash-Everywhere/cldasheverywhere.min.js";
					if (clDashPlayerUrl && dashJsUrl) {
						$.getScript( clDashPlayerUrl)
							.then(function(){return $.getScript( dashJsUrl)})
							.done(function(){
								mw.log("DASH player loaded, setting configuration");
								//Get user configuration
								var drmUserConfig = embedPlayer.getKalturaConfig("multiDrm");
								//Get default config
								var drmConfig = getDefaultDrmConfig(embedPlayer.kpartnerid);
								//Deep extend custom config
								$.extend(true, drmConfig, drmUserConfig);
								embedPlayer.setKalturaConfig("multiDrm", drmConfig);
								//Set reference for DASH playback engine
								mw.dash = {
									player: videojs
								};
								callback();
							})
							.fail(function( ) {
								mw.log("Error::Playback engine couldn't be found");
								callback();
							});
					} else {
						mw.log("Playback engine couldn't be found, not loading DASH player");
						callback();
					}
				} else {
					mw.log("No media sources found, not loading DASH player");
					callback();
				}
			} else {
				mw.log("Media Source Extensions not supported on this browser");
				callback();
			}
		} else {
			callback();
		}
	});

	function registerDashPlayer(){
		// Add multidrm player:
		$( mw ).bind( 'EmbedPlayerUpdateMediaPlayers' , function ( event , mediaPlayers ) {
			mw.log("Register DASH player and extensions");
			var multiDRMProtocols = ['application/dash+xml'];
			//On chrome add smooth stream mimetype support
			if ( mw.isChrome() &&  !mw.isMobileDevice()) {
				multiDRMProtocols.push( "video/ism" );
				multiDRMProtocols.push( "video/playreadySmooth" );
			}
			var multiDRMPlayer = new mw.MediaPlayer( 'multidrm', multiDRMProtocols, 'MultiDRM' );
			mediaPlayers.addPlayer( multiDRMPlayer );
			// add
			$.each( multiDRMProtocols, function ( inx, mimeType ) {
				if ( mediaPlayers.defaultPlayers[mimeType] ) {
					mediaPlayers.defaultPlayers[mimeType].unshift( 'MultiDRM' );
					return true;
				}
				mediaPlayers.defaultPlayers[mimeType] = ['MultiDRM'];
			} );
		} );
	}

	if (!Array.prototype.filter) {
		Array.prototype.filter = function(fun/*, thisArg*/) {
			'use strict';

			if (this === void 0 || this === null) {
				throw new TypeError();
			}

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== 'function') {
				throw new TypeError();
			}

			var res = [];
			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i];

					// NOTE: Technically this should Object.defineProperty at
					//       the next index, as push can be affected by
					//       properties on Object.prototype and Array.prototype.
					//       But that method's new, and collisions should be
					//       rare, so use the more-compatible alternative.
					if (fun.call(thisArg, val, i, t)) {
						res.push(val);
					}
				}
			}

			return res;
		};
	}

	function getDefaultDrmConfig(partnerId){
		var defaultConfig = {
			"drm": "auto",
			"customData": {
				"userId": partnerId ,
				"sessionId": "castlab-session",
				"merchant": "kaltura"
			},
			"sendCustomData": false,
			"generatePSSH": false,
			"authenticationToken": null ,
			"widevineLicenseServerURL": null,
			"playReadyLicenseServerURL": null,
			"accessLicenseServerURL": null,
			"flashFile": mw.getConfig("EmbedPlayer.dashAsUrl"),
			"techs": ["dashjs", "dashas"] ,
			"debug": false
		};
		return defaultConfig;
	}
} )( window.mediaWiki, window.jQuery );