(function (mw, $) {
	"use strict";

	/**
	 * Base screen component that allow to show overlay on top of the player
	 **/

	mw.KBaseScreen = mw.KBaseComponent.extend({

		$screen: null,
		templateData: null,
		iconBtnClass: '',
		error: false,
		enablePlayDuringScreen: false,

		lastNonScreenFocus: $('.playPauseBtn'),//play button by default
		// Returns KBaseComponent config with screen config
		getBaseConfig: function () {
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				usePreviewPlayer: false,
				previewPlayerEnabled: false
			});
		},

		_addBindings: function () {
			var _this = this;
			// Make sure we will call _addBindings on KBaseComponent
			this._super();

			this.bindCleanScreen();

			this.bind('onplay preSequence', $.proxy(function () {
				if (this.isScreenVisible()) {
					if (this.hasPreviewPlayer()) {
						this.resizePlayer();

					} else {
						this.hideScreen();
					}
				}
			}, this));

			this.bind('playerReady', $.proxy(function (e, size) {
				_this.error = false;
			}, this));
			this.bind('showScreenByName', $.proxy(function (e, screenName) {
				if(this.pluginName == screenName && !this.isScreenVisible()){
					this.showScreen();
				}
			}, this));
			this.bind('hideScreenByName', $.proxy(function (e, screenName) {
				if(this.pluginName == screenName && this.isScreenVisible()){
					this.hideScreen();
				}
			}, this));

			this.bind('playerSizeClassUpdate', $.proxy(function (e, size) {
				if (size == 'tiny') {
					this.setConfig('previewPlayerEnabled', false);
				} else {
					this.setConfig('previewPlayerEnabled', true);
				}
			}, this));

			this.bind('closeOpenScreens', $.proxy(function (e, opener) {
				if (this.pluginName !== opener)
					this.hideScreen();
			}, this));

			this.bind('toggleScreen', $.proxy(function (e, screenName){
				if( this.pluginName === screenName ) {
					this.toggleScreen();
				}
			}, this));

			if($.isFunction(_this.drawModal)){
				this.bind('preHideScreen', function () {
					$(_this.lastNonScreenFocus).focus();
				});
				$(document).on('focus','.mwPlayerContainer',function () {
					var onfocus = $(':focus');
					if( !$(onfocus).parents().hasClass('overlay')){
						_this.lastNonScreenFocus = onfocus;
					}
				});
			}else {
				$(document).on('focus','.mwPlayerContainer',function () {
					var onfocus = $(':focus');
					if(!$(onfocus).parents().hasClass('screen')){
						_this.lastNonScreenFocus = onfocus;
					}
				});
			}
		},

		bindCleanScreen: function () {
			// TODO: should bind against onChangeMedia instead, to support screens on "Start" screen.
			this.bind('playerReady', $.proxy(function () {
				this.removeScreen();
			}, this));

			this.bind('onChangeMedia', $.proxy(function () {
				this.enablePlayDuringScreen = false;
				this.hideScreen();
			}, this));
		},

		removeScreen: function () {
			if (this.$screen) {
				this.log('Remove Screen');
				this.$screen.remove();
				this.$screen = null;
			}
		},
		hideScreen: function () {
			var _this = this;
			if (!this.error) {
				this.getPlayer().triggerHelper( 'preHideScreen', [this.pluginName] );
				if ( this.hasPreviewPlayer() ) {
					this.restorePlayer();
				} else {
					this.restorePlayback();
				}
				if ( this.getPlayer().isPlaying() ) {
					this.getPlayer().restoreComponentsHover();
				}

				if ( !this.enablePlayDuringScreen && this.isScreenVisible() ){
					this.getScreen().then(function(screen){
						screen.fadeOut( 400, $.proxy( function () {
							_this.getPlayer().triggerHelper( 'hideScreen', [_this.pluginName] );
							$(_this.lastNonScreenFocus).focus();
						}, this ) );
					});
				}
			}
		},
		showScreen: function () {
			var _this = this;
			if (!this.error) {
				this._hideAllScreens( this.pluginName );
				this.getPlayer().triggerHelper( 'preShowScreen', [this.pluginName] );
				if ( this.hasPreviewPlayer() ) {
					this.resizePlayer();
				} else {
					this.pausePlayback();
				}
				this.getPlayer().disableComponentsHover();
				this.getScreen().then(function(screen){
					screen.fadeIn( 400, $.proxy( function () {
						_this.getPlayer().triggerHelper( 'showScreen', [_this.pluginName] );
					}, this ) );
				});
			}
		},
		toggleScreen: function () {
			if (this.isDisabled) return;
			if (this.isScreenVisible()) {
				this.hideScreen();
			} else {
				this.showScreen();
			}
		},
		isScreenVisible: function () {
			return (!this.$screen) ? false : this.$screen.is(':visible');
		},
		hasPreviewPlayer: function () {
			return this.getConfig('usePreviewPlayer') && this.getConfig('previewPlayerEnabled');
		},
		pausePlayback: function () {
			var player = this.getPlayer();
			this.wasPlaying = player.isPlaying();
			if (this.wasPlaying) {
				// We use timeout to avoid race condition when we show screen on "playing" state
				player.pause();
			}
		},
		restorePlayback: function () {
			if (this.wasPlaying) {
				this.wasPlaying = false;
				this.getPlayer().play();
			}
		},
		resizePlayer: function () {
			this.getPlayer().getVideoDisplay().addClass('animateVideo');
			this.getPlayer().getInterface().addClass('previewPlayer');
		},
		restorePlayer: function () {
			this.getPlayer().getVideoDisplay().removeClass('animateVideo');
			this.getPlayer().getInterface().removeClass('previewPlayer');
		},
		getTemplateData: function () {
			return this.templateData;
		},
		_hideAllScreens: function (exclude) {
			// Close all other screens
			exclude = [exclude] || [];
			this.getPlayer().triggerHelper('closeOpenScreens', exclude);
		},
		onConfigChange: function (property, value) {
			this._super(property, value);
			if (property == 'previewPlayerEnabled' && this.isScreenVisible() && this.getConfig('usePreviewPlayer')) {
				// Disabled
				if (value == false) {
					this.restorePlayer();
				} else {
					this.resizePlayer();
				}
			}
		},
		getScreen: function () {
			var _this = this;
			var defer = $.Deferred();
			if (!this.$screen) {
				var closeMessage = gM("mwe-embedplayer-close_screen");
				this.getTemplateHTML(this.getTemplateData())
				.then(
				function(data) {
					var closeBtn = $('<span class="icon-close"/>')
						.attr('aria-label', closeMessage)
						.attr('tabindex', 0 )
						.attr('role', 'button')
						.on('click', function(){
							_this.hideScreen();
						})
						.keyup(function (e) {
							if(e.keyCode === 13){
								_this.hideScreen();
							}
						});
					_this.$screen = $('<div />')
						.addClass('screen ' + _this.pluginName)
						.attr({
							"role" : "dialog",
							"aria-labelledby" : "dialogTitle"
						})
						.append(
							$('<div class="screen-content" /> ').append(closeBtn).append(data)
						);

					// Create expand button
					var hasExpandBtn = _this.getPlayer().getVideoDisplay().find('.expandPlayerBtn').length;
					if (_this.getConfig('usePreviewPlayer') && !hasExpandBtn) {
						_this.getPlayer().getVideoDisplay().append(
							$('<i />')
								.addClass('expandPlayerBtn icon-expand2')
								.click($.proxy(function () {
									_this._hideAllScreens();
								}, _this))
						);
					}

					_this.getPlayer().getVideoHolder().append(_this.$screen);
					_this.addScreenBindings();
					defer.resolve(_this.$screen);
				}, function(msg) {
					mw.log( msg );
					defer.reject(msg);
				});

			}else{
				defer.resolve(this.$screen);
			}
			return defer;
		},
		// Override this method in plugins that extend KBaseScreen to attach DOM events to template
		addScreenBindings: function () {
		},
		getComponent: function () {
			if (!this.$el) {
				var _this = this;
				this.$el = $('<button />')
					.attr('title', this.getConfig('tooltip'))
					.addClass("btn " + this.iconBtnClass + this.getCssClass())
					.click(function () {
						_this.toggleScreen();
					});
				this.setAccessibility(this.$el, this.getConfig('tooltip')+gM('mwe-embedplayer-open_dialog'));
			}
			return this.$el;
		}
	});

})(window.mw, window.jQuery);