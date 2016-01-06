<?php

/*
	Returns json with license acquisition data. 
	Required parameters:
		wid, uiconf_id, entry_id, ks, drm (wv_classic|wv_modular)
	Optional parameter:
		flavor_ids  (comma-separated list)
		
	Return value:
	{
        "licenseUri": {
            "flavor1": "https://udrm.kaltura.com/widevine/license?custom_data=xyz123&signature=sxyz123",
            "flavor2": "https://udrm.kaltura.com/widevine/license?custom_data=abc456&signature=sabc456"
        }
	}
	
	OR, if there's an error:
	{
		"error": {
			"message": "something is wrong"
		}
	}
*/


$wgMwEmbedApiServices['getLicenseData'] = 'mweApiGetLicenseData';

require_once( dirname( __FILE__ ) . '/../KalturaCommon.php' );	// For EntryResult

class mweApiGetLicenseData {

	function __construct() {
		global $container;
	}

	function run() {
		global $wgKalturaUdrmLicenseServerUrl;

		// Always send 200, errors are signalled in json.		
		$this->sendHeaders();
		
		$response = array();
		
		$missingParams = $this->getMissingParams();
		
        // strip possible ending slash
        $udrmBaseURL = preg_replace('/(.+)\/$/', '\\1', $wgKalturaUdrmLicenseServerUrl);
        
        try {
            if ($missingParams) {
                throw new Exception('Missing mandatory parameter(s): ' . implode(', ', $missingParams));
            }
            
            $drm = $_REQUEST['drm'];
            switch ($drm) {
                case 'wv_classic':
                    $licensePath = 'widevine/license';
                    break;
                case 'wv_modular':
                    $licensePath = 'cenc/widevine/license';
                    break;
                default:
                    throw new Exception('Unknown DRM scheme ' . $drm);
            }

            // EntryResult throws an exception when something's wrong
            $flavorData = $this->getRawFlavorData();
            $response = array();
            foreach ($flavorData as $flavorId => $flavorCustomDataSig) {
                $custom_data = $flavorCustomDataSig['custom_data'];
                $signature = $flavorCustomDataSig['signature'];
                $url = sprintf('%s/%s?custom_data=%s&signature=%s', 
                        $udrmBaseURL, $licensePath, $custom_data, $signature);
                $response[$flavorId] = $url;
            }
            $response = $this->filterByRequestedFlavors($response);
            
        } catch (Exception $e) {
            $response = array(
                'error' => array(
                    'message' => $e->getMessage()
                )
            );
        }     
        
		echo json_encode($response, JSON_FORCE_OBJECT);
	}
	
	function filterByRequestedFlavors($fullFlavorData) {
        if (isset($_REQUEST['flavor_ids'])) {
    		$flavorIds = $_REQUEST['flavor_ids'];
			$responseFlavorData = array();
			$flavorList = explode(',', $flavorIds);
			foreach ($flavorList as $flavorId) {
                if (isset($fullFlavorData[$flavorId])) {
    				$responseFlavorData[$flavorId] = $fullFlavorData[$flavorId];
                }
			}
		} else {
			$responseFlavorData = $fullFlavorData;
		}
		return $responseFlavorData;
	}
	
	function getMissingParams() {
		// Check mandatory parameters (wid, uiconf_id, entry_id, ks)
		$mandatory = array('wid', 'uiconf_id', 'entry_id', 'ks', 'drm');
		$missing = array();
		foreach ($mandatory as $param) {
			if (!isset($_REQUEST[$param])) {
				$missing[] = $param;
			}
		}
		return $missing;
	}

	function sendHeaders() {
		// Set content type
		header('Content-type: application/json');
		
		// Set no cache
		header('Cache-Control: no-cache, must-revalidate');
		header('Pragma: no-cache'); // 	for HTTP/1.0
	}
	
	function getRawFlavorData() {
		global $container;
		$drmPluginData = null;
		$resultObject = $container['entry_result']->getResult();
        if (isset($resultObject['error'])) {
            throw new Exception($resultObject['error']);
        }
		$drmPluginData = (array)$resultObject['contextData']->pluginData['KalturaDrmEntryContextPluginData'];
		return $drmPluginData['flavorData'];
	}
}
