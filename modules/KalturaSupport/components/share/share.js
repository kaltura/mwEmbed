( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'share', mw.KBaseScreen.extend({

	defaultConfig: {
		parent: "topBarContainer",
		order: 5,
		align: "right",
		tooltip: 'Share',
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
                url: 'https://www.facebook.com/sharer/sharer.php?u='
            });
        if (socialNetworks.indexOf("twitter") != -1)
            networks.push({
                id: 'twitter',
                name: 'Twitter',
                cssClass: 'icon-twitter',
                url: 'https://twitter.com/share?url='
            });
        if (socialNetworks.indexOf("googleplus") != -1)
            networks.push({
                id: 'googleplus',
                name: 'Google+',
                cssClass: 'icon-google-plus',
                url: 'https://plus.google.com/share?url='
            });

		return {
			'share' : this,
			networks: networks
		};
	},
	openPopup: function( e ){
		var url = $(e.target).parents('a').attr('href');
		// Name argument for window.open in IE8 must be from supported set: _blank for example
		// http://msdn.microsoft.com/en-us/library/ms536651%28v=vs.85%29.aspx
		window.open(
			url + encodeURIComponent( this.getConfig('shareURL')),
			'_blank',
			'width=626,height=436'
		);
	}
}));

} )( window.mw, window.jQuery );