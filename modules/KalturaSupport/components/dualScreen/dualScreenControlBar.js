(function ( mw, $ ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};

	mw.dualScreen.dualScreenControlBar = mw.KBaseComponent.extend({
		defaultConfig: {
			'templatePath': 'dualScreenControlBar',
			'menuFadeout': 5000
		},
		"controlBarComponents": {
			sideBySide: {
				id: 'sideBySide',
				title: gM("ks-DUAL-SCREEN-SBS"),
				event: "SbS"
			},
			singleView: {
				id: 'singleView',
				title: gM("ks-DUAL-SCREEN-HIDE"),
				event: "hide"
			},
			pip: {
				id: 'pip',
				title: gM("ks-DUAL-SCREEN-PIP"),
				event: "PiP"
			},
			switchView: {
				id: 'switchView',
				title: gM("ks-DUAL-SCREEN-SWITCH"),
				event: "switchView"
			}
		},
		disabled: false,

		nativeAppTooltip: "Switching content<br/>on current view<br/>is not yet<br/>supported.<br/><br/>Try single view",
		setup: function() {
			this.postFix = "." + this.pluginName;
			this.addBindings();
		},
		getComponent: function ( ) {
			if ( !this.$controlBar ) {
				var rawHTML = window.kalturaIframePackageData.templates[ this.getConfig("templatePath")];
				var transformedHTML = mw.util.tmpl( rawHTML );
				transformedHTML = transformedHTML({buttons: this.controlBarComponents});
				this.$controlBar = $( '<div />' )
					.addClass( 'controlBar componentOff dualScreen' + this.getCssClass() )
					.append(transformedHTML);
				//If top bar exist then position controlBar under it
				if (this.embedPlayer.getTopBarContainer().length) {
					var height = this.embedPlayer.getTopBarContainer().height();
					this.$controlBar.css("top", height + "px");
				}
				if (mw.isNativeApp()){
					this.$controlBar.find("#" + this.controlBarComponents.sideBySide.id ).remove();
				}
			}
			return this.$controlBar;
		},
		getControlBarDropShadow: function() {
			var _this = this;
			if (!this.$controlBarDropShadow) {
				this.$controlBarDropShadow = $("<div class='dualScreen controlBarShadow componentAnimation'></div>")
					.addClass('componentOff')
					.on("click mouseover mousemove mouseout touchstart touchend", function (e) {
						_this.embedPlayer.triggerHelper(e);
				});
			}
			return this.$controlBarDropShadow;
		},
		addBindings: function () {
			//Set control bar visiblity handlers
			var _this = this;
			//TODO:hook these events to layoutbuilder events
			this.embedPlayer.getInterface()
				.on( 'mousemove' + this.postFix +' touchstart' + this.postFix, function(){
					_this.show();
				})
				.on( 'mouseleave' + this.postFix, function(){
					if (!mw.isMobileDevice()){
						_this.hide();
					}
				});

			//add drop shadow containers for control bar
			this.embedPlayer.getVideoHolder().prepend(this.getControlBarDropShadow());

			//Cache buttons
			var buttons = _this.getComponent().find( "span" );
			var switchBtn = buttons.filter('[data-type="switch"]');
			//Attach control bar action handlers
			_this.getComponent()
				.on( 'click' + this.postFix + ' touchstart' + this.postFix, 'li > span', function (e) {
					e.stopPropagation();
					e.preventDefault();
					var btn = _this.controlBarComponents[this.id];
					var obj = $(this);
					//Change state button disabled state
					if (obj.data("type") === "state") {
						buttons.removeClass( "disabled" );
						obj.addClass( "disabled" );
					}
					if (mw.isNativeApp()){
						if (this.id === _this.controlBarComponents.pip.id){
							switchBtn
								.addClass("disabled")
								.tooltip( "option", "content", _this.nativeAppTooltip);
						} else if(this.id === _this.controlBarComponents.singleView.id){
							switchBtn.tooltip( "option", "content", _this.controlBarComponents.switchView.title);
						}
					}
					if (btn && btn.event){
						_this.embedPlayer.triggerHelper("dualScreenStateChange", btn.event);
					}
					return false;
				} );

			if (mw.isNativeApp()){
				switchBtn.addClass("disabled" ).attr("title", _this.nativeAppTooltip );
			}

			//Set tooltips
			buttons.attr('data-show-tooltip', true);
			this.embedPlayer.layoutBuilder.setupTooltip(buttons, "arrowTop");
		},
		disable: function () {
			clearTimeout(this.getComponent().handleTouchTimeoutId);
			this.disabled = true;
		},
		enable: function () {
			this.disabled = false;
		},
		hide: function ( ) {
			if ( !this.disabled ) {
				this.embedPlayer.triggerHelper( 'clearTooltip' );
				if ( this.isVisible ) {
					this.getComponent().addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' );
					this.embedPlayer.getVideoHolder().find( ".controlBarShadow" ).addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' );
					this.isVisible = false;
				}
			}
		},
		show: function ( ) {
			if ( !this.disabled) {
				if ( !this.isVisible ) {
					this.getComponent().removeClass( 'componentAnimation' ).addClass( 'componentOn' ).removeClass( 'componentOff' );
					this.isVisible = true;
					this.embedPlayer.getVideoHolder().find( ".controlBarShadow" ).removeClass( 'componentAnimation' ).addClass( 'componentOn' ).removeClass( 'componentOff' );
				}

				var _this = this;
				if ( this.getComponent().handleTouchTimeoutId ) {
					clearTimeout( this.getComponent().handleTouchTimeoutId );
				}
				this.getComponent().handleTouchTimeoutId = setTimeout( function () {
					_this.hide();
				}, this.getConfig("menuFadeout"));
			}
		},
		set: function(id){
			if (id) {
				var component = this.getComponent();
				var buttons = $("span[data-type=state]", component);
				buttons.not("#" + id).removeClass("disabled");
				buttons.filter("#" + id).addClass("disabled");
				if (mw.isNativeApp()) {
					var switchBtn = $('span[data-type="switch"]', component);
					switchBtn
						.addClass("disabled")
						.tooltip("option", "content", this.nativeAppTooltip);
				}
			}
		},
		destroy: function() {
			this.embedPlayer.unbindHelper(this.postFix);
			this.getComponent().off(this.postFix);
			this.embedPlayer.getInterface().off(this.postFix);
			this.getComponent().remove();
			this.getControlBarDropShadow().remove();
			this.$controlBar = null;
			this.$controlBarDropShadow = null;
		}
	});
})( window.mw, window.jQuery );
