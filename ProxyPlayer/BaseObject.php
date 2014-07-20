<?php
abstract class BaseObject {	
	public static function getClass() {
		return new static ;
	}

	abstract protected function get();

	public function getDtoConfig($dtoName) {
		$dataStoreName = 'DTO_'.$dtoName;//strtolower(get_class($this));
		//if (!apc_exists($dataStoreName)) {
			//echo "Load from file: ".$dataStoreName;
			$data = file_get_contents('./DTO/'.$dtoName/*strtolower(get_class($this))*/.".json", FILE_USE_INCLUDE_PATH);
		//	apc_store($dataStoreName, $data);
		//} else {
			//echo "Load from cache: ".$dataStoreName;
		//	$data = apc_fetch($dataStoreName);
		//}

		return json_decode($data, TRUE);
	}

	public function setData($data) {
		DataStore::getInstance()->setData(strtolower(get_class($this)), $data);
	}	

	public function getData() {
		return $dataStoreName = DataStore::getInstance()->getData(strtolower(get_class($this)));
	}

	function getClassVars($class) {
		return $class_vars = get_class_vars($class);
	}

	function resolveDtoList($implementClass, $responseClass = NULL, $data = NULL, $implementClassIndex = NULL, $unwrap = false){
		if (is_null($data)){
			$data = $this->getData();
		}
		$classVars = array();
    	$dtoConf = array();

		if (is_array($implementClass) &&
        	!is_null($implementClassIndex)){   
        	foreach ($implementClass as $classKey=>$classVal) {
    			$classVars[$classKey] = $this->getClassVars($classKey);
        		$dtoConf[$classKey] = $this->getDtoConfig($classKey);     
    		}
	    } else {
	    	$classVars[$implementClass] = $this->getClassVars($implementClass);
        	$dtoConf[$implementClass] = $this->getDtoConfig($implementClass);     
	    }

	    $resolved = array();
        foreach ($dtoConf as $classKey => $dtoConfObj) {
        	$resolvers = $dtoConfObj["resolver"];
        	$classVarsObj = $classVars[$classKey];
        	$iterator = isset($dtoConfObj["pointers"]["iterator"]) &&
        				!empty($dtoConfObj["pointers"]["iterator"]) ||
        				is_numeric($dtoConfObj["pointers"]["iterator"]) ? $dtoConfObj["pointers"]["iterator"] : NULL;

  			$items = (!is_null($iterator) || is_numeric($iterator)) ? $data[$iterator] : 
  						((isset($dtoConfObj["pointers"]["wrap"]) && $dtoConfObj["pointers"]["wrap"] == "true") ? array($data) : $data);
        	foreach ($items as $item) {
        		if (!is_null($implementClassIndex) &&
        			$item[$implementClassIndex] != $implementClass[$classKey]){
        			continue;
        		}
        		$resolvedItem = "";
        		foreach ($resolvers as $resolverKey => $resolverExp) {
					if (array_key_exists($resolverKey, $classVarsObj)){		if (is_array($resolverExp)){
		            	    $resolvedItem[$resolverKey] = array();
		            	    foreach($resolverExp as $expKey=>$expVal){
		            	        $res = Lexer::getInstance()->resolve($expVal, $item, $data);
	                            $resolvedItem[$resolverKey][$expKey] = $res;
		            	    }
		            	} else {
		            		$res = Lexer::getInstance()->resolve($resolverExp, $item, $data);
		            	    $resolvedItem[$resolverKey] = $res;//$dataItem[$key];
		                }
        			}
        		}
        		array_push($resolved, new $classKey($resolvedItem));
        	}
        }
		
        if ($unwrap){
		    return $resolved[0];
		} elseif (is_null($responseClass)){
			return $resolved;
		} else {
			return new $responseClass(array(
					'objects'    => $resolved,
					'totalCount' => count($resolved),
				));
		}
	}
}
?>