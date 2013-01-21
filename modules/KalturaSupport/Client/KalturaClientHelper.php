<?php

// Include the kaltura client
require_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
// Include the kaltura named multi request helper class: 
require_once(  dirname( __FILE__ ) . '/KalturaNamedMultiRequest.php');

class KalturaClientHelper {

	private $options = array();

	function __construct( $options ) {
		$this->options = $options;
	}

	private function getOption( $key ) {
		if( isset($this->options[ $key ] ) ) {
			return $this->options[ $key ];
		}
		return null;
	}

	function getClient() {

		// Check if client already exists
		if( ! $this->client ) {
			$conf = new KalturaConfiguration( null );

			$conf->serviceUrl = $this->getOption('ServiceUrl');
			$conf->serviceBase = $this->getOption( 'ServiceBase' );
			$conf->clientTag = $this->getOption('ClientTag');
			$conf->curlTimeout = $this->getOption('ServiceTimeout');
			$conf->userAgent = $this->getOption('UserAgent');
			$conf->verifySSL = false;
			$conf->requestHeaders = $this->getOption('RequestHeaders');

			if( $this->getOption('Logger') ) {
				$conf->setLogger( $this->getOption('Logger') );
			}
			
			$this->client = new KalturaClient( $conf );

			if( $this->getOption('KS') ) {
				$this->getKS( $this->getOption('KS') );
			} else if( $this->getOption('WidgetId') ) {
				$this->generateKS( $this->getOption('WidgetId') );
			}
		}

		return $this->client;		
	}

	public function generateKS( $widgetId ) {
		try{
			$session = $this->getClient()->session->startWidgetSession( $widgetId );
			$this->ks = $session->ks;
			$this->partnerId = $session->partnerId;
		} catch ( Exception $e ){
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
		}
		// Save KS to the client
		$this->getClient()->setKS( $this->ks );
		return $session;
	}

	public function setKS( $ks ) {
		if( isset($ks) ) {
			$this->ks = $ks;
		}
		$this->getClient()->setKS( $ks ) ;
	}

	public function getKS() {
		return ($this->ks) ? $this->ks : null;
	}
}