<?php

class ServiceFeaturesList {
	function run(){
		header( 'Content-type: text/javascript');
		$features = include( dirname( __FILE__ ) . '/../../../docs/featureList.php');
		echo json_encode( $features );
	}
}