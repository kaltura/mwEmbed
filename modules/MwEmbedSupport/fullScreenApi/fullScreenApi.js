/*
Native FullScreen JavaScript API

Simple fullscreen api wrapper based on John Dyer's blog post on the subject:
http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

-------------
Assumes Mozilla naming conventions instead of W3C for now
*/
( function() {

	var fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() { return false; },
			requestFullScreen: function() {},
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');

	// check for native support
	if ( typeof document.cancelFullScreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];

			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;

				break;
			}
		}
	}

	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

		fullScreenApi.isFullScreen = function( doc ) {
			if( !doc ){
				doc = document;
			}
			switch (this.prefix) {
				case '':
					return doc.fullScreen;
				case 'webkit':
					return doc.webkitIsFullScreen;
				default:
					return doc[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function( el ) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function( el, doc ) {
			if( !doc ){
				doc = document;
			}
			return (this.prefix === '') ? doc.cancelFullScreen() : doc[this.prefix + 'CancelFullScreen']();
		}
	}

	// jQuery plugin
	if (typeof jQuery != 'undefined') {
		jQuery.fn.requestFullScreen = function() {

			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;

})();
