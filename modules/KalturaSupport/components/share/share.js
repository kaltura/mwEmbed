( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'share', mw.KBaseScreen.extend({

	defaultConfig: {
		parent: "topBarContainer",
		order: 5,
		align: "right",
		tooltip: 'Share',
		showTooltip: true,
		displayImportance: 'medium',
		usePreviewPlayer: true,
		previewPlayerEnabled: true,
		socialShareEnabled: true,
		socialShareURL: 'smart', // 'parent' / 'http://custom.url/entry/{mediaProxy.entry.id}'
		socialNetworks: 'facebook,twitter,googleplus',
		shareOffset: true,
		templatePath: 'components/share/share.tmpl.html'
	},
	iconBtnClass: "icon-share",
	setup: function(){
		this.setupPlayerURL();
		this.addBindings();

	},
	setupPlayerURL: function(){
		var shareURL = null;
		switch( this.getConfig('socialShareURL') ){
            case 'smart':
                shareURL = this.getSmartURL();
            break;
            case 'parent':
                shareURL = this.getParentURL();
            break;
            default:
                shareURL = this.getConfig("socialShareURL");
		}
		if( shareURL ) {
			this.setConfig('shareURL', shareURL);
		}
	},
	addBindings: function() {
		var _this = this;
		this.bind('playerReady', function( ){
			_this.setupPlayerURL();
		});
		//
	},

	getParentURL: function(){
		return ( mw.getConfig( 'EmbedPlayer.IframeParentUrl') ) ?
				mw.getConfig( 'EmbedPlayer.IframeParentUrl') : document.URL;
	},
	getKalturaShareURL: function(){
		return mw.getConfig('Kaltura.ServiceUrl') + '/index.php/extwidget/preview' +
				'/partner_id/' + this.getPlayer().kpartnerid +
				'/uiconf_id/' + this.getPlayer().kuiconfid +
				'/entry_id/' + this.getPlayer().kentryid + '/embed/dynamic';
	},
	getSmartURL: function(){
		var shareURL = this.getKalturaShareURL();
		if(  mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
			try {
				var $parentDoc = $( window['parent'].document );
				var hasOpenGraphTags = $parentDoc.find('meta[property="og:video"]').length;
				var hasTwitterCardsTags = $parentDoc.find('meta[name="twitter:player"]').length;
				if( hasOpenGraphTags || hasTwitterCardsTags ){
					shareURL = this.getParentURL();
				}
			} catch (e) {}
		}
		return shareURL;
	},
	getTemplateData: function(){
		var networks = [];
		var socialNetworks = this.getConfig("socialNetworks");
		if (socialNetworks.indexOf("facebook") != -1)
			networks.push({
				id: 'facebook',
				name: 'Facebook',
				cssClass: 'icon-facebook',
				url: 'https://www.facebook.com/sharer/sharer.php?u=',
				redirectUrl: 'fb://feed/'
			});
		if (socialNetworks.indexOf("twitter") != -1)
			networks.push({
				id: 'twitter',
				name: 'Twitter',
				cssClass: 'icon-twitter',
				url: 'https://twitter.com/share?url=',
				redirectUrl:'https://twitter.com/intent/tweet/complete?,https://twitter.com/intent/tweet/update'
			});
		if (socialNetworks.indexOf("googleplus") != -1)
			networks.push({
				id: 'googleplus',
				name: 'GooglePlus',
				cssClass: 'icon-google-plus',
				url: 'https://plus.google.com/share?url=',
				redirectUrl: 'https://plus.google.com/app/basic/stream'
			});
		if (socialNetworks.indexOf("mail") != -1)
			networks.push({
				id: 'email',
				name: 'Mail',
				cssClass: 'icon-mail',
				url: 'http://',
				redirectUrl: ''
			});
		if (socialNetworks.indexOf("message") != -1)
			networks.push({
				id: 'message',
				name: 'Message',
				cssClass: 'icon-message',
				url: 'http://',
				redirectUrl: ''
			});

		return {
			'share' : this,
			networks: networks
		};
	},
	openPopup: function( e ) {
		debugger;
		// Name argument for window.open in IE8 must be from supported set: _blank for example
		// http://msdn.microsoft.com/en-us/library/ms536651%28v=vs.85%29.asp

		if(mw.getConfig( "EmbedPlayer.ForceNativeComponent" )){
			// Prepare a JSON string for sending to the native app
			var socialNetworks = this.getConfig("socialNetworks").split(',');
			var networkIndex = jQuery.inArray($(e.target).attr('id'), socialNetworks);
			var networkParams = this.getTemplateData().networks[networkIndex];
			var shareParams = {
				sharedLink: this.getConfig("shareURL"),
				shareNetwork: networkParams,
				thumbnail: this.getThumbnailURL(),
				videoName: this.getPlayer().evaluate("{mediaProxy.entry.name}")
			};
			this.getPlayer().share( JSON.stringify(shareParams) );
		} else
			var url = $(e.target).parents('a').attr('href');{
			window.open(
				url + encodeURIComponent( this.getConfig('shareURL')),
				'_blank',
				'width=626,height=436'
			);
		}
	},
	getThumbnailURL: function(){
		return kWidgetSupport.getKalturaThumbnailUrl({
				url: this.getPlayer().evaluate('{mediaProxy.entry.thumbnailUrl}'),
				width: this.getPlayer().getWidth(),
				height: this.getPlayer().getHeight()
		});
	}
}));

} )( window.mw, window.jQuery );
