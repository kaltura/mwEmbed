<?php
/**
 * This defines autoloading handler for ( mwEmbed ) framework
 *
 * @file
 */

/**
 * Locations of core classes
 * Extension classes are specified with $wgAutoloadClasses
 * This array is a global instead of a static member of AutoLoader to work around a bug in APC
 */
global $wgAutoloadLocalClasses;

$wgAutoloadLocalClasses = array(

	# Files copied without modification from mediaWiki
	'ResourceLoader' => 'includes/resourceloader/ResourceLoader.php',
	'ResourceLoaderContext' => 'includes/resourceloader/ResourceLoaderContext.php',
	'ResourceLoaderModule' => 'includes/resourceloader/ResourceLoaderModule.php',
	'ResourceLoaderFileModule' => 'includes/resourceloader/ResourceLoaderFileModule.php',
	'ResourceLoaderStartUpModule' => 'includes/resourceloader/ResourceLoaderStartUpModule.php',

	'CSSJanus' => 'includes/libs/CSSJanus.php',
	'CSSMin' => 'includes/libs/CSSMin.php',
	'JavaScriptDistiller' => 'includes/libs/JavaScriptDistiller.php',
	'JavaScriptMinifier' => 'includes/libs/JavaScriptMinifier.php',
	'JavaScriptCompress' => 'includes/libs/JavaScriptCompress.php',
	'JavaScriptNodeUglifyJs' => 'includes/libs/JavaScriptNodeUglifyJs.php',

	# MwEmbed files ( that get autoloaded ):
	'MwEmbedResourceLoaderContext' => 'includes/MwEmbedResourceLoaderContext.php',
	'MwEmbedPoorManSquidProxy' => 'includes/MwEmbedPoorManSquidProxy.php',
	'MwEmbedResourceLoader' => 'includes/MwEmbedResourceLoader.php',
	'MwEmbedResourceLoaderFileModule' => 'includes/MwEmbedResourceLoaderFileModule.php',
	'MwEmbedResourceLoaderStartUpModule' => 'includes/MwEmbedResourceLoaderStartUpModule.php',
	'MwEmbedResourceManager' => 'includes/MwEmbedResourceManager.php',	
);

class AutoLoader {
	/**
	 * autoload - take a class name and attempt to load it
	 *
	 * @param $className String: name of class we're looking for.
	 * @return bool Returning false is important on failure as
	 * it allows Zend to try and look in other registered autoloaders
	 * as well.
	 */
	static function autoload( $className ) {
		global $wgAutoloadClasses, $wgAutoloadLocalClasses;

		if ( isset( $wgAutoloadLocalClasses[$className] ) ) {
			$filename = $wgAutoloadLocalClasses[$className];
		} elseif ( isset( $wgAutoloadClasses[$className] ) ) {
			$filename = $wgAutoloadClasses[$className];
		} else {
			# Try a different capitalisation
			# The case can sometimes be wrong when unserializing PHP 4 objects
			$filename = false;
			$lowerClass = strtolower( $className );

			foreach ( $wgAutoloadLocalClasses as $class2 => $file2 ) {
				if ( strtolower( $class2 ) == $lowerClass ) {
					$filename = $file2;
				}
			}

			if ( !$filename ) {
				if ( function_exists( 'wfDebug' ) ) {
					wfDebug( "Class {$className} not found; skipped loading\n" );
				}

				# Give up
				return false;
			}
		}

		# Make an absolute path, this improves performance by avoiding some stat calls
		if ( substr( $filename, 0, 1 ) != '/' && substr( $filename, 1, 1 ) != ':' ) {
			global $IP;
			$filename = "$IP/$filename";
		}

		require( $filename );

		return true;
	}
}

if ( function_exists( 'spl_autoload_register' ) ) {
	spl_autoload_register( array( 'AutoLoader', 'autoload' ) );
} else {
	function __autoload( $class ) {
		AutoLoader::autoload( $class );
	}

	ini_set( 'unserialize_callback_func', '__autoload' );
}
