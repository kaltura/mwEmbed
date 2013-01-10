<?php 
// Support serving plugin manifest data in machine readalbe formats
$pluginId = htmlspecialchars(  $_REQUEST['plugin_id' ]  );
if( !isset( $pluginId ) ){
	echo "no plugin_id requested";
	exit(1);
}

// Include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );

$basePluginConfig = array(
	'attributes' => array(
		'plugin' => array(
			'doc' => "If the plugin is enabled or not",
			'type' => 'boolean',
			'hideEdit' => true
		),
		'width' => array(
			'doc' => "The width of the plugin",
			'value' => '0%',
			'hideEdit' => true,
		),
		'height' => array(
			'doc' => "The height of the plugin",
			'value' => '0%',
			'hideEdit' => true,
		),
		'includeInLayout' => array(
			'doc' => "If the plugin should be included in the player layout",
			"value" => "false",
			'hideEdit' => true,
		),
		'relativeTo' => array(
			'hideEdit' => true
		),
		'position' => array(
			'hideEdit' => true
		),
		'loadingPolicy' => array(
			'hideEdit' => true
		),
		'className' => array(
			'hideEdit' => true
		),
		'IframeCustomPluginJs' => array(
			'hideEdit' => true
		),
		'IframeCustomjQueryUISkinCss' => array(
			'hideEdit' => true
		),
		'iframeHTML5Js' => array(
			'hideEdit' => true
		),
		'onPageJs1' => array(
			'hideEdit' => true
		),
		'onPageJs2' => array(
			'hideEdit' => true
		),
		'onPageJs3' => array(
			'hideEdit' => true
		),
		'onPageCss1' => array(
			'hideEdit' => true
		),
		'onPageCss2' => array(
			'hideEdit' => true
		)
	)
);

// Setup the global plugin register:
$configRegister = array(
	/** always make general ad config available if requested */
	'preSequence' => array(
			'doc' => 'The pre sequence index, used to sequence ad before content.',
			'type' => 'number' 
	),
	'postSequence' => array(
		'doc' => 'The post sequence index, used to sequence ads after content',
		'type' => 'number'
	)
);

# Register / load all the mwEmbed modules
foreach( $wgMwEmbedEnabledModules as $moduleName ){
	$manifestPath =  realpath( dirname( __FILE__ ) ) .
					"/../modules/$moduleName/{$moduleName}.manifest.php";
	if( is_file( $manifestPath ) ){
		$configRegister = array_merge( $configRegister, include( $manifestPath ) );
	}
}

# Register all the onPage scripts:
$configRegister = array_merge( $configRegister, 
	include( realpath( dirname( __FILE__ ) ). '/../kWidget/onPagePlugins/onPagePlugins.manifest.php' ) );

# Register all kwidget-ps based scripts: ( if setup )
$html5ManifestFile = realpath( dirname( $wgKalturaPSHtml5SettingsPath ) . '/../ps/kwidget-ps.manifest.json' ) ;
if( is_file( $html5ManifestFile ) ){
	$configRegister = array_merge( $configRegister, 
		json_decode( file_get_contents( $html5ManifestFile), true ) );
}

if( !isset( $configRegister[ $pluginId ] ) && $pluginId != 'null' ){
	echo "{ \"error\" : \"could not find plugin id\" }";
	exit(1);
}
$output = array();
// Parse the request
if( isset( $pluginId ) && $pluginId != 'null' ){
	// extend the output with base plugin config 
	$output[ $pluginId ] = array_merge_recursive( $basePluginConfig,  $configRegister[ $pluginId] );
	// special mapping: 
	/*if( ! isset( $output['attributes']['path']['value'] ) ){
		$output['attributes']['path']['value'] = $pluginId . 'Plugin.swf';
	}*/
} 
// output config for any vars
if( isset( $_REQUEST['vars'] ) ){
	$varList = explode( ',', $_REQUEST['vars'] );
	foreach( $varList as $varKey ){
		if( isset( $configRegister[ $varKey ] ) &&  $pluginId != $varKey ){
			$output[ $varKey ] = $configRegister[ $varKey ];
		}
	}
}
// retun the given plugin_id manifest in json:
echo json_encode( $output );