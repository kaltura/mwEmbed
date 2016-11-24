( function( mw, $ ) {"use strict";

	mw.KBaseSmartContainer = mw.KBaseComponent.extend({
		title: "settings",                          // default title attribute for the smart container button. Should be override by each specific smart container
		closingEvents: 'onplay',                    // events that trigger closing the smart container plugins screen. should be override for each smart container according to its plugins
		registeredPlugins: [],                      // plugins to display in the Smart Container plugins screen
		shouldResumePlay: false,                    // resume playback when closing the smart container screen
		pluginsScreenOpened: false,                 // flag for when the smart container screen is open
		overlayOpen: false,                         // flag indicating an overlay screen is currently open (for example when a moderation report is open)
		isDisabled: false,

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return this.embedPlayer.isMobileSkin() && mw.getConfig("EmbedPlayer.UseSmartContainers") !== false; // disable on desktop or "EmbedPlayer.UseSmartContainers" flashvar set to false
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', this.title )
							.addClass( "btn" + this.getCssClass() )
							.on('click', function(e) {
								if (_this.isDisabled){
									return;
								}
								if ( !_this.pluginsScreenOpened && !_this.overlayOpen ){
									_this.showRegisteredPlugins();
								}else{
									_this.hideRegisteredPlugins();
								}
							});
			}
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
			this.bind('pluginsReady', function(e, plugins ){

				// add to the smart container all the plugins with the "smartContainer" property set to the smart container pluginName
				for ( var plugin in plugins){
					if ( plugins[plugin].getConfig("smartContainer") && plugins[plugin].getConfig("smartContainer") === _this.pluginName && plugins[plugin].safe){
						_this.registeredPlugins.push(plugins[plugin]);
						// add close events
						if (plugins[plugin].getConfig("smartContainerCloseEvent")){
							var closeEvent = plugins[plugin].getConfig("smartContainerCloseEvent");
							if ( _this.closingEvents.indexOf(closeEvent) === -1 ){
								_this.closingEvents += " " + closeEvent;
							}
						}
					}
				}
				// if we have more than 1 plugin registered to this smart container - move the plugins to the smart container screen and bind events
				if ( _this.registeredPlugins.length > 1 ){
					if (!_this.embedPlayer.getVideoHolder().find(".smartContainer").length){
						_this.embedPlayer.getVideoHolder().append("<div class='smartContainer'></div>");
					}
					for ( var i = 0; i < _this.registeredPlugins.length; i++ ){
						_this.registeredPlugins[i].setConfig("parent", "smartContainer");
						_this.registeredPlugins[i].setConfig("align", "center");
					}

					_this.bind( _this.closingEvents, function(){ // close the smart container screen on each one of the closing events (if its opened)
						if ( _this.pluginsScreenOpened ){
							_this.hideRegisteredPlugins();
							_this.checkResumePlayback();
						}
					});

					_this.bind( "preShowScreen displayMenuOverlay", function(){ // close the smart container screen when opening a kBaseScreen plugin
						if ( _this.pluginsScreenOpened ){
							_this.hideRegisteredPlugins();
						}
					});

					_this.bind( "displayMenuOverlay", function(){ // close the smart container screen when opening a kBaseScreen plugin
						_this.overlayOpen = true;
					});
					_this.bind( "closeMenuOverlay", function(){ // close the smart container screen when opening a kBaseScreen plugin
						_this.overlayOpen = false;
					});

					_this.bind( "onShowInterfaceComponents", function(){
						setTimeout(function(){
							_this.hideRegisteredPlugins();
						},0);
					});

					setTimeout(function(){
						_this.hideRegisteredPlugins();
					},0);
				}else{
					// if we have less than 2 plugins registered to the smart container - hide it so it won't be used
					_this.hide();
				}
			});

			this.bind('playerReady', function(){
				if (_this.registeredPlugins.length < 2) {
					_this.hide();
				}
			});

		},
		hideRegisteredPlugins: function(){
			this.pluginsScreenOpened = false;
			this.embedPlayer.getInterface().removeClass( "pluginsScreenOpened" );
			$(this.embedPlayer.getPlayerElement()).removeClass("blur");
			this.embedPlayer.getVideoHolder().find(".closePluginsScreen").remove(); // remove close button
			for ( var i = 0; i < this.registeredPlugins.length; i++ ){
				this.registeredPlugins[i].hide();
			}

			this.embedPlayer.getControlBarContainer().show();
			this.embedPlayer.triggerHelper("hideMobileComponents"); // used by plugins like closed captions to restore captions on screen
			this.embedPlayer.triggerHelper("updateComponentsVisibilityDone");
		},
		showRegisteredPlugins: function(){
			var _this = this;
			// clean registeredPlugins array from plugins that were defined as isSafeEnviornment = false by a promise returned after the pluginsReady event
			for ( var i = this.registeredPlugins.length -1; i >= 0; i-- ){
				if ( !this.registeredPlugins[i].safe ){
					this.registeredPlugins.splice( i, 1 );
				}
			}

			this.pluginsScreenOpened = true;

			var $sc = this.embedPlayer.getVideoHolder().find(".smartContainer");
			$sc.children().hide();

			this.embedPlayer.getInterface().addClass( "pluginsScreenOpened" );
			$(this.embedPlayer.getPlayerElement()).addClass("blur");
			// calculate the width and height for each plugin. Adding 1 to the plugins count to add some spacing. Done each time the plugins are shown to support responsive players.
			var numPlugins = this.registeredPlugins.length;
			var pluginWidth = 33;
			if ( numPlugins === 4 || numPlugins === 2){
				pluginWidth = 50;
			}
			var pluginHeight = this.embedPlayer.getVideoHolder().width() / (numPlugins + 1);
			$sc.find(".comp").not(".closePluginsScreen, .icon-next, .icon-prev, .largePlayBtn").width( pluginWidth + "%").height(pluginHeight);
			$sc.removeClass("comp1 comp2 comp3 comp4 comp5 comp6").addClass("comp" + this.registeredPlugins.length);

			for ( var i = 0; i < this.registeredPlugins.length; i++ ){
				var plugin = this.registeredPlugins[i].getComponent();
				// add plugin label if not exist
				if ( !plugin.find(".btnLabel").length ){
					var pluginBtn = plugin.find(".btn");
					if ( pluginBtn.length === 0 && plugin.hasClass("btn")){
						pluginBtn = plugin;
					}
					pluginBtn.removeClass("pull-right");
					pluginBtn.append("<p class='btnLabel'>" + this.registeredPlugins[i].getConfig('title') + "</p>");
					pluginBtn.find(".accessibilityLabel").remove(); // remove accessibility label if exists as the new label can be used for the same purpose
				}
				plugin.fadeIn(400, function(){
					$(this).css("display","inline-block");
				});
			}
			this.shouldResumePlay = !this.embedPlayer.paused;
			this.embedPlayer.ignoreNextNativeEvent = true;
			this.embedPlayer.pause();
			this.embedPlayer.getControlBarContainer().fadeOut();
			this.embedPlayer.triggerHelper("showMobileComponents"); // used by plugins like closed captions to hide captions

			// add close button to the smart container screen
			var closeBtn = $("<button class='btn icon-close closePluginsScreen'></button>")
				.on('click',function(e){
					if ( _this.pluginsScreenOpened ){
						_this.hideRegisteredPlugins();
						_this.checkResumePlayback();
					}
				});
			_this.embedPlayer.getVideoHolder().append(closeBtn);
		},

		checkResumePlayback: function(){
			if ( this.shouldResumePlay ){
				this.shouldResumePlay = false;
				this.embedPlayer.play();
			}else{
				this.embedPlayer.triggerHelper("showLargePlayBtn");
			}
		}
	});

} )( window.mw, window.jQuery );
