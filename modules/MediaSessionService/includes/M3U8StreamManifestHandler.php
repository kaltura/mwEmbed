<?php

class M3U8StreamManifestHandler extends BaseStreamHandler{
	
	function __construct( $contentUrl ) {
		global $container;
		$this->request = $container['request_helper'];
		$this->contentUrl = $contentUrl;
	}
	
	function serveSession(){
		// Grab and parse the base content m3u8
		$m3u8Content = @file_get_contents( $this->contentUrl );
		// Replace all the urls with kaltura service urls
		$m3u8Parser = new M3u8Parser( $m3u8Content );
		$m3u8Parser->setServiceParams( 
			array(
				'uiconf_id' => $this->request->getUiConfId(),
				'wid' => $this->request->getWidgetId(),
				'entry_id' => $this->request->getEntryId(),
					
				// TODO uuid
			) 
		);
		
		// send header and StreamList output: 
		// header( 'Content-Type: application/x-mpegurl');
		echo $m3u8Parser->getM3u8Manifest();
	}
}