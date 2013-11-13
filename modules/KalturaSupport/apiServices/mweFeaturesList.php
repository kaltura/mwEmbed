<?php

$wgMwEmbedApiServices['featuresList'] = 'mweFeaturesList';

class mweFeaturesList {
	function run(){
		header( 'Content-type: text/javascript');
		$features = include( dirname( __FILE__ ) . '/../../../docs/featureListiOS.php');
		echo json_encode( $features );
	}
}