( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nextPrevBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'accessibleControls': false,
			'layout': "horizontal",
			'order': 5,
			'showTooltip': true,
			"displayImportance": "medium"
		},

		isDisabled: false,

		nextIconClass: 'icon-next',
		prevIconClass: 'icon-prev',

		nextTitle: gM( 'mwe-embedplayer-next_clip' ),
		prevTitle: gM( 'mwe-embedplayer-prev_clip' ),

		setup: function( embedPlayer ) {

		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $nextBtn = $( '<button />' )
					.attr( 'title', this.nextTitle )
					.addClass( "btn btnNarrow icon-next" )
					.click( function() {
						alert("next");
					});
				var $prevBtn = $( '<button />' )
					.attr( 'title', this.prevTitle )
					.addClass( "btn btnNarrow icon-prev" )
					.click( function() {
						alert("prev");
					});

				var layoutClass = ' ' + this.getConfig('layout');
				this.$el = $('<div />')
					.addClass( this.getCssClass() + layoutClass )
					.append($prevBtn, $nextBtn);
			}
			return this.$el;
		}
	})
	);

} )( window.mw, window.jQuery );
