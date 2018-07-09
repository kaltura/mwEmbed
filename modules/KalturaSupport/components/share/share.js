(function (mw, $) {
	"use strict";

	mw.PluginManager.add('share', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			order: 5,
			align: "right",
			tooltip:  gM( 'mwe-embedplayer-share' ),
			title:  gM( 'mwe-embedplayer-share' ),
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
			shareUiconfID: null,
			shareConfig: {
				"facebook": {
					"name": "Facebook",
					"icon": "",
					"cssClass": "icon-share-facebook",
					"template": "https://www.facebook.com/sharer/sharer.php?u={share.shareURL}",
					"redirectUrl": 'fb://feed/',
					"barColor": '#394F8F'
				},
				"twitter": {
					"name": "Twitter",
					"icon": "",
					"cssClass": "icon-share-twitter",
					"template": "https://twitter.com/share?url={share.shareURL}",
					"redirectUrl": 'https://twitter.com/intent/tweet/complete?,https://twitter.com/intent/tweet/update',
					"barColor": '#39BAB6'
				},
				"googleplus": {
					"name": "Google+",
					"icon": "",
					"cssClass": "icon-share-google",
					"template": "https://plus.google.com/share?url={share.shareURL}",
					"redirectUrl": 'https://plus.google.com/app/basic/stream',
					"barColor": '#CB2726'
				},
				"email": {
					"name": "Mail",
					"icon": "",
					"cssClass": "icon-share-email",
					"template": "mailto:?subject=Check out {mediaProxy.entry.name}&body=Check out {mediaProxy.entry.name}: {share.shareURL}",
					"redirectUrl": '',
					"barColor": '#394F8F'
				},
				"linkedin": {
					"name": "LinkedIn",
					"icon": "",
					"cssClass": "icon-share-linkedin",
					"template": "http://www.linkedin.com/shareArticle?mini=true&url={share.shareURL}",
					"redirectUrl": '',
					"barColor": '#222222'
				},
				"sms": {
					"name": "Message",
					"icon": "",
					"cssClass": "icon-share-sms",
					"template": "Check out {mediaProxy.entry.name}: {share.shareURL}",
					"redirectUrl": '',
					"barColor": '#394F8F'
				}
			},
			embedCodeTemplate: '<iframe src="' + mw.getConfig("Kaltura.ServiceUrl") + '/p/{mediaProxy.entry.partnerId}/sp/{mediaProxy.entry.partnerId}00/embedIframeJs/uiconf_id/{configProxy.kw.uiConfId}/partner_id/{mediaProxy.entry.partnerId}?iframeembed=true&playerId={configProxy.targetId}&entry_id={mediaProxy.entry.id}&flashvars[streamerType]=auto" width="560" height="395" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"></iframe>',
			embedOptions: {
				"streamerType": "auto",
				"uiconfID": null,
				"width": 560,
				"height": 395,
				"borderWidth": 0
			}
		},

		iconBtnClass: "icon-share",
		locale:{
			startTimeLbl: gM( 'mwe-share-startTimeLbl' ),
			secureEmbedLbl: gM( 'mwe-share-secureEmbedLbl' ),
			copyLbl: gM( 'mwe-share-copyLbl' ),
			errDuration: gM( 'mwe-share-errDuration' ),
			errFormat: gM( 'mwe-share-errFormat' )
		},
		shareScreenOpened: false,

		setup: function () {
			this.setShareConfig();
			this.setupPlayerURL();
			this.addBindings();

			// disable embed option on mobile and native
			if ( mw.isMobileDevice() || mw.isNativeApp() ){
				this.setConfig( 'embedEnabled' , false );
			}

			// force parent to be topBarContainer on mobile
			if (this.embedPlayer.isMobileSkin()){
				this.setConfig( 'parent' , 'topBarContainer' );
			}
		},

		setShareConfig: function() {
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

			// remove email option if emailEnabled = false
			if ( this.getConfig("emailEnabled") === false ) {
				delete networks["email"];
			}

			// save networks to config
			this.setConfig( 'shareConfig' , networks );			
		},

		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();
			this.bind('playerReady', function () {
				_this.setupPlayerURL();
				_this.getScreen();
			});
			this.bind('preShowScreen', function (event, screenName) {
				if ( screenName === "share" ){
					_this.getScreen().then(function(screen){
						screen.addClass('semiTransparentBkg'); // add semi-transparent background for share plugin screen only. Won't affect other screen based plugins
						_this.shareScreenOpened = true;
						// prevent keyboard key actions to allow typing in share screen fields
						embedPlayer.triggerHelper( 'onDisableKeyboardBinding' );
						// disable all player controls except play button, scrubber and volume control
						embedPlayer.disablePlayControls(["volumeControl","scrubber","playPauseBtn","playlistAPI"]);
						// setup embed code when the screen opens
						_this.setupEmbedCode();
						// set embed code in the UI as the template doesn't load it correctly when using data binding because of the double quotes inside the text
						$(".embed-input").val(_this.getConfig('embedCode'));
						// send event for analytics
						$(embedPlayer).trigger("showShareEvent");
						// enable playback when the share screen is opened
						_this.enablePlayDuringScreen = true;
						// set responsive size
						if (embedPlayer.getVideoHolder().width() < 400){
							$(".share").addClass("small");
						}
					});
				}
			});
			this.tabKeyBind = function(e){
				if(e.keyCode === 9){// keyCode = 9 - tab button
					var prevFocusedElement = $(':focus');//when you press TAB - focus does not change yet, and in focus will be prev element
					var prevFocusedElementParent = prevFocusedElement.parents('.share-input-container');
					setTimeout(function () {
						var currentFocusedElement = $(':focus');//when timeout will done - new element will be in focus
						var currentFocusedElementParents  = currentFocusedElement.parents('.share-input-container');
						if(!currentFocusedElement.parents('.videoHolder').hasClass('videoHolder')){
							_this.getPlayer().getInterface().find(".share .icon-close").focus();
							return;
						}
						if(
							prevFocusedElementParent.attr('class') &&
							prevFocusedElementParent.attr('class').indexOf('-offset-container') !==-1 &&
							(
								currentFocusedElementParents.attr('class') === undefined ||
								currentFocusedElementParents.attr('class').indexOf('-offset-container') === -1
							)
						){
							prevFocusedElementParent.hide();
						}

						if( currentFocusedElementParents.hasClass('share-input-container') &&
							currentFocusedElementParents.next('.share-input-container').attr('class') &&
							currentFocusedElementParents.next('.share-input-container').attr('class').indexOf('-offset-container') !==-1
						){
							currentFocusedElementParents.next('.share-input-container').show();
						}
					}, 0);
				}
			};
			this.bind('showScreen', function (event, screenName) {
				if ( screenName === "share" ){
					_this.getScreen().then(function(screen){
						$( "#" + embedPlayer.getPlayerElement().id ).addClass("blur");
						embedPlayer.getPlayerPoster().addClass("blur");
						screen.find(".icon-close").focus();
						screen.keydown( $.proxy( _this.tabKeyBind, _this )  );
					});

				}
			});
			this.bind('preHideScreen', function (event, screenName) {
				if ( screenName === "share" ){
					if ( !_this.enablePlayDuringScreen ){
						_this.shareScreenOpened = false;
					}
					// restore keyboard actions
					embedPlayer.triggerHelper( 'onEnableKeyboardBinding' );
					// re-enable player controls
					if ( !embedPlayer.isInSequence() ){
						embedPlayer.enablePlayControls();
						embedPlayer.triggerHelper("showLargePlayBtn");
					}
					// remove blur
					if (embedPlayer.getPlayerElement()) {
						$( "#" + embedPlayer.getPlayerElement().id ).removeClass( "blur" );
						embedPlayer.getPlayerPoster().removeClass( "blur" );
					}
				}
			});

			// Allow plugins to trigger share for specific platform/network
			this.bind( 'shareByPlatform', function(e, platform) {
				var platforms = _this.getConfig('shareConfig');
				if( platforms[platform] ) {
					var url = embedPlayer.evaluate(platforms[platform].template);
					_this.openPopup(null, {
						id: platform,
						url: url
					});
				}
			});

			// add API support: register to the "doShare" notification and dispatch the "shareEvent" event with the share link data
			this.bind( 'doShare', function(event, data){
				var shareUrl = _this.getConfig('shareURL');
				if ( data && data.timeOffset ){
					shareUrl += "#t="+data.timeOffset;
				}
				embedPlayer.triggerHelper( 'shareEvent', { "shareLink" : shareUrl } );
			});

			this.bind( 'onplay', function(event, data){
				if ( _this.shareScreenOpened ){
					setTimeout(function(){
						embedPlayer.disablePlayControls(["volumeControl","scrubber","playPauseBtn","playlistAPI"]);
					},0);
				}
			});

			this.bind( 'onpause', function(event, data){
				if ( _this.shareScreenOpened ){
					$( "#" + embedPlayer.getPlayerElement().id ).addClass("blur");
					embedPlayer.getPlayerPoster().addClass("blur");
				}
			});

			this.bind( 'AdSupport_StartAdPlayback', function(){
				_this.closeScreen();
			});

			this.bind( 'updateLayout', function(event, data){
				if ( _this.shareScreenOpened ){
					if (embedPlayer.getVideoHolder().width() < 400){
						$(".share").addClass("small");
					}else{
						$(".share").removeClass("small");
					}
				}
			});
		},

		getTemplateData: function () {
			return {
				'share': this,
				'socialShareEnabled': this.getConfig('socialShareEnabled'),
				'embedEnabled': this.getConfig('embedEnabled'),
				'allowTimeOffset': this.getConfig('allowTimeOffset'),
				'allowSecuredEmbed': this.getConfig('allowSecuredEmbed'),
				'shareURL': this.getConfig('shareURL'),
				'networks': this.getConfig('shareConfig')
			};
		},

		// overwrite addScreenBindings function of mw.KBaseScreen
		addScreenBindings: function(){
			var _this = this;
			//add IE8 support for rounded corners using the PIE library
			if( mw.isIE8() ){
				$(".share").addClass("ie8");
				$('.share .PIE').each(function(){
					PIE.attach(this);
				});
			}
			// add bindings
			var offsetContainerHeight = this.getPlayer().getVideoHolder().width() < 400 ? "24px" : "32px";
			$(".share-input").on("click", function(){
				if ( $(".share-offset-container").css("display") === "none" ){
					$(".embed-offset-container").hide();
					$(".embed-container>.share-copy-btn").hide();
					$(".share-offset-container").height(0).show().animate({ height: offsetContainerHeight }, 150 ,function(){
						//$(".share-container>.share-copy-btn").fadeIn(300);
						$(".share-offset-container").fadeIn(150);
						$(".share-icons-container").hide().show(); // force refresh for IE8 :(
					});
				}
			})
			.on('mouseup', function (e) {
					e.preventDefault();
				})
			.on('click', function () {
					this.setSelectionRange(0, 9999);
				});

			$(".embed-input").on("click", function(){
				if ( $(".embed-offset-container").css("display") === "none" ){
					$(".share-offset-container").hide();
					$(".share-container>.share-copy-btn").hide();
					$(".embed-offset-container").height(0).show().animate({ height: offsetContainerHeight }, 150 ,function(){
						//$(".embed-container>.share-copy-btn").fadeIn(300);
						$(".embed-offset-container").fadeIn(150);
						$(".share-icons-container").hide().show(); // force refresh for IE8 :(
					});
				}
			})
			.on('mouseup', function (e) {
				e.preventDefault();
			})
			.on('click', function () {
				this.setSelectionRange(0, 9999);
			});

			this.restrictNPTFields();
			// handle time offset for share link
			$(".share-offset-container>.share-offset").on("propertychange change keyup input paste", function(event){
				_this.setShareTimeOffset($(this).val());
			});

			// handle copy button for share link
//			$(".share-copy-btn").on("click", function(){
//				var selector = $(this).data("target");
//				window.prompt("Copy to clipboard: Ctrl+C, Enter", $(selector).val());
//			});

			// handle time offset for embed code
			$(".embed-offset-container>.share-offset").on("propertychange change keyup input paste", function(event){
				_this.setEmbedTimeOffset($(this).val());
			});

			// handle secured embed
			if ( mw.getConfig("Kaltura.ServiceUrl").indexOf(".kaltura.com") !== -1 ){
				$(".share-secured").on("click", function(){
					var embedCode = $(".embed-input").val();
					if ($(this).is(':checked')){
						embedCode = embedCode.split("http://cdnapi.kaltura.com").join("https://cdnapisec.kaltura.com");
					}else{
						embedCode = embedCode.split("https://cdnapisec.kaltura.com").join("http://cdnapi.kaltura.com");
					}
					$(".embed-input").val(embedCode);
				});
				$('.share-secured').prop('checked', mw.getConfig("Kaltura.ServiceUrl").indexOf("https") === 0); // initial check state according to ServiceUrl
			}else{
				// on prem - hide the security checkbox as the security settings are derived from the ServiceUrl
				$(".share-secured, .share-secure-lbl").hide();
			}

			// handle scroll buttons
			var deltaScroll = $(".share-icons-container .icon-border").width() + parseInt($(".share-icons-container .icon-border").css("margin-right"))*2;
			$(".share-icons-scroller .next-btn").on("click", function(){
				$(".share-icons-scroller .back-btn").show();
				$('.share-icons-container').animate({scrollLeft: '+='+deltaScroll }, 300, function(){
					if (Math.round($('.share-icons-container').scrollLeft()/deltaScroll) === ($(".icon-border").length - 5) ){
						$(".share-icons-scroller .next-btn").hide();
					}
				});
			});

			$(".share-icons-scroller .back-btn").on("click", function(){
				$(".share-icons-scroller .next-btn").show();
				$('.share-icons-container').animate({scrollLeft: '-='+deltaScroll }, 300, function(){
					if ($('.share-icons-container').scrollLeft() === 0){
						$(".share-icons-scroller .back-btn").hide();
					}
				});
			});
			setTimeout(function(){
				_this.addScroll(); // add scroll for social network icons if needed
			},0);

			// close button override
			$(".share .icon-close").on("mousedown", function(e){
				_this.closeScreen();
			})
			.keyup(function (e) {
				if(e.keyCode === 13){
					_this.closeScreen();
				}
			});
		},

		addScroll: function(){
			if ( $(".icon-border").length > 5 ){
				$(".share-icons-container").scrollLeft(0);
				$(".share-icons-scroller .next-btn").show();
			}
		},

		restrictNPTFields: function(){
			$(".share-offset").keydown(function (e) {
				// Allow: backspace, delete, tab, escape, enter and :
				if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 186, 59]) !== -1 ||
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
			$(".embed-input").val(embedCode);
		},

		validateTimeOffset: function(offset){
			$(".share-alert").text("").hide();
			if ( mw.npt2seconds(offset) > this.getPlayer().duration ){
				$(".share-alert").text(this.locale.errDuration).show();
				return false;
			}
			if ( parseInt(offset) > 59 && offset.indexOf(":") === -1 ){
				$(".share-alert").text(this.locale.errFormat).show();
				return false;
			}
			if ( mw.npt2seconds(offset) === 0 ){
				return false;
			}
			return true;
		},
		closeScreen: function(){
			if (this.getPlayer().getPlayerElement()) {
				$(  "#" + this.getPlayer().getPlayerElement().id ).removeClass( "blur" );
				this.getPlayer().getPlayerPoster().removeClass( "blur" );
			}
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

		openPopup: function (e, network) {

			// Maintain backward compatibility 
			if( e && e.originalEvent ) {
				network = {
					id: $(e.target).attr('id'),
					url: $(e.target).parents('a').attr('href')
				};
			}

			var embedPlayer = this.getPlayer();
			var url = network.url;
			url = decodeURIComponent(url);        // url was encoded to keep curly brackets for template tokens
			url = this.getPlayer().evaluate(url); // replace tokens
			url = url.replace('#','%23'); // encode hash sign to keep time offset
			var networks = this.getConfig('shareConfig');
			// send event for analytics
			$( embedPlayer ).trigger( "socialShareEvent", networks[network.id] );
			if (mw.isNativeApp()) {
				var id = network.id;
				var shareParams = {
					actionType: 'share',
					id: id[0].toUpperCase() + id.substr(1),
					sharedLink: this.getConfig("shareURL"),
					shareNetwork: networks[id],
					thumbnail: this.getThumbnailURL(),
					videoName: this.getPlayer().evaluate("{mediaProxy.entry.name}")
				};
				embedPlayer.doNativeAction(JSON.stringify(shareParams));
			} else {
				if ( mw.isIphone() && url.indexOf("mailto") === 0){
					e.preventDefault();
					window.location = url;
				}else{
					var opener = window.open(url,'_blank','width=626,height=436');
					// close the window if this is an email
					if (url.indexOf("mailto") === 0){
						setTimeout(function(){
							if (opener && typeof opener.close === 'function') {
								opener.close();
							}
						},2000);
					}
				}
				return false;
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

			// replace properties that come from configuration
			if (embedConfig["uiconfID"]){
				embedCode = embedCode.split("{configProxy.kw.uiConfId}").join(embedConfig["uiconfID"]);
			}
			if ( embedConfig["streamerType"] ){
				embedCode = embedCode.replace( /streamerType\]=(.*?)"/ ,'streamerType]=' + embedConfig["streamerType"] + '"');
			}
			if ( embedConfig["width"] ){
				embedCode = embedCode.replace( /width="(.*?)"/ ,'width="' + embedConfig["width"] + '"');
			}
			if ( embedConfig["height"] ){
				embedCode = embedCode.replace( /height="(.*?)"/ ,'height="' + embedConfig["height"] + '"');
			}
			if ( embedConfig["borderWidth"] ){
				embedCode = embedCode.replace( /frameborder="(.*?)"/ ,'frameborder="' + embedConfig["borderWidth"] + '"');
			}
			// replace tokens in template
			embedCode = embedPlayer.evaluate(embedCode);
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
			var uiConfId = this.getConfig("shareUiconfID") ? this.getConfig("shareUiconfID") : this.getPlayer().kuiconfid;
			return mw.getConfig('Kaltura.ServiceUrl') + '/index.php/extwidget/preview' +
				'/partner_id/' + this.getPlayer().kpartnerid +
				'/uiconf_id/' + uiConfId +
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
