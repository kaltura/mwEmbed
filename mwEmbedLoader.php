<?php
// Include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

$mwEmbedLoader = new mwEmbedLoader();
$mwEmbedLoader->output();

class mwEmbedLoader {
	var $resultObject = null; // lazy init
	var $error = false;
	var $loaderFileList = array(
		// Get main kWidget resource:
		'kWidget/kWidget.js', 
		// Include json2 for old browsers that don't have JSON.stringify
		'resources/json/json2.js', 
		// By default include deprecated globals ( will be deprecated in 1.8 )
		'kWidget/kWidget.deprecatedGlobals.js', 
		// Get resource ( domReady.js )
		'kWidget/kWidget.domReady.js', 
		// Get resource (  mwEmbedLoader.js )
		'kWidget/mwEmbedLoader.js', 
		// Include checkUserAgentPlayer code
		'kWidget/kWidget.checkUserAgentPlayerRules.js' 
	);
	
	function output(){
		//get the comment never minfied
		$o = $this->getLoaderComment();
		
		// get the main payload minfied if possible
		if( $this->isDebugMode() ){
			$o = $this->getCombinedLoaderJs();
			// get any per uiConf js:
			$o.= $this->getPerUiConfJS();
		} else {
			$o.= $this->getMinCombinedLoaderJs();
			// get any per uiConf js:
			$o.= $this->getMinPerUiConfJS();
		}
		
		// send cache headers
		$this->sendHeaders();
		
		// start gzip handler if possible:
		//if(!ob_start("ob_gzhandler")) ob_start();
		
		// check for non-fatal errors: 
		if( $this->getError() ){
			echo "if( console ){ console.log('" . $this->getError() . "'); }";
		}
		// output the script output
		echo $o;
	}
	private function setError( $errorMsg ){
		$this->error = $errorMsg;
	}
	private function getError(){
		return $this->error;
	}
	private function isDebugMode(){
		global $wgEnableScriptDebug;
		return  isset( $_GET['debug'] ) || $wgEnableScriptDebug;
	}
	private function getCacheFileContents( $key ){
		global $wgScriptCacheDirectory;
		if( is_file( $this->getCacheFilePath( $key ) ) ){
			return @file_get_contents(  $this->getCacheFilePath( $key ) );
		}
		return false;
	}
	private function getCacheFilePath( $key ){
		global $wgScriptCacheDirectory;
		return $wgScriptCacheDirectory . '/' . substr( $key, 0, 2) . '/'.  substr( $key, 2 );
	}
	
	private function getMinPerUiConfJS(){
		// mwEmbedLoader based uiConf values can be hashed by the uiconf
		$uiConfJs = $this->getPerUiConfJS();
		if( $uiConfJs == '' ){
			return '';
		}
		// Hash the javascript string to see if we we can use a cached version and avoid JavaScriptMinifier call
		$key = md5( $uiConfJs );
		$cacheJS = $this->getCacheFileContents( $key );
		if( $cacheJS !== false ){
			return $cacheJS;
		}
		//minfy js 
		require_once( realpath( dirname( __FILE__ ) ) . '/includes/libs/JavaScriptMinifier.php' );
		$minjs = JavaScriptMinifier::minify( $uiConfJs );
		// output minified cache: 
		$this->outputFileCache( $key, $minjs);
		return $minjs;
	}
	
	/** gets any defiend on-page uiConf js */
	private function getPerUiConfJS(){
		// load the onPage js services
		$mweUiConfJs = new mweApiUiConfJs();
		if( !isset( $this->getResultObject()->urlParameters [ 'uiconf_id' ] )
				||
			!isset( $this->getResultObject()->urlParameters [ 'wid' ] )
		){
			// directly issue the UiConfJs callback
			return 'kWidget.inLoaderUiConfJsCallback();';
		}
		// output is set to empty string:
		$o='';
		// always include UserAgentPlayerRules:
		$o.= $mweUiConfJs->getUserAgentPlayerRules();
		// only include on page plugins if not in iframe Server
		if( !isset( $_REQUEST['iframeServer'] ) ){
			$o.= $mweUiConfJs->getPluginPageJs( 'kWidget.inLoaderUiConfJsCallback' );
		} else{
			$o.='kWidget.inLoaderUiConfJsCallback();';
		}
		// set the flag so that we don't have to request the services.php
		$o.= "\n" . 'kWidget.uiConfScriptLoadList[\'' . 
			$mweUiConfJs->getResultObject()->urlParameters ['uiconf_id' ] .
			'\'] = 1; ' ;
		return $o;
	}
	/**
	* The result object grabber, caches a local result object for easy access
	* to result object properties.
	*/
	function getResultObject(){
		global $wgMwEmbedVersion;
		if( ! $this->resultObject ){
			require_once( dirname( __FILE__ ) .  '/modules/KalturaSupport/KalturaResultObject.php' );
			try {
				// Init a new result object with the client tag:
				$this->resultObject = new KalturaResultObject( 'html5iframe:' . $wgMwEmbedVersion );
			} catch ( Exception $e ){
				//$this->fatalError( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
	
	private function getMinCombinedLoaderJs(){
		global $wgHTTPProtocol, $wgMwEmbedVersion;
		$key = '/loader_' . $wgHTTPProtocol . '.min.' . $wgMwEmbedVersion . '.js' ;
		$cacheJS = $this->getCacheFileContents( $key );
		if( $cacheJS !== false ){
			return $cacheJS;
		}
		// Else get from files: 
		$rawScript = $this->getCombinedLoaderJs();
		// Get the JSmin class:
		require_once( realpath( dirname( __FILE__ ) ) . '/includes/libs/JavaScriptMinifier.php' );
		$minjs = JavaScriptMinifier::minify( $rawScript );
		// output the file to the cache:
		$this->outputFileCache( $key, $minjs);
		// return the minified js:
		return $minjs;
	}
	function outputFileCache( $key, $js ){
		$path = $this->getCacheFilePath( $key );
		$pathAry = explode( "/", $path );
		$pathDir = implode( '/', array_slice( $pathAry, 0, count( $pathAry ) - 1 ) );
		// Create cache directory if not exists
		if( ! is_dir( $pathDir ) ) {
			$created = @mkdir( $pathDir, 0, true );
			if( ! $created ) {
				$this->setError( 'Error in creating cache directory' );
				return ;
			}
		}
		// make sure the path exists
		if( !@file_put_contents( $path, $js ) ){
			$this->setError( 'Error outputting file to cache');
		}
	}
	private function getCombinedLoaderJs(){
		global $wgEnableScriptDebug, $wgResourceLoaderUrl, $wgMwEmbedVersion, $wgMwEmbedProxyUrl, $wgKalturaUseManifestUrls,
			$wgKalturaUseManifestUrls, $wgHTTPProtocol, $wgKalturaServiceUrl, $wgKalturaServiceBase,
			$wgKalturaCDNUrl, $wgKalturaStatsServiceUrl, $wgKalturaIframeRewrite, $wgEnableIpadHTMLControls,
			$wgKalturaAllowIframeRemoteService, $wgKalturaUseAppleAdaptive, $wgKalturaEnableEmbedUiConfJs;
		// Append ResourceLoder path to loader.js
		$loaderJs = "window['SCRIPT_LOADER_URL'] = '". addslashes( $wgResourceLoaderUrl ) . "';\n";
		
		// Add the library version:
		$loaderJs .= "window['MWEMBED_VERSION'] = '$wgMwEmbedVersion';\n";
		
		// Output all the files
		foreach( $this->loaderFileList as $file ){
			$loaderJs .= file_get_contents( $file );
		}
		
		// Set up globals to be exported as mwEmbed config:
		$exportedJsConfig= array(
			'debug' => $wgEnableScriptDebug,
			'Mw.XmlProxyUrl' => $wgMwEmbedProxyUrl,
			'Kaltura.UseManifestUrls' => $wgKalturaUseManifestUrls,
			'Kaltura.Protocol'	=>	$wgHTTPProtocol,
			'Kaltura.ServiceUrl' => $wgKalturaServiceUrl,
			'Kaltura.ServiceBase' => $wgKalturaServiceBase,
			'Kaltura.CdnUrl' => $wgKalturaCDNUrl,
			'Kaltura.StatsServiceUrl' => $wgKalturaStatsServiceUrl,
			'Kaltura.IframeRewrite' => $wgKalturaIframeRewrite,
			'EmbedPlayer.EnableIpadHTMLControls' => $wgEnableIpadHTMLControls,
			'EmbedPlayer.UseFlashOnAndroid' => true,
			'Kaltura.LoadScriptForVideoTags' => true,
			'Kaltura.AllowIframeRemoteService' => $wgKalturaAllowIframeRemoteService,
			'Kaltura.UseAppleAdaptive' => $wgKalturaUseAppleAdaptive,
			'Kaltura.EnableEmbedUiConfJs' => $wgKalturaEnableEmbedUiConfJs
		);
		
		// Append Custom config:
		foreach( $exportedJsConfig as $key => $val ){
			// @@TODO use a library Boolean conversion routine:
			$val = ( $val === true )? $val = 'true' : $val;
			$val = ( $val === false )? $val = 'false' : $val;
			$val = ( $val != 'true' && $val != 'false' )? "'" . addslashes( $val ) . "'": $val;
			$loaderJs .= "mw.setConfig('". addslashes( $key ). "', $val );\n";
		}
		
		return $loaderJs;
	}
	// Kaltura Comment
	private function getLoaderComment(){
		global $wgMwEmbedVersion;
		return "/**
	* Kaltura HTML5 Library v$wgMwEmbedVersion  
	* http://html5video.org/kaltura-player/docs/
	* 
	* This is free software released under the GPL2 see README more info 
	* http://html5video.org/kaltura-player/docs/readme
	*/\n";
	}
	/** send the cdn headers */
	private function sendHeaders(){
		global $wgEnableScriptDebug;
		header("Content-type: text/javascript");
		if( isset( $_GET['debug'] ) || $wgEnableScriptDebug ){
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Pragma: no-cache");
			header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		} else {
			// Set the expire time for the loader to 3 hours ( kaltura version always have diffrent version tags; for new versions )
			$max_age = 60*60*3;
			// Check for an error ( only cache for 60 seconds )
			if( $this->getError() ){
				$max_age = 60; 
			}
			header("Cache-Control: public, max-age=$max_age max-stale=0");
			header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $max_age) . 'GMT');
			header('Last-Modified: ' . gmdate('D, d M Y H:i:s', time()) . 'GMT');
		}
	}
}
