( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({
		defaultConfig: {
			"storeUrl": null,
			"mimeName": null,
			"iframeUrl": null,
			'templatePath': 'components/nativeCallout/nativeCallout.tmpl.html',
			"applinkPrefix": null,
		},

		IOS_STORE_URL: "http://itunes.apple.com/app/id919225951",
		ANDROID_STORE_URL: "https://play.google.com/store/apps/details?id=com.kaltura.kalturaplayertoolkit",
		IOS_MIME_NAME: "kalturaPlayerToolkit://",
		ANDROID_MIME_NAME: "http://kalturaplayertoolkit.com",
		APPLINK_URL_PREFIX: "https://kalturaplay.appspot.com/play?",

		ANDROID_STORE_IMAGE: "store-android-nativecallout",
		IOS_STORE_IMAGE: "store-ios-nativecallout",

		setup: function(){
			mw.EmbedTypes.getMediaPlayers().defaultPlayers[ 'video/wvm' ].push( 'Native' );
			// Bind player
			this.addBindings();
			if( !this.getConfig( "storeUrl" ) ) {
				this.setConfig( "storeUrl", mw.isAndroid() ? this.ANDROID_STORE_URL : this.IOS_STORE_URL );
			}

			if( !this.getConfig( "storeImage" ) ) {
				this.setConfig( "storeImage", mw.isAndroid() ? this.ANDROID_STORE_IMAGE : this.IOS_STORE_IMAGE );
			}

			// TODO: safe to remove?
			if( !this.getConfig( "mimeName" ) ) {
				this.setConfig( "mimeName", mw.isAndroid() ? this.ANDROID_MIME_NAME : this.IOS_MIME_NAME );
			}

			if( !this.getConfig( "iframeUrl" ) ) {
				var chromecastPluginFlashvar = "&flashvars[chromecast.plugin]=true";
				this.setConfig( "iframeUrl", encodeURI( kWidget.iframeUrls[ this.embedPlayer.id ] + chromecastPluginFlashvar ) );
			}
			
			if (!this.getConfig("applinkPrefix")) {
				if (mw.isIOSBelow9()) {
					// legacy, used with iOS<9
					this.setConfig("applinkPrefix", this.IOS_MIME_NAME + "?iframeUrl:=");
				} else {
					this.setConfig("applinkPrefix", this.APPLINK_URL_PREFIX);
				}
			}
		},
		isSafeEnviornment: function(){
			return mw.isMobileDevice() === true;
		},
		addBindings: function() {
			var _this = this;
			this.bind('prePlayAction', function (event, prePlay) {
				if (mw.isMobileDevice() && !mw.isNativeApp()) {
					prePlay.allowPlayback = false;
					_this.calloutNativePlayer();
				}
			});	
		},

		getComponent: function(){
			if( ! this.$el ){
				var cssClass = (this.getConfig('cssClass') ? ' ' + this.getConfig('cssClass') : '');
				this.$el = $( '<div />' )
					.addClass( this.pluginName + cssClass );
				this.getPlayer().getVideoHolder().append(this.$el);
			}
			return this.$el;
		},

		closeScreen: function(){
			this.embedPlayer.getPlayerPoster().removeClass("blur");
			this.embedPlayer.getVideoHolder().find(".largePlayBtn").show();
			this.$el.remove();
			this.$el = undefined;
			this.embedPlayer.enablePlayControls();
		},

		calloutNativePlayer: function() {
			var _this = this;
			var timeout;

			function preventPopup() {
				clearTimeout(timeout);
				timeout = null;
				window.removeEventListener('pagehide', preventPopup);
			}

			function isHidden() {
				if (typeof document.hidden !== 'undefined') {
					return document.hidden;
				} else if (typeof document.mozHidden !== 'undefined') {
					return document.mozHidden;
				} else if (typeof document.msHidden !== 'undefined') {
					return document.msHidden;
				} else if (typeof document.webkitHidden !== 'undefined') {
					return document.webkitHidden;
				}

				return false;
			}

			function showNativeCallout() {
				_this.getTemplateHTML()
					.then(function (htmlMarkup) {
						var storeImage = $("<div/>", {"class": _this.getConfig("storeImage")});
						var storeElement = htmlMarkup.find("#store");
						storeElement.attr('href', _this.getConfig("storeUrl"));
						storeElement.append(storeImage);
						var $el = _this.getComponent();
						$el.append(htmlMarkup);
						_this.embedPlayer.getPlayerPoster().addClass("blur");
						_this.embedPlayer.getVideoHolder().find(".largePlayBtn").hide();
						_this.embedPlayer.disablePlayControls();
						var components = ['fullScreenBtn', 'logo'];
						_this.embedPlayer.triggerHelper("onDisableInterfaceComponents", components);
					}, function (msg) {
						mw.log(msg);
					});
			}

			var url = _this.getConfig("applinkPrefix") + _this.getConfig("iframeUrl");
			var popup = [];
			setTimeout(function () {
				popup.close();
				//show the open play store splash screen
				setTimeout(function () {
					if (isHidden()) {
						//app is loaded
					} else {
						showNativeCallout();
					}
				}, 1000);
			}, 1000);
			popup = window.open(url);
		}
	}));

} )( window.mw, window.jQuery );