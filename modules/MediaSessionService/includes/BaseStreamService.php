<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class BaseStreamService {
	// stores the socket connection for realtime events
	var $socket = null;
	
	function __construct(){
		global $container;
		$this->cache = $container['cache_helper'];
		$this->request = $container['request_helper'];
		$this->entryResult = $container['entry_result'];
		$this->uiConfResult = $container['uiconf_result'];
	}
	function setStreamUrl( $url ){
		$this->streamUrl = $url;
	}
	/* for now this is mostly for debugging */
	function sendSocketMessage( $message ){
		echo 'sendSocketMessage' ."\n";
		// This is our new stuff
		$address = "127.0.0.1";
 		$service_port = '8080';

		error_reporting(E_ALL);
		
		/* Create a TCP/IP socket. */
		$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		if ($socket === false) {
			echo "socket_create() failed: reason: " . 
			socket_strerror(socket_last_error()) . "\n";
		}
		
		echo "Attempting to connect to '$address' on port '$service_port'...";
		$result = socket_connect($socket, $address, $service_port);
		if ($result === false) {
		   echo "socket_connect() failed.\nReason: ($result) " . 
			  socket_strerror(socket_last_error($socket)) . "\n";
		}
		
		$in = "HEAD / HTTP/1.1\r\n";
		$in .= "Host: www.google.com\r\n";
		$in .= "Connection: Close\r\n\r\n";
		$out = '';
		
		echo "Sending HTTP HEAD request...";
		if(!socket_write($socket, $in, strlen($in)))
		{
			$errorcode = socket_last_error();
			$errormsg = socket_strerror($errorcode);
		
			die("Could not send message on socket : [$errorcode] $errormsg \n");
		}
		echo "OK.\n";
	}
	function getStreamHandler(){
		// Grab and parse the base content m3u8
		$streamContent = $this->getStreamContent();
		// Replace all the URLs with kaltura service URLs ( only M3u8Handler supported right now )
		$streamHandler = new M3u8Handler( $streamContent );
		// add the standard set of service params:
		$streamHandler->setServiceParams (
			array(
				'uiconf_id' => $this->request->getUiConfId(),
				'wid' => $this->request->getWidgetId(),
				'entry_id' => $this->request->getEntryId(),
				'guid' => $this->getGuid(),
			)
		);
		return $streamHandler;
	}
	function getStreamContent(){
		$content =  $this->cache->get( $this->getCacheKey() );
		if( $content ){
			return $content;
		} 
		$content = file_get_contents( $this->streamUrl );
		// TODO take into consideration headers or per stream cache metadata info. 
		$this->cache->set(  $this->getCacheKey(), $content );
		return $content;
	}
	function getGuid(){
		// gets the guid from the request, if not set in the request generates a guid to pass on to subsequent requests
		if( $this->request->get( 'guid' ) ){
			return  $this->request->get( 'guid' ) ;
		}
		// TODO: check for cookie or session based uuid
		// for now just, generate with php: 
		return uniqid();
	}
	function getCacheKey(){
		return md5( $this->streamUrl );
	}
}