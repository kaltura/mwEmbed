(function ( mw, $ ) {
	"use strict";
	mw.dualScreenControlBar = function (settings){
		this.$controlBar = null;
		this.embedPlayer = settings.embedPlayer;
		this.templatePath = settings.templatePath;
		this.menuFadeout = settings.menuFadeout;
		this.cssClass = settings.cssClass;
		this.nativeAppTooltip = "Switching content<br/>on current view<br/>is not yet<br/>supported.<br/><br/>Try single view";
		this.controlBarComponents = {
			sideBySide: {
				id: 'sideBySide',
				title: 'Side By Side',
				event: "SbS"
			},
			singleView: {
				id: 'singleView',
				title: 'Single View',
				event: "hide"
			},
			pip: {
				id: 'pip',
				title: 'Picture In Picture',
				event: "PiP"
			},
			switchView: {
				id: 'switchView',
				title: 'Toggle View',
				event: "switchView"
			}
		};
		this.disabled = false;
		this.bindSuffix = ".dualScreenControlBar";
		this.getComponent();
		this.addBindings();
	};

	mw.dualScreenControlBar.prototype = {
		bind: function(name, handler){
			this.embedPlayer.bindHelper(name + this.bindSuffix, handler);
		},
		getComponent: function ( ) {
			if ( !this.$controlBar ) {
				var rawHTML = window.kalturaIframePackageData.templates[ this.templatePath ];
				var transformedHTML = mw.util.tmpl( rawHTML );
				transformedHTML = transformedHTML({buttons: this.controlBarComponents});
				this.$controlBar = $( '<div />' )
					.addClass( 'controlBar componentOff' + this.cssClass )
					.append(transformedHTML);
				this.embedPlayer.getInterface().append( this.$controlBar );
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
			this.embedPlayer.getInterface()
				.on( 'mousemove'+this.bindSuffix +' touchstart' + this.bindSuffix, function(){
					_this.show();
				})
				.on( 'mouseleave' + this.bindSuffix, function(){
					if (!mw.isMobileDevice()){
						_this.hide();
					}
				});

			this.bind("dualScreenControlsHide", function(){
				_this.hide();
			});
			this.bind("dualScreenControlsShow", function(){
				_this.show();
			});
			this.bind("dualScreenControlsDisable", function(){
				_this.disable();
			});
			this.bind("dualScreenControlsEnable", function(){
				_this.enable();
			});

			//add drop shadow containers for control bar
			this.embedPlayer.getVideoHolder().prepend(this.getControlBarDropShadow());

			//Cache buttons
			var buttons = _this.getComponent().find( "span" );
			var switchBtn = buttons.filter('[data-type="switch"]');
			//Attach control bar action handlers
			_this.getComponent()
				.on( 'click' +this.bindSuffix +' touchstart' + this.bindSuffix, 'li > span', function (e) {
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

				switchBtn.addClass("disabled" )
					.attr("title", this.nativeAppTooltip );
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
				}, this.menuFadeout );
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
		destroy: function(){
			this.embedPlayer.unbindHelper(this.bindSuffix);
			this.getComponent().off(this.bindSuffix);
			this.embedPlayer.getInterface().off(this.bindSuffix);
			this.getComponent().remove();
			this.getControlBarDropShadow().remove();
			this.$controlBar = null;
			this.$controlBarDropShadow = null;
		}
	};
})( window.mw, window.jQuery );