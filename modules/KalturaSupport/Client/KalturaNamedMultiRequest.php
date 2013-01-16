<?php 
/**
* Kaltura named multi request, enables simple names for parts of mulitrequest and returns an
* associative array with named result values.
*/
class KalturaNamedMultiRequest { 
	var $requestInx;
	function __construct( $client, $defaultParams = array() ) {	
		$this->client = $client;
		$client->startMultiRequest();
		$this->defualt_params = $defaultParams;
		$this->requestInx = array();
	}
	function addNamedRequest( $name, $service, $action, $params){
		$kparams = $this->defualt_params;
		foreach( $params as $pKey => $pVal ){
			$this->client->addParam($kparams, $pKey, $pVal );
		}
		$this->client->queueServiceActionCall( $service, $action, $kparams );
		$this->requestInx[ count( $this->requestInx ) ] = $name;
		return count( $this->requestInx );
	}
	function doQueue(){
		$rawResultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError( $rawResultObject );
		$resultObject = array();
		foreach( $rawResultObject as $inx => $result ){
			$resultObject[ $this->requestInx[ $inx ] ] = $result;
		}
		return $resultObject;
	}

}

?>