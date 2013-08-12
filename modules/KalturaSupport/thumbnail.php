<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */
// Include configuration: ( will include LocalSettings.php )
chdir( dirname( __FILE__ ) . '/../../' );
require_once( 'includes/DefaultSettings.php' );
require_once( dirname( __FILE__ ) . '/KalturaCommon.php' );

$thumbnail = new thumbnailEntry();
$thumbnail->redirectThumbnail();

class thumbnailEntry {
	var $entryResult = null; // lazy init
	
	function redirectThumbnail(){
		// We don't check access controls, this happens in the real player once embed
		$kEntryObject = $this->getEntryObject();
		try {
			$entryObject =  $kEntryObject->getResult();
		} catch ( Exception $e ){
				die( $e->getMessage() );
		}

		// Request params
		$width = $kEntryObject->request->get('width');
		$height = $kEntryObject->request->get('height');
		$vid_slices = $kEntryObject->request->get('vid_slices');
		$vid_sec = $kEntryObject->request->get('vid_sec');

		// Send public cache header for 5 min
		header("Cache-Control: public, max-age=300");
		
		if( isset (  $entryObject['meta']->thumbnailUrl ) ){
			$thumbUrl =  $entryObject['meta']->thumbnailUrl;
			// Only append width/height params if thumbnail from kaltura service ( could be external thumbnail )
			if( strpos( $thumbUrl,  "thumbnail/entry_id" ) !== false ){
				// Add with and height if available
				$thumbUrl .= $width ? '/width/' . intval( $width ) : '';
			  	$thumbUrl .= $height ? '/height/' . intval( $height ) : '';
			  	// add vid_slices support 
			  	$thumbUrl .= $vid_slices ? '/vid_slices/' . intval( $vid_slices ) : '';
			  	// add vid_sec support
			  	$thumbUrl .= $vid_sec ? '/vid_sec/' . intval( $vid_sec ) : '';
			}
			header( "Location: " . str_replace('sec','',$thumbUrl) );
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
	function getEntryObject(){
		global $container;
		if( ! $this->entryResult ){
			try {
				$this->entryResult =  $container['entry_result'];
			} catch ( Exception $e ){
				die( $e->getMessage() );
			}
		}
		return $this->entryResult;
	}
}
