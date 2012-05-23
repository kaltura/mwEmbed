<?php
/**
* This file enables slow javascript response for testing blocking scripts relative to player embeds
*/
$wgMwEmbedApiServices['sleepTest'] = 'mweApiKSTest';

class mweApiKSTest {
	function run(){
		// load library and get ks for given entry:
		echo "document.write('<br> 2 second long script done loading id:" . $waitTime . "');";
	}
}