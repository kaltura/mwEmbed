( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({
		defaultConfig: {
			"storeUrl": null,
			"appUrl": null,
			"iframeUrl": null
		},
		setup: function(){
			// Bind player
			this.addBindings();

			if( !this.getConfig( "storeUrl" ) && mw.isIOS() ) {
				this.setConfig( "storeUrl", "http://itunes.apple.com/app/id698657294" );
			}

			if( !this.getConfig( "appUrl" ) && mw.isIOS() ) {
				this.setConfig( "appUrl", "kalturaPlayerToolkit://" );
			}

			if( !this.getConfig( "iframeUrl" ) ) {
				this.setConfig( "iframeUrl", this.embedPlayer.getIframeSourceUrl() );
			}
		},
		isSafeEnviornment: function(){
			return mw.isIOS() === true;
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

			$('<iframe />')
				.attr('src', _this.getConfig( "appUrl" ) + "?iframeUrl=" + _this.getConfig( "iframeUrl" ))
				.attr('style', 'display:none;')
				.appendTo('body');

			timeout = setTimeout(function() {
				document.location = _this.getConfig( "storeUrl" );
			}, 500);
			window.addEventListener( 'pagehide', preventPopup );

			function preventPopup() {
				clearTimeout(timeout);
				timeout = null;
				window.removeEventListener( 'pagehide', preventPopup );
			}
		}
	}));

} )( window.mw, window.jQuery );