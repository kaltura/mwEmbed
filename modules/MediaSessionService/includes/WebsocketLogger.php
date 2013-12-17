<?php 
class WebsocketLogger {
	var $clientSocket = null;
	function __construct(){
		global $container;
		$this->request = $container['request_helper'];
	}
	/* for now this is mostly for debugging */
	function send( $message ){
		if( !$this->clientSocket ){
			include_once 'WebsocketClient.php';
			$this->clientSocket = new WebsocketClient();
			$this->clientSocket->connect('127.0.0.1', 8080, '/mwEmbedSocket', 'http://localhost');
		}
		$payload = json_encode( array(
				'action' => 'log',
				'message' => $message,
				'guid' => $this->getGuid()
		));
		$this->clientSocket->sendData( $payload );
	}
	function getGuid(){
		// gets the guid from the request, if not set in the request generates a guid to pass on to subsequent requests
		if( $this->request->get( 'guid' ) ){
			return $this->request->get( 'guid' ) ;
		}
		// TODO: check for cookie or session based guid
		// for now just, generate with php:
		return uniqid();
	}
}
global $container;
// put the websocket into the global container so a single instance can be used across classes: 
$container['websocket_logger'] = $container->share(function ($c) {
	return new WebsocketLogger();
});