<?php

/*
 * Description of KalturaPlaylistResult
 * Holds playlist request methods
 * @author ran, michael dale
 */

class PlaylistResult {

	var $request = null;
	var $client = null;
	var $cache = null;
	var $uiconf = null;
	var $entry = null;

	var $playlistObject = null; // lazy init playlist Object

	function __construct( $request, $client, $cache, $uiconf, $entry ) {

		if(!$request)
			throw new Exception("Error missing request object");
		if(!$client)
			throw new Exception("Error missing client object");
		if(!$cache)
			throw new Exception("Error missing cache object");
		if(!$uiconf)
			throw new Exception("Error missing uiconf object");
		if(!$entry)
			throw new Exception("Error missing entry object");					
		
		// Set our objects
		$this->request = $request;
		$this->client = $client;
		$this->cache = $cache;
		$this->uiconf = $uiconf;
		$this->entry = $entry;
	}	

	function getCacheKey() {
		// Add playlists ids as unique key
		$playerUnique = implode(",", $this->getPlaylistIds());
		$cacheKey = substr( md5( $this->request->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . '-' . 
					$this->request->getWidgetId() . '-' . $this->request->getUiConfId() . '-' . 
			   substr( md5( $playerUnique ), 0, 20 );
		
		return "playlist-" . $cacheKey;
	}
	
	function getResult(){
		// Check for one playlist at least
		$firstPlaylist = $this->getPlaylistId(0);
		if( ! $firstPlaylist ) {
			throw new Exception("Error empty playlist");
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

		// Check if we have playlistAPI.initItemEntryId
		if( $this->uiconf->getPlayerConfig( 'playlistAPI', 'initItemEntryId' ) ){
			$this->request->set( 'entry_id', htmlspecialchars( $this->uiconf->getPlayerConfig('playlistAPI', 'initItemEntryId' ) ) );
		} else {
			$firstPlaylist = $this->playlistObject[ $firstPlaylist ];
			if( count($firstPlaylist['items']) ) {
				$this->request->set( 'entry_id', $firstPlaylist['items'][0]->id );
			}
		}		
		// Now that we have an entry_id get entry data:
		$resultObj['entryResult'] = $this->entry->getResult();

		return $resultObj;
	}

	// Sorts the playlistResult array by the mrss order
	function getSortedPlaylistResult($entrySet, $playlistResult) {
		$playlistSortedResult = array();
     	foreach ($entrySet as $entryID) {
        	foreach ($playlistResult as $entry){
        		if ($entryID == $entry -> id) {
        			$playlistSortedResult[] = $entry;
        		}
        	}
        }      
		return $playlistSortedResult;
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
		
		$client = $this->client->getClient();
		try {
			$kparams = array();
			$client->addParam( $kparams, "entryIds", implode(',', $entrySet ) );
			$client->queueServiceActionCall( "baseEntry", "getByIds", $kparams );
			$playlistResult = $client->doQueue();
			$playlistSortedResult = $this->getSortedPlaylistResult($entrySet, $playlistResult);
			$this->playlistObject = array( 
				$mrssUrl => array(
					'id' => $mrssUrl,
					'name' => $this->getPlaylistName(0),
					'content' => implode(',', $entrySet ),
					'items' => $playlistSortedResult
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

		$cacheKey = $this->getCacheKey();
		$this->playlistObject = @unserialize( $this->cache->get( $cacheKey ) );
		if( $this->playlistObject === false ) {
			$client = $this->client->getClient();
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

					$resultItem = $resultObject[ $i ];

					if( is_object($resultItem) ) {
						$playlistResult[ $playlistId ] = array(
							'id' => $resultItem->id,
							'name' => $resultItem->name,
							'content' => $resultItem->playlistContent,
							'items' => array()
						);
					}

					$i++;
				}

				// Set the last result to first playlist
				$playlistResult[ $firstPlaylist ]['items'] = $resultObject[ $i ];
				$this->playlistObject = $playlistResult;
				$this->cache->set( $cacheKey, serialize( $playlistResult ) );

			} catch( Exception $e ) {
				// Throw an Exception and pass it upward
				throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
				return array();
			}
		}
		return $this->playlistObject;
	}
    
	/**
	 * Get the XML for the first playlist ( the one likely to be displayed ) 
	 * 
	 * this is so we can pre-load details about the first entry for fast playlist loading,
	 * and so that the first entry video can be in the page at load time.   
	 */
	function getPlaylistId( $index = 0 ){
		
		$playlistId = $this->uiconf->getPlayerConfig('playlistAPI', 'kpl' . $index . 'Id');
		if( $playlistId ) {
			return $playlistId;
		}

		$playlistId = $this->uiconf->getPlayerConfig('playlistAPI', 'kpl' . $index . 'Url');
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
		$name = $this->uiconf->getPlayerConfig('playlistAPI', 'kpl' . $index . 'Name');
		return ($name) ? $name : '';
	}
	
}

?>
