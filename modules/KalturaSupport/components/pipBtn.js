/**
 * Created by itayk on 7/26/15.
 */
( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'pipBtn', mw.KBaseComponent.extend({

			defaultConfig: {
				'parent': 'controlsContainer',
				'accessibleControls': false,
				'order': 53,
				'showTooltip': true,
				'align': "right",
				'smartContainer': 'morePlugins',
				'smartContainerCloseEvent': 'pipEvent',
				'title': gM( 'mwe-embedplayer-pip' ),
				"displayImportance": "medium"
			},

			isDisabled: true,
			pipTitle: gM( 'mwe-embedplayer-pip' ),
			setup: function() {
				var _this = this;
				this.bind("playerReady",function(){
					_this.onDisable();
				});
				this.bind("firstPlay",function(){
					 _this.onEnable();
				});
			},
			isSafeEnviornment: function(){
				return mw.isIOS9() && mw.isIpad() && !mw.isIpad2() ;
			},
			getComponent: function() {
				var _this = this;
				if( !this.$el ) {
					this.$el  = $( '<button />' )
						.attr( 'title', this.pipTitle )
						.addClass( "btn icon-new-tab pull-right" + this.getCssClass() )
						.click( function() {
							if( mw.getConfig("EmbedPlayer.ForceNativeComponent") ) {
								_this.embedPlayer.togglePictureInPicture();
							} else {
								_this.embedPlayer.playerElement.webkitSetPresentationMode(_this.embedPlayer.playerElement.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture");
							}
							_this.embedPlayer.triggerHelper("pipEvent");
						});

				}
				return this.$el;
			},

			getBtn: function(){
				return this.getComponent().find( '.btn' );
			}
		})
	);

} )( window.mw, window.jQuery );
