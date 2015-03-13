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

		addBindings: function () {
			//Set control bar visiblity handlers
			var _this = this;
			this.embedPlayer.getInterface()
				.on( 'mousemove touchstart', function(){
					_this.show();
				})
				.on( 'mouseleave', function(){
					if (!mw.isMobileDevice()){
						_this.hide();
					}
				});

			//add drop shadow containers for control bar
			this.embedPlayer.getVideoHolder().prepend($("<div class='dualScreen controlBarShadow componentAnimation'></div>").addClass('componentOff'));

			//Cache buttons
			var buttons = _this.getComponent().find( "span" );
			//Attach control bar action handlers
			_this.getComponent()
				.on( 'click touchstart', 'li > span', function (e) {
					e.stopPropagation();
					e.preventDefault();
					var btn = _this.controlBarComponents[this.id];
					var obj = $(this);
					//Change state button disabled state
					if (obj.data("type") === "state") {
						buttons.removeClass( "disabled" );
						obj.addClass( "disabled" );
					}
					if (btn && btn.event){
						_this.embedPlayer.triggerHelper("dualScreenStateChange", btn.event);
					}
					return false;
				} );

			//Set tooltips
			var buttons = this.getComponent().find('li > span' );
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
