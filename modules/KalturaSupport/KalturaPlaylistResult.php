<?php

/*
 * Description of KalturaPlaylistResult
 * Hols playlist request methods
 * @author ran, michael dale
 */

require_once(  dirname( __FILE__ ) . '/KalturaEntryResult.php');

class KalturaPlaylistResult extends KalturaEntryResult {

	var $playlistObject = null; // lazy init playlist Object
	var $isCarousel = null;
	var $entryResult = null;
	
	function isCachableRequest( $resultObj = null ){
		// setup entry if avaliable: 
		$plResult = $this->getPlaylistResult();
		return parent::isCachableRequest();
	}
	
	function getPlaylistResult(){
		// Get the first playlist list:
		$playlistId =  $this->getFirstPlaylistId();
		$playlistObject = $this->getPlaylistObject( $playlistId  );

		// Create an empty resultObj
		if( isset( $playlistObject[0] ) && $playlistObject[0]->id ){
			// Set the isPlaylist flag now that we are for sure dealing with a playlist
			if ( !$this->isCarousel() ) {
				$this->isPlaylist = true;
			}
			// Check if we have playlistAPI.initItemEntryId
			if( $this->getPlayerConfig( 'playlistAPI', 'initItemEntryId' ) ){
				$this->urlParameters['entry_id'] = 	htmlspecialchars( $this->getPlayerConfig('playlistAPI', 'initItemEntryId' ) );
			} else {
				$this->urlParameters['entry_id'] = $playlistObject[0]->id;
			}
			// reset error: 
			$this->error = null;
			// Now that we have an entry_id get entry data:
			$resultObj['entryResult'] = $this->getEntryResult();

			// Include the playlist in the response:
			$resultObj[ 'playlistResult' ] = array(
				$playlistId => $playlistObject
			);
			return $resultObj;
		} else {
			// XXX could not get first playlist item: 	
			return array();
		}
	}
	/**
	 * Get playlist object
	 */
	function getPlaylistObject( $playlistId ){
		// Build the reqeust: 
		$kparams = array();
		if( !$this->playlistObject ){
			// Check if we are dealing with a playlist url: 
			if( preg_match('|^http(s)?://[a-z0-9-]+(.[a-z0-9-]+)*(:[0-9]+)?(/.*)?$|i', $playlistId) != 0 ){
				$this->playlistObject = $this->getPlaylistObjectFromMrss( $playlistId );
			} else {
				// kaltura playlist id:
				$this->playlistObject = $this->getPlaylistObjectFromKalturaApi( $playlistId );
			}
		}
		return $this->playlistObject;
	}
	function getPlaylistObjectFromMrss( $mrssUrl ){
		$mrssXml = @file_get_contents( $mrssUrl );	
		if( ! $mrssXml ){
			$this->error = 'Could not load mrss url';
			return array();
		}
		try{
			$xml = new SimpleXMLElement( $mrssXml );
		} catch( Exception $e ){
			$this->error = 'Could not parse mrss xml';
			return array();
		}
		// Build the entry set array:		
		$entrySet = array();
		foreach ($xml->channel->item as $item) {
			$kaltuarNS = $item->children('http://kaltura.com/playlist/1.0'); 
			if( isset( $kaltuarNS->entryId ) ){
				$entrySet[] = $kaltuarNS->entryId;
			}
		}
		
		$client = $this->getClient();
		try {
			$kparams = array();
			$client->addParam( $kparams, "entryIds", implode(',', $entrySet ) );
			$client->queueServiceActionCall( "baseEntry", "getByIds", $kparams );
			$this->playlistObject = $client->doQueue();
				
		} catch( Exception $e ){
			// Throw an Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}
		return $this->playlistObject;
	}
	function getPlaylistObjectFromKalturaApi( $playlistId ){
		$client = $this->getClient();
		$cacheFile = $this->getCacheDir() . '/' . $this->getPartnerId() . '.' . $this->getCacheSt() . $playlistId;
		if( $this->canUseCacheFile( $cacheFile ) ){
			$this->playlistObject = unserialize( file_get_contents( $cacheFile ) );
		} else {
			try {
				$kparams = array();
				
				$client->addParam( $kparams, "id", $playlistId);
				$client->queueServiceActionCall( "playlist", "execute", $kparams );
				
				$this->playlistObject = $client->doQueue();
				$this->putCacheFile( $cacheFile, serialize( $this->playlistObject) );
			
			} catch( Exception $e ){
				// Throw an Exception and pass it upward
				throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
				return false;
			}
		}
		return $this->playlistObject; 
	}
	
	function isCarousel(){
        if ( !is_null ( $this->isCarousel ) ){
            return $this->isCarousel;
        }
		$this->isCarousel = ( !! $this->getPlayerConfig('playlistAPI', 'kpl0Url') ) && ( !! $this->getPlayerConfig( 'related' ) );
        return $this->isCarousel;
    }
    
	/**
	 * Get the XML for the first playlist ( the one likely to be displayed ) 
	 * 
	 * this is so we can pre-load details about the first entry for fast playlist loading,
	 * and so that the first entry video can be in the page at load time.   
	 */
	function getFirstPlaylistId(){
		$playlistId = trim( $this->getPlayerConfig('playlistAPI', 'kpl0Url') );
		$playlistId = rawurldecode( $playlistId );
		$playlistId = htmlspecialchars_decode( $playlistId );
		$playlistId = html_entity_decode( $playlistId );
		// raw url decode seems to fail in replacing strings :( 
		$playlistId = str_replace(
			array( '%3A', '%3D', '%2F', '%26', '%3F' ), 
			array( ':', '=', '/', '&', '?' ), 
			$playlistId
		);
		// Parse out the "playlistId from the url ( if its a url )
		$plParsed = parse_url( $playlistId );

		if( is_array( $plParsed ) && isset( $plParsed['query'] ) ){
			$args = explode("&", $plParsed['query'] );
			foreach( $args as $inx => $argSet ){
				$argParts = explode('=', $argSet );
				if( $argParts[0] == 'playlist_id' && isset( $argParts[1] )){
					$playlistId = $argParts[1];
				}
			}
		}
		return $playlistId;
	}
	
}

?>
