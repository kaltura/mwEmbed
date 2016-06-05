( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'fullScreenBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			"align": "right",
			"parent": "controlsContainer",
			"order": 51,
			"showTooltip": true,
			"displayImportance": "high"
		},

		offIconClass: 'icon-expand',
		onIconClass: 'icon-contract',

		enterFullscreenTxt: gM( 'mwe-embedplayer-player_fullscreen' ),
		exitFullscreenTxt: gM( 'mwe-embedplayer-player_closefullscreen' ),
			
		setup: function() {
			// for mobile skin, assign the back arrow as the full screen exit icon
			if ( this.getPlayer().isMobileSkin() ){
				this.onIconClass = 'icon-arrow-left';
			}
			this.addBindings();
		},
		isSafeEnviornment: function(){
			if( (mw.isIE9() || mw.isIE8()) && !mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
				return false;
			}
			return mw.getConfig( 'EmbedPlayer.EnableFullscreen' );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', this.enterFullscreenTxt )
							.addClass( "btn " + this.offIconClass + this.getCssClass() )
							.click( function() {
								_this.toggleFullscreen();
							});
			}
            this.setAccessibility(this.$el,this.enterFullscreenTxt);
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
			// Add double click binding
			this.bind('dblclick', function(){
				_this.toggleFullscreen();
			});
			// Update fullscreen icon
			this.bind('onOpenFullScreen', function() {
				_this.getComponent().removeClass( _this.offIconClass ).addClass( _this.onIconClass );
				_this.updateTooltip( _this.exitFullscreenTxt );
                _this.setAccessibility(_this.$el,_this.exitFullscreenTxt);
				// for mobile skin we need to put the back arrow in the top bar container in full screen and the controlBar container when inline
				if ( _this.getPlayer().isMobileSkin() ){
					var fsBtn = $('.fullScreenBtn').detach();
					$('.topBarContainer').prepend(fsBtn);
					_this.getPlayer().triggerHelper("updateComponentsVisibilityDone"); // redraw components to calculate their size and location
				}
			});
			this.bind('onCloseFullScreen', function() {
				_this.getComponent().removeClass( _this.onIconClass ).addClass( _this.offIconClass );
				_this.updateTooltip( _this.enterFullscreenTxt );
                _this.setAccessibility(_this.$el,_this.enterFullscreenTxt);
				// for mobile skin we need to put the back arrow in the top bar container in full screen and the controlBar container when inline
				if ( _this.getPlayer().isMobileSkin() ){
					var fsBtn = $('.fullScreenBtn').detach();
					$('.controlsContainer').append(fsBtn);
					_this.getPlayer().triggerHelper("updateComponentsVisibilityDone"); // redraw components to calculate their size and location
				}
			});
		},
		toggleFullscreen: function() {
			if( this.isDisabled ) return ;
			this.getPlayer().toggleFullscreen();
		}
	}));

} )( window.mw, window.jQuery );