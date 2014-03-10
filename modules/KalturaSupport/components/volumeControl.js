( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'volumeControl', mw.KBaseComponent.extend({

	defaultConfig: {
		parent: "controlsContainer",
		order: 11,
		layout: "horizontal",
		showTooltip: true,
		displayImportance: "medium",
		accessibleControls: false,
		accessibleVolumeChange: 0.1,
		showSlider: true
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
		// If the slider should be shown; 
		if( this.getConfig('showSlider' ) ){
			var openSlider = function(){
				_this.getComponent().addClass('open');
			};
			var closeSlider = function(){
				_this.getComponent().removeClass('open');
			};
		}

		// Save component width on data attribute ( used for responsive player )
		this.bind('layoutBuildDone', function(){
			openSlider();
			// Firefox unable to get component width correctly without timeout
			setTimeout(function(){
				_this.getComponent().data('width', _this.getComponent().width() );
				closeSlider();					
			}, 100);
		});
		// Add click bindings
		this.getBtn().click( function() {
			if( !_this.getPlayer().isMuted() ){
				_this.updateTooltip(gM( 'mwe-embedplayer-volume-unmute' ));
				_this.setAccessibility(_this.getBtn(), gM( 'mwe-embedplayer-volume-unmute' ));
			} else {
				_this.updateTooltip(gM( 'mwe-embedplayer-volume-mute' ));
				_this.setAccessibility(_this.getBtn(), gM( 'mwe-embedplayer-volume-mute' ));
			}
			_this.getPlayer().toggleMute();
		} );
		if (this.getConfig("accessibleControls")){
			this.getAccessibilityBtn('increaseVolBtn').click( function() {
				if (_this.getPlayer().volume <= (1 - _this.getConfig("accessibleVolumeChange"))){
					_this.getPlayer().setVolume(_this.getPlayer().volume + _this.getConfig("accessibleVolumeChange"), true);
				}
			} );
			this.getAccessibilityBtn('decreaseVolBtn').click( function() {
				if (_this.getPlayer().volume >= _this.getConfig("accessibleVolumeChange")){
					_this.getPlayer().setVolume(_this.getPlayer().volume - _this.getConfig("accessibleVolumeChange"), true);
				}
			} );
		}
		this.getBtn().focusin(openSlider);
		this.getBtn().focusout(closeSlider);
		this.getComponent().hover(openSlider, closeSlider);

		this.bind( 'volumeChanged', function(e, percent){
			_this.updateVolumeUI( percent );
		});

		this.getSlider().slider( this.getSliderConfig() );
		if ( this.getConfig( 'accessibilityLabels' ) ){
			var percent = this.getPlayer().getPlayerElementVolume() * 100
			var title = gM('mwe-embedplayer-volume-value', percent );
			this.getSlider().find('a').html('<span class="accessibilityLabel">'+title+'</span>');
		}
	},
	updateVolumeUI: function( percent ){

		var iconClasses = '',
			newClass = '';

		// Get all icons classes
		$.each(this.icons, function(){
			iconClasses += this + ' ';
		});

		// Select icon class based on volume percent
		if ( percent == 0 ){
			newClass = this.icons['mute'];
		} else if( percent <= 0.50 ){
			newClass = this.icons['low'];
		} else if( percent <= 1 ){
			newClass = this.icons['high'];
		}

		// Remove all icon classes and add new one
		this.getBtn().removeClass( iconClasses ).addClass( newClass );

		// Update slider
		this.getSlider().slider( 'value', percent * 100 );
		if ( this.getConfig( 'accessibilityLabels' ) ){
			var title = gM('mwe-embedplayer-volume-value', percent * 100 );
			this.getSlider().find('a').html('<span class="accessibilityLabel">'+title+'</span>');
		}
	},
	getComponent: function() {
		if( !this.$el ) {
			var layoutClass = ' ' + this.getConfig('layout');
			var $btn = $( '<button />' )
						.addClass( "btn " + this.icons['high'] )
						.attr( {'title': gM( 'mwe-embedplayer-volume-mute' ) ,'id': 'muteBtn'});
			this.setAccessibility($btn, gM( 'mwe-embedplayer-volume-mute' ));
			// Add the volume control icon
			this.$el = $('<div />')
				.addClass( this.getCssClass() + layoutClass )
				.append(
					$btn,
					$( '<div />' ).addClass( 'slider' )
				);
			// add accessibility controls
			if (this.getConfig("accessibleControls")){
				var $accessibilityIncreaseVol = $('<button/>')
					.addClass( "btn aria")
					.attr({"id":"increaseVolBtn","title": gM("mwe-embedplayer-volume-increase")});
				var $accessibilityDecreaseVol = $('<button/>')
					.addClass( "btn aria")
					.attr({"id":"decreaseVolBtn","title": gM("mwe-embedplayer-volume-decrease")});
				this.$el.append($accessibilityIncreaseVol).append($accessibilityDecreaseVol);
			}
		}
		return this.$el;
	},
	getBtn: function(){
		return this.getComponent().find( '#muteBtn' );
	},
	getSlider: function(){
		return this.getComponent().find('.slider');
	},
	getAccessibilityBtn : function(id){
		return this.getComponent().find( '#'+id );
	}
}));

} )( window.mw, window.jQuery );