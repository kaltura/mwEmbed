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
			shareConfig: {
				"facebook": {
					"name": "Facebook",
					"icon": "",
					"cssClass": "icon-share-facebook",
					"template": "https://www.facebook.com/sharer/sharer.php?u={share.shareURL}",
					"redirectUrl": 'fb://feed/'
				},
				"twitter": {
					"name": "Twitter",
					"icon": "",
					"cssClass": "icon-share-twitter",
					"template": "https://twitter.com/share?url={share.shareURL}",
					"redirectUrl": 'https://twitter.com/intent/tweet/complete?,https://twitter.com/intent/tweet/update'
				},
				"googleplus": {
					"name": "Google+",
					"icon": "",
					"cssClass": "icon-share-google",
					"template": "https://plus.google.com/share?url={share.shareURL}",
					"redirectUrl": 'https://plus.google.com/app/basic/stream'
				},
				"email": {
					"name": "Email",
					"icon": "",
					"cssClass": "icon-share-email",
					"template": "mailto:email@address.com?subject=Check out {mediaProxy.entry.name}&body=Check out {mediaProxy.entry.name}: {share.shareURL}",
					"redirectUrl": ''
				},
				"linkedin": {
					"name": "LinkedIn",
					"icon": "",
					"cssClass": "icon-share-linkedin",
					"template": "http://www.linkedin.com/shareArticle?mini=true&url={share.shareURL}",
					"redirectUrl": ''
				},
				"sms": {
					"name": "SMS",
					"icon": "",
					"cssClass": "icon-share-sms",
					"template": "Check out {mediaProxy.entry.name}: {share.shareURL}",
					"redirectUrl": ''
				}
			},
			embedCodeTemplate: '<iframe src="//cdnapi.kaltura.com/p/{mediaProxy.entry.partnerId}/sp/{mediaProxy.entry.partnerId}00/embedIframeJs/uiconf_id/{configProxy.kw.uiConfId}/partner_id/{mediaProxy.entry.partnerId}?iframeembed=true&playerId={configProxy.targetId}&entry_id={mediaProxy.entry.id}&flashvars[streamerType]=auto" width="560" height="395" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>',
			embedOptions: {
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

				// setup embed code when the screen opens
				_this.setupEmbedCode();
				// set embed code in the UI as the template doesn't load it correctly when using data binding because of the double quotes inside the text
				$(".embed-input").val(_this.getConfig('embedCode'));

				_this.enablePlayDuringScreen = true; // enable playback when the share screen is opened
			});
			this.bind('preHideScreen', function () {
				// restore keyboard actions
				_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );

				// re-enable player controls
				_this.getPlayer().enablePlayControls();
			});
		},

		getTemplateData: function () {
			var networks = this.getConfig('shareConfig');

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
			this.setConfig( 'shareConfig' , networks );

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

		// overwrite addScreenBindings function of mw.KBaseScreen
		addScreenBindings: function(){
			var _this = this;
			//add IE8 support for rounded corners using the PIE library
			if( mw.isIE8() ){
				$('.share .PIE').each(function(){
					PIE.attach(this);
				});
			}
			// add bindings
			$(".share-input").on("click", function(){
				if ( $(".share-offset-container").css("display") === "none" ){
					$(".embed-offset-container").hide();
					$(".embed-container>.share-copy-btn").hide();
					$(".share-offset-container").height(0).show().animate({ height: "43px" }, 300 ,function(){
						$(".share-container>.share-copy-btn").fadeIn(300);
						$(".share-offset-container").fadeIn(300);
					});
				}
				$(this).select();
			});

			$(".embed-input").on("click", function(){
				if ( $(".embed-offset-container").css("display") === "none" ){
					$(".share-offset-container").hide();
					$(".share-container>.share-copy-btn").hide();
					$(".embed-offset-container").height(0).show().animate({ height: "43px" }, 300 ,function(){
						$(".embed-container>.share-copy-btn").fadeIn(300);
						$(".embed-offset-container").fadeIn(300);
					});
				}
				$(this).select();
			});
			this.restrictNPTFields();
			// handle time offset for share link
			$(".share-offset-container>.share-offset").on("propertychange change keyup input paste", function(event){
				_this.setShareTimeOffset($(this).val());
			});

			// handle copy button for share link
			$(".share-copy-btn").on("click", function(){
				var selector = $(this).data("target");
				window.prompt("Copy to clipboard: Ctrl+C, Enter", $(selector).val());
			});

			// handle time offset for embed code
			$(".embed-offset-container>.share-offset").on("propertychange change keyup input paste", function(event){
				_this.setEmbedTimeOffset($(this).val());
			});

			// handle secured embed
			$(".share-secured").on("click", function(){
				var embedCode = $(".embed-input").val();
				if ($(this).is(':checked')){
					embedCode = embedCode.split("cdnapi.kaltura.com").join("cdnapisec.kaltura.com");
				}else{
					embedCode = embedCode.split("cdnapisec.kaltura.com").join("cdnapi.kaltura.com");
				}
				$(".embed-input").val(embedCode);
			});
		},

		restrictNPTFields: function(){
			$(".share-offset").keydown(function (e) {
				// Allow: backspace, delete, tab, escape, enter and :
				if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 186]) !== -1 ||
					// Allow: Ctrl+A
					(e.keyCode == 65 && e.ctrlKey === true) ||
					// Allow: home, end, left, right
					(e.keyCode >= 35 && e.keyCode <= 39)) {
					// let it happen, don't do anything
					return;
				}
				// Ensure that it is a number and stop the keypress
				if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
					e.preventDefault();
				}
			});
		},

		setShareTimeOffset: function(offset){
			var shareLink = $(".share-input").val();
			shareLink = shareLink.split("#")[0];
			if ( this.validateTimeOffset(offset) ){
				shareLink = shareLink + "#t=" + offset;
			}
			$(".share-input").val(shareLink);
			this.setConfig("shareURL", shareLink);
		},

		setEmbedTimeOffset: function(offset){
			var embedCode = $(".embed-input").val();
			// remove any existing mediaProxy.mediaPlayFrom flashvars previously defined
			if ( embedCode.indexOf("mediaProxy.mediaPlayFrom") !== -1 ){
				embedCode = embedCode.replace( /flashvars\[mediaProxy.mediaPlayFrom\]=(.*?)&/ ,"");
			}
			if ( this.validateTimeOffset(offset) ){
				embedCode = embedCode.split("?").join("?flashvars[mediaProxy.mediaPlayFrom]=" + mw.npt2seconds(offset) + "&");
			}
			console.log(embedCode);
			$(".embed-input").val(embedCode);
		},

		validateTimeOffset: function(offset){
			$(".share-alert").text("").hide();
			if ( mw.npt2seconds(offset) > this.getPlayer().duration ){
				$(".share-alert").text("Time offset cannot be longer than movie duration.").show();
				return false;
			}
			if ( mw.npt2seconds(offset) === 0 ){
				return false;
			}
			return true;
		},
		closeScreen: function(){
			$(".embed-offset-container").hide();
			$(".embed-container>.share-copy-btn").hide();
			$(".share-offset-container").hide();
			$(".share-container>.share-copy-btn").hide();
			$(".share-offset").val("00:00");
			$(".share-alert").hide();
			$('.share-secured').attr('checked', false);
			this.enablePlayDuringScreen = false;
			this.hideScreen();
		},

		openPopup: function (e) {
			var url = $(e.target).parents('a').attr('href');
			url = decodeURIComponent(url);        // url was encoded to keep curly brackets for template tokens
			url = this.getPlayer().evaluate(url); // replace tokens

			if (mw.isNativeApp()) {
				var networks = this.getConfig('shareConfig');
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
		// setup embed code
		setupEmbedCode: function(){
			var embedCode = this.getConfig("embedCodeTemplate",true);
			var embedConfig = this.getConfig("embedOptions");
			var embedPlayer = this.getPlayer();

			// replace tokens in template
			embedCode = embedPlayer.evaluate(embedCode);

			// replace properties that come from configuration
			embedCode = embedCode.replace( /streamerType\]=(.*?)"/ ,'streamerType]=' + embedConfig["streamerType"] + '"');
			embedCode = embedCode.replace( /width="(.*?)"/ ,'width="' + embedConfig["width"] + '"');
			embedCode = embedCode.replace( /height="(.*?)"/ ,'height="' + embedConfig["height"] + '"');
			embedCode = embedCode.replace( /frameborder="(.*?)"/ ,'frameborder="' + embedConfig["frameBorderWidth"] + '"');

			// save embed code to Flashvar to be used later
			this.setConfig('embedCode', embedCode);
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
		}
		// -------------- finish setup player url according to the socialShareURL flashvar ------- //

	}));

})(window.mw, window.jQuery);
