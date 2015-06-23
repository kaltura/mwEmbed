( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playbackRateSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
		 	"order": 61,
		 	"displayImportance": "medium",
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
			if ( mw.isMobileDevice() ){
				return false;
			}
			this.bind('playerReady', function(){
				if ( _this.embedPlayer.isLive() ){
					deferred.resolve(false);
				}
				// check if we have sources that can play with Native library:
				if (_this.embedPlayer.mediaElement.getNativePlayableSources().length > 0){
					deferred.resolve(document.createElement( "video" ).playbackRate);
				}
			});
			return deferred.promise();
		},

		setup: function(){
			this.currentSpeed = Math.abs(this.getConfig('defaultSpeed')) || 1;
			this.speedSet = this.getConfig('speeds').split(',');
			var i;
			for ( i=0; i < this.speedSet.length; i++) {
				this.speedSet[i] = Math.abs( this.speedSet[i] );
			}
			this.addBindings();
		},

		addBindings: function(){
			var _this = this;
			this.bind( 'playerReady', function(){
				_this.buildMenu();
			});
			this.bind( 'onRemovePlayerSpinner', function(){
				 if ( _this.getPlayer().getPlayerElement() ) {
					 _this.getPlayer().getPlayerElement().playbackRate = _this.currentSpeed;
				 }
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
			var _this = this;
			this.log('Set Speed to: ' + newSpeed);
			this.currentSpeed = newSpeed;
			// check if we need to switch interfaces: 
			if( this.getPlayer().instanceOf != 'Native' ){
				this.handlePlayerInstanceUpdate( newSpeed );
				return ;
			}
			this.updatePlaybackRate( newSpeed );
		},
		handlePlayerInstanceUpdate: function( newSpeed ){
			var _this = this;
			var currentPlayTime = this.getPlayer().currentTime;
			var source = this.getPlayer().mediaElement.autoSelectNativeSource();
			var player = mw.EmbedTypes.getMediaPlayers().getNativePlayer( source.mimeType );
			this.getPlayer().selectPlayer ( player );
			this.getPlayer().updatePlaybackInterface( function(){
				// update playback rate:
				if( currentPlayTime == 0 ){
					_this.updatePlaybackRate( newSpeed );
				}else{
					setTimeout(function(){
						_this.bind("seeked", function(){
							_this.updatePlaybackRate( newSpeed );
						});
						_this.getPlayer().seek( currentPlayTime ); // issue a seek if given new seek time
					}, 0);
				}
			});
		},
		/**
		 * updatePlaybackRate issues a call to native player element to update playbackRate to target speed.
		 * @param {float} newSpeed target playback rate in float 1.0 = normal playback rate. 
		 */
		updatePlaybackRate: function( newSpeed ){
			// workaround for Firefox and IE - changing playbackRate before media loads causes player to stuck
			if (this.getPlayer().mediaLoadedFlag){
				this.getPlayer().getPlayerElement().playbackRate = newSpeed;
			}
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