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
		closeMenuTimeoutId: null,

		isSafeEnviornment: function(){
			return !mw.isMobileDevice();
		},

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
				_this.embedPlayer.triggerHelper("updateComponentsVisibilityDone");
			});

			this.bind( 'onOpenFullScreen onCloseFullScreen onHideControlBar', function(){
				_this.closeMenu();
			});

			this.bind( 'playerReady', function(){
				_this.getMenu(); // create menu
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
			var _this = this;
			var rightPosition = this.embedPlayer.getVideoHolder().width() - x - this.getComponent().width()/2; // set right position for the menu according to the mouse click x position
			var bottomPosition = 0; // set the menu bottom to the video holder bottom
			if  ( this.embedPlayer.getKalturaConfig( "controlBarContainer", "hover" ) === true ){
				bottomPosition = this.embedPlayer.getInterface().find(".controlBarContainer").height(); // for hovering controls, update the menu bottom to the controls bar height
			}
			this.getMenu().css({"bottom": bottomPosition, "right": rightPosition}).show();
			this.getMenu().on("mouseleave", function(){
				if (_this.closeMenuTimeoutId){
					clearTimeout(_this.closeMenuTimeoutId);
					_this.closeMenuTimeoutId = null;
				}
				_this.closeMenuTimeoutId = setTimeout(function(){
					if (_this.menuOpened){
						_this.closeMenu();
					}
				},5000);
			});
			this.getMenu().on("mouseenter", function(){
				if (_this.closeMenuTimeoutId){
					clearTimeout(_this.closeMenuTimeoutId);
					_this.closeMenuTimeoutId = null;
				}
			});
			this.menuOpened = true;
			this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );
			this.getPlayer().triggerHelper( 'onComponentsHoverDisabled' );

		},

		closeMenu: function(){
			if (this.closeMenuTimeoutId){
				clearTimeout(this.closeMenuTimeoutId);
				this.closeMenuTimeoutId = null;
			}
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
					_this.getPlayer().triggerHelper( 'onComponentsHoverEnabled' );
					_this.closeMenu();
				}
				// render menu
				this.renderMenu();
				this.embedPlayer.getVideoHolder().append( this.$menu.hide() );
				$(".mobile .smartContainerMenu").on("click", function(){
					_this.getPlayer().triggerHelper( 'onComponentsHoverEnabled' );
					_this.closeMenu();
				});
			}
			return this.$menu;
		},

		renderMenu: function(){
			var _this = this;
			var config = this.getConfig('config');
			config.plugins.forEach(function (plugin, index) {
				var iconClass = _this.embedPlayer.getKalturaConfig( plugin.pluginName, "iconClass" );
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
							var wrapper = $('<p><i class="pluginIcon"></i><label>' + property.label + '</label></p>');
							wrapper.find(".pluginIcon").addClass(iconClass);
							_this.$menu.append(wrapper.find("label").prepend(propField));
							break;
						case 'enum':
							var propField = $('<select class="pluginProperty hidden"></select>') // create a select combo box (hidden)
								.on("change", function(){
									_this.propertyChanged(plugin.pluginName, property.property, property.type, $(this).get(0).selectedIndex );
								})
								.on("click", function(e){
									e.preventDefault();
									return false;
								});
							var fakeCombo = $("<div><span></span><i class='icon-caret'></i></div>").addClass("fakeCombo pluginProperty"); // show instead of select box
							fakeCombo.find('span').text(gM("mwe-embedplayer-no-source")); // inital text shown when no data is available
							var menu = $("<ul></ul>");                                    // the UL will be the dropdown menu of the combo box
							var addOptions = function(items){                             // add items to the menu - add to bothe the original hidden select box and the UL menu
								menu.empty();
								propField.empty();
								$.each(items, function (i, item) {
									propField.append($('<option>', {                      // add item to hidden select box
										value: item.value,
										text : item.label
									}));
									if ( i === items.length - 1 ){
										menu.append($("<li></li>").addClass("last").text(item.label).append($("<i></i>").addClass("icon-check"))); // add last item - don't add a separator lone after it
									}else{
										menu.append($("<li></li>").text(item.label).append($("<i></i>").addClass("icon-check"))); // add a regular item with a separator line after it
									}
									if ( i === 0 ){
										fakeCombo.find('span').text(item.label); // set the initial value shown to the first item value
									}
								});
								menu.find("li").on("click", function(){           // click on menu item handler
									menu.find("li").removeClass("active");        // remove active class from all menu items
									$(this).addClass("active");                   // add active class to selected menu item
									fakeCombo.find('span').text($(this).text());  // update value of the fake combo box menu
									propField.val($(this).text()).change();       // update hidden select box value and trigger a change event to trigger the propertyChanged method
									menu.hide();                                  // close the menu
								});
								var menuItemHeight = menu.find("li").height() +  2 * parseInt(menu.find("li").css("padding-top")); // calculate menu item height to be used for the menu vertical position calculation
								menu.css("margin-top", -1 * (items.length+1) * menuItemHeight + 7 + "px"); // set menu vertical position according to its size

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
							var elm = $('<p><i class="pluginIcon"></i></p>').append('<span class="pluginPropertyLabel">' + property.label + '</span>').append(fakeCombo).append(propField).append(menu); // create the plugin DOM element
							fakeCombo.on("click", function(){ // open and close menu on click
								$(".smartContainerMenu").find("ul").each(function(){ // close all other menus
									if ( this !== menu[0] ){
										$(this).hide();
									}
								});
								if ( menu.find("li").length ){  // don't open empty menus
									menu.toggle(); // open / close menu
								}
							});
							elm.find(".pluginIcon").addClass(iconClass);
							_this.$menu.append(elm); // add plugin menu to DOM
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
							var elm = $('<p><i class="pluginIcon"></i></p>').append('<span class="pluginPropertyLabel">' + property.label + '</span>').append(propField);
							elm.find(".pluginIcon").addClass(iconClass);
							_this.$menu.append(elm);
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
			this.embedPlayer.triggerHelper("propertyChangedEvent",{"plugin": plugin, "property": property, "value": value})
		}
	}));

} )( window.mw, window.jQuery );