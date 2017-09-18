( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'customButton', mw.KBaseComponent.extend({
			//indicates we were explicitly asked to show the button (will be used when re-enabling the button)
			shouldShow : false,
			isDisabled: false,
			ariaText: '',
			defaultConfig: {
				'parent': 'videoHolder',
				'order': 20,
                'eventName' : 'custom_button_clicked'
			},
			setup: function() {
				this.addBindings();
			},

			addBindings: function() {
				var _this = this;
				$(this.getPlayer()).on('mouseenter', function() {
					_this.show();
				});
                $(this.getPlayer()).on('mouseleave', function(event) {
                    if (event.relatedTarget !== this.getComponent()) {
                    	_this.hide();
					}
                });

				this.bind('onpause onRemovePlayerSpinner', function(){
					if( !_this.embedPlayer.isPlaying() && !_this.embedPlayer.isInSequence() ){
						_this.show();
					}
				});
				this.bind('playing AdSupport_StartAdPlayback onAddPlayerSpinner onHideControlBar', function(){
					_this.hide(true);
				});
				this.bind('onPlayerStateChange', function(e, newState, oldState){
					if( newState == 'load' ){
                        _this.show();
					}
					if( newState == 'pause' && _this.getPlayer().isPauseLoading ) {
						_this.hide();
					}
					if (newState == 'start') {
                        _this.show();
					}
					if (newState == 'play') {
						_this.hide(true);
					}
				});
			},
			show: function(){
				if ( !this.isDisabled ) {
					this.getComponent().show();
				}
				this.shouldShow = true;
			},
			hide: function( force ){
				this.hideComponent( force );
				this.shouldShow = false;
			},
			hideComponent: function( force ) {
				if( force ) {
					this.getComponent().hide();
				}
			},
			clickButton: function( event ){
				event.preventDefault();
				event.stopPropagation();
                this.embedPlayer.getPlayerElement().pause();
				this.getPlayer().sendNotification(this.getConfig('eventName'), this.embedPlayer.currentTime);
			},
			onEnable: function(){
				this.isDisabled = false;
				if ( this.shouldShow ) {
					this.getComponent().show();
				}
			},
			onDisable: function(){
				this.isDisabled = true;
				this.hideComponent();
			},
			getComponent: function() {
				var _this = this;
				var eventName = 'click';
				if (mw.isAndroid()){
					eventName = 'touchstart';
				}
				if( !this.$el ) {
					this.$el = $( '<a />' )
						.attr( {
							'tabindex': '-1',
							'href' : '#',
							'aria-label': this.ariaText,
							'title' : gM( 'mwe-customButton-label' ),
							'class'	: this.getCssClass()
						} )
						.hide()
						// Add click hook:
						.on(eventName, function(e) {
							_this.clickButton(e);
						} );
				}
				return this.$el;
			}
		})
	);

} )( window.mw, window.jQuery );
