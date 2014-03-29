<?php
/**
* This service supports sending parsing player config for the purpose of ad stitching delivery
*/
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class ServiceMediaSession extends BaseStreamService{
	var $resultObject = null;
	
	// Error video sources
	var $errorVideoEntries = array(
		'georestricted' => '1_vibqimym',
		'nosources' => '1_g18we0u3'
	);
	function __construct(){
		parent::__construct();
		// Create the hander
		$sessionSource = $this->getSessionSource();
		$this->setStreamUrl( $sessionSource['src'] );
	}
	function run(){
		global $wgEnableScriptDebug;
		$this->websocketLogger->send( "Service MediaSession: ");
		
		// don't directly output the stream for now iOS bug
		/*
		header( 'Content-Type: application/x-mpegurl');
		$streamHandler = $this->getStreamHandler();
		echo $streamHandler->getManifest();
		*/
		
		// x-discontinuity only works on a single stream for iOS, redirect:
		// TODO fix ugly hack here:
		header( 'Content-Type: application/x-mpegurl');
		echo $this->getSingleOutputStream();
	}
	function getSingleOutputStream(){
		$streamHandler = $this->getStreamHandler();
		$manifestParts =  explode("\n", $streamHandler->getManifest() );
		// TODO be smarter about grabbing the 3rd line ? take into consideration other metadata? 
		$manifestUrl = $manifestParts[2];
		return file_get_contents( $manifestUrl );
	}
	function getSessionSource(){
		$entryKey = 'entry_sources_' . $this->request->get('entry_id');
		// cache sources 
		if( $this->cache->get( $entryKey ) ){
			return $this->cache->get( $entryKey );
		}
		// create new session 
		$kSources = new KalturaSources();
		$sources = $kSources->getSources();
		$this->websocketLogger->send( "MediaSession: getSources for: " .$this->request->get('entry_id'));
		// for now we only support 'application/vnd.apple.mpegurl' type
		foreach( $sources as $source){
			// technically there are iPadNew and iPhoneNew ( two Adaptive sets ) 
			// We may want to consolidate now that bugs around Adaptive are not as common in iOS
			if( $source['type'] == 'application/vnd.apple.mpegurl' ){
				$this->websocketLogger->send( "MediaSession: HLS source: " . $source['type']);
				$this->cache->set( $entryKey, $source ); 
				return $this->cache->get( $entryKey );
			}
		}
		// error out if no
		return array();
	}
	
}