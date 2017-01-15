<?php
/**
 * MwEmbedResourceManager adds some convenience functions for loading mwEmbed 'modules'.
 *  Its shared between the mwEmbedStandAlone and the MwEmbed extension
 * 
 * @file
 * @ingroup Extensions
 */

class MwEmbedResourceManager {
	
	protected static $moduleSet = array();
	protected static $moduleConfig = array();
	
	/**
	 * Register mwEmbeed resource set 
	 * 
	 * Adds modules to ResourceLoader
	 */
	public static function register( $mwEmbedResourcePath ) {
		global $IP, $wgExtensionMessagesFiles;
		$fullResourcePath = $IP . '/' . $mwEmbedResourcePath;

		// Get the module name from the end of the path: 
		$modulePathParts = explode( '/', $mwEmbedResourcePath );
		$moduleName =  array_pop ( $modulePathParts );
		if( !is_dir( $fullResourcePath ) ){
			throw new MWException( __METHOD__ . " not given readable path: "  . htmlspecialchars( $mwEmbedResourcePath ) );
		}
		
		if( substr( $mwEmbedResourcePath, -1 ) == '/' ){
			throw new MWException(  __METHOD__ . " path has trailing slash: " . htmlspecialchars( $mwEmbedResourcePath) );
		}
		
		// Add module messages if present:
		$msgFileName = $fullResourcePath . '/' . $moduleName . '.i18n.json';
		if( is_file( $msgFileName ) ){
		    $wgExtensionMessagesFiles[ 'MwEmbed.' . $moduleName ] = $msgFileName;
		}
		// Get the mwEmbed module resource registration:
		$moduleResourceFileName = $fullResourcePath . '/' . $moduleName . '.json';
        $resourceList = json_decode( file_get_contents($moduleResourceFileName), TRUE );

		// Look for special 'messages' => 'moduleFile' key and load all modules file messages:
		foreach( $resourceList as $name => $resources ){
			if( isset( $resources['messageFile'] ) && is_file( $fullResourcePath . '/' .$resources['messageFile'] ) ){
				$resourceList[ $name ][ 'messages' ] = array();
				$messages = json_decode( file_get_contents($fullResourcePath . '/' .$resources['messageFile']), TRUE );

				foreach( $messages['en'] as $msgKey => $na ){		
					 $resourceList[ $name ][ 'messages' ][] = $msgKey;
				}
			}
		};
		
		// Check for module loader:
		if( is_file( $fullResourcePath . '/' . $moduleName . '.loader.js' )){
			$resourceList[ $moduleName . '.loader' ] = array(
				'loaderScripts' => $moduleName . '.loader.js'
			);
		}
		
		// Check for module config ( @@TODO support per-module config )		
		$configPathFileName =  $fullResourcePath . '/' . $moduleName . '.config.json';
		if( is_file( $configPathFileName  ) ){
		    $moduleConfigObj = json_decode( file_get_contents($configPathFileName), TRUE );
		    self::$moduleConfig = array_merge( self::$moduleConfig, $moduleConfigObj );
		}

		// Add the resource list into the module set with its provided path 
		self::$moduleSet[ $mwEmbedResourcePath ] = $resourceList;
	}
	
	public static function registerConfigVars( &$vars ){
		// Allow localSettings.php to override any module config by updating $wgMwEmbedModuleConfig var
		global $wgMwEmbedModuleConfig;
		foreach( self::$moduleConfig as $key => $value ){
			if( ! isset( $wgMwEmbedModuleConfig[ $key ] ) ){
				$wgMwEmbedModuleConfig[$key] = $value;
			}
		}
		$vars = array_merge( $vars, $wgMwEmbedModuleConfig ); 
		return $vars;
	}
	
	/**
	 * ResourceLoaderRegisterModules hook
	 * 
	 * Adds any mwEmbedResources to the ResourceLoader
	 */
	public static function registerModules( &$resourceLoader ) {
		global $IP, $wgStandAloneResourceLoaderMode;
		// Register all the resources with the resource loader
		foreach( self::$moduleSet as $path => $modules ) {
			foreach ( $modules as $name => $resources ) {
				// Register the resource with MwEmbed extended class if in standAlone resource loader mode:
				if( $wgStandAloneResourceLoaderMode === true ){							
					$resourceLoader->register(					
						// Resource loader expects trailing slash: 
						$name, new MwEmbedResourceLoaderFileModule( $resources, "$IP/$path", $path)
					);
				} else {
					$resourceLoader->register(					
						// Resource loader expects trailing slash: 
						$name, new ResourceLoaderFileModule( $resources, "$IP/$path", $path)
					);
				}
			}
		}		
		// Continue module processing
		return true;
	}
	
	// Add the mwEmbed module to the page: 
	public static function addMwEmbedModule(  &$out, &$sk ){		
		// Add the mwEmbed module to the output
		$out->addModules( 'MwEmbedSupport' );
		return true;	
	}
}