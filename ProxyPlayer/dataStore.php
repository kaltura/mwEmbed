<?php

class DataStore {

	private static $instance;

    private function __construct() {}
    private function __clone() {}

    public static function getInstance() {
        if (!DataStore::$instance instanceof self) {
             DataStore::$instance = new self();
        }
        return DataStore::$instance;
    }
	private $baseentryData = array();	
	private $metadataData = array();
	private $sessionData = array();
	private $entrycontextdataData = array();
	private $flavorassetsData = array();
	private $cuepointsData = array();
	private $uiconf = array();

	function getData($key) {
		
		switch($key){
			case "baseentry":
				$data = $this->baseentryData;
				break;
			case "uiconf":
                $data = $this->uiconf;
                break;
			case "metadata":
				$data = $this->metadataData;
				break;
			case "session":
				$data = $this->sessionData;
				break;
			case "entrycontextdata":
				$data = $this->entrycontextdataData;
				break;
			case "flavorassets":
				$data = $this->flavorassetsData;
				break;
			case "cuepoints":
				$data = $this->cuepointsData;
				break;
			default:
				$data = array();
		}
		return $data;
	}

	function setData($key, $container, $data, $merge = true) {
		
		switch($key){
			case "baseentry":
				$this->_setData($this->baseentryData, $container, $data, $merge);
				break;
			case "uiconf":
                $this->_setData($this->uiconf, $container, $data, $merge);
                break;
			case "metadata":
				$this->_setData($this->metadataData, $container, $data, $merge);
				break;
			case "session":
				$this->_setData($this->sessionData, $container, $data, $merge);
				break;
			case "entrycontextdata":
				$this->_setData($this->entrycontextdataData, $container, $data, $merge);
				break;
			case "flavorassets":
				$this->_setData($this->flavorassetsData, $container, $data, $merge);
				break;
			case "cuepoints":
				$this->_setData($this->cuepointsData, $container, $data, $merge);
				break;
			case "all":
				$this->_setData($this->baseentryData, $container, $data, $merge);
				$this->_setData($this->metadataData, $container, $data, $merge);
				$this->_setData($this->sessionData, $container, $data, $merge);				
				$this->_setData($this->entrycontextdataData, $container, $data, $merge);
				$this->_setData($this->flavorassetsData, $container, $data, $merge);
				$this->_setData($this->cuepointsData, $container, $data, $merge);
				break;
			default:				
		}
		
	}

	function _setData(&$dataObj, $container, $data, $merge = true) {
		if ($merge){
			if (!empty($container)){
				$dataObj[$container] =  $data;
			} else {
				$dataObj = $data;
			}
		} else {
			$dataObj = $data;
		}
	}

}
?>