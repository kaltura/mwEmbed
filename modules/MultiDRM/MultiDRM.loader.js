/**
 * MultiDRM loader
 */
( function( mw, $ ) {
	"use strict";

	// Add multidrm player:
	$( mw ).bind( 'EmbedPlayerUpdateMediaPlayers' , function ( event , mediaPlayers ) {
		var multiDRMProtocols = ['video/dash'];
		//On chrome add smooth stream mimetype support
		if (mw.isChrome()){
			multiDRMProtocols.push("video/ism");
			multiDRMProtocols.push("video/playreadySmooth");
		}
		var multiDRMPlayer = new mw.MediaPlayer( 'multidrm' , multiDRMProtocols , 'MultiDRM' );
		mediaPlayers.addPlayer( multiDRMPlayer );
		// add
		$.each( multiDRMProtocols , function ( inx , mimeType ) {
			if ( mediaPlayers.defaultPlayers[ mimeType ] ) {
				mediaPlayers.defaultPlayers[ mimeType ].push( 'MultiDRM' );
				return true;
			}
			mediaPlayers.defaultPlayers[ mimeType ] = ['MultiDRM'];
		} );
	} );

	function getDrmConfig(config){
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
			"flashFile": 'http://localhost/dashas/dashas.swf',
			"controls": false ,
			"techs": ["dashjs", "dashas"] ,
			"debug": false
		};
		return $.extend(true, defaultConfig, config);
	}

	//Load 3rd party plugins if DRM sources are available
	mw.addKalturaConfCheck( function( embedPlayer, callback ){
		var sources = embedPlayer.getSources();
		var drmSources = sources.filter(function(source){
			return ( ( source.mimeType === "video/dash" ) ||
					( source.mimeType === "video/ism" || source.mimeType === "video/playreadySmooth" && mw.isChrome() ) );
		});
		var isDrmSourceAvailable = drmSources.length > 0;
		if (isDrmSourceAvailable){
			$.getScript('http://localhost/video.js' ).then(
				function(){
					$.getScript('http://localhost/cldasheverywhere.min.js');
				} ).then(function(){
					var drmConfig = getDrmConfig(mw.getConfig("EmbedPlayer.DrmConfig"));
					mw.setConfig("EmbedPlayer.DrmConfig", drmConfig);
					callback();
				});
		} else {
			callback();
		}
		return;
	});

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
} )( window.mediaWiki, window.jQuery );