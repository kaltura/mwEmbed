( function( mw, $ ) {"use strict";

// TODO: support component visibility update based on "onPlayerStateChange" event

mw.KBaseComponent = mw.KBasePlugin.extend({
	init: function( embedPlayer, callback, pluginName ) {
		// parent init return true / false based on isSafeEnviornment, default true
		if( this._super( embedPlayer, callback, pluginName ) === false ) {
			return ;
		}
		// Check if we have get element function
		if( $.isFunction( this.getComponent ) ) {
			this.addComponent();
		}
		if( !this.componentType ) {
			this.componentType = pluginName;
		}
		if( $.isFunction( this.onEnable ) ) {
			this.bindEnableComponent();
		}		
		if( $.isFunction( this.onDisable ) ) {
			this.bindDisableComponent();
		}
	},
	addComponent: function() {
		var _this = this;
		// Add Button
		this.bind('addLayoutComponent', function( e, layoutBuilder ) {
			// Add the button to the control bar
			layoutBuilder.components[ _this.pluginName ] = {
				'o': function() {
					return _this.getComponent();
				}
			};
		});		
	},
	bindEnableComponent: function() {
		var _this = this;
		this.bind( 'onEnableInterfaceComponents', function( event, components ){
			if( jQuery.inArray( _this.componentType, components ) !== -1 ) {
				_this.onEnable();
			}
		});
	},
	bindDisableComponent: function() {
		var _this = this;
		this.bind( 'onDisableInterfaceComponents', function( event, components ){
			if( jQuery.inArray( _this.componentType, components ) !== -1 ) {
				_this.onDisable();
			}
		});
	},
	getCssClass: function() {
		switch( this.getConfig( 'align' ) ) {
			case 'right':
				return " pull-right";
			case 'left':
				return " pull-left";
		}
		return '';
	},	
});

} )( window.mw, window.jQuery );