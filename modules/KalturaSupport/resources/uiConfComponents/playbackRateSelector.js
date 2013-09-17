( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playbackRateSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 61,
         	"align": "right",
         	"showTooltip": true,
         	'defaultSpeed': '1',
			'speeds': ".5,.75,1,1.5,2"
		},

		isDisabled: false,

		setup: function(){
			var _this = this;

			this.currentSpeed = this.getConfig('defaultSpeed');
			this.speedSet = this.getConfig('speeds').split( ',' );

			this.bind( 'playerReady', function(){
				_this.buildMenu();
			});

			// API for this plugin. With this API any external plugin or JS code will be able to set 
			// a specific speed, or a faster/slower/fastest/slowest 
			this.bind( 'playbackRateChangeSpeed', function( event, arg ) {
				var newSpeed,
					speedSet = _this.speedSet;
				switch(arg){
					case 'faster':
						newSpeed = speedSet[_this.getCurrentSpeedIndex()+1] ? speedSet[_this.getCurrentSpeedIndex()+1] : speedSet[_this.getCurrentSpeedIndex()];
					break;
					case 'fastest':
						newSpeed = speedSet[speedSet.length-1] ;
					break;
					case 'slower':
						newSpeed = speedSet[_this.getCurrentSpeedIndex()-1] ? speedSet[_this.getCurrentSpeedIndex()-1] : speedSet[_this.getCurrentSpeedIndex()];
					break;
					case 'slowest':
						newSpeed = speedSet[0] ;
					break;
					default:
						newSpeed = arg;
					break
				}
				_this.log('Set Speed to: ' + newSpeed);
				_this.setSpeed(newSpeed);
			});			
		},

		buildMenu: function(){	
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();

			$.each( this.speedSet, function( idx, speedFloat ){
				var active = ( _this.currentSpeed == speedFloat ) ? true : false;
				_this.getMenu().addItem({
					'label': speedFloat + 'x',
					'callback': function(){
						_this.setSpeed( speedFloat );
					},
					'active': active,
					'divider': ( idx !== _this.speedSet.length-1 )
				});
			});
		},
		setSpeed: function( newSpeed ){
			this.currentSpeed = newSpeed;
			this.getPlayer().getPlayerElement().playbackRate = newSpeed;
			this.getBtn().text( newSpeed + 'x' );
			this.getPlayer().triggerHelper( 'updatedPlaybackRate', newSpeed);
		},
		getCurrentSpeedIndex: function(){
			var _this = this;
			var index = null;
			$.each(this.speedSet, function( idx, speed){
				if( _this.currentSpeed == speed ){
					index = idx;
					return true;
				}
			});
			return index;
		},
		toggleMenu: function(){
			if ( this.isDisabled ) {
				return;
			}
			this.getMenu().toggle();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $menu = $( '<ul />' );
				var $button = $( '<button />' )
								.addClass( 'btn' )
								.attr('title', 'Playback Speed')
								.text( this.currentSpeed + 'x' )
								.click( function(e){
									_this.toggleMenu();
								});

				this.$el = $( '<div />' )
								.addClass( 'dropup' + this.getCssClass() )
								.append( $button, $menu );
			}
			return this.$el;
		},
		getMenu: function(){
			if( !this.menu ) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex')
				});
			}
			return this.menu;			
		},
		getBtn: function(){
			return this.getComponent().find( 'button' );
		},
		onEnable: function(){
			this.isDisabled = false;
			this.getBtn().removeClass( 'disabled' );
		},
		onDisable: function(){
			this.isDisabled = true;
			this.getComponent().removeClass( 'open' );
			this.getBtn().addClass( 'disabled' );
		},
	}));

} )( window.mw, window.jQuery );