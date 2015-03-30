/**
 * MultiDRM loader
 */
( function( mw, $ ) {
	"use strict";
	//Load 3rd party plugins if DRM sources are available
	mw.addKalturaConfCheck( function( embedPlayer, callback ){
		if( embedPlayer.isPluginEnabled( 'multiDrm' ) ) {
			registerDashPlayer();
			var sources = embedPlayer.getSources();
			var drmSources = sources.filter( function ( source ) {
				return ( ( source.mimeType === "video/dash" ) ||
				( source.mimeType === "video/ism" || source.mimeType === "video/playreadySmooth" && mw.isChrome() ) );
			} );
			var isDrmSourceAvailable = drmSources.length > 0;
			if ( isDrmSourceAvailable ) {
				$.when(
					$.getScript( mw.getConfig( "EmbedPlayer.clDashPlayerUrl" ) ),
					$.getScript( mw.getConfig( "EmbedPlayer.dashJsUrl" ) ),
					$.Deferred( function ( deferred ) {
						$( deferred.resolve );
					} )
				).done( function () {
						//Get user configuration
						var drmUserConfig = embedPlayer.getKalturaConfig("multiDrm");
						//Get default config
						var drmConfig = getDefaultDrmConfig();
						//Deep extend custom config
						$.extend(true, drmConfig, drmUserConfig);
						embedPlayer.setKalturaConfig("multiDrm", drmConfig);
						//Set reference for DASH playback engine
						mw.dash = {
							player: videojs
						};
						callback();
					} );
			} else {
				callback();
			}
		} else {
			callback();
		}
	});

	function registerDashPlayer(){
		// Add multidrm player:
		$( mw ).bind( 'EmbedPlayerUpdateMediaPlayers' , function ( event , mediaPlayers ) {
			var multiDRMProtocols = ['video/dash'];
			//On chrome add smooth stream mimetype support
			if ( mw.isChrome() ) {
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

	function getDefaultDrmConfig(){
		var defaultConfig = {
			"drm": "auto",
			"customData": {
				"userId": null ,
				"sessionId": "castlab-session" ,
				"merchant": "kaltura"
			},
			"sendCustomData": true,
			"assetId": null , //coguid //entryid
			"variantId": null , //flavorid
			"authenticationToken": null ,
			"widevineLicenseServerURL": null,
			"accessLicenseServerURL": null,
			"autoplay": false,
			"widht":"100%",
			"height":"100%",
			"flashFile": mw.getConfig("EmbedPlayer.dashAsUrl"),
			"controls": false ,
			"techs": ["dashjs", "dashas"] ,
			"debug": false
		};
		return defaultConfig;
	}
} )( window.mediaWiki, window.jQuery );