<?php

require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class ServiceM3u8Stream extends BaseStreamService{
	// the parsed stream handler:
	var $streamHandler = null;
	function run(){
		$this->websocketLogger->send( "Using HLS stream: " . $_REQUEST['RESOLUTION'] . ' br:' . $_REQUEST['BANDWIDTH'] );
		// get the stream url:
		$this->setStreamUrl( $this->request->get('streamUrl') );
		// grab and parse the base content m3u8
		$this->streamHandler = $this->getStreamHandler();
		$this->streamHandler->setServiceParams(
			array(
				'uiconf_id' => $this->request->getUiConfId(),
				'wid' => $this->request->getWidgetId(),
				'entry_id' => $this->request->getEntryId(),
				'guid' => $this->getGuid(),
			)
		);
		// check for vast sequence:: 
		$vastConfig =$this->getVastConfig() ;
		if( !empty( $vastConfig ) ){
			$this->websocketLogger->send( "Ads found in player config: " . $this->request->getUiConfId() );
			$this->handleVastSequence();
		}
		header( 'Content-Type: application/x-mpegurl');
		echo $this->streamHandler->getManifest();
	}
	function getVastConfig(){
		$playerConfig = $this->uiConfResult->getPlayerConfig();
		if( isset( $playerConfig['plugins']['vast'] ) ){
			return $playerConfig['plugins']['vast'];
		}
		// empty result
		return array();
	}
	/**
	 * Checks for preroll, postroll and midroll / cuePoints,
	 * issues VAST requests, and streamHandler calls
	 * @param unknown $vastConfig
	 */
	function handleVastSequence(){
		$vastConfig = $this->getVastConfig();
		// check for preroll
		
		// check if we need to load cuePoints:
		if( isset( $vastConfig['trackCuePoints'] ) && $vastConfig['trackCuePoints'] == true ){
			$this->handleVastCuePoints();
		}
	}
	function handleVastCuePoints(){
		$this->websocketLogger->send( "handleVastCuePoints" );
		// get entry cuePoints: 
		$entryResult = $this->entryResult->getResult();
		if( isset( $entryResult['entryCuePoints'] ) ){
			// look for vast ad cuePoints: 
			foreach( $entryResult['entryCuePoints'] as $cuePoint ){
				if( $cuePoint->cuePointType == 'adCuePoint.Ad' ){
					// request vast url: 
					if( $cuePoint->sourceUrl ){
						$vastHandler = new MediaSessionVastHandler( $cuePoint->sourceUrl );
					}
					// check for URL and timing: 
					$this->streamHandler->addToSequence( 
						$cuePoint->startTime/1000, // store in float seconds
						$vastHandler->getVast()
					);
				}
			}
		}
	}
}