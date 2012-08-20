<?php 
// Support serving plugin manifest data in machine readalbe formats
$pluginId = htmlspecialchars(  $_REQUEST['plugin_id' ]  );
if( !isset( $pluginId ) ){
	echo "no plugin_id requested";
	exit(1);
}

// Include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

$basePluginConfig = array(
	'description' => "Default plugin description",
	'attributes' => array(
		'plugin' => array(
			'doc' => "If the plugin is enabled or not",
			'edit' => true,
			'type' => 'boolean'
		),
		'width' => array(
			'doc' => "The width of the plugin",
			'value' => '0%'
		),
		'height' => array(
			'doc' => "The height of the plugin",
			'value' => '0%'
		),
		'includeInLayout' => array(
			'doc' => "If the plugin should be included in the player layout",
			"value" => "false" 
		)
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
if( !isset( $pluginRegister[ $pluginId ] ) ){
	echo "{ error: \"could not find plugin id\" }";
	exit(1);
}

// Parse the request
if( isset( $pluginId ) ){
	// extend the output with base plugin config 
	$output = array_merge( $basePluginConfig,  $pluginRegister[ $_REQUEST['plugin_id' ] ] );
	
	// special mapping: 
	/*if( ! isset( $output['attributes']['path']['value'] ) ){
		$output['attributes']['path']['value'] = $pluginId . 'Plugin.swf';
	}*/
	// retun the given plugin_id manifest in json:
	echo json_encode( $output );
} 