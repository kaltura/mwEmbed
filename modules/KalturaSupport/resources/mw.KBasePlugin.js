( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
mw.KBasePlugin = Class.extend({
	asyncInit: false,
	init: function( embedPlayer, callback, pluginName ){

		// Save to local scope
		this.embedPlayer = embedPlayer;
		this.initCompleteCallback = callback;
		this.pluginName = pluginName;

		this.bindPostFix = '.' + pluginName;

		this.setDefaults();
		if( this.isSafeEnviornment() ) {
			this.setup();
		}
		
		// Run initCompleteCallback
		if( this.asyncInit === false ) {
			this.initCompleteCallback();
		}

		return this.isSafeEnviornment();
	},
	setDefaults: function(){
		var _this = this;
		// Set default configuration for the plugin
		if( $.isPlainObject(this.defaultConfig) ) {
			$.each( this.defaultConfig, function( key, value ) {
				if( _this.getConfig( key ) === undefined ) {
					_this.setConfig( key, value );	
				}
			});
		}
	},
	isSafeEnviornment: function(){
		return true;
	},
	setup: function() {},
	getPlayer: function() {
		return this.embedPlayer;
	},
	getConfig: function( attr ) {
		return this.embedPlayer.getKalturaConfig( this.pluginName, attr );
	},
	setConfig: function( attr, value ) {
		this.embedPlayer.setKalturaConfig( this.pluginName, attr, value );
	},
	bind: function( eventName, callback ){
		return this.embedPlayer.bindHelper( eventName + this.bindPostFix, callback);
	},
	unbind: function( eventName ){
		eventName += this.bindPostFix;
		return this.embedPlayer.unbindHelper( eventName );
	}
});

} )( window.mw, window.jQuery );