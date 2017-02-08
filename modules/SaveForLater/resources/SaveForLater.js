( function( mw, $ ) {"use strict";


	mw.PluginManager.add( 'saveForLater', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 66,
			'visible': true,
			'align': "right",
			'showTooltip': true,
			'useCookie': true,
			'tooltip': gM( 'mwe-SaveForLater-tooltip' )
		},

		active: false,


		setup: function( embedPlayer ) {
			var _this = this;
			this.cookieName =  this.pluginName + '_duration_' + this.getPlayer().kentryid ;

			this.bind( 'playerReady ' , function () {
				if ( (_this.getConfig( 'useCookie' ) && $.cookie( _this.cookieName ) ) ) {
					var currentTime = parseFloat( $.cookie( _this.cookieName ) );
					if ( !isNaN( currentTime ) ) {
						if ( currentTime === 0 ) {
							return;
						}
						this.seek(currentTime, true);
					}
				}
			});

		},
		saveTimeStamp: function(){
			this.getPlayer().setCookie( this.cookieName ,this.getPlayer().currentTime , {path: '/'});

			this.displayMessage("Saved current time");
			this.updateTooltip( "Saved" );
		},

		deleteTimeStamp: function(){
			this.getPlayer().setCookie( this.cookieName ,null , {path: '/'});

			this.displayMessage("Deleted last timestamp");
			this.updateTooltip( "Not Saved" );
		},

		displayMessage: function(message){
			var embedPlayer = this.embedPlayer;
			if ($(embedPlayer).find(".SaveForLater").length === 0){
				$(embedPlayer).append($('<span />').addClass( 'SaveForLater' ));
			}
			$(embedPlayer).find(".SaveForLater").html( message ).hide().fadeIn(1500).fadeOut(1500);
		},

		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button/>' )
					.attr( 'title', this.getConfig('tooltip') )
					.addClass( "btn icon-caret" + this.getCssClass() )
					.click( function(){
						_this.active = !_this.active;
						if(_this.active){
							_this.saveTimeStamp();
						} else {
							_this.deleteTimeStamp();
						}
						var iconColor = _this.active ? "LawnGreen" : "white";
						$(_this.embedPlayer.getInterface().find(".icon-caret").css("color", iconColor));
					});
			}
			return this.$el;
		}
	}));
} )( window.mw, window.jQuery );