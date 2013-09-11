( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'volumeControl', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "controlsContainer",
         	order: 11,
			layout: "horizontal",
			showTooltip: true
		},

		icons: {
			'mute': 'icon-volume-mute',
			'low': 'icon-volume-low',
			'high': 'icon-volume-high'
		},		

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return !mw.isMobileDevice();
		},
		getSliderConfig: function(){
			var _this = this;
			return {
				range: "min",
				value: (this.getPlayer().getPlayerElementVolume() * 100),
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
				if( _this.getPlayer().isMuted() ){
					_this.getBtn().attr('title', gM( 'mwe-embedplayer-volume-unmute' ));
				} else {
					_this.getBtn().attr('title', gM( 'mwe-embedplayer-volume-mute' ));
				}
				_this.getPlayer().toggleMute();
			} );

			this.getBtn().focusin(function(){
				_this.getComponent().addClass('open');
			});
			this.getBtn().focusout(function(){
				_this.getComponent().removeClass('open');
			});
			
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

			var iconClasses = '', 
				newClass = '';

			// Get all icons classes
			$.each(this.icons, function(){
				iconClasses += this + ' ';
			});

			// Select icon class based on volume percent
			if ( percent == 0 ) {
				newClass = this.icons['mute'];
			} else if( percent <= 0.50 ) {
				newClass = this.icons['low'];
			} else if( percent <= 1 ) {
				newClass = this.icons['high'];
			}			

			// Remove all icon classes and add new one
			this.getBtn().removeClass( iconClasses ).addClass( newClass );

			// Update slider
			this.getSlider().slider( 'value', percent * 100 );			
		},
		getComponent: function() {
			if( !this.$el ) {
				var layoutClass = ' ' + this.getConfig('layout');
				var $btn = $( '<button />' )
				 			.addClass( "btn " + this.icons['high'] )
				 			.attr({
				 				'title': gM( 'mwe-embedplayer-volume-mute' ),
				 				'role' : 'button'
				 			});
				// Add the volume control icon
				this.$el = $('<div />')
				 	.addClass( this.getCssClass() + layoutClass )
				 	.append(
				 		$btn,
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