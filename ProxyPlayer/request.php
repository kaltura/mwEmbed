<?php
	/**
	* 
	*/
	class ProxyRequest
	{		
		function __construct(){
			$this->data = $this->getConfig();			
		}

		function getConfig(){
			$data = file_get_contents('./Configuration/EndPoints.json', FILE_USE_INCLUDE_PATH);
			return json_decode($data, TRUE);
		}

		function getDtoConfig($dtoName) {
			$dataStoreName = 'DTO_'.$dtoName;//strtolower(get_class($this));
			//if (!apc_exists($dataStoreName)) {
				//echo "Load from file: ".$dataStoreName;
				$data = file_get_contents('./TVinci/'.$dtoName/*strtolower(get_class($this))*/.".json", FILE_USE_INCLUDE_PATH);
				//apc_store($dataStoreName, $data);
			//} else {
			//	echo "Load from cache: ".$dataStoreName;
			//	$data = apc_fetch($dataStoreName);
			//}

			return json_decode($data, TRUE);
		}
	
		function get($params){
			$url = "http://tvpapi-stg.as.tvinci.com/toggle_v2_5/ws/player/service.asmx?WSDL";
			$client = new SoapClient($url);
			//$resolved = $this->resolveObject($objConf, json_decode(json_encode($params), true));
			$result = $client->GetMediaInfo($params);
			$response_arr = $this->objectToArray($result);
			return $response_arr;
		}

		function resolveObject($base, $extend){
			$newObj = array();			
			foreach ($base as $key=>$val) {
				if (is_array($val)){
					$newObj[$key] = $this->resolveObject($val, $extend[$key]);
				} else {
					$newObj[$key] = isset($extend[$key]) ? $extend[$key] : $val == "NULL" ? NULL : $val;
				}
			}			
			return $newObj;
		}

		function objectToArray($d) { 
			if (is_object($d)) { 
				$d = get_object_vars($d); 
			}   
			if (is_array($d)) { 
				return array_map(__METHOD__, $d); 
			} else { 
				return $d; 
			} 
		}
	}
?>