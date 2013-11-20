<?php

$wgMwEmbedApiServices['metaData'] = 'mweMetaData';

class mweMetaData {
	function run(){
		global $wgMwEmbedVersion;
		header( 'Content-type: text/javascript');
		$metaData = array('playerVersion' => $wgMwEmbedVersion );
		echo json_encode( $metaData );
	}
}