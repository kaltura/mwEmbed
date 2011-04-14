<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server, something maybe broken or server is under high load. Please try again.");

// Include configuration: ( will include LocalSettings.php )
require_once( realpath( '../../' ) . '/includes/DefaultSettings.php' );

$download = new downloadEntry();
$download->redirectDownload();

class downloadEntry {
	var $resultObject = null; // lazy init
	
	/**
	 * The result object grabber, caches a local result object for easy access
	 * to result object properties. 
	 */
	function getResultObject(){
		global $wgMwEmbedVersion;
		if( ! $this->resultObject ){
			require_once( dirname( __FILE__ ) .  '/KalturaGetResultObject.php' );
			$this->resultObject = new KalturaGetResultObject( 'html5download:' . $wgMwEmbedVersion );
			try{
				// Init a new result object with the client tag: 
				$this->resultObject = new KalturaGetResultObject( 'html5download:' . $wgMwEmbedVersion );;
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}		
	// Errors set special X-Kaltura and X-Kaltura-App: header and then deliver the no sources video
	private function fatalError( $errorMsg ) {
		header( "X-Kaltura: error-6" );
		header( "X-Kaltura-App: exiting on error 6 - requested flavor was not found" );
		header( "X-Kaltura-Error: " . htmlspecialchar( $errorMsg ) );
		// Then redirect to no-sources video: 
		$sources = $this->getResultObject()->getErrorVideoSources();		
		$this->redirectDownload( $sources );
		exit(1);
	}
	
	function redirectDownload( $sources = false ) {
		if( !$sources ){
			$sources =  $this->getResultObject()->getSources();
		}
		try{
			$flavorUrl = $this->getResultObject()->getSourceForUserAgent( $sources );
		} catch ( Error $e ){
			$this->fatalError( $e->getMessage() );
		}
		// Redirect to flavor
		header("location: " . $flavorUrl);
	}

}

?>