<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */
// Include configuration: ( will include LocalSettings.php )
chdir( dirname( __FILE__ ) . '/../../' );
require_once( 'includes/DefaultSettings.php' );
$thumbnail = new thumbnailEntry();
$thumbnail->redirectThumbnail();

class thumbnailEntry {
	var $resultObject = null; // lazy init
	
	function redirectThumbnail(){
		// We don't check access controls, this happens in the real player once embed
		$kResultObject = $this->getResultObject();
		$resultObject =  $kResultObject->getEntryResult();

		// Send public cache header for 5 min
		header("Cache-Control: public, max-age=300");
		
		if( isset (  $resultObject['meta']->thumbnailUrl ) ){
			$thumbUrl =  $resultObject['meta']->thumbnailUrl;
			// Only append width/height params if thumbnail from kaltura service ( could be external thumbnail )
			if( strpos( $thumbUrl,  "thumbnail/entry_id" ) !== false ){
				// Add with and height if available
				$thumbUrl .= isset( $kResultObject->urlParameters['width'] )? 
			 				'/width/' . intval( $kResultObject->urlParameters['width'] ):
			  				'';
			  	$thumbUrl .= isset( $kResultObject->urlParameters['height'] )? 
							'/height/' . intval( $kResultObject->urlParameters['height'] ):
			  				'';
			  	// add vid_slices support 
			  	$thumbUrl.= isset( $kResultObject->urlParameters['vid_slices'] ) ?
			  				'/vid_slices/' . intval( $kResultObject->urlParameters['vid_slices'] ):
			  				'';
			  	// add vid_sec support
			  	$thumbUrl.= isset( $kResultObject->urlParameters['vid_sec'] ) ?
			  				'/vid_sec/' . intval( $kResultObject->urlParameters['vid_sec'] ):
			  				'';
			}
			header( "Location: " . $thumbUrl );
		} else {
			// retrun a 1x1 black pixle:
			header('Content-Type: image/gif');
			echo base64_decode('R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==');
		}
	}
	
	/**
	 * The result object grabber, caches a local result object for easy access
	 * to result object properties. 
	 */
	function getResultObject(){
		global $wgMwEmbedVersion;
		if( ! $this->resultObject ){
			require_once( dirname( __FILE__ ) .  '/KalturaEntryResult.php' );
			try {
				$this->resultObject = new KalturaEntryResult( 'html5thumbnail:' . $wgMwEmbedVersion );
			} catch ( Exception $e ){
				die( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
}
