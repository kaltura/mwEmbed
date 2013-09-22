( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playbackRateSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 61,
         	"align": "right",
         	"showTooltip": true,
         	'defaultSpeed': '1',
			'speeds': ".5,.75,1,1.5,2",
			'enableKeyboardShortcuts': true
		},

		isDisabled: false,

		isSafeEnviornment: function(){
			var _this = this,
				deferred = $.Deferred();

			this.bind('playerReady', function(){
				deferred.resolve((_this.getPlayer().instanceOf === 'Native'));
			});
			return deferred.promise();
		},

		setup: function(){
			this.currentSpeed = this.getConfig('defaultSpeed');
			this.speedSet = this.getConfig('speeds').split(',');
			this.addBindings();
		},

		addBindings: function(){
			var _this = this;
			this.bind( 'playerReady', function(){
				_this.buildMenu();
			});
			this.bind( 'playbackRateChangeSpeed', function(e, arg ){
				_this.setSpeedFromApi( arg );
			});
			if( this.getConfig('enableKeyboardShortcuts') ){
				this.bind( 'addKeyBindCallback', function( e, addKeyCallback ){
					_this.addKeyboardShortcuts( addKeyCallback );
				});
			}
		},
		// API for this plugin. With this API any external plugin or JS code will be able to set 
		// a specific speed, or a faster/slower/fastest/slowest 
		setSpeedFromApi: function( arg ) {
			var newSpeed;
			switch(arg){
				case 'faster':
					newSpeed = this.getFasterSpeed();
				break;
				case 'fastest':
					newSpeed = this.speedSet[this.speedSet.length-1] ;
				break;
				case 'slower':
					newSpeed = this.getSlowerSpeed();
				break;
				case 'slowest':
					newSpeed = this.speedSet[0] ;
				break;
				default:
					newSpeed = arg;
				break
			}
			this.setSpeed(newSpeed);
		},
		addKeyboardShortcuts: function( addKeyCallback ){
			var _this = this;
			// Add + Sign for faster speed
			addKeyCallback( 'shift+187', function(){
				_this.setSpeed( _this.getFasterSpeed() );
			});
			// Add - Sigh for slower speed
			addKeyCallback( 189, function(){
				_this.setSpeed( _this.getSlowerSpeed() );
			});
			// Add = Sigh for normal speed
			addKeyCallback( 187, function(){
				_this.setSpeed( _this.getConfig('defaultSpeed') );
			});
		},		

		getFasterSpeed: function(){
			if( this.speedSet[this.getCurrentSpeedIndex()+1] ){
				return this.speedSet[this.getCurrentSpeedIndex()+1];
			}
			return this.speedSet[this.getCurrentSpeedIndex()];
		},
		getSlowerSpeed: function(){
			if( this.speedSet[this.getCurrentSpeedIndex()-1] ){
				return this.speedSet[this.getCurrentSpeedIndex()-1];
			}
			return this.speedSet[this.getCurrentSpeedIndex()];
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
					'active': active
				});
			});
		},
		setSpeed: function( newSpeed ){
			this.log('Set Speed to: ' + newSpeed);
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