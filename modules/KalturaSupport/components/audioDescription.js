( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'audioDescription', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 60,
			'displayImportance': 'high',
			'align': 'right',
			'showTooltip': true,
			'file': null,
			'volume': 1
		},

		selected: true,
		enableAD: gM( 'mwe-embedplayer-enable-audio-description' ),
		disableAD: gM( 'mwe-embedplayer-disable-audio-description' ),

		setup: function() {
			var _this = this;
			if ( kWidget.supportsFlash() ) {
				mw.setConfig( 'EmbedPlayer.ForceKPlayer' , true ); //only kplayer supports audio description
				this.getPlayer().setKalturaConfig('kdpVars', 'audioDescription',
					{ plugin: 'true', volume: this.getConfig( 'volume' ) } );

				this.bind( 'playerReady', function() {
					_this.getPlayer().getPlayerElement().sendNotification( 'audioDescriptionLoadFile', {file: _this.getConfig( 'file' ) } );
				});
			} else { //hide the button if we don't support flash
				this.getComponent().hide();
			}
		},

		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				//TODO change style!
				this.$el = $( '<button />' )
					.attr( 'title', this.disableAD  )
					.addClass( 'btn icon-ad' +  this.getCssClass() )
					.addClass( 'active' )
					.click( function(){
						_this.toggleAD();
					});
			}
			return this.$el;
		},

		toggleAD: function() {
			if ( this.selected ) {
				this.getComponent().removeClass( 'active' );
				this.updateTooltip( this.enableAD );
			} else {
				this.getComponent().addClass( 'active' );
				this.updateTooltip( this.disableAD );
			}
			this.selected = !this.selected;
			this.getPlayer().getPlayerElement().sendNotification( 'audioDescriptionClicked' );
		}

	}))
} )( window.mw, window.jQuery );
