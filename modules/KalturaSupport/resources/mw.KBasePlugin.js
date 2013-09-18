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
		if( !this.isSafeEnviornment() ) {
			this.initCompleteCallback();
			return false;
		}

		// Add onConfigChange binding
		this.bindConfigChangeEvent();
		
		// Call plugin setup method
		this.setup();

		// Run initCompleteCallback
		if( this.asyncInit === false ) {
			this.initCompleteCallback();
		}

		return this;
	},
	setDefaults: function( obj ){
		obj = obj || this.defaultConfig;
		var _this = this;
		// Set default configuration for the plugin
		if( $.isPlainObject(obj) ) {
			$.each( obj, function( key, value ) {
				if( _this.getConfig( key ) === undefined ) {
					_this.setConfig( key, value, true );	
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
	setConfig: function( attr, value, quiet ) {
		this.embedPlayer.setKalturaConfig( this.pluginName, attr, value, quiet );
	},
	bind: function( eventName, callback ){
		var bindEventsString = '',
			events = eventName.split(" "),
			totalEvents = events.length,
			i = 0,
			space = ' ';

		for( i; i<totalEvents; i++ ){
			if( i == (totalEvents-1) ){
				space = '';
			}
			bindEventsString += events[ i ] + this.bindPostFix + space;
		}
		return this.embedPlayer.bindHelper( bindEventsString, callback);
	},
	unbind: function( eventName ){
		eventName += this.bindPostFix;
		return this.embedPlayer.unbindHelper( eventName );
	},
	log: function( msg ){
		mw.log( this.pluginName + '::' + msg );
	},
	bindConfigChangeEvent: function(){
		var _this = this;
		if( typeof this.onConfigChange !== 'function' ){
			return ;
		}
		this.bind('Kaltura_ConfigChanged', function(event, pluginName, property, value){
			if( pluginName === _this.pluginName ){
				_this.onConfigChange( property, value );
			}
		});
	},
	getKalturaClient: function() {
		if( ! this.kClient ) {
			this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
		}
		return this.kClient;
	},
	destroy: function(){
		this.unbind();
	}
});

} )( window.mw, window.jQuery );