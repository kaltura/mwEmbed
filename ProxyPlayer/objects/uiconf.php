<?php

class Uiconf extends BaseObject {

	var $data;
	public $requireSerialization = true;

	function __construct() {
	}

	function get() {
	    $res = new stdClass();
	    $res->config = json_encode($this->getData());
		return $res;
	}
}
?>