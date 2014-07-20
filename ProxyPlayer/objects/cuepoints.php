<?php

class Cuepoints extends BaseObject {

	var $data;

	function __construct() {		
	}

	function get() {
		return $this->resolveDtoList(
			array("KalturaAnnotation" => "annotation.Annotation", 
				"KalturaAdCuePoint" => "adCuePoint.Ad"), 
			"KalturaMetadataListResponse",
			$this->getData(),
			"cuePointType");	
	}
}
?>