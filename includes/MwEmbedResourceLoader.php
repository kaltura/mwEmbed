<?php 
/**
 * Extends the mediaWiki Resource loader for mwEmbed
 * 
 *  Most of the documentation for the MediaWiki Resource Loader can be found at:
 *    http://www.mediawiki.org/wiki/ResourceLoader
 */

class MwEmbedResourceLoader extends ResourceLoader {
	/**
	 * Registers core modules and runs registration hooks.
	 */
	public function __construct() {
		global $IP, $wgResourceModules, $wgResourceLoaderSources, $wgLoadScript, $wgEnableJavaScriptTest;

		wfProfileIn( __METHOD__ );
		// Add 'local' source first
		$this->addSource( 'local', array( 'loadScript' => $wgLoadScript, 'apiScript' => wfScript( 'api' ) ) );

		// Add other sources
		$this->addSource( $wgResourceLoaderSources );

		// Register modules shared between mwEmbed and mediaWiki:
		$this->register( include( "$IP/resources/MwEmbedSharedResources.php" ) );
		$this->register( include( "$IP/skins/SkinResources.php" ) );
		
		// Register extension modules
		wfRunHooks( 'ResourceLoaderRegisterModules', array( &$this ) );
		$this->register( $wgResourceModules );

		if ( $wgEnableJavaScriptTest === true ) {
			$this->registerTestModules();
		}

		wfProfileOut( __METHOD__ );
	}
	/**
	 * Stubs out preLoadModuleInfo call in mwEmbed we always get info from 
	 * php resource description files 
	 */
	public function preloadModuleInfo( array $modules, ResourceLoaderContext $context ) {
		// Note it maybe nice to read searlized per module info. We will want to 
		// run this rarely and have an outer file cache respond to requests. 
		
		// Since we don't have user scripts and frequently changing modules we could read a 'release' 
		// version global or svn version
		return ;
	}
	
	/**
	 * Get the ResourceLoaderModule object for a given module name.
	 *
	 * @param $name String: Module name
	 * @return Mixed: ResourceLoaderModule if module has been registered, null otherwise
	 */
	public function getModule( $name ) {	
		if ( !isset( $this->modules[$name] ) ) {
			if ( !isset( $this->moduleInfos[$name] ) ) {
				// No such module
				return null;
			}
			// Construct the requested object
			$info = $this->moduleInfos[$name];
			if ( isset( $info['object'] ) ) {
				// Object given in info array
				$object = $info['object'];
			} else {
				if ( !isset( $info['class'] ) ) {
					$class = 'MwEmbedResourceLoaderFileModule';
				} else {
					$class = $info['class'];
				}				
				$object = new $class( $info );
			}	
			$object->setName( $name );
			$this->modules[$name] = $object;
		}

		return $this->modules[$name];
	}
}

?>