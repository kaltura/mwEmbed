<?php
class Multirequest extends BaseObject{

    public $requireSerialization = true;

	function __construct() {
	}

	function get() {
	    $baseEntry = new Baseentry();
	    $entryContextData = new EntryContextData();
	    $metaData = new Metadata();
	    $cuePoints = new Cuepoints();
		return array(
			$baseEntry ->get(),
			$entryContextData->get(),
			$metaData->get(),
			$cuePoints->get()
		);
	}
}