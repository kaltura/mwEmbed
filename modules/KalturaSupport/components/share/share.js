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
			templatePath: 'components/share/share.tmpl.html',

			usePreviewPlayer: false,
			previewPlayerEnabled: false,

			socialShareEnabled: true,
			embedEnabled: true,
			allowTimeOffset: true,
			allowSecuredEmbed: true,
			emailEnabled: true,

			socialShareURL: 'smart', // 'parent' or 'http://custom.url/entry/{mediaProxy.entry.id}'
			socialNetworks: 'facebook,twitter,googleplus,email,linkedin,sms',
			shareOptions: {
				"facebook": {
					"name": "Facebook",
					"icon": "",
					"cssClass": "icon-share-facebook",
					"template": "https://www.facebook.com/sharer/sharer.php?u={shareUrl}",
					"redirectUrl": 'fb://feed/'
				},
				"twitter": {
					"name": "Twitter",
					"icon": "",
					"cssClass": "icon-share-twitter",
					"template": "https://twitter.com/share?url={shareUrl}",
					"redirectUrl": 'https://twitter.com/intent/tweet/complete?,https://twitter.com/intent/tweet/update'
				},
				"googleplus": {
					"name": "Google+",
					"icon": "",
					"cssClass": "icon-share-google",
					"template": "https://plus.google.com/share?url={shareUrl}",
					"redirectUrl": 'https://plus.google.com/app/basic/stream'
				},
				"email": {
					"name": "Email",
					"icon": "",
					"cssClass": "icon-share-email",
					"template": "mailto:email@address.com?subject=Check out {mediaProxy.entry.name}&body=Check out {mediaProxy.entry.name}: {shareUrl}",
					"redirectUrl": ''
				},
				"linkedin": {
					"name": "LinkedIn",
					"icon": "",
					"cssClass": "icon-share-linkedin",
					"template": "http://www.linkedin.com/shareArticle?mini=true&url={shareUrl}",
					"redirectUrl": ''
				},
				"sms": {
					"name": "SMS",
					"icon": "",
					"cssClass": "icon-share-sms",
					"template": "Check out {mediaProxy.entry.name}: {shareUrl}",
					"redirectUrl": ''
				}
			},
			embedCodeTemplate: '<iframe src="{cdn}/p/{partnerId}/sp/{partnerId}00/embedIframeJs/uiconf_id/{uiconfId}/partner_id/{partnerId}?iframeembed=true&playerId={kaltura_player_id}&entry_id={entryId}&flashvars[streamerType]=auto" width="560" height="395" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>',
			embedCodeOptions: {
				"streamerType": "auto",
				"width": 560,
				"height": 395,
				"frameBorderWidth": 0
			}
		},

		iconBtnClass: "icon-share",
		setup: function () {
			this.setupPlayerURL();
			this.addBindings();

			// disable embed option on mobile and native
			if ( mw.isMobileDevice() || mw.isNativeApp() ){
				this.setConfig( 'embedEnabled' , false );
			}
		},

		addBindings: function () {
			var _this = this;
			this.bind('playerReady', function () {
				_this.setupPlayerURL();
			});
			this.bind('preShowScreen', function () {
				_this.getScreen().addClass('semiTransparentBkg'); // add semi-transparent background for share plugin screen only. Won't affect other screen based plugins

				// add blur effect to video and poster
				$("#"+_this.getPlayer().getPlayerElement().id).addClass("blur");
				$(".playerPoster").addClass("blur");

				// prevent keyboard key actions to allow typing in share screen fields
				_this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );

				// disable all player controls except play button, scrubber and volume control
				_this.getPlayer().disablePlayControls(["volumeControl","scrubber","playPauseBtn"]);
			});
			this.bind('preHideScreen', function () {
				// restore keyboard actions
				_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );

				// re-enable player controls
				_this.getPlayer().enablePlayControls();
			});
		},

		getTemplateData: function () {
			var networks = this.getConfig('shareOptions');

			// in order to support the legacy socialNetworks Flashvar, we will go through it and remove networks that are not specified in socialNetworks
			var socialNetworks = this.getConfig("socialNetworks").split(",");
			$.each(networks, function(idx, network){
				if ( $.inArray(idx, socialNetworks) === -1 ){
					delete networks[idx];
				}
			});

			// remove sms option if we are not inside a native app
			if ( !mw.isNativeApp() ) {
				delete networks["sms"];
			}

			// save networks to config
			this.setConfig( 'shareOptions' , networks );

			return {
				'share': this,
				'socialShareEnabled': this.getConfig('socialShareEnabled'),
				'embedEnabled': this.getConfig('embedEnabled'),
				'allowTimeOffset': this.getConfig('allowTimeOffset'),
				'allowSecuredEmbed': this.getConfig('allowSecuredEmbed'),
				'shareURL': this.getConfig('shareURL'),
				'networks': networks
			};
		},
		openPopup: function (e) {
			var url = $(e.target).parents('a').attr('href');
			url = decodeURIComponent(url); // url was encoded to keep curly brackets for template tokens
			url = url.split("{shareUrl}").join(encodeURIComponent(this.getConfig('shareURL'))); // replace {shareUrl} token with the share URL
			url = this.getPlayer().evaluate(url); // replace all other tokens

			if (mw.isNativeApp()) {
				var networks = this.getConfig('shareOptions');
				var id = $(e.target).attr('id');
				var shareParams = {
					actionType: 'share',
					id: id,
					sharedLink: this.getConfig("shareURL"),
					shareNetwork: networks[id],
					thumbnail: this.getThumbnailURL(),
					videoName: this.getPlayer().evaluate("{mediaProxy.entry.name}")
				};
				this.getPlayer().doNativeAction(JSON.stringify(shareParams));
			} else {
				var opener = window.open(url,'_blank','width=626,height=436');
				// close the window if this is an email
				if (url.indexOf("mailto") === 0){
					setTimeout(function(){
						opener.close();
					},2000);

				}
			}
		},
		getThumbnailURL: function () {
			return kWidgetSupport.getKalturaThumbnailUrl({
				url: this.getPlayer().evaluate('{mediaProxy.entry.thumbnailUrl}'),
				width: this.getPlayer().getWidth(),
				height: this.getPlayer().getHeight()
			});
		},

		// -------------- start setup player url according to the socialShareURL flashvar ------- //
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
		getKalturaShareURL: function () {
			return mw.getConfig('Kaltura.ServiceUrl') + '/index.php/extwidget/preview' +
				'/partner_id/' + this.getPlayer().kpartnerid +
				'/uiconf_id/' + this.getPlayer().kuiconfid +
				'/entry_id/' + this.getPlayer().kentryid + '/embed/dynamic';
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
		// -------------- finish setup player url according to the socialShareURL flashvar ------- //

		// overwrite addScreenBindings function of mw.KBaseScreen to add IE8 support for rounded corners using the PIE library
		addScreenBindings: function(){
			if( mw.isIE8() ){
				$('.share .PIE').each(function(){
					PIE.attach(this);
				});
			}
		}
	}));

})(window.mw, window.jQuery);
