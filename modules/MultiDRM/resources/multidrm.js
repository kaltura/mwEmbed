/**
 * Created by itayk on 1/27/15.
 */
( function( mw, $ ) {
	"use strict";

	// Add multidrm player:
	$( mw ).bind( 'EmbedPlayerUpdateMediaPlayers' , function ( event , mediaPlayers ) {
		var multiDRMProtocols = ['video/dash'];
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

	mw.PluginManager.add( 'multidrm', mw.KBasePlugin.extend({

		defaultConfig: {
			asyncInit:true,
			'visible': false,
			'align': "right",
			castlabConfig: {
				"customData": {
					"userId": "purchase" ,
					"sessionId": "p0" ,
					"merchant": "six"
				} ,
				"assetId": "chromecast_debug" ,
				"variantId": null ,
				"authenticationToken": null ,
				"widevineLicenseServerURL": "https://lic.staging.drmtoday.com/license-proxy-widevine/cenc/" ,
				"accessLicenseServerURL": "https://lic.staging.drmtoday.com/flashaccess/LicenseTrigger/v1" ,
				"autoplay": false ,
				"widht":"100%",
				"height":"100%",
				"flashFile": 'http://localhost/dashas/dashas.swf',
				"controls": false ,
				"techs": ["dashjs", "dashas"] ,
				"debug": false
			}
		},
		setup: function( embedPlayer ) {
			var _this = this;
			_this.addBindings();
			//this.setConfig("castlabConfig.width",this.embedPlayer.width);
			//this.setConfig("castlabConfig.height",this.embedPlayer.height);

			this.embedPlayer.config = this.getConfig("castlabConfig");
			$.getScript('http://localhost/video.js' ).then(
				function(){
					$.getScript('http://localhost/cldasheverywhere.min.js')
				} ).then(function(){
					_this.initCompleteCallback();
				});



		},
		addBindings: function(){
			var _this = this;
			this.bind ('playerReady' , function() {
			 	if (_this.embedPlayer.instanceOf === "MultiDRM"){
				    _this.embedPlayer.config = _this.getConfig("castlabConfig");
			    }
			});
		}
	}));
} )( window.mw, window.jQuery );
