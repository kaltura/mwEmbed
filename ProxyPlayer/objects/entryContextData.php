<?php

class EntryContextData extends BaseObject {

	var $data;

	function __construct() {		
	}

	function get() {
		$res = $this->resolveDtoList("KalturaEntryContextDataResult", NULL, $this->getData(), NULL, true);
		$flavorAssets = (new FlavorAssets())->get();
		$res->flavorAssets = $flavorAssets;
		return $res;	
	}
}
?>