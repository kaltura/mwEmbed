( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'logo', mw.KBaseComponent.extend({

		defaultConfig: {
			align: "right",			
			parent: "controlsContainer",
			cssClass: "kaltura-logo",
         	order: 4,
			href: 'http://www.kaltura.com',
			title: 'Kaltura'         	
		},
		
		setup: function(){
			var _this = this;
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<a />' )
							.addClass ( this.getCssClass() )
							.attr({
								'title': this.getConfig('title'),
								'href': this.getConfig('href')
							});
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );