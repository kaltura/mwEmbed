<?php
/**
* This file enables slow javascript response for testing blocking scripts relative to player embeds
*/
$wgMwEmbedApiServices['sleepTest'] = 'mweApiSleepTest';

class mweApiSleepTest {
	function run(){
		$waitTime = intval( $_REQUEST['id'] );
		// Have the script take 10 seconds to run:
		sleep( $waitTime );
		header("Content-type: text/javascript");
		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Pragma: no-cache");
		
		echo "document.write('<br> 2 second long script done loading id:" . $waitTime . "');";
	}
}