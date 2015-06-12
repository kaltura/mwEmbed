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
		showSlider: true,
        pinVolumeBar: false,
		useCookie: true

	},
	icons: {
		'mute': 'icon-volume-mute',
		'low': 'icon-volume-low',
		'high': 'icon-volume-high'
	},

	setup: function( embedPlayer ) {
		this.addBindings();
		var _this = this;
		this.cookieName = this.pluginName + '_volumeValue';
		this.bind( 'playerReady ' , function () {
			if ( (_this.getConfig( 'useCookie' ) && $.cookie( _this.cookieName ) ) ) {
				var volumeValue = parseInt( $.cookie( _this.cookieName ) );
				if ( !isNaN( volumeValue ) &&
					volumeValue >= 0 &&
					volumeValue <= 100 ) {
					if ( volumeValue === 0 ) {
						_this.getPlayer().preMuteVolume = 1;
						_this.getPlayer().muted = true;
						_this.updateFirstMute = true;
					}
					_this.firstUpdate = true;
					_this.getPlayer().setVolume( volumeValue / 100 , true );
				}
			}
		});

	},
	saveVolume: function(){
		if (this.firstUpdate){
			this.firstUpdate = false;
			return;
		}
		if( this.getConfig( 'useCookie' ) ){
			this.getPlayer().setCookie( this.cookieName ,this.getPlayer().getPlayerElementVolume() * 100 , {path: '/'});
		}
	},
	isSafeEnviornment: function(){
		return !mw.isMobileDevice();
	},
	getSliderConfig: function(){
		var _this = this;
		return {
			orientation: this.getConfig("layout"),
			range: "min",
			value: (this.getPlayer().getPlayerElementVolume() * 100),
			min: 0,
			max: 100,
			slide: function( event, ui ){
				_this.getPlayer().setVolume( (ui.value / 100) , true );
			},
			change: function( event, ui ) {
				_this.getPlayer().setVolume( (ui.value / 100) , true );
			}
		};
	},
	addBindings: function() {
		var _this = this;
		var mouseOverSlider = false;
		// If the slider should be shown; 
		if( this.getConfig('showSlider' ) ) {
			var openSlider = function () {
				// restore transition on hover
				_this.getComponent().removeClass( 'noTransition' );
				_this.getComponent().addClass( 'open' );
				if ( _this.getConfig( 'layout' ) === "vertical"){
					_this.getPlayer().triggerHelper("onShowSideBar"); // prevent hovering controls from closing during volume setup
				}
			};
			var closeSlider = function () {
				if ( _this.getConfig( 'layout' ) === "horizontal" && !_this.getConfig( 'pinVolumeBar' ) ) {
					_this.getComponent().removeClass( 'open' );
				}
				if ( _this.getConfig( 'layout' ) === "vertical" ) {
					setTimeout(function(){
						if (!mouseOverSlider){
							_this.getComponent().removeClass( 'open' );
							_this.getPlayer().triggerHelper("onHideSideBar"); // re-enable hovering controls
						}
					},350);

				}
			};

			// Save component width on data attribute ( used for responsive player )
			this.bind( 'layoutBuildDone' , function () {
				if ( _this.getConfig( 'layout' ) === "horizontal"){
					// open slider with noTransition:
					openSlider();
					_this.getComponent().addClass( 'noTransition' );
					// Firefox unable to get component width correctly without timeout
					setTimeout(function(){
						// update the slider expand space:
						_this.getComponent().data( 'width' , _this.getComponent().width() );
						// close the slider ( if not pinned )
						closeSlider();
					},100);
				}
			} );
		}
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
			if ( _this.updateFirstMute ){
				_this.updateFirstMute = false;
				_this.updateVolumeUI(1);
			}
			_this.saveVolume();

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
		this.getSliderContainer().hover(function(){mouseOverSlider = true},function(){mouseOverSlider = false});

		this.bind( 'volumeChanged', function(e, percent){
			_this.updateVolumeUI( percent );
			_this.saveVolume();

		});

		this.getSlider().slider( this.getSliderConfig() );
		if ( this.getConfig( 'accessibilityLabels' ) ){
			var percent = this.getPlayer().getPlayerElementVolume() * 100;
			var title = gM('mwe-embedplayer-volume-value', percent );
            var $slider = this.getSlider().find('a');
            $slider.html('<span class="accessibilityLabel">'+title+'</span>');
            $slider.attr("role", "paragraph");
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
			var $sliderContainer = $( '<div />' ).addClass( 'sliderContainer' );
			if (this.getConfig("layout")=="vertical"){
				$sliderContainer.append($( '<div />' ).addClass( 'slider' ));
			}else{
				$sliderContainer = $( '<div />' ).addClass( 'slider' );
			}
			this.$el = $('<div />')
				.addClass( this.getCssClass() + layoutClass )
				.append(
					$btn,
					$sliderContainer
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
	},
	getSliderContainer : function(id){
		return this.getComponent().find( '.sliderContainer' );
	}
}));

} )( window.mw, window.jQuery );