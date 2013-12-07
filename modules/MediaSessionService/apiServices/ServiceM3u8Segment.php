<?php 

class ServiceM3u8Segment extends BaseStreamHandler {
	function run(){
		// parse the service request, redirect to url:
		header('Location: ' . $this->request->get('streamUrl') );
	}
}