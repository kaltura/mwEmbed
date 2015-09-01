( function( mw, $ ) {"use strict";

mw.KBaseComponent = mw.KBasePlugin.extend({

	// Set basic config for all components
	getBaseConfig: function(){
		return {
			'visible': true,
			'disableable': true,
			'showTooltip': false,
			'accessibilityLabels': true,
			'hideWhenEmpty':false
		};
	},

	setDefaults: function(){
		if( $.isPlainObject(this.defaultConfig) ) {
			var obj = $.extend({}, this.getBaseConfig(), this.defaultConfig);
			this._super( obj );
		} else {
			this._super( this.getBaseConfig() );
		}
	},

	init: function( embedPlayer, callback, pluginName ) {
		// parent init return true / false based on isSafeEnviornment, default true
		if( this._super( embedPlayer, callback, pluginName ) === false ) {
			return ;
		}
		if( !this.componentType ) {
			this.componentType = pluginName;
		}
		this._addBindings();
		if( this.getConfig('hideWhenEmpty') == true ){
				this.setConfig('visible', false)
		}
	},
	_addBindings: function(){
		var _this = this;
		// Check if we have get element function
		if( $.isFunction( this.getComponent ) ) {
			this.addComponent();
		}
		if( $.isFunction( this.onEnable ) ) {
			this.bindEnableComponent();
		}
		if( $.isFunction( this.onDisable ) ) {
			this.bindDisableComponent();
		}
		if( $.isFunction( this.getMenu ) ) {
			this.bindFocusOutPlayer();
		}

		this.bind( 'layoutBuildDone', function(){
			if( !_this.getConfig('visible') ){
				_this.hide();
			}
		});

		this.bindShowComponent();
		this.bindHideComponent();
	},
	addComponent: function() {
		var _this = this;
		// Add Button
		this.bind('addLayoutComponent', function( e, layoutBuilder ) {
			// Add the button to the control bar
			layoutBuilder.components[ _this.pluginName ] = {
				'parent': _this.getConfig( 'parent' ),
				'order': _this.getConfig( 'order' ),
				'insertMode': _this.getConfig( 'insertMode' ),
				'o': function() {
					_this.enableTooltip();
					return _this.getComponent().attr({
						'data-order':_this.getConfig( 'order' ),
						'data-plugin-name':_this.pluginName
					});
				}
			};
		});
	},
	onEnable: function(){
		this.isDisabled = false;
		this.getComponent().removeClass('disabled');
	},
	onDisable: function(){
		this.isDisabled = true;
		this.getComponent().addClass('disabled');
	},
	bindShowComponent: function() {
		var _this = this;
		this.bind( 'onShowInterfaceComponents', function( event, includedComponents ){
			if( $.inArray( _this.componentType, includedComponents ) != -1 ) {
				_this.show();
			}
		});
	},
	bindHideComponent: function() {
		var _this = this;
		this.bind( 'onHideInterfaceComponents', function( event, includedComponents ){
			if( $.inArray( _this.componentType, includedComponents ) != -1 ) {
				_this.hide();
			}
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
	bindFocusOutPlayer: function() {
		var _this = this;
		this.bind('onFocusOutOfIframe', function(){
			_this.getMenu().close();
		});
	},
	onConfigChange: function( property, value ){
		switch( property ) {
			case 'visible':
				if( value ) {
					this.show();
				} else {
					this.hide();
				}
				break;
		}
	},
	show: function(){
		this.getComponent().removeData( 'forceHide' ).show();
	},
	hide: function(){
		this.getComponent().data( 'forceHide', true ).hide();
	},
	getCssClass: function() {
		var cssClass = ' comp ' + this.pluginName + ' ';
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
		if( this.getConfig('displayImportance') ){
			var importance = this.getConfig('displayImportance').toLowerCase();
			if( $.inArray(importance, ['low', 'medium', 'high']) !== -1 ){
				cssClass += ' display-' + importance;
			}
		}

		return cssClass;
	},
	getBtn: function(){
		return this.getComponent();
	},
	enableTooltip: function(){
		if( this.getConfig('showTooltip') && this.getBtn().length ){
			var parentContainer = this.getConfig('parent');
			// enable tooltip for each found button
			this.getBtn().each(function(){
				$(this).attr('data-show-tooltip', true);
				if (parentContainer == "topBarContainer"){
					$(this).addClass('tooltipBelow');
				}
			});
		}else{
			this.getBtn().each(function(){
				$(this).removeAttr("title");
			});
		}
	},
	updateTooltip: function( text ) {
		if( this.getConfig('showTooltip') && this.getBtn().length ){
			var tooltipId = this.getBtn().attr("aria-describedby");
			if (tooltipId){
				$('#' + tooltipId + ' .ui-tooltip-content').html(text);
			}
			this.getBtn().data('ui-tooltip-title', text );
			this.getBtn().attr( 'title', text );
		}
	},
	setAccessibility : function(btn, label){
		if (this.getConfig('accessibilityLabels')){
			btn.html('<span class="accessibilityLabel">'+label+'</span>');
		}
	},
	destroy: function(){
		this._super();
		this.getComponent().remove();
	},
	//abstract function for get component
	getComponent: function(){
		mw.log("Error - you must implement getComponent in your plugin:" + this.componentType)
		return $('<div></div>');
	}

});

} )( window.mw, window.jQuery );