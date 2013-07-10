( function( mw, $ ) {

// exit if already defined
if( mw.PluginManager ) return ;

mw.PluginManager = {

	// Holds our plugins classes
	registerdPlugins: {},

	// Holds our initialise plugins
	initialisePlugins: {},

	// Register a new Plugin
	define: function( pluginName, pluginClass, autoRegister ){
		if( this.registerdPlugins[ pluginName ] ) {
			mw.log('PluginManager::register: Plugin "' + pluginName + '" already registered.');
			return;
		}

		this.registerdPlugins[ pluginName ] = pluginClass;

		// By default we automaticaly init plugin on registration
		if( autoRegister === undefined ) {
			autoRegister = true;
		}
		if( autoRegister ) {
			this.registerLoader( pluginName );
		}
	},
	getClass: function( pluginName ) {
		if( !this.registerdPlugins[ pluginName ] ) {
			mw.log('PluginManager::getClass: Plugin "' + pluginName + '" not registered.');
			return false;
		}
		return this.registerdPlugins[ pluginName ];
	},
	make: function( pluginName, embedPlayer, callback  ) {
		var pluginClass = this.getClass( pluginName );
		return ( pluginClass ) ? new pluginClass( embedPlayer, callback, pluginName ) : false;
	},
	registerLoader: function( pluginName ){
		if( !this.registerdPlugins[ pluginName ] ) {
			mw.log('PluginManager::init: Plugin "' + pluginName + '" not registered.');
			return;
		}
		var _this = this;
		mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
			// Check if plugin initialise
			if( _this.initialisePlugins[ pluginName ] ) {
				//mw.log('PluginManager::init: Plugin "' + pluginName + '" already initialised.');
				callback();
				return;
			}
			_this.initialisePlugins[ pluginName ] = _this.make( pluginName, embedPlayer, callback );
		});
		return this;
	}
};

} )( mediaWiki, jQuery );