<?php

class KalturaLogger implements IKalturaLogger {

	var $cacheDir = null;
	var $enabled = false;

	function __construct( $cacheDir = null, $enabled = false ) {
		if( !$cacheDir ) {
			throw new Exception("Error: missing cache dir");	
		}
		$this->cacheDir = $cacheDir;
		$this->enabled = $enabled;
	}

	function log( $msg ) {

		if( !$this->enabled ) {
			return false;
		}

		$logDir = $this->cacheDir . '/logs';
		$logFile = $logDir . '/' . date("Y-m-d") . '_kalturaClientLog.txt';

		// try to create log dir if not exists
		if( ! file_exists($logDir) ) {
			@mkdir( $logDir );
		}

		$msg = $msg . "\n";
		
		@file_put_contents( $logFile, $msg, FILE_APPEND);
		
	}
}