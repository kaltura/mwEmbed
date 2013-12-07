<?php 

class M3u8Parser {
	// store stream meta data tags ( see parser )
	var $meta = array();
	var $metaFooters = array();
	// stores stream tags ( see parser )
	var $streams = array();
	function __construct( $baseM3u8 ){
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
		foreach( $this->streams as $stream){
			// output the stream def line: 
			$o.= '#' . $stream['type'] . ':' . $this->getPropsLine( $stream['props'] ) . "\n";
			// output the stream url with respective substitution if needed:
			$o.= $this->getStreamUrl( $stream ) . "\n";
		}
		return $o;
	}
	private function getStreamUrl( $stream ){
		$serviceType = $this->getStreamServiceType( $stream['type'] );
		if( $serviceType == 'pass' ){
			return $stream['url'];
		}
		return $this->getServicePath() . "?service={$serviceType}&". http_build_query(
			array_merge( $this->serviceParams, array(
				'streamUrl' => $stream['url']
			) )
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
		foreach( $lines as $inx => $line ){
			// skip empty lines: 
			if( trim( $line) == '' ){
				continue;
			}
			// add meta to meta object
			if( substr( $line, 0, 1 ) == '#' ){
				// check for stream definition
				// stream definition should be passed to stream handler
				preg_match('/\#([^:]*):(.*)/', $line, $matches);
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
				} else {
					// add meta object
					$this->addMeta( $inx, array( $matches[1] => $matches[2] ) );
				}
				continue;
			}
			// check if the line is a url rewrite to local service
			if( (bool)parse_url($line) ){
				// if a URL add to $streams with associated $streamProperties
				$this->addStream($inx-1, array(
					'url' => $line,
					'type' => $streamType,
					'props' => $streamProperties
				));
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

	/** PUBLIC METHODS **/
	
	public function setServiceParams( $serviceParams ){
		$this->serviceParams = $serviceParams;
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