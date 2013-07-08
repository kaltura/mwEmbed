( function( mw, $ ) {"use strict";

mw.KBasePlugin = Class.extend({
	init: function( embedPlayer, callback, pluginName ){

		// Save to local scope
		this.embedPlayer = embedPlayer;
		this.initCompleteCallback = callback;
		this.pluginName = pluginName;

		this.bindPostFix = '.' + pluginName;

		this.setDefaults();
		if( this.checkEnviornment() ) {
			this.setup();
		}

		// Set default value for asyncInit property
		if( this.asyncInit === undefined ) {
			this.asyncInit = false;
		}
		
		// Run initCompleteCallback
		if( this.asyncInit === false ) {
			this.initCompleteCallback();
		}

		return this.checkEnviornment();
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
	checkEnviornment: function(){
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