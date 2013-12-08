<?php 

class KalturaAdUrlHandler{
	var $maxRedirects = 3;
	function __construct( $vastUrl ){
		global $container; 
		$this->vastUrl = $vastUrl;
		$this->client = $container['client_helper'];
	}
	function getHLSUrl(){
		// check if we can get it from server right away
		$this->getAdEntryHLS();
		
		// create a new entry and import via url 
		
		//$client = $this->getClient();
		/*$ks = $client->session->start ( $wgKalturaAdminSecret,
			$_SERVER['REMOTE_ADDR'],
			KalturaSessionType::ADMIN,
			$this->partnerId,
			null,
			"sview:{$this->entryId}"
		);*/
	}
	function getAdEntryHLS(){
		// hash the url + head content length request on the ad, set as ref id.
		$contentLengh = $this->getContentLengthHeader( $this->vastUrl, 0 );
		// content length request failed, return false ( content may be offline )
		if( $contentLengh ){
			return false;
		}
		// this has the added benefit of confirming the "url" is still online
		$adRefId = md5( $contentLengh . $this->$vastUrl );
		// get entry result via ref id: 
			// not found -> start ingest return False
			// not ready -> return false;
		// getSources
		// return HLS source. 
	}
	/**
	 * return false, if url does not resolve, or the header of the url
	 */
	function getContentLengthHeader( $url, $detph = 0 ){
		$headers= get_headers( $url );
		// failed request:
		if( $headers === false ){
			return false;
		}
		if( $detph > $this->maxRedirects ){
			// error hit max redirects:
			return false;
		}
		foreach( $headers as $head ){
			if( strpos( $head, 'Location:' ) !== false ){
				return $this->getContentLengthHeader( trim( str_replace('Location:','', $head) ), $depth++ );
			}
		}
		// no Location header return content lengh: 
		foreach( $headers as $head ){
			if( strpos( $head, 'Content-Length:' ) !== false ){
				return trim( str_replace( 'Content-Length:', '', $head ) );
			}
		}
	}
}