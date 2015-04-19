( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'actionButtons', mw.KBaseScreen.extend({

	defaultConfig: {
		displayOn: "end", // Can be either "end" or "related"
		customDataKey: "ActionButtons", 
		openInNewWindow: true,
		actions: [],
		templatePath: '../CallToAction/templates/action-buttons.tmpl.html'
	},

	setup: function() {

		// Handle custom configuration from entry custom data
		this.handleCustomConfig();

		this.log('Setup -- displayOn: ' + this.getConfig('displayOn'));
		// Show screen at right time
		switch( this.getConfig('displayOn') ) {
			case 'end':
				this.bind('onEndedDone', $.proxy(function(){
					this.showScreen();
				}, this));
				break;
			case 'related':
				this.bind('showScreen', $.proxy(function(e, screenPluginName){
					if( screenPluginName === 'related' ) {
						var $spans = this.getPlayer().getVideoHolder().find('.related > .screen-content').find('span');
						if( $spans.length > 1 ) {
							$spans.eq(1).remove();
						}
						this.getTemplateHTML(this.getTemplateData())
							.then(function(htmlMarkup) {
								$spans.eq(0).after(htmlMarkup);
							}, function(msg) {
								mw.log( msg );
							});
					}
				}, this));
				break;
		}
	},

	handleCustomConfig: function() {
		// Check if the entry has custom configuration
		var customConfig = {};
		if( this.getPlayer().kalturaEntryMetaData[ this.getConfig('customDataKey') ] ) {
			try {
				customConfig = JSON.parse( this.getPlayer().kalturaEntryMetaData[ this.getConfig('customDataKey') ] );
			} catch (e) {}
		}

		// Merge in any custom configuration from entry custom data
		if( $.isPlainObject(customConfig) && !$.isEmptyObject(customConfig) ) {
			$.each(customConfig, $.proxy(function( key, val ){
				this.log('Set custom config "' + key + '": ' + val);
				this.setConfig( key, val );
			}, this));
		}
	},

	getTemplateData: function() {
		return {
			actions: this.getConfig('actions')
		};
	},

	gotoAction: function(e, data) {
		var $a = $(e.target),
			data = {
				id: data.id,
				label: $a.text(),
				url: $a.attr('href')
			};

		// Trigger event for 3rd party plugins
		this.getPlayer().triggerHelper('actionButtonClicked', [data]);
		this.log('Trigger "actionButtonClicked" event with data: ', data);

		if( this.getConfig('openInNewWindow') || !mw.getConfig('EmbedPlayer.IsFriendlyIframe') ) {
			window.open( data.url );
		} else {
			window.parent.location.href = data.url;
		}
	}

}));

} )( window.mw, window.jQuery );