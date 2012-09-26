<?php
/**
 * KalturaIframe support
 */
@ob_end_clean();
// Setup the kalturaIframe
$kIframe = new kalturaIframe();

// start gzip compression if avaliable: 
if(!ob_start("ob_gzhandler")) ob_start();

// Check if we are wrapping the iframe output in a callback
if( isset( $_REQUEST['callback']  )) {
	// check for json output mode ( either default raw content or 'parts' for sections
	$json = null;
	if( isset ( $_REQUEST['parts'] ) && $_REQUEST['parts'] == '1' ){
		$json = array(
			'rawHead' =>  $kIframe->outputIframeHeadCss(),
			'rawScripts' => $kIframe->getKalturaIframeScripts()
		);
	} else {
		// For full page replace:
		$json = array(
			'content' => $kIframe->getIFramePageOutput() 
		);
	}
	// Set the iframe header:
	$kIframe->setIFrameHeaders();
	echo htmlspecialchars( $_REQUEST['callback'] ) .
		'(' . json_encode( $json ) . ');';
	header('Content-Type: text/javascript' );
} else {
	// If not outputing JSON output the entire iframe to the current buffer:
	$iframePage =  $kIframe->getIFramePageOutput();
	// Set the iframe header:
	$kIframe->setIFrameHeaders();
	echo $iframePage;
}
ob_end_flush();
/**
 * Kaltura iFrame class:
 */
class kalturaIframe {
	var $uiConfResult = null; // lazy init
	var $entryResult = null; // lazy init
	var $playlistResult = null; // lazy init
	var $debug = false;
	var $error = false;
	var $playerError = false;
	var $envConfig = null; // lazy init

	// Plugins used in $this context
	var $plugins = array();

	function getIframeId(){
		if( isset( $_GET['playerId'] ) ){
			return htmlspecialchars( $_GET[ 'playerId' ] );
		}
		return 'iframeVid';
	}
	function getVersionString(){
		global $wgMwEmbedVersion;
		return 'html5iframe:' . $wgMwEmbedVersion;
	}

	/**
	 * Grabs a uiConf result object:
	 */
	function getUiConfResult(){
		if( is_null( $this->uiConfResult ) ){
			require_once( dirname( __FILE__ ) .  '/KalturaUiConfResult.php' );
			try{
				// Init a new result object with the client tag:
				$this->uiConfResult = new KalturaUiConfResult( $this->getVersionString() );
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->uiConfResult;
	}
	/**
	 * Grabs a entry result object:
	 */
	function getEntryResult(){
		if( is_null( $this->entryResult ) ){
			require_once( dirname( __FILE__ ) .  '/KalturaEntryResult.php' );
			try{
				// Init a new result object with the client tag:
				$this->entryResult =  new KalturaEntryResult( $this->getVersionString()  );
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
		if( is_null( $this->playlistResult ) ){
			require_once( dirname( __FILE__ ) .  '/KalturaPlaylistResult.php' );
			try{
				// Init a new result object with the client tag:
				$this->playlistResult =  new KalturaPlaylistResult( $this->getVersionString()  );
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
		if( $this->getUiConfResult()->getError() ) {
			$this->playerError = $this->getUiConfResult()->getError();
		}

		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		$o = "\n\n\t" .'<video class="persistentNativePlayer" ';
		$o.='poster="' . htmlspecialchars( "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%01%00%00%00%01%08%02%00%00%00%90wS%DE%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%0B%0A%17%041%80%9B%E7%F2%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00%0CIDAT%08%D7c%60%60%60%00%00%00%04%00%01'4'%0A%00%00%00%00IEND%AEB%60%82" ) . '" ';
		$o.='id="' . htmlspecialchars( $this->getIframeId() ) . '" ';

		$urlParams = $this->getUiConfResult()->getUrlParameters();

		// Check for webkit-airplay option
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();
		if( isset( $playerConfig['vars']['EmbedPlayer.WebKitAllowAirplay'] ) ){
			$o.= 'x-webkit-airplay="allow" ';
		}

		// Add any additional attributes:
		foreach( $urlParams as $key => $val ){
			if( isset( $videoTagMap[ $key ] ) && $val != null ) {
				if( $videoTagMap[ $key ] == $val ) {
					$o.= ' ' . $videoTagMap[ $key ];
				} else {
					$o.= ' ' . $videoTagMap[ $key ] . '="' . htmlentities( $val ) . '"';
				}
			}
		}
		$o.= ' kpartnerid="' . $this->getUiConfResult()->getPartnerId() . '" ';
		if( $this->playerError !== false ){
			// TODO should move this to i8ln keys instead of raw msgs
			$o.= ' data-playerError="' . htmlentities( $this->playerError ) . '" ';
		}
		// Check for hide gui errors ( missing entry ) Right this is hard coded, we need a better error handling system!
		if( $this->playerError == KalturaResultObject::NO_ENTRY_ID_FOUND ){
			$o.= ' data-blockPlayerDisplay="true" ';
		}

		// Since we load all metadata from api, set preload to none to speed up player display
		// in some browsers.
		$o.=' preload="none" ';

		// Close the open video tag attribute set
		$o.='>';

		$o.= "\n" . "</video>\n";

		// Wrap in a videoContainer
		return  '<div class="videoHolder"> ' . $o . '</div>';
	}
	/**
	 * Get Flash embed code with default flashvars:
	 * @param childHtml Html string to set as child of object embed
	 */
	private function getFlashEmbedHTML( $childHTML = '', $idOverride = false ){

		$playerId = ( $idOverride ) ? $idOverride :  $this->getIframeId();

		$o = '<object id="' . htmlspecialchars( $playerId ) . '" name="' . $playerId . '" ' .
				'type="application/x-shockwave-flash" allowFullScreen="true" '.
				'allowNetworking="all" allowScriptAccess="always" height="100%" width="100%" style="height:100%;width:100%" '.
				'bgcolor="#000000" ' .
				'xmlns:dc="http://purl.org/dc/terms/" '.
				'xmlns:media="http://search.yahoo.com/searchmonkey/media/" '.
				'rel="media:video" '.
				'resource="' . htmlspecialchars( $this->getSwfUrl() ) . '" '.
				'data="' . htmlspecialchars( $this->getSwfUrl() ) . '"> ';

		// check for wmod param:
		if( isset( $_REQUEST['wmode'] ) && ( $_REQUEST['wmode'] == 'opaque' ||  $_REQUEST['wmode'] =='transparent' ) ){
			$o.= '<param name="wmode" value="transparent" />';
		} else {
			$o.= '<param name="wmode" value="direct" />';
		}

		$o.= '<param name="allowFullScreen" value="true" /><param name="allowNetworking" value="all" />' .
			'<param name="allowScriptAccess" value="always" /><param name="bgcolor" value="#000000" />'.
			'<param name="flashVars" value="';
		$o.= $this->getFlashVarsString() ;
		// close the object tag add the movie param and childHTML:
		$o.='" /><param name="movie" value="' . htmlspecialchars( $this->getSwfUrl() ) . '" />'.
		$childHTML .
			'</object>';
		return $o;
	}
	private function getFlashVarsString(){
		// output the escaped flash vars from get arguments
		$s = 'externalInterfaceDisabled=false';
		if( isset( $_REQUEST['flashvars'] ) && is_array( $_REQUEST['flashvars'] ) ){
			foreach( $_REQUEST['flashvars'] as $key => $val ){
				// check for object val;
				if( is_object( json_decode( $val ) ) ){
					$valSet = json_decode( $val );
					foreach( $valSet as $pkey => $pval ){
						// convert boolean
						if( $pval === true ){
							$pval = 'true';
						}
						if( $pval === false ){
							$pval = 'false';
						}
						$s.= '&' . htmlspecialchars( $key ) .
							'.' . htmlspecialchars( $pkey ) .
							'=' . htmlspecialchars( $pval );
					}
				} else {
					$s.= '&' . htmlspecialchars( $key ) . '=' . htmlspecialchars( $val );
				}
			}
		}
		return $s;
	}
	/**
	 * Get custom player includes for css and javascript
	 */
	private function getCustomPlayerIncludes(){
		$resourceIncludes = array();

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
		foreach( $plugins as $pluginId => $plugin ){
			foreach( $plugin as $attr => $value ){
				$resource = array();
				if( strpos( $attr, 'iframeHTML5Js' ) === 0 ){
					$resource['type'] = 'js';
				} else if( strpos( $attr, 'iframeHTML5Css' ) === 0 ){
					$resource['type'] = 'css';
				} else {
					continue;
				}
				// we have a valid type key add src:
				$resource['src']= htmlspecialchars( $value );
				// Add the resource
				$resourceIncludes[] = $resource;
			}
		}
		// return the resource array in JSON:
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
			$this->envConfig = array_merge( $this->envConfig,
			$this->getUiConfResult()->getWidgetUiVars() );

			// Flashvars
			if( $this->getUiConfResult()->urlParameters[ 'flashvars' ] ) {
				foreach( $this->getUiConfResult()->urlParameters[ 'flashvars' ]  as $fvKey => $fvValue) {
					$this->envConfig[  $fvKey ] =  json_decode( html_entity_decode( $fvValue ) );
				}
			}
		}
		return $this->envConfig;
	}
	private function getSwfUrl(){
		$swfUrl = $this->getUiConfResult()->getServiceConfig('ServiceUrl') . '/index.php/kwidget';
		// pass along player attributes to the swf:
		$urlParams = $this->getUiConfResult()->getUrlParameters();
		foreach($urlParams as $key => $val ){
			if( $val != null && $key != 'flashvars' ){
				$swfUrl.='/' . $key . '/' . $val;
			}
		}
		return $swfUrl;
	}

	/**
	 * Function to set iframe content headers
	 */
	function setIFrameHeaders(){
		global $wgKalturaUiConfCacheTime, $wgKalturaErrorCacheTime;
		// Only cache for 30 seconds if there is an error:
		$cacheTime = ( $this->isError() )? $wgKalturaErrorCacheTime : $wgKalturaUiConfCacheTime;

		// Set relevent expire headers:
		if( $this->getUiConfResult()->isCachedOutput() ){
			$time = $this->getUiConfResult()->getFileCacheTime();
			$this->sendPublicHeaders( $cacheTime,  $time );
		} else {
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Pragma: no-cache");
			header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		}
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
		header( 'Pragma: public' );
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
						$loaderPath = $this->getUiConfResult()->getServiceConfig( 'CdnUrl' ) . $value;
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
		$urlParam = $this->getUiConfResult()->getUrlParameters();
		if( isset( $urlParam['urid'] ) ){
			$versionParam .= '&urid=' . htmlspecialchars( $urlParam['urid'] );
		}
		if( isset( $ulrParam['debug'] ) || $wgEnableScriptDebug ){
			$versionParam .= '&debug=true';
		}
		return $versionParam;
	}
	private function getUiConfWidParams(){
		$urlParam = $this->getUiConfResult()->getUrlParameters();
		$paramString = '';
		$and = '';
		$parmList = array( 'wid', 'uiconf_id', 'p', 'cache_st' );
		foreach( $parmList as $param ){
			if( isset( $urlParam[ $param ] ) ){
				$paramString.= $and. $param . '=' . htmlspecialchars( $urlParam[ $param ] );
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
		$envConfig = $this->getEnvironmentConfig();
		if( isset( $envConfig['IframeCustomjQueryUISkinCss'] ) ){
			return $envConfig['IframeCustomjQueryUISkinCss'];
		}
		return false;
	}

	/**
	 * Get the startup location
	 */
	private function getMwEmbedStartUpLocation(){
		$skinParam =( $this->getCustomSkinUrl() ) ? '&skin=custom' : '';
		return $this->getMwEmbedPath() . 'mwEmbedStartup.php?' .
		$this->getVersionUrlParams() . '&mwEmbedSetupDone=1' .
		$skinParam;
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
		global $wgResourceLoaderUrl;
		$path = str_replace( 'load.php', '', $wgResourceLoaderUrl );
		ob_start();
		?><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
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
		<?php if (  $this->isError ()  ) { ?> .error {
			position: relative;
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
		
		.error h2 {
			font-size: 14px;
		}<?php
	}
?></style>
<?php
return ob_get_clean();
	}

	function getPath() {
		global $wgResourceLoaderUrl;
		return str_replace( 'ResourceLoader.php', '', $wgResourceLoaderUrl );
	}
	/**
	 * Get all the kaltura defined modules from player config
	 * */
	function outputKalturaModules(){
		$o='';
		// Init modules array, always include MwEmbedSupport
		$moduleList = array( 'mw.MwEmbedSupport' );

		// Check player config per plugin id mapping
		$kalturaSupportModules = include( 'KalturaSupport.php');
		$playerConfig = $this->getUiConfResult()->getPlayerConfig();

		foreach( $kalturaSupportModules as $name => $module ){
			if( isset( $module[ 'kalturaLoad' ] ) &&  $module['kalturaLoad'] == 'always' ){
				$moduleList[] = $name;
			}
			// Check if the module has a kalturaPluginName and load if set in playerConfig
			if( isset( $module[ 'kalturaPluginName' ] ) ){
				if( is_array( $module[ 'kalturaPluginName' ] ) ){
					foreach($module[ 'kalturaPluginName' ] as $subModuleName ){
						if( isset( $playerConfig['plugins'][ $subModuleName] )){
							$moduleList[] = $name;
							continue;
						}
					}
				} else if( isset( $playerConfig['plugins'][ $module[ 'kalturaPluginName' ] ] ) ){
					$moduleList[] = $name;
				}
			}
		}
		// Have all the kaltura related plugins listed in a configuration var for
		// implicte dependency mapping before embedding embedPlayer
		$o.= ResourceLoader::makeConfigSetScript( array(
			'KalturaSupport.DepModuleList' => $moduleList
		));

		// Special cases: handle plugins that have more complex conditional load calls
		// always include mw.EmbedPlayer
		$moduleList[] = 'mw.EmbedPlayer';

		// Load all the known required libraries:
		$o.= ResourceLoader::makeLoaderConditionalScript(
		Xml::encodeJsCall( 'mw.loader.load', array( $moduleList ) )
		);
		return $o;
	}

	function getKalturaIframeScripts(){
		ob_start();
		?>
		<script type="text/javascript">
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
			try{
				if( window['parent'] && window['parent']['kWidget'] ){
					// import kWidget and mw into the current context:
					window['kWidget'] = window['parent']['kWidget']; 
				} else {
					// include kWiget script if not already avaliable
					document.write('<script src="<?php echo $this->getMwEmbedLoaderLocation() ?>"></scr' + 'ipt>' );
				}
			} catch( e ) {
				// possible error
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
					// Set of resources to be inlucded on the iframe side of the page. 
					'customPlayerIncludes' => $this->getCustomPlayerIncludes(),
					// The iframe player id
					'playerId' => $this->getIframeId(),
					// Flash embed HTML
					'flashHTML' => $this->getFlashEmbedHTML(),
				);
				// If playlist add playlist and entry playlist entry to payload
				if( $this->getUiConfResult()->isPlaylist() ){
					// reset "no entry id error" ( will load via playlist ) 
					$this->getUiConfResult()->error = null;
					// get playlist data, will load associated entryResult as well. 
					if( $this->getPlaylistResult()->isCachableRequest() ){
						$payload = array_merge( $payload, 
										$this->getPlaylistResult()->getPlaylistResult()
									);
					}
				} else {
					// if cachable entry add to payload
					if( $this->getEntryResult()->isCachableRequest() ){
						$payload[ 'entryResult' ] = $this->getEntryResult()->getEntryResult();
					}
				}
				echo json_encode( $payload );
			?>;
		</script>
		<script type="text/javascript">
			// IE9 has out of order execution, wait for mw:
			var waitForMwCount = 0;
			var loadMw = function( callback ) {
				var waitforMw = function( callback ){
					if( window['mw'] &&  window['mw']['loader'] ){
						// Most borwsers will respect the script writes above 
						// and directly execute the callback:
						callback();
						return ;
					}
					setTimeout(function(){
						waitForMwCount++;
						if( waitForMwCount < 1000 ){
							waitforMw( callback );
						} else {
							console.log("Error in loading mwEmbedLodaer");
						}
					}, 10 );
				};
				<!-- Include the mwEmbedStartup script, will initialize the resource loader -->
				kWidget.appendScriptUrl('<?php echo $this->getMwEmbedStartUpLocation() ?>', function(){
					// onload != script done executing in all browsers :(
					waitforMw( callback );
				}, document );
			}
			// For loading iframe side resources that need to be loaded after mw 
			// but before player build out
			var loadCustomResourceIncludes = function( loadSet, callback ){
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
						// For some reason safair loses context:
						jQuery.getScript( resource.src, checkLoadDone);
					} else if ( resource.type == 'css' ){
						jQuery('head').append(
								$('<link rel="stylesheet" type="text/css" />')
									.attr( 'href', resource.src )
						);
						checkLoadDone();
					}
				}
			};
		</script>
		<?php
		return ob_get_clean();
	}
	function getIFramePageOutput( ){
		//die( '<pre>' . htmlspecialchars($this->getVideoHTML()) );
		global $wgResourceLoaderUrl;
		$urlParms = $this->getUiConfResult()->getUrlParameters();
		$uiConfId =  htmlspecialchars( $urlParms['uiconf_id'] );
		
		$path = str_replace( 'load.php', '', $wgResourceLoaderUrl );
		ob_start();
		?>
<!DOCTYPE html>
<html>
<head>
	<script type="text/javascript"> /*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/ </script>
	<?php echo $this->outputIframeHeadCss(); ?>
</head>
<body>
<?php echo $this->getKalturaIframeScripts(); ?>
<?php
// wrap in a top level playlist in the iframe to avoid javascript base .wrap call that breaks video playback in iOS
if( $this->getUiConfResult()->isPlaylist() ){
	?>
	<div id="playlistInterface"
		style="position: relative; width: 100%; height: 100%">
		<?php
}
?>
		<div class="mwPlayerContainer" style="width: 100%; height: 100%">
		<?php echo $this->getVideoHTML(); ?>
		</div>
		<?php
		if( $this->getUiConfResult()->isPlaylist() ){
			?>
	</div>
	<?php
		}
		?>
		<script>
		if( kWidget.isUiConfIdHTML5( '<?php echo $uiConfId ?>' ) ){
			loadMw( function(){
				<!-- Load any custom skins: --> 
				<?php if( $this->getCustomSkinUrl() ){?>
					jQuery('head').append(
							$('<link rel="stylesheet" type="text/css" />')
								.attr( 'href', '<?php echo htmlspecialchars( $this->getCustomSkinUrl() ) ?>'  )
					);
				<?php } ?>
				// Load any other iframe custom resources
				loadCustomResourceIncludes( window.kalturaIframePackageData['customPlayerIncludes'], function(){ 
					<?php echo $this->outputKalturaModules(); ?>
					mw.loader.go();
				});
			});
		} else {
			// replace body contents with flash object:
			document.getElementsByTagName('body')[0].innerHTML = window.kalturaIframePackageData['flashHTML'];
		}

		</script>
</body>
</html>
		<?php
		return ob_get_clean();
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
			list( $errorTitle, $errorMsg) = explode( "\n", $errorTitle);
		};
		$this->error = true;

		// clear the buffer ( causes gzip issues ) 
		//$pageInProgress = @ob_end_clean();
			
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
	<div class="error">
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
