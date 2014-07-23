<?php

class Cuepoints extends BaseObject {

	var $data;
	public $requireSerialization = true;

	function __construct() {		
	}

	function get() {
		return $this->resolveDtoList(array("KalturaAnnotation", "KalturaAdCuePoint"), "KalturaMetadataListResponse");
	}
}
?>