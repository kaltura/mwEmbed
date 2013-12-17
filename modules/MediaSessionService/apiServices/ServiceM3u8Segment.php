<?php 

class ServiceM3u8Segment extends BaseStreamService {
	function run(){
		if( isset( $_REQUEST['AdTrackingIds'] ) ){
			$this->sendTrackingBeacons( $_REQUEST['AdTrackingIds'] );
		}
		if( isset( $_REQUEST['ct'] ) ){
			// TODO send any analytics plugin beacons ( progress and ad events only )
			$this->websocketLogger->send( "Content Time:" . $_REQUEST['ct'] );
		}
		// trigger you ad tracking event.
		// parse the service request, redirect to url:
		header('Location: ' . $this->request->get('streamUrl') );
	}
	
	function sendTrackingBeacons( $adTrackingIds ){
		// get all the ids: 
		$trackingIds = explode(',', $adTrackingIds );
		foreach($trackingIds as $beaconKey){
			$beacon = $this->cache->get( $beaconKey );
			if( !$beacon ){
				// beacon is false ( must have already been sent ) 
				continue;
			}
			// clear out the beacon so that at most only one request can be sent. 
			$this->cache->set( $beaconKey, false);
			
			$this->websocketLogger->send( "Ad Event: " . $beacon['name'] );
			$this->websocketLogger->send( "Proxy Beacon:" .  $beacon['url'] );
			
			// track the actual beacon with user x-forward for
			$_GET['url'] = $beacon['url']; 
			ob_start();
			include(  dirname( __FILE__ ) . '/../../../simplePhpXMLProxy.php' );
			$output = ob_get_clean();
		}
	}
}