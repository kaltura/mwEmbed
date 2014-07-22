<?php
abstract class BaseObject {	

	private $loggers;

	public static function getClass() {
		 return new static;
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
		$this->loggers = new stdClass();
        $this->loggers->main = Logger::getLogger("main");
        $this->loggers->dto = Logger::getLogger("DTO");
        $this->loggers->main->info("Resolving ".get_called_class());
        $start = microtime(true);

		if (is_null($data)){
			$data = $this->getData();
		}
		$classVars = array();
    	$dtoConf = array();

    	$this->loggers->dto->debug("Resolving params: implementClass=".json_encode($implementClass));
    	$this->loggers->dto->debug("Resolving params: responseClass=".$responseClass);
    	$this->loggers->dto->debug("Resolving params: implementClassIndex=".$implementClassIndex);
    	$this->loggers->dto->debug("Resolving params: unwrap=".$unwrap);

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
            $this->loggers->dto->info("Resolving ".$classKey);
        	$resolvers = $dtoConfObj["resolver"];
        	$classVarsObj = $classVars[$classKey];
        	$this->loggers->dto->debug("classVarsObj=".json_encode($classVarsObj));

        	$iterator = isset($dtoConfObj["pointers"]["iterator"]) &&
        				!empty($dtoConfObj["pointers"]["iterator"]) ||
        				is_numeric($dtoConfObj["pointers"]["iterator"]) ? $dtoConfObj["pointers"]["iterator"] : NULL;

        	$this->loggers->dto->info("Set iterator: ".$iterator);

  			$items = (!is_null($iterator) || is_numeric($iterator)) ? $data[$iterator] : 
  						((isset($dtoConfObj["pointers"]["wrap"]) && $dtoConfObj["pointers"]["wrap"] == "true") ? array($data) : $data);

        	$this->loggers->dto->trace("Resolve items for iteration: ".json_encode($items));
        	foreach ($items as $item) {
        	    $this->loggers->dto->debug("Iterate over item: ".json_encode($item));
        	    if (!is_null($implementClassIndex) &&
        			$item[$implementClassIndex] != $implementClass[$classKey]){
        			$this->loggers->dto->debug("Found different implementClassIndex(".$implementClassIndex."), iterate over next item");
        			continue;
        		}
        		$resolvedItem = "";
        		foreach ($resolvers as $resolverKey => $resolverExp) {
					if (array_key_exists($resolverKey, $classVarsObj)){
					    $this->loggers->dto->debug("Found key '".$resolverKey."' in resolver and in implemented class, resolving...");
					    if (is_array($resolverExp)){
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
        		$this->loggers->dto->debug("Instantiate implemented class: '".$classKey."' with data = ".json_encode($resolvedItem));
        		array_push($resolved, new $classKey($resolvedItem));
        	}
        }

		$total = microtime(true) - $start;
        $this->loggers->main->info("Resolve DTO time = ".$total. " seconds");
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