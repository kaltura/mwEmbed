( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'masterPlugin', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			"align": "right",
			'order': 100,
			'showTooltip': true,
			'displayImportance': "high",
			'title': "Master Plugin",
			'iconClass': 'icon-flag',
			'config':{}
		},

		menuOpened: false,
		$menu: null,

		setup: function( embedPlayer ) {
			if ( $.isEmptyObject(this.getConfig("config")) ){
				this.setConfig( "visible", false ); // remove plugin if no config was specified
				return;
			}
			this.addBindings();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
					.attr( 'title', this.getConfig('title') )
					.addClass( this.getConfig('iconClass') + " btn " + this.getCssClass() )
					.click( function(e) {
						_this.toggleMenu( e.clientX ); // pass the mouse pointer x position to set the menu position
					});
			}
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
		},
		toggleMenu: function(x) {
			if ( this.isDisabled ){return};
			if ( this.menuOpened ){
				this.closeMenu();
			}else{
				this.openMenu(x);
			}
		},

		openMenu: function(x){
			this.embedPlayer.getVideoHolder().append( this.getMenu(x) );
			this.menuOpened = true;
		},

		closeMenu: function(){
			this.getMenu().remove();
			this.menuOpened = false;
		},

		getMenu: function(x){
			if ( !this.$menu ){
				// set menu position
				var rightPosition = this.embedPlayer.getVideoHolder().width() - x - 20; // set right position for the menu according to the mouse click x position
				var bottomPosition = 0; // set the menu bottom to the video holder bottom
				if  ( this.embedPlayer.getKalturaConfig( "controlBarContainer", "hover" ) === true ){
					bottomPosition = this.embedPlayer.getInterface().find(".controlsContainer").height(); // for hovering controls, update the menu bottom to the controls bar height
				}

				// add menu DIV
				this.$menu = $('<div class="masterPluginMenu"></div>').css({"bottom": bottomPosition, "right": rightPosition});
				var config = this.getConfig('config');

				// set menu height
				var menuHeight = this.calculateMenuHeight(config);
				if ( menuHeight > this.embedPlayer.getVideoHolder().height() - 20 ){
					this.$menu.height(this.embedPlayer.getVideoHolder().height() - 20);
					this.$menu.css("overflow-y","scroll");
				}else{
					this.$menu.height(this.calculateMenuHeight(config));
				}

				// render menu
				this.renderMenu(config);

			}
			return this.$menu;
		},

		calculateMenuHeight: function(config){
			var menuHeight = config.plugins.length * 40; // give each plugin header 40 px
			config.plugins.forEach(function (plugin, index) {
				menuHeight += plugin.properties.length * 30; // give each plugin property 30 px
			});
			if ( config.title && config.title.length ){
				menuHeight += 50; // give 50 pixels for the optional menu title
			}
			return menuHeight;
		},

		renderMenu: function(config){
			if ( config.title && config.title.length ){
				this.$menu.append('<p class="title">' + config.title + '</p>');
			}
		}
	}));

} )( window.mw, window.jQuery );
