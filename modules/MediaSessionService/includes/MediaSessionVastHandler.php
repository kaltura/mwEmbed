<?php 
/**
 * Handles all the Vast request parsing, ingest of stream and return of VAST HLS compatible top level m3u8
 * @author Michael
 */
class MediaSessionVastHandler {
	var $vastXML = null;
	function __construct( $vastUrl ){
		global $container;
		$this->vastUrl = $vastUrl;
		$this->websocketLogger = $container['websocket_logger'];
	}
	function getVastXML(){
		if( $this->vastXML === null){
			$this->websocketLogger->send( "Loading VAST xml with x-forward-for:" . $_SERVER['REMOTE_ADDR'] );
			$this->websocketLogger->send( "Vast URL:" . $this->vastUrl );
			// TODO clean up simplePHPXMLProxy.php to be a normal service class with methods for output types
			$_GET['url'] = $this->vastUrl;
			ob_start();
			include(  dirname( __FILE__ ) . '/../../../simplePhpXMLProxy.php');
			$vastJson = ob_get_clean();
			// decode json response:
			$vastObj = json_decode($vastJson);
			// check that we got valid response:
			if( $vastObj->status->http_code == 'ERROR' ){
				// error in getting vast ( TODO log it somewhere )
				// return empty vast stream
				$this->vastXML =  false;
			}
			// parse XML
			$this->vastXML = new SimpleXMLElement( $vastObj->contents );
		}
		return $this->vastXML;
	}
	/**
	* returns the "important parts" of the vast object ( for server side vast sequencing ) 
	* ads -> array -- can include multiple "ads" ( ad Pods multiple ads sequenced )
	* 	MediaFiles -> 
	* 		duration
	* 		delivery="progressive" 
	* 		type="video/mp4" 
	* 		bitrate="1500" 
	* 		width="720" 
	* 		height="480"
	* 		url
	* 	TrackingEvents -> array
* 			eventName
* 			beaconUrl
	* 
	* Other Aspects ( companions etc, should be handled in client lib )
	* 
	*/
	function getVast(){
		// get the vast URL passing on user header: 
		$vastXML = $this->getVastXML();
		if( $vastXML == false){
			return false;
		}
		$vastAds = array();
		// TODO check for multiple adPods
		// else try and get the mediaSources
		// support adPods: 
		foreach( $vastXML->Ad as $vastAd){
			foreach( $vastAd->{'InLine'}->{'Creatives'} as $creatives ){
				foreach( $creatives->{'Creative'} as $creative){
					// check if the creative is of type Linear ( don't handle companions for now )
					if( $creative->{'Linear'} ){
						$vastAds[] = $this->getLinearAd( $creative->{'Linear'} );
					}
				}
			}
		}
		return $vastAds;
	}
	function getLinearAd( $linearXml ){
		$adObject = array();
		if( $linearXml->{'Duration'} ){
			$adObject['duration'] = (string)$linearXml->{'Duration'};
		}
		if( $linearXml->{'TrackingEvents'} ){
			$adObject['tracking']=array();
			foreach($linearXml->{'TrackingEvents'}->Tracking as $tracking ){
				$adObject['tracking'][] = array(
					'eventName' => (string) $tracking['event'],
					'beaconUrl' => trim( (string) $tracking )
				);
			}
		}
		if( $linearXml->{'MediaFiles'} ){
			$adObject['mediaFiles'] = array();
			foreach( $linearXml->{'MediaFiles'}->MediaFile as $mediaFile ){
				$mediaFileObj = array();
				foreach($mediaFile->attributes() as $k => $v){
					$mediaFileObj[$k] = (string)$v;
				}
				$mediaFileObj['url'] = trim( (string)$mediaFile );
				// add the mediaFile Object:
				$adObject['mediaFiles'][] =$mediaFileObj;
			}
			
		}
		// return the media object
		return $adObject;
	}
}