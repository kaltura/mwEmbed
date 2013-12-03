( function( mw, $, kWidget ) {"use strict";

	mw.PluginManager.add( 'chromecast', mw.KBaseComponent.extend({
		
		defaultConfig: {
			"parent": "controlsContainer",
			"order": 71,
			"displayImportance": 'low',
			"align": "right",
			"showTooltip": true,
			"tempalte": null,
			"templatePath": 'chromecastStates.tmpl.html',
		},
		
		isDisabled: false,

		setup: function(){
			var _this = this;
			
			// build the menu ( TODO build menu once we have device list ) 
			this.buildMenu();
			
			// https://developers.google.com/cast/chrome_sender
			var cast_api, cv_activity;

			if (window.cast && window.cast.isAvailable) {
				// Cast is known to be available
				initializeApi();
			} else {
				// Wait for API to post a message to us
				window.addEventListener("message", function(event) {
					if (event.source == window && event.data && 
							event.data.source == "CastApi" &&
							event.data.event == "Hello")
						initializeApi();
				});
			};
			
			// Device discovery
			var initializeApi = function() {
				cast_api = new cast.Api();
				cast_api.addReceiverListener("YouTube", onReceiverList);
			};

			var onReceiverList = function(list) {
				// If the list is non-empty, show a widget with
				// the friendly names of receivers.
				// When a receiver is picked, invoke doLaunch with the receiver.
			};
			
			// Activity launch
			// The LaunchRequest object represents a request to launch an activity 
			// for a given activityType (for which all DIAL application names are legal) and a receiver.
			var doLaunch = function(receiver) {
				var request = new window.cast.LaunchRequest("YouTube", receiver);
				request.parameters = "v=abcdefg";
			
				request.description = new window.cast.LaunchDescription();
				request.description.text = "My Cat Video";
				request.description.url = "...";
				cast_api.launch(request, onLaunch);
			};
			
			// Activity status
			// Use the ActivityStatus object to update the UI to show the status of the activity on the receiver.
			var onLaunch = function(activity) {
				if (activity.status == "running") {
					cv_activity = activity;
					// update UI to reflect that the receiver has received the
					// launch command and should start video playback.
				} else if (activity.status == "error") {
					cv_activity = null;
				}
			};
			
			// Stop playback:
			var stopPlayback = function() {
				if (cv_activity) {
					cast_api.stopActivity(cv_activity.activityId);
				}
			};
		},

		buildMenu: function(){	
			var _this = this;
			// Destroy old menu
			this.getMenu().destroy();
			// Menu Title: 
			this.getMenu().addItem({
				'label': 'Play On:'
			});
			// My computer ( maybe chromecast supplies this key? ) 
			this.getMenu().addItem({
				'label': 'My Computer'
			});
			
			// Hard code a single device for now: 
			this.getMenu().addItem({
				'label': 'Chromecast42424',
				'attributes': {
					'id': 'chromecastId'
				},
				'callback': function(){
					_this.displayOnChromecast();
				},
				'active': false
			});
			
		},
		displayOnChromecast:function(){
			
		},
		toggleMenu: function(){
			if ( this.isDisabled ) {
				return;
			}
			this.getMenu().toggle();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $menu = $( '<ul />' );
				var $button = $( '<button />' )
								.addClass( 'btn chromecast-icon' )
								.attr('title', 'Chromecast')
								.click( function(e){
									_this.toggleMenu();
								});

				this.$el = $( '<div />' )
								.addClass( 'dropup' + this.getCssClass() )
								.append( $button, $menu );
			}
			return this.$el;
		},
		getMenu: function(){
			if( !this.menu ) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex')
				});
			}
			return this.menu;
		},
		getBtn: function(){
			return this.getComponent().find( 'button' );
		},
		onEnable: function(){
			this.isDisabled = false;
			this.getBtn().removeClass( 'disabled' );
		},
		onDisable: function(){
			this.isDisabled = true;
			this.getComponent().removeClass( 'open' );
			this.getBtn().addClass( 'disabled' );
		}
	}));

} )( window.mw, window.jQuery, kWidget );