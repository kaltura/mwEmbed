<?php 
/**
 * Kaltura iFrame class:
 */
require_once 'KalturaCommon.php';
require_once 'KalturaStandAlon.php';
require_once 'ChromePhp.php';

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
	var $bringitall = null;

	var $templates = array();

	const NO_ENTRY_ID_FOUND = "No Entry ID was found";

	function __construct() {
	    global $container;
		$this->request = $container['request_helper'];
		$this->client = $container['client_helper'];
		$this->utility = $container['utility_helper'];
		$this->logger = $container['logger'];

		// No entry Id and Reference Id were found
		if( count( $this->getEntryResult() ) == 0 ) {
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
	function getEntryResultData(){
	    if ($this->shouldRouteServiceUrl()){
	        $this->reRouteServiceUrl();
	    }
	    //Fetch entry results
	    $entryResult = $this->getEntryResult()->getResult();
	    if ($this->shouldRouteServiceUrl()){
            $this->resetServiceUrl();
        }
	    return $entryResult;
	}
	function shouldRouteServiceUrl(){
	    $allowIframeRemoteService = $this->getUiConfResult()->getPlayerConfig(null, 'Kaltura.AllowIframeRemoteService');
        $serviceUrl = $this->getUiConfResult()->getPlayerConfig(null, 'Kaltura.ServiceUrl');
        return ($this->request->isEmbedServicesEnabled() && $this->request->isEmbedServicesRequest() &&
            ($allowIframeRemoteService === true) &&
            !empty($serviceUrl));
    }
    function reRouteServiceUrl(){
        $this->client->getClient()->getConfig()->serviceUrl = $this->getUiConfResult()->getPlayerConfig( null, 'Kaltura.ServiceUrl' );
    }
    function resetServiceUrl(){
        $this->client->getClient()->getConfig()->serviceUrl = $this->request->getServiceConfig('ServiceUrl');
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
			'autoplay' => 'autoplay'
		);

		// If we have an error, show it
		if( $this->getError() ) {
			$this->playerError = $this->getError();
		}

		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		$o = "\n\n\t" .'<video class="persistentNativePlayer" ';
		$o.= 'poster="' . htmlspecialchars( "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%01%00%00%00%01%08%02%00%00%00%90wS%DE%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%0B%0A%17%041%80%9B%E7%F2%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00%0CIDAT%08%D7c%60%60%60%00%00%00%04%00%01'4'%0A%00%00%00%00IEND%AEB%60%82" ) . '" ';
		//$o.= '  crossorigin="anonymous" poster="' . htmlspecialchars( "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%01%00%00%00%01%08%02%00%00%00%90wS%DE%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%0B%0A%17%041%80%9B%E7%F2%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00%0CIDAT%08%D7c%60%60%60%00%00%00%04%00%01'4'%0A%00%00%00%00IEND%AEB%60%82" ) . '" ';
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

		// Only add KS if it was part of the request, else the client should re-generate in multi-request for any subsequent request: 
		if( $this->request->hasKS() ){
			$settings['flashvars']['ks'] = $this->client->getKS();
		}
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
			$loadInIframe = (isset($plugin['loadInIframe']) && $plugin['loadInIframe'] == true) ? true : false;
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
		// Merge in playlist response headers ( if requesting a playlist ) 
		if( $this->getUiConfResult()->isPlaylist() ){
			array_merge( $cacheHeaders, $this->getPlaylistResult()->getResponseHeaders() );
		}
		if( count($cacheHeaders) == 0 ) {
			$cacheHeaders = array(
				"Cache-Control: no-cache, must-revalidate",
				"Pragma: no-cache",
				"Expires: Sat, 26 Jul 1997 05:00:00 GMT"
			);
		}
		// alwayse set cross orgin headers: 
		$cacheHeaders[] = 'Access-Control-Allow-Origin: *';
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
		header( "Last-Modified: " . gmdate( "D, d M Y H:i:s", $lastModified) . " GMT");
		header( "Expires: " . gmdate( "D, d M Y H:i:s", $lastModified + $expireTime ) . " GMT" );
		// alwayse set cross orgin headers:
		header( "Access-Control-Allow-Origin: *" );
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
		// check for language key: 
		$_GET['lang'] = $this->getLangKey();
		// include skin and language in cache path, as a custom param needed for startup
		$cachePath = $wgScriptCacheDirectory . '/startup.' .
			$wgMwEmbedVersion . $_GET['skin'] . $_GET['lang'] . $wgHTTPProtocol . '.min.js';
			
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
	private function getLangKey(){
		global $coreLanguageNames;
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		if( isset( $playerConfig['vars']['localizationCode'] ) ){
			// get the list of language names
			require_once( dirname( __FILE__ ) . '/../../includes/languages/Names.php' );
			// validate localization code.
			if( isset( $coreLanguageNames[ $playerConfig['vars']['localizationCode']  ] ) ){
				return $playerConfig['vars']['localizationCode'];
			}
		}
		// if no language code is specified default to english: 
		return 'en';
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
	 * Get entry name for iFrame title
	 */
	private function getEntryTitle(){
		if( !$this->getUiConfResult()->isPlaylist() ){
			try{
			$baseEntry = $this->getEntryResult()->getResult();
				if( isset( $baseEntry['meta']->name) ){
				return $baseEntry['meta']->name;
				}
			} catch (Exception $e){
			return "Kaltura Embed Player iFrame";
			}
		}
		return "Kaltura Embed Player iFrame";
	}

	/**
	 * Get the iframe css
	 */
	function outputIframeHeadCss(){
		return <<<HTML
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>{$this->getEntryTitle()}</title>
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
				$customStyle = $customStyle . '.btn {background-color: ' . $theme['buttonsColor'] . '}';
				if (isset($theme['applyToLargePlayButton']) && $theme['applyToLargePlayButton'] == true){
					$customStyle = $customStyle  . '.largePlayBtn {background-color: ' . $theme['buttonsColor'] . '!important}';
				}
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
				if (isset($theme['applyToLargePlayButton']) && $theme['applyToLargePlayButton'] == true){
					$customStyle = $customStyle  . '.largePlayBtn {color: ' . $theme['buttonsIconColor'] . '!important}';
				}
			}
			if (isset($theme['watchedSliderColor'])){
				$customStyle = $customStyle . '.watched {background-color: ' . $theme['watchedSliderColor'] . '!important}';
			}
			if (isset($theme['bufferedSliderColor'])){
                $customStyle = $customStyle . '.buffered {background-color: ' . $theme['bufferedSliderColor'] . '!important}';
            }
            if (isset($theme['buttonsIconColorDropShadow']) && isset($theme['dropShadowColor'])){
                $customStyle = $customStyle . '.btn {text-shadow: ' . $theme['dropShadowColor'] . '!important}';
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
		global $wgMwEmbedEnabledModules, $wgKwidgetPsEnabledModules, $wgKalturaPSHtml5ModulesDir, $psRelativePath;
		$o='';
		// Init modules array, always include MwEmbedSupport
		$moduleList = array( 'mw.MwEmbedSupport' );

		// Check player config per plugin id mapping
		$kalturaSupportModules = array();
		$moduleDir = realpath( dirname( __FILE__ ) )  . '/..';
		foreach( $wgMwEmbedEnabledModules as $moduleName ){
			$modListPath = $moduleDir . '/' . $moduleName . '/' . $moduleName . '.';
			if( is_file( $modListPath . "json") ){
			    $moduleInfo = json_decode( file_get_contents($modListPath. 'json'), TRUE );
                $kalturaSupportModules = array_merge( $kalturaSupportModules, $moduleInfo);
            } elseif( is_file( $modListPath . "php") ){
				$kalturaSupportModules = array_merge( $kalturaSupportModules, 
					include( $modListPath . "php")
				);
			}
		}

		$kalturaSupportPsModules = array();

		foreach( $wgKwidgetPsEnabledModules as $moduleName ){
            $modListPath = $wgKalturaPSHtml5ModulesDir . '/' . $moduleName . '/' . $moduleName . '.json';
            if( is_file( $modListPath) ){
                $moduleInfo = json_decode( file_get_contents( $modListPath ), TRUE );
                $kalturaSupportPsModules = array_merge( $kalturaSupportPsModules, $moduleInfo);
            }
        }

		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		$moduleList = array_merge($moduleList, $this->getNeededModules($kalturaSupportModules, $playerConfig));
		$psModuleList = $this->getNeededModules($kalturaSupportPsModules, $playerConfig, $wgKalturaPSHtml5ModulesDir);

		// Special cases: handle plugins that have more complex conditional load calls
		// always include mw.EmbedPlayer
		$moduleList[] = 'mw.EmbedPlayer';

		// Add our skin as dependency
		$skinName = (isset( $playerConfig['layout']['skin'] ) && $playerConfig['layout']['skin'] != "") ? $playerConfig['layout']['skin'] : null;
		$flashvars = $this->request->getFlashVars();
		if (isset($flashvars) && isset($flashvars['layout'])){
			$layout = json_decode($flashvars['layout'],true);
			if (isset($layout) && isset($layout['skin'])){
				$skinName = $layout['skin'];
			}
		}
		if( $skinName ){
			$moduleList[] = $skinName;
		}		

		$jsonModuleList = json_encode($moduleList);
		$jsonPsModuleList = json_encode($psModuleList);
		$s  = '';
		if ($this->bringitall ){
			$fauxRequest = new WebRequest;
			$resourceLoader = new MwEmbedResourceLoader();
			$modules = array();
			array_unshift($moduleList,'mw.PluginManager','base64_encode','utf8_encode','base64_decode','mw.MwEmbedSupport','jquery.color','Spinner','iScroll','jquery.loadingSpinner','mw.MwEmbedSupport.style','mediawiki.UtilitiesTime','mediawiki.client','mediawiki.UtilitiesUrl','mw.ajaxProxy','screenfull','jquery.menu','class','matchMedia','jquery.async','jquery.autoEllipsis','jquery.checkboxShiftClick','jquery.client','jquery.collapsibleTabs','jquery.colorUtil','jquery.cookie','jquery.delayedBind','jquery.expandableField','jquery.highlightText','jquery.hoverIntent','jquery.placeholder','jquery.localize','jquery.makeCollapsible','jquery.suggestions','jquery.tabIndex','jquery.textSelection','jquery.tipsy','jquery.naturalSize','jquery.serialize-object','jquery.ui.core','jquery.ui.widget','jquery.ui.mouse','jquery.ui.position','jquery.ui.selectable','jquery.ui.sortable','jquery.ui.tooltip','jquery.ui.draggable','jquery.ui.resizable','jquery.ui.accordion','jquery.ui.autocomplete','jquery.ui.menu','jquery.ui.datepicker','jquery.ui.progressbar','jquery.ui.slider','jquery.ui.tabs','jquery.effects.core','jquery.effects.blind','jquery.effects.bounce','jquery.effects.clip','jquery.effects.drop','jquery.effects.explode','jquery.effects.fold','jquery.effects.highlight','jquery.effects.pulsate','jquery.effects.scale','jquery.effects.shake','jquery.effects.slide','jquery.effects.transfer','mediawiki.Uri','mediawiki.kmenu','mediawiki.language','mediawiki.jqueryMsg','mediawiki.util','mediawiki.util.tmpl','jquery.messageBox','jquery.mwExtension','touchSwipe','nanoScroller','typeahead','dotdotdot','kdark','ott','mw.MediaElement','mw.MediaPlayer','mw.MediaPlayers','mw.MediaSource','mw.EmbedTypes','mw.EmbedPlayer','mw.PluginManager','mw.EmbedPlayerGeneric','mw.EmbedPlayerNative','mw.EmbedPlayerImageOverlay','mw.EmbedPlayerNativeComponent','nativeBridge','mw.PlayerElement','mw.PlayerElementHTML','mw.PlayerElementFlash','mw.PlayerElementSilverlight','mw.KalturaIframePlayerSetup','mw.KWidgetSupport','mw.KBasePlugin','mw.KBaseComponent','mw.KBaseButton','mw.KBaseScreen','mw.KBaseMediaList','mw.KCuePoints','mw.KAnalytics','mw.KDPMapping','mw.KEntryLoader','mw.KAds','mw.KAdPlayer','dualScreen','dualScreenControlBar','hammerEvents','hammer','smartContainer','chapters','keyboardShortcuts','controlBarContainer','topBarContainer','sideBarContainer','theme','playlistAPI','largePlayBtn','playPauseBtn','nextPrevBtn','fullScreenBtn','audioSelector','expandToggleBtn','scrubber','volumeControl','accessibilityButtons','currentTimeLabel','durationLabel','sourceSelector','logo','closeFSMobile','airPlay','nativeCallout','closedCaptions','infoScreen','related','share','playServerUrls','adBlockDetector','pptWidgetPlugin','acCheck','acPreview','bumperPlugin','captureThumbnailPlugin','carouselPlugin','likeAPIPlugin','liveStream','titleLabel','shareSnippet','moderationPlugin','downloadPlugin','jCarouse','mw.KLayout','restrictUserAgentPlugin','segmentScrubberPlugin','statisticsPlugin','liveAnalytics','playbackRateSelectorPlugin','streamSelector','watermarkPlugin','vastPlugin','audioDescription','reportError','mw.AdTimeline','AdSupport','mw.BaseAdPlugin','mw.AdLoader','mw.VastAdParser','mw.AkamaiMediaAnalytics','mw.AttracTV','actionButtons','actionForm','chromecast','mw.EmbedPlayerChromecast','mw.Comscore','ComScoreStreamingTag','DebugInfo','mw.DoubleClick','mw.EmbedPlayerYouTube','mw.FreeWheel','mw.GoogleAnalytics','heartbeat','mw.Kontiki','mw.EmbedPlayerMultiDRM','jquery.ui.touchPunch','jquery.triggerQueueCallback','jquery.mwEmbedUtil','jquery.debouncedresize','mw.NielsenCombined','mw.NielsenVideoCensus','mw.Omniture','mw.Peer5','mw.PlayersJsReceiver','playerjs','mw.Subply','mw.TimedText','mw.TextSource','mw.Language.names','mw.Tremor','tvpapiGetLicensedLinks','tvpapiGetLicenseData','tvpapiAnalytics','mw.Widevine' );

			foreach ($moduleList as $moduleName){
				$modules[$moduleName] = $resourceLoader->getModule( $moduleName );
			}
			$s = $resourceLoader->makeModuleResponse( new MwEmbedResourceLoaderContext( $resourceLoader, $fauxRequest ) ,
				 $modules,
				array()
			);
			
		}
		$JST = $this->getTemplatesJSON();

		// export the loading spinner config early on:
		$o.= <<<HTML
		// Export our HTML templates
		window.kalturaIframePackageData.templates =  {$JST};

		var moduleList = {$jsonModuleList};
		var psModuleList = {$jsonPsModuleList};

		moduleList = moduleList.concat(psModuleList);
		var skinName = "{$skinName}";
		// IE8 has some issues with RL so we want to remove the skin
		if( skinName && isIE8 ) {
			var itemToDelete = jQuery.inArray(skinName, moduleList);
			if( itemToDelete != -1 )
				moduleList.splice( itemToDelete, 1);
		}
HTML;
		 if ($this->bringitall ){
			 $o.='window.bringitall = true;';
			$o.=$s;
			
		} else {
			$o.= 'mw.config.set(\'KalturaSupport.DepModuleList\', moduleList);mw.loader.load(moduleList);';
		}
        	//Set the kwidget-ps folder for the loader script
        		$o.="mw.config.set('pskwidgetpath', '$psRelativePath');";
		// check if loadingSpinner plugin has config: 
		if( isset( $playerConfig['plugins']['loadingSpinner'] ) ){
			$o.='mw.config.set(\'loadingSpinner\', '. 
				json_encode( $playerConfig['plugins']['loadingSpinner'] ) . ")\n";
		}
		
		return $o;
	}

	function getNeededModules($modules, $playerConfig, $basePath = null){
	    $moduleList = array();
	    foreach( $modules as $name => $module ){
            if( isset( $module[ 'kalturaLoad' ] ) &&  $module['kalturaLoad'] == 'always' ){
                $this->addModuleTemplate( $module, $basePath );
                $moduleList[] = $name;
            }
            // Check if the module has a kalturaPluginName and load if set in playerConfig
            if( isset( $module[ 'kalturaPluginName' ] ) ){
                if( is_array( $module[ 'kalturaPluginName' ] ) ){
                    foreach($module[ 'kalturaPluginName' ] as $subModuleName ){
                        if( isset( $playerConfig['plugins'][ $subModuleName] )){
                            $this->addModuleTemplate( $module, $playerConfig['plugins'][ $subModuleName ], $basePath );
                            $moduleList[] = $name;
                            continue;
                        }
                    }
                } else if( isset( $playerConfig['plugins'][ $module[ 'kalturaPluginName' ] ] ) ){
                    $this->addModuleTemplate( $module, $playerConfig['plugins'][ $module[ 'kalturaPluginName' ] ], $basePath );
                    $moduleList[] = $name;
                }
            }
        }
        return $moduleList;
	}

	function addModuleTemplate( $module = null, $plugin = null, $basePath = null){
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
		    if (is_array($templatePath)){
		        foreach ($templatePath as $templateFileName => $templateFilePath){
                    $templateKey = str_replace('{html5ps}', '', $templateFilePath);
                    $templateKey = is_numeric($templateFileName) ? $templateKey : $templateFileName;
                    $this->templates[ $templateKey ] = $this->loadTemplate( $templateFilePath, $basePath );
		        }
		    } else {
			    $templateKey = str_replace('{html5ps}', '', $templatePath);
			    $this->templates[ $templateKey ] = $this->loadTemplate( $templatePath, $basePath );
			}
		}
	}

	function loadTemplate( $path = null, $basePath = null){
		$path = $this->getFilePath( $path, $basePath );

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
	    $skinResourcesUrl = "skins/SkinResources.json";
        $skinsResources = json_decode( file_get_contents($skinResourcesUrl), TRUE );

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
					    $payload[ 'entryResult' ] = $this->getEntryResultData();
					}
				} catch ( Exception $e ){
					$payload['error'] = $e->getMessage();
				}
				// push up entry result errors to top level:
				if( isset( $payload[ 'entryResult' ]  ) && isset( $payload[ 'entryResult' ]['error']) ){
					$payload['error'] = $payload[ 'entryResult' ]['error'];
				} 
				// check for returned errors: 
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
								console.log("Error in loading mwEmbedLoader");
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

	function getFilePath( $path = null, $basePath = null ){
		global $wgKalturaPSHtml5SettingsPath;

		if (!empty($basePath)){
			$path = $basePath . '/' . $path;
		} elseif( strpos( $path, '{html5ps}' ) === 0 ) {
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
			$this->logger->log('Unable to find resource: ' . $resourcePath );
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
		<?php echo $callbackJS ?>
		
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
						if ($this->bringitall){
							$this->loadCustomResources(
								$this->outputKalturaModules()  
								
							);
						} else{
							$this->loadCustomResources(
								$this->outputKalturaModules() . 
								'mw.loader.go();'
							);
						}
						
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
		$this->bringitall = false;
		if ($this->request->get('bringitall')){
			$this->bringitall = true;
		}
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
//	<style type="text/css">.js-messagebox{margin:1em 5%;padding:0.5em 2.5%;border:1px solid #ccc;background-color:#fcfcfc;font-size:0.8em}.js-messagebox .js-messagebox-group{margin:1px;padding:0.5em 2.5%;border-bottom:1px solid #ddd}.js-messagebox .js-messagebox-group:last-child{border-bottom:thin none transparent}
//
//    /* cache key: resourceloader:filter:minify-css:7:2bb917065f5e11cbbe44ba45500bbed5 */
//    .ui-helper-hidden{display:none}.ui-helper-hidden-accessible{position:absolute;left:-99999999px}.ui-helper-reset{margin:0;padding:0;border:0;outline:0;line-height:1.3;text-decoration:none;font-size:100%;list-style:none}.ui-helper-clearfix:after{content:".";display:block;height:0;clear:both;visibility:hidden}.ui-helper-clearfix{display:inline-block} * html .ui-helper-clearfix{height:1%}.ui-helper-clearfix{display:block} .ui-helper-zfix{width:100%;height:100%;top:0;left:0;position:absolute;opacity:0;filter:Alpha(Opacity=0)} .ui-state-disabled{cursor:default !important}  .ui-icon{display:block;text-indent:-99999px;overflow:hidden;background-repeat:no-repeat}  .ui-widget-overlay{position:absolute;top:0;left:0;width:100%;height:100%}
//
//    /* cache key: resourceloader:filter:minify-css:7:b80b11161e9a8e2d415a43fd6f09d170 */
//    .ui-tooltip{padding:8px;position:absolute;z-index:9999;max-width:300px;-webkit-box-shadow:0 0 5px #aaa;box-shadow:0 0 5px #aaa}body .ui-tooltip{border-width:2px}
//
//    /* cache key: resourceloader:filter:minify-css:7:74dc316b0056155feeb3090bf2253792 */
//    .ui-slider{position:relative;text-align:left}.ui-slider .ui-slider-handle{position:absolute;z-index:2;width:1.2em;height:1.2em;cursor:default}.ui-slider .ui-slider-range{position:absolute;z-index:1;font-size:.7em;display:block;border:0;background-position:0 0} .ui-slider.ui-state-disabled .ui-slider-handle,.ui-slider.ui-state-disabled .ui-slider-range{filter:inherit}.ui-slider-horizontal{height:.8em}.ui-slider-horizontal .ui-slider-handle{top:-.3em;margin-left:-.6em}.ui-slider-horizontal .ui-slider-range{top:0;height:100%}.ui-slider-horizontal .ui-slider-range-min{left:0}.ui-slider-horizontal .ui-slider-range-max{right:0}.ui-slider-vertical{width:.8em;height:100px}.ui-slider-vertical .ui-slider-handle{left:-.3em;margin-left:0;margin-bottom:-.6em}.ui-slider-vertical .ui-slider-range{left:0;width:100%}.ui-slider-vertical .ui-slider-range-min{bottom:0}.ui-slider-vertical .ui-slider-range-max{top:0}
//
//    /* cache key: resourceloader:filter:minify-css:7:be3ff74589a1fede91194c0f8bbf34ed */
//    .mwPlayerContainer video{width:100%;height:100%}.mwPlayerContainer.fullscreen{position:absolute !important;width:100% !important;height:100%! important;z-index:9999;min-height:100%;top:0;left:0;margin:0}.mwPlayerContainer{position:relative;width:100%;height:100%;overflow:hidden}.videoHolder{position:relative;overflow:hidden;width:100%;height:100%;background:#000}.videoDisplay{position:absolute;top:0;left:0;width:100%;height:100%}.maximize{width:100%;height:100%}.mwEmbedPlayer{cursor:pointer;width:100%;height:100%;overflow:hidden;position:absolute;top:0;left:0;background-color:rgba(0,0,0,0)}.mwEmbedPlayerTransparent{background-color:black;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"}.mwEmbedPlayerTransparentComp{background-color:rgba(0,0,0,0);-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"}.mwEmbedPlayerBlackBkg{background-color:rgba(0,0,0,1)}.mwEmbedPlayer object{position:absolute;top:0;left:0;width:100%;height:100% }.playerPoster{position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;width:auto;height:auto;max-width:100%;max-height:100%}.blackPlayer{position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;width:auto;height:auto;max-width:100%;max-height:100%}.playerPoster.fill-width{min-width:100%;height:auto}.playerPoster.fill-height{min-height:100%;width:auto}
//
//    /* cache key: resourceloader:filter:minify-css:7:066f4c9cf822f7ab5a482fa40d1dc69d */
//    body{letter-spacing:0.04em; -webkit-touch-callout:none ; -webkit-user-select:none ; }.topBarContainer{position:absolute;top:0;width:100%;z-index:100;box-sizing:border-box;-webkit-transition:top 0.3s ease-in;-moz-transition:top 0.3s ease-in;-o-transition:top 0.3s ease-in;-ms-transition:top 0.3s ease-in;transition:top 0.3s ease-in;background-color:#222222;background:rgba(0,0,0,0.7);   height:2.3em;padding-right:5px}.topBarContainer.hover{top:-2.6em}.topBarContainer.open{top:0}.topBarContainer .btn{color:#fff;width:2em;text-shadow:none}.topBarContainer.block{position:static}.sideBarContainerReminder{padding:10px;position:absolute;cursor:pointer;text-shadow:0px 0px 4px rgba(0,0,0,0.6)}#sideBarContainerReminderContainer{font-size:32px;color:rgb(255,255,255)}@media all and (max-width:640px){#sideBarContainerReminderContainer{font-size:24px}}.sideBarContainerReminder:hover div{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1;color:#fff;text-shadow:0px 0px 10px #fff}.sideBarContainerReminder.active div{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1;color:#fff;text-shadow:0px 0px 10px #fff}.sideBarContainerReminder.left{left:-30%;-webkit-transition:left 0.3s ease-in;-moz-transition:left 0.3s ease-in;-o-transition:left 0.3s ease-in;-ms-transition:left 0.3s ease-in;transition:left 0.3s ease-in}.sideBarContainerReminder.left.open{left:0px}.sideBarContainerReminder.left.shifted{left:30%}.sideBarContainerReminder.right{right:-30%;-webkit-transition:right 0.3s ease-in;-moz-transition:right 0.3s ease-in;-o-transition:right 0.3s ease-in;-ms-transition:right 0.3s ease-in;transition:right 0.3s ease-in}.sideBarContainerReminder.right.open{right:0px}.sideBarContainerReminder.right.shifted{right:30%}.sideBarContainer{position:absolute;top:0;width:30%;z-index:100;box-sizing:border-box;height:100%; -webkit-transition:left 0.3s ease-in,right 0.3s ease-in;-moz-transition:left 0.3s ease-in,right 0.3s ease-in;-o-transition:left 0.3s ease-in,right 0.3s ease-in;-ms-transition:left 0.3s ease-in,right 0.3s ease-in;transition:left 0.3s ease-in,right 0.3s ease-in;background:rgba(0,0,0,0.7);background:-moz-linear-gradient(top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.7) 100%);background:-webkit-gradient(left top,left bottom,color-stop(0%,rgba(0,0,0,0.7)),color-stop(100%,rgba(0,0,0,0.7)));background:-webkit-linear-gradient(top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.7) 100%);background:-o-linear-gradient(top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.7) 100%);background:-ms-linear-gradient(top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.7) 100%);background:linear-gradient(to bottom,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.7) 100%);filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=70) progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000',endColorstr='#000000',GradientType=0 )}.sideBarContainer.left{left:-30%}.sideBarContainer.openBtn{z-index:99}.sideBarContainer.left.openBtn{left:0}.sideBarContainer.right{right:-30%}.sideBarContainer.right.openBtn{right:0}.titleLabel{padding:8px 0 0 10px;color:white}.controlBarContainer{position:absolute;bottom:0;width:100%;-webkit-transition:bottom 0.3s ease-in;-moz-transition:bottom 0.3s ease-in;-o-transition:bottom 0.3s ease-in;-ms-transition:bottom 0.3s ease-in;transition:bottom 0.3s ease-in}.controlBarContainer a{text-decoration:none}.controlBarContainer.hover{bottom:-2.6em;z-index:100}.controlBarContainer.open{bottom:0}.btn{display:inline-block;height:100%;margin:0;padding:0;width:2.4em;cursor:pointer;border:0;font-size:1.1em}.btnFixed{display:inline-block;height:100%;margin:0;padding:0;width:2.4em;cursor:pointer;border:0;font-size:1.1em}.btnNarrow{width:1.8em}.btn .accessibilityLabel{font-size:0;height:1px !important;overflow:hidden;display:block}.accessibilityLabel{font-size:0;height:1px !important;overflow:hidden;display:block}.dropup{position:relative;height:100%}.pull-right{float:right}.pull-left{float:left}.largePlayBtn{cursor:pointer;position:absolute;top:50%;left:50%;font-size:3em;margin:-0.79em 0 0 -1em;text-decoration:none;padding:12px 20px 12px 25px}.largePlayBtnBorder{border-radius:0.1em}.scrubber{position:relative;height:0.6em;cursor:pointer}.controlsContainer .scrubber{display:inline-block !important;margin-left:5px;top:-3px}.sliderPreviewTime{position:absolute;font-family:Helvetica,Arial;font-size:12px;font-weight:bold;text-shadow:0 0 0.3em #000}.sliderPreview{position:absolute;width:100px;height:60px;z-index:9999999999;border:2px white solid;background-repeat:no-repeat;background-position:center;border-radius:4px}.scrubber .handle-wrapper{position:relative;margin:0 0.44em}.scrubber .watched{position:absolute;top:0;left:0;width:0%;height:100%;z-index:2}.scrubber .buffered{position:absolute;top:0;left:0;height:100%}.scrubber .arrow{position:absolute;left:48px;bottom:-6px;width:0;height:0;border-top:5px solid white;border-left:5px solid transparent;border-right:5px solid transparent}.scrubber .playHead{z-index:100;position:absolute;left:0;top:-0.2em;width:1.1em;height:1.1em;border-radius:50%;outline:0;margin-left:-0.38em; cursor:pointer; -webkit-transform:scale(1,1);-moz-transform:scale(1,1);-ms-transform:scale(1,1);-o-transform:scale(1,1);transform:scale(1,1); -webkit-transform-origin:50% 50%;-moz-transform-origin:50% 50%;-ms-transform-origin:50% 50%;-o-transform-origin:50% 50%;transform-origin:50% 50%; -webkit-transition:-webkit-transform-origin 0.1s ease-out,-webkit-transform 0.1s ease-out;-moz-transition:-moz-transform-origin 0.1s ease-out,-moz-transform 0.1s ease-out;-o-transition:-o-transform-origin 0.1s ease-out,-o-transform 0.1s ease-out;transition:transform-origin 0.1s ease-out,transform 0.1s ease-out; -webkit-transition-property:-webkit-transform-origin,-webkit-transform;-moz-transition-property:-moz-transform-origin,-moz-transform;-o-transition-property:-o-transform-origin,-o-transform;transition-property:transform-origin,transform; -webkit-transition-duration:0.3s,0.3s;-moz-transition-duration:0.3s,0.3s;-o-transition-duration:0.3s,0.3s;transition-duration:0.3s,0.3s; -webkit-transition-timing-function:ease-out,ease-out;-moz-transition-timing-function:ease-out,ease-out;-o-transition-timing-function:ease-out,ease-out;transition-timing-function:ease-out,ease-out; -webkit-transition-delay:initial,initial;-moz-transition-delay:initial,initial;-o-transition-delay:initial,initial;transition-delay:initial,initial;background:rgb(255,255,255); background:-moz-linear-gradient(top,rgba(255,255,255,1) 0%,rgba(204,204,204,1) 50%,rgba(255,255,255,1) 100%); background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,rgba(255,255,255,1)),color-stop(50%,rgba(204,204,204,1)),color-stop(100%,rgba(255,255,255,1))); background:-webkit-linear-gradient(top,rgba(255,255,255,1) 0%,rgba(204,204,204,1) 50%,rgba(255,255,255,1) 100%); background:-o-linear-gradient(top,rgba(255,255,255,1) 0%,rgba(204,204,204,1) 50%,rgba(255,255,255,1) 100%); background:-ms-linear-gradient(top,rgba(255,255,255,1) 0%,rgba(204,204,204,1) 50%,rgba(255,255,255,1) 100%); background:linear-gradient(to bottom,rgba(255,255,255,1) 0%,rgba(204,204,204,1) 50%,rgba(255,255,255,1) 100%); }.player-out .hover .playHead{ display:none}.accessibilityButtons{display:inline-block;height:1px}.accessibilityButton{width:1px;height:1px}.nextPrevBtn{display:inline-block;height:100%}.volumeControl{display:inline-block;height:100%}.volumeControl.vertical{width:36px}.volumeControl .ui-slider-horizontal.slider{display:inline-block;width:0;background:#7c7c7c;height:0.5em;top:-2px;-webkit-transition:width 0.3s ease-in-out;-moz-transition:width 0.3s ease-in-out;-o-transition:width 0.3s ease-in-out;-ms-transition:width 0.3s ease-in-out;transition:width 0.3s ease-in-out;cursor:pointer}.volumeControl.noTransition .ui-slider-horizontal.slider{-moz-transition:none ;-webkit-transition:none ;-o-transition:width 0 ease-in;transition:none}.volumeControl.open .ui-slider-horizontal.slider{width:5em;margin-right:10px}.volumeControl .ui-slider-horizontal .ui-slider-handle{display:none}.volumeControl .ui-slider-horizontal .ui-slider-range-min{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=85)";filter:alpha(opacity=85);opacity:0.85;background-color:#fff;background-repeat:repeat-x;background:-webkit-gradient(linear,0% 0%,0% 100%,from(#ffffff),to(#dddddd));background:-webkit-linear-gradient(top,#ffffff,#dddddd);background:-moz-linear-gradient(top,#ffffff,#dddddd);background:-o-linear-gradient(top,#ffffff,#dddddd);background:-ms-linear-gradient(top,#ffffff,#dddddd);background:linear-gradient(top,#ffffff,#dddddd);-webkit-box-shadow:0px 1px 0px rgba(0,0,0,0.3);box-shadow:0px 1px 0px rgba(0,0,0,0.3)}.volumeControl .ui-slider-horizontal .ui-slider-range-min:hover{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1;-webkit-box-shadow:0px 0px 10px #fff;box-shadow:0px 0px 10px #fff}.volumeControl .aria{width:0px;height:0px}.volumeControl .sliderContainer{margin-top:-145px;width:36px;display:none;background:#2F2F2F;border-radius:3px;height:106px;position:absolute}.volumeControl.noTransition .ui-slider-vertical{-moz-transition:none ;-webkit-transition:none ;-o-transition:width 0 ease-in;transition:none}.volumeControl.open .sliderContainer{display:block}.volumeControl .ui-slider-vertical{height:78px;margin-left:17px;top:14px;width:3px;border-radius:2px;background-color:#C1C1C1}.volumeControl .ui-slider-vertical .ui-slider-handle{background-color:#C1C1C1;border-radius:6px;width:12px;height:12px;cursor:pointer}.volumeControl .ui-slider-vertical .ui-slider-range-min{background-color:#35BCDA}.volumeControl .ui-slider-vertical .ui-slider-range-min:hover{}.timers{position:relative;font-size:0.84em;display:inline;line-height:2.7em;font-family:Helvetica,Arial;top:-2px}.currentTimeLabel{padding-left:0.8em}.durationLabel{padding-left:0.5em}.overlay{position:absolute;top:0;left:0;width:100%;height:100%;z-index:100}.overlay-win{z-index:1000 !important}.alert-container{z-index:101;position:absolute;top:0;height:100%;width:100%;vertical-align:middle;box-sizing:border-box}.alert{display:table-cell;width:100%;height:100%;vertical-align:middle}.alert-title{font-size:1.8em;padding-left:1.8em;padding-bottom:0.6em;text-align:center}.alert-body{padding:1.5em 2.2em;font-size:1.5em}.alert-footer{text-align:right;padding-top:1.2em;padding-right:2em}.alert-footer .btn{min-width:100px;border:1px solid;border-radius:4px;padding:6px} .dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:75px;padding:0 0;margin:2px 0 0;list-style:none;-webkit-box-shadow:0 5px 10px rgba(0,0,0,0.2);box-shadow:0 5px 10px rgba(0,0,0,0.2);-webkit-background-clip:padding-box;-moz-background-clip:padding-box;background-clip:padding-box}.dropdown-menu .divider{*width:100%;height:1px;margin:0;*margin:-5px 0 5px;overflow:hidden;background-color:rgba(34,34,34,0.5);border-bottom:1px solid rgba(70,70,70,0.5)}.dropdown-menu > li > a{display:block;padding:3px 10px;clear:both;font-weight:normal;line-height:20px;font-size:0.9em;color:#999999;white-space:nowrap; }.dropdown-menu > li > a:hover,.dropdown-menu > li > a:focus,.dropdown-submenu:hover > a,.dropdown-submenu:focus > a{text-decoration:none;color:#ffffff;background-color:#000}.dropdown-menu > .active > a,.dropdown-menu > .active > a:hover,.dropdown-menu > .active > a:focus{color:#ffffff;text-decoration:none;outline:0}.dropdown-menu > .disabled > a,.dropdown-menu > .disabled > a:hover,.dropdown-menu > .disabled > a:focus{color:#999999}.dropdown-menu > .disabled > a:hover,.dropdown-menu > .disabled > a:focus{text-decoration:none;background-color:transparent;background-image:none;filter:progid:DXImageTransform.Microsoft.gradient(enabled = false);cursor:default}.open{z-index:1000}.open.dropdown-menu{display:block}.pull-right > .dropdown-menu{right:-30px;left:auto}.dropup .dropdown-menu,.navbar-fixed-bottom .dropdown .dropdown-menu{top:auto;bottom:102%}.closedCaptions > .dropdown-menu{overflow-y:auto;overflow-x:hidden;max-height:200px;width:auto;max-width:140px}.dropup .dropdown-submenu > .dropdown-menu{top:auto;bottom:0;margin-top:0;margin-bottom:-2px;border-radius:5px 5px 5px 0} .PlayerContainer{background:#000;color:#fff}.controlsContainer{height:2.1em; background-color:#222222;background:rgba(34,34,34,0.8);background:-webkit-gradient(linear,0% 0%,0% 100%,from(rgba(34,34,34,0.8)),to(rgba(0,0,0,0.8)));background:-webkit-linear-gradient(top,rgba(34,34,34,0.8),rgba(0,0,0,0.8));background:-moz-linear-gradient(top,rgba(34,34,34,0.8),rgba(0,0,0,0.8));background:-o-linear-gradient(top,rgba(34,34,34,0.8),rgba(0,0,0,0.8));background:-ms-linear-gradient(top,rgba(34,34,34,0.8),rgba(0,0,0,0.8));background:linear-gradient(top,rgba(34,34,34,0.8),rgba(0,0,0,0.8));border-top:1px solid rgba(170,168,168,0.5);-webkit-box-shadow:0px -1px 0px rgba(0,0,0,0.8);box-shadow:0px -1px 0px rgba(0,0,0,0.8);width:100%;display:inline-block}.scrubber{background-color:#686868;background:rgba(104,104,104,0.6)}.ui-tooltip{background-color:#000000;background-repeat:repeat-x;background:-webkit-gradient(linear,0% 0%,0% 100%,from(#000000),to(#000000));background:-webkit-linear-gradient(top,#000000,#000000);background:-moz-linear-gradient(top,#000000,#000000);background:-o-linear-gradient(top,#000000,#000000);background:-ms-linear-gradient(top,#000000,#000000);background:linear-gradient(top,#000000,#000000);z-index:1000;font-weight:bold;font-size:0.85em;letter-spacing:0px;color:#aaaaaa;border-radius:2px;padding:2px 5px}.ui-tooltip .arrow{width:70px;height:16px;overflow:hidden;position:absolute;left:50%;margin-left:-35px;bottom:-16px}.ui-tooltip .arrowTop{width:70px;height:16px;overflow:hidden;position:absolute;left:50%;margin-left:-35px;top:-16px;bottom:auto}.ui-tooltip .arrow .top{top:-16px;bottom:auto}.ui-tooltip .arrow .left{left:20%}.ui-tooltip .arrow:after{content:"";position:absolute;left:25px;top:-20px;width:20px;height:22px;-webkit-box-shadow:6px 5px 9px -9px #fff;box-shadow:6px 5px 9px -9px #fff;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-o-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);tranform:rotate(45deg);background-color:#000000}.ui-tooltip .arrowTop:after{content:"";position:absolute;left:25px;bottom:-20px;top:auto;width:20px;height:22px;-webkit-box-shadow:6px 5px 9px -9px #fff;box-shadow:6px 5px 9px -9px #fff;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-o-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);tranform:rotate(45deg);background-color:#000000}.ui-tooltip .arrow .top:after{bottom:-20px;top:auto}.btn{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1;background-color:transparent;color:#ccc;text-shadow:1px 1px 1px rgba(0,0,0,0.8);outline-offset:-1px}.btn:hover{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1;color:#fff;text-shadow:0px 0px 10px #fff}.btn.active{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1;color:#fff;text-shadow:0px 0px 10px #fff}.btn.disabled,.btn.disabled:hover,.disabled .btn,.disabled .btn:hover{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)";filter:alpha(opacity=30);opacity:0.3;cursor:default;text-shadow:none;color:#fff}.btn:focus{outline:1px dotted #999}.largePlayBtn{background-color:#222222;background:rgba(0,0,0,0.7);color:#efefef}.largePlayBtn.icon-pause:before{margin-left:-4px}.largePlayBtn:hover{background:rgba(0,0,0,1);color:#fff}.scrubber.disabled{height:0.3em}.scrubber.disabled .watched{background-image:-webkit-gradient(linear,0 100%,100% 0,color-stop(0.25,rgba(255,255,255,0.15)),color-stop(0.25,transparent),color-stop(0.5,transparent),color-stop(0.5,rgba(255,255,255,0.15)),color-stop(0.75,rgba(255,255,255,0.15)),color-stop(0.75,transparent),to(transparent));background-image:-webkit-linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-image:-moz-linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-image:-o-linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-image:-ms-linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);background-image:linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.15) 75%,transparent 75%,transparent);-webkit-background-size:10px 10px;-moz-background-size:10px 10px;background-size:10px 10px}.scrubber.disabled .buffered,.scrubber.disabled .playHead{display:none}.watched{background-color:#2ec7e1}.buffered{background-color:#AFAFAF;background:rgba( 102,102,102,0.5 );-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=40)";filter:alpha(opacity=40);opacity:0.4;  }.scrubber .playHead:hover{border-color:#fff;-webkit-box-shadow:0 1px 30px rgba(255,255,255,1);box-shadow:0 1px 30px rgba(255,255,255,1);-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";filter:alpha(opacity=100);opacity:1}.currentTimeLabel{color:#e8e8e8}.durationLabel{color:#b1aeab}.sourceSelector{display:inline-block}.overlay{background:rgba(0,0,0,0.7)}.alert-footer .btn{background:#fbfbfb;color:#000;border-color:#999}.dropdown-menu{-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=85)";filter:alpha(opacity=85);opacity:0.85;background:#222222}.logo{width:3em;height:100%;position:relative}.logo img{margin:auto;position:absolute;top:0;left:0;bottom:0;right:0;max-width:100%;max-height:100%;border:0px}.kaltura-logo{display:inline-block;height:100%;margin:0;padding:0;width:3em;cursor:pointer;border:0;background-position:12px 6px;background-repeat:no-repeat;background-image:url(http://kgit.html5video.org/branches/master//skins/kdark/css/../images/kalturaLogo.png?2015-07-14T22:01:40Z)}.playPauseBtn{width:3.3em}.chromecast{font-size:1.4em} .ad-component{position:absolute;color:#FFF;text-shadow:1px 1px 1px #000;font-size:90%}.ad-notice-label{bottom:14px;left:5px;z-index:102}.ad-skip-btn{cursor:pointer;font-size:110%}.ad-skip-label,.ad-skip-btn{right:5px;bottom:5px;padding:10px 20px;background:rgba(0,0,0,0.6);z-index:101}.overlayAd{width:100% !important;height:100% !important}.hover .ad-skip-label{bottom:30px}.hover .ad-skip-btn{bottom:30px}.hover .ad-notice-label{bottom:40px}.clearfix:before,.clearfix:after{content:" ";display:table}.clearfix:after{clear:both}.clearfix{*zoom:1}.watermark{position:absolute;padding:5px}.watermark img{border:0px}.watermark.topRight{top:0;right:0}.watermark.topLeft{top:0;left:0}.watermark.bottomRight{bottom:0;right:0}.watermark.bottomLeft{bottom:0;left:0}.hide{display:none}.screen{display:none;position:absolute;width:100%;height:100%;top:0;left:0; box-sizing:border-box;padding-top:2.3em;background-color:#000;background-image:linear-gradient(top,#000000 10%,#3E3E3E 90%);background-image:-o-linear-gradient(top,#000000 10%,#3E3E3E 90%);background-image:-moz-linear-gradient(top,#000000 10%,#3E3E3E 90%);background-image:-webkit-linear-gradient(top,#000000 10%,#3E3E3E 90%);background-image:-ms-linear-gradient(top,#000000 10%,#3E3E3E 90%);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0.1,#000000),color-stop(0.9,#3E3E3E))}.screen-content{box-sizing:border-box;padding:0 10px}.semiTransparentBkg{ background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjUiLz4KICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNlM2UzZSIgc3RvcC1vcGFjaXR5PSIwLjUiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjZ3JhZC11Y2dnLWdlbmVyYXRlZCkiIC8+Cjwvc3ZnPg==);background:-moz-linear-gradient(top,rgba(0,0,0,0.5) 0%,rgba(62,62,62,0.5) 100%); background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,rgba(0,0,0,0.65)),color-stop(100%,rgba(62,62,62,0.65))); background:-webkit-linear-gradient(top,rgba(0,0,0,0.65) 0%,rgba(62,62,62,0.5) 100%); background:-o-linear-gradient(top,rgba(0,0,0,0.65) 0%,rgba(62,62,62,0.65) 100%); background:-ms-linear-gradient(top,rgba(0,0,0,0.65) 0%,rgba(62,62,62,0.65) 100%); background:linear-gradient(to bottom,rgba(0,0,0,0.65) 0%,rgba(62,62,62,0.65) 100%); filter:progid:DXImageTransform.Microsoft.gradient( startColorstr='#80000000',endColorstr='#803e3e3e',GradientType=0 ); }.screen .panel-left{margin-right:10px;position:absolute;width:40%;height:100%}.videoPreview{position:relative;width:230px;height:129px}.animateVideo{transition:top 1s,left 1s,width 1s,height 1s}.previewPlayer .videoDisplay{top:40px;left:6px;z-index:4;width:40%;height:40%;transition:top 1s,left 1s,width 1s,height 1s}.expandPlayerBtn{position:absolute;z-index:10;font-size:2em;top:0.3em;left:0.3em;opacity:0.7;cursor:pointer;border:1px solid grey;border-radius:25px;background-color:grey}.ie8 .expandPlayerBtn{border:0px solid grey;background:url(blank.gif)}.expandPlayerBtn,.previewPlayer + .size-tiny .expandPlayerBtn{display:none}.previewPlayer .expandPlayerBtn{display:inline-block}.infoScreen .screen-content,.share .screen-content,.airPlay .screen-content{padding:10px;position:relative;height:100%}.infoScreen .created{font-size:1.11em;font-weight:bold;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #666666}.infoScreen .description{color:#999}.infoScreen .views{font-size:1.2em;font-weight:bold;color:#ddd;margin:10px 0;position:absolute;top:45%}.screen .panel-right{width:58%;position:absolute;right:0}.size-tiny .screen .panel-right,.size-tiny .screen .panel-left,.size-tiny .infoScreen .views{position:static;width:100%;height:auto}.rotate{-webkit-animation:spin 3s linear infinite;-moz-animation:spin 3s linear infinite;animation:spin 3s linear infinite;outline:0 !important}.truncateText{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.adCover{position:fixed;cursor:pointer;width:100%;height:100%;background-color:rgba(0,0,0,0)}.adCoverIE8{background-color:black;-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"}.cssChecker{display:none !important}.AlertMessageTransparent{background-color :transparent;padding :5px;font-weight :normal !important;font-size:1.5em;color:#a4a4a4;opacity:0.5;text-align:center}.AlertTitleTransparent{background-color :transparent;font-weight :normal !important;font-size:1.8em ;color:#a4a4a4;opacity:0.5;text-align:center}.AlertContainerTransparent{background-color :transparent;position:fixed;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);transform:translate(-50%,-50%);color:white}.flashBlockAlertContainer{background-color :transparent;position:fixed;top:40%;text-align:center;width:100%;color:white}.blur{-webkit-filter:blur(5px);-moz-filter:blur(5px);-o-filter:blur(5px);-ms-filter:blur(5px);filter:blur(5px)}@-moz-keyframes spin{100%{-moz-transform:rotate(360deg)}}@-webkit-keyframes spin{100%{-webkit-transform:rotate(360deg)}}@keyframes spin{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@font-face{font-family:'icomoon';src:url(http://kgit.html5video.org/branches/master//skins/kdark/css/../fonts/icomoon.eot?2015-07-14T22:01:40Z);src:url(http://kgit.html5video.org/branches/master//skins/kdark/css/../fonts/icomoon.eot?2015-07-14T22:01:40Z&#iefix) format('embedded-opentype'),url(http://kgit.html5video.org/branches/master//skins/kdark/css/../fonts/icomoon.woff?2015-07-14T22:01:40Z) format('woff'),url(http://kgit.html5video.org/branches/master//skins/kdark/css/../fonts/icomoon.ttf?2015-07-14T22:01:40Z) format('truetype'),url('../fonts/icomoon.svg#icomoon') format('svg');font-weight:normal;font-style:normal} [data-icon]:before{font-family:'icomoon';content:attr(data-icon);speak:none;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}  .icon-fullscreen-exit-alt,.icon-fullscreen-alt,.icon-contract,.icon-related,.icon-cc,.icon-cog,.icon-expand,.icon-info,.icon-volume-mute,.icon-volume-low,.icon-volume-high,.icon-share,.icon-replay,.icon-like,.icon-checkmark,.icon-unlike,.icon-play,.icon-pause,.icon-expand2,.icon-flag,.icon-camera,.icon-download,.icon-close,.icon-ad,.icon-list,.icon-chromecast,.icon-next,.icon-prev,.icon-duration,.icon-start_time,.icon-chapterMenu,.icon-clear,.icon-magnifyGlass,.icon-switchSource,.icon-off-air,.icon-on-air,.icon-toggle,.icon-locator,.icon-toggleAll{font-family:'icomoon';speak:none;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased}.icon-volume-mute:before{content:"\e600"}.icon-volume-low:before{content:"\e601"}.icon-volume-high:before{content:"\e602"}.icon-unlike:before{content:"\e603"}.icon-share:before{content:"\e604"}.icon-close:before{content:"\e605"}.icon-checkmark:before{content:"\e606"}.icon-cc:before{content:"\e607"}.icon-camera:before{content:"\e608"}.icon-replay:before{content:"\e609"}.icon-related:before{content:"\e60a"}.icon-play:before{content:"\e60b"}.icon-pause:before{content:"\e60c"}.icon-like:before{content:"\e60d"}.icon-info:before{content:"\e60e"}.icon-fullscreen-exit-alt:before{content:"\e60f"}.icon-fullscreen-alt:before{content:"\e610"}.icon-flag:before{content:"\e611"}.icon-expand2:before{content:"\e612"}.icon-expand:before{content:"\e613"}.icon-download:before{content:"\e614"}.icon-contract:before{content:"\e615"}.icon-cog:before{content:"\e616"}.icon-ad:before{content:"\e617"}.icon-list:before{content:"\e618"}.icon-chromecast:before{content:"\e619"}.icon-next:before{font-size:16px;content:"\e61b"}.icon-prev:before{font-size:16px;content:"\e61a"}.icon-duration:before{content:"\e61d"}.icon-start_time:before{content:"\e61c"}.icon-chapterMenu:before{content:"\e61e"}.icon-clear:before{content:"\e61f"}.icon-magnifyGlass:before{content:"\e620"}.icon-switchSource:before{content:"\e621"}.icon-off-air:before{content:"\e622"}.icon-on-air:before{content:"\e623"}.icon-toggle:before{content:"\e624"}.icon-locator:before{content:"\e625"}.icon-toggleAll:before{content:"\e626"}
//
//    /* cache key: resourceloader:filter:minify-css:7:3fba8348722a238016bccf7d76e5a0d4 */
//    @import url(http://fonts.googleapis.com/css?family=Lato:300,400,700,900);.share .screen-content{z-index:1}.screen .panel-center{width:100%;height:100%;text-align:center;display:table-cell;vertical-align:middle}.share .shareembed-input{font-size:12pt;font-family:'Lato',Helvetica,Arial;font-weight:400;border-radius:2px 2px 2px 2px;-moz-border-radius:2px 2px 2px 2px;-webkit-border-radius:2px 2px 2px 2px;border:1px solid rgb(127,127,127);border:1px solid rgba(255,255,255,.5);-webkit-background-clip:padding-box; background-clip:padding-box; padding-right:20px;width:265px;height:36px;color:white; color:rgba(255,255,255,0.502);padding-left:40px;background-color:rgba(26,26,26,0.102) !important;cursor:auto;margin-bottom:12px;float:left}.share .share-input{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4JpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozRkFDRTkyMkREMTdFMzExQUE0OUU1MUVGODRGRjY3MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCREUxMzUyMkE4N0MxMUU0OTYyRUIxMDMyNUVDMTNFMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCREUxMzUyMUE4N0MxMUU0OTYyRUIxMDMyNUVDMTNFMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFhNjU1ZDNhLTZmNzctNDkzYS1iZDljLTVlOWMxOTg0MmIwYyIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmFmMWJiYjQyLWNkOGMtMTE3Ny04NTMxLWI3MDcxOTE0MTc5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhTvw2cAAAFFSURBVHjajNNBKwRhHMfxx7Q2pN2DlJtSytnNHqQ4bJsDXoGLi71py8lbkFIckIMc1OKwBxyUg30JDlpWCFd2Sbk8vv/8ZEzNzj71mXl6nnl+O/t/ngm89w4pLKKCc6wgq7mW7JLGqf9pL7hRv4bBdgKKWrCMDk0U8IF6UohdzvAYWvxrQiFX6I4LCJxzXWiCuH/tAvMYwpSLaRZQxQgmQ+N1rOEQ/ajEBdhr9OEBr8jp1bZUl3XMYhtllNAbrYEZVh0sZAYB9vxfa+JJ/etwYcMFsZBbPdTAVyhgQ0Weju5OtKoZLGEfmxjHjkJWI7tj5ySTdNIG9MtWi8vQ+JxCS60WL+ihfMz8M44CF98OtJ12z0XmOtGDz1YBDeR1P0FB42mdkSyOXRtfnO3Onf7OPd7U37X6pFxyq2EURYzhHWXx3wIMAHqAXFj/hFWxAAAAAElFTkSuQmCC) no-repeat 10px center}.share .embed-input{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4JpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozRkFDRTkyMkREMTdFMzExQUE0OUU1MUVGODRGRjY3MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyNjNCM0U2M0E4N0MxMUU0OTYyRUIxMDMyNUVDMTNFMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNjNCM0U2MkE4N0MxMUU0OTYyRUIxMDMyNUVDMTNFMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmU0MTIxMjY1LTRhNTUtNGVjYi05ZWEyLWQyNDIwNmVhN2ZlOSIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmFmMWJiYjQyLWNkOGMtMTE3Ny04NTMxLWI3MDcxOTE0MTc5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsHjvNgAAAFMSURBVHjalJRNSgNBEIUniYLJYiZmqUTdDCh4AE+giOgRAiqo4DaRELxADuFCEUQPIAqKKwmiOYQQsol7XcSZvNY30DZV0tPwEVJVvKmunw7SNA1ysADOwKzkD3KKddPfE0v+wo+i3ymBdzAAa1JAMfA/62AenKsRTqplsA0KwjWuwBfrVQQ7YEarWQU8sibLjpAR+ATX/L/KuDsm8EfMFjoRsjqib9OyndJ2nwlmQk90tJQu9sAQTDn2jiVYMYYHGpqK0Ar9XcXfpv/WdDMECRgpPWrw90Lxf5g+gsgo10AfjMGu89USGIAXJasDkNAf2d16A99gzwre4BWOlaYkrGfkjkYVvDIgdmarJtTRxD1nQtJuhmCfXatytm6ErKYZF/ou+iGvuOX7EPy36D2wBOpg7LO82qLHfBkufYWkRc+YM0MIFvO8dxMBBgD+kCg1y6c9sgAAAABJRU5ErkJggg==) no-repeat 10px center}.share input::selection{background:rgb(46,199,225); }.share input::-moz-selection{background:rgb(46,199,225); }.share input:focus{outline:none}.share .screen-content .tmpl{display:table;width:100%;height:100%}.share .share-input-container{width:340px;height:42px;margin:0 auto;color:white; color:rgba(255,255,255,0.502)}.share .share-offset-container{margin:0 auto;display:none;margin-bottom:19px}.share .share-offset{width:70px;padding-left:10px;padding-right:10px;text-align:center;float:left;margin-bottom:0px;margin-left:6px;height:26px}.share .embed-offset-container .share-offset{float:left}.share .embed-offset-container{display:none;margin:0 auto} .share .share-secured{margin-left:12px}.share-secure-lbl{float:left;margin-top:6px} .share .share-label{float:left;margin-left:60px;margin-top:9px;margin-right:6px}.share .embed-offset-container .share-label{margin-left:0px}.share-alert{font-size:11pt;font-family:'Lato',Helvetica,Arial; color:red;line-height:28pt;display:none}.noselection{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none} .share .share-copy-btn{border:1px solid rgb(127,127,127);border:1px solid rgba(255,255,255,.5);width:55px;height:25px;padding-top:12px;margin-left:12px;float:left;cursor:pointer;display:none}.share .share-copy-btn:hover{text-shadow:0px 0px 10px #fff}.share-v-icon{font-size:24pt;color:rgb(46,199,225);margin-left:6px;float:left;width:55px;height:36px;display:none} .share .back-btn{-moz-transform:scaleX(-1);-o-transform:scaleX(-1);-webkit-transform:scaleX(-1);transform:scaleX(-1);filter:FlipH;-ms-filter:"FlipH";width:14px;position:absolute;margin-top:22px;cursor:pointer;display:none}.share .back-btn:hover{text-shadow:0px 0px 10px #fff}.share .next-btn{width:14px;position:absolute;margin-top:22px;cursor:pointer;margin-left:375px;display:none}.share .next-btn:hover{text-shadow:0px 0px 10px #fff} .share .share-icons-scroller{width:400px;height:58px;margin:0 auto;margin-bottom:12px}.share .share-icons-container{width:340px;height:58px;margin:0 auto;overflow:hidden;white-space:nowrap;text-align:left}.share .icon-border{position:relative;border-radius:28px 28px 28px 28px;-moz-border-radius:28px 28px 28px 28px;-webkit-border-radius:28px 28px 28px 28px;border:1px solid white;border:1px solid rgba(255,255,255,0.5);width:56px;height:56px;font-size:2em;margin-right:6px;display:inline-block}.share .share-network{margin-top:15px;margin-left:15px;display:table;width:100%;height:100%}.share .custom-share-network{margin-top:0px !important;margin-left:0px !important} .share a:link{color:#ffffff;text-decoration:none}.share a:visited{color:#ffffff;text-decoration:none}.share a:hover{color:#ffffff;text-decoration:none;text-shadow:0px 0px 10px #fff}.share a:active{color:#ffffff;text-decoration:none} .share .share-close{position:absolute;margin-left:12px;margin-top:12px;width:22px;height:22px;cursor:pointer;z-index:3}.nativeApp .share .share-close{color:#d3d3d3;background-color:rgba(0,0,0,0.7);padding-left:9px;padding-top:9px;width:22px;height:22px}.share .share-close:hover{text-shadow:0px 0px 10px #fff} .small.share .share-input-container{width:220px;height:24px}.small.share .shareembed-input{width:176px;padding-right:4px;padding-left:34px;height:16px;font-size:8pt}.small.share .icon-border{width:34px;height:32px}.small.share .share-icons-scroller{width:260px;height:32px}.small.share .share-icons-container{width:222px}.small.share .share-network{font-size:0.7em;margin-top:7px;margin-left:9px}.small.share .share-offset{width:40px;padding-left:4px;padding-right:4px}.small.share .share-label{float:left;margin-left:45px;margin-top:6px;margin-right:0px;font-size:8pt}.small.share .embed-offset-container .share-label{margin-left:0px}.small.share .share-secure-lbl{font-size:8pt}.small.share .embed-offset-container .share-offset{width:30px;margin-right:4px}.small.share .share-secured{margin-left:2px}.small.share .share-secure-lbl{margin-top:0px}.small.share .share-close{margin-left:4px;margin-top:4px;font-size:10px}.small.share .next-btn{margin-top:12px;margin-left:246px;font-size:10px}.small.share .back-btn{margin-top:12px;font-size:10px} .share.ie8 .shareembed-input{font-family:Arial;height:24px;border:1px solid white;padding-right:4px;padding-left:4px}.share-alert.ie8{font-family:Arial}.share.ie8 .share-input{background:url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/?2015-07-14T22:01:40Z);width:326px}.share.ie8 .embed-input{background:url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/?2015-07-14T22:01:40Z);width:326px}.share.ie8 .share-label{font-size:11pt;margin-top:5px}.share.ie8 .share-secure-lbl{font-size:11pt;margin-top:5px}.share.ie8 .share-offset{background-color:transparent !important;}.small.share.ie8 .share-input{width:210px;height:16px}.small.share.ie8 .embed-input{width:210px;height:16px}.small.share.ie8 .share-label{font-size:8pt;margin-top:3px}.small.share.ie8 .share-secure-lbl{font-size:8pt}.small.share.ie8 .share-offset{font-size:9pt;height:16px}.small.share.ie8 .share-secure-lbl{margin-top:0px} @font-face{font-family:'share';src:url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/fonts/share.eot?2015-07-14T22:01:40Z&8ut62x);src:url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/fonts/share.eot?2015-07-14T22:01:40Z&#iefix8ut62x) format('embedded-opentype'),url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/fonts/share.woff?2015-07-14T22:01:40Z&8ut62x) format('woff'),url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/fonts/share.ttf?2015-07-14T22:01:40Z&8ut62x) format('truetype'),url(http://kgit.html5video.org/branches/master/modules/KalturaSupport/components/share/fonts/share.svg?2015-07-14T22:01:40Z&8ut62x#share) format('svg');font-weight:normal;font-style:normal}[class^="icon-share-"],[class*=" icon-share-"]{font-family:'share';speak:none;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1; -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-share-facebook:before{content:"\e600"}.icon-share-twitter:before{content:"\e601"}.icon-share-google:before{content:"\e602"}.icon-share-email:before{content:"\e603"}.icon-share-linkedin:before{content:"\e604"}.icon-share-sms:before{content:"\e605"}.icon-share-link:before{content:"\e606"}.icon-share-embed:before{content:"\e607"}.icon-share-close:before{content:"\e608"}.icon-share-Yes:before{content:"\e609"}
//
//    /* cache key: resourceloader:filter:minify-css:7:c6f1a545f87ff0782a000272b6b8d3e4 */
//    .back-to-live{display:inline;border:none;margin-left:5px}.play_head_dvr .ui-slider-handle{width:10px;height:15px;margin-left:-5px;margin-top:-0px;z-index:2}.live-icon{font-size:0.7em !important;margin-left:15px !important;margin-right:2px !important}.online-icon{color:#FF0000 !important}.offline-icon{color:#A4A4A4 !important;background-color:transparent}.live-off-sync-icon{color:#FF0000 !important;background-color:transparent}.back-to-live-text{color:#FFFFFF !important;font-family:"Arial Narrow",Arial}.not-clickable{cursor:default !important}.not-clickable:hover{cursor:default !important;text-shadow:none !important}
//
//    /* cache key: resourceloader:filter:minify-css:7:6970884675c16f4762cb02d9dcdd89c8 */
//    .modal_editor{ left:10px;top:10px;right:10px;bottom:10px;position:fixed;z-index:100}.displayHTML a:visited{color:white}.loadingSpinner{width:32px;height:32px;display:block;padding:0px;background-image:url(http://kgit.html5video.org/branches/master/modules/MwEmbedSupport/skins/common/images/loading_ani.gif?2015-07-14T22:01:40Z)}.mw-imported-resource{border:thin solid black}.kaltura-icon{background-image:url(http://kgit.html5video.org/branches/master/modules/MwEmbedSupport/skins/common/images/kaltura_logo_sm_transparent.png?2015-07-14T22:01:40Z) !important;background-repeat:no-repeat;display:block;height:12px;width:12px;margin-top:2px !important;margin-left:3px !important}.mw-fullscreen-overlay{background:rgb(0,0,0) none repeat scroll 0% 0%;position:fixed;top:0pt;left:0pt;width:100%;height:100%;-moz-background-clip:border;-moz-background-origin:padding;-moz-background-inline-policy:continuous} .play-btn-large{width:70px;height:53px;background :url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAA1CAYAAAD8mJ3rAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+RJREFUeNrsm0tPGlEYhg/MIDcZLhqqqcYYY1GimJgYjRovcePadKm7rrvgX3TT/ozWhW5duLCJMerCaBSroASVaJRquBSQmeHS76vYWqmpF844g/MmLwmjQHj8bud4RkP+yAAeAb8BN5OXpRA4AP4KzuAFTfEHbrAX/Iq8bJ2BP4K/IZh68CewmagixYh5z8DDO7BL5fFbLNikhQePyqJEHgRjUjmU6FfEqPqHVDAqGBWMMsDU1tbqGhsb9Urs2VSk0+m0Xq/3dU9Pjw2fn5+fCzMzM5H5+fmoEsDggPcWXFXuN56amnIODQ3VFAoFgjYajUx3dzc3MDBgvbi4EE5OTgQZcxGpgZmcnKznOE53+7rFYmH7+/vtnZ2dZoDDA6TsiwIzPj5eYzabmeuIuW2Hw1E1MjLiaG5u1ofDYT6RSOTkBIZajcnlcgXwf3+vq6vL2tHRYVlZWYlNT09HYrFYtqJrzNjYmMNkMt0ZMTeN2x8NDQ3G4mu0oVAoI4pioSJTaXR01H5fMNfWgFpaWkzDw8N2eF44ODjg8/l8oaLAwJfDvz4LX4w81AzDaNva2qr7+vo4QRByR0dHfMWAgVZtxxb9GDDX1uv1DNYfaPMWrD1nZ2eC4sEMDg7aHppKdxm6G4szkMvlMiIcCQo0PTAwyNmeGjG3bbVadb29vTYo1FU4IKZSKVotnmq7JtlslkrhhMixtLa2Vm9sbCTm5ubOacxAVOcYAEMz3DUej8fqdrsty8vL0YWFhSjP83nZg8FoyWP8094e0Goxbe0wKHKzs7One3t7l7LediimkmQ2GAzMxMREHXQyrRJSSdLhjGVZbVNTkyEQCKRlCwazCOFIPbImk8ms7GuM1BFzfHx8Wa59HpoRc6/Vdbk+y+fzJRYXF2OK6EpSREwwGEwuLS3F4vF4WWcDqgMezZUxpE0G5xda6yeqxZdGxOB+8erqaiwcDmeodjil1BjsNmtrazEY4NJEAlEFU45UymQy+c3Nzfj29naqUNzuUzoY8pQVgSAI+d3d3R9bW1tJURTzRGLJLmLwNfv7+6n19fVEOReFcouYB4E5PDxMIxCoJ8/+rxRqYLAc3DeVIpEID0Di0HFEIhOxz/nh0WhURCCnp6c8kZmogYFukuM4jr2r9UJRTYRCoUsiU1EDs7Ozk3Q6nX8d/8BiCm034ff701K23scIz/l+IZTO+NbV1enb29urGYbRYLoAkNRztN5HKEUVjIKVUo+a3SEVjApGBVM2MGkVQ4nSCManciiRD8F8JsW7ulRd7XggEzztkAT7ydXtOS99nvkO/gAOam5cVO+JvHFP5E8BBgBjuVwnLBcrSQAAAABJRU5ErkJggg==);background :url(http://kgit.html5video.org/branches/master/modules/MwEmbedSupport/skins/common/images/player_big_play_button.png?2015-07-14T22:01:40Z)!ie;position :absolute;cursor :pointer;border :none !important;z-index :1;left :50%;top :50%;margin-left:-35px;margin-top :-26px}.play-btn-large:hover{background :url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAA1CAYAAAD8mJ3rAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA9RJREFUeNrsm8tPGlEUxgcBQamNSavVKBoa05I2AWNaW2IlJDauXJkaE1cuumbByv/A1AVsjRtjorEujFEDC3ykvhZGWGgIAtKqUYrTgmjLAPLsuVZbqrUxOheGcr/km8WQ3MWPc+acc2cuj/otMVgDfgSWUfmlbbAL/AEcQTd4Zz88AevAD6j8Fg3Wg+0ITCXYAJZQRNRZxGj5cHkLfkx4/JIAXFwAFwVhcUkKBKaYcLik04gh+osIGAKGgMkNMDKZTFRfXy8hYM7nC7G4wGg0Kt1u92ur1arZ29vTaLXaqlwBgxq8N+BCthc2GAx1HR0dsmQySSFLJJLC1tbWiq6uroqDg4PQ5uZmiMNcYtgiRq1WlwOQ1EVDapUMDw83Li8vNzY3N9/Nu1QqAMXj8dRVViqV90wmU9PExIRSoVBI8gbMv6CkW6PRVM7NzTUNDg4+raqqKvzvwSQSidR14aDtj7a2turV1dXm3t7eutLSUkHeR0y6+aDu7u6HAOiVTqeTikSirPVZaD/mPY69mMXFRVVtbe2d26yBqld/f/8nSDNvhrkw2MDMz8+/rKmpYWXdnZ2doF6vd8PD2p/zYMxm8wu2wJxrY2PjsK+vz22xWII5Cwb+3edSqRRLGYYeiIYGcsflcoVzDszU1NSz6upqbP0JVL0klPkDBIim6RjbYLCVxVgslopGoymchQP1QCqVqnxycnJ/YGBgPxgMJthaHCsYKMFJ7MMen89rb2+XtrS0VEAP5IA0O+Y8GMwR84eKiooEPT098s7OTgvDMAnOgkENG4KTyeZDKBTyGxoaSpaWlo44DSYTqXRRfr8/yulUykbEOJ3OY7vdHiJg0gbWhYUFemhoyJMLVSmJjBuK1Wr1j4yMeGCuirK5Lu5nDLaIga7329jY2P7W1haW7hcnGApHKnk8ntD4+LhnfX39O85IFODMezYjJhAInExPT39eWVk5ojIgrGCQbz20MEx8dnbWOzMzc4g20zNV4TgbMScnJ0lo77+YzWZfOBxOUBkWNjDnr0tuAtRisfghbWg2h8KcTiWbzRZAQHw+X4zKsnBGzKmvo+3t7aDRaPTu7u5GKI4oq68pvF5v2GQyeR0OB0NxTNjAQDWJlZWVia8qvVBl6LW1tWOKo8IGBmYXP3p9wgOll14004ADmSy9NxG2PV8kuVwuUavV94VCIc/tdjMA5DASiSQo7ovBCiaHxZBPza4QAUPAEDCsgQkRDJcUQmBshMPlsQ2BGaXOTnURnQrtHY+iz1nRJxVO6ufxnHzvZ76C34E/8tJukjORaWcifwgwAL3bpBIa2UbLAAAAAElFTkSuQmCC);background :url(http://kgit.html5video.org/branches/master/modules/MwEmbedSupport/skins/common/images/player_big_play_button_hover.png?2015-07-14T22:01:40Z)!ie}.carouselContainer{position :absolute;width :100%;z-index :2}.carouselVideoTitle{position :absolute;top :0px;left :0px;width :100%;background :rgba(0,0,0,0.8);color :white;font-size :small;font-weight :bold;z-index :2}.carouselVideoTitleText{display :block;padding :10px 10px 10px 20px}.carouselTitleDuration{position :absolute;top :0px;right :0px;padding :2px;background-color :#5A5A5A;color :#D9D9D9;font-size :smaller;z-index :2}.carouselImgTitle{position :absolute;width :100%;text-align :center;color :white;font-size :small;background :rgba(0,0,0,0.4)}.carouselImgDuration{position :absolute;top :2px;left :2px;background :rgba( 0,0,0,0.7 );color :white;padding :1px 6px;font-size :small}.carouselPrevButton,.carouselNextButton{display :block;position :absolute;bottom:23px}.carouselPrevButton{left :5px}.carouselNextButton{right:6px}.alert-container{-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;background-color:#e6e6e6;background-image:linear-gradient(bottom,rgb(215,215,215) 4%,rgb(230,230,230) 55%,rgb(255,255,255) 100%);background-image:-o-linear-gradient(bottom,rgb(215,215,215) 4%,rgb(230,230,230) 55%,rgb(255,255,255) 100%);background-image:-moz-linear-gradient(bottom,rgb(215,215,215) 4%,rgb(230,230,230) 55%,rgb(255,255,255) 100%);background-image:-webkit-linear-gradient(bottom,rgb(215,215,215) 4%,rgb(230,230,230) 55%,rgb(255,255,255) 100%);background-image:-ms-linear-gradient(bottom,rgb(215,215,215) 4%,rgb(230,230,230) 55%,rgb(255,255,255) 100%);background-image:-webkit-gradient(linear,left bottom,left top,color-stop(0.04,rgb(215,215,215)),color-stop(0.55,rgb(230,230,230)),color-stop(1,rgb(255,255,255)));margin:auto;position:absolute;top:0;left:0;right:0;bottom:0;max-width:80%;max-height:30%}.alert-container-with-buttons{max-height:34%}.ie8 .alert-container{top:50%;background-color:#e6e6e6}.alert-title{background-color :#E6E6E6;padding :5px;border-bottom :1px solid #D1D1D1;font-weight :normal !important;font-size:14px !important;-webkit-border-top-left-radius:3px;-moz-border-radius-topleft:3px;border-top-left-radius:3px;-webkit-border-top-right-radius:3px;-moz-border-radius-topright:3px;border-top-right-radius:3px }.alert-message{padding :5px;font-weight :normal !important;text-align:center;font-size:14px !important;-webkit-text-size-adjust:none}.alert-buttons-container{text-align:center;padding-bottom:5px}.alert-button{background-color:#474747;color:white;-webkit-border-radius:.5em;-moz-border-radius:.5em;border-radius:.5em;padding:2px 10px;background-image:linear-gradient(bottom,rgb(25,25,25) 4%,rgb(47,47,47) 55%,rgb(71,71,71) 68%);background-image:-o-linear-gradient(bottom,rgb(25,25,25) 4%,rgb(47,47,47) 55%,rgb(71,71,71) 68%);background-image:-moz-linear-gradient(bottom,rgb(25,25,25) 4%,rgb(47,47,47) 55%,rgb(71,71,71) 68%);background-image:-webkit-linear-gradient(bottom,rgb(25,25,25) 4%,rgb(47,47,47) 55%,rgb(71,71,71) 68%);background-image:-ms-linear-gradient(bottom,rgb(25,25,25) 4%,rgb(47,47,47) 55%,rgb(71,71,71) 68%);background-image:-webkit-gradient( linear,left bottom,left top,color-stop(0.04,rgb(25,25,25)),color-stop(0.55,rgb(47,47,47)),color-stop(0.68,rgb(71,71,71)) )}.alert-text{color :black !important}
//
//    /* cache key: resourceloader:filter:minify-css:7:c3c0c57eb44a95ba1ab6ea37596292ee */
//    </style>
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
