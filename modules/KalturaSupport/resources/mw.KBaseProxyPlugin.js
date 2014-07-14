( function( mw, $ ) {"use strict";

	mw.KBaseProxyPlugin = mw.KBasePlugin.extend({

		// Set basic config for all components
		getBaseConfig: function(){
			return {

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

			this._addBindings();
		},
		_addBindings: function(){

		},

		getProxyConfig: function( attr, raw ) {
			if( raw ){
				return this.embedPlayer.getRawKalturaConfig( "proxyData", attr );
			}
			return this.embedPlayer.getKalturaConfig( "proxyData", attr );
		},
		setProxyConfig: function( attr, value, quiet ) {
			this.embedPlayer.setKalturaConfig( "proxyData", attr, value, quiet );
		}

	});

} )( window.mw, window.jQuery );