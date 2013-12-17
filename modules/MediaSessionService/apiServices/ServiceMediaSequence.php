<?php

require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

/**
 * Media Sequence service returns playback sequence data for an hls stream.
 * This can include multiple contantinated entries, or ad timing info. 
 * 
 * Lack of ad availability can also be communicated to fallback on client 
 * requested ads. 
 * 
 * Request can include vast data to be sequenced. 
 *  
 * @author Michael
 */
class ServiceMediaSequence extends BaseStreamService {
	function run(){
		// returns an object
		
	}
}