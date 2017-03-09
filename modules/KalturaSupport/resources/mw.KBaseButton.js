/**
 * Created by itayk on 5/25/14.
 */

( function( mw, $ ) {"use strict";

	mw.KBaseButton = mw.KBaseComponent.extend( {

		defaultConfig: {
			"align": "right" ,
			"parent": "controlsContainer" ,
			"order": 51 ,
			"showTooltip": true ,
			"displayImportance": "high" ,
			"toggle": true ,
			"kClick": null
		} ,
		pressed: false ,
		offIconClass: 'icon-fullscreen-exit-alt' ,
		onIconClass: 'icon-fullscreen-alt' ,
		onTXT: gM( 'mwe-embedplayer-player_expend' ) ,
		offTXT: gM( 'mwe-embedplayer-player_retract' ) ,

		isSafeEnviornment: function () {
			return true;
		} ,
		getComponent: function () {
			var _this = this;
			if ( !this.$el ) {
				this.$el = $( '<button />' )
					.attr( 'title' , this.onTXT )
					.addClass( "btn " + this.onIconClass + this.getCssClass() )
					.click( function () {
						_this.toggleExpend();
					} );
			}
			this.setAccessibility( this.$el , _this.onTXT );
			return this.$el;
		} ,

		toggleExpend: function () {
			var _this = this;
			var clickAction = this.getConfig( "kClick" );
			if ( clickAction ) {
				try {
					parent[clickAction]();
					this.pressed = !this.pressed;
					if ( this.getConfig( "toggle" ) ) {
						if ( this.pressed ) {
							_this.getComponent().removeClass( _this.onIconClass ).addClass( _this.offIconClass );
							_this.updateTooltip( _this.offTXT );
                            _this.setAccessibility( this.$el , _this.offTXT );
						} else {
							_this.getComponent().removeClass( _this.offIconClass ).addClass( _this.onIconClass );
							_this.updateTooltip( _this.onTXT );
                            _this.setAccessibility( this.$el , _this.onTXT );
						}
					}
				}
				catch ( e ) {
					mw.log( "Error occur while trying to call:" + clickAction + " error:" + e );
				}
			}
		}

	});

} )( window.mw, window.jQuery );