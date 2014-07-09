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

	function sort($sortIndex, $sortTypes){
		$this->dataType = array();
		foreach ($sortTypes as $sortType) {
			$this->dataType[$sortType] = array();
		}
		
		foreach ($this->data as $dataItem) {
			$this->dataType[$dataItem[$sortIndex]] = $dataItem;
		}
	}
}
?>