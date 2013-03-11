<?php 
// Include the kaltura php api, you can get your copy here:
// http://www.kaltura.com/api_v3/testme/client-libs.php
require_once( dirname( __FILE__ ) . '/../../../modules/KalturaSupport/Client/kaltura_client_v3/KalturaClient.php');
/**
 * Takes in a : 
 * $wid, string, The widget id 
 * $playlistId, string, The playlist_id
 */
function getKalturaPlaylist( $partnerId, $playlistId ){
	$config = new KalturaConfiguration($partnerId);
	$config->serviceUrl = 'http://www.kaltura.com/';
	$client = new KalturaClient($config);
	$client->startMultiRequest();
	// the session: 
	$kparams = array();
	$client->addParam( $kparams, 'widgetId', '_' . $partnerId );
	$client->queueServiceActionCall( 'session', 'startWidgetSession', $kparams );
	// The playlist meta:
	$kparams = array();
	$client->addParam( $kparams, 'ks', '{1:result:ks}' );
	$client->addParam( $kparams, 'id', $playlistId );
	$client->queueServiceActionCall( 'playlist', 'get', $kparams );
	// The playlist entries: 
	$client->queueServiceActionCall( 'playlist', 'execute', $kparams );
	
	$rawResultObject = $client->doQueue();
	return array(
		'meta' => (array)$rawResultObject[1],
		'playlist' => (array)$rawResultObject[2] 
	);
}