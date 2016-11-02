<?php

/*
	Returns json with license acquisition uri. 
	Required parameters:
		uiconf_id, entry_id, drm (wvclassic|wvcenc|fps)
    Other parameters are required depending on system setup.
		
	Return value:
	{
        "licenseUri": "https://udrm.kaltura.com/widevine/license?custom_data=xyz123&signature=sxyz123&files=sdhu3R",
        "fpsCertificate": "BASE64-ENCODED-CERTIFICATE"
    }
    
    The fpsCertificate property is only included if FairPlay is available and drm=fps.


    If there's an error in the request or in processing it, an error is returned instead:
	{
		"error": {
			"message": "something is wrong"
		}
	}
    
    
    If flavor_id is not set or empty, the first flavor is selected.
    If flavor_id is not set, the resulting licenseUri will NOT contain the "files" parameter.
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
            $missingParams = array_diff(array('drm', 'entry_id', 'uiconf_id'), array_keys($_REQUEST));
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
                case 'fps':
                    $licensePath = 'fps/license';
                    break;
                default:
                    throw new Exception('Unknown DRM scheme ' . $drm);
            }
            
            

            if (isset($_REQUEST['flavor_id'])) {
                $flavorId = $_REQUEST['flavor_id'];
            } else {
                $flavorId = null;
            }
            
            $rawData = $this->getRawData();

            $flavorData = $rawData['flavorData'];
            
            if (!empty($flavorId)) {
                $files = $flavorId;
                if (isset($flavorData[$flavorId])) {
                    $licenseData = $flavorData[$flavorId];
                } else {
                    throw new Exception('flavorId "' . $flavorId . '" not found');
                }
                
            } elseif (count($flavorData) > 0) {
                reset($flavorData);
                $data = each($flavorData);
                $files = $data[0];
                $licenseData = $data[1];
            } else {
                throw new Exception('flavorData not found');
            }

            $custom_data = $licenseData['custom_data'];
            $signature = $licenseData['signature'];
            $licenseUri = sprintf('%s/%s?custom_data=%s&signature=%s', $udrmBaseURL, $licensePath, $custom_data, $signature);
            
            if (!is_null($flavorId)) {
                $licenseUri .= "&files=" . urlencode(base64_encode($files));
            }
                
            $response = array('licenseUri' => $licenseUri);
            if ($drm == 'fps' && isset($rawData['fpsCertificate'])) {
                $response['fpsCertificate'] = $rawData['fpsCertificate'];
            }
            
        } catch (Exception $e) {
            $response = array(
                'error' => array(
                    'message' => $e->getMessage()
                )
            );
        }     
        
        $encode_flags = JSON_FORCE_OBJECT;
        if (defined("JSON_UNESCAPED_SLASHES")) {
            $encode_flags |= JSON_UNESCAPED_SLASHES;
        }
		echo json_encode($response, $encode_flags);
	}
	
	function sendHeaders() {
		// Set content type
		header('Content-type: application/json');
		
		// Set no cache
		header('Cache-Control: no-cache, must-revalidate');
		header('Pragma: no-cache'); // 	for HTTP/1.0
	}
	
	function getRawData() {
		global $container;
		$drmPluginData = null;
		$resultObject = $container['entry_result']->getResult();
        if (isset($resultObject['error'])) {
            throw new Exception($resultObject['error']);
        }
        $contextData = $resultObject['contextData'];
        // If there's an error, $contextData is an array with ["message"]
        if (is_array($contextData)) {
            if (isset($contextData['message'])) {
                throw new Exception($contextData['message']);
            }
            throw new Exception('unexpected error');
        }
        
        $pluginData = $resultObject['contextData']->pluginData;
        if (!isset($pluginData['KalturaDrmEntryContextPluginData'])) {
            throw new Exception("Entry does not have DRM data");
        }
        
		$drmPluginData = (array)$pluginData['KalturaDrmEntryContextPluginData'];
        if (isset($pluginData['KalturaFairplayEntryContextPluginData'])) {
            $fpsPluginData = (array)$pluginData['KalturaFairplayEntryContextPluginData'];
            $fpsCertificate = $fpsPluginData['publicCertificate'];
        } else {
            $fpsCertificate = null;
        }
        
        if (!isset($drmPluginData['flavorData'])) {
            throw new Exception("Entry does not have DRM flavor data");
        }

        $response = array(
            'flavorData' => json_decode(json_encode($drmPluginData['flavorData']), true), 
            'fpsCertificate' => $fpsCertificate
        );
        return $response;
	}
}
