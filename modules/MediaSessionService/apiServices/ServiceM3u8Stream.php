<?php

require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class ServiceM3u8Stream extends BaseStreamHandler{
	
	function run(){
		// get the stream url:
		$this->setStreamUrl( $this->request->get('streamUrl') );
		// grab and parse the base content m3u8
		$parsedStream = $this->getParsedStream();
		$parsedStream->setServiceParams(
			array(
				'uiconf_id' => $this->request->getUiConfId(),
				'wid' => $this->request->getWidgetId(),
				'entry_id' => $this->request->getEntryId(),
				// TODO uuid
			)
		);
		header( 'Content-Type: application/x-mpegurl');
		// parse content inject any ads 
		echo $parsedStream->getManifest();
	}
}