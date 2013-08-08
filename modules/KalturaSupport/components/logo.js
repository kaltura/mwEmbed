( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'logo', mw.KBaseComponent.extend({

		defaultConfig: {
			align: "right",			
			parent: "controlsContainer",
			cssClass: "kaltura-logo",
         	order: 41,
			href: 'http://www.kaltura.com',
			title: 'Kaltura',
			img: null
		},
		
		setup: function(){
			var _this = this;
		},
		getComponent: function() {
			if( !this.$el ) {
				var $img = [];
				if( this.getConfig('img') ){
					$img = $( '<img />' )
								.attr({
									src: this.getConfig('img')
								});
				}
				this.$el = $( '<a />' )
							.addClass ( this.getCssClass() )
							.attr({
								'title': this.getConfig('title'),
								'target': '_blank',
								'href': this.getConfig('href')
							}).append( $img );
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );