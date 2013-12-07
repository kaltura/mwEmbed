<?php 

class M3u8Parser {
	// store stream meta data tags ( see parser )
	var $meta = array();
	// stores stream tags ( see parser )
	var $streams = array();
	function __construct( $baseM3u8 ){
		$this->M3u8Content = $baseM3u8;
		$this->parse();
	}
	/**
	 * Parse the m3u8 gets "comments", and per url stream info
	 */
	private function addMeta( $inx, $line ){
		$this->meta[$inx] = $line;
	}
	// TODO include metadata parsing ( so that we can substitute where needed )
	private function getMetaHeaders(){
		$o='';
		foreach( $this->meta as $line){
			$o.=$line . "\n";
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
			// pass through comments for now:
			if( substr( $line, 0, 1 ) == '#' ){
				// check for stream definition
				// stream definition should be passed to stream handler
				if( strpos( $line, '#EXT-X-STREAM-INF:' ) === 0 ){
					$streamParts = explode( ',', str_replace('#EXT-X-STREAM-INF:', '', $line) );
					$streamType = 'EXT-X-STREAM-INF';
					foreach( $streamParts as $pairs){
						$parts = explode( '=', $pairs );
						$streamProperties[ $parts[0] ] = $parts[1];
					}
				} else {
					// add any comment that is not associated with a stream: 
					$this->addMeta( $inx, $line);
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
	public function getM3u8Manifest(){
		$o='';
		// output all top level comments: 
		$o.= $this->getMetaHeaders();
		// output all the streams 
		$o.= $this->getStreams();
		// return output stream: 
		return $o;
	}
}