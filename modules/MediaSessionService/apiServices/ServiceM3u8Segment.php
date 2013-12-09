<?php 

class ServiceM3u8Segment extends BaseStreamService {
	function run(){
		// trigger you ad tracking event.
		// parse the service request, redirect to url:
		header('Location: ' . $this->request->get('streamUrl') );
	}
}