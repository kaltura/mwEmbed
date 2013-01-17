<?php
/**
* This file enables slow javascript response for testing blocking scripts relative to player embeds
*/
$wgMwEmbedApiServices['KSTest'] = 'mweApiKSTest';

// Include the kaltura client
require_once(  dirname( __FILE__ ) . '../../kaltura_client_v3/KalturaClient.php' );

class mweApiKSTest {
	function run(){
		global $wgKalturaAdminSecret;
		// validate params ( hard coded to test a particular test file / account )
		if( !isset( $_REQUEST['wid'] ) ||  $_REQUEST['wid'] != '_243342' ){
			$this->outputError( 'bad widget param');
		}
		$this->partnerId = '243342';
		if( !isset( $_REQUEST['entry_id'] ) || $_REQUEST['entry_id'] != '1_20x0ca3l' ){
			$this->outputError( 'bad entry_id param');
		}
		$this->entryId = '1_20x0ca3l';
		
		// load library and get ks for given entry:
		if( !isset( $wgKalturaAdminSecret ) || ( $wgKalturaAdminSecret == null ) ) {
			$this->outputError( 'no admin ks configured');
		}
	
		$client = $this->getClient();
		$ks = $client->session->start ( $wgKalturaAdminSecret, 
				$_SERVER['REMOTE_ADDR'], 
				KalturaSessionType::ADMIN, 
				$this->partnerId, 
				null, 
				"sview:{$this->entryId}"
			);
		header( 'Content-type: text/javascript');
		print json_encode(array('ks' => $ks ) );
	}
	function getClient(){
		$conf = new KalturaConfiguration( $this->partnerId );
		$conf->serviceUrl = $this->getServiceConfig( 'ServiceUrl' );
		$conf->serviceBase = $this->getServiceConfig( 'ServiceBase' );
		return new KalturaClient( $conf );
	}
	function getServiceConfig( $name ){
		switch( $name ){
			case 'ServiceUrl' : 
				global $wgKalturaServiceUrl;
				return $wgKalturaServiceUrl;
				break;
			case 'ServiceBase':
				global $wgKalturaServiceBase;
				return $wgKalturaServiceBase;
				break;
		}
	}
	function outputError( $msg ){
		header( 'Content-type: text/javascript');
		json_encode(array( 'error' => $msg  ) );
		exit(1);
	}
};