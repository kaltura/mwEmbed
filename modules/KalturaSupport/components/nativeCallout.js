( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({
		defaultConfig: {

		},
		setup: function(){
			// Bind player
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return mw.isMobileDevice() === true;
		},
		addBindings: function() {
			var _this = this;
			this.bind('nativeCallout', function(event, nativeCalloutPlugin) {
				if( !nativeCalloutPlugin.exist ) {
					nativeCalloutPlugin.exist = true;
				}

				_this.calloutNativePlayer();
			});
		},

		// New "doPlay" implementation when nativeCallout plugin exist on mobile devices
		calloutNativePlayer: function() {
			var appstore = "http://itunes.apple.com/app/id";
			var appurl = "kalturaPlayerToolkit://?iframeUrl="+ this.embedPlayer.getIframeSourceUrl();

			var timeout;

			$('<iframe />')
				.attr('src', appurl)
				.attr('style', 'display:none;')
				.appendTo('body');

			timeout = setTimeout(function() {
				document.location = appstore;
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