( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'audioDescription', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 60,
			'displayImportance': 'high',
			'align': 'right',
			'showTooltip': true,
			'file': null,
			'volume': 1,
			'disableable': true
		},

		selected: true,
		msgEnableAD: gM( 'mwe-embedplayer-enable-audio-description' ),
		msgDisableAD: gM( 'mwe-embedplayer-disable-audio-description' ),
		msgNoAD: gM( 'mwe-embedplayer-no-audio-description' ),

		setup: function() {
			var _this = this;
			if ( kWidget.supportsFlash() ) {
				mw.setConfig( 'EmbedPlayer.ForceKPlayer' , true ); //only kplayer supports audio description
				this.getPlayer().setKalturaConfig('kdpVars', 'audioDescription',
						{ plugin: 'true', volume: this.getConfig( 'volume' ) } );
				
				this.bind("playerReady", function(){
					_this.updateAudioFile();
				})
			} else { //hide the button if we don't support flash
				// TODO should hide show based at changeMeida / playerReady time, i.e a clip without flash flavors ? 
				this.getComponent().hide();
			}
		},
		updateAudioFile: function(){
			var _this = this;
			// check that audio description URL exists, 
			// if mapped to custom data can still return empty string if customData is not found. 
			if( !_this.getConfig( 'file' ) ){
				_this.noAudioFile();
				return ;
			}
			this.onEnable();
			this.updateTooltip( this.msgDisableAD );
			this.getPlayer().getPlayerElement().sendNotification( 'audioDescriptionLoadFile', { file: _this.getConfig( 'file' ) } );
		},
		noAudioFile: function(){
			// no longer selected:
			this.selected = false;
			// remove file: 
			this.getPlayer().getPlayerElement().sendNotification( 'audioDescriptionLoadFile', { file: '' } );
			// disable the button: 
			this.onDisable();
			this.updateTooltip( this.msgNoAD );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var stateMsg = ( this.selected )? this.msgDisableAD : this.msgEnableAD ;
				//TODO change style!
				this.$el = $( '<button />' )
					.attr( 'title', stateMsg )
					.addClass( 'btn icon-ad' +  this.getCssClass() )
					.addClass( 'active' )
					.click( function(){
						_this.toggleAD();
					});
			}
			return this.$el;
		},
		toggleAD: function() {
			if ( this.selected ) {
				this.getComponent().removeClass( 'active' );
				this.updateTooltip( this.msgEnableAD );
			} else {
				this.getComponent().addClass( 'active' );
				this.updateTooltip( this.msgDisableAD );
			}
			this.selected = !this.selected;
			this.getPlayer().getPlayerElement().sendNotification( 'audioDescriptionClicked' );
		}

	}))
} )( window.mw, window.jQuery );
