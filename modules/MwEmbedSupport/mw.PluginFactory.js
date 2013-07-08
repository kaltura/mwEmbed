( function( mw, $ ) {
	// exit if already defined
	if( mw.PluginFactory ) return ;

	mw.PluginFactory = {

		// Holds our plugins classes
		registerdPlugins: {},

		// Holds our initialise plugins
		initialisePlugins: {},

		// Register a new Plugin
		register: function( pluginName, pluginClass ){
			if( !this.registerdPlugins[ pluginName ] ) {
				this.registerdPlugins[ pluginName ] = pluginClass;
			}
			return this;
		},
		getClass: function( pluginName ) {
			if( !this.registerdPlugins[ pluginName ] ) {
				mw.log('PluginFactory::init: Plugin "' + pluginName + '" not registered.');
				return;
			}
			return this.registerdPlugins[ pluginName ];
		},
		init: function( pluginName ){

			if( !this.registerdPlugins[ pluginName ] ) {
				mw.log('PluginFactory::init: Plugin "' + pluginName + '" not registered.');
				return;
			}
			if( this.initialisePlugins[ pluginName ] ) {
				mw.log('PluginFactory::init: Plugin "' + pluginName + '" already initialised.');
				return;
			}
			var _this = this;
			mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
				var pluginClass = _this.getClass( pluginName );
				_this.initialisePlugins[ pluginName ] = new pluginClass( embedPlayer, callback, pluginName );
			});
			return this;
		}
	};

} )( mediaWiki, jQuery );