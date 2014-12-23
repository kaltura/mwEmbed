( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'cornellShare', mw.KBaseScreen.extend({

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
		templatePath: 'components/cornellShare/share.tmpl.html',
        metadataKey: "LandingPage",
        metadataProfileId: 3152
	},
	iconBtnClass: "icon-share",
    setup: function(){
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

        this.setConfig('shareURL', embedUrl);

        var embedUrl = 'https://cdnapisec.kaltura.com/p/' +
            this.getPlayer().partner_id + '/sp/' +  this.getPlayer().partner_id + '00/embedIframeJs/uiconf_id/' + this.getPlayer().uiconf_id + '/partner_id/' + this.getPlayer().partner_id + '?iframeembed=true&entry_id=' +
            this.getPlayer().entry_id + ' width="560" height="395" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0" style="width: 560px; height: 395px;"';

        //TODO: Pending server fix for widget service
//        this.getKalturaClient().doRequest( {
//            'service' : 'widget',
//            'action' : 'add',
//            'widget:sourceWidgetId' : '_' + this.getPlayer().partner_id,
//            'widget:entryId' : this.getPlayer().kentryid,
//            'widget:uiConfId' : this.getPlayer().uiconf_id,
//            'widget:securityType': 1, //Set security to none
//            'widget:addEmbedHtml5Support': 1 //Set support for html5
//        }, function( data ) {
//            mw.log( "mw.share plugin: get widget: " + data.totalCount, data.objects );
//            debugger;
//
//            if( data.objects.length ){
//                embedUrl = ""; //Put the new embed code as the embed URL
////                _this.( data.objects, callback );
//            }
//        });

        if( embedUrl ) {
            //Add metadata Logic
            var landingPage = this.getPlayer().kalturaEntryMetaData[ this.getConfig('metadataKey') ];
            if(typeof landingPage !== 'undefined') {
                embedUrl += landingPage;
            }
//            this.setConfig('shareURL', embedUrl);
            this.setupPlayerEmbedCode(embedUrl);
        }
    },
	addBindings: function() {
		var _this = this;
		this.bind('playerReady', function( ){
            _this.setupPlayerURL();
		});
	},
    setupPlayerEmbedCode: function(baseUrl) {
        var playerHeight = this.getPlayer().height;
        var playerWidth = this.getPlayer().width;
        baseUrl += '/embed';
        var embedCode = "<iframe src=" + "'" + baseUrl + "'" + ' width=' + "'" + playerWidth + "'" +  ' height=' + "'" + playerHeight + "'" + ' frameborder=' + "'0'></iframe>";
        this.setConfig('embedCode', embedCode);
    },
	getParentURL: function(){
		return ( mw.getConfig( 'EmbedPlayer.IframeParentUrl') ) ?
				mw.getConfig( 'EmbedPlayer.IframeParentUrl') : document.URL;
	},
	getKalturaShareURL: function(){
        var kalturaShareUrl =  mw.getConfig('Kaltura.ServiceUrl') + 'index.php/extwidget/preview' +
            '/partner_id/' + this.getPlayer().kpartnerid +
            '/uiconf_id/' + this.getPlayer().kuiconfid +
            '/entry_id/' + this.getPlayer().kentryid + '/embed/dynamic';

        return kalturaShareUrl;
	},
	getSmartURL: function(){
        var shareURL = this.getKalturaShareURL();
        if( mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
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



http://www.cornell.edu/video/mysterious-magic-island-appears-on-saturn-moon
<iframe src='http://www.cornell.edu/video/mysterious-magic-island-appears-on-saturn-moon/embed' width='560' height='315' frameborder='0'></iframe>