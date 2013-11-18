( function( mw, $ ) {"use strict";

/** 
 * Base screen component that allow to show overlay on top of the player 
**/

mw.KBaseScreen = mw.KBaseComponent.extend({

	$screen: null,
	templateData: null,
	iconBtnClass: '',

	// Returns KBaseComponent config with screen config
	getBaseConfig: function(){
		var parentConfig = this._super();
		return $.extend({}, parentConfig, {
			usePreviewPlayer: false,
			previewPlayerEnabled: false
		});
	},

	_addBindings: function(){

		// Make sure we will call _addBindings on KBaseComponent
		this._super();

		this.bind('playerReady', $.proxy(function(){
			this.templateData = null;
			this.removeScreen();
		}, this));

		this.bind('onplay', $.proxy(function(){
			if( this.isScreenVisible() ){
				if( this.hasPreviewPlayer() ){
					this.resizePlayer();
				} else {
					this.hideScreen();
				}
			}
		}, this));

		this.bind('playerSizeClassUpdate', $.proxy(function(e, size){
			if( size == 'tiny' ){
				this.setConfig('previewPlayerEnabled', false);
			} else {
				this.setConfig('previewPlayerEnabled', true);
			}
		}, this));

		this.bind('closeOpenScreens', $.proxy(function(e, opener){
			if( this.pluginName !== opener )
				this.hideScreen();
		}, this));
	},

	removeScreen: function(){
		if( this.$screen ){
			this.$screen.remove();
			this.$screen = null;
		}
	},
	hideScreen: function(){
		if( this.hasPreviewPlayer() ){
			this.restorePlayer();
		} else {
			this.restorePlayback();
		}
		this.getPlayer().restoreComponentsHover();
		this.getScreen().fadeOut(400);
	},
	showScreen: function(){
		this._hideAllScreens(this.pluginName);
		if( this.hasPreviewPlayer() ){
			this.resizePlayer();
		} else {
			this.pausePlayback();
		}
		this.getPlayer().disableComponentsHover();
		this.getScreen().fadeIn(400);
	},
	toggleScreen: function(){
		if( this.isScreenVisible() ){
			this.hideScreen();
		} else {
			this.showScreen();
		}
	},
	isScreenVisible: function(){
		return (!this.$screen) ? false : this.getScreen().is(':visible');
	},
	hasPreviewPlayer: function(){
		return this.getConfig('usePreviewPlayer') && this.getConfig('previewPlayerEnabled');
	},
	pausePlayback: function(){
		this.wasPlaying = this.getPlayer().isPlaying();
		if( this.wasPlaying ){
			this.getPlayer().pause();
		}
	},
	restorePlayback: function(){
		if( this.wasPlaying )
			this.getPlayer().play();
	},
	resizePlayer: function(){
		this.getPlayer().getVideoDisplay().addClass('animateVideo');
		this.getPlayer().getInterface().addClass('previewPlayer');
	},
	restorePlayer: function(){
		this.getPlayer().getInterface().removeClass('previewPlayer');
	},
	getTemplateData: function(){
		return this.templateData;
	},
	_hideAllScreens: function( exclude ){
		// Close all other screens
		exclude = [exclude] || [];
		this.getPlayer().triggerHelper('closeOpenScreens', exclude);
	},
	onConfigChange: function( property, value ){
		this._super( property, value );
		if( property == 'previewPlayerEnabled' && this.isScreenVisible() ){
			// Disabled
			if( value == false ){
				this.restorePlayer();
			} else {
				this.resizePlayer();
			}
		}
	},
	getScreen: function(){
		if( ! this.$screen ){
			this.$screen = $('<div />')
								.addClass( 'screen ' + this.pluginName )
								.append(
									$('<div class="screen-content" /> ').append(
										this.getTemplateHTML(this.getTemplateData())
									)
								);

			// Create expand button
			var hasExpandBtn = this.getPlayer().getVideoDisplay().find('.expandPlayerBtn').length;
			if( this.getConfig('usePreviewPlayer') && !hasExpandBtn ){
				this.getPlayer().getVideoDisplay().append(
					$( '<i />' )
						.addClass( 'expandPlayerBtn icon-expand2' )
						.click($.proxy(function(){
							this._hideAllScreens();
						}, this))
				);
			}

			this.getPlayer().getVideoHolder().append( this.$screen );
			this.addScreenBindings();
		}
		return this.$screen;
	},
	// Override this method in plugins that extend KBaseScreen to attach DOM events to template
	addScreenBindings: function(){},
	getComponent: function(){
		if( !this.$el ) {
			var _this = this;
			this.$el = $( '<button />' )
						.attr( 'title', this.getConfig('tooltip') )
						.addClass( "btn " + this.iconBtnClass + this.getCssClass() )
						.click( function(){
							_this.toggleScreen();
						});
			
		}
		return this.$el;
	}
});

} )( window.mw, window.jQuery );