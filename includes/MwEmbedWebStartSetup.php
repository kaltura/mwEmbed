<?php
/**
 * This does the initial setup for a web request.
 * It does some security checks, and loads the
 * configuration
 * 
 * @file
 */

# Protect against register_globals
# This must be done before any globals are set by the code
if ( ini_get( 'register_globals' ) ) {
	if ( isset( $_REQUEST['GLOBALS'] ) ) {
		die( '<a href="http://www.hardened-php.net/globals-problem">$GLOBALS overwrite vulnerability</a>');
	}
	$verboten = array(
		'GLOBALS',
		'_SERVER',
		'HTTP_SERVER_VARS',
		'_GET',
		'HTTP_GET_VARS',
		'_POST',
		'HTTP_POST_VARS',
		'_COOKIE',
		'HTTP_COOKIE_VARS',
		'_FILES',
		'HTTP_POST_FILES',
		'_ENV',
		'HTTP_ENV_VARS',
		'_REQUEST',
		'_SESSION',
		'HTTP_SESSION_VARS'
	);
	foreach ( $_REQUEST as $name => $value ) {
		if( in_array( $name, $verboten ) ) {
			header( "HTTP/1.x 500 Internal Server Error" );
			echo "register_globals security paranoia: trying to overwrite superglobals, aborting.";
			die( -1 );
		}
		unset( $GLOBALS[$name] );
	}
}

# Valid web server entry point, enable includes.
# Please don't move this line to includes/Defines.php. This line essentially
# defines a valid entry point. If you put it in includes/Defines.php, then
# any script that includes it becomes an entry point, thereby defeating
# its purpose.
define( 'MEDIAWIKI', true );

# Full path to working directory.
# Makes it possible to for example to have effective exclude path in apc.
# Also doesn't break installations using symlinked includes, like
# dirname( __FILE__ ) would do.
$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = realpath( dirname( __FILE__ ) . '/../');
}


# Start the autoloader, so that extensions can derive classes from core files
require_once( "$IP/includes/MwEmbedAutoLoader.php" );

# Include the mediaWiki stubs.php file ( will stub out un-needed functionality from mediaWiki
require_once( "$IP/includes/MwEmbedMediaWikiStubs.php" );

# Include global mediaWiki functions
require_once( "$IP/includes/MwEmbedMediaWikiGlobalFunctions.php" );

# Load default settings
require_once( "$IP/includes/DefaultSettings.php" );

if ( !defined('MW_CONFIG_FILE') ){
	define('MW_CONFIG_FILE', "$IP/LocalSettings.php");
}

# LocalSettings.php is the per site customization file. If it does not exist
# error out
if( !file_exists( MW_CONFIG_FILE ) ) {
	print "if( console && typeof console.log == 'function' ){ console.log('MwEmbed could not find LocalSettings.php ( using default configuration )'); }\n";
} else {
	# Load local settings
	require_once( "$IP/LocalSettings.php" );
}
# Include utility files: 
require_once( "$IP/includes/Hooks.php");

/**
 * Legay mappings for mwEmbed config 
 */
if( isset( $wgEnableScriptDebug ) ){
	$wgResourceLoaderDebug = $wgEnableScriptDebug;
}



# Create the wgRequest global: 
$wgRequest = new WebRequest;

$wgLang = new UserLang();

// Check for required module "MwEmbedSupport"
if( in_array( "MwEmbedSupport",  $wgMwEmbedEnabledModules ) == false ){
	array_push( $wgMwEmbedEnabledModules, "MwEmbedSupport" );
}
$ORG_IP = $IP;
$IP = realpath( $IP . '/..' );
global $wgScriptPath;
# Register / load all the mwEmbed modules
foreach( $wgMwEmbedEnabledModules as $moduleName ){
	$modulePath = $wgScriptPath."modules/$moduleName";
	if( is_file( "$IP/$modulePath/$moduleName.json" ) || is_file( "$IP/$modulePath/$moduleName.php" ) ){
		MwEmbedResourceManager::register( $modulePath );
	}
}

/**
 *
 * Find the relative file system path between two file system paths
 *
 * @param  string  $frompath  Path to start from
 * @param  string  $topath    Path we want to end up in
 *
 * @return string             Path leading from $frompath to $topath
 */
function find_relative_path ( $frompath, $topath ) {
    $from = explode( DIRECTORY_SEPARATOR, $frompath ); // Folders/File
    $to = explode( DIRECTORY_SEPARATOR, $topath ); // Folders/File
    $relpath = '';

    $i = 0;
    // Find how far the path is the same
    while ( isset($from[$i]) && isset($to[$i]) ) {
        if ( $from[$i] != $to[$i] ) break;
        $i++;
    }
    $j = count( $from ) - 1;
    // Add '..' until the path is the same
    while ( $i <= $j ) {
        if ( !empty($from[$j]) ) $relpath .= '..'.DIRECTORY_SEPARATOR;
        $j--;
    }
    // Go to folder from where it starts differing
    while ( isset($to[$i]) ) {
        if ( !empty($to[$i]) ) $relpath .= $to[$i].DIRECTORY_SEPARATOR;
        $i++;
    }

    // Strip last separator
    return substr($relpath, 0, -1);
}

foreach( $wgKwidgetPsEnabledModules as $moduleName ){
    $modulePath = $wgKalturaPSHtml5ModulesDir . '/' . $moduleName ;
    $relativeModulePath = (find_relative_path($IP, $modulePath));
    if( is_file( $modulePath . '/' . $moduleName . '.json') ){
        MwEmbedResourceManager::register( $relativeModulePath );
    }
}

# Add the resource loader hooks
$wgHooks['ResourceLoaderRegisterModules'][] = 'MwEmbedResourceManager::registerModules';
$wgHooks['ResourceLoaderGetConfigVars'][] =  'MwEmbedResourceManager::registerConfigVars';
