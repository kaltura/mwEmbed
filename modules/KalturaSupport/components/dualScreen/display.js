(function ( mw, $ ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};

	mw.dualScreen.display = mw.KBasePlugin.extend({
		defaultConfig: {
			isMain: false
		},
		obj: null,
		prop: {},
		isVisible: true,
		isDisabled: false,
		dragging: false,
		resizing: false,
		setup: function(){
            var _this = this;
            this.bind( 'playerReady', function () {
                //save coordinates for the right bottom corner in order to place there hidden secondary screen (10X10 px), so we'll be able to  seek fast through HLS-OSMF (flash player moves to the low performance once hidden and this is why seek worked very slow in single view mode - FEC-5138)
                _this.playerRight = _this.getPlayer().getWidth() - 22;
                _this.playerBottom = _this.getPlayer().getHeight() - _this.getPlayer().getControlBarContainer().height() - 4;
            });
		},
		attachView: function(el){
			this.obj = el;
			var classes = "dualScreen dualScreenDisplay ";
			var isMain = this.getConfig("isMain");
			classes += isMain ? "firstScreen" : "secondScreen";

			var dataRule = isMain ? mw.dualScreen.display.TYPE.PRIMARY : mw.dualScreen.display.TYPE.SECONDARY;

			this.obj
				.addClass( classes )
				.attr( 'data-display-rule', dataRule)
				.on('resize', function (e) {
					e.stopPropagation();
				})
				.draggable( $.extend( this.getConfig( 'draggable' ), this.viewActionHandler() ))
				.resizable( $.extend( this.getConfig( 'resizable' ), this.viewActionHandler() ));
		},
		repaint: function(screenProps){
			this.prop = screenProps;
			this.obj.css( screenProps );
			this.getPlayer().triggerHelper('displayRepainted');
		},
		getProperties: function(){
			return this.prop;
		},
		position: function(config){
			this.obj.position( config );
			this.prop = this.obj.css( ['top', 'left', 'width', 'height'] );
		},
		setResizeLimits: function(settings){
			this.resizeLimits = settings;
			this.obj.resizable(settings);
		},

		getResizeLimits: function(){
			return this.resizeLimits;
		},

		//Screen interaction handlers(drag/resize)
		isUserInteracting: function(){
			return this.dragging || this.resizing;
		},
		viewActionHandler: function(){
			var _this = this;
			return {
				start: function ( event ) {
					switch ( event.type ) {
						case "dragstart":
							_this.dragging = true;
							break;
						case "resizestart":
							_this.resizing = true;
							break;
					}

					_this.getPlayer().triggerHelper( "startDisplayInteraction", [event.type] );
				},
				stop: function ( event ) {
					//Allow all plugins to check against dragging/resizing state before setting it to false
					setTimeout(function(){
						switch ( event.type ) {
							case "dragstop":
								_this.dragging = false;
								break;
							case "resizestop":
								_this.resizing = false;
								break;
						}

						_this.getPlayer().triggerHelper( "stopDisplayInteraction", [event.type] );

					}, 0);
					_this.prop = $( this ).css( ['top', 'left', 'width', 'height'] );
				}
			};
		},
		enableUserActions: function ( ) {
			this.obj.draggable( 'enable' ).resizable( 'enable' );
			this.addResizeHandlers();
		},
		disableUserActions: function ( ) {
			this.obj.draggable( 'disable' ).resizable( 'disable' );
			this.removeResizeHandlers();
		},

		//Screen resizing handlers
		removeResizeHandlers: function(){
			$(this.obj).find(".dualScreen-transformhandle" ).remove();
		},
		addResizeHandlers: function () {
			this.removeResizeHandlers();
			var cornerHandleVisibleTimeoutId;
			var _this = this;
			this.obj.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "bottomRightHandle"));   //ui-resizable-handle ui-resizable-ne
			this.obj.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "bottomLeftHandle"));   //ui-resizable-handle ui-resizable-sw
			this.obj.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "topRightHandle"));   //ui-resizable-handle ui-resizable-se
			this.obj.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "topLeftHandle"));   //ui-resizable-handle ui-resizable-nw
			this.obj
				.on( 'mouseleave', function(e) {
					if ( !( mw.isMobileDevice() || _this.dragging ) ) {
						_this.hideResizeHandlers();
					}
					e.stopImmediatePropagation();
					e.preventDefault();
					e.stopPropagation();
				})
				.on( 'mousemove touchstart', function(e){
					if (!_this.dragging){
						_this.showResizeHandlers();
						if(cornerHandleVisibleTimeoutId){
							clearTimeout(cornerHandleVisibleTimeoutId);
						}
						cornerHandleVisibleTimeoutId = setTimeout(function(){_this.hideResizeHandlers();}, _this.getConfig("resizeHandlesFadeout"));
					}
				});

		},
		hideResizeHandlers: function(){
			$(this.obj).find(".cornerHandle" ).addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' );
		},
		showResizeHandlers: function(){
			$(this.obj).find(".cornerHandle" ).removeClass('componentAnimation' ).addClass('componentOn' ).removeClass('componentOff' );
		},

		//Screen view state handlers
		toggleMain: function (props) {
            this.toggleMainConfig();
            this.obj.toggleClass('secondScreen firstScreen');
			this.repaint(props);
		},
        toggleSecondary: function (callback) {
            var _this = this;
            this.toggleMainConfig();
            this.obj.toggleClass( 'secondScreen hiddenScreen');
            setTimeout(function(){
                callback();
            }, 100);
        },
        toggleMainConfig: function(){
            this.setConfig("isMain", !this.getConfig("isMain"));
            this.obj.attr( 'data-display-rule', this.getConfig("isMain") ? mw.dualScreen.display.TYPE.PRIMARY : mw.dualScreen.display.TYPE.SECONDARY );
        },
		enableSideBySideView: function () {
			var toClass = this.getConfig("isMain")? "sideBySideLeft" : "sideBySideRight";
			this.obj.addClass( toClass );
		},
		toggleSideBySideView: function () {
			this.obj.toggleClass( 'sideBySideLeft sideBySideRight' );
		},
		disableSideBySideView: function () {
			this.obj.removeClass( 'sideBySideRight sideBySideLeft' );
            this.hiddenProp = this.prop;
		},
        disableMain: function () {
            this.obj.removeClass('firstScreen').addClass('secondScreen');
            this.bringToFront();
        },
        enableMain: function () {
            this.obj.removeClass('secondScreen').addClass('firstScreen');
            this.sendToBack();
        },
        toggleHiddenToMain: function () {
            this.obj.removeClass('hiddenScreen' ).addClass('firstScreen' );
        },
		hide: function (isFlashMode) {
            this.obj.addClass( 'hiddenScreen' );
            //take care of flash obj (seek through hidden flash player will be very slow, so we need to bring at least several pixels inside the visible area of the player frame)
            if ( isFlashMode ) {
                var _this = this;
                this.obj.addClass('componentOff');
                setTimeout(function () {
                    if (!_this.hiddenProp) {
                        _this.hiddenProp = _this.obj.css(['top', 'left', 'width', 'height']);
                    }
                    _this.obj.css('top', _this.playerBottom);
                    _this.obj.css('left', _this.playerRight);
                    _this.obj.removeClass('componentOff').addClass('hidden10pxScreen componentOn');
                }, 300); //screenTransition (css) length is 0.3 sec
            }
		},
		show: function (isFlashMode) {
            if ( !isFlashMode ) {
                this.obj.removeClass('hiddenScreen');
            } else {
                //FlashMode only - take care of flash obj (seek through hidden flash player will be very slow, so we need to bring at least several pixels inside the visible area of the player frame)
                var _this = this;
                this.disableTransition();
                this.obj.removeClass('hidden10pxScreen');
                this.obj.css(this.hiddenProp);
                this.hiddenProp = null;
                this.obj.removeClass('componentOff').addClass('componentOn');
                this.enableTransition();
                setTimeout(function () {
                    _this.obj.removeClass('hiddenScreen');
                }, 500); //it takes time to update width/height/top/left css properties and this is the reason for half second delly.
            }
		},
        bringToFront: function ( ) {
            this.obj.css('z-index',2);
        },
        sendToBack: function ( ) {
            this.obj.css('z-index',1);
        },

		//Screen animation controller
		enableTransition: function () {
			this.obj.addClass( 'screenTransition' );
			var _this = this;
			var transitionendHandler = function(){
				_this.getPlayer().triggerHelper("displayTransitionEnded");
			};
			if ( mw.getConfig( 'EmbedPlayer.AnimationSupported') ) {
				this.obj.one( 'transitionend webkitTransitionEnd', transitionendHandler );
			} else {
				this.animationEndedTimeout = setTimeout( transitionendHandler, 100 );
			}
		},
		disableTransition: function () {
			this.obj.removeClass( 'screenTransition' );
			if ( mw.getConfig( 'EmbedPlayer.AnimationSupported') ) {
				this.obj.off( 'transitionend webkitTransitionEnd' );
			} else {
				if (this.animationEndedTimeout){
					clearTimeout(this.animationEndedTimeout);
					this.animationEndedTimeout = null;
				}

			}
		},
		disableDroppable: function () {
			var parent = this.obj.parent();
			this.obj.data('droppable') && this.obj.droppable('destroy').data('droppable', false);
			parent.data('droppable') && parent.droppable('destroy').data('droppable', false);
		},
		enableDroppable: function (useParentAsTarget) {
			var target = useParentAsTarget ? this.obj.parent() : this.obj;

			target.droppable({
				accept: '.ds-stream',
				hoverClass: 'ui-state-hover',
				activeClass: 'ui-state-active',
				greedy: !useParentAsTarget,
				drop: $.proxy(this.onDrop, this)
			}).data('droppable', true);
		},
		onDrop: function (event, ui) {
			this.getPlayer().triggerHelper('displayDropped', [this, ui.draggable]);
		}
	});

	mw.dualScreen.display.TYPE = {
		PRIMARY: "primary",
		SECONDARY: "secondary"
	};
}
)( window.mw, window.jQuery );