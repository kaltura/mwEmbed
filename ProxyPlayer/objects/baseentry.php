<?php

class Baseentry extends BaseObject {

	var $data;

	function __construct() {
		$this->data = $this->getData();
	}      

	function get() {
		return $this->resolveDtoList("KalturaMediaEntry", "KalturaBaseEntryListResponse");	
	}			
}
?>