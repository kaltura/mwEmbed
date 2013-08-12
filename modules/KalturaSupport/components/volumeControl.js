( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'volumeControl', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "controlsContainer",
         	order: 11,
			layout: "horizontal"
		},

		icons: {
			'mute': 'icon-volume-mute',
			'low': 'icon-volume-low',
			'med': 'icon-volume-medium',
			'high': 'icon-volume-high'
		},		

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return !mw.isMobileDevice() && mw.getConfig( 'EmbedPlayer.EnableVolumeControl');
		},
		getSliderConfig: function(){
			var _this = this;
			return {
				range: "min",
				value: 80,
				min: 0,
				max: 100,
				change: function( event, ui ) {
					_this.getPlayer().setVolume( (ui.value / 100) , true );
				}
			}
		},
		addBindings: function() {
			var _this = this;

			// Add click bindings
			this.getBtn().click( function() {
				_this.getPlayer().toggleMute();
			} );
			// TODO: should be CSS based
			this.getComponent().hover(
				function(){
					_this.getComponent().addClass('open');
				},function(){
					_this.getComponent().removeClass('open');
				}
			);

			this.bind( 'volumeChanged', function(e, percent){
				_this.updateVolumeUI( percent );
			});

			this.getSlider().slider( this.getSliderConfig() );			
		},
		updateVolumeUI: function( percent ){
			// All icons classes
			var iconClasses = '';
			$.each(this.icons, function(){
				iconClasses += this + ' ';
			});

			var $btn = this.getBtn();

			// First remove all icons classes
			$btn.removeClass( iconClasses );

			// Update button state
			if ( percent == 0 ) {
				$btn.addClass( this.icons['mute'] );
			} else if( percent <= 0.33 ) {
				$btn.addClass( this.icons['low'] );
			} else if( percent <= 0.66 ) {
				$btn.addClass( this.icons['med'] );
			}  else if( percent <= 1 ) {
				$btn.addClass( this.icons['high'] );
			}

			// Update slider
			this.getSlider().slider( 'value', percent * 100 );			
		},
		getComponent: function() {
			if( !this.$el ) {
				var layoutClass = ' ' + this.getConfig('layout');
				// Add the volume control icon
				this.$el = $('<div />')
				 	.attr( 'title', gM( 'mwe-embedplayer-volume_control' ) )
				 	.addClass( this.getCssClass() + layoutClass )
				 	.append(
				 		$( '<button />' ).addClass( "btn " + this.icons['high'] ),
				 		$( '<div />' ).addClass( 'slider' )
				 	);
			}
			return this.$el;
		},
		getBtn: function(){
			return this.getComponent().find( 'button' );
		},
		getSlider: function(){
			return this.getComponent().find('.slider');
		}		
	})
	);

} )( window.mw, window.jQuery );