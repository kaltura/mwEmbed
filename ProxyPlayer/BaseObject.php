<?php
abstract class BaseObject {	

	private $loggers;
	private $dtoData = NULL;

	public static function getClass() {
		 return new static;
	}

	abstract protected function get();

	public function getDtoConfig($dtoName) {

	    if (is_null($this->dtoData)){
            $dataStoreName = 'DTO_'.$dtoName;//strtolower(get_class($this));
            //if (!apc_exists($dataStoreName)) {
                //echo "Load from file: ".$dataStoreName;
                $data = file_get_contents('./DTO/'.$dtoName/*strtolower(get_class($this))*/.".json", FILE_USE_INCLUDE_PATH);
            //	apc_store($dataStoreName, $data);
            //} else {
                //echo "Load from cache: ".$dataStoreName;
            //	$data = apc_fetch($dataStoreName);
            //}

            $this->dtoData = json_decode($data, TRUE);
		}

		return $this->dtoData;
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

	function resolveDtoList($implementClass, $responseClass = NULL, $unwrap = false){
		//Set loggers
		$this->loggers = new stdClass();
        $this->loggers->main = Logger::getLogger("main");
        $this->loggers->dto = Logger::getLogger("DTO");
        $this->loggers->main->info("Resolving ".get_called_class());
        $start = microtime(true);

		//Fetch data
		$data = $this->getData();

		$classVars = array();
    	$dtoConf = array();

    	$this->loggers->dto->debug("Resolving params: implementClass=".json_encode($implementClass));
    	$this->loggers->dto->debug("Resolving params: responseClass=".$responseClass);
    	$this->loggers->dto->debug("Resolving params: unwrap=".$unwrap);

		//Get all implemented classes vars and data transfer objects
		if (is_array($implementClass)){
        	foreach ($implementClass as $classKey) {
    			$classVars[$classKey] = $this->getClassVars($classKey);
        		$dtoConf[$classKey] = $this->getDtoConfig($classKey);     
    		}
	    } else {
	    	$classVars[$implementClass] = $this->getClassVars($implementClass);
        	$dtoConf[$implementClass] = $this->getDtoConfig($implementClass);     
	    }

	    $resolved = array();
	    //Iterate over all data transfer objects
        foreach ($dtoConf as $classKey => $dtoConfObj) {
            $this->loggers->dto->info("Resolving ".$classKey);
        	$resolvers = $dtoConfObj["resolver"];
        	$classVarsObj = $classVars[$classKey];
        	$this->loggers->dto->debug("classVarsObj=".json_encode($classVarsObj));

        	$iterator = isset($dtoConfObj["pointers"]["iterator"]) &&
        				!empty($dtoConfObj["pointers"]["iterator"]) ||
        				is_numeric($dtoConfObj["pointers"]["iterator"]) ? $dtoConfObj["pointers"]["iterator"] : NULL;

        	$this->loggers->dto->info("Set iterator: ".$iterator);

  			//Fetch items to iterate over
  			$items = (!is_null($iterator) || is_numeric($iterator)) ? $data[$iterator] : $data;
  			// check if needs wrapping for iterator
  			$items = (isset($dtoConfObj["pointers"]["wrap"]) && $dtoConfObj["pointers"]["wrap"] == "true") ? array($items) : $items;

        	$this->loggers->dto->trace("Resolve items for iteration: ".json_encode($items));

        	$filters = (isset($dtoConfObj["pointers"]["filters"]) &&
                       !empty($dtoConfObj["pointers"]["filters"])) ? $dtoConfObj["pointers"]["filters"] : NULL;

        	//Iterate over items and convert using the DTO
        	foreach ($items as $item) {
        	    //Check if this is a subType and if it should be included
        	    $this->loggers->dto->debug("Iterate over item: ".json_encode($item));
        	    if (isset($dtoConfObj["pointers"]["subTypeIdentifier"]) &&
                    isset($dtoConfObj["pointers"]["include"])){
                    if ($dtoConfObj["pointers"]["include"] == true ){
                        //Check if subType key matches current DTO
                        foreach($dtoConfObj["pointers"]["subTypeIdentifier"] as $subTypeIdentifierKey => $subTypeIdentifierVal){
                            if ($subTypeIdentifierVal != $item[$subTypeIdentifierKey]){
                                $this->loggers->dto->debug("Found different subTypeIdentifierKey(".$subTypeIdentifierKey."), iterate over next item");
                                continue;
                            }
                        }
                    } else {
                        $this->loggers->dto->debug("Do not include subtype $classKey, iterate over next item");
                        continue;
                    }
        		}
        		//Filter items
        		if (!is_null($filters)){
        		    if (isset($filters["exclude"])){
        		        $skip = false;
        		        foreach($filters["exclude"] as $filterKey => $filterVals){
        		            if (isset($item[$filterKey])){
                                foreach($filterVals as $filterVal){
                                    if ($item[$filterKey] == $filterVal){
                                        $skip = true;
                                    }
                                }
        		            }
        		        }
        		        if ($skip){
        		            continue;
        		        }
        		    }
        		}
        		$resolvedItem = "";
        		//Resolve keys using DTO mapping definitions
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