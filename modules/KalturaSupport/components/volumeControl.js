( function( mw, $ ) {"use strict";

	mw.PluginFactory.define( 'volumeControl', mw.KBaseComponent.extend({

		defaultConfig: {
			layout: "horizontal"
		},

		offIconClass: 'icon-volume-mute',
		onIconClass: 'icon-volume-high',		

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return mw.getConfig( 'EmbedPlayer.EnableVolumeControl');
		},
		getComponent: function() {
			if( !this.$el ) {
				var layoutClass = ' ' + this.getConfig('layout');
				// Add the volume control icon
				this.$el = $('<div />')
				 	.attr( 'title', gM( 'mwe-embedplayer-volume_control' ) )
				 	.addClass( "volumeControl" + layoutClass )
				 	.append(
				 		$( '<button />' ).addClass( "btn " + this.onIconClass ),
				 		$( '<div />' ).addClass( 'slider' )

				 	);
			}
			return this.$el;
		},		
		addBindings: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();
			var $volumeBtn = this.getComponent().find( 'button' );

			// Add click bindings
			$volumeBtn.click( function() {
				embedPlayer.toggleMute();
			} );
			this.bind('onToggleMute', function() {
				$volumeBtn.toggleClass( _this.offIconClass + ' ' + _this.onIconClass );
			});

			var userSlide = false;
			// Setup volume slider:
			var sliderConf = {
				range: "min",
				value: 80,
				min: 0,
				max: 100,
				slide: function( event, ui ) {
					var percent = ui.value / 100;
					mw.log('PlayerLayoutBuilder::slide:update volume:' + percent);
					embedPlayer.setVolume( percent );
					userSlide = true;
				},
				change: function( event, ui ) {
					var percent = ui.value / 100;
					if ( percent == 0 ) {
						$volumeBtn.removeClass( _this.onIconClass).addClass( _this.offIconClass );
					} else {
						$volumeBtn.removeClass( _this.offIconClass).addClass( _this.onIconClass );
					}
					mw.log('PlayerLayoutBuilder::change:update volume:' + percent);
					embedPlayer.setVolume( percent, userSlide );
					userSlide = false;
				}
			};

			this.getComponent().find('.slider').slider( sliderConf );			
		}
	})
	);

} )( window.mw, window.jQuery );