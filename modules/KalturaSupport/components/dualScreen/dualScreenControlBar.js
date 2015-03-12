(function ( mw, $ ) {
	"use strict";
	mw.dualScreenControlBar = function (settings){
		this.$controlBar = null;
		this.embedPlayer = settings.embedPlayer;
		this.templatePath = settings.templatePath;
		this.menuFadeout = settings.menuFadeout;
		this.cssClass = settings.cssClass;
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
				title: 'Toggle Main View',
				event: "switchView"
			}
		};
		this.disabled = false;
		this.getComponent();
		this.addBindings();
	};

	mw.dualScreenControlBar.prototype = {
		bind: function(name, handler){
			this.embedPlayer.bindHelper(name, handler);
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
				this.setControlBarWidth();
			}
			return this.$controlBar;
		},
		setControlBarWidth: function(){
			var width = 0;
			this.getComponent().find("#displayControlBar").each(function() {
				width += $(this).outerWidth( true );
			});
			this.getComponent().
				css({'width': width + 10});
		},
		positionControlBar: function (  ) {
			var height = 0;
			if (this.embedPlayer.getTopBarContainer().length) {
				height = this.embedPlayer.getTopBarContainer().height();
			}
			this.getComponent().position( {
				my: 'right top+'+height,
				at: 'right top',
				of: this.embedPlayer.getInterface(),
				collision: 'none'
			} );
		},
		addBindings: function () {
			//Set control bar visiblity handlers
			var _this = this;
			this.embedPlayer.getInterface()
				.on( 'mousemove touchstart', function(){
					if (!_this.disabled){
						_this.show();
					}
				})
				.on( 'mouseleave', function(){
					if (!mw.isMobileDevice() && !_this.disabled){
						_this.hide();
					}
				});

			//add drop shadow containers for control bar
			this.embedPlayer.getVideoHolder().prepend($("<div class='dualScreen controlBarShadow componentAnimation'></div>").addClass('componentOff'));

			//Attach control bar action handlers
			_this.getComponent()
				.on( 'click', 'li > span', function () {
					var btn = _this.controlBarComponents[this.id];
					if (btn && btn.event){
						_this.embedPlayer.triggerHelper("dualScreenStateChange", btn.event);
						//_this.fsm.consumeEvent( event );
					}
				} );

			//Set tooltips
			var buttons = this.getComponent().find('li > span' );
			buttons.attr('data-show-tooltip', true);
			this.embedPlayer.layoutBuilder.setupTooltip(buttons, "arrowTop");
		},
		disable: function () {
			console.warn("disable");
			clearTimeout(this.getComponent().handleTouchTimeoutId);
			this.disabled = true;
		},
		enable: function () {
			console.warn("enable");
			this.disabled = false;
		},
		hide: function ( ) {
			if ( this.disabled ) {
				return;
			}
			console.warn("hide");
			if ( this.getComponent().isVisible ) {
				this.getComponent().addClass('componentOff componentAnimation' ).removeClass('componentOn');
				this.embedPlayer.getVideoHolder().find(".controlBarShadow" ).addClass('componentOff componentAnimation' ).removeClass('componentOn');
				this.getComponent().isVisible = false;
			}
		},
		show: function ( ) {
			if ( this.disabled || this.ignoreNextMouseEvent) {
				this.ignoreNextMouseEvent = false;
				return;
			}
			console.warn("show");
			if ( !this.getComponent().isVisible ) {
				this.getComponent().removeClass('componentAnimation').addClass('componentOn' ).removeClass('componentOff');
				this.positionControlBar();
				this.getComponent().isVisible = true;
				this.embedPlayer.getVideoHolder().find(".controlBarShadow" ).removeClass('componentAnimation').addClass('componentOn' ).removeClass('componentOff');
			}

			var _this = this;
			if (this.getComponent().handleTouchTimeoutId){
				clearTimeout(this.getComponent().handleTouchTimeoutId);
			}
			this.getComponent().handleTouchTimeoutId = setTimeout( function () {
				_this.ignoreNextMouseEvent = true;
				_this.hide( );
			}, this.menuFadeout );

		}
	};
})( window.mw, window.jQuery );



/*
*
*
*
*
*
 //Control Bar
 getControlBar: function ( ) {
 if ( !this.$controlBar ) {
 this.$controlBar = $( '<div />' )
 .addClass( 'controlBar componentOff' + this.getCssClass() )
 .append(
 $( '<div class="controlBar-content" /> ' ).append(
 this.getTemplateHTML( )
 )
 );
 this.getPlayer().getInterface().append( this.$controlBar );
 this.setControlBarWidth();
 }
 return this.$controlBar;
 },
 setControlBarWidth: function(){
 var width = 0;
 this.getControlBar().find("#displayControlBar").each(function() {
 width += $(this).outerWidth( true );
 });
 this.getControlBar().
 css({'width': width + 10});
 },
 positionControlBar: function (  ) {
 var height = 0;
 if (this.getPlayer().getTopBarContainer().length) {
 height = this.getPlayer().getTopBarContainer().height();
 }
 this.getControlBar().position( {
 my: 'right top+'+height,
 at: 'right top',
 of: this.getPlayer().getInterface(),
 collision: 'none'
 } );
 },
 setControlBarBindings: function () {
 //Set control bar visiblity handlers
 var _this = this;
 this.getPlayer().getInterface()
 .on( 'mousemove touchstart', function(e){_this.showControlBar( )} )
 .on( 'mouseleave', function(e){if (!mw.isMobileDevice()){_this.hideControlBar( )} } );

 //add drop shadow containers for control bar
 this.getPlayer().getInterface().find(".mwEmbedPlayer").prepend($("<div class='controlBarShadow componentAnimation'></div>").addClass('componentOff'));
 this.getComponent().prepend($("<div class='controlBarShadow componentAnimation'></div>").addClass('componentOff'));
 //Attach control bar action handlers
 $.each( _this.controlBarComponents, function ( name, component ) {
 _this.getControlBar()
 .on( 'click', 'li > span#' + component.id, function () {
 var event = null;
 switch ( component.id ) {
 case 'sideBySide':
 event = "SbS";
 break;
 case 'switchView':
 event = "switchView";
 break;
 case 'singleView':
 event = 'hide';
 break;
 case 'pip':
 event = 'PiP';
 break;
 }
 if ( event != null ) {
 _this.fsm.consumeEvent( event );
 }
 } )
 .find('li > span#' + component.id)
 .attr('title', component.title)
 .attr('data-show-tooltip', true);
 } );

 this.bind("showPlayerControls" , function(){
 _this.showControlBar();
 });
 },
 disable: function () {
 clearTimeout(this.getControlBar().handleTouchTimeoutId);
 this.monitorControlBarDisabled = false;
 this.hideControlBar( );
 this.monitorControlBarDisabled = true;
 },
 enable: function () {
 this.monitorControlBarDisabled = false;
 this.showControlBar( );
 },
 hideControlBar: function ( ) {
 if ( this.monitorControlBarDisabled ) {
 return;
 }
 if ( this.getControlBar().isVisible ) {
 this.getControlBar().addClass('componentOff componentAnimation' ).removeClass('componentOn');
 this.getFirstMonitor().obj.find(".controlBarShadow" ).addClass('componentOff componentAnimation' ).removeClass('componentOn');
 this.getControlBar().isVisible = false;
 }
 },
 showControlBar: function ( ) {
 if ( this.monitorControlBarDisabled || this.ignoreNextMouseEvent) {
 this.ignoreNextMouseEvent = false;
 return;
 }
 if ( !this.getControlBar().isVisible ) {
 this.getControlBar().removeClass('componentAnimation').addClass('componentOn' ).removeClass('componentOff');
 this.positionControlBar();
 this.getControlBar().isVisible = true;
 this.getFirstMonitor().obj.find(".controlBarShadow" ).removeClass('componentAnimation').addClass('componentOn' ).removeClass('componentOff');
 }

 var _this = this;
 if (this.getControlBar().handleTouchTimeoutId){
 clearTimeout(this.getControlBar().handleTouchTimeoutId);
 }
 this.getControlBar().handleTouchTimeoutId = setTimeout( function () {
 _this.ignoreNextMouseEvent = true;
 _this.hideControlBar( );
 }, this.getConfig('menuFadeout') );

 },

 *
*
* */
