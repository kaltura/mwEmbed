<?php
header("Access-Control-Allow-Origin: *");
/**
 * Provides and entry point for javascript services .
 * 
 * Will eventually replace all the entry points
 * 
 * TODO make this into a real api entry point. 
 * 
 * TODO adopt an api framework 
 */
// Include configuration: ( will include LocalSettings.php, and all the extension hooks ) 
require(  dirname( __FILE__ ) . '/includes/DefaultSettings.php' );
// include helpers:
require_once( dirname( __FILE__ ) . '/modules/KalturaSupport/KalturaCommon.php' );

// Check for custom resource ps config file:
if( isset( $wgKalturaPSHtml5SettingsPath ) && is_file( $wgKalturaPSHtml5SettingsPath ) ){
	require_once( $wgKalturaPSHtml5SettingsPath );
}

$mwEmbedApi = new mwEmbedApi();
$mwEmbedApi->handleRequest();

// Dispatch on extension entry points 
class mwEmbedApi{
	function handleRequest(){
		global $container, $wgAutoloadClasses;
		
		$this->request = $container['request_helper'];
		
		$serviceClass = 'Service' . ucfirst( $this->request->get( 'service' ) );
		if( isset( $wgAutoloadClasses[ $serviceClass ] ) ){
			$service = new $serviceClass;
			$service->run();
		} else{
			$this->error( "Could not find service: " . preg_replace("/[^A-Za-z0-9 ]/", '', $serviceClass) );
		}
	}
	function error( $error ){
		die( '/* Error: ' . $error . ' */' );
	}
}