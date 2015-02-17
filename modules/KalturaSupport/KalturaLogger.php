<?php

// Include the kaltura client ( provides IKalturaLogger which is not presently integrated into autoLoader )

class KalturaLogger implements IKalturaLogger {

	var $logDir = null;
	var $enabled = false;

	function __construct( $logDir = null, $enabled = false ) {
		if( !$logDir ) {
			$enabled = false;
		}
		$this->logDir = $logDir;
		// Create log dir if not exists
		if( ! file_exists($logDir) ) {
			@mkdir( $logDir );
		}		

		$this->enabled = $enabled;
	}

	function log( $msg ) {

		if( !$this->enabled ) {
			return false;
		}

		$logFile = $this->logDir . '/' . date("Y-m-d") . '_log.txt';
		$msg = $msg . "\n";
		
		@file_put_contents( $logFile, $msg, FILE_APPEND);
		
	}
}