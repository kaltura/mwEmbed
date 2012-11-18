<?php 

// Replaces the ResourceLoaderFileModule by stubbing out stuff that does not work in stand 
// alone mode

class MwEmbedResourceLoaderStartUpModule extends ResourceLoaderStartUpModule {
	/**
	 * Get the files this module depends on indirectly for a given skin.
	 * Currently these are only image files referenced by the module's CSS.
	 *
	 * @param $skin String: Skin name
	 * @return Array: List of files
	 */
	public function getFileDependencies( $skin ) {
		// Try in-object cache first
		if ( isset( $this->fileDeps[$skin] ) ) {
			return $this->fileDeps[$skin];
		}
		return array();
	}
	static function getStartupModules( &$modules ){
		array_push( $modules, 
			'mw.MwEmbedSupport','jquery.triggerQueueCallback',
			'Spinner', 'jquery.loadingSpinner'
		);
		return $modules;
	}
	public function getScript( ResourceLoaderContext $context ) {		
		global $wgHooks;
		// add mwEmebdSupport to startup module: 
		$wgHooks['ResourceLoaderGetStartupModules'][] = 'MwEmbedResourceLoaderStartUpModule::getStartupModules';
		
		$out = parent::getScript( $context );
		return $out;
	}
	
	protected function getConfig( $context ) {
		global $wgLoadScript; 
				
		$vars = array(
			'wgLoadScript' => $wgLoadScript,
			'debug' => $context->getDebug(),
			'skin' => $context->getSkin(),
			'wgUserLanguage' => $context->getLanguage(),
		);
		wfRunHooks( 'ResourceLoaderGetConfigVars', array( &$vars ) );
		
		return $vars;
	}
}
?>