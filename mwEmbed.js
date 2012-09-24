// Add support for html5 / mwEmbed elements to browsers that do not support the elements natively
// For discussion and comments, see: http://ejohn.org/blog/html5-shiv/
'video audio source track'.replace(/\w+/g, function(n){ document.createElement(n); });

/**
 * @license mwEmbed Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * @copyright (C) 2010 Kaltura
 * @author Michael Dale ( michael.dale at kaltura.com )
 * 
 * @url http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
 * 
 * Libraries used include code license in headers
 */

/**
 * Setup the "mw" global:
 */
if ( typeof window.mw == 'undefined' ) {
	window.mw = { };
}
// set up mediaWiki pointer ( to help transition to new resource loader ) 
window.mediaWiki =  window.mw;

/**
 * Set the mwEmbedVersion ( set by default settings can be removed once we use the new RL ) 
 */
var MW_EMBED_VERSION = '1.6';

// Globals to pre-set ready functions in dynamic loading of mwEmbed
if( typeof window.preMwEmbedReady == 'undefined'){
	window.preMwEmbedReady = [];
}
// Globals to pre-set config values in dynamic loading of mwEmbed
if( typeof window.preMwEmbedConfig == 'undefined') {
	window.preMwEmbedConfig = {};
}

/**
 * The global mw object:
 */
( function( mw ) {
	// Use strict ECMAScript 5
	"use strict";
	
	// The version of mwEmbed
	mw.version = MW_EMBED_VERSION;
	
	// List valid skins here:
	mw.validSkins = [ 'mvpcf', 'kskin' ];

	// Storage variable for loaded style sheet keys
	if( ! mw.style ){
		mw.style = { };
	}

	/**
	 * Configuration System:
	 */

	// Local scope configuration var:
	if( !mwConfig ){
		var mwConfig = { };
	}
	
	if( !mwNonDefaultConfigList ){
		var mwNonDefaultConfigList = [];
	}

	// mw scope mwUserConfig var. Stores user configuration
	var mwUserConfig = { };

	/**
	 * Setter for configuration values
	 * 
	 * @param [Mixed]
	 *            name Name of configuration value {Object} Will iderate through
	 *            each key and call setConfig {String} Will set configuration by
	 *            string name to value
	 * @param {String}
	 *            value Value of configuration name {Object} value Set of values
	 *            to be merged
	 */
	mw.setConfig = function ( name, value ) {
		if( typeof name == 'object' ) {
			for( var i in name ) {
				mw.setConfig( i, name[ i ] );
			}
			return ;
		}
		mwConfig[ name ] = value;
		mwNonDefaultConfigList.push( name );
	};
	
	// Apply any pre-setup config:
	mw.setConfig( window.preMwEmbedConfig );
	
	/**
	 * Merge in a configuration value:
	 */
	mw.mergeConfig = function( name, value ){
		if( typeof name == 'object' ) {
			$j.each( name, function( inx, val) {
				mw.setConfig( inx, val );
			});
			return ;
		}
		// Check if we should "merge" the config
		if( typeof value == 'object' && typeof mwConfig[ name ] == 'object' ) {
			if ( value.constructor.toString().indexOf("Array") != -1 &&
				 mwConfig[ name ].constructor.toString().indexOf("Array") != -1 ){
				// merge in the array
				mwConfig[ name ] = $j.merge( mwConfig[ name ], value );
			} else {
				for( var i in value ){
					mwConfig[ name ][ i ] = value[ i ];
				}
			}
			return ;
		}
		// Else do a normal setConfig
		mwConfig[ name ] = value;
		mwNonDefaultConfigList.push( name );
	};
	
	/**
	 * Set a default config value Will only update configuration if no value is
	 * present
	 * 
	 * @param [Mixed]
	 *            value Set configuration name to value {Object} Will idorate
	 *            through each key and call setDefaultConfig {String} Will set
	 *            configuration by string name to value
	 */
	mw.setDefaultConfig = function( name, value ) {
		if( typeof name == 'object' ) {
			for( var i in name ) {
				mw.setDefaultConfig( i, name[ i ] );
			}
			return ;
		}
		if( typeof mwConfig[ name ] == 'undefined'  ) {
			mwConfig[ name ] = value;
			return ;
		}
	};
	/**
	 * Simple inheritance. We will move to something like 
	 * http://javascriptmvc.com/docs.html#&who=jQuery.Class 
	 * in the near future. This is just a stop gap. 
	 */
	mw.inherit = function( _this, inhertParent ){ 
		for ( var method in inhertParent ) {
			if ( _this[ method ] ) {
				_this['parent_' + method] = inhertParent[method];
			} else {
				_this[ method ] = inhertParent[method];
			}
		}
	};
	
	/**
	 * Getter for configuration values
	 * 
	 * @param {String}
	 *            name of configuration value to get
	 * @return {Mixed} value of configuration key returns "false" if key not
	 *         found
	 */
	mw.getConfig = function ( name ) {
		if( ! name )
			return mwConfig;
		if( typeof mwConfig[ name ] != 'undefined' ){
			return mwConfig[ name ];
		}
		return null;
	};
	
	/**
	 * Get all the non-default configuration ( useful for passing state to
	 * iframes in limited hash url length of a few K )
	 */
	mw.getNonDefaultConfigObject = function(){
		var nonDefaultConfig = {};
		for( var i =0 ; i < mwNonDefaultConfigList.length; i ++){
			var configKey = mwNonDefaultConfigList[i];
			nonDefaultConfig[ configKey ] = mw.getConfig( configKey );
		}
		return nonDefaultConfig;
	};

	/**
	 * Loads the mwUserConfig from a cookie.
	 * 
	 * Modules that want to use "User Config" should call this setup function in
	 * their moduleLoader code.
	 * 
	 * For performance interfaces using "user config" should load '$j.cookie' &
	 * 'JSON' in their module loader
	 * 
	 * By abstracting user preference we could eventually integrate a persistent
	 * per-account preference system on the server.
	 * 
	 * @parma {Function} callback Function to be called once userPrefrences are
	 *        loaded
	 */
	var setupUserConfigFlag = false;
	mw.setupUserConfig = function( callback ) {
		if( setupUserConfigFlag ) {
			if( callback ) {
				callback();
			}
			return ;
		}
		// Do Setup user config:
		mw.load( [ '$j.cookie', 'JSON' ], function() {
			if( $j.cookie( 'mwUserConfig' ) ) {
				mwUserConfig = JSON.parse( $j.cookie( 'mwUserConfig' ) );
			}
			setupUserConfigFlag = true;
			if( callback ) {
				callback();
			}
		});
	};

	/**
	 * Save a user configuration var to a cookie & local global variable Loads
	 * the cookie plugin if not already loaded
	 * 
	 * @param {String}
	 *            name Name of user configuration value
	 * @param {String}
	 *            value Value of configuration name
	 */
	mw.setUserConfig = function ( name, value, cookieOptions ) {
		if( ! setupUserConfigFlag ) {
			mw.log( "Error: userConfig not setup" );
			return false;
		}
		// Update local value
		mwUserConfig[ name ] = value;

		// Update the cookie ( '$j.cookie' & 'JSON' should already be loaded )
		$j.cookie( 'mwUserConfig', JSON.stringify( mwUserConfig ), {'expires' : mw.getConfig("Mw.UserPreferenceExpireDays") } );
	};

	/**
	 * Save a user configuration var to a cookie & local global variable
	 * 
	 * @param {String}
	 *            name Name of user configuration value
	 * @return value of the configuration name false if the configuration name
	 *         could not be found
	 */
	mw.getUserConfig = function ( name ) {
		if( mwUserConfig[ name ] )
			return mwUserConfig[ name ];
		return false;
	};

	/**
	 * Add a hook system for a target object / interface
	 * 
	 * depricated you should instead use jQuery's bind and trigger
	 * 
	 * @param {Object}
	 *            targetObj Interface Object to add hook system to.
	 */
	mw.addHookSystem = function( targetObj ) {

		// Setup the target object hook holder:
		targetObj[ 'hooks' ] = { };

		/**
		 * Adds a hook to the target object
		 * 
		 * Should be called by clients to setup named hooks
		 * 
		 * @param {String}
		 *            hookName Name of hook to be added
		 * @param {Function}
		 *            hookFunction Function to be called at hook time
		 */
		targetObj.addHook = function( hookName, hookFunction ) {
			if( ! this.hooks[ hookName ] ) {
				this.hooks[ hookName ] = [ ];
			}
			this.hooks[ hookName ].push( hookFunction );
		};

		/**
		 * Runs all the hooks by a given name with reference to the host object
		 * 
		 * Should be called by the host object at named execution points
		 * 
		 * @param {String}
		 *            hookName Name of hook to be called
		 * @return Value of hook result true interface should continue function
		 *         execution false interface should stop or return from method
		 */
		targetObj.runHook = function( hookName, options ) {
			if( this.hooks[ hookName ] ) {
				for( var i =0; i < this.hooks[ hookName ].length; i ++ ) {
					if( typeof( this.hooks[ hookName ][ i ] ) == 'function' ) {
						this.hooks[ hookName ][ i ]( options );
					}
				}
			}
		};
	};

	// Add hooks system to the core "mw" object
	mw.addHookSystem( mw );

	// Stores callbacks for resource loader loading
	var mwLoadDoneCB = { };


	/**
	 * Top level loader prototype:
	 */
	mw.loader = {
		/**
		 * Javascript Module Loader functions
		 * 
		 * @key Name of Module
		 * @value function code to load module
		 */
		moduleLoaders : [],

		/**
		 * Module resource list queue.
		 * 
		 * @key Name of Module
		 * @value .resourceList list of resources to be loaded .functionQueue
		 *        list of functions to be run once module is ready
		 */
		moduleLoadQueue: { },

		/**
		 * Javascript Class Paths
		 * 
		 * @key Name of resource
		 * @value Class file path
		 */
		resourcePaths : { },

		/**
		 * Stores resources that have been requested ( to avoid re-requesting
		 * the same resources ) in concurrent requests )
		 */
		requestedResourceQueue: { },

		/**
		 * javascript Resource Paths
		 * 
		 * @key Name of resource
		 * @value Name of dependent style sheet
		 */
		resourceStyleDependency: { },

		/**
		 * Core load function:
		 * 
		 * @param {Mixed}
		 *            loadRequest:
		 * 
		 * {String} Name of a module to be loaded Modules are added via
		 * addModuleLoader and can define custom code needed to check config and
		 * return a list of resources to be loaded
		 * 
		 * {String} Name of a resource to loaded. Resources are added via
		 * addResourcePaths function Using defined resource names avoids loading
		 * the same resource twice by first checking if the named resource is
		 * defined in the global javascript scope variable
		 * 
		 * {String} Absolute or relative to url path The same file won't be
		 * loaded twice
		 * 
		 * {Array} can be an array of any combination of the above strings. Will
		 * be loaded in-order or in a single resource loader request if
		 * scriptLoader is available.
		 * 
		 * {Array} {Array} Can be a set of Arrays for loading. Some browsers
		 * execute included scripts out of order. This lets you chain sets of
		 * request for those browsers. If using the server side resource loader
		 * order is preserved in output and a single request will be used.
		 * 
		 * @param {Function}
		 *            callback Function called once loading is complete
		 * 
		 */
		load: function( loadRequest, instanceCallback ) {
			var _this = this;
			// Throw out any loadRequests that are not strings
			loadRequest = this.cleanLoadRequest( loadRequest );

			// Ensure the callback is only called once per load instance
			var callback = function(){
				// mw.log( 'instanceCallback::running callback: ' +
				// instanceCallback );
				if( instanceCallback ){
					// We pass the loadRequest back to the callback for easy
					// debugging of concurrency issues.
					// ( normally its not used )
					instanceCallback( loadRequest );
					instanceCallback = null;
				}
			};

			// Check for empty loadRequest ( directly return the callback )
			if( mw.isEmpty( loadRequest ) ) {
				mw.log( 'mwEmbed::Empty load request: ( ' + loadRequest + ' ) ' );
				callback( loadRequest );
				return ;
			}


			// Check if its a multi-part request:
			if( typeof loadRequest == 'object' ) {
			 	if( loadRequest.length > 1 ) {
					this.loadMany ( loadRequest, callback );
					return ;
				}else{
					// If an array of length 1 set as first element
					loadRequest = loadRequest[0];
				}
			}

			// Check for the module name loader function
			if( this.moduleLoaders[ loadRequest ] ) {
				var resourceSet = this.getModuleResourceSet( loadRequest );
				if( !resourceSet ){
					mw.log( "mw.load:: Error with module loader: " + loadRequest + ' ( no resource set defined )' );
					return ;
				}

				// xxx should use refactor "ready" stuff into a "domReady" class
				// So we would not have local scope globals like this:
				// if ( mwReadyFlag ) {
					// Load the module directly if load request is after
					// mw.ready has run
				this.load( resourceSet, callback );
				// } else {
				// this.addToModuleLoaderQueue(
				// loadRequest,
				// resourceSet,
				// callback
				// );
				// }
				return ;
			}

			// Check for javascript resource
			if( this.getResourcePath( loadRequest ) ) {
				this.loadResource( loadRequest, callback );
				return ;
			}

			// Try loading as a "file" or via ScriptLoader
			if( loadRequest ) {
				// Check if this resource was already requested
				if( typeof this.requestedResourceQueue[ loadRequest ] == 'object' ){
					this.requestedResourceQueue[ loadRequest ].push( callback );
					return ;
				} else {
					this.requestedResourceQueue[ loadRequest ] = [];
				}

				if( loadRequest.indexOf( '.js' ) == -1 && !mw.getResourceLoaderPath() ) {
					mw.log( 'Error: are you sure ' + loadRequest + ' is a file ( is it missing a resource path? ) ' );
				}
				mw.getScript( loadRequest, function(){
					// Check if we have requestedResources queue items:
					while( _this.requestedResourceQueue[ loadRequest ].length ){
						_this.requestedResourceQueue[ loadRequest ].shift()( loadRequest );
					}
					callback( loadRequest );
					// empty the load request queue:
					_this.requestedResourceQueue[ loadRequest ] = [];
				});
				return ;
			}

			// Possible error?
			mw.log( "Error could not handle load request: " + loadRequest );
		},

		getModuleResourceSet: function( moduleName ){
			// Check if the module loader is a function ~run that function~
			if( typeof ( this.moduleLoaders[ moduleName ] ) == 'function' ) {
				// Add the result of the module loader function
				return this.moduleLoaders[ moduleName ]();
			} else if( typeof ( this.moduleLoaders[ moduleName ] ) == 'object' ){
				// set resourceSet directly
				return this.moduleLoaders[ moduleName ];
			}
			return false;
		},

		/**
		 * Clean the loadRequest ( throw out any non-string items )
		 */
		cleanLoadRequest: function( loadRequest ){
			var cleanRequest = [];
			if( ! loadRequest ){
				return [];
			}
			if( typeof loadRequest == 'string' )
				return loadRequest;
			for( var i =0;i < loadRequest.length; i++ ){
				if( typeof loadRequest[i] == 'object' ) {
					cleanRequest[i] = this.cleanLoadRequest( loadRequest[i] );
				} else if( typeof loadRequest[i] == 'string' ){
					cleanRequest[i] = $j.trim( loadRequest[i] );
				} else{
					// bad request type skip
				}
			}
			return cleanRequest;
		},

		/**
		 * Load a set of scripts. Will issue many load requests or package the
		 * request for the resource loader
		 * 
		 * @param {Object}
		 *            loadSet Set of scripts to be loaded
		 * @param {Function}
		 *            callback Function to call once all scripts are loaded.
		 */
		loadMany: function( loadSet, callback ) {
			var _this = this;
			// Setup up the local "loadStates"
			var loadStates = { };

			// Check if we can load via the "resource loader" ( mwEmbed was
			// included via scriptLoader )
			if( mw.getResourceLoaderPath() ) {
				// Get the grouped loadStates variable
				loadStates = this.getGroupLoadState( loadSet );
				if( mw.isEmpty( loadStates ) ) {
					// mw.log( 'loadMany:all resources already loaded');
					callback();
					return ;
				}
			}else{
				// Check if its a dependency set ( nested objects )
				if( typeof loadSet [ 0 ] == 'object' ) {
					_this.dependencyChainCallFlag[ loadSet ] = false;
					// Load sets of resources ( to preserver order for some
					// browsers )
					_this.loadDependencyChain( loadSet, callback );
					return ;
				}

				// Set the initial load state for every item in the loadSet
				for( var i = 0; i < loadSet.length ; i++ ) {
					var loadName = loadSet[ i ];
					loadStates[ loadName ] = 0;
				}
			}

			// We are infact loading many:
			// mw.log("mw.load: LoadMany:: " + loadSet );

			// Issue the load request check check loadStates to see if we are
			// "done"
			for( var loadName in loadStates ) {
				// mw.log("loadMany: load: " + loadName );
				this.load( loadName, function ( loadName ) {
					loadStates[ loadName ] = 1;

					/*
					 * for( var i in loadStates ) { mw.log( loadName + '
					 * finished of: ' + i + ' : ' + loadStates[i] ); }
					 */

					// Check if all load request states are set 1
					var loadDone = true;
					for( var j in loadStates ) {
						if( loadStates[ j ] === 0 )
							loadDone = false;
					}
					// Run the parent scope callback for "loadMany"
					if( loadDone ) {
						callback( loadName );
					}
				} );
			}
		},

		/**
		 * Get grouped load state for script loader
		 * 
		 * Groups the scriptRequest where possible: Modules include "loader
		 * code" so they are separated into pre-condition code to be run for
		 * subsequent requests
		 * 
		 * @param {Object}
		 *            loadSet Loadset to return grouped
		 * @return {Object} grouped loadSet
		 */
		getGroupLoadState: function( loadSet ) {
			var groupedLoadSet = [];
			var loadStates = { };
			// Merge load set into new groupedLoadSet
			if( typeof loadSet[0] == 'object' ) {
				for( var i = 0; i < loadSet.length ; i++ ) {
					for( var j = 0; j < loadSet[i].length ; j++ ) {
						// Make sure we have not already included it:
						groupedLoadSet.push( loadSet[i][j] );
					}
				}
			} else {
				// Use the loadSet directly:
				groupedLoadSet = loadSet;
			}

			// Setup grouped loadStates Set:
			var groupClassKey = '';
			var coma = '';
			var uniqueResourceName = {};
			for( var i=0; i < groupedLoadSet.length; i++ ) {
				var loadName = groupedLoadSet[ i ];
				if( this.getResourcePath( loadName ) ) {
					// Check if not already in request queue and not defined in
					// global namespace
					if( !mw.isset( loadName ) && ! uniqueResourceName[ loadName] ){
						groupClassKey += coma + loadName;
						coma = ',';

						// Check for style sheet dependencies
						if( this.resourceStyleDependency[ loadName ] ){
							groupClassKey += coma + this.resourceStyleDependency[ loadName ];
						}
					}
				} else if ( this.moduleLoaders[ loadName ] ) {

					// Module loaders break up grouped script requests ( add the
					// current groupClassKey )
					if( groupClassKey != '' ) {
						loadStates[ groupClassKey ] = 0;
						groupClassKey = coma = '';
					}
					if( ! uniqueResourceName[ loadName] ){
						// Add the module to the loadSate
						loadStates[ loadName ] = 0;
					}
				}
				uniqueResourceName[ loadName] = true;
			}

			// Add groupClassKey if set:
			if( groupClassKey != '' ) {
				loadStates [ groupClassKey ] = 0;
			}

			return loadStates;
		},

		// Array to register that a callback has been called
		dependencyChainCallFlag: { },

		/**
		 * Load a sets of scripts satisfy dependency order for browsers that
		 * execute dynamically included scripts out of order
		 * 
		 * @param {Object}
		 *            loadChain A set of javascript arrays to be loaded. Sets
		 *            are requested in array order.
		 */
		loadDependencyChain: function( loadChain, callback ) {
			var _this = this;
			// Load with dependency checks
			var callSet = loadChain.shift();
			this.load( callSet, function( cbname ) {
				if ( loadChain.length != 0 ) {
					_this.loadDependencyChain( loadChain, callback );
				} else {
					// NOTE: IE gets called twice so we have check the
					// dependencyChainCallFlag before calling the callback
					if( _this.dependencyChainCallFlag[ callSet ] == callback ) {
						mw.log("... already called this callback for " + callSet );
						return ;
					}
					_this.dependencyChainCallFlag[ callSet ] = callback;
					callback( );
				}
			} );
		},

		/**
		 * Add to the module loader queue
		 */
		addToModuleLoaderQueue: function( moduleName, resourceSet, callback ) {
			mw.log(" addToModuleLoaderQueue:: " + moduleName + ' resourceSet: ' + resourceSet );
			if( this.moduleLoadQueue[ moduleName ] ){
				// If the module is already in the queue just add its callback:
				this.moduleLoadQueue[ moduleName ].functionQueue.push( callback );
			} else {
				// create the moduleLoadQueue item
				this.moduleLoadQueue[ moduleName ] = {
					'resourceSet' : resourceSet,
					'functionQueue' : [ callback ],
					'loaded' : false
				};
			}
		},

		/**
		 * Loops over all modules in queue, builds request sets based on config
		 * request type
		 */
		runModuleLoadQueue: function(){
			var _this = this;
			mw.log( "mw.runModuleLoadQueue:: " );
			var runModuleFunctionQueue = function(){
				// Run all the callbacks
				for( var moduleName in _this.moduleLoadQueue ){
					while( _this.moduleLoadQueue[moduleName].functionQueue.length ) {
						_this.moduleLoadQueue[moduleName].functionQueue.shift()();
					}
				}
			};

			// Check for single request or javascript debug based loading:
			if( !mw.getResourceLoaderPath() || mw.getConfig( 'loader.groupStrategy' ) == 'single' ){
				// if not using the resource load just do a normal array merge
				// ( for browsers like IE that don't follow first append first
				// execute rule )
				var fullResourceList = [];
				for( var moduleName in this.moduleLoadQueue ) {
					var resourceSet = this.moduleLoadQueue[ moduleName ].resourceSet;
					// Lets try a global merge
					fullResourceList = $j.merge( fullResourceList, resourceSet );
				}
				mw.load( fullResourceList, function(){
					runModuleFunctionQueue();
				});
				return ;
			}

			// Else do per module group loading
			if( mw.getConfig( 'loader.groupStrategy' ) == 'module' ) {
				var fullResourceList = [];
				var sharedResourceList = [];

				for( var moduleName in this.moduleLoadQueue ) {
					// Build a shared dependencies list and load that separately
					// "first"
					// ( in IE we have to wait until its "ready" since it does
					// not follow dom order )
					var moduleResourceList = this.getFlatModuleResourceList( moduleName );
					// Build the sharedResourceList
					for( var i=0; i < moduleResourceList.length; i++ ){
						var moduleResource = moduleResourceList[i];
						// Check if already in the full resource list if so add
						// to shared.
						if( fullResourceList[ moduleResource ] ){
							if( $j.inArray( moduleResource, sharedResourceList ) == -1 ){
								sharedResourceList.push( moduleResource );
							}
						}
						// Add to the fullResourceList
						fullResourceList[ moduleResource ] = true;
					}
				}

				// Local module request set ( stores the actual request we will
				// make after grouping shared resources
				var moduleRequestSet = {};

				// Only add non-shared to respective modules load requests
				for( var moduleName in this.moduleLoadQueue ) {
					moduleRequestSet[ moduleName ] = [];
					var moduleResourceList = this.getFlatModuleResourceList( moduleName );
					for( var i =0; i < moduleResourceList.length; i++ ){
						var moduleResource = moduleResourceList[i];
						if( $j.inArray( moduleResource, sharedResourceList ) == -1 ){
							moduleRequestSet[ moduleName ].push( moduleResource );
						}
					}
				}
				var sharedResourceLoadDone = false;
				// Check if modules are done
				var checkModulesDone = function(){
					if( !sharedResourceLoadDone ){
						return false;
					}
					for( var moduleName in _this.moduleLoadQueue ) {
						if( ! _this.moduleLoadQueue[ moduleName ].loaded ){
							return false;
						}
					}
					runModuleFunctionQueue();
				};
				// Local instance of load requests to retain resourceSet
				// context:
				var localLoadCallInstance = function( moduleName, resourceSet ){
					mw.load( resourceSet, function(){
						 _this.moduleLoadQueue[ moduleName ].loaded = true;
						checkModulesDone();
					});
				};

				// Load the shared resources
				mw.load( sharedResourceList, function(){
					// mw.log("Shared Resources loaded");
					// xxx check if we are in "IE" and dependencies need to be
					// loaded "first"
					sharedResourceLoadDone = true;
					checkModulesDone();
				});
				// Load all module Request Set
				for( var moduleName in moduleRequestSet ){
					localLoadCallInstance( moduleName,	moduleRequestSet[ moduleName ] );
				}
			}
			// xxx Here we could also do some "intelligent" grouping
		},

		getFlatModuleResourceList: function( moduleName ){
			var moduleList = [];
			for( var j in this.moduleLoadQueue[moduleName].resourceSet ){
				// Check if we have a multi-set array:
				if( typeof this.moduleLoadQueue[moduleName].resourceSet[j] == 'object' ){
					moduleList = $j.merge( moduleList, this.moduleLoadQueue[moduleName].resourceSet[j] );
				} else {
					moduleList = $j.merge( moduleList, [ this.moduleLoadQueue[moduleName].resourceSet[j] ] );
				}
			}
			return moduleList;
		},
		
		/**
		 * Loads javascript or css associated with a resourceName
		 * 
		 * @param {String}
		 *            resourceName Name of resource to load
		 * @param {Function}
		 *            callback Function to run once resource is loaded
		 */
		loadResource: function( resourceName , callback) {
			// mw.log("LoadResource:" + resourceName );
			var _this = this;

			// Check for css dependency on resource name
			if( this.resourceStyleDependency[ resourceName ] ) {
				if( ! mw.isset( this.resourceStyleDependency[ resourceName ] )){
					mw.log("loadResource:: dependent css resource: " + this.resourceStyleDependency[ resourceName ] );
					_this.loadResource( this.resourceStyleDependency[ resourceName ] , function() {
						// Continue the original loadResource request.
						_this.loadResource( resourceName, callback );
					});
					return ;
				}
			}

			// Make sure the resource is not already defined:
			if ( mw.isset( resourceName ) ) {
				// mw.log( 'Class ( ' + resourceName + ' ) already defined ' );
				callback( resourceName );
				return ;
			}

			// Setup the Script Request var:
			var scriptRequest = null;

			// If the scriptloader is enabled use the resourceName as the
			// scriptRequest:
			if( mw.getResourceLoaderPath() ) {
				scriptRequest = resourceName;
			}else{
				// Get the resource url:
				var baseClassPath = this.getResourcePath( resourceName );
				// Add the mwEmbed path if not a root path or a full url
				if( baseClassPath.indexOf( '/' ) !== 0 &&
					baseClassPath.indexOf( '://' ) === -1 ) {
					scriptRequest = mw.getMwEmbedPath() + baseClassPath;
				}else{
					scriptRequest = baseClassPath;
				}
				if( ! scriptRequest ) {
					mw.log( "Error Could not get url for resource " + resourceName );
					return false;
				}
			}
			// Include resource defined check for older browsers
			var resourceDone = false;

			// Set the loadDone callback per the provided resourceName
			mw.setLoadDoneCB( resourceName, callback );
			// Issue the request to load the resource (include resource name in result callback:
			mw.getScript( scriptRequest, function( scriptRequest ) {
				// If its a "style sheet" manually set its resource to true
				var ext = scriptRequest.substr( scriptRequest.split('?')[0].lastIndexOf( '.' ), 4 ).toLowerCase();
				if( ext == '.css' &&	resourceName.substr(0,8) == 'mw.style' ){
					mw.style[ resourceName.substr( 9 ) ] = true;
				}

				// Send warning if resourceName is not defined
				if(! mw.isset( resourceName )
					&& mwLoadDoneCB[ resourceName ] != 'done' ) {
					// mw.log( 'Possible Error: ' + resourceName +' not set in
					// time, or not defined in:' + "\n"
					// + _this.getResourcePath( resourceName ) );
				}

				// If ( debug mode ) and the script include is missing resource
				// messages
				// do a separate request to retrieve the msgs
				if( mw.currentClassMissingMessages ) {
					mw.log( " resourceName " + resourceName + " is missing messages" );
					// Reset the currentClassMissingMessages flag
					mw.currentClassMissingMessages = false;

					// Load msgs for this resource:
					mw.loadResourceMessages( resourceName, function() {
						// Run the onDone callback
						mw.loadDone( resourceName );
					} );
				} else {
					// If not using the resource loader make sure the
					// resourceName is available before firing the loadDone
					if( !mw.getResourceLoaderPath() ) {
						mw.waitForObject( resourceName, function( resourceName ) {
							// Once object is ready run loadDone
							mw.loadDone( resourceName );
						} );
					} else {
						// loadDone should be appended to the bottom of the
						// resource loader response
						// mw.loadDone( resourceName );
					}
				}
			} );
		},

		/**
		 * Adds a module to the mwLoader object
		 * 
		 * @param {String}
		 *            name Name of module
		 * @param {Function}
		 *            moduleLoader Function that loads dependencies for a module
		 */
		addModuleLoader: function( name, moduleLoader ) {
			this.moduleLoaders [ name ] = moduleLoader;
		},

		/**
		 * Adds resource file path key value pairs
		 * 
		 * @param {Object}
		 *            resourceSet JSON formated list of resource name file path
		 *            pairs.
		 * 
		 * resourceSet must be strict JSON to allow the php scriptLoader to
		 * parse the file paths.
		 */
	 	addResourcePaths: function( resourceSet ) {
	 		var prefix = ( mw.getConfig( 'loaderContext' ) )?
	 			mw.getConfig( 'loaderContext' ): '';

	 		for( var i in resourceSet ) {
				this.resourcePaths[ i ] = prefix + resourceSet[ i ];
			}
	 	},

	 	/*
		 * Adds a named style sheet dependency to a named resource
		 * 
		 * @parma {Object} resourceSet JSON formated list of resource names and
		 * associated style sheet names
		 */
	 	addStyleResourceDependency: function( resourceSet ){
	 		for( var i in resourceSet ){
	 			this.resourceStyleDependency[ i ] = resourceSet[i];
	 		}
	 	},

	 	/**
		 * Get a resource path from a resourceName if no resource found return
		 * false
		 */
	 	getResourcePath: function( resourceName ) {
	 		if( this.resourcePaths[ resourceName ] ){
	 			return this.resourcePaths[ resourceName ];
	 		}
	 		return false;
	 	}
	};
	// Flag to register the "firstLoad" callback ( works around domready out of order binding issues ) 
	var mwFirstLoadDoneCB = true;
	
	/**
	 * Load done callback for script loader
	 * 
	 * @param {String}
	 *            requestName Name of the load request
	 */
	mw.loadDone = function( requestName ) {
		// hack to work around domready out of order binding issues: 
		if( typeof mwFirstLoadDoneCB == 'function'){
			mwFirstLoadDoneCB();			
		}
		mwFirstLoadDoneCB = null;
		
		if( !mwLoadDoneCB[ requestName ] ) {
			return true;
		}
		while( mwLoadDoneCB[ requestName ].length ) {
			// check if mwLoadDoneCB is already "done"
			// the function list is not an object
			if( typeof mwLoadDoneCB[ requestName ] != 'object' )
			{
				break;
			}
			var func = mwLoadDoneCB[ requestName ].pop();
			if( typeof func == 'function' ) {
				// mw.log( "LoadDone: " + requestName + ' run callback::' +
				// func);
				func( requestName );
			}else{
				mw.log('mwLoadDoneCB: Error non callback function on stack');
			}
		}
		// Set the load request name to done
		mwLoadDoneCB[ requestName ] = 'done';
	};

	/**
	 * Set a load done callback
	 * 
	 * @param {String}
	 *            requestName Name of resource or request set
	 * @param {Function}
	 *            callback Function called once requestName is ready
	 */
	mw.setLoadDoneCB = function( requestName, callback ) {
		// If the requestName is already done loading just callback
		if( mwLoadDoneCB[ requestName ] == 'done' ) {
			callback( requestName );
		}
		// Setup the function queue if unset
		if( typeof mwLoadDoneCB[ requestName ] != 'object' ) {
			mwLoadDoneCB[ requestName ] = [];
		}
		mwLoadDoneCB[ requestName ].push( callback );
	};

	/**
	 * Shortcut entry points / convenience functions: Lets you write mw.load()
	 * instead of mw.loader.load() only these entry points should be used.
	 * 
	 * future closure optimizations could minify internal function names
	 */

	/**
	 * Load Object entry point: Loads a requested set of javascript
	 */
	mw.load = function( loadRequest, callback ) {
		return mw.loader.load( loadRequest, callback );
	};

	/**
	 * Add module entry point: Adds a module to the mwLoader object
	 */
	mw.addModuleLoader = function ( name, loaderFunction ) {
		return mw.loader.addModuleLoader( name, loaderFunction );
	};

	/**
	 * Add Class File Paths entry point:
	 */
	mw.addResourcePaths = function ( resourceSet ) {
		return mw.loader.addResourcePaths( resourceSet );
	};

	mw.addStyleResourceDependency = function ( resourceSet ) {
		return mw.loader.addStyleResourceDependency( resourceSet );
	};

	/**
	 * Get Class File Path entry point:
	 */
	mw.getResourcePath = function( resourceName ) {
		return mw.loader.getResourcePath( resourceName );
	};


	/**
	 * Utility Functions
	 */

	/**
	 * addLoaderDialog small helper for displaying a loading dialog
	 * 
	 * @param {String}
	 *            dialogHtml text Html of the loader msg
	 */
	mw.addLoaderDialog = function( dialogHtml ) {
		if( typeof dialogHtml == 'undefined'){
			dialogHtml ='';
		}
		var $dialog = mw.addDialog( {
			'title' : dialogHtml,
			'content' : dialogHtml + '<br>' +
				$('<div />')
				.loadingSpinner()
				.html()
		});
		return $dialog;
	};

	/**
	 * Close the loader dialog created with addLoaderDialog
	 */
	mw.closeLoaderDialog = function() {
		// Make sure the dialog resource is present
		if( !mw.isset( '$j.ui.dialog' ) ) {
			return false;
		}
		// Close with timeout since jquery ui binds with timeout:
		// ui dialog line 530
		setTimeout( function(){
			$( '#mwTempLoaderDialog' )
			.dialog( 'destroy' );
		} , 10);
	};

	/**
	 * Add a (temporary) dialog window:
	 * 
	 * @param {Object}
	 *            with following keys: title: {String} Title string for the
	 *            dialog content: {String} to be inserted in msg box buttons:
	 *            {Object} A button object for the dialog Can be a string for
	 *            the close button any jquery.ui.dialog option
	 */
	mw.addDialog = function ( options ) {
		// Remove any other dialog
		$( '#mwTempLoaderDialog' ).remove();

		if( !options){
			options = {};
		}

		// Extend the default options with provided options
		var options = $j.extend({
			'bgiframe': true,
			'draggable': true,
			'resizable': false,
			'modal': true,
			'position' : ['center', 'center']
		}, options );

		if( ! options.title || ! options.content ){
			mw.log("Error: mwEmbed addDialog missing required options ( title, content ) ");
			return ;
		}

		// Append the dialog div on top:
		$( 'body' ).append(
			$('<div />')
			.attr( {
				'id' : "mwTempLoaderDialog",
				'title' : options.title
			})
			.hide()
			.append( options.content )
		);

		// Build the uiRequest
		var uiRequest = [ '$j.ui.dialog' ];
		if( options.draggable ){
			uiRequest.push( '$j.ui.mouse' );
			uiRequest.push( '$j.ui.draggable' );
		}
		if( options.resizable ){
			uiRequest.push( '$j.ui.resizable' );
		}

		// Special button string
		if ( typeof options.buttons == 'string' ) {
			var buttonMsg = options.buttons;
			buttons = { };
			options.buttons[ buttonMsg ] = function() {
				$( this ).dialog( 'close' );
			};
		}

		// Load the dialog resources
		mw.load([
			[
				'$j.ui',
				'$j.widget',
				'$j.ui.mouse',
				'$j.ui.position'
			],
			uiRequest
		], function() {
			var $dialog = $( '#mwTempLoaderDialog' ).show().dialog( options );
		} );
		return $( '#mwTempLoaderDialog' );
	};
	mw.isMobileDevice = function(){
		return ( mw.isIOS()|| mw.isAndroid2() );
	};
	mw.isIOS = function(){
		return ( mw.isIphone() || mw.isIpod() || mw.isIpad() );
	};
	mw.isIOS3 = function(){
		return /OS 3_/.test( navigator.userAgent ) && mw.isIOS();
	}
	mw.isIOS4 = function(){
		return /OS 4_/.test( navigator.userAgent ) && mw.isIOS();
	};
	mw.isIOS5 = function(){
		return /OS 5_/.test( navigator.userAgent ) && mw.isIOS();
	};
	mw.isIE9 = function(){
		return ( /msie 9/.test( navigator.userAgent.toLowerCase() ) );
	};
	mw.isIphone = function(){
		return ( navigator.userAgent.indexOf('iPhone') != -1 && ! mw.isIpad() );
	};
	// Uses hack described at:
	// http://www.bdoran.co.uk/2010/07/19/detecting-the-iphone4-and-resolution-with-javascript-or-php/
	mw.isIphone4 = function(){
		return ( mw.isIphone() && ( window.devicePixelRatio && window.devicePixelRatio >= 2 ) );		
	};
	mw.isIpod = function(){
		return (  navigator.userAgent.indexOf('iPod') != -1 );
	};
	mw.isIpad = function(){
		return ( navigator.userAgent.indexOf('iPad') != -1 );
	};
	mw.isIpad3 = function(){
		return ( mw.isIpad() && navigator.userAgent.indexOf(' 3_') != -1 );
	};
	mw.isMobileChrome = function(){
		return ( navigator.userAgent.indexOf( 'Android 4.' ) != -1 
					&&
				  navigator.userAgent.indexOf( 'Chrome' ) != -1
				)
	};
	// Android 2 has some restrictions vs other mobile platforms
	mw.isAndroid2 = function(){		
		return ( navigator.userAgent.indexOf( 'Android 2.') != -1 );
	};
	
	mw.isAndroid40 = function() {
		return ( navigator.userAgent.indexOf( 'Android 4.0') != -1 );
	}
	
	/**
	 * Fallforward system by default prefers flash.
	 * 
	 * This is separate from the EmbedPlayer library detection to provide
	 * package loading control NOTE: should be phased out in favor of browser
	 * feature detection where possible
	 * 
	 */
	mw.isHTML5FallForwardNative = function(){
		if( mw.isMobileHTML5() ){
			return true;
		}
		// Check for url flag to force html5:
		if( mw.getConfig( 'forceMobileHTML5' ) ){
			return true;
		}
		// Fall forward native:
		// if the browser supports flash ( don't use html5 )
		if( mw.supportsFlash() ){
			return false;
		}
		// No flash return true if the browser supports html5 video tag with
		// basic support for canPlayType:
		if( mw.supportsHTML5() ){
			return true;
		}
		
		return false;
	};
	
	mw.isMobileHTML5 = function(){
		// Check for a mobile html5 user agent:
		if ( mw.isIphone() || 
			 mw.isIpod() || 
			 mw.isIpad() ||
			 mw.isAndroid2()
		){
			return true;
		}
		return false;
	};
	mw.supportsHTML5 = function(){
		// Blackberry is evil in its response to canPlayType calls.
		if( navigator.userAgent.indexOf('BlackBerry') != -1 ){
			return false ;
		}
		var dummyvid = document.createElement( "video" );
		if( dummyvid.canPlayType ) {
			return true;
		}
		return false;	
	};
	
	/**
	 * If the browser supports flash
	 * @return {boolean} true or false if flash > 10 is supported. 
	 */
	mw.supportsFlash = function() {
		if( mw.getConfig('EmbedPlayer.DisableHTML5FlashFallback' ) ){
			return false;
		}

		var majorVersion = this.getFlashVersion().split(',').shift();
		if( majorVersion < 10 ){
			return false;
		} else {
			return true;
		}
	},
	
	/**
	 * Checks for flash version
	 * @return {string} flash version string
	 */
	mw.getFlashVersion = function() {
		// navigator browsers:
		if (navigator.plugins && navigator.plugins.length) {
			try {
				if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
					return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch(e) {}
		}
		// IE
		try {
			try {
				if( typeof ActiveXObject != 'undefined' ){
					// avoid fp6 minor version lookup issues
					// see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
					var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
					try {
						axo.AllowScriptAccess = 'always';
					} catch(e) {
						return '6,0,0';
					}
				}
			} catch(e) {}
			return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch(e) {}
		return '0,0,0';
	};
	/**
	 * Similar to php isset function checks if the variable exists. Does a safe
	 * check of a descendant method or variable
	 * 
	 * @param {String}
	 *            objectPath
	 * @return {Boolean} true if objectPath exists false if objectPath is
	 *         undefined
	 */
	mw.isset = function( objectPath ) {
		var ptest;
		if ( !objectPath || typeof objectPath != 'string') {
			return false;
		}
		var pathSet = objectPath.split( '.' );
		var cur_path = '';

		for ( var p = 0; p < pathSet.length; p++ ) {
			cur_path = ( cur_path == '' ) ? cur_path + pathSet[p] : cur_path + '.' + pathSet[p];
			var ptest = eval( 'typeof ( ' + cur_path + ' ); ' );
			if ( ptest == 'undefined' ) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Wait for a object to be defined and the call the callback
	 * 
	 * @param {Object}
	 *            objectName Name of object to be defined
	 * @param {Function}
	 *            callback Function to call once object is defined
	 * @param {Null}
	 *            callNumber Used internally to keep track of number of times
	 *            waitForObject has been called
	 */
	var waitTime = 1200; // About 30 seconds
	mw.waitForObject = function( objectName, callback, _callNumber) {
		// mw.log( 'waitForObject: ' + objectName + ' cn: ' + _callNumber);

		// Increment callNumber:
		if( !_callNumber ) {
			_callNumber = 1;
		} else {
			_callNumber++;
		}

		if( _callNumber > waitTime ) {
			mw.log( "Error: waiting for object: " + objectName + ' timeout ' );
			callback( false );
			return ;
		}

		// If the object is defined ( or we are done loading from a callback )
		if ( mw.isset( objectName ) || mwLoadDoneCB[ objectName ] == 'done' ) {
			callback( objectName );
		}else{
			setTimeout( function( ) {
				mw.waitForObject( objectName, callback, _callNumber);
			}, 25);
		}
	};

	/**
	* Check if an object is empty or if its an empty string. 
	*
	* @param {Object} object Object to be checked
	* @return {Boolean}
	*/
	mw.isEmpty = function( obj ) {
		if( typeof obj === 'string' ) {
			if( obj === '' ) return true;
			// Non empty string: 
			return false;
		}

		// If an array check length:
		if( Object.prototype.toString.call( obj ) === "[object Array]"
			&& obj.length === 0 ) {
			return true;
		}

		// Else check as an obj: 
		for( var i in obj ) { return false; }

		// Else obj is empty:
		return true;
	};

	/**
	* Opposite of mw.isEmpty
	*
	* @param {Object} object Object to be checked
	* @return {Boolean}
	*/
	mw.isFull = function( obj ) {
		return ! mw.isEmpty( obj );
	};

	/**
	 * Check if something is defined
	 * (inlineable?)
	 * @param {Object}
	 * @return boolean
	 */
	mw.isDefined = function( obj ) {
		return typeof obj !== 'undefined'; 
	};


	/**
	 * Upper-case the first letter of a string.
	 * @param string
	 * @return string with first letter uppercased.
	 */
	mw.ucfirst = function( s ) {
		return s.substring(0,1).toUpperCase() + s.substr(1);
	};
	
	/**
	 * Log a string msg to the console
	 * 
	 * all mw.log statements will be removed on minification so lots of mw.log
	 * calls will not impact performance in non debug mode
	 *
	 * Pass multiple arguments to log
	 * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	 * 
	 * @param {String}
	 *            string String to output to console
	 */
	mw.log = function() {
		// Don't ouptut to console in debug mode; 
		if( mw.getConfig( 'debug' ) === false ){
			return ;
		}
		// Add any prepend debug strings if necessary
		if ( mw.getConfig( 'Mw.LogPrepend' ) && arguments.length > 0 ){
			arguments[0] = mw.getConfig('Mw.LogPrepend') + arguments[0];
		}
		if( window.console ){
			if (arguments.length == 1) {
				console.log( /*'ss:' + mw.getCallStack().length + ' ' + */ arguments[0] );
			} else {
				var args = Array.prototype.slice.call(arguments);  
				console.log( args[0], args.slice( 1 ) );
			}
		}
		// To debug stack size ( useful for iPad / safari that have a 100 call
		// stack limit
		// string = mw.getCallStack().length -1 + ' : ' + string;
		/*
		if ( window.console ) {
			window.console.log( string );
		} else {*/
			/**
			 * Old IE and non-Firebug debug: ( commented out for now )
			 */

			/*
			 * var log_elm = document.getElementById('mv_js_log'); if(!log_elm) {
			 * document.getElementsByTagName("body")[0].innerHTML += '<div ' +
			 * 'style="position:absolute;z-index:500;bottom:0px;left:0px;right:0px;height:200px;">' + '<textarea
			 * id="mv_js_log" cols="120" rows="12"></textarea>' + '</div>'; }
			 * var log_elm = document.getElementById('mv_js_log'); if(log_elm) {
			 * log_elm.value+=string+"\n"; // scroll to bottom:
			 * log_elm.scrollTop = log_elm.scrollHeight; }
			 */
		//}
	};
	mw.getCallStack = function(){
		var stringifyArguments = function(args) {
	        for (var i = 0; i < args.length; ++i) {
	            var arg = args[i];
	            if (arg === undefined) {
	                args[i] = 'undefined';
	            } else if (arg === null) {
	                args[i] = 'null';
	            } else if (arg.constructor) {
	                if (arg.constructor === Array) {
	                    if (arg.length < 3) {
	                        args[i] = '[' + stringifyArguments(arg) + ']';
	                    } else {
	                        args[i] = '[' + stringifyArguments(Array.prototype.slice.call(arg, 0, 1)) + '...' + stringifyArguments(Array.prototype.slice.call(arg, -1)) + ']';
	                    }
	                } else if (arg.constructor === Object) {
	                    args[i] = '#object';
	                } else if (arg.constructor === Function) {
	                    args[i] = '#function';
	                } else if (arg.constructor === String) {
	                    args[i] = '"' + arg + '"';
	                }
	            }
	        }
	        return args.join(',');
	    };
		var getStack = function(curr){
			var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i,
            stack = [], fn, args, maxStackSize = 100;
        
	        while (curr && stack.length < maxStackSize) {
	            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
	            args = Array.prototype.slice.call(curr['arguments']);
	            stack[stack.length] = fn + '(' + stringifyArguments(args) + ')';
	            curr = curr.caller;
	        }
	        return stack;
		};
		// Add stack size ( iPad has 100 stack size limit )
		var stack = getStack( arguments.callee );
		return stack;
	};
	
	// Setup the local mwOnLoadFunctions array:
	var mwOnLoadFunctions = [];

	// mw Ready flag ( set once mwEmbed is ready )
	var mwReadyFlag = false;

	/**
	 * Enables load hooks to run once mwEmbeed is "ready" Will ensure jQuery is
	 * available, is in the $j namespace and mw interfaces and configuration has
	 * been loaded and applied
	 * 
	 * This is different from jQuery(document).ready() ( jQuery ready is not
	 * friendly with dynamic includes and not friendly with core interface
	 * asynchronous build out. )
	 * 
	 * @param {Function}
	 *            callback Function to run once DOM and jQuery are ready
	 */
	mw.ready = function( callback ) {
		if( mwReadyFlag === false ) {
			// Add the callbcak to the onLoad function stack
			mwOnLoadFunctions.push ( callback );
		} else {
			// If mwReadyFlag is already "true" issue the callback directly:
			callback();
		}
	};

	/**
	 * Runs all the queued functions called by mwEmbedSetup
	 */
	mw.runReadyFunctions = function ( ) {
		// Run any pre-setup ready functions
		while( window.preMwEmbedReady.length ){
			window.preMwEmbedReady.shift()();
		}
		// Run all the queued functions:
		while( mwOnLoadFunctions.length ) {
			mwOnLoadFunctions.shift()();
		}
		// Sets mwReadyFlag to true so that future mw.ready run the
		// callback directly
		mwReadyFlag = true;

		// Once we have run all the queued functions
		setTimeout(function(){
			mw.loader.runModuleLoadQueue();
		}, 0);
	};


	/**
	 * Wrapper for jQuery getScript, Uses the scriptLoader if enabled
	 * 
	 * 
	 * @param {String}
	 *            scriptRequest The requested path or resourceNames for the
	 *            scriptLoader
	 * @param {Function}
	 *            callback Function to call once script is loaded
	 */
	mw.getScript = function( scriptRequest, callback ) {
		// mw.log( "mw.getScript::" + scriptRequest );
		// Setup the local scope callback instance
		var myCallback = function(){
			if( callback ) {
				callback( scriptRequest );
				callback = null;
			}
		};
		// Set the base url based scriptLoader availability & type of
		// scriptRequest
		// ( presently script loader only handles "classes" not relative urls:
		var scriptLoaderPath = mw.getResourceLoaderPath();
		var url;

		// Check if its a resource name, ( ie does not start with "/" and does
		// not include ://
		var isResourceName = ( scriptRequest.indexOf('://') == -1 && scriptRequest.indexOf('/') !== 0 )? true : false;

		var ext = scriptRequest.substr( scriptRequest.lastIndexOf( '.' ), 4 ).toLowerCase();
		var isCssFile = ( ext == '.css') ? true : false ;

		if( scriptLoaderPath && isResourceName ) {
			url = scriptLoaderPath + '?class=' + scriptRequest ;
		} else {
			// Add the mwEmbed path if a relative path request
			url = ( isResourceName ) ? mw.getMwEmbedPath() : '';
			url+= scriptRequest;
		}

		// Add on the request parameters to the url:
		url += ( url.indexOf( '?' ) == -1 )? '?' : '&';
		url += mw.getUrlParam();

		// Only log sciprts ( Css is logged via "add css" )
		if( !isCssFile ){
			mw.log( 'mw.getScript: ' + url );
		}

		// If jQuery is available and debug is off load the script via jQuery
		// ( will use XHR if on same domain )
		if( mw.isset( 'window.jQuery' )
			&& mw.getConfig( 'debug' ) === false
			&& typeof $j != 'undefined'
			&& mw.parseUri( url ).protocal != 'file'
			&& !isCssFile )
		{
			$j.getScript( url, myCallback);
			return ;
		}

		/**
		 * No jQuery OR In debug mode OR Is css file :: inject the script
		 * instead of doing an XHR eval
		 */

		// load style sheet directly if requested loading css
		if( isCssFile ){
			mw.getStyleSheet( url, myCallback);
			return ;
		}

		// Load and bind manually: ( copied from jQuery ajax function )
		var head = document.getElementsByTagName("head")[ 0 ];
		var script = document.createElement("script");
		script.setAttribute( 'src', url );

		// Attach handlers ( if using script loader it issues onDone callback as well )
		script.onload = script.onreadystatechange = function() {
			if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
				myCallback();
			}
		};
		// mw.log(" append script: " + script.src );
		// Append the script to the DOM:
		head.appendChild( script );
	};

	/**
	 * Add a style sheet string to the document head
	 * 
	 * @param {String}
	 *            cssResourceName Name of style sheet that has been defined
	 * @param {String}
	 *            cssString Css Payload to be added to head of document
	 */
	mw.addStyleString = function( cssResourceName, cssString ) {
		if( mw.style[ cssResourceName ] ) {
			mw.log(" Style: ( " + cssResourceName + ' ) already set' );
			return true;
		}
		// Set the style to true ( to not request it again )
		mw.style[ cssResourceName ] = true;
		// Add the spinner directly ( without jQuery in case we have to
		// dynamically load jQuery )
		// mw.log( 'Adding style:' + cssResourceName + " to dom " );
		var styleNode = document.createElement('style');
		styleNode.type = "text/css";
		// Use cssText or createTextNode depending on browser:
		if( ( window.attachEvent && !window.opera ) ) {
			styleNode.styleSheet.cssText = cssString;
		} else {
			var styleText = document.createTextNode( cssString );
			styleNode.appendChild( styleText );
		}
		var head = document.getElementsByTagName("head")[0];
		head.appendChild( styleNode );
	};

	/**
	 * Get a style sheet and append the style sheet to the DOM
	 * 
	 * @param {Mixed}
	 *            {String} url Url of the style sheet to be loaded {Function}
	 *            callback Function called once sheet is ready
	 */
	mw.getStyleSheet = function( url , callback) {
		if( !url ){
			return ;
		}
		
		// Add URL params ( if not already included )
		if ( url.indexOf( '?' ) == -1 ) {
			url += '?' + mw.getUrlParam();
		}

		// Check if style sheet is already included:
		var foundSheet = false;
		$( 'link' ).each( function() {
			var currentSheet = $( this) .attr( 'href' );
			var sheetParts = currentSheet.split('?');
			var urlParts = url.split('?');
			// if the base url's match check the parameters:
			if( sheetParts[0] == urlParts[0] && sheetParts[1]) {
				// Check if url params match ( sort to do string compare )
				if( sheetParts[1].split( '&' ).sort().join('') ==
						urlParts[1].split('&').sort().join('') ) {
					foundSheet = true;
				}
			}
		} );
		if( foundSheet ) {
			mw.log( 'skiped sheet: ' + url);
			if( callback) {
				callback();
			}
			return ;
		}

		mw.log( 'mwEmbed:: Add css: ' + url );
		$( 'head' ).append(
			$('<link />').attr( {
				'rel' : 'stylesheet',
				'type' : 'text/css',
				'href' : url
			} )
		);			
		// No easy way to check css "onLoad" attribute
		// In production sheets are loaded via resource loader and fire the
		// onDone function call.
		if( callback ) {
			callback();
		}
	};

	mw.getRelativeMwEmbedPath = function(){
		return mw.getMwEmbedPath(true);
	};
	/**
	 * Get the path to the mwEmbed folder
	 */
	mw.getMwEmbedPath = function( relativePath ) {
		// Get mwEmbed src:
		var src = mw.getMwEmbedSrc();
		var mwpath = null;

		// Check for direct include of the mwEmbed.js
		if ( src.indexOf( 'mwEmbed.js' ) !== -1 ) {
			mwpath = src.substr( 0, src.indexOf( 'mwEmbed.js' ) );
		}

		// Check for scriptLoader include of mwEmbed:
		if ( src.indexOf( 'mwResourceLoader.php' ) !== -1 ) {
			// Script loader is in the root of MediaWiki, Include the default
			// mwEmbed extension path:
			mwpath = src.substr( 0, src.indexOf( 'mwResourceLoader.php' ) ) + mw.getConfig( 'mediaWikiEmbedPath' );
		}

		// resource loader has ResourceLoader name when local:
		if( src.indexOf( 'ResourceLoader.php' ) !== -1 ) {
			mwpath = src.substr( 0, src.indexOf( 'ResourceLoader.php' ) );
		}

		// For static packages mwEmbed packages start with: "mwEmbed-"
		if( src.indexOf( 'mwEmbed-' ) !== -1 && src.indexOf( '-static' ) !== -1 ) {
			mwpath = src.substr( 0, src.indexOf( 'mwEmbed-' ) );
		}

		// Error out if we could not get the path:
		if( mwpath === null ) {
			mw.log( "Error could not get mwEmbed path " );
			return ;
		}

		// Update the cached var with the absolute path:
		if( !relativePath ){
			mwpath = mw.absoluteUrl( mwpath )	;
		}
		return mwpath;
	};

	/**
	 * Get Script loader path
	 * 
	 * @returns {String}|{Boolean} Url of the scriptLodaer false if the
	 *          scriptLoader is not used
	 */
	mw.getResourceLoaderPath = function( ) {
		var src = mw.getMwEmbedSrc();
		if ( src.indexOf( 'mwResourceLoader.php' ) !== -1 ||
			src.indexOf( 'ResourceLoader.php' ) !== -1 )
		{
			// Return just the script part of the url
			return src.split('?')[0];
		}
		return false;
	};
	/**
	 * Given a float number of seconds, returns npt format response. ( ignore
	 * days for now )
	 * 
	 * @param {Float}
	 *            sec Seconds
	 * @param {Number}
	 *            verbose If hours and milliseconds should padded be displayed.
	 * @return {Float} String npt format
	 */
	mw.seconds2npt = function( sec, show_ms ) {
		if ( isNaN( sec ) ) {
			//mw.log("Warning: trying to get npt time on NaN:" + sec);			
			return '0:00:00';
		}
		var hoursStr;
		var tm = mw.seconds2Measurements( sec );
				
		// Round the number of seconds to the required number of significant
		// digits
		if ( show_ms ) {
			tm.seconds = Math.round( tm.seconds * 1000 ) / 1000;
		} else {
			var roundedSec = Math.round( tm.seconds );
			if( roundedSec == 60 ){
				tm.seconds = 0;
				tm.minutes = parseInt( tm.minutes ) + 1;
			} else { 
				tm.seconds = roundedSec;
			}
		}
		if ( tm.seconds < 10 ){
			tm.seconds = '0' +	tm.seconds;
		}
		if( tm.hours == 0 ){
			hoursStr = '';
		} else {
			if ( tm.minutes < 10 ){
				tm.minutes = '0' + tm.minutes;
			}
			hoursStr = tm.hours + ":"; 
		}
		return hoursStr + tm.minutes + ":" + tm.seconds;
	};
	
	/**
	 * Given seconds return array with 'days', 'hours', 'min', 'seconds'
	 * 
	 * @param {float}
	 *            sec Seconds to be converted into time measurements
	 */
	mw.seconds2Measurements = function ( sec ){
		var tm = {};
		tm.days = Math.floor( sec / ( 3600 * 24 ) );
		tm.hours = Math.floor( sec / 3600 );
		tm.minutes = Math.floor( ( sec / 60 ) % 60 );
		tm.seconds = sec % 60;
		tm.milliseconds = sec - Math.floor( sec );
		return tm;
	};
	/**
	 * Given a timeMeasurements object return the number of seconds
	 * @param {object} timeMeasurements
	 */
	mw.measurements2seconds = function( timeMeasurements ){
		var seconds = 0;
		if( timeMeasurements.days ){
			seconds += parseInt( timeMeasurements.days, 10 ) * 24 * 3600;
		}
		if( timeMeasurements.hours ){
			seconds += parseInt( timeMeasurements.hours, 10 ) * 3600;
		}
		if( timeMeasurements.minutes ){
			seconds += parseInt( timeMeasurements.minutes, 10 ) * 60;
		}
		if( timeMeasurements.seconds ){
			seconds += parseInt( timeMeasurements.seconds, 10 );
		}
		if( timeMeasurements.milliseconds ){
			seconds += parseInt( timeMeasurements.milliseconds, 10 ) / 1000;
		}
		return seconds;
	};
	/**
	 * Given a float number of seconds, returns npt format response. ( ignore
	 * days for now )
	 * 
	 * @param {Float}
	 *            sec Seconds
	 * @param {Boolean}
	 *            verbose If hours and milliseconds should padded be displayed.
	 * @return {Float} String npt format
	 */
	mw.npt2seconds = function ( npt_str ) {
		if ( !npt_str ) {
			mw.log('npt2seconds:not valid ntp:'+npt_str);
			return 0;
		}
		// Strip {npt:}01:02:20 or 32{s} from time if present
		npt_str = npt_str.replace( /npt:|s/g, '' );

		var hour = 0;
		var min = 0;
		var sec = 0;

		var times = npt_str.split( ':' );
		if ( times.length == 3 ) {
			sec = times[2];
			min = times[1];
			hour = times[0];
		} else if ( times.length == 2 ) {
			sec = times[1];
			min = times[0];
		} else {
			sec = times[0];
		}
		// Sometimes a comma is used instead of period for ms
		sec = sec.replace( /,\s?/, '.' );
		// Return seconds float
		return parseInt( hour * 3600 ) + parseInt( min * 60 ) + parseFloat( sec );
	};

	// Local mwEmbedSrc variable ( for cache of mw.getMwEmbedSrc )
	var mwEmbedSrc = null;

	/**
	 * Gets the mwEmbed script src attribute
	 */
	mw.getMwEmbedSrc = function() {
		if ( mwEmbedSrc ) {
			return mwEmbedSrc;
		}

		// Get all the javascript includes:
		var js_elements = document.getElementsByTagName( "script" );
		for ( var i = 0; i < js_elements.length; i++ ) {
			// Check for mwEmbed.js and/or script loader
			var src = js_elements[i].getAttribute( "src" );
			if ( src ) {
				if ( // Check for mwEmbed.js ( debug mode )
					( src.indexOf( 'mwEmbed.js' ) !== -1 && src.indexOf( 'MediaWiki:Gadget') == -1 )
				 	|| // Check for resource loader
				 	(
				 		( src.indexOf( 'mwResourceLoader.php' ) !== -1 || src.indexOf( 'ResourceLoader.php' ) !== -1 )
						&&
						src.indexOf( 'mwEmbed' ) !== -1
					)
					|| // Check for static mwEmbed package
					( src.indexOf( 'mwEmbed' ) !== -1 && src.indexOf( 'static' ) !== -1 )
				) {
					mwEmbedSrc = src;
					return mwEmbedSrc;
				}
			}
		}
		mw.log( 'Error: getMwEmbedSrc failed to get script path' );
		return false;
	};

	// Local mwUrlParam variable ( for cache of mw.getUrlParam )
	var mwUrlParam = null;

	/**
	 * Get URL Parameters per parameters in the host script include
	 */
	mw.getUrlParam = function() {
		if ( mwUrlParam ) {
			return mwUrlParam;
		}

		var mwEmbedSrc = mw.getMwEmbedSrc();
		var req_param = '';

		// If we already have a URI, add it to the param request:
		var urid = mw.parseUri( mwEmbedSrc ).queryKey['urid'];

		// If we're in debug mode, get a fresh unique request key and pass on
		// "debug" param
		if ( mw.parseUri( mwEmbedSrc ).queryKey['debug'] == 'true' ) {
			mw.setConfig( 'debug', true );
			var d = new Date();
			req_param += 'urid=' + d.getTime() + '&debug=true';

		} else if ( urid ) {
			 // Just pass on the existing urid:
			req_param += 'urid=' + urid;
		} else {
			// Otherwise, Use the mwEmbed version
			req_param += 'urid=' + mw.version;
		}

		// Add the language param if present:
		var langKey = mw.parseUri( mwEmbedSrc ).queryKey['uselang'];
		if ( langKey )
			req_param += '&uselang=' + langKey;

		// Update the local cache and return the value
		mwUrlParam = req_param;
		return mwUrlParam;
	};

	/**
	 * Replace url parameters via newParams key value pairs
	 * 
	 * @param {String}
	 *            url Source url to be updated
	 * @param {Object}
	 *            newParams key, value pairs to swap in
	 * @return {String} the updated url
	 */
	mw.replaceUrlParams = function( url, newParams ) {
		var parsedUrl = mw.parseUri( url );

		if ( parsedUrl.protocol != '' ) {
			var new_url = parsedUrl.protocol + '://' + parsedUrl.authority + parsedUrl.path + '?';
		} else {
			var new_url = parsedUrl.path + '?';
		}

		// Merge new params:
		for( var key in newParams ) {
			parsedUrl.queryKey[ key ] = newParams[ key ];
		}

		// Output to new_url
		var amp = '';
		for ( var key in parsedUrl.queryKey ) {
			var val = parsedUrl.queryKey[ key ];
			new_url += amp + key + '=' + val;
			amp = '&';
		}
		return new_url;
	};

	/**
	 * parseUri 1.2.2 (c) Steven Levithan <stevenlevithan.com> MIT License
	 */
	mw.parseUri = function (str) {
		var	o   = mw.parseUri.options,
			m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
			uri = {},
			i   = 14;

		while (i--) uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			if ($1) uri[o.q.name][$1] = $2;
		});

		return uri;
	};

	/**
	 * Parse URI function
	 * 
	 * For documentation on its usage see:
	 * http://stevenlevithan.com/demo/parseuri/js/
	 */
	mw.parseUri.options = {
		strictMode: false,
		key: ["source", "protocol", "authority", "userInfo", "user", "password", "host",
				"port", "relative", "path", "directory", "file", "query", "anchor"],
		q: {
			name: "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};

	/**
	 * getAbsoluteUrl takes a src and returns the absolute location given the
	 * document.URL or a contextUrl param
	 * 
	 * @param {String}
	 *            src path or url
	 * @param {String}
	 *            contextUrl The domain / context for creating an absolute url
	 *            from a relative path
	 * @return {String} absolute url
	 */
	mw.absoluteUrl = function( src, contextUrl ) {
		if( ! src ){
			return ;
		}
		
		var parsedSrc = mw.parseUri( src );

		// Source is already absolute return:
		if( parsedSrc.protocol != '') {
			return src;
		}

		// Get parent Url location the context URL
		if( !contextUrl ) {
			contextUrl = document.URL;
		}
		var parsedUrl = mw.parseUri( contextUrl );

		// Check for IE local file that does not flip the slashes
		if( parsedUrl.directory == '' && parsedUrl.protocol == 'file' ){
			// pop off the file
			var fileUrl = contextUrl.split( '\\');
			fileUrl.pop();
			return 	fileUrl.join('\\') + '\\' + src;
		}

		// Check for leading slash:
		if( src.indexOf( '/' ) === 0 ) {
			return parsedUrl.protocol + '://' + parsedUrl.authority + src;
		}else{
			return parsedUrl.protocol + '://' + parsedUrl.authority + parsedUrl.directory + src;
		}
	};
	/**
	 * Check if a given source string is likely a url
	 * 
	 * @return {boolean} true if a url false if a string
	 */
	mw.isUrl = function( src ){
		var parsedSrc = mw.parseUri( src );
		// if the url is just a string source and host will match
		return ( parsedSrc.host != parsedSrc.source );
	};

	/**
	 * Escape quotes in a text string
	 * 
	 * @param {String}
	 *            text String to be escaped
	 * @return {string} escaped text string
	 */
	mw.escapeQuotes = function( text ) {
		var re = new RegExp("'","g");
		text = text.replace(re,"\\'");
		re = new RegExp("\\n","g");
		text = text.replace(re,"\\n");
		return mw.escapeQuotesHTML(text);
	};

	/**
	 * Escape an HTML text string
	 * 
	 * @param {String}
	 *            text String to be escaped
	 * @return {string} escaped text html string
	 */
	mw.escapeQuotesHTML = function( text ) {
		var replaceMap = {
			"&" : "&amp;",
			'"' : "&quot;",
			'<' : "&lt;",
			'>' : "&gt;"
		};
		for( var i in replaceMap ){
			text = text.split(i).join( replaceMap[i]);
		}
		return text;
	};


	// Array of setup functions
	var mwSetupFunctions = [];

	/**
	 * Add a function to be run during setup ( prior to mw.ready) this is useful
	 * for building out interfaces that should be ready before mw.ready is
	 * called.
	 * 
	 * @param {callback}
	 *            Function Callback function must accept a ready function
	 *            callback to be called once setup is done
	 */
	mw.addSetupHook = function( callback ) {
		mwSetupFunctions.push ( callback ) ;
	};

	/**
	 * One time "setup" for mwEmbed run onDomReady ( so calls to setConfg apply
	 * to setup )
	 */
	// Flag to ensure setup is only run once:
	var mwSetupFlag = false;
	mw.setupMwEmbed = function ( ) {
		// Only run the setup once:
		if( mwSetupFlag ) {
			return ;
		}
		mwSetupFlag = true;

		mw.log( 'mw:setupMwEmbed SRC:: ' + mw.getMwEmbedSrc() );

		// Check core mwEmbed loader.js file ( to get configuration and paths )
		mw.checkCoreLoaderFile( function(){
			
			// Make sure we have jQuery
			mw.load( 'window.jQuery', function() {
				// Add jQuery to $j var.
				if ( ! window[ '$j' ] ) {
					window[ '$j' ] = jQuery.noConflict();
				}
				
				// Setup user config:
				mw.setupUserConfig( function(){
					// Get module loader.js, and language files
					// ( will hit callback directly if set via resource loader )
					mw.checkModuleLoaderFiles( function() {

						// Set the User language
						if( typeof wgUserLanguage != 'undefined' && mw.isValidLang( wgUserLanguage) ) {
							mw.setConfig( 'userLanguage', wgUserLanguage );
						}else{
							// Grab it from the included url
							var langKey = mw.parseUri( mw.getMwEmbedSrc() ).queryKey['uselang'];
							if ( langKey && mw.isValidLang( langKey ) ) {
								mw.setConfig( 'userLanguage', langKey);
							}
						}

						// Update the image path
						mw.setConfig( 'imagesPath', mw.getMwEmbedPath() + 'skins/common/images/' );

						// Set up AJAX to not send dynamic URLs for loading
						// scripts
						$.ajaxSetup( {
							cache: true
						} );

						// Update the magic keywords
						mw.Language.magicSetup();						
						
						// Check if we have a global jquery ui skin: 
						if( mw.getConfig('IframeCustomjQueryUISkinCss' ) != null ){
							mw.style[ 'ui_' + mw.getConfig( 'jQueryUISkin' ) ] = true;
							mw.getStyleSheet( mw.getConfig('IframeCustomjQueryUISkinCss' )  );
						} else {
							// Special Hack for conditional jquery ui inclusion 
							if( mw.hasJQueryUiCss() ){
								mw.style[ 'ui_' + mw.getConfig( 'jQueryUISkin' ) ] = true;
							}
						}

						// load any  Mw.CustomResourceIncludes
						mw.loadCustomResourceIncludes( mw.getConfig('Mw.CustomResourceIncludes'), function(){
							// Make sure style sheets are loaded:
							mw.load( ['mw.style.mwCommon'] , function(){
								// Run all the setup function hooks
								// NOTE: setup functions are added via addSetupHook calls
								// and must include a callback.
								//
								// Once complete we can run .ready() queued functions
								function runSetupFunctions() {
									if( mwSetupFunctions.length ) {
										mwSetupFunctions.shift()( function() {
											runSetupFunctions();
										} );
									} else {
										mw.runReadyFunctions();
									}
								}
								runSetupFunctions();
							});
						});
					} );
				});
			});
		});
	};
	mw.loadCustomResourceIncludes = function( loadSet, callback ){
		// XXX this needs to be cleaned up ( for now don't include custom resources if not an iframe player )
		if( !mw.getConfig('EmbedPlayer.IsIframeServer' ) || !loadSet || loadSet.length == 0 ){
			callback();
			return ;
		}
		var loadCount = loadSet.length - 1;
		var checkLoadDone = function(){
			if( loadCount == 0 )
				callback();
			loadCount--;
		};
		var resource;
		for( var i =0 ; i < loadSet.length; i ++ ){
			resource = loadSet[i];
			if( resource.type == 'js' ){
				// For some reason safair loses context:
				$.getScript( resource.src, checkLoadDone);
			} else if ( resource.type == 'css' ){
				mw.getStyleSheet( resource.src, checkLoadDone);
			}
		}
	};
	/**
	 * Checks for jquery ui css by name jquery-ui-1.7.2.css NOTE: this is a hack
	 * for usability jquery-ui in the future usability should register a
	 * resource in mw.skin
	 * 
	 * @return true if found, return false if not found
	 */
	mw.hasJQueryUiCss = function(){
		var hasUiCss = false;
		var cssStyleSheetNames = ['jquery-ui-1.7.2.css', 'jquery-ui.css'];
		// Load the jQuery ui skin if usability skin not set
		$( 'link' ).each( function( na, linkNode ){
			$j.each( cssStyleSheetNames, function(inx, sheetName ){
				if( $( linkNode ).attr( 'href' ).indexOf( sheetName ) != -1 ){
					hasUiCss = true;
					return true;
				}
			});
		} );
		// Check all the "style" nodes for @import for sheet name
		// xxx Note: we could do this a bit cleaner with regEx
		$( 'style' ).each( function( na, styleNode ){
			$j.each( cssStyleSheetNames, function(inx, sheetName ){
				if( $( styleNode ).text() && 
					$( styleNode ).text().indexOf( '@import' ) != -1
					&&
					$( styleNode ).text().indexOf( sheetName ) != -1 )
				{
					hasUiCss=true;
					return true;
				}
			});
		});
		return hasUiCss;
	};

	/**
	 * Loads the core mwEmbed "loader.js" file config
	 * 
	 * NOTE: if using the ScriptLoader all the loaders and localization
	 * converters are included automatically
	 * 
	 * @param {Function}
	 *            callback Function called once core loader file is loaded
	 */
	mw.checkCoreLoaderFile = function( callback ) {
		// Check if we are using scriptloader ( handles loader include
		// automatically )
		if( mw.getResourceLoaderPath() ) {
			callback();
			return ;
		}

		// Check if we are using a static package ( mwEmbed path includes
		// -static )
		if( mw.isStaticPackge() ){
			callback();
			return ;
		}

		// Add the Core loader to the request
		// The follow code is ONLY RUN in debug / raw file mode
		mw.load( 'loader.js', callback );
	};

	/**
	 * Checks if the javascript is a static package ( not using resource loader )
	 * 
	 * @return {boolean} true the included script is static false the included
	 *         script
	 */
	mw.isStaticPackge = function(){
		var src = mw.getMwEmbedSrc();
		if( src.indexOf('-static') !== -1 ){
			return true;
		}
		return false;
	};

	/**
	 * Check for resource loader module loaders, and localization files
	 * 
	 * NOTE: if using the ScriptLoader all the loaders and localization
	 * converters are included automatically.
	 */
	mw.checkModuleLoaderFiles = function( callback ) {
		mw.log( 'checkModuleLoaderFiles::' );

		// Check if we are using scriptloader ( handles loader include
		// automatically )
		// Or if mwEmbed is a static package ( all resources are already loaded
		// )
		if( mw.getResourceLoaderPath() || mw.isStaticPackge() ) {
			callback();
			return ;
		}

		// Load the configured modules / components
		// The follow code is ONLY RUN in debug / raw file mode
		var loaderRequest = [];

		// Load enabled components
		var enabledComponents = mw.getConfig( 'coreComponents' );
		function loadEnabledComponents( enabledComponents ){
			if( ! enabledComponents.length ){
				// If no more components load modules::

				// Add the enabledModules loaders:
				var enabledModules = mw.getConfig( 'enabledModules' );
				loadEnabledModules( enabledModules );
				return ;
			}
			var componentName = enabledComponents.shift();
			componentName = componentName.replace(/"/g,'');
			mw.load( componentName, function(){
				loadEnabledComponents( enabledComponents );
			} );
		}
		loadEnabledComponents( enabledComponents );


		// Set the loader context and get each loader individually
		function loadEnabledModules( enabledModules ){
			if( ! enabledModules.length ){
				// If no more modules left load the LanguageFile
				addLanguageFile();
				return ;
			}
			var moduleName = enabledModules.shift();
			moduleName = moduleName.replace(/"/g,'');
			mw.setConfig( 'loaderContext', 'modules/' + moduleName + '/' );
			mw.load( 'modules/' + moduleName + '/loader.js', function(){
				loadEnabledModules( enabledModules );
			} );
		}

		function addLanguageFile(){
			// Add the language file
			var langLoaderRequest = [];

			if( mw.getConfig( 'userLanguage' ) ) {
				var langCode = mw.getConfig( 'userLanguage' );

				// Load the language resource if not default 'en'
				var transformKey = mw.getLangTransformKey( langCode );
				if( transformKey != 'en' ){
					// Upper case the first letter:
					langCode = langCode.substr(0,1).toUpperCase() + langCode.substr( 1, langCode.length );
					langLoaderRequest.push( 'languages/classes/Language' +
						langCode + '.js' );
				}

			}
			if ( ! langLoaderRequest.length ) {
				addLocalSettings();
				return ;
			}

			// Load the language if set
			mw.load( langLoaderRequest, function(){
				mw.log( 'Done moduleLoaderCheck request' );
				addLocalSettings();
			} );
		}
		function addLocalSettings(){
			var continueCallback = function(){
				// Set the mwModuleLoaderCheckFlag flag to true
				mwModuleLoaderCheckFlag = true;
				callback();
			};
			if( mw.getConfig( 'LoadLocalSettings') != true ){
				continueCallback();
				return;
			}
			mw.log("Load loacal settings");
			mw.load( 'localSettings.js', function(){
				continueCallback();
			});
		}

	};

	/**
	 * Checks if a css style rule exists
	 * 
	 * On a page with lots of rules it can take some time so avoid calling this
	 * function where possible and cache its result
	 * 
	 * NOTE: this only works for style sheets on the same domain :(
	 * 
	 * @param {String}
	 *            styleRule Style rule name to check
	 * @return {Boolean} true if the rule exists false if the rule does not
	 *         exist
	 */
	mw.styleRuleExists = function ( styleRule ) {
		// Set up the skin paths configuration
		for( var i=0 ; i < document.styleSheets.length ; i++ ) {
			var rules = null;
			try{
				if ( document.styleSheets[i].cssRules )
					rules = document.styleSheets[i].cssRules;
				else if (document.styleSheets[0].rules)
					rules = document.styleSheets[i].rules;
				for(var j=0 ; j < rules.length ; j++ ) {
					var rule = rules[j].selectorText;
					if( rule && rule.indexOf( styleRule ) != -1 ) {
						return true;
					}
				}
			}catch ( e ) {
				mw.log( 'Error: cant check rule on cross domain style sheet:' + document.styleSheets[i].href );
			}
		}
		return false;
	};

	// Flag to register if the domreadyHooks have been called
	var mwModuleLoaderCheckFlag = false;
	
	/**
	 * This will get called when the DOM is ready Will check configuration and
	 * issue a mw.setupMwEmbed call if needed
	 */
	mw.domReady = function ( forceSetup ) {
		mw.log('mw.domReady:' );
		// Don't run the setup inline to avoid domready event before the rest of the script has run
		setTimeout(function(){
			mw.setupMwEmbed();
		}, 0 );
	};
	/**
	* Check if the url is a request for the local domain
	*  relative paths are "local" domain
	* @param {String} url Url for local domain
	* @return {Boolean}
	*	true if url domain is local or relative
	* 	false if the domain is
	*/
	mw.isLocalDomain = function( url ) {
		if( ! url )
			return false;
		if( mw.parseUri( document.URL ).host == mw.parseUri( url ).host
			|| url.indexOf( '://' ) == -1 )
		{
			return true;
		}
		return false;
	};

	/**
	 * A version comparison utility function Handles version of types
	 * {Major}.{MinorN}.{Patch}
	 * 
	 * Note this just handles version numbers not patch letters.
	 * 
	 * @param {String}
	 *            minVersion Minnium version needed
	 * @param {String}
	 *            clientVersion Client version to be checked
	 * 
	 * @return true if the version is at least of minVersion false if the
	 *         version is less than minVersion
	 */
	mw.versionIsAtLeast = function( minVersion, clientVersion ) {
		var minVersionParts = minVersion.split('.');
		var clientVersionParts = clientVersion.split('.');
		for( var i =0; i < minVersionParts.length; i++ ) {
			if( parseInt( clientVersionParts[i] ) > parseInt( minVersionParts[i] ) ) {
				return true;
			}
			if( parseInt( clientVersionParts[i] ) < parseInt( minVersionParts[i] ) ) {
				return false;
			}
		}
		// Same version:
		return true;
	};
	
	mw.getHexColor = function( color ) {
		if( typeof color == 'string' && color.substr(0,2) == "0x" ) {
			return color.replace('0x', '#');
		} else {
			color = parseInt( color );
			color = color.toString(16);
			var len = 6 - color.length;
			if( len > 0 ) {
				var pre = '';
				for( var i=0; i<len; i++) {
					pre += '0';
				}
				color = pre + color;
			}
			return '#' + color;
		}
	};

} )( window.mw );


/**
 * Set DOM-ready call We copy jQuery( document ).ready here since sometimes
 * mwEmbed.js is included without jQuery and we need our own "ready" system so
 * that mwEmbed interfaces can support async built out and the include of
 * jQuery.
 */

// Check if already ready:
if ( document.readyState === "complete" ) {
	mw.domReady();
}
// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		mw.domReady();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous
		// (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			mw.domReady();
		}
	};
}

// A fallback to window.onload, is set so that we are sure to fire mw.domReady
try{
	if ( window.addEventListener ) {
		window.addEventListener( "load", mw.domReady, false );
	}
} catch ( e ){
	// catch the addEventListener missing issue in IE
}

// chrome sometimes never gets into a 'complete' state instead just gets to interactive
// here we poll for interactive state:
if( document.readyState ){
	function checkDomState(){
		if( document.readyState == 'complete' ||  document.readyState == 'interactive'){
			mw.domReady();
		} else {
			setTimeout(checkDomState, 100 );
		}
	}
	setTimeout(function(){
		checkDomState();
	}, 500);
}

// Mozilla, Opera and webkit nightlies currently support this event
if ( document.addEventListener ) {
	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	
// If IE event model is used
} else if ( document.attachEvent ) {
	// ensure firing before onload,
	// maybe late but safe also for iframes
	document.attachEvent("onreadystatechange", DOMContentLoaded);

	// If IE and not a frame
	// continually check to see if the document is ready
	var toplevel = false;

	try {
		toplevel = window.frameElement == null;
	} catch(e) {}

	if ( document.documentElement.doScroll && toplevel ) {
		doScrollCheck();
	}
}
// The DOM ready check for Internet Explorer
function doScrollCheck() {
	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch( error ) {
		setTimeout( doScrollCheck, 1 );
		return;
	}
	mw.domReady();
}

// If using the resource loader and jQuery has not been set give a warning to the user:
// (this is needed because packaged loader.js files could refrence jQuery )
if( mw.getResourceLoaderPath() && !window.jQuery ) {
	mw.log( 'Error: jQuery is required for mwEmbed, please update your resource loader request' );
}

if( mw.isStaticPackge() && !window.jQuery ){
	alert( 'Error: jQuery is required for mwEmbed ');
}

/**
 * Hack to keep jQuery in $ when its already there, but also use noConflict to
 * get $j = jQuery
 * 
 * This way sites that use $ for jQuery continue to work after including mwEmbed
 * javascript.
 * 
 * Also if jQuery is included prior to mwEmbed we ensure $j is set
 */

if( window.jQuery ){
	if( ! mw.versionIsAtLeast( '1.3.2', jQuery.fn.jquery ) ){
		if( window.console && window.console.log ) {
			console.log( 'Error Kaltura HTML5 requires jQuery 1.3.2 or above' );
		}
	}
	var dollarFlag = false;
	if( $ && $.fn && $.fn.jquery ) {
		// NOTE we could check the version of
		// jQuery and do a removal call if too old
		dollarFlag = true;
	}
	window[ '$j' ] = jQuery.noConflict();
	if( dollarFlag ) {
		window[ '$' ] = jQuery.noConflict();
	}
} else {
	alert( 'mwEmbed requires jQuery');
}

( function( $ ) {
	
	/**
	 * Runs all the triggers on all the named bindings of an object with
	 * a single callback
	 * 
	 * NOTE THIS REQUIRES JQUERY 1.4.2 and above
	 * 
	 * Normal jQuery tirgger calls will run the callback directly
	 * multiple times for every binded function.
	 * 
	 * With triggerQueueCallback() callback is not called until all the
	 * binded events have been run.
	 * 
	 * @param {string}
	 *            triggerName Name of trigger to be run
	 * @param {object=}
	 *            arguments Optional arguments object to be passed to
	 *            the callback
	 * @param {function}
	 *            callback Function called once all triggers have been
	 *            run
	 * 
	 */
	$.fn.triggerQueueCallback = function( triggerName, triggerParam, callback ){
		var targetObject = this;
		// Support optional triggerParam data
		if( !callback && typeof triggerParam == 'function' ){
			callback = triggerParam;
			triggerParam = null;
		}
		
		// Support namespaced event segmentation
		var triggerBaseName = triggerName.split(".")[0]; 
		var triggerNamespace = triggerName.split(".")[1];
		// Get the callback set
		var callbackSet = [];

		// Check for both jQuery 1.4.4 events location and other jQuery data location: 
		if( !$( targetObject ).data( 'events' ) && ! $( targetObject)[0]['__events__'] ){
			// No events run the callback directly
			callback();
			return ;
		}
		
		var triggerEventSet = $( targetObject ).data( 'events' ) ?
					$( targetObject ).data( 'events' )[ triggerBaseName ] :
					$( targetObject)[0]['__events__'][ 'events' ][ triggerBaseName ];
					
		if( ! triggerNamespace ){
			callbackSet = triggerEventSet;
		} else{		
			$.each( triggerEventSet, function( inx, bindObject ){
				if( bindObject.namespace ==  triggerNamespace ){
					callbackSet.push( bindObject );
				}
			});
		}

		if( !callbackSet || callbackSet.length === 0 ){
			//mw.log( '"mwEmbed::jQuery.triggerQueueCallback: No events run the callback directly: ' + triggerName );
			// No events run the callback directly
			callback();
			return ;
		}
		
		// Set the callbackCount
		var callbackCount = ( callbackSet.length )? callbackSet.length : 1;
		// mw.log("mwEmbed::jQuery.triggerQueueCallback: " + triggerName
		// + ' number of queued functions:' + callbackCount );
		var callInx = 0;
		var callbackData = [];
		var doCallbackCheck = function() {
			var args = $.makeArray( arguments );
			// If only one argument don't use an array: 
			if( args.length == 1 ){
				args = args[0];
			}
			// Add the callback data for the current trigger:
			callbackData.push( args );
			callInx++;
			
			// If done with loading run master callback with callbackData
			if( callInx == callbackCount ){
				callback( callbackData );
			}
		};
		var triggerArgs = ( triggerParam )? [ triggerParam, doCallbackCheck ] : [ doCallbackCheck ];
		$( this ).trigger( triggerName, triggerArgs);
		
	};
	
	/**
	 * Set a given selector html to the loading spinner:
	 */
	$.fn.loadingSpinner = function( opts ) {
		// empty the target: 
		$( this ).empty();

		// If we have loader path defined, load an image
		if( mw.getConfig('LoadingSpinner.ImageUrl') ) {
			this.each(function() {
				var $this = $(this).empty();
				var thisSpinner = $this.data('spinner');
				if (thisSpinner) {
					$this.data('spinner', null);
					delete thisSpinner;
				}
				if (opts !== false) {
					var $loadingSpinner = $('<img />').attr("src", mw.getConfig('LoadingSpinner.ImageUrl')).load(function() {
						// Set spinner position based on image dimension
						$( this ).css({
							'margin-top': '-' + (this.height/2) + 'px',
							'margin-left': '-' + (this.width/2) + 'px'
						});
					});
					thisSpinner = $this.append( $loadingSpinner);
				}
			});
			return this;
		}

		// Else, use Spin.js defaults
		if( !opts ){
			opts = {};
		}
		// add color and shadow:
		opts = $.extend( {'color' : '#eee', 'shadow': true }, opts);
		this.each( function() {
			var $this = $(this).empty();
			var thisSpinner = $this.data('spinner');
			if (thisSpinner) {
				thisSpinner.stop();
				delete thisSpinner;
			}
			if ( opts !== false ) {
				thisSpinner = new Spinner( $.extend( { color: $this.css('color') }, opts ) ).spin( this );
			}
		});
		// correct the position: 
		return this;
	};
	
	/**
	 * Add an absolute overlay spinner useful for cases where the
	 * element does not display child elements, ( images, video )
	 */
	$.fn.getAbsoluteOverlaySpinner = function(){
		// Set the spin size to "small" ( length 5 ) if video height is small
		var spinOps = ( $( this ).height() < 36 )? { 'length' : 5, 'width' : 2, 'radius' : 4 }: {};
		var spinerSize = {
				'width' : 45, 
				'height' : 45
		};
		var $spinner = $('<div />')
			.css({
				'width' : spinerSize.width,
				'height' : spinerSize.height,
				'position': 'absolute',
				'top' : '50%',
				'left' : '50%',
				'z-index' : 100
			})
			.loadingSpinner(
				spinOps
			);
		$( this ).append( $spinner	);
		return $spinner;
	};

	/**
	 * dragDrop file loader
	 */
	$.fn.dragFileUpload = function ( conf ) {
		if ( this.selector ) {
			var _this = this;
			// load the dragger and "setup"
			mw.load( ['$j.fn.dragDropFile'], function() {
				$( _this.selector ).dragDropFile();
			} );
		}
	};

	/**
	 * Shortcut to a themed button Should be depreciated for $.button
	 * below
	 */
	$.btnHtml = function( msg, styleClass, iconId, opt ) {
		if ( !opt )
			opt = { };
		var href = ( opt.href ) ? opt.href : '#';
		var target_attr = ( opt.target ) ? ' target="' + opt.target + '" ' : '';
		var style_attr = ( opt.style ) ? ' style="' + opt.style + '" ' : '';
		return '<a href="' + href + '" ' + target_attr + style_attr +
			' class="ui-state-default ui-corner-all ui-icon_link ' +
			styleClass + '"><span class="ui-icon ui-icon-' + iconId + '" ></span>' +
			'<span class="btnText">' + msg + '</span></a>';
	};

	// Shortcut to jQuery button ( should replace all btnHtml with
	// button )
	var mw_default_button_options = {
		// The class name for the button link
		'class' : '',

		// The style properties for the button link
		'style' : { },

		// The text of the button link
		'text' : '',

		// The icon id that precedes the button link:
		'icon' : 'carat-1-n'
	};

	$.button = function( options ) {
		var options = $j.extend( {}, mw_default_button_options, options);

		// Button:
		var $button = $('<a />')
			.attr('href', '#')
			.addClass( 'ui-state-default ui-corner-all ui-icon_link' );
		
		// Add css if set:
		if( options.css ) {
			$button.css( options.css );
		}

		if( options['class'] ) {
			$button.addClass( options['class'] );
		}
	
		// return the button:
		$button.append(
				$('<span />').addClass( 'ui-icon ui-icon-' + options.icon ),
				$('<span />').addClass( 'btnText' )
		)
		.buttonHover(); // add buttonHover binding;

		if( options.text ){
			$button.find('.btnText').text( options.text );
		} else {
			$button.css('padding', '1em');
		}
		return $button;
	};

	// Shortcut to bind hover state
	$.fn.buttonHover = function() {
		// TODO don't add hover for any touch interface
		if( mw.isIpad() ){
			// don't add hover for iPad ( results in always hover state ) 
			return this;
		}
		$( this ).hover(
			function() {
				$( this ).addClass( 'ui-state-hover' );
			},
			function() {
				$( this ).removeClass( 'ui-state-hover' );
			}
		);
		return this;
	};

	/**
	 * Resize a dialog to fit the window
	 * 
	 * @param {Object}
	 *            options horizontal and vertical space ( default 50 )
	 */
	$.fn.dialogFitWindow = function( options ) {
		var opt_default = { 'hspace':50, 'vspace':50 };
		if ( !options )
			var options = { };
		options = $j.extend( opt_default, options );
		$( this.selector ).dialog( 'option', 'width', $( window ).width() - options.hspace );
		$( this.selector ).dialog( 'option', 'height', $( window ).height() - options.vspace );
		$( this.selector ).dialog( 'option', 'position', 'center' );
			// update the child position: (some of this should be pushed
			// up-stream via dialog config options
		$( this.selector + '~ .ui-dialog-buttonpane' ).css( {
			'position':'absolute',
			'left':'0px',
			'right':'0px',
			'bottom':'0px'
		} );
	};

} )( jQuery );



// XXX note with new Resource loader we can move spin.js into seperate class and make it part
// of the "startup modules"
//fgnass.github.com/spin.js#v1.1
(function(window, document, undefined) {

/**
 * Copyright (c) 2011 Felix Gnass [fgnass at neteye dot de]
 * Licensed under the MIT license
 */

  var prefixes = ['webkit', 'Moz', 'ms', 'O'], /* Vendor prefixes */
      animations = {}, /* Animation rules keyed by their name */
      useCssAnimations;

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div'),
        n;

    for(n in prop) {
      el[n] = prop[n];
    }
    return el;
  }

  /**
   * Inserts child1 before child2. If child2 is not specified,
   * child1 is appended. If child2 has no parentNode, child2 is
   * appended first.
   */
  function ins(parent, child1, child2) {
    if(child2 && !child2.parentNode) ins(parent, child2);
    parent.insertBefore(child1, child2||null);
    return parent;
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  //ins(document.getElementsByTagName('head')[0], createEl('style'));
  //var sheet = document.styleSheets[document.styleSheets.length-1];
  var sheet = (function() {
		var style = document.createElement('style');
		style['title'] = 'spinjs';	
		document.getElementsByTagName('head')[0].appendChild(style);  
		if (!window.createPopup) { /* For Safari */  
		   style.appendChild(document.createTextNode(''));  
		} 
		return document.styleSheets[document.styleSheets.length - 1]; 
  })();

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-'),
        start = 0.01 + i/lines*100,
        z = Math.max(1-(1-alpha)/trail*(100-start) , alpha),
        prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase(),
        pre = prefix && '-'+prefix+'-' || '';

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:'+z+'}' +
        start + '%{opacity:'+ alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail)%100 + '%{opacity:'+ alpha + '}' +
        '100%{opacity:'+ z + '}' +
        '}', 0);
      animations[name] = 1;
    }
    return name;
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   **/
  function vendor(el, prop) {
    var s = el.style,
        pp,
        i;

    if(s[prop] !== undefined) return prop;
    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop;
      if(s[pp] !== undefined) return pp;
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n)||n] = prop[n];
    }
    return el;
  }

  /**
   * Fills in default values.
   */
  function defaults(obj, def) {
    for (var n in def) {
      if (obj[n] === undefined) obj[n] = def[n];
    }
    return obj;
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = {x:el.offsetLeft, y:el.offsetTop};
    while((el = el.offsetParent)) {
      o.x+=el.offsetLeft;
      o.y+=el.offsetTop;
    }
    return o;
  }

  /** The constructor */
  var Spinner = function Spinner(o) {
    this.opts = defaults(o || {}, {
      lines: 12, // The number of lines to draw
      length: 7, // The length of each line
      width: 5, // The line thickness
      radius: 10, // The radius of the inner circle
      color: '#000', // #rbg or #rrggbb
      speed: 1, // Rounds per second
      trail: 100, // Afterglow percentage
      opacity: 1/4
    });
  },
  proto = Spinner.prototype = {
    spin: function(target) {
      var self = this,
          el = self.el = css(createEl(), {position: 'relative'}),
          ep, // element position
          tp; // target position

      if (target) {
        tp = pos(ins(target, el, target.firstChild));
        ep = pos(el);
        css(el, {
          left: (target.offsetWidth >> 1) - ep.x+tp.x + 'px',
          top: (target.offsetHeight >> 1) - ep.y+tp.y + 'px'
        });
      }
      self.lines(el, self.opts);
      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var o = self.opts,
            i = 0,
            f = 20/o.speed,
            ostep = (1-o.opacity)/(f*o.trail / 100),
            astep = f/o.lines;

        (function anim() {
          i++;
          for (var s=o.lines; s; s--) {
            var alpha = Math.max(1-(i+s*astep)%f * ostep, o.opacity);
            self.opacity(el, o.lines-s, alpha, o);
          }
          self.timeout = self.el && setTimeout(anim, 50);
        })();
      }
      return self;
    },
    stop: function() {
      var self = this,
          el = self.el;

      clearTimeout(self.timeout);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      self.el = undefined;
      return self;
    }
  };
  proto.lines = function(el, o) {
    var i = 0,
        seg;

    function fill(color, shadow) {
      return css(createEl(), {
        position: 'absolute',
        width: (o.length+o.width) + 'px',
        height: o.width + 'px',
        background: color,
        boxShadow: shadow,
        transformOrigin: 'left',
        transform: 'rotate(' + ~~(360/o.lines*i) + 'deg) translate(' + o.radius+'px' +',0)',
        borderRadius: (o.width>>1) + 'px'
      });
    }
    for (; i < o.lines; i++) {
      seg = css(createEl(), {
        position: 'absolute',
        top: 1+~(o.width/2) + 'px',
        transform: 'translate3d(0,0,0)',
        opacity: o.opacity,
        animation: useCssAnimations && addAnimation(o.opacity, o.trail, i, o.lines) + ' ' + 1/o.speed + 's linear infinite'
      });
      if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}));
      ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')));
    }
    return el;
  };
  proto.opacity = function(el, i, val) {
    el.childNodes[i].style.opacity = val;
  };

  /////////////////////////////////////////////////////////////////////////
  // VML rendering for IE
  /////////////////////////////////////////////////////////////////////////

  /** 
   * Check and init VML support
   */
  (function() {
    var s = css(createEl('group'), {behavior: 'url(#default#VML)'}),
        i;

    if (!vendor(s, 'transform') && s.adj) {

      // VML support detected. Insert CSS rules ...
      for (i=4; i--;) sheet.addRule(['group', 'roundrect', 'fill', 'stroke'][i], 'behavior:url(#default#VML)');

      proto.lines = function(el, o) {
        var r = o.length+o.width,
            s = 2*r;

        function grp() {
          return css(createEl('group', {coordsize: s +' '+s, coordorigin: -r +' '+-r}), {width: s, height: s});
        }

        var g = grp(),
            margin = ~(o.length+o.radius+o.width)+'px',
            i;

        function seg(i, dx, filter) {
          ins(g,
            ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
              ins(css(createEl('roundrect', {arcsize: 1}), {
                  width: r,
                  height: o.width,
                  left: o.radius,
                  top: -o.width>>1,
                  filter: filter
                }),
                createEl('fill', {color: o.color, opacity: o.opacity}),
                createEl('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          );
        }

        if (o.shadow) {
          for (i = 1; i <= o.lines; i++) {
            seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');
          }
        }
        for (i = 1; i <= o.lines; i++) {
          seg(i);
        }
        return ins(css(el, {
          margin: margin + ' 0 0 ' + margin
        }), g);
      };
      proto.opacity = function(el, i, val, o) {
        o = o.shadow && o.lines || 0;
        el.firstChild.childNodes[i+o].firstChild.firstChild.opacity = val;
      };
    }
    else {
      useCssAnimations = vendor(s, 'animation');
    }
  })();

  window.Spinner = Spinner;

})(window, document);

