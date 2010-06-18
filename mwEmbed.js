// Add support for html5 / mwEmbed elements to IE ( comment must come before js code ) 
// For discussion and comments, see: http://remysharp.com/2009/01/07/html5-enabling-script/
/*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/

/**
 * @license
 * mwEmbed
 * Dual licensed under the MIT or GPL Version 2 licenses.
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

/**
* Set the mwEmbedVersion
*/
var MW_EMBED_VERSION = '1.1g';

// Globals to pre-set ready functions in dynamic loading of mwEmbed 
if( typeof preMwEmbedReady == 'undefined'){
	var preMwEmbedReady = [];	
}
// Globals to pre-set config values in dynamic loading of mwEmbed
if( typeof preMwEmbedConfig == 'undefined') {
	var preMwEmbedConfig = [];
}

/**
* The global mw object:
*/
( function( mw ) {
	// The version of mwEmbed
	mw.version = MW_EMBED_VERSION
	
	// List valid skins here:
	mw.validSkins = [ 'mvpcf', 'kskin' ];
		
	// Storage variable for loaded style sheet keys	
	mw.style = { };
	
	/**
	* Configuration System:  	
	*/	
		
	// Local scope configuration var:
	if( !mwConfig ){
		var mwConfig = { };
	}
	
	// Local scope mwUserConfig var. Stores user configuration 
	var mwUserConfig = { };
	
	/**
	* Setter for configuration values
	*
	* @param [Mixed] name Name of configuration value
	*	{Object} Will iderate through each key and call setConfig
	* 	{String} Will set configuration by string name to value
	* @param 
	* 	{String} value Value of configuration name
	* 	{Object} value Set of values to be merged 
	*/
	mw.setConfig = function ( name, value ) {
		if( typeof name == 'object' ) {
			for( var i in name ) {
				mw.setConfig( i, name[ i ] );
			}
			return ;
		}
		// Check if we should "merge" the config
		if( typeof value == 'object' && typeof mwConfig[ name ] == 'object' ) {
			for( var i in value ){
				mwConfig[ name ][ i ] = value[ i ];
			}
		} else {
			mwConfig[ name ] = value;
		}
	}
	
	/**
	* Set a default config value 
	* Will only update configuration if no value is present
	* @param [Mixed] value Set configuration name to value
	*	  {Object} Will iderate through each key and call setDefaultConfig
	* 	{String} Will set configuration by string name to value
	*/
	mw.setDefaultConfig = function( name, value ) {	
		if( typeof name == 'object' ) {
			for( var i in name ) {
				mw.setDefaultConfig( i, name[ i ] ); 
			}
			return ;
		}	
		// Only update the controls if undefined ( ie don't override false properties )
		if( typeof mwConfig[ name ] == 'undefined') {
			mwConfig[ name ] = value;
		}
	}
	
	/**
	* Getter for configuration values
	*
	* @param {String} name of configuration value to get
	* @return {Mixed} value of configuration key
	* 	returns "false" if key not found
	*/
	mw.getConfig = function ( name ) {
		if( mwConfig[ name ] )
			return mwConfig[ name ];
		return false;
	}

	/**
	* Loads the mwUserConfig from a cookie.
	* 
	* Modules that want to use "User Config" should call
	* this setup function in their moduleLoader code. 
	*
	* For performance interfaces using "user config" 
	*  should load '$j.cookie' & 'JSON' in their module loader
	*
	* By abstracting user preference we could eventually integrate 
	*  a persistent per-account preference system on the server.
	*
	* @parma {Function} callback Function to be called once userPrefrences are loaded 
	*/
	var setupUserConfigFlag = false;
	mw.setupUserConfig = function( callback ) {	
		if( setupUserConfigFlag ) {
			if( callback ) { 
				callback();
				}
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
	}

	/**
	* Save a user configuration var to a cookie & local global variable
	* Loads the cookie plugin if not already loaded
	*
	* @param {String} name Name of user configuration value
	* @param {String} value Value of configuration name 	
	*/
	mw.setUserConfig = function ( name, value, cookieOptions ) {
		if( ! setupUserConfigFlag ) { 
			mw.log( "Error: userConfig not setup" );
			return false; 		
		}		
		// Update local value
		mwUserConfig[ name ] = value;
		
		// Update the cookie ( '$j.cookie' & 'JSON' should already be loaded )			
		$j.cookie( 'mwUserConfig', JSON.stringify( mwUserConfig ) );
	}
	
	/**
	* Save a user configuration var to a cookie & local global variable
	*
	* @param {String} name Name of user configuration value
	* @return 
	*	value of the configuration name
	* 	false if the configuration name could not be found
	*/	
	mw.getUserConfig = function ( name ) {
		if( mwUserConfig[ name ] )
			return mwUserConfig[ name ];
		return false;
	}
	
	/**
	* Add a hook system for a target object / interface	
	*
	* This can be used as an alternative to heavy inheritance systems.
	*
	* @param {Object} targetObj Interface Object to add hook system to.   
	*/
	mw.addHookSystem = function( targetObj ) {
	
		// Setup the target object hook holder:
		targetObj[ 'hooks' ] = { };
		 
		/**
		* Adds a hook to the target object
		* 
		* Should be called by clients to setup named hooks
		*
		* @param {String} hookName Name of hook to be added
		* @param {Function} hookFunction Function to be called at hook time
		*/
		targetObj.addHook = function( hookName, hookFunction ) {
			if( ! this.hooks[ hookName ] ) {
				this.hooks[ hookName ] = [ ];
			}
			this.hooks[ hookName ].push( hookFunction )
		}
		
		/**
		* Runs all the hooks by a given name with reference to the host object
		*
		* Should be called by the host object at named execution points 
		* 
		* @param {String} hookName Name of hook to be called
		* @return Value of hook result 
		* 	true interface should continue function execution
		*	false interface should stop or return from method
		*/
		targetObj.runHook = function( hookName, options ) {
			if( this.hooks[ hookName ] ) {
				for( var i =0; i < this.hooks[ hookName ].length; i ++ ) {
					if( typeof( this.hooks[ hookName ][ i ] ) == 'function' ) {
						this.hooks[ hookName ][ i ]( options );
					}
				}
			}
		}
	} 
	
	// Add hooks system to the core "mw" object
	mw.addHookSystem( mw );
	
	// Stores callbacks for script-loader loading
	var mwLoadDoneCB = { };
	
	
	/**
	* Top level loader prototype:
	*/
	mw.loader = {
		/*
		* Javascript Module Loader functions 
		* @key Name of Module
		* @value function code to load module 
		*/
		moduleLoaders : { },
		
		/**
		* Javascript Class Paths
		* @key Name of class
		* @value Class file path 
		*/
		classPaths : { }, 			
		
		/**
		* javascript Class Paths
		* @key Name of class
		* @value Name of depenent style sheet
		*/
		classStyleDependency: { },		
		
		/**
		* Core load function: 
		* 
		* @param {Mixed} loadRequest:
		* 
		* 	{String} Name of a module to be loaded
		* 		Modules are added via addModuleLoader and can define custom
		* 		code needed to check config and load the module dependencies
		*
		*	{String} Name of a class to loaded. 
		* 		Classes are added via addResourcePaths function
		*		Using defined class names avoids loading the same class
		*		twice by first checking if the "class variable" is defined
		*	
		*	{String} Absolute or relative to url path
		*		The same file won't be loaded twice
		*
		*	{Array} can be an array of any combination of the above strings.
		*		Will be loaded in-order or in a single script-loader request 
		*		if scriptLoader is available.  
		*
		* 	{Array} {Array} Can be a set of Arrays for loading.		 
		*		Some browsers execute included scripts out of order. 
		* 		This lets you chain sets of request for those browsers.
		*		If using the server side script-loader order is preserved 
		* 			in output and a single request will be used.
		*
		* @param {Function} callback Function called once loading is complete
		*/				
		load: function( loadRequest, instanceCallback ) {
			// Ensure the callback is only called once per load instance 
			var callback = function(){
				//mw.log( 'instanceCallback::running callback: ' + instanceCallback );
				if( instanceCallback ){
					instanceCallback( loadRequest );
					instanceCallback = null;
				}
			}
			
			// Check for empty loadRequest ( directly return the callback ) 
			if( mw.isEmpty( loadRequest ) ) {
				mw.log( 'Empty load request: ' + loadRequest );
				callback( loadRequest );
				return ;
			}									
			
			
			// Check if its a multi-part request: 
			if( typeof loadRequest == 'object' ) {
			 	if( loadRequest.length > 1 ) {			 							
					this.loadMany ( loadRequest,  callback );
					return ;
				}else{
					// If an array of length 1 set as first element 
					loadRequest = loadRequest[0];
				}				
			}   					
			
			// Check for the module name loader function 
			if( this.moduleLoaders[ loadRequest ] && 
				typeof ( this.moduleLoaders[ loadRequest ] ) == 'function' 
			) {
				//mw.log("mw.load: loadModule:" + loadRequest );
				// Run the module with the parent callback 
				this.moduleLoaders[ loadRequest ]( callback );	
				return ;
			}
			
			// Check for javascript class 
			if( this.getClassPath( loadRequest ) ) {		
				//mw.log('mw.load: loadClass: ' + loadRequest );
				this.loadClass( loadRequest, callback );																	
				return ;
			}
			
			// Try loading as a "file" or via ScriptLoader
			if( loadRequest ) { 				
				if( loadRequest.indexOf( '.js' ) == -1 && !mw.getScriptLoaderPath() ) {
					mw.log( 'Error: are you sure ' + loadRequest + ' is a file ( is it missing a class path? ) ' );
				}				
				mw.getScript( loadRequest, callback );
				return ;
			}
			
			// Possible error? 
			mw.log( "Error could not handle load request: " + loadRequest  );			
		},
			
		/**
		* Load a set of scripts.
		* Will issue many load requests or package the request for the script-loader
		*
		* @param {Object} loadSet Set of scripts to be loaded
		* @param {Function} callback Function to call once all scripts are loaded.
		*/ 
		loadMany: function( loadSet, callback ) {				
			var _this = this;
			// Setup up the local "loadStates"			
			var loadStates = { };
					
			// Check if we can load via the "script-loader" ( mwEmbed was included via scriptLoader ) 
			if( mw.getScriptLoaderPath() ) {							
				// Get the grouped loadStates variable 
				loadStates = this.getGroupLoadState( loadSet );
				if( mw.isEmpty( loadStates ) ) {
					//mw.log( 'loadMany:all classes already loaded');
					callback();
					return ;
				}						
			}else{									
				// Check if its a dependency set ( nested objects ) 
				if( typeof loadSet [ 0 ] == 'object' ) {		
					_this.dependencyChainCallFlag[ loadSet ] = false;
					//Load sets of classes ( to preserver order for some browsers )
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
			//mw.log("mw.load: LoadMany:: " + loadSet );
						
			// Issue the load request check check loadStates to see if we are "done"
			for( var loadName in loadStates ) {				
				//mw.log("loadMany: load: " + loadName ); 					
				this.load( loadName, function ( loadName ) {										
					loadStates[ loadName ] = 1;
					
					/*
					for( var i in loadStates ) {
						mw.log( loadName + ' finished of: ' + i + ' : ' + loadStates[i]   );
					}
					*/
					
					//Check if all load request states are set 1					
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
		* Groups the scriptRequest where possible: 
		* 	Modules include "loader code" so they are separated
		* 	into pre-condition code to be run for subsequent requests
		*
		* @param {Object} loadSet Loadset to return grouped
		* @return {Object}
		*	grouped loadSet
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
			for( var i=0; i < groupedLoadSet.length; i++ ) {										
				var loadName = groupedLoadSet[ i ];	
								
				
				if( this.getClassPath( loadName )  ) {
					// Only add to group request if not already set: 
					if ( !mw.isset( loadName ) ) {
						groupClassKey += coma + loadName
						coma = ',';
						
						// Check for style sheet dependencies
						if( this.classStyleDependency[ loadName ] ){
							groupClassKey += coma + this.classStyleDependency[ loadName ];
						}						
					}					
				} else if ( this.moduleLoaders[ loadName ] ) {
					
					// Module loaders break up grouped script requests ( add the current groupClassKey )
					if( groupClassKey != '' ) {
						loadStates[ groupClassKey ] = 0;
						groupClassKey = coma = '';
					}
					// Add the module to the loadSate
					loadStates[ loadName ] = 0;
				}					
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
		* Load a sets of scripts satisfy dependency order for browsers that execute 
		* dynamically included scripts out of order
		* 
		* @param {Object} loadChain A set of javascript arrays to be loaded. 
		*	Sets are requested in array order. 		   
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
		* Loads javascript associated with a className
		*
		* @param {String} className Name of class to load
		* @param {Function} callback Function to run once class is loaded 
		*/
		loadClass: function( className , callback) {		
			var _this = this;		
			// Check for css depedency on class name 
			if( this.classStyleDependency[ className ] ) {				
				if( ! mw.isset( this.classStyleDependency[ className ] )){
					mw.log(" load dependent css class: "  + this.classStyleDependency[ className ]  );
					_this.loadClass(  this.classStyleDependency[ className ] , function(){
						// Continue the orginal loadClass request. 
						_this.loadClass( className, callback );
					});
					return ;
				}
			}
			
			// Make sure the class is not already defined:
			if ( mw.isset( className ) ) {
				//mw.log( 'Class ( ' + className + ' ) already defined ' );
				callback( className );
				return ; 									
			}
			
			// Setup the Script Request var: 
			var scriptRequest = null;						
			
			
			// If the scriptloader is enabled use the className as the scriptRequest: 
			if( mw.getScriptLoaderPath() ) {		
				scriptRequest =  className;
			}else{
				// Get the class url:
				var baseClassPath = this.getClassPath( className );													
				// Add the mwEmbed path if not a root path or a full url
				if( baseClassPath.indexOf( '/' ) !== 0 && 
					baseClassPath.indexOf( '://' ) === -1 ) {
					scriptRequest = mw.getMwEmbedPath() + baseClassPath;
				}else{
					scriptRequest = baseClassPath;
				}				
				if( ! scriptRequest ) {
					mw.log( "Error Could not get url for class " + className  );						
					return false;
				}	
			}			
			// Include class defined check for older browsers
			var classDone = false;
			
			// Set the loadDone callback per the provided className				
			mw.setLoadDoneCB( className, callback );
						
			// Issue the request to load the class (include class name in result callback:					
			mw.getScript( scriptRequest, function( scriptRequest ) {
			
				// If its a "style sheet" manually set its class to true
				var ext = scriptRequest.substr( scriptRequest.split('?')[0].lastIndexOf( '.' ), 4 ).toLowerCase();
				if( ext == '.css' &&	className.substr(0,8) == 'mw.style' ){				
					mw.style[ className.substr( 9 ) ] = true;
				}						
				
				// Send warning if className is not defined
				if(! mw.isset( className )
					&& mwLoadDoneCB[ className ] != 'done' ) {
					mw.log( 'Possible Error: ' + className +' not set in time, or not defined in:' + "\n" 
						+  _this.getClassPath( className ) );
				}
				
				// If ( debug mode ) and the script include is missing class messages
				// do a separate request to retrieve the msgs			
				if( mw.currentClassMissingMessages ) {
					mw.log( " className " + className + " is missing messages"  );
					// Reset the currentClassMissingMessages flag
					mw.currentClassMissingMessages = false;
					
					// Load msgs for this class: 
					mw.loadClassMessages( className, function() {						
						// Run the onDone callback 		
						mw.loadDone( className );
					} );
				} else { 				
					// If not using the script-loader make sure the className is available before firing the loadDone
					if( !mw.getScriptLoaderPath() ) {
						mw.waitForObject( className, function( className ) {														
							// Once object is ready run loadDone 
							mw.loadDone( className );
						} );
					} else {
						// loadDone should be appended to the bottom of the script-loader response 
						//mw.loadDone( className );
					}
				}
			} );							
		},				
		
		/**
		* Adds a module to the mwLoader object 
		*
		* @param {String} name Name of module
		* @param {Function} moduleLoader Function that
		*	loads dependencies for a module
		*/
		addModuleLoader: function( name, moduleLoader ) {		
			this.moduleLoaders [ name ] = moduleLoader;
		},
		
		/**
		* Adds class file path key value pairs
		*
		* @param {Object} classSet JSON formated list of 
		*  class name file path pairs.
		*
		*  classSet must be strict JSON to allow the 
		*  php scriptLoader to parse the file paths.  
	 	*/
	 	addResourcePaths: function( classSet ) {
	 		var prefix = ( mw.getConfig( 'loaderContext' ) )?
	 			mw.getConfig( 'loaderContext' ): '';
	 		
	 		for( var i in classSet ) {
				this.classPaths[ i ] = prefix + classSet[ i ];
			}			
	 	},
	 	
	 	/*
	 	* Adds a named style sheet dependency to a named class
	 	*  
	 	* @parma {Object} classSet JSON formated list of class names
	 	* 	and associated style sheet names
	 	*/	 	
	 	addClassStyleDependency: function( classSet ){
	 		for( var i in classSet ){
	 			this.classStyleDependency[ i ] = classSet[i];
	 		}
	 	},
	 	
	 	/**
	 	* Get a class path forom a className 
	 	* if no class found return false
	 	*/
	 	getClassPath: function( className ) {
	 		if( this.classPaths[ className ] )
	 			return this.classPaths[ className ]
	 		return false;
	 	}	 	
	}
	
	/**
	* Load done callback for script loader
	* @param {String} requestName Name of the load request
	*/	
	mw.loadDone =  function( requestName ) {				
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
				//mw.log( "LoadDone: " + requestName + ' run callback::' + func);
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
	* @param {String} requestName Name of class or request set
	* @param {Function} callback Function called once requestName is ready
	*/
	mw.setLoadDoneCB = function( requestName, callback ) {
		// If the requestName is already done loading just callback
		if( mwLoadDoneCB[ requestName ] == 'done' ) {
			callback( requestName )
		}
		// Setup the function queue if unset
		if( typeof mwLoadDoneCB[ requestName ] != 'object' ) {
			mwLoadDoneCB[ requestName ] = [];
		}
		mwLoadDoneCB[ requestName ].push( callback );		
	};
	
	/**
	* Shortcut entry points / convenience functions: 
	* Lets you write mw.load() instead of mw.loader.load()
	* only these entry points should be used. 
	*
	* future closure optimizations could minify internal
	* function names 
	*/
	
	/**
	* Load Object entry point: Loads a requested set of javascript 
	*/	
	mw.load = function( loadRequest, callback ) {
		return mw.loader.load( loadRequest, callback );
	}
	
	/**
	* Add module entry point: Adds a module to the mwLoader object 
	*/
	mw.addModuleLoader = function ( name, loaderFunction ) {
		return mw.loader.addModuleLoader( name, loaderFunction );		
	}
	
	/**
	* Add Class File Paths entry point:  
	*/
	mw.addResourcePaths = function ( classSet ) {	
		return mw.loader.addResourcePaths( classSet );
	}
	
	mw.addClassStyleDependency = function ( classSet ) {
		return mw.loader.addClassStyleDependency( classSet );
	}
	
	/**
	* Get Class File Path entry point: 
	*/
	mw.getClassPath = function( className ) {
		return mw.loader.getClassPath( className );
	}
	
	
	/**
	* API Helper functions
	*/
	
	/**
	* 
	* Helper function to get revision text for a given title
	* 
	* Assumes "follow redirects" 
	* 
	* $j.getTitleText( [apiUrl], title, callback )
	*  
	* @param {String} url or title key
	* @parma {Mixed} title or callback function
	* @param {Function} callback Function or NULL
	* 
	* @return callback is called with:
	* 	{Boolean} false if no page found 
	* 	{String} text of wiki page	 
	*/
	mw.getTitleText = function( apiUrl, title, callback ) {
		// Check if optional apiURL was not included
		if( !callback ) {
			title = apiUrl;
			callback = title;
			apiUrl = mw.getLocalApiUrl();
		}
		var request = {
			// Normalize the File NS (ie sometimes its present in apiTitleKey other times not
			'titles' : title,
		    'prop' : 'revisions',
		    'rvprop' : 'content'
		};	
		
		mw.getJSON( apiUrl , request, function( data ) {			
			if( !data || !data.query || !data.query.pages ) {
				callback( false );	
			}
			var pages = data.query.pages;			
			for(var i in pages) {
				page = pages[ i ];
				if( page[ 'revisions' ] && page[ 'revisions' ][0]['*'] ) {
					callback( page[ 'revisions' ][0]['*'] );
				}
			}
		} );
	}		
	
	/**
	* Issues the wikitext parse call 
	* 
	* @param {String} wikitext Wiki Text to be parsed by mediaWiki api call
	* @param {String} title Context title of the content to be parsed
	* @param {Function} callback Function called with api parser output 
	*/
	mw.parseWikiText = function( wikitext, title, callback ) {	
		mw.log("mw.parseWikiText text length: " + wikitext.length + ' title context: ' + title );
		mw.load( 'JSON', function(){
			$j.ajax({
				type: 'POST',
				url: mw.getLocalApiUrl(),
				// Give the wiki 60 seconds to parse the wiki-text
				timeout : 60000,
				data: {
					'action': 'parse',
					'format': 'json',
					'title' : title,
					'text': wikitext				
				},
				dataType: 'text',
				success: function( data ) {
					var jsonData = JSON.parse( data ) ;
					// xxx should handle other failures				 
					callback( jsonData.parse.text['*'] );
				},
				error: function( XMLHttpRequest, textStatus, errorThrown ){
					// xxx should better handle failures		
					mw.log( "Error: mw.parseWikiText:" + textStatus );
					callback(  "Error: failed to parse wikitext " ); 
				}			 
			});
		});
	}
	
	/**
	* mediaWiki JSON a wrapper for jQuery getJSON:
	* ( could also be named mw.apiRequest )
	* 
	* The mwEmbed version lets you skip the url part 
	* mw.getJSON( [url], data, callback, [timeoutCallback] ); 
	* 
	* Lets you assume:
	* 	url is optional 
	* 		( If the first argument is not a string we assume a local mediaWiki api request )
	*   callback parameter is not needed for the request data
	* 	url param 'action'=>'query' is assumed ( if not set to something else in the "data" param
	* 	format is set to "json" automatically
	* 	automatically issues request over "POST" if the request api post type
	*	automatically will setup apiProxy where request is cross domain
	*
	* @param {Mixed} url or data request
	* @param {Mixed} data or callback
	* @param {Function} callbcak function called on success
	* @param {Function} callbackTimeout - optional function called on timeout
	* 	Setting timeout callback also avoids default timed-out dialog for proxy requests
	*/	
	mw.getJSON = function() {
		// Proccess the arguments: 
		
		// Set up the url			
		var url = false;
		url = ( typeof arguments[0] == 'string' ) ? arguments[0] : mw.getLocalApiUrl();		
		
		// Set up the data: 
		var data = null;
		data = ( typeof arguments[0] == 'object' ) ? arguments[0] : null;
		if( !data && typeof arguments[1] == 'object' ) {
			data = arguments[1];
		} 
		
		// Setup the callback
		var callback = false;
		callback = ( typeof arguments[1] == 'function') ? arguments[1] : false;		
		var cbinx = 1;
		if( ! callback && ( typeof arguments[2] == 'function') ) {
			callback = arguments[2];
			cbinx = 2;	
		}		
		
		// Setup the timeoutCallback ( function after callback index )
		var timeoutCallback = false;
		timeoutCallback = ( typeof arguments[ cbinx + 1 ] == 'function' ) ? arguments[ cbinx + 1 ] : false;		
				
		// Make sure we got a url:
		if( !url ) { 
			mw.log( 'Error: no api url for api request' );
			return false;
		}		
		
		// Add default action if unset:
		if( !data['action'] ) {
			data['action'] = 'query';
		}
		
		// Add default format if not set:
		if( !data['format'] ) { 
			data['format'] = 'json';
		}
		
		// Setup callback wrapper for timeout
		var requestTimeOutFlag = false;
		var ranCallback = false;
		
		/**
		 * local callback function to control timeout
		 * @param {Object} data Result data
		 */
		var myCallback = function( data ){			
			if( ! requestTimeOutFlag ){
				ranCallback = true;
				callback( data );
			}
		} 		
		// Set the local timeout call based on defaultRequestTimeout
		setTimeout( function( ) {
			if( ! ranCallback ) {
				requestTimeOutFlag = true;
				mw.log( "Error:: request timed out: " + url );			
				if( timeoutCallback ){	
					timeoutCallback();
				}
			}
		}, mw.getConfig( 'defaultRequestTimeout' ) * 1000  );
		
		mw.log("run getJSON: " + mw.replaceUrlParams( url, data ) );
				
		// Check if the request requires a "post" 
		if( mw.checkRequestPost( data )  ) {
		
			// Check if we need to setup a proxy
			if( ! mw.isLocalDomain( url ) ) {
					
				//Set local scope ranCallback to true 
				// ( ApiProxy handles timeouts internally )
				ranCallback = true;
		
				// Load the proxy and issue the request
				mw.load( 'ApiProxy', function( ) {
					mw.ApiProxy.doRequest( url, data, callback, timeoutCallback);				
				} );
								
			} else {
							
				// Do the request an ajax post 
				$j.post( url, data, myCallback, 'json');				
			}
			return ;
		}
		
		// If cross domain setup a callback: 
		if( ! mw.isLocalDomain( url ) ) {				 
			if( url.indexOf( 'callback=' ) == -1 || data[ 'callback' ] == -1 ) {
				// jQuery specific jsonp format: ( second ? is replaced with the callback ) 
				url += ( url.indexOf('?') == -1 ) ? '?callback=?' : '&callback=?';
			}				 
		}		
		// Pass off the jQuery getJSON request:
		$j.getJSON( url, data, myCallback );			
	}
	
	/**
	* Checks if a mw request data requires a post request or not
	* @param {Object} 
	* @return {Boolean}
	*	true if the request requires a post request
	* 	false if the request does not
	*/		
	mw.checkRequestPost = function ( data ) {		
		if( $j.inArray( data['action'],  mw.getConfig( 'apiPostActions' ) ) != -1 ) {
			return true;
		}
		if( data['prop'] == 'info' && data['intoken'] ) {
			return true;			
		}
		if( data['meta'] == 'userinfo' ) {
			return true;
		}
		return false;
	}
	
	/**
	* Check if the url is a request for the local domain
	*  relative paths are "local" domain
	* @param {String} url Url for local domain
	* @return {Boolean}
	*	true if url domain is local or relative
	* 	false if the domain is
	*/
	mw.isLocalDomain = function( url ) {
		if( mw.parseUri( document.URL ).host == mw.parseUri( url ).host 
			|| url.indexOf( '://' ) == -1 ) 
		{
			return true;
		}
		return false;
	}
	
	/**
	 * Api helper to grab an edit token
	 *
	 * @param {String} [apiUrl] Optional target API URL (uses default local api if unset) 
	 * @param {String} title The wiki page title you want to edit	 
	 * @param {callback} callback Function to pass the token to. 
	 * 						issues callback with "false" if token not retrieved
	 */
	mw.getToken = function( apiUrl, title, callback ) {
		// Make the apiUrl be optional: 
		if( typeof title == 'function' ) {
			callback = title;
			title = apiUrl;
			apiUrl = mw.getLocalApiUrl();	
		}		
		
		mw.log( 'mw:getToken' );
		
		var request = {			
			'prop': 'info',
			'intoken': 'edit',
			'titles': title
		};
		mw.getJSON( apiUrl, request, function( data ) {
			for ( var i in data.query.pages ) {
				if ( data.query.pages[i]['edittoken'] ) {
					callback ( data.query.pages[i]['edittoken'] );	
					return ;				
				}
			}
			// No token found:
			callback ( false );
		} );
	}
	
	/**
	 * Api helper to grab the username
	 * @param {String} [apiUrl] Optional target API url (uses default local api if unset) 
	 * @param {Function} callback Function to callback with username or false if not found
	 * @param {Boolean} fresh A fresh check is issued.	 	
	 */
	 // Stub feature apiUserNameCache to avoid multiple calls 
	 // ( a more general api framework should be developed  ) 
	 var apiUserNameCache = {};
	 mw.getUserName = function( apiUrl, callback, fresh ){	 		 	
	 	if( typeof apiUrl == 'function' ){
	 		var callback = apiUrl;
	 		var apiUrl =  mw.getLocalApiUrl();	 		
	 	}
	 	
	 	// If apiUrl is local check wgUserName global
	 	//  before issuing the api request.
	 	if( mw.isLocalDomain( apiUrl ) ){	 		
	 		if( typeof wgUserName != 'undefined' &&  wgUserName !== null ) {
	 			callback( wgUserName )
	 			// In case someone called this function without a callback
	 			return wgUserName;
	 		}
	 	}
	 	if( ! fresh && apiUserNameCache[ apiUrl ]  ) {
	 		callback( apiUserNameCache[ apiUrl ]  );
	 		return ; 
	 	}
	 	
	 	// Setup the api request
		var request = {
			'action':'query',
			'meta':'userinfo'
		}
		
		// Do request 
		mw.getJSON( apiUrl, request, function( data ) {
			if( !data || !data.query || !data.query.userinfo || !data.query.userinfo.name ){
				// Could not get user name user is not-logged in
				mw.log( " No userName in response " );
				callback( false );
				return ;
			}
			// Check for "not logged in" id == 0
			if( data.query.userinfo.id == 0 ){
				callback( false );
				return ;
			}
			apiUserNameCache[ apiUrl ] = data.query.userinfo.name;
			// Else return the username: 
			callback( data.query.userinfo.name );				
		}, function(){
			// Timeout also results in callback( false ) ( no user found) 
			callback( false );
		} );
	}
	
	/**
	* Utility Functions
	*/		
	
	/**
	* addLoaderDialog
	*  small helper for displaying a loading dialog
	*
	* @param {String} dialogHtml text Html of the loader msg
	*/
	mw.addLoaderDialog = function( dialogHtml ) {
		$dialog = mw.addDialog( dialogHtml, dialogHtml + '<br>' + 
				$j('<div />')
				.loadingSpinner()
				.html() 
		);
		return $dialog;
	}
	
	/**
	 * Mobile Safari has special properties for html5 video::
	 * 
	 * NOTE: should be moved to browser detection script
	 */
	mw.isMobileSafari = function() {		
		// check mobile safari foce ( for debug )
		if( mw.getConfig( 'forceMobileSafari' ) ){
			return true;
		}
		if ((navigator.userAgent.indexOf('iPhone') != -1) || 
			(navigator.userAgent.indexOf('iPod') != -1) || 
			(navigator.userAgent.indexOf('iPad') != -1)) {
			return true;
		}
		return false;
	}
	
	/**
	* Add a (temporary) dialog window:
	* @param {String} title Title string for the dialog
	* @param {String} dialogHtml String to be inserted in msg box
	* @param {Mixed} buttonOption A button object for the dialog 
	*					Can be a string for the close buton
	*/
	mw.addDialog = function ( title, dialogHtml, buttons ) {
		$j( '#mwTempLoaderDialog' ).remove();
		
		// Append the style free loader ontop: 
		$j( 'body' ).append( 
			$j('<div />') 
			.attr( {
				'id' : "mwTempLoaderDialog",
				'title' : title
			})
			.css('display', 'none')
			.html( dialogHtml )
		);
		
		// Special buttons == ok gives empty give a single "oky" -> "close"
		if ( typeof buttons == 'string' ) {
			var buttonMsg = buttons;
			buttons = { };
			buttons[ buttonMsg ] = function() {
				$j( '#mwTempLoaderDialog' ).dialog( 'close' );
			}
		} 
		
		// Load the dialog classes
		mw.load([
			[
				'$j.ui'
			],
			[
				'$j.ui.dialog'
			]
		], function() {
			$j( '#mwTempLoaderDialog' ).dialog( {
				'bgiframe': true,
				'draggable': false,
				'resizable': false,
				'modal': true,
				'width':400,
				'buttons': buttons
			} );
		} );
		return $j( '#mwTempLoaderDialog' );
	}
	
	/**
	 * Close the loader dialog created with addLoaderDialog
	 */
	mw.closeLoaderDialog = function() {
		// Make sure the dialog class is present
		if( !mw.isset( '$j.ui.dialog' ) ) {
			return false;
		}
		$j( '#mwTempLoaderDialog' ).dialog( 'destroy' ).remove();
	}
	
	
	/**
	* Similar to php isset function checks if the variable exists.
	* Does a safe check of a descendant method or variable
	*
	* @param {String} objectPath
	* @return {Boolean}
	* 	true if objectPath exists
	*	false if objectPath is undefined
	*/	
	mw.isset = function( objectPath ) {
		if ( !objectPath ) {
			return false;
		}			
		var pathSet = objectPath.split( '.' );
		var cur_path = '';
				
		for ( var p = 0; p < pathSet.length; p++ ) {
			cur_path = ( cur_path == '' ) ? cur_path + pathSet[p] : cur_path + '.' + pathSet[p];
			eval( 'var ptest = typeof ( ' + cur_path + ' ); ' );
			if ( ptest == 'undefined' ) {			
				return false;
			}
		}
		return true;
	}
	
	/**
	* Wait for a object to be defined and the call the callback
	*
	* @param {Object} objectName Name of object to be defined
	* @param {Function} callback Function to call once object is defined
	* @param {Null} callNumber Used internally to keep track of 
	*	number of times waitForObject has been called 
	*/
	var waitTime = 1200; // About 30 seconds 
	mw.waitForObject = function( objectName, callback, _callNumber) {	
		//mw.log( 'waitForObject: ' + objectName  + ' cn: ' + _callNumber);		
				
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
			callback( objectName )
		}else{
			setTimeout( function( ) {
				mw.waitForObject( objectName, callback, _callNumber);
			}, 25);
		}
	}
	
	/**
	* Check if an object is empty or if its an empty string. 
	*
	* @param {Object} object Object to be checked
	*/ 
	mw.isEmpty = function( object ) {		
		if( typeof object == 'string' ) { 
			if( object == '' ) return true;
			// Non empty string: 
			return false;
		}
		
		// If an array check length:
		if( Object.prototype.toString.call( object ) === "[object Array]"
			&& object.length == 0 ) {
			return true;
		}
		
		// Else check as an object: 
		for( var i in object ) { return false; }
		
		// Else object is empty:
		return true;
	}
	
	/**
	* Log a string msg to the console
	* 
	* all mw.log statements will be removed on minification so
	* lots of mw.log calls will not impact performance in non debug mode
	*
	* @param {String} string String to output to console
	*/
	mw.log = function( string ) {

		// Add any prepend debug strings if necessary 		
		if ( mw.getConfig( 'pre-append-log' ) ){
			string = mw.getConfig( 'pre-append-log' ) + string;		
		}
		
		if ( window.console ) {
			window.console.log( string );
		} else {	
			/**
			 * Old IE and non-Firebug debug: ( commented out for now ) 
			 */
			/*
			var log_elm = document.getElementById('mv_js_log');
			if(!log_elm) {
				document.getElementsByTagName("body")[0].innerHTML = document.getElementsByTagName("body")[0].innerHTML +
					'<div style="position:absolute;z-index:500;bottom:0px;left:0px;right:0px;height:200px;">'+
					'<textarea id="mv_js_log" cols="120" rows="12"></textarea>'+
					'</div>';
	
				var log_elm = document.getElementById('mv_js_log');
			}
			if(log_elm) {
				log_elm.value+=string+"\n";
			}
			*/
			
		}
	}
	
	//Setup the local mwOnLoadFunctions array: 
	var mwOnLoadFunctions = [];
	
	//mw Ready flag ( set once mwEmbed is ready ) 
	var mwReadyFlag = false;
	
	/**
	* Enables load hooks to run once mwEmbeed is "ready" 
	* Will ensure jQuery is available, is in the $j namespace 
	* and mw interfaces and configuration has been loaded and applied
	* 
	* This is different from jQuery(document).ready() 
	* ( jQuery ready is not friendly with dynamic includes
	*  and not friendly with core interface asynchronous build out. ) 
	*
	* @param {Function} callback Function to run once DOM and jQuery are ready
	*/
	mw.ready = function( callback ) {						
		if( mwReadyFlag === false ) {		
			// Add the callbcak to the onLoad function stack
			mwOnLoadFunctions.push ( callback );						
		} else { 
			// If mwReadyFlag is already "true" issue the callback directly:
			callback();
		}		
	}	
	
	/**
	* Runs all the queued functions
	* called by mwEmbedSetup
	*/ 
	mw.runReadyFunctions = function ( ) {
		// run any pre-setup ready functions		
		while( preMwEmbedReady.length ){
			preMwEmbedReady.shift()();
		}
		
		// Run all the queued functions: 
		while( mwOnLoadFunctions.length ) {
			mwOnLoadFunctions.shift()();
		}
		
		// Sets mwReadyFlag to true so that future addOnLoadHook calls 
		//  know to call the callback directly
		mwReadyFlag = true;
	}
	
	
	/**
	* Wrapper for jQuery getScript, 
	* Uses the scriptLoader if enabled
	* 
	*
	* @param {String} scriptRequest The requested path or classNames for the scriptLoader
	* @param {Function} callback Function to call once script is loaded   
	*/
	mw.getScript = function( scriptRequest, callback ) {
		// Setup the local scope callback instace 
		var myCallback = function(){
			if( callback ) {
				callback( scriptRequest );
			}
		}
		// Set the base url based scriptLoader availability & type of scriptRequest
		// ( presently script loader only handles "classes" not relative urls: 
		var scriptLoaderPath = mw.getScriptLoaderPath();
		
		// Check if its a class name, ( ie does not start with "/" and does not include :// 
		var isClassName = ( scriptRequest.indexOf('://') == -1 && scriptRequest.indexOf('/') !== 0 )? true : false; 
	
		var ext = scriptRequest.substr( scriptRequest.lastIndexOf( '.' ), 4 ).toLowerCase();
		var isCssFile = ( ext == '.css') ? true : false ;
		
		if( scriptLoaderPath &&  isClassName ) {
			url = scriptLoaderPath + '?class=' + scriptRequest;				
		} else {
			// Add the mwEmbed path if a relative path request
			url = ( isClassName ) ? mw.getMwEmbedPath() : '';
			url+= scriptRequest; 
		}
	
		// Add on the request parameters to the url:
		url += ( url.indexOf( '?' ) == -1 )? '?' : '&';				
		url += mw.getUrlParam();		
			
		// Only log sciprts ( Css is logged via "add css" )
		if( !isCssFile ){		
			mw.log( 'mw.getScript: ' + url );
		}
		
		// If jQuery is available and debug is off load the scirpt via jQuery 
		//( will use XHR if on same domain ) 
		if( mw.isset( 'window.jQuery' ) 
			&& mw.getConfig( 'debug' ) === false 
			&& typeof $j != 'undefined'
			&& !isCssFile ) 
		{	
			$j.getScript( url, myCallback); 		
			return ;
		}	
				
		/**
		* No jQuery 
		*  OR 
		* In debug mode
		*  OR
		* Is css file
		*
		* :: inject the script instead of doing an XHR eval
		*/			
		
		// load style sheet directly if requested loading css
		if( isCssFile ){
			mw.getStyleSheet( url, myCallback);
			return ;
		}
		
		// Load and bind manually:  ( copied from jQuery ajax function )
		var head = document.getElementsByTagName("head")[ 0 ];
		var script = document.createElement("script");
		script.setAttribute( 'src', url );		
			
		// Attach handlers ( if using script loader it issues onDone callback as well )	 		
		script.onload = script.onreadystatechange = function() {		
			if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
				myCallback();
			}
		};
		//mw.log(" append script: " + script.src );
		// Append the script to the DOM:
		head.appendChild( script );
	};
	
	/**
	* Add a style sheet string to the document head
	*
	* @param {String} cssClassName Name of style sheet that has been defined
	* @param {String} cssString Css Payload to be added to head of document
	*/
	mw.addStyleString = function( cssClassName, cssString ) {			
		if( mw.style[ cssClassName ] ) {
			mw.log(" Style: ( " + cssClassName + ' ) already set' );
			return true;
		}
		// Set the style to true ( to not request it again )
		mw.style[ cssClassName ] = true;
		// Add the spinner directly ( without jQuery in case we have to dynamically load jQuery ) 
		mw.log( 'Adding style:' + cssClassName + " to dom " );
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
	*	{String} url Url of the style sheet to be loaded
	* 	{Function} callback Function called once sheet is ready 
	*/
	mw.getStyleSheet = function( url , callback) {		
		// Add URL params ( if not already included )
		if ( url.indexOf( '?' ) == -1 ) {
			url += '?' + mw.getUrlParam();
		}
		
		// Check if style sheet is already included:
		var foundSheet = false; 
		$j( 'link' ).each( function() {
			var currentSheet = $j( this) .attr( 'href' );
			var sheetParts = currentSheet.split('?');		
			var urlParts = url.split('?');
			//if the base url's match check the parameters:
			if( sheetParts[0] == urlParts[0] && sheetParts[1]) {			
				//Check if url params match ( sort to do string compare )						
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
		
		mw.log( ' add css: ' + url );		
		$j( 'head' ).append( 
			$j('<link />').attr( {
				'rel' : 'stylesheet',
				'type' : 'text/css',
				'href' : url
			} )
		);
		// No easy way to check css "onLoad" attribute 
		// In production sheets are loaded via script-loader and fire the onDone function call.  
		if( callback ) {
			callback();
		}
	};
	
	/**
	* Get the api url for a given content provider key
	* @return {Mixed}
	*	url for the provider
	* 	local wiki api if no apiProvider is set
	*/ 
	mw.getApiProviderURL = function( providerId ) {		
		if( mw.getConfig( providerId + '_apiurl') ) {
			return mw.getConfig( providerId + '_apiurl');
		}
		return mw.getLocalApiUrl(); 
	};
	
	/** 
	* Get Api URL from mediaWiki page defined variables
	* @return {Mixed}
	* 	api url
	* 	false
	*/
	mw.getLocalApiUrl = function() {
		if ( typeof wgServer != 'undefined' && typeof wgScriptPath  != 'undefined' ) {
			return wgServer + wgScriptPath + '/api.php';
		}
		return false;
	};
	
	// Local mwEmbedPath variable ( for cache of mw.getMwEmbedPath )
	var mwEmbedPath = null;
				
	/**
	* Get the path to the mwEmbed folder
	*/
	mw.getMwEmbedPath = function() {
		if ( mwEmbedPath ) {
			return mwEmbedPath;
		}	
			
		// Get mwEmbed src:
		var src = mw.getMwEmbedSrc();
		var mwpath = null;
		
		// Check for direct include of the mwEmbed.js
		if ( src.indexOf( 'mwEmbed.js' ) !== -1 ) {
			mwpath =  src.substr( 0, src.indexOf( 'mwEmbed.js' ) );			
		}
		
		// Check for scriptLoader include of mwEmbed: 
		if ( src.indexOf( 'mwResourceLoader.php' ) !== -1 ) {
			// Script loader is in the root of MediaWiki, Include the default mwEmbed extension path:
			mwpath =  src.substr( 0, src.indexOf( 'mwResourceLoader.php' ) ) + mw.getConfig( 'mediaWikiEmbedPath' );						
		}
		
		// Script-loader has ResourceLoader name when local:
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
		mwEmbedPath = mw.absoluteUrl( mwpath )	;			
		return mwEmbedPath;
	}
	
	/**
	* Get Script loader path 
	*
	* @returns {String}|{Boolean}
	* 	Url of the scriptLodaer
	*	false if the scriptLoader is not used
	*/
	mw.getScriptLoaderPath = function( ) {		
		var src = mw.getMwEmbedSrc();
		if ( src.indexOf( 'mwResourceLoader.php' ) !== -1  ||
			src.indexOf( 'ResourceLoader.php' ) !== -1 )
		{
			// Return just the script part of the url
			return src.split('?')[0];						
		}
		return false;
	}	
	
	/**
	 * Given a float number of seconds, returns npt format response. 
	 * ( ignore days for now )
	 *
	 * @param {Float} sec Seconds
	 * @param {Boolean} show_ms If milliseconds should be displayed.
	 * @return {Float} String npt format  
	 */
	mw.seconds2npt = function( sec, show_ms ) {
		if ( isNaN( sec ) ) {
			mw.log("Warning: trying to get npt time on NaN:" + sec);			
			return '0:00:00';
		}
		
		var tm = mw.seconds2Measurements( sec )
				
		// Round the number of seconds to the required number of significant digits
		if ( show_ms ) {
			tm.seconds = Math.round( tm.seconds * 1000 ) / 1000;
		} else {
			tm.seconds = Math.round( tm.seconds );
		}
		if ( tm.seconds < 10 )
			tm.seconds = '0' +	tm.seconds;
		if ( tm.minutes < 10 )
			tm.minutes = '0' + tm.minutes;
	
		return tm.hours + ":" + tm.minutes + ":" + tm.seconds;
	}
	
	/**
	 * Given seconds return array with 'days', 'hours', 'min', 'seconds' 
	 * @param {float} sec Seconds to be converted into time measurements  
	 */
	mw.seconds2Measurements = function ( sec ){
		var tm = {};
		tm.days = Math.floor( sec / ( 3600 * 24 ) )
		tm.hours = Math.floor( sec / 3600 );
		tm.minutes = Math.floor( ( sec / 60 ) % 60 );
		tm.seconds = sec % 60;
		return tm;
	}
	
	/**
	* Take hh:mm:ss,ms or hh:mm:ss.ms input, return the number of seconds
	*
	* @param {String} npt_str NPT time string
	* @return {Float} Number of seconds 
	*/
	mw.npt2seconds = function ( npt_str ) {
		if ( !npt_str ) {
			// mw.log('npt2seconds:not valid ntp:'+ntp);
			return false;
		}
		// Strip {npt:}01:02:20 or 32{s} from time  if present
		npt_str = npt_str.replace( /npt:|s/g, '' );
	
		var hour = 0;
		var min = 0;
		var sec = 0;
	
		times = npt_str.split( ':' );
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
	}	
	
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
					( src.indexOf( 'mwEmbed.js' ) !== -1 &&  src.indexOf( 'MediaWiki:Gadget') == -1 )
				 	|| // Check for script-loader				 	
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
	}	
	
	// Local mwUrlParam variable ( for cache of mw.getUrlParam )
	var mwUrlParam = null;
	
	/**
	* Get URL Parameters per parameters in the host script include
	*/
	mw.getUrlParam = function() {
		if ( mwUrlParam )
			return mwUrlParam;
			
		var mwEmbedSrc = mw.getMwEmbedSrc();		
		var req_param = '';
		
		// If we already have a URI, add it to the param request:
		var urid = mw.parseUri( mwEmbedSrc ).queryKey['urid']
		
		// If we're in debug mode, get a fresh unique request key and pass on "debug" param
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
	}
	
	/** 
	* Replace url parameters via newParams key value pairs
	* 
	* @param {String} url Source url to be updated
	* @param {Object} newParams key, value paris to swap in
	* @return {String}
	*	the updated url
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
		for ( var key in  parsedUrl.queryKey ) {
			var val = parsedUrl.queryKey[ key ];		
			new_url += amp + key + '=' + val;
			amp = '&';
		}
		return new_url;
	}
	
	/**
	* parseUri 1.2.2
	* (c) Steven Levithan <stevenlevithan.com>
	*  MIT License
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
		q:   {
			name:   "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};	
	
	/**
	* getAbsoluteUrl takes a src and returns the absolute location given the document.URL
	*
	* @param {String} src path or url
	* @return {String} absolute url
	*/
	mw.absoluteUrl = function( src, contextUrl ) {
		var parsedSrc =  mw.parseUri( src );		
		// Source is already absolute return:
		if( parsedSrc.protocol != '') {
			return src;				
		}
		
		// Get parent Url location the context URL	
		if( contextUrl) {	
			var parsedUrl = mw.parseUri( contextUrl );			
		} else {
			var parsedUrl = mw.parseUri( document.URL );
		}
		
		// Check for leading slash: 
		if( src.indexOf( '/' ) === 0 ) {
			return parsedUrl.protocol + '://' + parsedUrl.authority + src;
		}else{
			return parsedUrl.protocol + '://' + parsedUrl.authority + parsedUrl.directory + src;
		}
	};	
	
	/**
	 * Escape quotes in a text string
	 * @param {String} text String to be escaped
	 * @return {string} 
	 * 	escaped text string  
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
	 * @param {String} text String to be escaped
	 * @return {string} 
	 * 	escaped text html string  
	 */
	mw.escapeQuotesHTML = function( text ) {
		var re = new RegExp('&',"g");
		text = text.replace(re,"&amp;");
		re = new RegExp('"',"g");
		text = text.replace(re,"&quot;");
		re = new RegExp('<',"g");
		text = text.replace(re,"&lt;");
		re = new RegExp('>',"g");
		text = text.replace(re,"&gt;");
		return text;
	};
	
		
	// Array of setup functions
	var mwSetupFunctions = [];
	
	/**
	* Add a function to be run during setup ( prior to mw.ready) 
	* this is useful for building out interfaces that 
	* should be ready before mw.ready is called. 
	*
	* @param {callback} Function Callback function must
	* 	 accept a ready function callback to be called once 
	* 	 setup is done    
	*/
	mw.addSetupHook = function( callback ) {
		mwSetupFunctions.push ( callback ) ;
	};
	
	/**
	* One time "setup" for mwEmbed 
	* run onDomReady ( so calls to setConfg apply to setup )
	*/
	// Flag to ensure setup is only run once:
	var mwSetupFlag = false;	
	mw.setupMwEmbed = function ( ) {			
		// Only run the setup once: 
		if( mwSetupFlag ) {
			return ;
		}				 
		mwSetupFlag = true;			
		
		// Apply any pre-setup config: 		
		mw.setConfig( preMwEmbedConfig );			
		
		
		mw.log( 'mw:setupMwEmbed SRC:: ' + mw.getMwEmbedSrc() );			
		
		// Check core mwEmbed loader.js file ( to get configuration and paths )
		mw.checkCoreLoaderFile( function(){						
			// Make sure we have jQuery 
			mw.load( 'window.jQuery', function() {	
				
				// Add jQuery to $j var. 
				if ( ! window[ '$j' ] ) {
					window[ '$j' ] = jQuery.noConflict();				
				}
				
				// Get module loader.js, and language files 
				// ( will hit callback directly if set via script-loader ) 
				mw.checkModuleLoaderFiles( function() { 
					
					// Set the User language
					if( typeof wgUserLanguage != 'undefined' && mw.isValidLang( wgUserLanguage) ) {				
						mw.setConfig( 'userLanguage', wgUserLanguage )
					}else{
						// Grab it from the included url
						var langKey = mw.parseUri( mw.getMwEmbedSrc() ).queryKey['uselang'];
						if ( langKey && mw.isValidLang( langKey ) ) {	
							mw.setConfig( 'userLanguage', langKey);
						}
					}					
					
					// Update the image path 
					mw.setConfig( 'imagesPath', mw.getMwEmbedPath() + 'skins/common/images/' );	
					
					// Set up AJAX to not send dynamic URLs for loading scripts
					$j.ajaxSetup( {
						cache: true
					} );
					
					// Update the magic keywords 		
					mw.Language.magicSetup();
					
					// Set up mvEmbed utility jQuery bindings
					mw.dojQueryBindings();					
					
					
					// Special Hack for conditional jquery ui inclusion ( once Usability extension
					//  registers the jquery.ui skin in mw.style this won't be needed:  
					if( mw.hasJQueryUiCss() ){
						mw.style[ mw.getConfig( 'jQueryUISkin' ) ] = true;
					}
					
					
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
							}else{
								mw.runReadyFunctions();
							}
						}
						runSetupFunctions();	
					} );
					
				} );									
			});
		});
	};
	
	/**
	* Checks for jquery ui css by name jquery-ui-1.7.2.css
	*	NOTE: this is a hack for usability jquery-ui
	* 	in the future usability should register a class in mw.skin
	*
	* @return true if found, return false if not found
	*/
	mw.hasJQueryUiCss = function(){
		var hasUiCss = false;
		// Load the jQuery ui skin if usability skin not set
		$j( 'link' ).each( function(  na, linkNode ){
			if( $j( linkNode ).attr( 'href' ).indexOf( 'jquery-ui-1.7.2.css' ) != -1 ) {
				hasUiCss = true;
				return false;
			}
		} );
		return hasUiCss;		
	}
	
	/** 
	 * Loads the core mwEmbed "loader.js" file config
	 *  
	 *  NOTE: if using the ScriptLoader all the loaders and localization converters 
	 *  are included automatically
	 *  
	 * @param {Function} callback Function called once core loader file is loaded 
	 */
	mw.checkCoreLoaderFile = function( callback ) {
		// Check if we are using scriptloader ( handles loader include automatically ) 
		if( mw.getScriptLoaderPath() ) {
			callback();
			return ;
		}
		
		// Check if we are using a static package ( mwEmbed path includes -static )
		if( mw.isStaticPackge() ){			
			callback();
			return ;
		}

		// Add the Core loader to the request
		// The follow code is ONLY RUN in debug / raw file mode		
		mw.load( 'loader.js', callback );
	}
	/**
	* Checks if the javascript is a static package ( not using script-loader )
	* @return {boolean} 
	* 	true the included script is static
	* 	false the included script 
	*/ 
	mw.isStaticPackge = function(){
		var src = mw.getMwEmbedSrc();
		if( src.indexOf('-static') !== -1 ){			
			return true;	
		}
		return false;
	}
	
	/**
	* Check for script-loader module loaders, and localization files
	* 
	* NOTE: if using the ScriptLoader all the loaders and localization converters 
	*  are included automatically. 
	*/
	mw.checkModuleLoaderFiles = function( callback ) {
		mw.log( 'doLoaderCheck::' );
		
		// Check if we are using scriptloader ( handles loader include automatically )
		// Or if mwEmbed is a static package ( all classes are already loaded )  
		if( mw.getScriptLoaderPath() || mw.isStaticPackge() ) {
			callback();	
			return ;
		}
							
		// Load the configured modules / components
		// The follow code is ONLY RUN in debug / raw file mode		
		var loaderRequest = [];			
		
		//Load enabled components
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
			mw.setConfig( 'loaderContext',  'modules/' + moduleName + '/' );	
			mw.load( 'modules/' + moduleName + '/loader.js', function(){
				loadEnabledModules( enabledModules );		
			} );
		}	
		
		function addLanguageFile(){
			// Add the language file
			var langLoaderRequest = [];
			
			if( mw.getConfig( 'userLanguage' ) ) {
				var langCode = mw.getConfig( 'userLanguage' );
									
				// Load the language class if not default 'en' 
				var transformKey = mw.getLangTransformKey( langCode ); 
				if( transformKey != 'en' ){				
					// Upper case the first letter:
					langCode = langCode.substr(0,1).toUpperCase() + langCode.substr( 1, langCode.length );
					langLoaderRequest.push( 'languages/classes/Language' +
						langCode + '.js' );
				}
				
			}
			if ( ! langLoaderRequest.length ) {
				callback();
				return ;
			}
				
			// Load the launage if set
			mw.load( langLoaderRequest, function(){			
				mw.log( 'Done moduleLoaderCheck request' );
				// Set the mwModuleLoaderCheckFlag flag to true
				mwModuleLoaderCheckFlag = true;
				callback();
			} );
		}		
					
	}
	
	/**
	* Checks if a css style rule exists 
	*
	* On a page with lots of rules it can take some time 
	* so avoid calling this function where possible and 
	* cache its result
	*
	* NOTE: this only works for style sheets on the same domain :(
	* 
	* @param {String} styleRule Style rule name to check
	* @return {Boolean}
	*	  true if the rule exists
	*	  false if the rule does not exist
	*/
	mw.styleRuleExists = function ( styleRule ) {
		// Set up the skin paths configuration		
		for( var i=0 ; i < document.styleSheets.length ; i++ ) {
			var rules = null;			
			try{
				if ( document.styleSheets[i].cssRules )
					rules = document.styleSheets[i].cssRules
				else if (document.styleSheets[0].rules)
					rules = document.styleSheets[i].rules
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
	}
	
	// Flag to register the domReady has been called
	var mwDomReadyFlag = false;
	
	// Flag to register if the domreadyHooks have been called
	var mwModuleLoaderCheckFlag = false;	

	/**
 	* This will get called when the DOM is ready 
 	* Will check configuration and issue a mw.setupMwEmbed call if needed
	*/
	mw.domReady = function ( ) {
		if( mwDomReadyFlag ) {
			return ;		
		}	
		mw.log( 'run:domReady:: ' + document.getElementsByTagName('video').length );
		// Set the onDomReady Flag
		mwDomReadyFlag = true;	
		
		// Give us a chance to get to the bottom of the script. 
		// When loading mwEmbed asynchronously the dom ready gets called  
		// directly and in some browsers beets the $j = jQuery.noConflict(); call 
		// and causes symbol undefined errors.  
		setTimeout(function(){
			mw.setupMwEmbed();
		},1);
	}	
	
	/**
	* A version comparison utility function
	* Handles version of types {Major}.{MinorN}.{Patch}
	*
	* Note this just handles version numbers not patch letters.
	*
	* @param {String} minVersion Minnium version needed
	* @param {String} clientVersion Client version to be checked
		
	* @return 
	* 	true if the version is at least of minVersion
	* 	false if the version is less than minVersion
	*/
	mw.versionIsAtLeast = function( minVersion, clientVersion ) {
		var minVersionParts = minVersion.split('.')
		var clientVersionParts = clientVersion.split('.');
		for( var i =0; i <  minVersionParts.length; i++ ) {
			if( parseInt( clientVersionParts[i] ) > parseInt( minVersionParts[i] ) ) {
				return true;
			}
			if( parseInt( clientVersionParts[i] ) < parseInt( minVersionParts[i] ) ) {
				return false;
			}
		}
		// Same version:
		return true;
	}
	 
	/**
	 * Runs all the triggers on a given object with a single "callback"
	 * 
	 * Normal tirgger calls will run the callback directly multiple times
	 * for every binded function. 
	 * 
	 * With runTriggersCallback() callback is not called until all the 
	 * binded events have been run. 	 
	 * 
	 * @param {object} targetObject Target object to run triggers on
	 * @param {string} triggerName	Name of trigger to be run
	 * @param {function} callback Function called once all triggers have been run
	 * 
	 */
	mw.runTriggersCallback = function( targetObject, triggerName, callback ){
		mw.log( ' runTriggersCallback:: ' + triggerName  );
		// If events are not present directly run callback 
		if( ! $j( targetObject ).data( 'events' ) ||
				! $j( targetObject ).data( 'events' )[ triggerName ] ) {
			mw.log( ' trigger name not found: ' + triggerName  );
			callback();
			return ;
		}		
		var callbackSet = $j( targetObject ).data( 'events' )[ triggerName ];
		if( !callbackSet || callbackSet.length === 0  ){
			mw.log( ' No events run the callback directly: ' + triggerName  );
			// No events run the callback directly
			callback();
			return ;
		}
		// Set the callbackCount
		var callbackCount = ( callbackSet.length )? callbackSet.length : 1;
		
		mw.log(" runTriggersCallback:: " + callbackCount );
		var callInx = 0;
		$j( targetObject ).trigger( 'checkPlayerSourcesEvent', function() {
			callInx++;
			if( callInx == callbackCount ){										
				// Run callback
				callback();
			}
		} );
	}
	/**
	 * Utility jQuery bindings
	 *  Setup after jQuery is available ). 
	 */
	mw.dojQueryBindings = function() {
		mw.log( 'mw.dojQueryBindings' );
		( function( $ ) {
		
			/**
			* Set a given selector html to the loading spinner:
			*/
			$.fn.loadingSpinner = function( ) {
				if ( this ) {
					$j( this ).html(
						$j( '<div />' )
						.addClass( "loadingSpinner" )  
					 );
				}			
				return this;
			}
			
			/**
			* dragDrop file loader 
			*/
			$.fn.dragFileUpload = function ( conf ) {
				if ( this.selector ) {
					var _this = this;
					// load the dragger and "setup"
					mw.load( ['$j.fn.dragDropFile'], function() {
						$j( _this.selector ).dragDropFile();
					} );
				}
			}							
	
			/**
			 *  Shortcut to a themed button
			 *  Should be depreciated for $.button bellow
			 */
			$.btnHtml = function( msg, className, iconId, opt ) {
				if ( !opt )
					opt = { };
				var href = ( opt.href ) ? opt.href : '#';
				var target_attr = ( opt.target ) ? ' target="' + opt.target + '" ' : '';
				var style_attr = ( opt.style ) ? ' style="' + opt.style + '" ' : '';
				return '<a href="' + href + '" ' + target_attr + style_attr +
					' class="ui-state-default ui-corner-all ui-icon_link ' +
					className + '"><span class="ui-icon ui-icon-' + iconId + '" ></span>' +
					'<span class="btnText">' + msg + '</span></a>';
			};
			
			// Shortcut to jQuery button ( should replace all btnHtml with button )
			var mw_default_button_options = {
				// The class name for the button link
				'class' : '',
				
				// The style properties for the button link
				'style' : { },
				
				// The text of the button link
				'text' : '',
				
				// The icon id that precedes the button link:
				'icon_id' : 'carat-1-n' 
			};
			
			$.button = function( options ) {
				var options = $j.extend( mw_default_button_options, options);
				
				// Button: 
				var $btn = $j('<a />')			
					.attr('href', '#')
					.addClass( 'ui-state-default ui-corner-all ui-icon_link' );
				// Add css if set: 
				if( options.css ) {
					$btn.css( options.css )
				}
									
				if( options['class'] ) {
					$btn.addClass( options['class'] )
				}	
								
				$btn.append(
					$j('<span />').addClass( 'ui-icon ui-icon-' + options.icon_id ),
					$j('<span />').addClass( 'btnText' )
						.text( options.text )
				);
				return $btn;					
			};
			
			// Shortcut to bind hover state
			$.fn.buttonHover = function() {
				$j( this ).hover(
					function() {
						$j( this ).addClass( 'ui-state-hover' );
					},
					function() {
						$j( this ).removeClass( 'ui-state-hover' );
					}
				)
				return this;
			};
			
			/**
			* Resize a dialog to fit the window
			* @param {Object} options horizontal and vertical space ( default 50 )
			*/
			$.fn.dialogFitWindow = function( options ) {
				var opt_default = { 'hspace':50, 'vspace':50 };
				if ( !options )
					var options = { };
				options = $j.extend( opt_default, options );
				$j( this.selector ).dialog( 'option', 'width', $j( window ).width() - options.hspace );
				$j( this.selector ).dialog( 'option', 'height', $j( window ).height() - options.vspace );
				$j( this.selector ).dialog( 'option', 'position', 'center' );
					// update the child position: (some of this should be pushed up-stream via dialog config options
				$j( this.selector + '~ .ui-dialog-buttonpane' ).css( {
					'position':'absolute',
					'left':'0px',
					'right':'0px',
					'bottom':'0px'
				} );
			};
			
		} )( $j );
	}	
	
} )( window.mw );


/**
* Set DOM-ready call 
* We copy jQuery( document ).ready here since sometimes
*  mwEmbed.js is included without jQuery
*  and we need our own "ready" system so that
*  mwEmbed interfaces can support async built out
*  and the inclution of jQuery. 
*/
var mwDomIsReady = false;
function runMwDomReady(){
	mwDomIsReady  = true;
	if( mw.domReady ){
		mw.domReady()
	}
}
// Check if already ready: 
if ( document.readyState === "complete" ) {
	runMwDomReady();
}

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		runMwDomReady();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			runMwDomReady();
		}
	};
}
// Mozilla, Opera and webkit nightlies currently support this event
if ( document.addEventListener ) {
	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	
	// A fallback to window.onload, that will always work
	window.addEventListener( "load", mw.domReady, false );

// If IE event model is used
} else if ( document.attachEvent ) {
	// ensure firing before onload,
	// maybe late but safe also for iframes
	document.attachEvent("onreadystatechange", DOMContentLoaded);
	
	// A fallback to window.onload, that will always work
	window.attachEvent( "onload", runMwDomReady );

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
	if ( mwDomIsReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch( error ) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	runMwDomReady();
}


// If using the script-loader and jQuery has not been set give a warning to the user:
// (this is needed because packaged loader.js files could refrence jQuery )  
if( mw.getScriptLoaderPath() && !window.jQuery ) {
	mw.log( 'Error: jQuery is required for mwEmbed, please update your script-loader request' );
}

if( mw.isStaticPackge() && !window.jQuery ){
	alert( 'Error: jQuery is required for mwEmbed ');
}

/**
 * Hack to keep jQuery in $ when its
 * already there, but also use noConflict to get $j = jQuery
 * 
 * This way sites that use $ for jQuery continue to work after
 * including mwEmbed javascript.
 * 
 * Also if jQuery is included prior to mwEmbed we ensure
 * $j is set
 */

if( window.jQuery ){
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
}
