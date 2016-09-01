( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'largePlayBtn', mw.KBaseComponent.extend({
		//indicates we were explicitly asked to show the button (will be used when re-enabling the button)
		shouldShow : false,
		isDisabled: false,
		defaultConfig: {
			'parent': 'videoHolder',
			'togglePause': true,
			'order': 1
		},
		setup: function() {
			this.addBindings();
		},
		/**
		 * Checks if the play button should stay on screen during playback,
		 * cases where a native player is dipalyed such as iPhone.
		 */
		isPersistantPlayBtn: function(){
			return (mw.isAndroid2() || this.getPlayer().isLinkPlayer() || ( mw.isIphone() && mw.getConfig( 'EmbedPlayer.iPhoneShowHTMLPlayScreen' )) && !mw.isWindowsPhone() );
		},
		addBindings: function() {
			var _this = this;
			this.bind('showInlineDownloadLink', function(e, linkUrl){
				_this.getComponent().attr({
					'href': linkUrl.replace('playSessionId=','playSessionId=noev-'),
					'target': '_blank'
				});
			});

			this.bind('onChangeMediaDone playerReady onpause onEndedDone onRemovePlayerSpinner showPlayerControls showLargePlayBtn', function(e){
				if( !_this.embedPlayer.isPlaying() && !_this.embedPlayer.isInSequence() && !_this.embedPlayer.isPauseLoading ){
					if (mw.isChromeCast()){
						_this.getComponent().removeClass("icon-play").addClass("icon-pause");
						if (e.type !== "onpause" && e.type !== "playerReady"){
							return;
						}
					} else {
						_this.getComponent().removeClass( "icon-pause" ).addClass( "icon-play" );
					}
					_this.show();
				}
			});

			this.bind('onShowControlBar', function(){
				if( !mw.isIE8() && _this.getConfig("togglePause") && (_this.embedPlayer.isPlaying() || mw.isChromeCast()) && !_this.embedPlayer.isInSequence() ){
					_this.getComponent().removeClass("icon-play").addClass("icon-pause");
					_this.show();
				}
			});
			this.bind('playing AdSupport_StartAdPlayback onHideControlBar onChangeMedia', function(e){
				_this.hide();
			});
			this.bind('onAddPlayerSpinner showScreen', function(e){
				_this.hide(true);
			});
			this.bind('onPlayerStateChange', function(e, newState, oldState){
				if( newState == 'load' || newState == 'play' ){
					_this.hide(true);
				}
				if( newState == 'pause' && _this.getPlayer().isPauseLoading && !mw.isChromeCast()){
					_this.hide();
				}
			});
			this.bind( 'hideScreen closeMenuOverlay', function(){
				if (mw.isMobileDevice() && _this.getPlayer().paused){
					_this.show();
				}
			});
			this.bind('liveOnline', function(){
				if( _this.getPlayer().isLive && !_this.getPlayer().isDVR() ) {
					_this.hide();
				}
			});
		},
		show: function(){
			if ( !this.isDisabled && !this.embedPlayer.layoutBuilder.displayOptionsMenuFlag ) {
				if (this.embedPlayer.isMobileSkin() && (this.embedPlayer.changeMediaStarted || this.embedPlayer.buffering || this.embedPlayer.isInSequence())){
					return; // prevent showing large play button on top of the spinner when using mobile skin and changing media or during ads
				}

				if (this.embedPlayer.isMobileSkin()){
					if (mw.isIOS8()){
						this.getComponent().fadeIn('fast').css('display', "-webkit-flex");
					}else{
						this.getComponent().fadeIn('fast').css('display', "flex");
					}
				} else {
					this.getComponent().css('display', "block");
				}
			}
			this.shouldShow = true;
		},
		hide: function( force ){
			this.hideComponent( force );
			this.shouldShow = false;
		},
		hideComponent: function( force ) {
			if( force || !this.isPersistantPlayBtn() ) {
				this.getComponent().hide();
			}
		},
		clickButton: function( event ){
			// If link player, only trigger events
			if( this.getPlayer().isLinkPlayer() ) {
				this.getPlayer().triggerHelper( 'firstPlay' ); // To send stats event for play
				this.getPlayer().triggerHelper( 'playing' );
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			if ( this.getConfig("togglePause") && this.getPlayer().isPlaying() ){
				this.getPlayer().sendNotification('doPause',{'userInitiated': true});
			}else{
				this.getPlayer().triggerHelper( 'goingtoplay' );
				this.getPlayer().sendNotification('doPlay',{'userInitiated': true});
			}
		},
		onEnable: function(){
			this.isDisabled = false;
			if ( this.shouldShow ) {
				this.show();
			}
		},
		onDisable: function(){
			this.isDisabled = true;
			this.hideComponent();
		},
		getComponent: function() {
			var _this = this;
			var eventName = 'click';
			if ( mw.isAndroid() ){
				eventName += ' touchstart';
			}
			if( !this.$el ) {
				this.$el = $( '<a />' )
					.attr( {
						'tabindex': '-1',
						'href' : '#',
						'title' : gM( 'mwe-embedplayer-play_clip' ),
						'class'	: "icon-play " + this.getCssClass()
					} )
					.hide()
					// Add play hook:
					.on(eventName, function(e) {
						_this.clickButton(e);
					} );
				if ( !mw.isWindowsPhone() ){
					this.$el.addClass("largePlayBtnBorder");
				}
			}
			return this.$el;
		}
	})
	);

} )( window.mw, window.jQuery );