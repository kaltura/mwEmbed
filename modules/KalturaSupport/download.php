<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */
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
			require_once( dirname( __FILE__ ) .  '/KalturaResultObject.php' );
			$this->resultObject = new KalturaResultObject( 'html5download:' . $wgMwEmbedVersion );
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
		$flavorUrl = $this->getResultObject()->getSourceForUserAgent( $sources );
		header( "location: " . $flavorUrl );
		exit(1);
	}
	
	function redirectDownload() {
		$sources =  $this->getResultObject()->getSources();
		$flavorUrl = $this->getResultObject()->getSourceForUserAgent( $sources );
		// Redirect to flavor
		header( "location: " . $flavorUrl );
	}
}
