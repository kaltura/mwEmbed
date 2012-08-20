<?php 
// Support serving plugin manifest data in machine readalbe formats

if( !isset( $_REQUEST['plugin_id' ] ) ){
	echo "no plugin_id requested";
	exit(1);
}

// Include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

$basePluginConfig = array(
	'desc' => "Default plugin description",
	'attr' => array(
		'plugin' => "If the plugin is enabled or not",
		'path' => "Path to flash swf plugin",
		'width' => "The width of the plugin",
		'height' => "The height of the plugin"
	)
);

// Setup the global plugin register:
$pluginRegister = array();

# Register / load all the mwEmbed modules
foreach( $wgMwEmbedEnabledModules as $moduleName ){
	$manifestPath =  realpath( dirname( __FILE__ ) ) .
					"/modules/$moduleName/{$moduleName}.manifest.php";
	if( is_file( $manifestPath ) ){
		$pluginRegister = array_merge( $pluginRegister, include( $manifestPath ) );
	}
}
if( !isset( $pluginRegister[ $_REQUEST['plugin_id' ] ] ) ){
	echo "could not find plugin id" ;
	exit(1);
}

// Parse the request
if( isset( $_REQUEST['plugin_id' ] ) ){
	// extend the output with base plugin config 
	$output = array_merge($basePluginConfig,  $pluginRegister[ $_REQUEST['plugin_id' ] ] );
	// retun the given plugin_id manifest in json:
	echo json_encode( $output );
} 