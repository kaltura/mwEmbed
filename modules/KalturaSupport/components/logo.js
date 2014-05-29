( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'logo', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "controlsContainer",
			order: 41,
			displayImportance: 'low',
			align: "right",
			cssClass: "kaltura-logo",
			href: 'http://www.kaltura.com',
			title: 'Kaltura',
			img: null
		},
		getComponent: function() {
			if( !this.$el ) {
				var $img = [];
				if( this.getConfig('img') ){
					$img = $( '<img />' )
								.attr({
									alt: this.getConfig('title'),
									src: this.getConfig('img')
								});
				}
				this.$el = $('<div />')
					.addClass ( this.getCssClass() )
					.addClass('btn')
					.append(
					$( '<a />' )
						.addClass('btnFixed')
						.attr({
							'title': this.getConfig('title'),
							'target': '_blank',
							'href': this.getConfig('href')
						}).append( $img )
					);
			}
			// remove Kaltura logo image if we have a custom logo icon
			if (this.getConfig('img') != null){
				this.$el.removeClass('kaltura-logo');
			}
			return this.$el;
		}

	}));

} )( window.mw, window.jQuery );