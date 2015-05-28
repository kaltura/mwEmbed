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
			var _this = this;
			if ( $.isEmptyObject(this.getConfig("config")) ){
				this.setConfig( "visible", false ); // remove plugin if no config was specified
				return;
			}
			// hide specified plugins
			var config = this.getConfig('config');
			config.plugins.forEach(function (plugin, index) {
				_this.embedPlayer.setKalturaConfig( plugin.pluginName, "visible", false );
			});

			this.getMenu(); // create menu
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
			// set menu position
			var rightPosition = this.embedPlayer.getVideoHolder().width() - x - 20; // set right position for the menu according to the mouse click x position
			var bottomPosition = 0; // set the menu bottom to the video holder bottom
			if  ( this.embedPlayer.getKalturaConfig( "controlBarContainer", "hover" ) === true ){
				bottomPosition = this.embedPlayer.getInterface().find(".controlsContainer").height(); // for hovering controls, update the menu bottom to the controls bar height
			}

			this.embedPlayer.getVideoHolder().append( this.getMenu().css({"bottom": bottomPosition, "right": rightPosition}) );
			this.menuOpened = true;
			this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );
		},

		closeMenu: function(){
			this.getMenu().remove();
			this.menuOpened = false;
			this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
		},

		getMenu: function(){
			if ( !this.$menu ){
				var _this = this;
				// add menu DIV
				this.$menu = $('<div class="masterPluginMenu"></div>');
				var config = this.getConfig('config');

				// set menu height
				var menuHeight = this.calculateMenuHeight(config);
				if ( menuHeight > this.embedPlayer.getVideoHolder().height() - 20 ){
					this.$menu.height(this.embedPlayer.getVideoHolder().height() - 20);
					this.$menu.css("overflow-y","scroll");
				}else{
					this.$menu.height(this.calculateMenuHeight(config));
				}
				this.$menu.close = function(){
					_this.closeMenu();
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
			var _this = this;
			var embedPlayer = this.getPlayer();
			if ( config.title && config.title.length ){
				this.$menu.append('<p class="title">' + config.title + '</p>');
			}
			config.plugins.forEach(function (plugin, index) {
				_this.$menu.append('<p class="pluginTitle">' + plugin.displayName + '</p>');
				plugin.properties.forEach(function (property, index) {
					switch (property.type){
						case 'boolean':
							var propField = $('<input class="pluginProperty pluginPropertyLabel checkbox" type="checkbox">')
								.on("change", function(){
									_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).is(":checked") );
								});
							if ( property.updateEvent ){
								embedPlayer.bindHelper( property.updateEvent, function(e, prop){
									propField.prop( "checked", prop.value ); // set checkbox value according to value passed on the event
								});
							}else{
								propField.prop( "checked", embedPlayer.getKalturaConfig( plugin.pluginName, property.property )); // set checkbox value according to property value
							}
							_this.$menu.append(propField).append(property.label);
							break;
						case 'enum':
							_this.$menu.append('<span class="pluginPropertyLabel">' + property.label + '</span>');
							var propField = $('<select class="pluginProperty pluginPropertyLabel"></select>')
								.on("change", function(){
									_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).val() );
								});
							var addOptions = function(items){
								$.each(items, function (i, item) {
									propField.append($('<option>', {
										value: item.value,
										text : item.text
									}));
								});
							}
							if (property.updateEvent ){
								embedPlayer.bindHelper( property.updateEvent, function(e, prop){
									addOptions(prop.items);
								});
							}else{
								addOptions( embedPlayer.getKalturaConfig( plugin.pluginName, property.property ));
							}
							_this.$menu.append(propField);
							break;
						case 'string':
						case 'number':
						case 'float':
							_this.$menu.append('<span class="pluginPropertyLabel">' + property.label + '</span>');
							var propField = $('<input class="pluginProperty pluginPropertyLabel" type="text"/>')
								.on("change", function(){_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).val() )});
							if ( property.updateEvent ){
								embedPlayer.bindHelper( property.updateEvent, function(e, prop){
									propField.val( prop.value ); // set field value according to value passed on the event
								});
							}else{
								propField.val( embedPlayer.getKalturaConfig( plugin.pluginName, property.property )); // set field value according to property value
							}
							_this.$menu.append(propField);
							break;
						default:
							break;
					}
				});
			});
		},

		propertyChanged: function(plugin, property, type, value){
			if (type == "number"){
				value = parseInt(value);
			}
			if (type == "float"){
				value = parseFloat(value);
			}
			console.log("---> propertyChanged: plugin: "+plugin+", property: "+property+", type: "+type+", value: "+value);
		}
	}));

} )( window.mw, window.jQuery );
