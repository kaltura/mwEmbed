<?php 

class ServiceM3u8Segment extends BaseStreamService {
	function run(){
		$this->websocketLogger->send( "Requested Segment" );
		if( $_REQUEST['AdTrackingKey'] ){
			$this->websocketLogger->send( "Ad Segment Tracking Key: " . $_REQUEST['AdTrackingKey'] );
		}
		// trigger you ad tracking event.
		// parse the service request, redirect to url:
		header('Location: ' . $this->request->get('streamUrl') );
	}
}