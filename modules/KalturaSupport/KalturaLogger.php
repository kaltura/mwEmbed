<?php

class KalturaLogger implements IKalturaLogger {

	var $logDir = null;
	var $enabled = false;

	function __construct( $logDir = null, $enabled = false ) {
		if( !$logDir ) {
			$enabled = false;
		}
		$this->logDir = $logDir;
		$this->enabled = $enabled;
	}

	function log( $msg ) {

		if( !$this->enabled ) {
			return false;
		}

		$logDir = $this->logDir . '/logs';
		$logFile = $logDir . '/' . date("Y-m-d") . '_kalturaClientLog.txt';

		// try to create log dir if not exists
		if( ! file_exists($logDir) ) {
			@mkdir( $logDir );
		}

		$msg = $msg . "\n";
		
		@file_put_contents( $logFile, $msg, FILE_APPEND);
		
	}
}