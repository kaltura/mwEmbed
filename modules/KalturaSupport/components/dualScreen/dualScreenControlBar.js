(function ( mw, $ ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};

	mw.dualScreen.dualScreenControlBar = mw.KBaseComponent.extend({
		defaultConfig: {
			'templatePath': 'dualScreenControlBar',
			'disableDragDrop': false,
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
			},
            contentSelection: {
                id: 'contentSelection',
                title: 'Content Selection  - select a stream to view',
                event: "contentSelection"
            }
		},
		disabled: false,

		nativeAppTooltip: "Switching content<br/>on current view<br/>is not yet<br/>supported.<br/><br/>Try single view",
        streams: [],

		setup: function() {
			this.postFix = "." + this.pluginName;
			this.addBindings();

			// hide content selection by default
			this.getComponent().find('.displayControlGroup-contentSelection').hide();
		},

        setStreams: function(streams){
            this.streams = streams;
            this.renderStreams();
        },

        renderStreams: function () {
            var streamsContainer = this.getComponent().find('.ds-streams').empty();
            var getTabIndexAttr = streamsContainer.attr('tabindex');
            var contentSelectionGroup = this.getComponent().find('.displayControlGroup-contentSelection');
            var dragDropEnabled = !this.getConfig('disableDragDrop');
            if (this.streams && this.streams.length) {
                streamsContainer.append($.map(this.streams, function (stream, index) {
                    var $stream = $('<div/>', {
                        'class': 'ds-stream',
                        'data-stream-index': index,
                        'tabindex':getTabIndexAttr+'.'+index
                    }).append($('<img/>', {
                        src: stream.thumbnailUrl,
                        'class': 'ds-stream__thumb'
                    })).data('stream', stream)

                    if (dragDropEnabled) {
                        $stream.draggable({
                            revert: true,
                            helper: function (event) {
                                return $(this).clone().css('position', 'absolute').get(0);
                            },
                            containment: '.videoHolder',
                            start: function (event, ui) {
                                $(ui.helper).addClass('ds-stream--helper');
                                $(this).addClass('ds-stream--dragging').data('wasDropped', false);
                                streamsContainer.addClass('ds-streams--dragging');
                            },
                            stop: function () {
                                $(this).removeClass('ds-stream--dragging');
                                streamsContainer.removeClass('ds-streams--dragging');
                            }
                        });
                    }

                    return $stream;
                }));

                if (dragDropEnabled) {
                    streamsContainer.droppable({
                        greedy: true,
                        accept: '.ds-stream',
                        hoverClass: 'ui-state-hover',
                        drop: function (e, ui) {
                            ui.draggable.data('wasDropped', true);
                        }
                    });
                }

                contentSelectionGroup.show();
            } else {
                contentSelectionGroup.hide();
            }
        },

		getComponent: function ( ) {
			if ( !this.$controlBar ) {
				var rawHTML = window.kalturaIframePackageData.templates[ this.getConfig("templatePath")];
				var transformedHTML = mw.util.tmpl( rawHTML );
				transformedHTML = transformedHTML({buttons: this.controlBarComponents});
				this.$controlBar = $( '<div />' )
					.attr({'tabindex':10})
					.addClass( 'controlBar componentOff dualScreen' + this.getCssClass() )
					.append(transformedHTML);
				//If top bar exist then position controlBar under it
				var noControls = this.embedPlayer.isMobileSkin() ? 2 : 0;
				if (this.embedPlayer.getTopBarContainer().length && this.embedPlayer.getTopBarContainer().children().length !== noControls) {
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
				.on( 'mousemove' + this.postFix +' touchstart' + this.postFix + ' focus', function(){
					_this.show();
				})
				.on( 'mouseleave' + this.postFix, function(){
					if (!mw.isMobileDevice()){
						_this.hide();
					}
				});
			this.getComponent().add(_this.getComponent().find('.controlBarBtn'))
				.on( 'focus', function(){
					_this.show();
				})
				.on( 'blur' + this.postFix, function(){
					setTimeout(function () {
						var currentFocusElement = $(':focus');
						if(!currentFocusElement.parents('.dualScreenControlBar').hasClass('dualScreenControlBar') && !currentFocusElement.hasClass('dualScreenControlBar')){
							if (!mw.isMobileDevice()){
								_this.hide();
							}
						}
					},0);
				});

			//add drop shadow containers for control bar
			this.embedPlayer.getVideoHolder().prepend(this.getControlBarDropShadow());

			//Cache buttons
			var buttons = _this.getComponent().find( "span" );
            var switchBtn = buttons.filter('[data-type="switch"]');

			//Attach control bar action handlers
			_this.getComponent()
				.on( 'click' + this.postFix + ' touchstart' + this.postFix, '.displayControlGroup > .controlBarBtn', function () {
					var $this = $(this);
					var group = $this.parent('.displayControlGroup');
					var isCollapsible = $this.hasClass('ds-collapsible-handle') && group.hasClass('ds-collapsible');
					var wasOpen = group.hasClass('ds-open');
					var btn = _this.controlBarComponents[this.id];

					if (wasOpen || !isCollapsible) {
						$('.displayControlGroup').removeClass('ds-blur ds-open');
					} else {
						$('.displayControlGroup').removeClass('ds-open').addClass('ds-blur');
						group.removeClass('ds-blur').addClass('ds-open');
					}

					if (!isCollapsible) {
						_this.changeButtonsStyles(this.id, true); // pass clicked indicator in order to open subMenu if needed

						if (btn && btn.event){
							_this.embedPlayer.triggerHelper("dualScreenStateChange", {action : btn.event, invoker : 'dualScreenControlBar'});
						}
					}

					return false;
				} )
				.on( 'click' + this.postFix + ' touchstart' + this.postFix, '.ds-streams > .ds-stream', function () {
					_this.embedPlayer.triggerHelper('dualScreenChangeMainDisplayStream', [$(this).data('stream')]);
					return false;
				} ).on('keydown' + this.postFix + ' touchstart' + this.postFix, '.ds-streams > .ds-stream', _this.keyDownHandler);;

			if (mw.isNativeApp()){
				switchBtn.addClass("disabled" ).attr("title", _this.nativeAppTooltip );
			}

            //Set tooltips (each row separately)
            //buttons.attr('data-show-tooltip', true);
            //this.embedPlayer.layoutBuilder.setupTooltip(switchBtn, "arrowTop");
            //this.embedPlayer.layoutBuilder.setupTooltip(stateButtons, "arrowTop");
            //this.embedPlayer.layoutBuilder.setupTooltip(contentBtn, "arrowTop");

			// listen to state change and update buttons style accordingly
			_this.bind( 'dualScreenStateChange', function(e, state){

				var eventToCompare;
				var invoker;
				if (typeof state === 'object')
				{
					eventToCompare = state.action;
					invoker = state.invoker;
				}else {
					eventToCompare = state;
				}

				if (invoker === 'dualScreenControlBar')
				{
					// the state change was invoked by this component so no need to handle that notification
					return;
				}

				for(var prop in _this.controlBarComponents)
				{
					var item = _this.controlBarComponents[prop];
					if (item.event === eventToCompare)
					{
						_this.changeButtonsStyles(prop);
					}
				}

			});

			_this.bind('displayDropped dualScreenChangeMainDisplayStream', function () {
				$('.displayControlGroup').removeClass('ds-blur ds-open');
			});
		},
		keyDownHandler: function(ev){
			if(ev.which === 13 || ev.which === 32)
			{
				$(ev.target).click();
			}
		},
		/**
		 * Changes the style of the buttons according to the selected view mode.
		 * This affect they layout only and doesn't change the player state.
		 * @param activeButtonId
         */
		changeButtonsStyles : function(activeButtonId, clicked)
		{
			var _this = this;
			var buttons = _this.getComponent().find(".controlBarBtn");
			var switchBtn = buttons.filter('[data-type="switch"]');
            var stateButtons = buttons.filter('[data-type="state"]');

            var obj = $(_this.getComponent().find('#' + activeButtonId)[0]);

            //Change state button disabled state
            if (obj.data("type") === "state") {
                //show state buttons if selected state was clicked
                stateButtons.removeClass('stateSelected ds-collapsible-handle').addClass('ds-collapsible-content');
                obj.addClass('stateSelected ds-collapsible-handle').removeClass('ds-collapsible-content');
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
					var component = this.getComponent();
					component.addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' );
					this.embedPlayer.getVideoHolder().find( ".controlBarShadow" ).addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' );
					this.isVisible = false;

					if ( mw.getConfig( 'EmbedPlayer.AnimationSupported') ) {
						var _this = this;
						component.one( 'transitionend webkitTransitionEnd', function () {
							if (!_this.isVisible) {
								component.hide();
							}
						} );
					} else {
						component.hide();
					}
				}
			}
		},
		show: function ( ) {
			if ( !this.disabled) {
				if ( !this.isVisible ) {
                    //show only vertical main buttons (ignore sub-menus)
                    //this.getComponent().find("span").filter(".dualScreen-switchView, .stateSelected, .dualScreen-contentSelection").removeClass( 'componentAnimation' ).addClass( 'componentOn' ).removeClass( 'componentOff' );

                    this.getComponent().show();
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
