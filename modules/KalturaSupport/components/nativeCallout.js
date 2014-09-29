( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({
		defaultConfig: {
			"storeUrl": null,
			"mimeName": null,
			"iframeUrl": null
		},

		IOS_STORE_URL: "http://itunes.apple.com/app/id698657294",
		ANDROID_STORE_URL: "market://details?=com.kaltura.kalturaplayertoolkit",
		IOS_MIME_NAME: "kalturaPlayerToolkit://",
		ANDROID_MIME_NAME: "http://kalturaplayertoolkit.com",

		setup: function(){
			// Bind player
			this.addBindings();
			if( !this.getConfig( "storeUrl" ) ) {
				this.setConfig( "storeUrl", mw.isAndroid() ? this.ANDROID_STORE_URL : this.IOS_STORE_URL );
			}

			if( !this.getConfig( "mimeName" ) ) {
				this.setConfig( "mimeName", mw.isAndroid() ? this.ANDROID_MIME_NAME : this.IOS_MIME_NAME );
			}

			if( !this.getConfig( "iframeUrl" ) ) {
				var chromecastPluginFlashvar = "&flashvars[chromecast.plugin]=true";
				this.setConfig( "iframeUrl", encodeURI( this.embedPlayer.getIframeSourceUrl() + chromecastPluginFlashvar ) );
			}
		},
		isSafeEnviornment: function(){
			return mw.isMobileDevice() === true;
		},
		addBindings: function() {
			var _this = this;
			this.bind('nativePlayCallout', function(event, nativeCalloutPlugin) {

				if( !nativeCalloutPlugin.exist ) {
					nativeCalloutPlugin.exist = true;
				}

				_this.calloutNativePlayer();
			});
		},

		// New "doPlay" implementation when nativeCallout plugin exist on mobile devices
		calloutNativePlayer: function() {
			var _this = this;
			var timeout;

			function preventPopup() {
				clearTimeout(timeout);
				timeout = null;
				window.removeEventListener( 'pagehide', preventPopup );
			}

			var url =  _this.getConfig( "mimeName" ) + "?iframeUrl:=" + _this.getConfig( "iframeUrl" );
			if ( mw.isAndroid() ) {
				window.open( url, "_system" );
			} else {
				$('<iframe />')
					.attr('src', url)
					.attr('style', 'display:none;')
					.appendTo('body');

				timeout = setTimeout(function() {
					document.location = _this.getConfig( "storeUrl" );
				}, 500);
				window.addEventListener( 'pagehide', preventPopup );
			}
		}
	}));

} )( window.mw, window.jQuery );