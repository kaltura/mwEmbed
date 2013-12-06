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

// Check for custom resource ps config file:
if( isset( $wgKalturaPSHtml5SettingsPath ) && is_file( $wgKalturaPSHtml5SettingsPath ) ){
	require_once( $wgKalturaPSHtml5SettingsPath );
}

$mwEmbedApi = new mwEmbedApi();
$mwEmbedApi->handleRequest();

// Dispatch on extension entry points 
class mwEmbedApi{
	function handleRequest(){
		global $wgMwEmbedApiServices;
		$serviceName = $this->getUrlParam( 'service' );
		if( isset( $wgMwEmbedApiServices[ $serviceName ] ) ){
			$service = new $wgMwEmbedApiServices[$serviceName ];
			$service->run();
		}
	}
	/**
	 * Parse the url request  
	 */
	function getUrlParam( $param ){
		if( isset( $_REQUEST[ $param ] ) ){
			return $_REQUEST[ $param ];
		}
	}
}