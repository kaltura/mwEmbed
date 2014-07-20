<?php
	/**
	* 
	*/
	class ProxyRequest
	{
		private $response;

		function __construct($service, $urlTokens){
			$this->config = $this->getConfig();	
			foreach($this->config as $config){
				if (in_array($service, $config["services"])){
				    if (isset($urlTokens[$config["token"]])){
						$partnerRequestData = json_decode($urlTokens[$config["token"]]);
						$this->get($config["method"], $config["redirectTo"], $partnerRequestData);
						$this->setData($config["dataStores"]);
					}
				}	
			}
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
	
		function get($method, $url, $params){
            $data = json_encode($this->objectToArray($params), true);
			$result= $this->getRest(
			    $method,
			    $url,
			    $data
			);
            $this->response = json_decode($result, true);
		}

		function setData($dataStores){
			foreach ($dataStores as $dataStore => $container) {
				DataStore::getInstance()->setData($dataStore, $container, $this->response);
			}
		}

		function getRest($method, $url, $data = false)
        {
            $curl = curl_init();

            switch ($method)
            {
                case "POST":
                    curl_setopt($curl, CURLOPT_POST, 1);

                    if ($data)
                        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                    break;
                case "PUT":
                    curl_setopt($curl, CURLOPT_PUT, 1);
                    break;
                default:
                    if ($data)
                        $url = sprintf("%s?%s", $url, http_build_query($data));
            }

            // Optional Authentication:
            //curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            //curl_setopt($curl, CURLOPT_USERPWD, "username:password");

            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

            return curl_exec($curl);

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