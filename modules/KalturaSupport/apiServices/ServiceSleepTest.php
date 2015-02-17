<?php
/**
* This file enables slow javascript response for testing blocking scripts relative to player embeds
*/
class ServiceSleepTest {
	function run(){
		$waitTime = intval( $_REQUEST['waitTime'] );
		if( $waitTime > 30 || $waitTime < 0 ) {
			$waitTime = 30;
		}
		// Have the script take waitTime seconds to run:
		sleep( $waitTime );
		header("Content-type: text/javascript");
		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Pragma: no-cache");
		echo "document.write('<br> 2 second long script done loading id:" . $waitTime . "');";
	}
}