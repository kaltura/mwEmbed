<?php

/*
	Returns json with license acquisition data. 
	Required parameters:
		wid, uiconf_id, entry_id, ks
	Optional parameter:
		flavor_ids  (comma-separated list)
		
	Return value:
	{
		"flavorData": {
			"flavor1": {"custom_data": "...", "signature": "..."},
			"flavor2": {"custom_data": "...", "signature": "..."}
		},
		"
	}
*/


$wgMwEmbedApiServices['getLicenseData'] = 'mweApiGetLicenseData';

require_once( dirname( __FILE__ ) . '/../KalturaCommon.php' );

class mweApiGetLicenseData {

	function run() {
		global $wgKalturaUdrmLicenseServerUrl;

		$flavorData = $this->getData();

		$this->sendHeaders();
		
		if (!$flavorData) {
			echo "{}";
			return;
		}
		
		// Filter by flavor_ids, if specified.
		$flavorIds = $_REQUEST["flavor_ids"];
		
		$response = array();
		$response["config"] = array("licenseServerBaseURL" => $wgKalturaUdrmLicenseServerUrl);
		
		$responseFlavorData = array();
		
		if ($flavorIds) {
			$responseFlavorData = array();
			$flavorList = explode(',', $flavorIds);
			foreach ($flavorList as $flavorId) {
				$responseFlavorData[$flavorId] = $flavorData[$flavorId];
			}
		} else {
			$responseFlavorData = $flavorData;
		}
		
		$response["flavorData"] = $responseFlavorData;

		echo json_encode($response);
	}
	

	function sendHeaders() {
		// Set content type
		header("Content-type: application/json");
		
		// Set no cache
		header("Cache-Control: no-cache, must-revalidate");
		header("Pragma: no-cache"); // 	for HTTP/1.0
	}
	
	function getData() {
		global $container;
		$drmPluginData = null;
		try {
			// When EntryResult fails to parse some parameters (most notably ks), it fails when loaded.
			$resultObject = $container['entry_result']->getResult();
			$drmPluginData = (array)$resultObject["contextData"]->pluginData["KalturaDrmEntryContextPluginData"];
			return $drmPluginData["flavorData"];
		} catch (Exception $e) {
			error_log("mweApiGetLicenseData: Failed to parse request: \n" . $e);
			return null;
		}
	}
}
