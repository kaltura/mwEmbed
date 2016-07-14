<?php

/*
	Returns json with license acquisition uri. 
	Required parameters:
		uiconf_id, entry_id, flavor_id, drm (wvclassic|wvcenc)
    Other parameters are required depending on system setup.
		
	Return value:
	{
        "licenseUri": "https://udrm.kaltura.com/widevine/license?custom_data=xyz123&signature=sxyz123&files=sdhu3R"
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
		
        // Trim possible ending slash
        $udrmBaseURL = rtrim($wgKalturaUdrmLicenseServerUrl, '/');
        
        try {
            $missingParams = array_diff(array('drm', 'flavor_id', 'entry_id', 'uiconf_id'), array_keys($_REQUEST));
            if ($missingParams) {
                throw new Exception('Missing mandatory parameter(s): ' . implode(', ', $missingParams));
            }
            
            $drm = $_REQUEST['drm'];
            switch ($drm) {
                case 'wvclassic':
                    $licensePath = 'widevine/license';
                    break;
                case 'wvcenc':
                    $licensePath = 'cenc/widevine/license';
                    break;
                default:
                    throw new Exception('Unknown DRM scheme ' . $drm);
            }

            $flavorId = $_REQUEST['flavor_id'];
            
            $flavorData = $this->getRawFlavorData();
            if (isset($flavorData[$flavorId])) {
                $licenseData = $flavorData[$flavorId];
            } else {
                throw new Exception('flavorId "' . $flavorId . '" not found');
            }
            $custom_data = $licenseData['custom_data'];
            $signature = $licenseData['signature'];
            $licenseUri = sprintf('%s/%s?custom_data=%s&signature=%s&files=%s', 
                    $udrmBaseURL, $licensePath, $custom_data, $signature, urlencode(base64_encode($flavorId)));
            
            $response = array('licenseUri' => $licenseUri);
            
        } catch (Exception $e) {
            $response = array(
                'error' => array(
                    'message' => $e->getMessage()
                )
            );
        }     
        
		echo json_encode($response, JSON_FORCE_OBJECT);
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
        // Convert the result to array.
        return json_decode(json_encode($drmPluginData['flavorData']), true);
	}
}
