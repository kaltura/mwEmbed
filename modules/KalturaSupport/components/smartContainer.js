( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'smartContainer', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			"align": "right",
			'order': 100,
			'showTooltip': true,
			'displayImportance': "high",
			'tooltip': null,
			'iconClass': 'icon-cog',
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
			this.getMenu(); // create menu
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
					.addClass( this.getConfig('iconClass') + " btn " + this.getCssClass() )
					.click( function(e) {
						_this.toggleMenu( e.clientX ); // pass the mouse pointer x position to set the menu position
					});
				if (this.getConfig("tooltip")){
					this.$el.attr( 'title', this.getConfig('tooltip') )
				}
			}
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
			this.bind( 'layoutBuildDone updatePropertyEvent', function(){
				// hide specified plugins
				var config = _this.getConfig('config');
				config.plugins.forEach(function (plugin, index) {
					_this.embedPlayer.setKalturaConfig( plugin.pluginName, "visible", false );
				});
			});

			this.bind( 'onOpenFullScreen onCloseFullScreen onHideControlBar', function(){
				_this.closeMenu();
			});
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
			var rightPosition = this.embedPlayer.getVideoHolder().width() - x - this.getComponent().width()/2; // set right position for the menu according to the mouse click x position
			var bottomPosition = 0; // set the menu bottom to the video holder bottom
			if  ( this.embedPlayer.getKalturaConfig( "controlBarContainer", "hover" ) === true ){
				bottomPosition = this.embedPlayer.getInterface().find(".controlBarContainer").height(); // for hovering controls, update the menu bottom to the controls bar height
			}
			this.getMenu().css({"bottom": bottomPosition, "right": rightPosition}).show();
			this.menuOpened = true;
			this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );
		},

		closeMenu: function(){
			this.getMenu().find("ul").hide();
			this.getMenu().hide();
			this.menuOpened = false;
			this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
		},

		getMenu: function(){
			if ( !this.$menu ){
				var _this = this;
				// add menu DIV
				this.$menu = $('<div class="smartContainerMenu"></div>');
				this.$menu.close = function(){
					_this.closeMenu();
				}
				// render menu
				this.renderMenu();
				this.embedPlayer.getVideoHolder().append( this.$menu.hide() );
			}
			return this.$menu;
		},

		renderMenu: function(){
			var _this = this;
			var config = this.getConfig('config');
			config.plugins.forEach(function (plugin, index) {
				plugin.properties.forEach(function (property, index) {
					var initialValue = _this.embedPlayer.getKalturaConfig( plugin.pluginName, property.property );
					switch (property.type){
						case 'boolean':
							var propField = $('<input class="pluginProperty checkbox" type="checkbox">')
								.on("change", function(){
									_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).is(":checked") );
								});
							if ( initialValue !== undefined ){
								propField.prop( "checked", initialValue ); // set checkbox value according to property value
							}
							_this.embedPlayer.bindHelper( "updatePropertyEvent", function(e, data){
								if ( data.plugin === plugin.pluginName && data.property === property.property){
									propField.prop( "checked", data.value ); // set checkbox value according to value passed on the updatePropertyEvent event
								}
							});
							var wrapper = $('<p><label>' + property.label + '</label></p>');
							_this.$menu.append(wrapper.find("label").prepend(propField));
							break;
						case 'enum':
							var propField = $('<select class="pluginProperty hidden"></select>')
								.on("change", function(){
									_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).get(0).selectedIndex );
								});
							var fakeCombo = $("<div><span></span><i class='icon-caret'></i></div>").addClass("fakeCombo pluginProperty");
							fakeCombo.find('span').text(gM("mwe-embedplayer-no-source"));
							var menu = $("<ul></ul>");
							var addOptions = function(items){
								$.each(items, function (i, item) {
									propField.append($('<option>', {
										value: item.value,
										text : item.label
									}));
									if ( i === items.length - 1 ){
										menu.append($("<li></li>").addClass("last").text(item.label).append($("<i></i>").addClass("icon-check")));
									}else{
										menu.append($("<li></li>").text(item.label).append($("<i></i>").addClass("icon-check")));
									}
									if ( i === 0 ){
										fakeCombo.find('span').text(item.label);
									}
								});
								menu.find("li").on("click", function(){
									menu.find("li").removeClass("active");
									$(this).addClass("active");
									fakeCombo.find('span').text($(this).text());
									propField.val($(this).text()).change();
									menu.hide();
								});
								var menuItemHeight = menu.find("li").height() +  2 * parseInt(menu.find("li").css("padding-top"));
								menu.css("margin-top", -1 * (items.length+1) * menuItemHeight - items.length + parseInt(fakeCombo.css("margin-top"))/2 + "px");

							}
							if ( initialValue !== undefined && initialValue.length ){
								addOptions( initialValue ); // set combobox options according to property value
							}
							_this.embedPlayer.bindHelper( "updatePropertyEvent", function(e, data){
								if ( data.plugin === plugin.pluginName && data.property === property.property){
									addOptions(data.items); // set combobox options according to value passed on the updatePropertyEvent event
									if ( data.selectedItem ){
										propField.val(data.selectedItem); // support selected item change
										fakeCombo.find('span').text(data.selectedItem);
										menu.find("li").filter(function(){return $(this).text() === data.selectedItem;}).addClass("active");
									}
								}
							});
							var elm = $("<p></p>").append('<span class="pluginPropertyLabel">' + property.label + '</span>').append(fakeCombo).append(propField).append(menu);
							fakeCombo.on("click", function(){
								if (menu.find("li").length){
									menu.toggle();
								}
							});
							_this.$menu.append(elm);
							break;
						case 'string':
						case 'number':
						case 'float':
							var propField = $('<input class="pluginProperty" type="text"/>')
								.on("change", function(){
									_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).val() )
								});
							if ( initialValue !== undefined ){
								propField.val( initialValue ); // set field value according to property value
							}
							_this.embedPlayer.bindHelper( "updatePropertyEvent", function(e, data){
								if ( data.plugin === plugin.pluginName && data.property === property.property){
									propField.val( data.value ); // set field value according to value passed on the updatePropertyEvent event
								}
							});
							var elm = $("<p></p>").append('<span class="pluginPropertyLabel">' + property.label + '</span>').append(propField);
							_this.$menu.append(elm);
							break;
						default:
							break;
					}
				});
			});
			//this.$menu.find(".pluginProperty").not(".checkbox").css({"float":"right","margin-right": "30px"});
		},

		propertyChanged: function(plugin, property, type, value){
			if (type == "number"){
				value = parseInt(value);
			}
			if (type == "float"){
				value = parseFloat(value);
			}
			this.embedPlayer.triggerHelper("propertyChangedEvent",{"plugin": plugin, "property": property, "value": value})
		}
	}));

} )( window.mw, window.jQuery );