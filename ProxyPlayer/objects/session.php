<?php
class Session extends BaseObject {

    public $requireSerialization = true;

	function __construct() {
	}

	function get() {
		return $this->resolveDtoList("KalturaStartWidgetSessionResponse", NULL, $this->getData(), NULL, true);
	}
}
?>