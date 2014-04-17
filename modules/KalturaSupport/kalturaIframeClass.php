<?php 
/**
 * Kaltura iFrame class:
 */
require_once 'KalturaCommon.php';

class kalturaIframeClass {

	var $request = null;
	var $uiConfResult = null; // lazy init
	var $entryResult = null; // lazy init
	var $playlistResult = null; // lazy init
	var $debug = false;
	var $error = null;
	var $playerError = false;
	var $envConfig = null; // lazy init
	var $iframeContent = null;
	var $iframeOutputHash = null;

	var $templates = array();

	const NO_ENTRY_ID_FOUND = "No Entry ID was found";

	function __construct() {
		global $container;
		$this->request = $container['request_helper'];
		$this->client = $container['client_helper'];
		$this->utility = $container['utility_helper'];
		$this->logger = $container['logger'];

		// No entry Id and Reference Id were found
		if( ! $this->request->getEntryId() && ! $this->request->getReferenceId() ) {
			$setError = true;
			// Try to grab entry Id from the widget.
			// Only if it's not the default widget ( does not start with underscode )
			if( substr($this->request->get('wid'), 0, 1) !== '_' ) {
				$setError = false;
				$widget = $this->getWidget($this->request->get('wid'));
				if($widget && isset($widget->entryId)) {
					$this->request->set('entry_id', $widget->entryId);
				} else {
					$setError = true;
				}
			}
			if( $setError ) {
				$this->error = self::NO_ENTRY_ID_FOUND;
			}
		}		
	}

	function getIframeId(){
		$playerId = $this->request->get('playerId');
		if( $playerId ){
			return htmlspecialchars( $playerId );
		}
		return 'iframeVid';
	}
	function getVersionString(){
		global $wgMwEmbedVersion;
		return 'html5iframe:' . $wgMwEmbedVersion;
	}

	function getError() {
		return $this->error;
	}

	/**
	 * Get Widget Object
	 */
	function getWidget( $widgetId = null ) {
		if( $widgetId ) {
			$client = $this->client->getClient();
			$kparams = array();
			try {
				$result = $client->widget->get($widgetId);
			} catch( Exception $e ){
				throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			}
			if( $result ) {
				return $result;
			}
			return false;
		}
	}

	/**
	 * Grabs a uiConf result object:
	 */
	function getUiConfResult(){
		global $container;
		if( is_null( $this->uiConfResult ) ){
			try{
				// Init a new result object with the client tag:
				$this->uiConfResult = $container['uiconf_result'];
			} catch ( Exception $e ){//die($e->getMessage());
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->uiConfResult;
	}
	/**
	 * Grabs a entry result object:
	 */
	function getEntryResult(){
		global $container;
		if( is_null( $this->entryResult ) ){
			try{
				// Init a new result object with the client tag:
				$this->entryResult =  $container['entry_result'];
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->entryResult;
	}
	/**
	 * Grabs a playlist result object:
	 */
	function getPlaylistResult(){
		global $container;
		if( is_null( $this->playlistResult ) ){
			try{
				// Init a new result object with the client tag:
				$this->playlistResult =  $container['playlist_result'];
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->playlistResult;
	}
	private function getVideoHTML(){
		$videoTagMap = array(
			'entry_id' => 'kentryid',
			'uiconf_id' => 'kuiconfid',
			'wid' => 'kwidgetid',
			'autoplay' => 'autoplay',
		);

		// If we have an error, show it
		if( $this->getError() ) {
			$this->playerError = $this->getError();
		}

		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		$o = "\n\n\t" .'<video class="persistentNativePlayer" ';
		$o.= 'poster="' . htmlspecialchars( "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%01%00%00%00%01%08%02%00%00%00%90wS%DE%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%0B%0A%17%041%80%9B%E7%F2%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00%0CIDAT%08%D7c%60%60%60%00%00%00%04%00%01'4'%0A%00%00%00%00IEND%AEB%60%82" ) . '" ';
		$o.= 'id="' . htmlspecialchars( $this->getIframeId() ) . '" ';

		// Check for webkit-airplay option
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		if( isset( $playerConfig['vars']['EmbedPlayer.WebKitAllowAirplay'] ) ){
			$o.= 'x-webkit-airplay="allow" ';
		}

		// Add any additional attributes:
		foreach( $videoTagMap as $key => $val ){
			$param = $this->request->get($key);
			if( $param ) {
				$o.= ' ' . $val . '="' . htmlentities( $param ) . '"';
			}
		}

		$o.= ' kpartnerid="' . $this->getEntryResult()->getPartnerId() . '" ';
		if( $this->playerError !== false ){
			// TODO should move this to i8ln keys instead of raw msgs
			$o.= ' data-playerError="' . htmlentities( $this->playerError ) . '" ';
		}
		// Check for hide gui errors ( missing entry ) Right this is hard coded, we need a better error handling system!
		if( $this->playerError == self::NO_ENTRY_ID_FOUND ){
			$o.= ' data-blockPlayerDisplay="true" ';
		}

		// Since we load all metadata from api, set preload to none to speed up player display
		// in some browsers.
		$o.=' preload="none" ';

		// Close the open video tag attribute set
		$o.='>';

		$o.= "\n" . "</video>\n";

		// Wrap in a videoContainer
		return  '<div class="videoHolder"><div class="videoDisplay"> ' . $o . '</div></div>';
	}

	private function getFlashObjectSettings(){

		$settings = array(
			'wid' => $this->request->get('wid'),
			'uiconf_id' => $this->request->get('uiconf_id'),
			'flashvars' => $this->request->getFlashVars()
		);

		if( $this->request->get('entry_id') ){
			$settings['entry_id'] = $this->request->get('entry_id');
		}

		// add ks flashvar
		$settings['flashvars']['ks'] = $this->client->getKS();
		// add referrer flashvar
		$settings['flashvars']['referrer'] = htmlspecialchars( $this->request->getReferer() );

		if( isset( $_REQUEST['wmode'] ) && ( $_REQUEST['wmode'] == 'opaque' ||  $_REQUEST['wmode'] =='transparent' ) ){
			$settings['params'] = array(
				'wmode' => 'transparent'
			);
		} else {
			$settings['params'] = array(
				'wmode' => 'direct'
			);
		}

		return $settings;
	}
	/**
	 * Get custom player includes for css and javascript
	 */
	private function getCustomPlayerIncludes($onPageOnly = false){
		global $wgKalturaPSHtml5SettingsPath; 
		$resourceIncludes = array();
		$onPageIncludes = array();

		// Try to get uiConf
		if( ! $this->getUiConfResult()->getUiConf() ){
			return $resourceIncludes;
		}

		// vars
		$uiVars = $this->getUiConfResult()->getWidgetUiVars();
		foreach( $uiVars as $key => $value ){
			// Check for valid plugin types:
			$resource = array();
			if( strpos( $key, 'IframeCustomPluginJs' ) === 0 ){
				$resource['type'] = 'js';
			} else if( strpos( $key, 'IframeCustomPluginCss' ) === 0 ){
				$resource['type'] = 'css';
			} else {
				continue;
			}
			// we have a valid type key add src:
			$resource['src']= htmlspecialchars( $value );
				
			// Add the resource
			$resourceIncludes[] = $resource;
		}
		// plugins
		$plugins = $this->getUiConfResult()->getWidgetPlugins();
		if( !is_array($plugins) ){
			$plugins = array();
		}
		foreach( $plugins as $pluginId => $plugin ){
			// check if plugin is an array: 
			if( ! is_array( $plugin ) ){
				continue;
			}
			$loadInIframe = (isset($plugin['loadInIframe']) && $plugin['loadInIframe'] === true) ? true : false;
			// Only load onPage plugins into iframe If we're in external iframe mode
			$loadInIframe = ($loadInIframe && isset($_GET['iframeembed']));
			foreach( $plugin as $attr => $value ){
				$resource = array();
				if( strpos( $attr, 'iframeHTML5Js' ) === 0 || (
					$loadInIframe && strpos( $attr, 'onPageJs' ) === 0
				) ){
					$resource['type'] = 'js';
				} else if( strpos( $attr, 'iframeHTML5Css' ) === 0 || (
					$loadInIframe && strpos( $attr, 'onPageCss' ) === 0
				) ){
					$resource['type'] = 'css';
				} else {
					continue;
				}
				// we have a valid type key add src:
				$resource['src']= htmlspecialchars( $this->utility->getExternalResourceUrl($value) );

				// Add onPage resources to different array
				if( $onPageOnly && strpos( $attr, 'onPage' ) === 0 ) { 
					$onPageIncludes[] = $resource;
				} else {
					$resourceIncludes[] = $resource;
				}
			}
		}
		
		// first try .json file directly
		$psJsonPluginPaths = dirname( $wgKalturaPSHtml5SettingsPath ) . '/../ps/pluginPathMap.json';
		$psPluginList = array();
		if( is_file( $psJsonPluginPaths ) ){
			$psPluginList = json_decode( file_get_contents( $psJsonPluginPaths ), TRUE );
		}
		// TODO remove legacy php file support:
		// Check for any plugins that are defined in kwidget-ps ( without server side path listing )
		$psPluginPath =  dirname( $wgKalturaPSHtml5SettingsPath ) . '/../pluginPathMap.php';
		if( count( $psPluginList ) == 0 && is_file( $psPluginPath ) ){
			$psPluginList = include( $psPluginPath );
		}
		// add ps resources: 
		foreach( $psPluginList as $psPluginId => $resources ){
			if( in_array($psPluginId, array_keys( $plugins ) ) ){
				foreach( $resources as $resource ){
					// preappend '{html5ps}' magic string for ps plugin handling:
					$resource['src'] = '{html5ps}/' . htmlspecialchars( $resource['src'] );
					$resourceIncludes[] = $resource;
				}
			}
		}
		// return the resource array
		if( $onPageOnly ) {
			return $onPageIncludes;
		}
		return $resourceIncludes;
	}
	/**
	 * Gets a series of mw.config.set calls set via the uiConf of the kaltura player
	 * TODO: we should use getWidgetUiVars instead of parsing the XML
	 * */
	private function getEnvironmentConfig(){
		if( $this->envConfig === null ){
			$this->envConfig = array();
			if( ! $this->getUiConfResult()->getUiConf() ){
				return $this->envConfig;
			}
			// uiVars
			$this->envConfig = array_merge( 
				$this->envConfig,
				$this->getUiConfResult()->getWidgetUiVars() 
			);
		}
		return $this->envConfig;
	}
	private function getSwfUrl(){
		$kwidgetParams = array( 'wid', 'uiconf_id', 'entry_id', 'cache_st' );
		$swfUrl = $this->request->getServiceConfig('ServiceUrl') . '/index.php/kwidget';
		// pass along player attributes to the swf:
		foreach($kwidgetParams as $key ){
			$val = $this->request->get( $key );
			if( $val ){
				$swfUrl.='/' . $key . '/' . $val;
			}
		}
		return $swfUrl;
	}

	/**
	 * Function to set iframe content headers
	 */
	function setIFrameHeaders(){
		$addedEtag = false;
		foreach( $this->getHeaders() as $header ) {
			if( strrpos($header, "Etag") !== false ){
				$addedEtag = true;
			}
			header( $header );
		}
		// Add Etag
		if( !$addedEtag && !$this->request->get('debug') ){
			header("Etag: " . $this->getIframeOutputHash() );
		}
	}

	public function getHeaders(){
		$cacheHeaders = $this->utility->getCachingHeaders($this->getEntryResult()->getResponseHeaders());
		if( count($cacheHeaders) == 0 ) {
			$cacheHeaders = array(
				"Cache-Control: no-cache, must-revalidate",
				"Pragma: no-cache",
				"Expires: Sat, 26 Jul 1997 05:00:00 GMT"
			);
		}
		return $cacheHeaders;
	}

	/**
	 * Sets public header per a provided expire time in seconds
	 * @param $expireTime Number of seconds before content is expired
	 * @param $lastModified {optional} TimeStamp of the modification data
	 */
	private function sendPublicHeaders( $expireTime, $lastModified = null ){
		if( $lastModified === null ){
			$lastModified = time();
		}
		// Cache for $wgKalturaUiConfCacheTime
		header( "Cache-Control: public, max-age=$expireTime, max-stale=0");
		header( "Last-Modified: " . gmdate( "D, d M Y H:i:s", $lastModified) . "GMT");
		header( "Expires: " . gmdate( "D, d M Y H:i:s", $lastModified + $expireTime ) . " GM" );
	}

	/**
	 * Gets the resource loader path returns the url string.
	 */
	private function getMwEmbedPath(){
		global $wgResourceLoaderUrl, $wgEnableScriptDebug;
		$loaderPath = str_replace( 'load.php', '', $wgResourceLoaderUrl );

		// Check a uiConf path is defined:
		$xml = $this->getUiConfResult()->getUiConfXML();
		if( $xml && isset( $xml->layout ) && isset( $xml->layout[0] ) ){
			foreach($xml->layout[0]->attributes() as $name => $value) {
				if( $name == 'html5_url' ){
					if( $value[0] == '/' ){
						$loaderPath = $this->request->getServiceConfig( 'CdnUrl' ) . $value;
					} else if( substr( $value,0, 4 ) == 'http' ) {
						$loaderPath = $value;
					}
				}
			}
		}
		return $loaderPath;
	}
	/**
	 * Gets relevent url paramaters
	 * @return string
	 */
	private function getVersionUrlParams(){
		global $wgEnableScriptDebug;
		$versionParam ='';
		$urid = $this->request->get('urid');
		if( $urid ){
			$versionParam .= '&urid=' . htmlspecialchars( $urid );
		}
		if( $this->request->get('debug') || $wgEnableScriptDebug ){
			$versionParam .= '&debug=true';
		}
		return $versionParam;
	}
	private function getUiConfWidParams(){
		$paramString = '';
		$and = '';
		$parmList = array( 'wid', 'uiconf_id', 'p', 'cache_st' );
		foreach( $parmList as $param ){
			$val = $this->request->get( $param );
			if( $val ){
				$paramString.= $and. $param . '=' . htmlspecialchars( $val );
				$and = '&';
			}
		}
		return $paramString;
	}
	/**
	 * Retrieves a custom skin url if set
	 * @return false if unset
	 */
	private function getCustomSkinUrl(){
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		if( isset(  $playerConfig['vars']['IframeCustomjQueryUISkinCss'] ) ){
			return $this->resolveCustomResourceUrl(  
				$playerConfig['vars']['IframeCustomjQueryUISkinCss'] 
			);
		}
		return false;
	}
	private function resolveCustomResourceUrl( $url ){
		global $wgHTML5PsWebPath;
		if( strpos( $url, '{html5ps}' ) === 0  ){
			$url = str_replace('{html5ps}', $wgHTML5PsWebPath, $url);
		}
		return $url;
	}
	/**
	 * Get the mwEmbed Startup script as inline js
	 */
	private function getMwEmbedStartInline(){
		global $wgEnableScriptDebug, $wgScriptCacheDirectory, $wgMwEmbedVersion, 
			$wgResourceLoaderMinifierStatementsOnOwnLine, $wgDefaultSkin, $wgHTTPProtocol;
		
		// set request param
		$_GET['modules'] = 'startup';
		$_GET['only'] = 'scripts';
		// check if we are overriding the skin:
		$_GET['skin'] = $wgDefaultSkin;
		if( $this->getCustomSkinUrl() ){
			$_GET['skin'] = 'custom';
		}
		// include skin in cache path, as a custom param needed for startup
		$cachePath = $wgScriptCacheDirectory . '/startup.' .
			$wgMwEmbedVersion . $_GET['skin'] . $wgHTTPProtocol . '.min.js';
			
		// check for cached startup:
		if( !$wgEnableScriptDebug){
			if( is_file( $cachePath ) ){
				return file_get_contents( $cachePath );
			}
		}

		$fauxRequest = new WebRequest;
		$resourceLoader = new MwEmbedResourceLoader();
		$modules = array();
		$modules['startup'] = $resourceLoader->getModule( 'startup' );
		$s = $resourceLoader->makeModuleResponse( new MwEmbedResourceLoaderContext( $resourceLoader, $fauxRequest ) , 
			$modules, 
			array()
		);
		// check if we should minify and cache: 
		if( !$wgEnableScriptDebug ){
			$s = JavaScriptMinifier::minify( $s, $wgResourceLoaderMinifierStatementsOnOwnLine );
			// try to store the cached file: 
			@file_put_contents($cachePath, $s);
		}
		return $s;
	}
	/**
	 * Get the location of the mwEmbed library
	 * return @string mwEmbedLoader url
	 */
	private function getMwEmbedLoaderLocation(){
		return $this->getMwEmbedPath() . 'mwEmbedLoader.php?' . $this->getVersionUrlParams() .
			'&' . $this->getUiConfWidParams() .
			// we add an iframe server flag to avoid loading onPage plugins inside the iframe
			'&iframeServer=true'; 
	}


	/**
	 * Get the iframe css
	 */
	function outputIframeHeadCss(){
		return <<<HTML
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Kaltura Embed Player iFrame</title>
	<style type="text/css">
		html,body,video {
			width: 100%;
			height: 100%;
			padding: 0;
			margin: 0;
		}
		body {
			font: normal 13px helvetica, arial, sans-serif;
			background: #000;
			color: #fff;
			overflow: hidden;
		}
		
		div,video {
			margin: 0;
			padding: 0;
		}
		.mwPlayerContainer { width: 100%; height: 100%; }
		#error {
			position: absolute;
			top: 37%;
			left: 10%;
			margin: 0;
			width: 80%;
			border: 1px solid #eee;
			-webkit-border-radius: 4px;
			-moz-border-radius: 4px;
			border-radius: 4px;
			text-align: center;
			background: #fff;
			padding-bottom: 10px;
			color: #000;
		}
		
		#error h2 {
			font-size: 14px;
		}
	</style>
HTML;

	}

	function outputSkinCss(){
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		// provide default layout if none exisits. 
		if( !isset( $playerConfig['layout'] ) ){
			$playerConfig['layout'] = array(
				"skin"=> "kdark",
				"cssFiles" => array()
			);
		}
		$layout = $playerConfig['layout'];
		// Todo use resource loader to manage the files
		if( isset($layout['cssFiles']) && count($layout['cssFiles']) ) {
			foreach( $layout['cssFiles'] as $cssFile ) {
				echo '<link rel="stylesheet" href="' .$this->resolveCustomResourceUrl($cssFile) .'" />' . "\n";
			}
		}
	}

	function outputCustomCss(){
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		if (isset($playerConfig['plugins']['theme'])){
			$theme = $playerConfig['plugins']['theme'];
			$customStyle = '<style type="text/css">';
			if (isset($theme['buttonsSize'])){
				$customStyle = $customStyle . 'body {font-size: ' . $theme['buttonsSize'] . 'px}';
			}
			if (isset($theme['buttonsColor'])){
				$customStyle = $customStyle . '.btn {background-color: ' . $theme['buttonsColor'] . '!important}';
			}
			if (isset($theme['sliderColor'])){
				$customStyle = $customStyle . '.ui-slider {background-color: ' . $theme['sliderColor'] . '!important}';
			}
			if (isset($theme['controlsBkgColor'])){
				$customStyle = $customStyle . '.controlsContainer {background-color: ' . $theme['controlsBkgColor'] . '!important}';
				$customStyle = $customStyle . '.controlsContainer {background: ' . $theme['controlsBkgColor'] . '!important}';
			}
			if (isset($theme['scrubberColor'])){
				$customStyle = $customStyle . '.playHead {background-color: ' . $theme['scrubberColor'] . '!important}';
				$customStyle = $customStyle . '.playHead {background: ' . $theme['scrubberColor'] . '!important}';
			}
			if (isset($theme['buttonsIconColor'])){
				$customStyle = $customStyle . '.btn {color: ' . $theme['buttonsIconColor'] . '!important}';
			}
			if (isset($theme['watchedSliderColor'])){
				$customStyle = $customStyle . '.watched {background-color: ' . $theme['watchedSliderColor'] . '!important}';
			}
			if (isset($theme['bufferedSliderColor'])){
            				$customStyle = $customStyle . '.buffered {background-color: ' . $theme['bufferedSliderColor'] . '!important}';
            			}
			$customStyle =  $customStyle . '</style>' . "\n";
			echo $customStyle;
		}
	}

	function getPath() {
		global $wgResourceLoaderUrl;
		return str_replace( 'load.php', '', $wgResourceLoaderUrl );
	}
	/**
	 * Get all the kaltura defined modules from player config
	 * */
	function outputKalturaModules(){
		global $wgMwEmbedEnabledModules;
		$o='';
		// Init modules array, always include MwEmbedSupport
		$moduleList = array( 'mw.MwEmbedSupport' );

		// Check player config per plugin id mapping
		$kalturaSupportModules = array();
		$moduleDir = realpath( dirname( __FILE__ ) )  . '/..';
		foreach( $wgMwEmbedEnabledModules as $moduleName ){
			$modListPath = $moduleDir . '/' . $moduleName . '/' . $moduleName . '.php';
			if( is_file( $modListPath) ){
				$kalturaSupportModules = array_merge( $kalturaSupportModules, 
					include( $modListPath ) 
				);
			}
		}
		
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();

		foreach( $kalturaSupportModules as $name => $module ){
			if( isset( $module[ 'kalturaLoad' ] ) &&  $module['kalturaLoad'] == 'always' ){
				$this->addModuleTemplate( $module );
				$moduleList[] = $name;
			}
			// Check if the module has a kalturaPluginName and load if set in playerConfig
			if( isset( $module[ 'kalturaPluginName' ] ) ){
				if( is_array( $module[ 'kalturaPluginName' ] ) ){
					foreach($module[ 'kalturaPluginName' ] as $subModuleName ){
						if( isset( $playerConfig['plugins'][ $subModuleName] )){
							$this->addModuleTemplate( $module, $playerConfig['plugins'][ $subModuleName ] );
							$moduleList[] = $name;
							continue;
						}
					}
				} else if( isset( $playerConfig['plugins'][ $module[ 'kalturaPluginName' ] ] ) ){
					$this->addModuleTemplate( $module, $playerConfig['plugins'][ $module[ 'kalturaPluginName' ] ] );
					$moduleList[] = $name;
				}
			}
		}

		// Special cases: handle plugins that have more complex conditional load calls
		// always include mw.EmbedPlayer
		$moduleList[] = 'mw.EmbedPlayer';

		// Add our skin as dependency
		$skinName = (isset( $playerConfig['layout']['skin'] ) && $playerConfig['layout']['skin'] != "") ? $playerConfig['layout']['skin'] : null;
		if( $skinName ){
			$moduleList[] = $skinName;
		}		

		$jsonModuleList = json_encode($moduleList);
		$JST = $this->getTemplatesJSON();
		// export the loading spinner config early on:
		
		$o.= <<<HTML
		// Export our HTML templates
		window.kalturaIframePackageData.templates =  {$JST};

		var moduleList = {$jsonModuleList};
		var skinName = "{$skinName}";
		// IE8 has some issues with RL so we want to remove the skin
		if( skinName && isIE8 ) {
			var itemToDelete = jQuery.inArray(skinName, moduleList);
			if( itemToDelete != -1 )
				moduleList.splice( itemToDelete, 1);
		}
		mw.config.set('KalturaSupport.DepModuleList', moduleList);
		mw.loader.load(moduleList);
HTML;
		// check if loadingSpinner plugin has config: 
		if( isset( $playerConfig['plugins']['loadingSpinner'] ) ){
			$o.='mw.config.set(\'loadingSpinner\', '. 
				json_encode( $playerConfig['plugins']['loadingSpinner'] ) . ")\n";
		}
		
		return $o;
	}

	function addModuleTemplate( $module = null, $plugin = null ){
		if( !isset($this->templates) ){
			$this->templates = array();
		}
		if( isset($plugin) && isset($plugin['templatePath']) ){
			$templatePath = $plugin['templatePath'];
		}
		if( !isset($templatePath) && isset($module) && isset($module['templates']) ){
			$templatePath = $module['templates'];
		}

		// If we got a template
		if( isset($templatePath) ){
			$templateKey = str_replace('{html5ps}', '', $templatePath);
			$this->templates[ $templateKey ] = $this->loadTemplate( $templatePath );
		}
	}

	function loadTemplate( $path = null ){
		$path = $this->getFilePath( $path );

		if( !$path ){
			return false;
		}

		if( substr( $path, -10 ) !== '.tmpl.html' ){
			// Error trying to load non template file
			return false;
		}

		return file_get_contents( $path );
	}

	function getTemplatesJSON(){
		return json_encode($this->templates, JSON_FORCE_OBJECT);
	}

	function getSkinResources(){
		$skinsResources = include_once('skins/SkinResources.php');
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		$skinName = $playerConfig['layout']['skin'];
		$styles = array();
		if( isset($skinsResources[$skinName]) && isset($skinsResources[$skinName]['styles']) ){
			foreach( $skinsResources[$skinName]['styles'] as $style ){
				$styles[] = array(
					'type' => 'css',
					'src' => $this->getMwEmbedPath() . $style
				);
			}
		}
		return $styles;
	}

	function getKalturaIframeScripts(){
		global $wgMwEmbedVersion, $wgKalturaApiFeatures;
		ob_start();
		?>
		<script type="text/javascript">
			// Add the library version:
			window['MWEMBED_VERSION'] = '<?php echo $wgMwEmbedVersion ?>';
			// In same page iframe mode the script loading happens inline and not all the settings get set in time
			// its critical that at least EmbedPlayer.IsIframeServer is set early on. 
			window.preMwEmbedConfig = {};
			window.preMwEmbedConfig['EmbedPlayer.IsIframeServer'] = true;
			// in iframe context we explitly rewrite the embed player target once payload is ready:
			window.preMwEmbedConfig['EmbedPlayer.RewriteSelector'] = null;
			// Check if we can refrence kWidget from the parent context ( else include mwEmbedLoader.php locally )
			// TODO this could be optimized. We only need a subset of ~kWidget~ included. 
			// but remote embeding ( no parent kWidget ) is not a very common use case to optimize for at this point in 
			// time.
			try {
				if( window['parent'] && window['parent']['kWidget'] ){
					// import kWidget and mw into the current context:
					window['kWidget'] = window['parent']['kWidget']; 
				} else {
					// include kWiget script if not already avaliable
					document.write('<script src="<?php echo $this->getMwEmbedLoaderLocation() ?>"></scr' + 'ipt>' );
				}
			} catch( e ) {
				// include kWiget script if not already avaliable
				document.write( '<script src="<?php echo $this->getMwEmbedLoaderLocation() ?>"></scr' + 'ipt>' );
			}
		</script>
		<!-- kaltura ui cong js logic should be loaded at the loader level-->
		<!-- Output any iframe based packaged data -->
		<script type="text/javascript">
			// Initialize the iframe with associated setup
			window.kalturaIframePackageData = <?php 
				$payload = array(
					// The base player config controls most aspects of player display and sources
					'playerConfig' => $this->getUiConfResult()->getPlayerConfig(),
					// Set uiConf global vars for this player ( overides on-page config )
					'enviornmentConfig' => $this->getEnvironmentConfig(),
					// The iframe player id
					'playerId' => $this->getIframeId(),
					// Skin resources
					'skinResources' => $this->getSkinResources(),
					// Api features
					'apiFeatures' => $wgKalturaApiFeatures,
				);
				try{
					// If playlist add playlist and entry playlist entry to payload
					if( $this->getUiConfResult()->isPlaylist() ){
						// get playlist data, will load associated entryResult as well. 
						$payload = array_merge( $payload, 
										$this->getPlaylistResult()->getResult()
									);
					} else {
						$payload[ 'entryResult' ] = $this->getEntryResult()->getResult();
					}
				} catch ( Exception $e ){
					$payload['error'] = $e->getMessage();
				}
				echo json_encode( $payload );
			?>;

			var isIE8 = /msie 8/.test(navigator.userAgent.toLowerCase());
		</script>
		<script type="text/javascript">
			<!-- Include the mwEmbedStartup script inline will initialize the resource loader -->
			<?php echo $this->getMwEmbedStartInline() ?>
			// IE9 has out of order execution, wait for mw:
			var waitForMwCount = 0;
			var loadMw = function( callback ) {
				var waitforMw = function( callback ){
					// Most borwsers will respect the document.write order 
					// and directly execute the callback:
					// IE9 not so much
					if( window['mw'] &&  window['mw']['loader'] ){
						callback();
						return ;
					}
					setTimeout(function(){
						waitForMwCount++;
						if( waitForMwCount < 2000 ){
							waitforMw( callback );
						} else {
							if( console ){
								console.log("Error in loading mwEmbedLodaer");
							}
						}
					}, 5 );
				};
				// wait for mw to be ready before issuing the callback:
				waitforMw( callback );
			}
			// For loading iframe side resources that need to be loaded after mw 
			// but before player build out
			var loadCustomResourceIncludes = function( loadSet, callback ){
				callback = callback || function(){};
				// if an empty set issue callback directly
				if( loadSet.length == 0 ){
					callback();
					return ;
				}
				var loadCount = loadSet.length - 1;
				var checkLoadDone = function(){
					if( loadCount == 0 ){
						callback();
					}
					loadCount--;
				};
				var resource;
				for( var i =0 ; i < loadSet.length; i ++ ){
					resource = loadSet[i];
					if( resource.type == 'js' ){
						// use appendScript for clean errors
						kWidget.appendScriptUrl( resource.src, checkLoadDone, document );
					} else if ( resource.type == 'css' ){
						kWidget.appendCssUrl( resource.src, document );
						checkLoadDone();
					}
				}
			};
		</script>
		<?php
		return ob_get_clean();
	}

	function getFilePath( $path = null ){
		global $wgKalturaPSHtml5SettingsPath;


		if( strpos( $path, '{html5ps}' ) === 0 ) {
			$basePath = realpath( dirname( $wgKalturaPSHtml5SettingsPath ) . '/../ps/' );
			$path = str_replace('{html5ps}', $basePath, $path) ;
		} else {
			$basePath = realpath( __DIR__ );
			$path = $basePath . '/' . $path;
		}

		if( strpos( $path, $basePath ) !== 0 ){
			// Error attempted directory traversal:
			return false;
		}

		// Check if file exists
		if( !file_exists( $path ) ){
			die('file does not exists: ' . $path);
			return false;
		}

		return $path;
	}

	function getInlinePSResource( $resourcePath ){
		global $wgBaseMwEmbedPath, $wgScriptCacheDirectory, $wgResourceLoaderMinifierStatementsOnOwnLine;
		// Get the real resource path:
		$resourcePath = $this->getFilePath( $resourcePath );

		// Check if path is valid and exists
		if( !$resourcePath ) {
			return false;
		}
		
		if( substr( $resourcePath, -2 ) !== 'js' ){
			// error attempting to load a non-js file
			return false;
		}
		// last modified time: 
		$lmtime =  @filemtime( $resourcePath );
		// set the cache key
		$cachePath = $wgScriptCacheDirectory . '/OnPage_' . md5( $resourcePath ) . $lmtime . 'min.js';
		// check for cached version: 
		if( is_file( $cachePath) ){
			return file_get_contents( $cachePath );
		}
		// Get the JSmin class:
		require_once( $wgBaseMwEmbedPath . '/includes/libs/JavaScriptMinifier.php' );
		// get the contents inline: 
		$jsContent = @file_get_contents( $resourcePath );
		$jsMinContent = JavaScriptMinifier::minify( $jsContent, $wgResourceLoaderMinifierStatementsOnOwnLine );
	
		// try to store the cached file: 
		@file_put_contents($cachePath, $jsMinContent);
		return $jsMinContent;
	}
	/**
	 * Outputs custom resources and javascript callback 
	 */	
	function loadCustomResources( $callbackJS ){
		global $wgEnableScriptDebug;
		// css always loaded externally:
		if( $this->getCustomSkinUrl() ){
			?>
			jQuery('head').append(
					$('<link rel="stylesheet" type="text/css" />')
						.attr( 'href', '<?php echo htmlspecialchars( $this->getCustomSkinUrl() ) ?>'  )
			);
			<?php 
		}
		$customResourceSet = $this->getCustomPlayerIncludes();
		$urlResourceSet = array();
		// if not in debug mode output local resources inline
		foreach( $customResourceSet as $inx => $resource ){  
			// if debug is off try loading the file locally and injecting into the iframe payload
			// this avoids an extra request and speeds up player display
			if( !$wgEnableScriptDebug 
					&& 
				$resource['type'] == 'js' 
					&& 
				strpos( $resource['src'], '{html5ps}' ) === 0  
			){
				echo $this->getInlinePSResource( $resource['src'] );
				// remove from resource list:
				unset( $customResourceSet[ $inx ] );
			} else {
				// resolve web urls: 
				$urlResourceSet[] = array(
					'type' => $resource['type'],
					'src'  => $this->resolveCustomResourceUrl( $resource['src'] )
				);
			}
		}
		// check for inline cusom resources
		// Load any other iframe custom resources
		?>

		var customResources = <?php echo json_encode( $urlResourceSet ) ?>;
		// IE8 has some issues with RL, so we load skin assets directly
		if( isIE8 ){
			customResources = customResources.concat( kalturaIframePackageData.skinResources );
		}
		loadCustomResourceIncludes( customResources, function(){ 
			<?php echo $callbackJS ?>
		});
		<?php
	}
	function getPlayerCheckScript(){
		$uiConfId =  htmlspecialchars( $this->request->get('uiconf_id') );
		ob_start();
		?>
		<script>
		var waitForKWidgetCount = 0;
		waitForKWidget = function( callback ){
			waitForKWidgetCount++;
			if( waitForKWidgetCount > 200 ){
				if( console ){
					console.log( "Error kWidget never ready" );
				}
				return ;
			}
			if( ! window.kWidget ){
				setTimeout(function(){
					waitForKWidget( callback );
				}, 5 );
				return ;
			}
			callback();
		}
		waitForKWidget( function(){
			if( kWidget.isUiConfIdHTML5( '<?php echo $uiConfId ?>' ) ){
				loadMw( function(){
					// Load skin resources after other modules loaded
					if( isIE8 ){
						$( mw ).bind( 'EmbedPlayerNewPlayer', function(){
							loadCustomResourceIncludes(kalturaIframePackageData.skinResources);
						});
					}
					<?php 
						$this->loadCustomResources(
							$this->outputKalturaModules() . 
							'mw.loader.go();'
						);
					?>
				});
			} else {
				var resourcesList = <?php echo json_encode( $this->getCustomPlayerIncludes(true) ) ?>;
				loadCustomResourceIncludes( resourcesList, function() {
					// replace body contents with flash object:
					var bodyElement = document.getElementsByTagName('body')[0];
					bodyElement.innerHTML = '';
					var container = document.createElement('div');
					container.id = window.kalturaIframePackageData.playerId + '_container';
					container.style.cssText = 'width: 100%; height: 100%;';
					bodyElement.appendChild(container);
					var playerId = window.kalturaIframePackageData.playerId;
					kWidget.outputFlashObject(playerId + '_container', <?php echo json_encode($this->getFlashObjectSettings());?>, document);
					
				});
			}
		});
		</script>
		<?php 
		return ob_get_clean();
	}
	function getIframeOutputHash(){
		if(!$this->iframeOutputHash){
			$this->iframeOutputHash = md5( $this->getIFramePageOutput() );
		}
		return $this->iframeOutputHash;
	}
	function getIFramePageOutput( ){
		if( !$this->iframeContent ){
			global $wgRemoteWebInspector, $wgEnableScriptDebug;
			$uiConfId =  htmlspecialchars( $this->request->get('uiconf_id') );
			
			ob_start();
		?>
<!DOCTYPE html>
<html>
<head>
	<script type="text/javascript"> /*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/ </script>
	<?php if($wgRemoteWebInspector && $wgEnableScriptDebug){
		echo '<script src="' . $wgRemoteWebInspector . '"></script>';
	 } ?>
	<?php echo $this->outputIframeHeadCss(); ?>
	<?php echo $this->outputSkinCss(); ?>
	<?php echo $this->outputCustomCss(); ?>

	<!--[if lt IE 10]>
	<script type="text/javascript" src="<?php echo $this->getPath(); ?>resources/PIE/PIE.js"></script>
	<![endif]-->
</head>
<body>
<?php echo $this->getKalturaIframeScripts(); ?>
<?php
	// wrap in a top level playlist in the iframe to avoid javascript base .wrap call that breaks video playback in iOS
	if( $this->getUiConfResult()->isPlaylist() ){
		?>
		<div class="playlistInterface"
			style="position: relative; width: 100%; height: 100%">
			<?php
	}
	?>
	<div class="mwPlayerContainer player-out">
		<?php echo $this->getVideoHTML(); ?>
	</div>
	<?php
	if( $this->getUiConfResult()->isPlaylist() ){
		?></div><?php
	}
	echo $this->getPlayerCheckScript();
	?>
</body>
</html>
		<?php
			$this->iframeContent = ob_get_clean();
		}
		return $this->iframeContent;
	}
	/**
	 * Very simple error handling for now:
	 */
	private function isError( ){
		return $this->error;
	}
	/**
	 * Output a fatal error and exit with error code 1
	 */
	private function fatalError( $errorTitle, $errorMsg = false ){
		global $wgKalturaErrorCacheTime;
		// check for multi line errorTitle array:
		if( strpos( $errorTitle, "\n" ) !== false ){
			list( $errorTitle, $errorMsg ) = explode( "\n", $errorTitle);
		};
		$this->error = true;

		// clear the buffer ( causes gzip issues ) 
		while( ob_get_contents() ) {
			ob_end_clean();
		}
			
		// add to the output buffer stack:
		ob_start();
		
		// Send expire headers
		// Note: we can't use normal iframeHeader method because it calls the kalturaResultObject
		// constructor that could be the source of the fatalError
		$this->sendPublicHeaders( $wgKalturaErrorCacheTime );

		// Optional errorTitle:
		if( $errorMsg === false ){
			$errorMsg = $errorTitle;
			$errorTitle = false;
		}
		?>
<!DOCTYPE html>
<html>
<head>
		<?php echo $this->outputIframeHeadCss(); ?>
</head>
<body>
	<div id="error">
	<?php
	if( $errorTitle ){
		echo '<h2>' . htmlspecialchars( $errorTitle ) . '</h2>';
	}
	// Presently errors can have html foramting ( not ideal )
	// TODO refactor to have error title and error message arguments
	echo htmlspecialchars( $errorMsg );
	?>
	</div>
</body>
</html>
	<?php
	// TODO clean up flow ( should not have two checks for callback )
	if( isset( $_REQUEST['callback']  )) {
		// get the output buffer:
		$out = ob_get_clean();
		// Re-start the output buffer:
		header( 'Content-Type: text/javascript' );
		echo htmlspecialchars( $_REQUEST['callback'] ) . '(' .
			json_encode( array( 'content' => $out ) ) . ');';
	}
	@ob_end_flush();
	// Iframe error exit
	exit( 1 );
	}
}
