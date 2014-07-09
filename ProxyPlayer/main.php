<?php
require_once (dirname(__FILE__)."/kaltura_client_v3/KalturaEnums.php");
require_once (dirname(__FILE__)."/kaltura_client_v3/KalturaTypes.php");
include_once (dirname(__FILE__)."/BaseObject.php");
include_once (dirname(__FILE__)."/dataStore.php");
include_once (dirname(__FILE__)."/request.php");

$qs       = $_SERVER['QUERY_STRING'];
$main     = new Main();
$response = $main->resolveRequest($qs);
print_r(@serialize($response));

//$console = new Logger("console");
//$console->log($qs);

class Main {

	function __construct() {
		$this->loadModules('/objects');
		$this->loadModules('/Utils');
		$this->loadModules('/kaltura_client_v3/KalturaPlugins');

	}

	function loadModules($folderName) {
		// load all plugins
		$pluginsFolder = realpath(dirname(__FILE__)).$folderName;
		if (is_dir($pluginsFolder)) {
			$dir = dir($pluginsFolder);
			while (false !== $fileName = $dir->read()) {
				$matches = null;
				if (preg_match('/^([^.]+).php$/', $fileName, $matches)) {
					require_once ("$pluginsFolder/$fileName");

					$pluginClass = $matches[1];
					if (!class_exists($pluginClass) || !in_array('IKalturaClientPlugin', class_implements($pluginClass))) {
						continue;
					}
				}
			}
		}
	}

	function resolveRequest($request) {
		parse_str(urldecode($request), $tokens);
		$service = isset($tokens["service"]) ? $tokens["service"] : "";
		if (!empty($service) && isset($service) && class_exists($service, false)) {
			$serviceHandler = call_user_func(array(ucfirst($service), 'getClass'));
			$data = NULL;
			if ($service == "multirequest"){
				if (isset($tokens["1:filter:freeText"])){
					$partnerRequestData = json_decode($tokens["1:filter:freeText"]);
					$request = new ProxyRequest();
					$data = $request->get($partnerRequestData);	
					DataStore::getInstance()->setData("baseentry", array($data["GetMediaInfoResult"]["Media"]));
					//DataStore::getInstance()->setData("flavorassets", $data["GetMediaInfoResult"]["Media"]["Files"]["File"]);
				}
			}
			return $serviceHandler->get();
		} else {
			return array("message" => "service not found!");
		}
	}
}
?>

