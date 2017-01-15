( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({

		// Defaults for KalturaPlay
		defaultConfig: {
			androidApplinkBaseURL: 	"https://kgit.html5video.org/kplay?",
			iosApplinkBaseURL: 		"https://kgit.html5video.org/kplay?",
			appInstallLandingPage: 	"https://kgit.html5video.org/kplay",
		},

		setup: function(){
			mw.EmbedTypes.getMediaPlayers().defaultPlayers[ 'video/wvm' ].push( 'Native' );

			if (mw.isAndroid()) {
				this.applinkBase = this.getConfig("androidApplinkBaseURL");
			} else if (mw.isIOS()) {
				this.applinkBase = this.getConfig("iosApplinkBaseURL");
			}

			this.addBindings();
		},
		
		isSafeEnviornment: function(){
			// Only load the plugin on mobile browser (NOT in the native SDK) 
			return mw.isMobileDevice() && !mw.isNativeApp();
		},
		
		addBindings: function() {
			var _this = this;
			this.bind('prePlayAction', function (event, prePlay) {
				prePlay.allowPlayback = false;
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

		closeScreen: function(){
			this.embedPlayer.getPlayerPoster().removeClass("blur");
			this.embedPlayer.getVideoHolder().find(".largePlayBtn").show();
			this.$el.remove();
			this.$el = undefined;
			this.embedPlayer.enablePlayControls();
		},

		calloutNativePlayer: function() {
			var _this = this;
			
			var isFriendlyIframe = mw.getConfig('EmbedPlayer.IsFriendlyIframe');
			var embedFrameURL = isFriendlyIframe ? kWidget.iframeUrls[ this.embedPlayer.id ] : location.href;
			var calloutURL = _this.applinkBase + "embedFrameURL=" + encodeURIComponent(embedFrameURL);

			if (isFriendlyIframe) {
				// We're in a friendly frame -- just navigate
				parent.document.location.assign(calloutURL);
			} else {
				// If frame is not friendly, we need to open the callout URL using window.open().
				window.open(calloutURL);
			}
		}
	}));

} )( window.mw, window.jQuery );