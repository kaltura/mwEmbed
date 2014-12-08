<?php 
/**
 * Simple build system, presently just put in-place .min.js for all resource loader managed assets. 
 */

// This can only be accessed via the command line: 
ini_set('register_argc_argv', 0);
if (!isset($argc) || is_null($argc)){
	echo "build.php must be run from the command line\n";
	exit();
}
// Get mwEmbed framework:
require_once ( dirname( __FILE__ ) . '/includes/MwEmbedWebStartSetup.php' );

if(	!$wgNodeJsUglifyPath  || ( ! is_file( $wgNodeJsUglifyPath ) && ! is_link( $wgNodeJsUglifyPath ) ) ){
	echo "wgNodeJsUglifyPath: $wgNodeJsUglifyPath not valid, no build\n";
	exit();
}
function microtime_float(){
	list($usec, $sec) = explode(" ", microtime());
	return ((float)$usec + (float)$sec);
}
function buildMin( $fullPath ){
	global $IP, $wgNodeJsUglifyPath;
	$fileName = str_replace( $IP, '', $fullPath );
	// check if already min:
	if( substr($fullPath, -7) == '.min.js'){
		echo "skip -> " . $fileName . "\n";
		return ;
	}
	$targetPath = substr( $fullPath,0, -3 ) . '.min.js';
	$targetPath = str_replace( $IP, $IP . '/build', $targetPath );

	// check if file modification date ( enabled in-pace "build" testing )
	if( is_file( $targetPath ) && filemtime( $targetPath ) > filemtime( $fullPath ) ) {
		echo "skip ( file not new ) -> " . $fileName . "\n";
		return ;
	}
	
	$cmd = $wgNodeJsUglifyPath . ' ' . escapeshellarg( $fullPath ) . ' -c --mangle -o ' . escapeshellarg( $targetPath );
	// make sure directories are in place for target:
	@mkdir( dirname( $targetPath ), 0777, true);
	$startTime = microtime_float();
	echo "compress -> " . $fileName . " \n";
	shell_exec($cmd);
	echo "\n\t" . round( microtime_float() - $startTime, 4) . " ms \n";
}
// Respond to resource loading request
$resourceLoader = new MwEmbedResourceLoader();
$fauxRequest = new WebRequest;
$context = new MwEmbedResourceLoaderContext( $resourceLoader, $fauxRequest );

// Get full module list:
$moduleNames = $resourceLoader->getModuleNames();
// benchmark build time: 
$totalStartTime = microtime_float();

// foreach modules output .min files: 
foreach( $moduleNames as $moduleName ){
	$module = $resourceLoader->getModule( $moduleName );
	// check if module has script files: 
	if( !method_exists( $module, 'getScriptFiles' ) ){
		continue;
	}
	$files = $module->getScriptFiles( $context );
	foreach ( array_unique( $files ) as $fileName ) {
		// check for in-pace .min.js file 
		// ( right now we use specialized compiled jQuery, but any other asset could be pre-min )
		$fullPath = $module->getLocalPath( $fileName );
		buildMin( $fullPath );
	}
}
// also compress all the kWidget / onPage scripts:
$it = new RecursiveDirectoryIterator( $IP . "/kWidget" );
foreach(new RecursiveIteratorIterator($it) as $file) {
	if (in_array(strtolower(array_pop(explode('.', $file))), array('js') ) ){
		buildMin( $file );
	}
};

echo "total build in " . round( microtime_float() - $totalStartTime, 4) . "\n";