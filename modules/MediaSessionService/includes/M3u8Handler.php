<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );
require_once( dirname( __FILE__ ) . '/WebsocketLogger.php' );

class M3u8Handler {
	// the m3u8 mime type: 
	var $mimeType = 'application/vnd.apple.mpegurl';
	// store stream meta data tags ( see parser )
	var $meta = array();
	var $metaFooters = array();
	// stores stream tags ( see parser )
	var $streams = array();
	
	var $streamLinePattern = '/\#([^:]*):(.*)/'; 
	function __construct( $baseM3u8 ){
		global $container;
		// TODO support standard config cache handler 
		// or don't use "cache" for beacon keys in the first place!
		$this->cache = new KalturaCache( $container['file_cache_adapter_seralized'] );
		
		$this->websocketLogger = $container['websocket_logger'];
		$this->request =  $container['request_helper'];
		
		$this->M3u8Content = $baseM3u8;
		$this->parse();
	}
	/**
	 * Parse the m3u8 gets "comments", and per url stream info
	 */
	private function addMeta( $inx, $metaObj ){
		$this->meta[$inx] = $metaObj;
	}
	// TODO include metadata parsing ( so that we can substitute where needed )
	private function getMetaHeaders(){
		$o='';
		foreach( $this->meta as $metaObj){
			foreach( $metaObj as $metaName => $metaValue ){
				$o.= '#' . $metaName;
				if( trim( $metaValue) !=''){
					$o.=':' . $metaValue;
				}
				$o.="\n";
			}
		}
		return $o;
	}
	private function addMetaFooter( $inx, $metaObj ){
		$this->metaFooters[$inx] = $metaObj;
	}
	private function getMetaFooters(){
		$o='';
		foreach( $this->metaFooters as $metaObj){
			foreach( $metaObj as $metaName => $metaValue ){
				$o.= '#' . $metaName;
				if( trim( $metaValue) !=''){
					$o.=':' . $metaValue;
				}
				$o.="\n";
			}
		}
		return $o;
	}
	private function addStream( $inx, $stream ){
		$this->streams[$inx] = $stream;
	}
	private function getStreams(){
		$o='';
		$currentTime = 0;
		foreach( $this->streams as $stream ){
			// check for DISCONTINUITY
			if( isset( $stream ['insertBefore'] ) ){
				$o.= $stream ['insertBefore'];
			}
			if( isset( $stream['duration'] ) ){
				$currentTime += $stream['duration'];
			}
			// output the stream def line:
			$o.= '#' . $stream['type'] . ':' . $this->getPropsLine( $stream['props'] ) . "\n";
			// output the stream URL with respective substitution if needed:
			$o.= $this->getStreamUrl( $stream, array('ct' => $currentTime ) ) . "\n";
			// check for DISCONTINUITY 
			if( isset( $stream ['insertAfter'] ) ){
				$o.= $stream ['insertAfter']; 
			}
		}
		return $o;
	}
	private function getStreamUrl( $stream, $extraParams = array() ){
		$serviceType = $this->getStreamServiceType( $stream['type'] );
		if( $serviceType == 'pass' ){
			return $stream['url'];
		}
		$localServiceParams = array(
			'streamUrl' => $stream['url']
		) ;
		if( isset( $stream['duration'] ) ){
			$localServiceParams['duration'] = $stream['duration'];
		}
		// Check if need to pass along a sequence key: 
		$sequenceKey = filter_input( INPUT_GET, 'sequenceKey', FILTER_SANITIZE_STRING );
		if( $sequenceKey ){
			$localServiceParams['sequenceKey']  = $sequenceKey;
		}
		// add any runtime passed data: 
		$localServiceParams= array_merge( $localServiceParams, $extraParams );
		// add stream metadata to service :
		if( $serviceType == 'm3u8Stream' ){
			$localServiceParams = array_merge( $localServiceParams, $stream['props']);
		}
		return $this->getServicePath() . "?service={$serviceType}&". http_build_query(
			array_merge( $this->serviceParams, $localServiceParams)
		);
	}
	private function getStreamServiceType( $type ){
		switch( $type ){
			case 'EXT-X-STREAM-INF':
				return 'm3u8Stream';
				break;
			case 'EXTINF':
				return 'm3u8Segment';
			break;
			default:
				return 'pass';
		}
	}
	private function getPropsLine( $props ){
		$o='';
		$coma = '';
		foreach( $props as $propName => $propValue ){
			$o.=$coma;
			$o.=$propName;
			if( trim( $propValue ) != '' ){
				$o.='=' . $propValue;
			}
			$coma =','; 
		}
		return $o;
	}
	/*
	 * Parses the meu8content
	 * 
	 * 	$meta -- include all comments part of the header
	 * 		key -- the original line number
	 * 		value -- the content of the comment ( can be further parsed if content is understood )
	 *  $streams -- include all streams
	 *  	key -- the original line number
	 *  	value: object:
	 *  		'url' -- the url to the stream can be m3u8 or transport segment
	 *  		'properties' -- parsed properties of the stream.
	 */
	private function parse(){
		$lines = explode( "\n", $this->M3u8Content );
		$streamProperties = array();
		$streamType = null;
		$segmentDuration = 0;
		foreach( $lines as $inx => $line ){
			// skip empty lines: 
			if( trim( $line) == '' ){
				continue;
			}
			// add meta to meta object
			if( substr( $line, 0, 1 ) == '#' ){
				// check for stream definition
				// stream definition should be passed to stream handler
				preg_match($this->streamLinePattern, $line, $matches);
				if( !isset( $matches[1] ) || !isset( $matches[2] ) ){
					
					// check for EXT-X-ENDLIST ( needs to go footer )
					if( $line == '#EXT-X-ENDLIST' ){
						$this->addMetaFooter( $inx, array( substr( $line, 1 ) => '' ) );
						continue;
					}
					
					// check for EXT-X-DISCONTINUITY
					if( $line == 'EXT-X-DISCONTINUITY' ){
						// TODO error out we can't support ad insertion on streams with ad inserts! 
						continue;
					}
					
					// add comments that don't include properties:
					$this->addMeta( $inx, array( substr( $line, 1 ) => '' ) );
					continue;
				}
				
				// check for streams: 
				if( $matches[1] == 'EXT-X-STREAM-INF' || $matches[1] == 'EXTINF' ){
					$streamType = $matches[1];
					$streamProperties = $this->getStreamProperties(  $matches[2] );
					if( $matches[1] =='EXTINF'){
						$segmentDuration = floatval( $matches[2] );
					}
				} else {
					// add meta object
					$this->addMeta( $inx, array( $matches[1] => $matches[2] ) );
				}
				continue;
			}
			// check if the line is a url rewrite to local service
			if( (bool)parse_url($line) ){
				// if a URL add to $streams with associated $streamProperties
				$stream = array(
					'url' => $line,
					'type' => $streamType,
					'props' => $streamProperties,
				);
				if($segmentDuration ){
					$stream['duration'] = $segmentDuration;
				}
				$this->addStream($inx-1, $stream);
				// reset the $streamProperties array, after added to output
				$streamProperties = array();
				$streamType = null;
			}
		}
	}
	private function getStreamProperties( $streamPropString ){
		$streamProperties = array();
		$streamParts = explode( ',', $streamPropString );
		foreach( $streamParts as $pairs){
			$parts = explode( '=', $pairs );
			if( !isset( $parts[1] )){
				$parts[1] = '';
			}
			$streamProperties[ $parts[0] ] = $parts[1];
		}
		return $streamProperties;
	}
	private function getServicePath(){
		global $wgResourceLoaderUrl;
		$loaderPath = str_replace( 'load.php', '', $wgResourceLoaderUrl );
		return $loaderPath . 'services.php';
	}
	private function addHLSUrltoSequence( $startTime, $duration, $hlsURL, $tracking = array() ){
		// TODO to refactor m3u8 handler a bit, to more cleanly reuse the parser
		$hlsContent = file_get_contents( $hlsURL );
		$adLines = explode( "\n", $hlsContent );
		// select the stream that matches whatever segment we are in ( client can switch quality )
		// note ads don't necessary have same flavor set, choose based on bitrate and size:  
		$isStreamSet = false;
		$streamUrl =null;
		foreach( $adLines as $line ){
			if( trim( $line )=='' ){
				continue;
			}
			if( substr( $line, 0, 1 ) == '#' ){
				preg_match($this->streamLinePattern, $line, $matches);
				if( isset($matches[1]) && $matches[1] == 'EXT-X-STREAM-INF' ){
					$isStreamSet=true;
				}
				continue;
			}
			// TODO select based on bitrate and size
			if( (bool)parse_url($line) ){
				$adSegmentsUrl = $line;
			}
		}
		// TODO we should match up ad stream selection to "current" active stream or nearest active anyway

		// get ad segments: 
		if( $isStreamSet ){
			$adSegmentsContent = file_get_contents( $adSegmentsUrl );
		} else {
			// in-case we got handed a stream directly ( not adaptive )
			$adSegmentsContent = $hlsContent;
		}
		$adSegmentsLines = explode( "\n", $adSegmentsContent );
		$adInsert = "#EXT-X-DISCONTINUITY\n";
		$adTime = 0;
		$trackedFirstAdSegment = false;
		
		foreach( $adSegmentsLines as $line ){
			if( trim( $line )=='' ){
				continue;
			}
			if( substr( $line, 0, 1 ) == '#' ){
				preg_match($this->streamLinePattern, $line, $matches);
				if( isset( $matches[1] ) && $matches[1] == 'EXTINF' ){
					// copy EXTINF directly in:
					$adInsert.= $line . "\n";
					if( isset($matches[2] ) ){
						// add time 
						$adTime += floatval( $matches[2] );
					}
				}
				// parse the stream duration. 
				// throw out other stream data ( we only want the segments for the insert )
				continue;
			}
			
			if( (bool)parse_url($line) ){
				// reset this ad tracking key
				$adTrackingKeys = array();
				// check current stream end-time against 
				if( $adTime ){
					if( $adTime > 0 ){
						$this->addEventKey($adTrackingKeys, $tracking, 'start');
						$this->addEventKey($adTrackingKeys, $tracking, 'creativeView');
					}
					if( $adTime > $duration * .25 ){
						$this->addEventKey($adTrackingKeys, $tracking, 'firstQuartile' );
					}
					if( $adTime > $duration * .5 ){
						$this->addEventKey($adTrackingKeys, $tracking, 'midpoint' );
					}
					if( $adTime > $duration * .75 ){
						$this->addEventKey($adTrackingKeys, $tracking, 'thirdQuartile' );
					}
					if( $adTime >= $duration ){
						$this->addEventKey($adTrackingKeys, $tracking, 'complete' );
					}
				}
				// for urls map back to adSegment service ( will trigger per-user tracking urls )
				$adInsert.=  $this->getStreamUrl(
					array(
						'type' => 'EXTINF',
						'url' => $line,
					), // TODO add better ad tracking support per segment durations and tracking targets
					array(
						'AdTrackingIds' => implode(',', $adTrackingKeys )
					)
				) . "\n";
			}
		}
		
		$adInsert.= "#EXT-X-DISCONTINUITY\n";
		
		// search for startTime segment target: 
		$currentTime = 0;
		foreach( $this->streams as &$stream ){
			// insert into first if $startTime == 0;
			if( $startTime == 0){
				$stream['insertBefore'] = $adInsert;
				break;
			}
			$currentTime = $currentTime + $stream['duration'];
			if( $startTime < $currentTime ){
				// insert after
				$stream['insertAfter'] = $adInsert;
				break;
			}
		}
	}
	/**
	 * addEventKey if found
	 * @param array $adTrackingKeys
	 * @param array $tracking
	 * @param string $eventName
	 * @return boolean
	 */
	private function addEventKey( &$adTrackingKeys, $tracking, $eventName ){
		global $wgKalturaAdminSecret;
		$beaconUrl = null;
		// find the eventName
		foreach( $tracking as $track ){
			if( $track['eventName'] == $eventName ){
				$beaconUrl = $track['beaconUrl'];
				break;
			}
		}
		if( !$beaconUrl ){
			//event not found: 
			return false;
		}
		// we are guaranteed to get guid at this point. 
		// salt our md5 seed to avoid targeted poisoning of the cache. 
		$key = md5( $wgKalturaAdminSecret . $beaconUrl . $this->request->get('guid') );
		// TODO Beacon key-> value pairs should not store in cache, because it does not have
		// persistence guarantees.  
		$this->cache->set( $key, array(
			'name' =>  $eventName,
			'url' => $beaconUrl
		), 24*60*60 ); // expire in 24 hours, postroll on a 24 hour long VOD?
		// add the tracking key: 
		$adTrackingKeys[] = $key;
	}
	private function getAdSegmentUrls(){
		return $this->getServicePath() . "?service={$serviceType}&". http_build_query(
			array_merge( $this->serviceParams, $localServiceParams)
		); 
	}

	/** PUBLIC METHODS **/
	
	public function setServiceParams( $serviceParams ){
		$this->serviceParams = $serviceParams;
	}
	/**
	 * Adds media url to the sequence
	 * @param number $startTime
	 * @param url $mediaUrl
	 */
	public function addToSequence( $startTime, $mediaUrl ){
		$kAdsHandler = new KalturaAdUrlHandler( $mediaUrl );
		// see if the HLS url is available now: 
		$this->addHLSUrltoSequence(
			$startTime, 
			// Use duration from kaltura API, will be more trusted then VAST XML
			$kAdsHandler->getDuration(), 
			$kAdsHandler->getHLSUrl()
			// for addToSequence calls, tracking is assumed hybrid and done on client
			// if server is handling VAST we would call addVastToSequence  
		);
	}
	/**
	 * Adds a stream to the stream sequence at a given time 
	 * 
	 * injected streams are prefixed and postfixed with #EXT-X-DISCONTINUITY tags
	 * @param number $startTime
	 * @param object $vastObject
	 */
	public function addVastToSequence( $startTime, $vastObject ){
		// add a vastObject to the sequence ( we read the vast object in the m3u8 handler, 
		// since vast could include HLS stream type and we would need to read that here. 
		foreach( $vastObject as $vastAd ){
			// TODO support appending after for adPods
			// check for streams already with the current delivery type: i
			$maxStream = null;
			$addStream = false;
			foreach( $vastAd['mediaFiles']  as $mediaStream ){
				if( $mediaStream['type'] == $this->mimeType ){
					// stream is already in application/vnd.apple.mpegurl format, directly add to sequence:
					$this->addHLSUrltoSequence( $startTime, $vastAd['duration'], $mediaStream['url'], $vastAd['tracking'] );
					// set added stream flag;
					$addStream = true;
					// update StartTime 
					$startTime = $startTime + $vastAd['duration'];
					break;
				}
				// if maxStream is not set set to current: 
				if( $maxStream == null ){
					$maxStream = $mediaStream;
				}
				// check if current $mediaStream bitrate > maxStream if so use that
				if( $mediaStream['bitrate'] > $maxStream['bitrate'] ){
					$maxStream = $mediaStream;
				}
			}
			// check the added stream flag, if not added invoke KalturaAdURL handler: 
			if( ! $addStream ){
				// Available in HLS, invoke kaltura ingest pipeline
				$kAdsHandler = new KalturaAdUrlHandler( $mediaStream['url'] );
				// see if the HLS url is available now: 
				if( $kAdsHandler->getHLSUrl() ){
					$this->addHLSUrltoSequence(
						$startTime, 
						// Use duration from kaltura API, will be more trusted then VAST XML
						$kAdsHandler->getDuration(), 
						$kAdsHandler->getHLSUrl(), 
						$vastAd['tracking'] 
					);
					// update StartTime ( adPod support )
					$startTime = $startTime + $vastAd['duration'];
				}
			}
		}
	}
	/**
	 * Gets the manifest which includes all the stream data. 
	 */
	public function getManifest(){
		$o='';
		// output all top level comments: 
		$o.= $this->getMetaHeaders();
		// output all the streams 
		$o.= $this->getStreams();
		// output meta footer ( #EXT-X-ENDLIST ) for VOD
		// return output stream: 
		$o.= $this->getMetaFooters();
		return $o;
	}
}