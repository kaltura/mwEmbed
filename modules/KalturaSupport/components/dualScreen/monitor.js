(function ( mw, $ ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};

	mw.dualScreen.monitor = mw.KBasePlugin.extend({
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
		},
		attachView: function(el){
			this.obj = el;
			var classes = "dualScreen dualScreenMonitor ";
			var isMain = this.getConfig("isMain");
			classes += isMain ? "firstScreen" : "secondScreen";

			var dataRule = isMain ? mw.dualScreen.monitor.TYPE.PRIMARY : mw.dualScreen.monitor.TYPE.SECONDARY;

			this.obj
				.addClass( classes )
				.attr( 'data-monitor-rule', dataRule)
				.on('resize', function (e) {
					e.stopPropagation();
				})
				.draggable( $.extend( this.getConfig( 'draggable' ), this.viewActionHandler() ))
				.resizable( $.extend( this.getConfig( 'resizable' ), this.viewActionHandler() ));
		},
		repaint: function(screenProps){
			this.prop = screenProps;
			this.obj.css( screenProps );
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

					_this.getPlayer().triggerHelper( "startMonitorInteraction", [event.type] );
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

						_this.getPlayer().triggerHelper( "stopMonitorInteraction", [event.type] );

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
			this.setConfig("isMain", !this.getConfig("isMain"));
			this.obj.attr( 'data-monitor-rule', this.getConfig("isMain") ? mw.dualScreen.monitor.TYPE.PRIMARY : mw.dualScreen.monitor.TYPE.SECONDARY );
			this.obj.toggleClass( 'firstScreen secondScreen' );
			if (!this.getConfig("isMain")){
				this.repaint(props);
			}
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
		},
		hide: function ( ) {
			this.obj.addClass( 'hiddenScreen' );
		},
		show: function ( ) {
			this.obj.removeClass( 'hiddenScreen' );
		},

		//Screen animation controller
		enableTransition: function () {
			this.obj.addClass( 'screenTransition' );
			var _this = this;
			var transitionendHandler = function(){
				_this.getPlayer().triggerHelper("monitorTransitionEnded");
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
		}
	});

	mw.dualScreen.monitor.TYPE = {
		PRIMARY: "primary",
		SECONDARY: "secondary"
	};
}
)( window.mw, window.jQuery );