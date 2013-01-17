<?php

/*
 * Description of KalturaPlaylistResult
 * Holds playlist request methods
 * @author ran, michael dale
 */

require_once(  dirname( __FILE__ ) . '/KalturaEntryResult.php');

class KalturaPlaylistResult extends KalturaEntryResult {

	var $playlistObject = null; // lazy init playlist Object
	var $entryResult = null;

	function getCacheFilePath() {
		// Add playlists ids as unique key
		$playerUnique = implode(",", $this->getPlaylistIds());
		$cacheKey = substr( md5( $this->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . '_' . 
					$this->getWidgetId() . '_' . '_' . $this->getUiConfId() . '_' . 
			   substr( md5( $playerUnique ), 0, 20 );
		
		return $this->getCacheDir() . '/' . $cacheKey . ".playlist.txt";
	}	
	
	function isCachableRequest( $resultObj = null ){
		// setup entry if avaliable: 
		$plResult = $this->getPlaylistResult();
		return parent::isCachableRequest();
	}
	
	function getPlaylistResult(){

		// Check for one playlist at least
		$firstPlaylist = $this->getPlaylistId(0);
		if( ! $firstPlaylist ) {
			$this->error = 'Empty playlist';
			return array();
		}
		// Build the reqeust:
		if( !$this->playlistObject ){
			// Check if we are dealing with a playlist url: 
			if( preg_match('|^http(s)?://[a-z0-9-]+(.[a-z0-9-]+)*(:[0-9]+)?(/.*)?$|i', $firstPlaylist) != 0 ){
				$this->playlistObject = $this->getPlaylistObjectFromMrss( $firstPlaylist );
			} else {
				// kaltura playlist id:
				$this->playlistObject = $this->getPlaylistObjectFromKalturaApi();
			}
		}

		// Setup result object
		$resultObj = array( 'playlistResult' => $this->playlistObject );

		// reset error: 
		$this->error = null;
		// Check if we have playlistAPI.initItemEntryId
		if( $this->getPlayerConfig( 'playlistAPI', 'initItemEntryId' ) ){
			$this->urlParameters['entry_id'] = 	htmlspecialchars( $this->getPlayerConfig('playlistAPI', 'initItemEntryId' ) );
		} else {
			$this->urlParameters['entry_id'] = $this->playlistObject[ $firstPlaylist ]['items'][0]->id;
		}		
		// Now that we have an entry_id get entry data:
		$resultObj['entryResult'] = $this->getEntryResult();

		return $resultObj;
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
			$playlistResult = $client->doQueue();
			$this->playlistObject = array( 
				$mrssUrl => array(
					'id' => $mrssUrl,
					'name' => $this->getPlaylistName(0),
					'content' => implode(',', $entrySet ),
					'items' => $playlistResult
				)
			);
		} catch( Exception $e ){
			// Throw an Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}
		return $this->playlistObject;
	}

	function getPlaylistIds() {
		$i=0;
		$playlistIds = array();
		while ($playlistId = $this->getPlaylistId($i)) {
			array_push( $playlistIds, $playlistId );
			$i++;
		}
		return $playlistIds;
	}

	function getPlaylistObjectFromKalturaApi(){

		/*$cacheFile = $this->getCacheFilePath();
		  if( $this->canUseCacheFile( $cacheFile ) ){
			$this->playlistObject = unserialize( file_get_contents( $cacheFile ) );
		} else {
		*/
			$client = $this->getClient();
			$client->startMultiRequest();
			$firstPlaylist = $this->getPlaylistId(0);

			try {

				$playlistIds = $this->getPlaylistIds();
				foreach( $playlistIds as $playlistId ) {
					$client->queueServiceActionCall( "playlist", "get", array( 'id' => $playlistId ) );
				}
				$client->queueServiceActionCall( "playlist", "execute", array( 'id' => $firstPlaylist ) );			
				$resultObject = $client->doQueue();

				$i = 0;
				$playlistResult = array();
				// Map multi request result to playlist array
				foreach( $playlistIds as $playlistId ) {

					$playlistResult[ $playlistId ] = array(
						'id' => $resultObject[ $i ]->id,
						'name' => $resultObject[ $i ]->name,
						'content' => $resultObject[ $i ]->playlistContent,
						'items' => array()
					);

					$i++;
				}

				// Set the last result to first playlist
				$playlistResult[ $firstPlaylist ]['items'] = $resultObject[ $i ];
				$this->playlistObject = $playlistResult;
				//$this->putCacheFile( $cacheFile, serialize( $playlistResult ) );

			} catch( Exception $e ) {
				// Throw an Exception and pass it upward
				throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
				return array();
			}
		#}
		return $this->playlistObject;
	}
    
	/**
	 * Get the XML for the first playlist ( the one likely to be displayed ) 
	 * 
	 * this is so we can pre-load details about the first entry for fast playlist loading,
	 * and so that the first entry video can be in the page at load time.   
	 */
	function getPlaylistId( $index = 0 ){
		
		$playlistId = $this->getPlayerConfig('playlistAPI', 'kpl' . $index . 'Id');
		if( $playlistId ) {
			return $playlistId;
		}

		$playlistId = $this->getPlayerConfig('playlistAPI', 'kpl' . $index . 'Url');
		if( $playlistId ) {
			$playlistId = trim( $playlistId );
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
		return false;
	}

	function getPlaylistName( $index = 0 ) {
		$name = $this->getPlayerConfig('playlistAPI', 'kpl' . $index . 'Name');
		return ($name) ? $name : '';
	}
	
}

?>
