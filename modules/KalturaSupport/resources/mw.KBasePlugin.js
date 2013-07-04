( function( mw, $ ) {"use strict";

mw.KBasePlugin = Class.extend({
	init: function( embedPlayer, pluginName ){
		this.pluginName = pluginName;
		this.bindPostFix = '.' + pluginName;
		this.embedPlayer = embedPlayer;
		this.setup();
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