<?php
class Multirequest extends BaseObject{
	function __construct() {
	}

	function get() {
		return array(
			(new Baseentry())->get(),
			(new EntryContextData())->get(),
			(new Metadata())->get(),
			(new Cuepoints())->get()
		);
	}
}