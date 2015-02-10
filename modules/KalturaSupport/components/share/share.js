(function (mw, $) {
	"use strict";

	mw.PluginManager.add('share', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			order: 5,
			align: "right",
			tooltip: 'Share',
			showTooltip: true,
			displayImportance: 'medium',
			usePreviewPlayer: false,
			previewPlayerEnabled: false,
			socialShareEnabled: true,
			socialShareURL: 'smart', // 'parent' / 'http://custom.url/entry/{mediaProxy.entry.id}'
			socialNetworks: 'facebook,twitter,googleplus',
			shareOffset: true,
			templatePath: 'components/share/share.tmpl.html'
		},
		iconBtnClass: "icon-share",
		setup: function () {
			this.setupPlayerURL();
			this.addBindings();

		},
		addScreenBindings: function(){
			if( mw.isIE8() ){
				$('.share .PIE').each(function(){
					PIE.attach(this);
				});
			}
		},
		closeShare: function(e){
			//this.hideScreen();
			$(".share-offset-container").show();
			$(".embed-offset-container").show();
			$(".share-copy-btn").show();
		},
		setupPlayerURL: function () {
			var shareURL = null;
			switch (this.getConfig('socialShareURL')) {
				case 'smart':
					shareURL = this.getSmartURL();
					break;
				case 'parent':
					shareURL = this.getParentURL();
					break;
				default:
					shareURL = this.getConfig("socialShareURL");
			}
			if (shareURL) {
				this.setConfig('shareURL', shareURL);
			}
		},
		addBindings: function () {
			var _this = this;
			this.bind('playerReady', function () {
				_this.setupPlayerURL();
			});
			this.bind('preShowScreen', function () {
				_this.getScreen().addClass('semiTransparentBkg');
				$("#"+_this.getPlayer().getPlayerElement().id).addClass("blur");
				$(".playerPoster").addClass("blur");
				_this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );
			});
			this.bind('preHideScreen', function () {
				_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
			});
		},

		getParentURL: function () {
			var res;
			if (mw.getConfig('EmbedPlayer.IframeParentUrl')) {
				res = mw.getConfig('EmbedPlayer.IframeParentUrl');
			} else {
				res = document.referrer;
				if (res === "") {
					res = document.URL;
				}
			}
			return res;
		},
		getKalturaShareURL: function () {
			return mw.getConfig('Kaltura.ServiceUrl') + '/index.php/extwidget/preview' +
				'/partner_id/' + this.getPlayer().kpartnerid +
				'/uiconf_id/' + this.getPlayer().kuiconfid +
				'/entry_id/' + this.getPlayer().kentryid + '/embed/dynamic';
		},
		getSmartURL: function () {
			var shareURL = this.getKalturaShareURL();
			if (mw.getConfig('EmbedPlayer.IsFriendlyIframe')) {
				try {
					var $parentDoc = $(window['parent'].document);
					var hasOpenGraphTags = $parentDoc.find('meta[property="og:video"]').length;
					var hasTwitterCardsTags = $parentDoc.find('meta[name="twitter:player"]').length;
					if (hasOpenGraphTags || hasTwitterCardsTags) {
						shareURL = this.getParentURL();
					}
				} catch (e) {
				}
			}
			return shareURL;
		},
		getTemplateData: function () {
			var networks = [];
			var socialNetworks = this.getConfig("socialNetworks");
			if (socialNetworks.indexOf("facebook") != -1)
				networks.push({
					id: 'facebook',
					name: 'Facebook',
					cssClass: 'icon-share-facebook',
					url: 'https://www.facebook.com/sharer/sharer.php?u=',
					redirectUrl: 'fb://feed/'
				});
			if (socialNetworks.indexOf("twitter") != -1)
				networks.push({
					id: 'twitter',
					name: 'Twitter',
					cssClass: 'icon-share-twitter',
					url: 'https://twitter.com/share?url=',
					redirectUrl: 'https://twitter.com/intent/tweet/complete?,https://twitter.com/intent/tweet/update'
				});
			if (socialNetworks.indexOf("googleplus") != -1)
				networks.push({
					id: 'googleplus',
					name: 'GooglePlus',
					cssClass: 'icon-share-google',
					url: 'https://plus.google.com/share?url=',
					redirectUrl: 'https://plus.google.com/app/basic/stream'
				});
			if (mw.isNativeApp() && socialNetworks.indexOf("mail") != -1)
				networks.push({
					id: 'mail',
					name: 'Mail',
					cssClass: 'icon-share-mail',
					url: 'http://',
					redirectUrl: ''
				});
			if (mw.isNativeApp() && socialNetworks.indexOf("message") != -1)
				networks.push({
					id: 'message',
					name: 'Message',
					cssClass: 'icon-share-sms',
					url: 'http://',
					redirectUrl: ''
				});

			return {
				'share': this,
				networks: networks
			};
		},
		openPopup: function (e) {
			// Name argument for window.open in IE8 must be from supported set: _blank for example
			// http://msdn.microsoft.com/en-us/library/ms536651%28v=vs.85%29.asp

			if (mw.isNativeApp()) {
				var socialNetworks = this.getConfig("socialNetworks").split(',');
				var networkIndex = $.inArray($(e.target).attr('id'), socialNetworks);
				var networkParams = this.getTemplateData().networks[networkIndex];
				var shareParams = {
					actionType: 'share',
					sharedLink: this.getConfig("shareURL"),
					shareNetwork: networkParams,
					thumbnail: this.getThumbnailURL(),
					videoName: this.getPlayer().evaluate("{mediaProxy.entry.name}")
				};
				this.getPlayer().doNativeAction(JSON.stringify(shareParams));
			} else {
				var url = $(e.target).parents('a').attr('href');
				window.open(
					url + encodeURIComponent(this.getConfig('shareURL')),
					'_blank',
					'width=626,height=436'
				);
			}
		},
		getThumbnailURL: function () {
			return kWidgetSupport.getKalturaThumbnailUrl({
				url: this.getPlayer().evaluate('{mediaProxy.entry.thumbnailUrl}'),
				width: this.getPlayer().getWidth(),
				height: this.getPlayer().getHeight()
			});
		}
	}));

})(window.mw, window.jQuery);
