<?php 
// Include configuration 
require_once( realpath( dirname( __FILE__ ) )  . '/doc-base.php' );

function outputConfig(){
	global $wgMwEmbedEnabledModules, $wgKalturaPSHtml5SettingsPath;
	
	// Support serving plugin manifest data in machine readalbe formats
	if( !isset( $_REQUEST['plugin_id' ] ) ){
		echo "{ \"error\" : \"no plugin id\" }";
		return ;
	}
	$pluginId = htmlspecialchars( $_REQUEST['plugin_id' ] );
	
	$basePluginConfig = array(
		'attributes' => array(
			'plugin' => array(
				'doc' => "If the plugin is enabled or not",
				'type' => 'boolean',
				'hideEdit' => true
			),
			'path' => array(
				'hideEdit' => true
			),
			'width' => array(
				'doc' => "The width of the plugin",
				'value' => '0%',
				'hideEdit' => true,
			),
			'loadInIframe' => array(
				'doc' => "If the on-page-plugin should be loaded inside the iframe, 
					for share and embeds that don't include on-page JavaScript",
				'type' => 'boolean',
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
			'iframeHTML5Css'=> array(
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
			),
			'requiresJQuery' => array(
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
		$json = json_decode( file_get_contents( $html5ManifestFile), true );
		if( $json == null){
			echo "{ \"error\" : \"could not parse json\" }";
			return ;
		}
		$configRegister = array_merge( $configRegister, $json);
	}
	
	if( !isset( $configRegister[ $pluginId ] ) && $pluginId != 'null' ){
		echo "{ \"error\" : \"could not find plugin id\" }";
		return ;
	}
	$output = array();
	// Parse the request
	if( isset( $pluginId ) && $pluginId != 'null' ){
		// extend the output with base plugin config 
		$output[ $pluginId ] = array_replace_recursive( $basePluginConfig,  $configRegister[ $pluginId] );
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
				// if a plugin with attributes merge basePluginConfig
				if( isset( $output[ $varKey ]['attributes'] ) ){
					$output[ $varKey ] = array_replace_recursive( $basePluginConfig, $output[ $varKey ] );  
				}
			}
		}
	}
	// retun the given plugin_id manifest in json:
	echo json_encode( $output );
}
outputConfig();