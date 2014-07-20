<?php
class Session extends BaseObject {

	function __construct() {
	}

	function get() {
		return $this->resolveDtoList("KalturaStartWidgetSessionResponse", NULL, $this->getData(), NULL, true);
	}
}
?>