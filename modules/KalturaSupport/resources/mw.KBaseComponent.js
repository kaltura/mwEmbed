( function( mw, $ ) {"use strict";

// TODO: support component visibility update based on "onPlayerStateChange" event

mw.KBaseComponent = mw.KBasePlugin.extend({

	// Set basic config for all components
	baseConfig: {
		'disableable': true,
		'showTooltip': false
	},

	setDefaults: function(){
		if( $.isPlainObject(this.defaultConfig) ) {
			var obj = $.extend({}, this.baseConfig, this.defaultConfig);
			this._super( obj );
		} else {
			this._super( this.baseConfig );
		}
	},

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
					_this.enableTooltip();
					return _this.getComponent();
				}
			};
		});		
	},
	bindEnableComponent: function() {
		var _this = this;
		this.bind( 'onEnableInterfaceComponents', function( event, excludedComponents ){
			if( $.inArray( _this.componentType, excludedComponents ) == -1 && _this.getConfig('disableable') ) {
				_this.onEnable();
			}
		});
	},
	bindDisableComponent: function() {
		var _this = this;
		this.bind( 'onDisableInterfaceComponents', function( event, excludedComponents ){
			if( $.inArray( _this.componentType, excludedComponents ) == -1 && _this.getConfig('disableable') ) {
				_this.onDisable();
			}
		});
	},
	onConfigChange: function( property, value ){
		switch( property ) {
			case 'visible':
				if( value ) {
					this.getComponent().show();
				} else {
					this.getComponent().hide();
				}
				break;
		}
	},
	getCssClass: function() {
		var cssClass = ' ' + this.pluginName + ' ';
		switch( this.getConfig( 'align' ) ) {
			case 'right':
				cssClass += " pull-right";
				break;
			case 'left':
				cssClass += " pull-left";
				break;
		}
		if( this.getConfig('cssClass') ) {
			cssClass += ' ' + this.getConfig('cssClass');
		}
		return cssClass;
	},
	getBtn: function(){
		return this.getComponent();
	},
	enableTooltip: function(){
		if( this.getConfig('showTooltip') && this.getBtn().length ){
			// enable tooltip for each found button
			this.getBtn().each(function(){
				$(this).attr('data-show-tooltip', true);
			});
		}
	}
});

} )( window.mw, window.jQuery );