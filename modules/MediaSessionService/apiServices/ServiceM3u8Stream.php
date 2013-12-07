<?php

require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class ServiceM3u8Stream extends BaseStreamHandler{
	
	function __construct() {
		global $container;
		$this->request = $container['request_helper'];
		
	}
	function run(){
		// grab and parse the base content m3u8
		$m3u8Content = file_get_contents( $this->request->get('streamUrl') );
		//header( 'Content-Type: application/x-mpegurl');
		// parse content inject any ads 
		echo $m3u8Content;
		// pass all chunks through segment service
	}
}