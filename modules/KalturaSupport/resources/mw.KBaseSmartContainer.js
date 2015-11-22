( function( mw, $ ) {"use strict";

	mw.KBaseSmartContainer = mw.KBaseComponent.extend({
		title: "settings",                          // default title attribute for the smart container button. Should be override by each specific smart container
		closingEvents: 'onAddPlayerSpinner onplay', // events that trigger closing the smart container plugins screen. should be override for each smart container according to its plugins
		registeredPlugins: [],                      // plugins to display in the Smart Container plugins screen
		shouldResumePlay: false,                    // resume playback when closing the smart container screen
		pluginsScreenOpened: false,                 // flag for when the smart container screen is open
		isDisabled: false,

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return mw.isMobileDevice() && mw.getConfig("EmbedPlayer.UseSmartContainers") !== false; // disable on desktop or "EmbedPlayer.UseSmartContainers" flashvar set to false
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', this.title )
							.addClass( "btn" + this.getCssClass() )
							.click( function() {
								if ( !_this.pluginsScreenOpened ){
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
					if ( plugins[plugin].getConfig("smartContainer") && plugins[plugin].getConfig("smartContainer") === _this.pluginName ){
						_this.registeredPlugins.push(plugins[plugin]);
					}
				}
				// if we have more than 1 plugin registered to this smart container - move the plugins to the smart container screen
				if ( _this.registeredPlugins.length > 1 ){
					for ( var i = 0; i < _this.registeredPlugins.length; i++ ){
						_this.registeredPlugins[i].setConfig("parent", "videoHolder");
						_this.registeredPlugins[i].setConfig("align", "center");
					}
					setTimeout(function(){
						_this.hideRegisteredPlugins();
						// add close button to the smart container screen
						var closeBtn = $("<button class='btn icon-close closePluginsScreen'></button>")
							.click(function(){
								if ( _this.pluginsScreenOpened ){
									_this.hideRegisteredPlugins();
								}
							});
						_this.embedPlayer.getVideoHolder().remove(".closePluginsScreen").append(closeBtn);
					},0);
				}else{
					// if we have less than 2 plugins registered to the smart container - hide it so it won't be used
					_this.hide();
				}
			});

			this.bind( this.closingEvents, function(){ // close the smart container screen on each one of the closing events (if its opened)
				if ( _this.pluginsScreenOpened ){
					_this.hideRegisteredPlugins();
				}
			});
		},
		hideRegisteredPlugins: function(){
			this.pluginsScreenOpened = false;
			this.embedPlayer.getVideoHolder().removeClass( "pluginsScreenOpened" );
			for ( var i = 0; i < this.registeredPlugins.length; i++ ){
				this.registeredPlugins[i].hide();
			}

			this.embedPlayer.getControlBarContainer().show();
			this.embedPlayer.getTopBarContainer().show();

			if ( this.shouldResumePlay ){
				this.embedPlayer.play();
			}else{
				this.embedPlayer.getVideoHolder().find(".largePlayBtn").show();
			}
			this.embedPlayer.triggerHelper("hideMobileComponents"); // used by plugins like closed captions to restore captions on screen
		},
		showRegisteredPlugins: function(){
			this.pluginsScreenOpened = true;
			this.embedPlayer.getVideoHolder().addClass( "pluginsScreenOpened" );

			// calculate the width for each plugin. Adding 1 to the plugins count to add some spacing. Done each time the plugins are shown to support responsive players.
			var pluginWidth = this.embedPlayer.getVideoHolder().width() / (this.registeredPlugins.length + 1);
			this.embedPlayer.getVideoHolder().find(".btn").not(".closePluginsScreen").width(pluginWidth);

			for ( var i = 0; i < this.registeredPlugins.length; i++ ){
				var plugin = this.registeredPlugins[i].getComponent();
				// add plugin label if not exist
				if ( !plugin.find(".btnLabel").length ){
					plugin.find(".btn .accessibilityLabel").remove(); // remove accessibility label if exists as the new label can be used for the same purpose
					plugin.find(".btn").append("<p class='btnLabel'>" + this.registeredPlugins[i].getConfig('title') + "</p>");
				}
				plugin.fadeIn(400, function(){
					$(this).css("display","inline-block");
				});
			}
			this.shouldResumePlay = !this.embedPlayer.paused;
			this.embedPlayer.pause();
			this.embedPlayer.getVideoHolder().find(".largePlayBtn").hide();
			this.embedPlayer.getControlBarContainer().fadeOut();
			this.embedPlayer.getTopBarContainer().fadeOut();
			this.embedPlayer.triggerHelper("showMobileComponents"); // used by plugins like closed captions to hide captions
		}
	});

} )( window.mw, window.jQuery );
