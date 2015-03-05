( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({
		defaultConfig: {
			"storeUrl": null,
			"mimeName": null,
			"iframeUrl": null,
			'templatePath': 'components/nativeCallout/nativeCallout.tmpl.html',
		},

		IOS_STORE_URL: "http://itunes.apple.com/app/id698657294",
		ANDROID_STORE_URL: "market://details?=com.kaltura.kalturaplayertoolkit",
		IOS_MIME_NAME: "kalturaPlayerToolkit://",
		ANDROID_MIME_NAME: "http://kalturaplayertoolkit.com",

		setup: function(){
			mw.EmbedTypes.getMediaPlayers().defaultPlayers[ 'video/wvm' ].push( 'Native' );
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
				this.setConfig( "iframeUrl", encodeURI( kWidget.iframeUrls[ this.embedPlayer.id ] + chromecastPluginFlashvar ) );
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

		getComponent: function(){
			if( ! this.$el ){
				var cssClass = (this.getConfig('cssClass') ? ' ' + this.getConfig('cssClass') : '');
				this.$el = $( '<div />' )
					.addClass( this.pluginName + cssClass );
				this.getPlayer().getVideoHolder().append(this.$el);
			}
			return this.$el;
		},

		calloutNativePlayer: function() {
			var _this = this;
			var timeout;

			function preventPopup() {
				clearTimeout(timeout);
				timeout = null;
				window.removeEventListener( 'pagehide', preventPopup );
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



			var url =  _this.getConfig( "mimeName" ) + "?iframeUrl:=" + _this.getConfig( "iframeUrl" );
			if ( mw.isAndroid() ) {
				var popup = [];
				setTimeout(function(){
					popup.close();
					//show the open play store splash screen
					setTimeout(function(){
						if (isHidden()){
							//app is loaded
						}else{
							var htmlMarkup = _this.getTemplateHTML();// {meta: this.getMetaData(), mediaList: this.getTemplateData()}
							var $el = _this.getComponent();
							$el.append(htmlMarkup);
						}
					},1000);
				},100);

				popup = window.open(url);

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