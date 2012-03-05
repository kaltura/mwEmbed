<?php

class KalturaLogger implements IKalturaLogger {

	function __construct() {

	}

	function log( $msg ) {
		global $wgScriptCacheDirectory;

		$logDir = $wgScriptCacheDirectory . '/logs';
		$logFile = $logDir . '/' . date("Y-m-d") . '_kalturaClientLog.txt';

		// try to create log dir if not exists
		if( ! file_exists($logDir) ) {
			@mkdir( $logDir );
		}

		$msg = $msg . "\n";
		
		@file_put_contents( $logFile, $msg, FILE_APPEND);
		
	}
}