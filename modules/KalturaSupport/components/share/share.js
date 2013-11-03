( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'share', mw.KBaseComponent.extend({

	defaultConfig: {
		parent: "topBarContainer",
		order: 5,
		align: "right",
		socialShareEnabled: true,
		socialShareURL: 'smart', // 'parent' / 'http://custom.url/entry/{mediaProxy.entry.id}'
		socialNetworks: 'facebook,twitter,googleplus',
		shareOffset: true,
		templatePath: 'components/share/share.tmpl.html'
	},
	$screen: null,
	disablePreviewPlayer: false,
	setup: function(){
		this.setupPlayerURL();
		this.setNetworksData();
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
			this.setConfig('socialShareURL', shareURL);
		}
	},
	getParentURL: function(){
		return ( mw.getConfig( 'EmbedPlayer.IframeParentUrl') ) ? 
					mw.getConfig( 'EmbedPlayer.IframeParentUrl') : document.URL;
	},
	getKalturaShareURL: function(){
		// TODO
		return 'http://cdnapi.kaltura.com/extwidget/';
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
	setNetworksData: function(){
		this.templateData = {
			networks: [
				{
					id: 'facebook', 
					name: 'Facebook', 
					cssClass: 'icon-facebook', 
					url: 'https://www.facebook.com/sharer/sharer.php?u=' 
				},
				{
					id: 'twitter', 
					name: 'Twitter', 
					cssClass: 'icon-twitter',
					url: 'https://twitter.com/share?url='
				},
				{
					id: 'googleplus', 
					name: 'Google+', 
					cssClass: 'icon-google-plus',
					url: 'https://plus.google.com/share?url='
				}
			]
		};
	},
	addBindings: function(){
		var _this = this;
		this.bind('playerReady', function(){
			_this.remove();
		});
		this.bind('onplay', function(){
			if( _this.getScreen().is(':visible') ){
				if( _this.hasPreviewPlayer() ){
					_this.resizePlayer();
				} else {
					_this.hide();
				}
			}
		});
		this.bind('playerSizeChanged', function(e, size){
			if( size == 'tiny' ){
				_this.disablePreviewPlayer = true;
			} else {
				_this.disablePreviewPlayer = false;
			}
		});
	},
	resizePlayer: function(){
		this.getPlayer().getInterface().addClass('previewPlayer');
	},
	restorePlayer: function(){
		this.getPlayer().getInterface().removeClass('previewPlayer');
	},
	remove: function(){
		if( this.$screen ){
			this.$screen.remove();
		}
	},
	hide: function(){
		// Resume playing if we don't have preview player
		if( this.wasPlaying && !this.hasPreviewPlayer() ) {
			this.getPlayer().play();
		}			
		this.restorePlayer();
		this.getPlayer().restoreComponentsHover();		
		this.getScreen().fadeOut(400);
	},
	show: function(){
		this.wasPlaying = this.getPlayer().isPlaying();
		if( this.wasPlaying && !this.hasPreviewPlayer() ) {
			this.getPlayer().pause();
		}
		if( this.hasPreviewPlayer() ){
			this.resizePlayer();
		}		
		this.getPlayer().disableComponentsHover();
		this.getScreen().fadeIn(400);
	},
	toggle: function(){
		if( this.getScreen().is(':visible') ){
			this.hide();
		} else {
			this.show();
		}
	},
	openPopup: function( e ){
		var url = $(e.target).attr('href');
		window.open( 
			url + encodeURIComponent( this.getConfig('socialShareURL')), 
			'share-dialog', 
			'width=626,height=436'
		);
	},
	hasPreviewPlayer: function(){
		return this.getScreen().find('.videoPreview').length && !this.disablePreviewPlayer;
	},
	getScreen: function(){
		if( ! this.$screen ){
			var _this = this;
			this.$screen = $('<div />')
								.addClass( 'screen ' + this.pluginName )
								.append( 
									$('<div class="screen-content" /> ').append(
										this.getTemplateHTML(this.templateData)
									)
								);

			// Create expand button
			var $expandBtn = $( '<i />' )
							.addClass( 'expandPlayerBtn icon-expand2' )
							.click(function(){
								_this.hide();
							});

			this.$screen.find('.popup').click(function(e){
				e.preventDefault();
				_this.openPopup(e);
				return false;
			});2

			this.getPlayer().getVideoHolder().append( this.$screen );
			this.getPlayer().getVideoDisplay().append( $expandBtn );
		}
		return this.$screen;
	},
	getComponent: function() {
		if( !this.$el ) {	
			var _this = this;
			this.$el = $( '<button />' )
						.attr( 'title', 'Share' )
						.addClass( "btn icon-share" + this.getCssClass() )
						.click( function(){
							_this.toggle();
						});
			
		}
		return this.$el;
	}
}));

} )( window.mw, window.jQuery );