<?php 

class ServiceM3u8Segment extends BaseStreamService {
	function run(){
		// trigger you ad tracking events
		if( isset( $_REQUEST['AdTrackingIds'] ) ){
			$this->sendTrackingBeacons( $_REQUEST['AdTrackingIds'] );
		}
		// check current time: 
		if( isset( $_REQUEST['ct'] ) ){
			// TODO send any analytics plugin beacons ( progress and ad events only )
			$this->websocketLogger->send( "Content Time:" . $_REQUEST['ct'] );
		}
		
		// redirect to target content
		$this->handleSegment();
		
	}
	function handleSegment(){
		// check the uuid
		$targetEntry = new ServiceMediaSessionTargetEntry();
		$targetEntryId = $this->cache->get( $targetEntry->getTargetKey()  );
		
		// check entry matches current stream: 
		if( $this->request->get("entry_id") == $targetEntryId ){
			// redirect to content url:
			header('Location: ' . $this->request->get('streamUrl') );
			return ;
		}
		// Else we need redirect to target entry: 
		$this->redirectTargetSegment( $targetEntryId );
	}
	function redirectTargetSegment( $targetEntryId ){
		// get the HLS stream for that entry ( assume same account ) 
		$this->request->set('entry_id', $targetEntryId );
		// change the entry: 
		$newTargetEntryStream = new ServiceMediaSession();
		$targetEntrySegments = explode("\n",$newTargetEntryStream->getSingleOutputStream() );
		// search for the current time segment ( and redirect to that instead
		foreach ($targetEntrySegments as $inx => $line ){
			if( substr( $line, 0, 1 ) == '#' ){
				continue;
			}
			$parsedUrl = parse_url( $line );
			if( $parsedUrl !== false && isset( $parsedUrl['query'] ) ){
				$currentSegmentParms = array();
				$queryParts = explode( '&', $parsedUrl['query'] );
				foreach($queryParts as $arg){
					list( $key, $val) = explode('=', $arg);
					$currentSegmentParms[ $key ] = $val;
				}
				// found time match redirect to this instead:
				if( $currentSegmentParms['ct'] == $_REQUEST['ct'] ){
					header('Location: ' . urldecode( $currentSegmentParms['streamUrl'] ) );
					return ;
				}
			}
		}
		// failed to redirect to associated entry ( just use the default streamURL )
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