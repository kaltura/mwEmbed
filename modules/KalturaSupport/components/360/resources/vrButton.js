( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'vrButton', mw.KBaseComponent.extend({

		defaultConfig: {
			align: "right",
			parent: 'controlsContainer',
			displayImportance: "high",
			showTooltip: true,
			order: 70
		},
		isSafeEnviornment: function(){
			return this.getPlayer().is360();
		},

		setup: function(){
			this.bind( 'playerReady', function() {
				this.hide();
			}.bind(this));

			this.bind( 'firstPlay', function() {
				this.getPlayer().is360() ? this.show() : this.hide();
			}.bind(this));
		},

		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<button />' )
					.attr( 'title', 'VR' )
					.addClass( "btn icon-vr" + this.getCssClass() )
					.click( function() {
						this.getPlayer().triggerHelper('toggleVR');
					}.bind(this));
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );
