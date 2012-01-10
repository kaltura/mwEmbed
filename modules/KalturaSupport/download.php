<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */
// Include configuration: ( will include LocalSettings.php )
require_once( realpath( '../../' ) . '/includes/DefaultSettings.php' );

$download = new downloadEntry();
$download->redirectDownload();

class downloadEntry {
	var $resultObject = null; // lazy init
	/**
	 * The result object grabber, caches a local result object for easy access
	 * to result object properties. 
	 */
	function getResultObject(){
		global $wgMwEmbedVersion;
		if( ! $this->resultObject ){
			require_once( dirname( __FILE__ ) .  '/KalturaResultObject.php' );
			try {
				$this->resultObject = new KalturaResultObject( 'html5download:' . $wgMwEmbedVersion );
			} catch ( Exception $e ){
				die( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
	// Errors set special X-Kaltura and X-Kaltura-App: header and then deliver the no sources video
	private function fatalError( $errorMsg ) {
		header( "X-Kaltura: error-6" );
		header( "X-Kaltura-App: exiting on error 6 - requested flavor was not found" );
		header( "X-Kaltura-Error: " . htmlspecialchar( $errorMsg ) );
		// Then redirect to no-sources video: 
		$sources = $this->getErrorVideoSources();		
		$flavorUrl = $this->getSourceForUserAgent( $sources );
		header( "location: " . $flavorUrl );
		exit(1);
	}
	
	function redirectDownload() {
		$sources =  $this->getResultObject()->getSources();
		$flavorUrl = $this->getSourceForUserAgent( $sources );
		// Redirect to flavor
		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Pragma: no-cache");
		header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		header( "location: " . $flavorUrl );
	}

	public function getSourceForUserAgent( $sources = null, $userAgent = false ){
		// Get all sources
		if( !$sources ){
			$sources = $this->getResultObject()->getSources();
		}
		// Get user agent
		if( !$userAgent ){
			$userAgent = $this->getResultObject()->getUserAgent();
		}

		$flavorUrl = false ;
		// First set the most compatible source ( iPhone h.264 )
		$iPhoneSrc = $this->getSourceFlavorUrl( 'iPhone' );
		if( $iPhoneSrc ) {
			$flavorUrl = $iPhoneSrc;
		}
		// if your on an iphone we are done:
		if( strpos( $userAgent, 'iPhone' )  ){
			return $flavorUrl;
		}
		// h264 for iPad
		$iPadSrc = $this->getSourceFlavorUrl( 'ipad' );
		if( $iPadSrc ) {
			$flavorUrl = $iPadSrc;
		}
		// rtsp3gp for BlackBerry
		$rtspSrc = $this->getSourceFlavorUrl( 'rtsp3gp' );
		if( strpos( $userAgent, 'BlackBerry' ) !== false && $rtspSrc){
			return 	$rtspSrc;
		}

		// 3gp check
		$gpSrc = $this->getSourceFlavorUrl( '3gp' );
		if( $gpSrc ) {
			// Blackberry ( newer blackberry's can play the iPhone src but better safe than broken )
			if( strpos( $userAgent, 'BlackBerry' ) !== false ){
				$flavorUrl = $gpSrc;
			}
			// if we have no iphone source then do use 3gp:
			if( !$flavorUrl ){
				$flavorUrl = $gpSrc;
			}
		}

		// Firefox > 3.5 and chrome support ogg
		$ogSrc = $this->getSourceFlavorUrl( 'ogg' );
		if( $ogSrc ){
			// chrome supports ogg:
			if( strpos( $userAgent, 'Chrome' ) !== false ){
				$flavorUrl = $ogSrc;
			}
			// firefox 3.5 and greater supported ogg:
			if( strpos( $userAgent, 'Firefox' ) !== false ){
				$flavorUrl = $ogSrc;
			}
		}

		// Firefox > 3 and chrome support webm ( use after ogg )
		$webmSrc = $this->getSourceFlavorUrl( 'webm' );
		if( $webmSrc ){
			if( strpos( $userAgent, 'Chrome' ) !== false ){
				$flavorUrl = $webmSrc;
			}
			if( strpos( $userAgent, 'Firefox/3' ) === false && strpos( $userAgent, 'Firefox' ) !== false ){
				$flavorUrl = $webmSrc;
			}
		}
		return $flavorUrl;
	}

	/**
	 * Gets a single source url flavors by flavor id ( gets the first flavor )
	 *
	 * TODO we should support setting a bitrate as well.
	 *
	 * @param $sources
	 * 	{Array} the set of sources to search
	 * @param $flavorId
	 * 	{String} the flavor id string
	 */
	private function getSourceFlavorUrl( $flavorId = false){
		// Get all sources ( if not provided )
		$sources = $this->getResultObject()->getSources();
		foreach( $sources as $inx => $source ){
			if( strtolower( $source[ 'data-flavorid' ] )  == strtolower( $flavorId ) ) {
				return $source['src'];
			}
		}
		return false;
	}

	/**
	 * Kaltura object provides sources, sometimes no sources are found or an error occurs in a video
	 * delivery context we don't want ~nothing~ to happen instead we send a special error video.
	 */
	public static function getErrorVideoSources(){
		// @@TODO pull this from config: 'Kaltura.BlackVideoSources'
		return array(
		    'iphone' => array(
		    	'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_ktavj42z/format/url/protocol/http/a.mp4',
		    	'type' =>'video/h264',
				'data-flavorid' => 'iPhone'
		    ),
		    'ogg' => array(
		    	'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_gtm9gzz2/format/url/protocol/http/a.ogg',
		    	'type' => 'video/ogg',
		    	'data-flavorid' => 'ogg'
		    ),
		    'webm' => array(
		    	'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_bqsosjph/format/url/protocol/http/a.webm',
		    	'type' => 'video/webm',
		    	'data-flavorid' => 'webm'
		    ),
		    '3gp' => array(
		    	'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_mfqemmyg/format/url/protocol/http/a.mp4',
		    	'type' => 'video/3gp',
		    	'data-flavorid' => '3gp'
		    )
		 );
	}
	
}
