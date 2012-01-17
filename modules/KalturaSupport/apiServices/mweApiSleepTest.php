<?php
/**
* This file enables slow javascript response for testing blocking scripts relative to player embeds
*/
$wgMwEmbedApiServices['sleepTest'] = 'mweApiSleepTest';

class mweApiSleepTest {
	function run(){
		// don't block other php exec: 
		session_write_close();
		// Have the script take 10 seconds to run:
		sleep( 10 );
		header("Content-type: text/javascript");
		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Pragma: no-cache");
		echo "document.write('<br> 10 second long script done loading');";
	}
}