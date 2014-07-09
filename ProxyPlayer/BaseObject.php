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
		foreach ($data as $dataItem) {
			$resolvedItem = array();
			if (is_array($implementClass) &&
	        	!is_null($implementClassIndex)){
				foreach ($implementClass as $classKey=>$classVal) {
					if ($dataItem[$implementClassIndex] == $classVal){
						$dtoConfObj = $dtoConf[$classKey];
						$classVarsObj = $classVars[$classKey];
						$currClass = $classKey;
					}
				}	        	
	        } else {
	        	$dtoConfObj = $dtoConf[$implementClass];
	        	$classVarsObj = $classVars[$implementClass];
	        	$currClass = $implementClass;
	        }

			foreach ($classVarsObj as $key => $val) {  
				if (isset($dtoConfObj[$key])){	            	
	            	$exp = $dtoConfObj[$key];
	             	$item = Lexer::getInstance()->resolve($exp, $dataItem);
	             	$resolvedItem[$key] = $item;//$dataItem[$key];		            
		        }
	        }	  
			array_push($resolved, new $currClass($resolvedItem));			
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