<?php

require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

/**
 * Media Sequence service returns playback sequence data for an hls stream.
 * This can include multiple concatenated entries, or ad timing info. 
 * 
 * Lack of ad availability can also be communicated to fallback on client 
 * requested ads. 
 * 
 * Request can include vast data to be sequenced. 
 *  
 * @author Michael
 */
class ServiceMediaSequence extends BaseStreamService {
	var $sequence = null;
	function run(){
		global $wgServer;
		$this->websocketLogger->send( "Service MediaSequence");
		// return a URL to media session with key
		
		// get the session key: 
		$sequenceKey = $this->getSequenceKey();
		// store the sequence: 
		$this->cache->set( $sequenceKey,  $this->getSequence() );
		
		$mediaSessionRequest = array(
			'service' => 'mediaSession',
			'wid' => $this->request->getWidgetId(),
			'uiconf_id' => $this->request->getUiConfId(),
			'entry_id' => $this->request->getEntryId(),
			'sequenceKey' => $sequenceKey
		);
		$jsonOut = json_encode( 
			array( 
				'url' => $wgServer . 'services.php?' . http_build_query( $mediaSessionRequest ),
				'sequence' => $this->getSequence()
			)
		);
		if( isset( $_REQUEST['callback'] ) ){
			header("Content-Type: text/javascript");
			echo filter_input( INPUT_GET, 'callback', FILTER_SANITIZE_STRING ) .
				 '(' . $jsonOut . ');';
		} else {
			header('Content-Type: application/json');
			header("Access-Control-Allow-Origin: *"); // send a header for access. 
			echo $jsonOut;
		}
	}
	function getSequenceKey(){
		$key = 'seq_' . md5( $this->getGuid() . serialize( $this->getSequence() ) );
		return $key;
	}
	/**
	 * Returns the sequence object stores what urls are available to ad stitched and their resulting duration
	 * this is passed back to the player so it can set up the virtual playhead.
	 * 
	 * Returns an array of items in the sequence 
	 * [{
	 * 	'type': 'preroll', // type can be preroll, content, midroll, or postroll
	 * 	'duration': 32.3 // time in seconds
	 * },
	 * {
	 * 	'type': 'content'
	 * 	'duration': 10 // time in seconds ( type content ) 
	 * },
	 * {
	 * 	'type': 'midroll'
	 * 	'duration': 10 // time in seconds ( type content ) 
	 * }
	 * {
	 * 	'type': 'content'
	 * 	'duration': 300 // time in seconds ( type content ) 
	 * },
	 * ];
	 */
	function getSequence(){
		if( $this->sequence ){
			return $this->sequence;
		}
		$this->sequence = array();
		// get the ad sequence array: 
		$adSet = $_REQUEST['ads'];
		// sequence all prerolls: 
		if( isset( $adSet['preroll'] ) ){
			foreach( $adSet['preroll'] as $preroll ){
				
				$kAdsHandler = new KalturaAdUrlHandler( $preroll['src'] );
				
				// See if the HLS URL is available now:
				if( $kAdsHandler->getHLSUrl() ){
					$this->websocketLogger->send( "Add PostRoll duration: " . $kAdsHandler->getDuration() );
					// push to sequence: 
					$this->sequence[] = array(
						'src' => $preroll['src'],
						'type' => 'preroll',
						'duration' => $kAdsHandler->getDuration(),
						'vastId' => $preroll['vastId']
					);
				}
				// if not ready ( don't add to sequence ) 
				// TODO have the client try and play the ad anyway ( without HLS stitching ) 
			}
			// Get all the cuePoints
			if( isset( $adSet['cuepoints']) ){
				foreach( $adSet['cuepoints'] as $cuePoint ){
					// TODO handle cuePoitns
				}
			}
			
			// TODO map in cuePoints to to content segments!
			$this->sequence[] = array(
				'type' => 'content',
				'duration' => $this->getEntryDuration()
			);
			
			if( isset($adSet['postroll'] ) ){
				foreach( $adSet['postroll'] as $postroll ){
					$kAdsHandler = new KalturaAdUrlHandler( $postroll['src'] );
					// See if the HLS URL is available now:
					if( $kAdsHandler->getHLSUrl() ){
						// push to sequence:
						$this->sequence[] = array(
							'src' => $postroll['src'],
							'type' => 'postroll',
							'duration' => $kAdsHandler->getDuration(),
							'vastId' => $postroll['vastId']
						);
					}
					// if not ready ( don't add to sequence )
				}
			}
		}
		return $this->sequence;
	}
	function getEntryDuration(){
		$entryResult = $this->entryResult->getResult();
		// TODO THROW an error ( could not get duration from principal entry
		$duration = floatval( $entryResult['meta']->duration);
		return $duration;
	}
}