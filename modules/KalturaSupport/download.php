<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server, something maybe broken or server is under high load. Please try again.");

// Include configuration: ( will include LocalSettings.php )
require( realpath( '../../' ) . '\includes\DefaultSettings.php' );

$download = new downloadEntry();
$download->redirectDownload();

class downloadEntry {

	/**
	 * Variables set by the Frame request:
	 */
	private $urlAttributes = array(
		'wid' => null,
		'entry_id' => null,
	);

	function __construct(){
		//parse input:
		$this->parseRequest();
	}

	// Parse the embedFrame request and sanitize input
	private function parseRequest(){
		// Support /key/value request type:

		if( isset( $_SERVER['PATH_INFO'] ) ){
			$urlParts = explode( '/', $_SERVER['PATH_INFO'] );
			foreach( $urlParts as $inx => $urlPart ){
				foreach( $this->urlAttributes as $attributeKey => $na){
					if( $urlPart == $attributeKey && isset( $urlParts[$inx+1] ) ){
						$_REQUEST[ $attributeKey ] = $urlParts[$inx+1];
					}
				}
			}
		}
		// Check for player attributes:
		foreach( $this->urlAttributes as $attributeKey => $na){
			if( isset( $_REQUEST[ $attributeKey ] ) ){
				$this->urlAttributes[ $attributeKey ] = htmlspecialchars( $_REQUEST[$attributeKey] );
			}
		}

		// Check for required config
		if( $this->urlAttributes['wid'] == null || $this->urlAttributes['entry_id'] == null ){
			$this->outputError( 'Can not download entry, missing widget id / entry id.' );
		}
	}

	private function outputError( $error ) {
		die( $error );
	}

	private function getCacheDir(){
		global $mwEmbedRoot, $wgScriptCacheDirectory;
		$cacheDir = $wgScriptCacheDirectory . '/iframe';
		// make sure the dir exists:
		if( ! is_dir( $cacheDir) ){
			@mkdir( $cacheDir, 0777, true );
		}
		return $cacheDir;
	}

	function getClient(){
		global $mwEmbedRoot, $wgKalturaUiConfCacheTime, $wgKalturaServiceUrl, $wgScriptCacheDirectory;

		// Include the kaltura client
		include_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
		
		$cacheDir = $wgScriptCacheDirectory;

		$cacheFile = $this->getCacheDir() . '/' . $this->getPartnerId() . ".ks.txt";
		$cacheLife = $wgKalturaUiConfCacheTime;

		$conf = new KalturaConfiguration( $this->getPartnerId() );
		$conf->serviceUrl = $wgKalturaServiceUrl;
		$client = new KalturaClient( $conf );

		// Check modify time on cached php file
		$filemtime = @filemtime($cacheFile);  // returns FALSE if file does not exist
		if ( !$filemtime || filesize( $cacheFile ) === 0 || ( time() - $filemtime >= $cacheLife ) ){
			try{
		    	$session = $client->session->startWidgetSession( $this->urlAttributes['wid'] );
		    	$this->ks = $session->ks;
		    	file_put_contents( $cacheFile,  $this->ks );
			} catch ( Exception $e ){
				$this->outputError( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			}
		} else {
		  	$this->ks = file_get_contents( $cacheFile );
		}
		// Set the kaltura ks and return the client
		$client->setKS( $this->ks );

		return $client;
	}

	function getPartnerId(){
		// Partner id is widget_id but strip the first character
		return substr( $this->urlAttributes['wid'], 1 );
	}

	function getUserAgent() {
		return $_SERVER['HTTP_USER_AGENT'];
	}
	
	private function getFlavorSources(){
		global $wgKalturaServiceUrl, $wgKalturaCDNUrl, $wgKalturaUseManifestUrls;
		
		// Get Kaltura Client
		$client = $this->getClient();
		if( ! $client ){
			return array();
		}

		$resultObject = $client->flavorAsset->getByEntryId( $this->urlAttributes['entry_id'] );
		// add any web sources
		$sources = array();
		
		foreach( $resultObject as $KalturaFlavorAsset ){	 
			if( $wgKalturaUseManifestUrls ){
				// New asset url using playManifest
				$assetUrl =  $wgKalturaServiceUrl .'/p/' . $this->getPartnerId() . '/sp/' .
				$this->getPartnerId() . '00/playManifest/entryId/' .
				$this->urlAttributes['entry_id'];	

				// If we have apple http steaming then use it for ipad & iphone instead of regular flavors
				if( strpos( $KalturaFlavorAsset->tags, 'applembr' ) !== false ) {
					$assetUrl .= '/format/applehttp/protocol/http';
	
					$sources['applembr'] = array(
						'src' => $assetUrl . '/a.m3u8',
						'type' => 'application/vnd.apple.mpegurl',
						'data-flavorid' => 'AppleMBR'
					);
				} else {
					$assetUrl .= '/flavorId/' . $KalturaFlavorAsset->id . '/format/url/protocol/http';
				}
				
			} else {
				$assetUrl =  $wgKalturaCDNUrl .'/p/' . $this->getPartnerId() . '/sp/' . 
					$this->getPartnerId() . '00/flvclipper/entry_id/' . 
					$this->urlAttributes['entry_id'] . '/flavor/' . 	$KalturaFlavorAsset->id;				
			}
			

			if( strpos( $KalturaFlavorAsset->tags, 'iphone' ) !== false ){
				$sources['iphone'] = array(
					'src' => $assetUrl . '/a.mp4',
					'type' => 'video/h264',
					'data-flavorid' => 'iPhone'
				);
			};
			if( strpos( $KalturaFlavorAsset->tags, 'ipad' ) !== false ){
				$sources['ipad'] = array(
					'src' => $assetUrl  . '/a.mp4',
					'type' => 'video/h264',
					'data-flavorid' => 'iPad'
				);
			};

			if( $KalturaFlavorAsset->fileExt == 'webm' ){
				$sources['webm'] = array(
					'src' => $assetUrl . '/a.webm',
					'type' => 'video/webm',
					'data-flavorid' => 'webm'
				);
			}

			if( $KalturaFlavorAsset->fileExt == 'ogg' || $KalturaFlavorAsset->fileExt == 'ogv'
				|| $KalturaFlavorAsset->fileExt == 'oga'
			){
				$sources['ogg'] = array(
					'src' => $assetUrl . '/a.ogg',
					'type' => 'video/ogg',
					'data-flavorid' => 'ogg'
				);
			};
			if( $KalturaFlavorAsset->fileExt == '3gp' ){
				$sources['3gp'] = array(
					'src' => $assetUrl . '/a.3gp',
					'type' => 'video/3gp',
					'data-flavorid' => '3gp'
				);
			};
		}
                //echo '<pre>'; print_r($sources); exit();
		return $sources;
	}

	function redirectDownload() {

		// Get all sources
		$sources = $this->getFlavorSources();
		
		// Get user agent
		$userAgent = $this->getUserAgent();

		// Select the right source based on user agent

		if( strpos( $userAgent, 'iphone' ) !== false ){
			$flavorUrl = $sources['iphone']['src'];
		} else if( strpos( $userAgent, 'BlackBerry' ) !== false ){
			$flavorUrl = $sources['iphone']['src'];
		} else if( strpos( $userAgent, 'Android' ) !== false ){
			$flavorUrl = $sources['iphone']['src'];
		} else if( strpos( $userAgent, 'Nokia' ) !== false ){
			$flavorUrl = $sources['iphone']['src'];
		} else if ( isset( $sources['3gp'] ) ){
			$flavorUrl = $sources['3gp']['src'];
		} else {
			$flavorUrl = $sources['iphone']['src'];
		}

		//die( '<a href="' . $flavorUrl . '">' . $flavorUrl .'</a>');
		// Redirect to flavor
		header("location: " . $flavorUrl);
	}

}

?>