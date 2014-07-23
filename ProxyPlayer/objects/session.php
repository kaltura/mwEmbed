<?php
class Session extends BaseObject {

    public $requireSerialization = true;

	function __construct() {
	}

	function execute($req, $res){
	    $res->setBody($this->get());
	}

	function get() {
		return $this->resolveDtoList("KalturaStartWidgetSessionResponse", NULL, true);
	}
}
?>