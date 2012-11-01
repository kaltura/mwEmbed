<?php
/**
 * KalturaIframe support
 */
	
// Setup the kalturaIframe
global $wgKalturaIframe;
$wgKalturaIframe = new kalturaIframe();

// Do kalturaIframe video output:

// Start output buffering to 'catch errors' and override output
if( ! ob_start("ob_gzhandler") ) ob_start();

$wgKalturaIframe->outputIFrame();
// Check if we are wrapping the iframe output in a callback
if( isset( $_REQUEST['callback']  )) {
	// get the output buffer:
	$out = ob_get_contents();
	ob_end_clean();
	// Re-start the output buffer: 
	if( ! ob_start("ob_gzhandler") ) ob_start();
	
	header('Content-type: text/javascript' );
	echo htmlspecialchars( $_REQUEST['callback'] ) . '(' . 
		json_encode( array( 'content' => $out ) ) . ');';
} 
// flush the buffer.
ob_end_flush();

/**
 * Kaltura iFrame class:
 */
class kalturaIframe {
	var $resultObject = null; // lazy init 
	var $debug = false;
	var $error = false;
	var $playerError = false;
	
	// A list of kaltura plugins and associated includes	
	public static $iframePluginMap = array(
		'ageGate' => 'iframePlugins/AgeGate.php'
	);
	// Plugins used in $this context
	var $plugins = array();
	
	function getIframeId(){
		if( isset( $_GET['playerId'] ) ){
			return htmlspecialchars( $_GET[ 'playerId' ] );
		}
		return 'iframeVid';
	}
	/**
	 * The result object grabber, caches a local result object for easy access
	 * to result object properties. 
	 */
	function getResultObject(){
		global $wgMwEmbedVersion;
		if( ! $this->resultObject ){
			require_once( dirname( __FILE__ ) .  '/KalturaResultObject.php' );
			try{
				// Init a new result object with the client tag: 
				$this->resultObject = new KalturaResultObject( 'html5iframe:' . $wgMwEmbedVersion );;
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
	
	private function getPlaylistPlayerSizeCss(){
		// default size: 
		$width = 400;
		$height = 300;
		
		// check if we have iframeSize paramater: 
		if( isset( $_GET[ 'iframeSize' ] ) ){
			list( $iframeWidth, $iframeHeight ) = explode( 'x',  $_GET[ 'iframeSize' ]);
			$iframeWidth = intval( $iframeWidth );
			$iframeHeight = intval( $iframeHeight );
			
			$includeInLayout = $this->getResultObject()->getPlayerConfig('playlist', 'includeInLayout');
			$playlistHolder = $this->getResultObject()->getPlayerConfig('playlistHolder');
			
			// Hide list if includeInLayout is false
			if( $includeInLayout === false ) {
				$width = $iframeWidth;
				$height = $iframeHeight;
			} else {
				if( $playlistHolder ) {
					if( isset($playlistHolder['width']) && $playlistHolder['width'] != '100%' ) {
						$width = $iframeWidth - intval( $playlistHolder['width'] );
						$height = $iframeHeight;
					}
					if( isset($playlistHolder['height']) && $playlistHolder['height'] != '100%' ) {
						$height = $iframeHeight - intval( $playlistHolder['height'] );
						$width = $iframeWidth;
					}
				} else {
					$width = $iframeWidth;
					$height = $iframeHeight;
				}

				// If we don't need to show the player, set the player container height to the controlbar (audio playlist)
				if( $this->getResultObject()->getPlayerConfig('playerHolder', 'visible') === false ||
						$this->getResultObject()->getPlayerConfig('playerHolder', 'includeInLayout') === false ) {
					$height = $this->getResultObject()->getPlayerConfig('controlsHolder', 'height');
				}
			}
		}
		return "position:absolute;width:{$width}px;height:{$height}px;";
	}
	// outputs the playlist wrapper 
	private function getPlaylistWraper( $videoHtml ){
		// XXX this hard codes some layout assumptions ( but no good way around that for now )
		return '<div id="playlistContainer" style="width:100%;height:100%">
				<span class="media-rss-video-player-container" style="float:left;' . $this->getPlaylistPlayerSizeCss() . '">' . 
					'<div class="media-rss-video-player" style="position:relative;height:100%;">' . 
						$videoHtml .
					'</div>' . 
				'</span>
			</div>';
	}
	/*
	 * TODO: need to remove all source logic (not needed)
	 */
	private function getVideoHTML( $playerStyle = ''  ){
		$videoTagMap = array(
			'entry_id' => 'kentryid',
			'uiconf_id' => 'kuiconfid',
			'wid' => 'kwidgetid',
			'autoplay' => 'autoplay',
		);
	
		// See if we have access control restrictions
		// Check access control and throw an exception if not allowed: 
		$acStatus = $this->getResultObject()->isAccessControlAllowed( $resultObject );
		if( $acStatus !== true ){
			$this->playerError = $acStatus;
		} else {
			// If we have an error, show it
			if( $this->getResultObject()->getError() ) {
				$this->playerError = $this->getResultObject()->getError();
			}
		}

		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		$o = "\n\n\t" .'<video class="persistentNativePlayer" ';
		$o.='poster="' . htmlspecialchars( $this->getResultObject()->getThumbnailUrl() ) . '" ';
		$o.='id="' . htmlspecialchars( $this->getIframeId() ) . '" ' .
			'style="' . $playerStyle . '" ';
		$urlParams = $this->getResultObject()->getUrlParameters();
		
		// Check for webkit-airplay option
		$playerConfig = $this->getResultObject()->getPlayerConfig();
		if( isset( $playerConfig['vars']['EmbedPlayer.WebKitPlaysInline'] ) ){
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
		$o.= ' kpartnerid="' . $this->getResultObject()->getPartnerId() . '" ';
		if( $this->playerError !== false ){
			// TODO should move this to i8ln keys instead of raw msgs
			$o.= ' data-playerError="' . htmlentities( $this->playerError ) . '" ';
		}
		// Check for hide gui errors ( missing entry ) Right this is hard coded, we need a better error handling system! 
		if( $this->playerError == KalturaResultObject::NO_ENTRY_ID_FOUND ){
			$o.= ' data-blockPlayerDisplay="true" ';
		}
		// Close the open video tag attribute set
		$o.='>';

		$o.= "\n" . "</video>\n";
		
		// Wrap in a videoContainer
		return  '<div id="videoContainer" style="height:100%" > ' . $o . '</div>';
	}
	/**
	 * Get Flash embed code with default flashvars:
	 * @param childHtml Html string to set as child of object embed
	 */	
	private function getFlashEmbedHTML( $childHTML = '', $idOverride = false ){		
		
		$playerId = ( $idOverride )? $idOverride :  $this->getIframeId();
		
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
				$s.= '&' . htmlspecialchars( $key ) . '=' . 
				htmlspecialchars( urlencode( $val ) );
			}
		}
		return $s;
	}
	/**
	 * Get custom player includes for css and javascript
	 */
	private function getCustomPlayerIncludesJSON(){
		// Try to get uiConf
		if( ! $this->getResultObject()->getUiConf() ){
			return false;
		}
		
		$resourceIncludes = array();
		
		// vars
		$uiVars = $this->getResultObject()->getWidgetUiVars();
		foreach( $uiVars as $key => $value ){
			// Check for valid plugin types: 
			$resource = array();
			if( strpos( $key, 'IframeCustomPluginJs' ) === 0 ){
				$resource['type'] = 'js';
			} else if( strpos( $key, 'IframeCustomPluginCss' ) === 0 ){
				$resource['type'] = 'css';
			} else{
				continue;
			}
			// we have a valid type key add src:
			$resource['src']= htmlspecialchars( $value );
			
			// Add the resource	
			$resourceIncludes[] = $resource;
		}
		
		// plugins
		$plugins = $this->getResultObject()->getWidgetPlugins();
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
		return json_encode( $resourceIncludes );
	}
	/** 
	 * Gets a series of mw.setConfig calls set via the uiConf of the kaltura player
	 * TODO: we should use getWidgetUiVars instead of parsing the XML
	 * */
	private function getCustomPlayerConfig(){
		if( ! $this->getResultObject()->getUiConf() ){
			return '';
		}
		$o = '';
		// uiVars
		$xml = $this->getResultObject()->getUiConfXML();
		if( isset( $xml->uiVars ) && isset( $xml->uiVars->var ) ){
			foreach ( $xml->uiVars->var as $var ){
				if( isset( $var['key'] ) && isset( $var['value'] ) ){
					$o .= $this->getSetConfigLine( $var['key'] , $var['value'] );
				}
			}
		}
		// Flashvars
		if( $this->getResultObject()->urlParameters[ 'flashvars' ] ) {
			foreach( $this->getResultObject()->urlParameters[ 'flashvars' ]  as $fvKey => $fvValue) {
				$o .= $this->getSetConfigLine( $fvKey , html_entity_decode( $fvValue )  );
			}
		}
		return $o;
	}
	private function getSetConfigLine( $key, $value ){
		if( ! isset( $key ) || ! isset( $value ) ){
			return '';
		}
		$o='';
		// don't allow custom resource includes to be set via flashvars
		if( $key != 'Mw.CustomResourceIncludes' ){
			$o.= "mw.setConfig('" . htmlspecialchars( addslashes( $key ) ) . "', ";
			// check for boolean attributes: 
			if( $value == 'false' || $value == 'true' ){
				$o.=  $value;
			} else if( json_decode( $value ) !== null ){ // don't escape json: 
				$o.= $value;
			} else { //escape string values:
				$o.= "'" . htmlspecialchars( addslashes( $value ) ) . "'";
			}
			$o.= ");\n";
		}
		return $o;
	}
	private function checkIframePlugins(){
		try{
			$xml = $this->getResultObject()->getUiConfXML();
		} catch ( Exception $e ){
			//$this->fatalError( $e->getMessage() );
			return ;
		}
		if( isset( $xml->HBox ) && isset( $xml->HBox->Canvas ) && isset( $xml->HBox->Canvas->Plugin ) ){
			foreach ($xml->HBox->Canvas->Plugin as $plugin ){
				$attributes = $plugin->attributes();
				$pluginId = (string) $attributes['id'];
				if( in_array( $pluginId, array_keys ( self::$iframePluginMap ) ) ){
					require_once( self::$iframePluginMap[ $pluginId] );
					$this->plugins[$pluginId] = new $pluginId( $this );
					$this->plugins[$pluginId ]->run();
				}
			}
		}
	}
	private function getSwfUrl(){
		$swfUrl = $this->getResultObject()->getServiceConfig('ServiceUrl') . '/index.php/kwidget';
		// pass along player attributes to the swf:
		$urlParams = $this->getResultObject()->getUrlParameters();
		foreach($urlParams as $key => $val ){
			if( $val != null && $key != 'flashvars' ){
				$swfUrl.='/' . $key . '/' . $val;
			}
		}
		return $swfUrl;
	}
	
	/**
	 * Void function to set iframe content headers
	 */
	private function setIFrameHeaders(){
		global $wgKalturaUiConfCacheTime, $wgKalturaErrorCacheTime;
		// Only cache for 30 seconds if there is an error: 
		$cacheTime = ( $this->isError() )? $wgKalturaErrorCacheTime : $wgKalturaUiConfCacheTime;
		// Set relevent expire headers:
		if( $this->getResultObject()->isCachedOutput() ){
			$time = $this->getResultObject()->getFileCacheTime();
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
	 * Get the location of the mwEmbed library
	 */
	private function getMwEmbedLoaderLocation(){
		global $wgResourceLoaderUrl, $wgEnableScriptDebug;
		$loaderPath = str_replace( 'ResourceLoader.php', 'mwEmbedLoader.php', $wgResourceLoaderUrl );
		
		$versionParam = '?';
		$urlParam = $this->getResultObject()->getUrlParameters();
		if( isset( $urlParam['urid'] ) ){
			$versionParam .= '&urid=' . htmlspecialchars( $urlParam['urid'] );
		}
		if( isset( $ulrParam['debug'] ) || $wgEnableScriptDebug ){
			$versionParam .= '&debug=true';
		}

		$xml = $this->getResultObject()->getUiConfXML();
		if( $xml && isset( $xml->layout ) && isset( $xml->layout[0] ) ){
			foreach($xml->layout[0]->attributes() as $name => $value) {
				if( $name == 'html5_url' ){
					if( $value[0] == '/' ){
						$loaderPath = $this->getResultObject()->getServiceConfig( 'CdnUrl' ) . $value;
					} else if( substr( $value,0, 4 ) == 'http' ) {
						$loaderPath = $value;
					}
				}
			}
		}
		return $loaderPath . $versionParam;
	}
	
	/**
	 * Get the iframe css
	 */
	private function outputIframeHeadCss(){
		global $wgResourceLoaderUrl;
		$path = str_replace( 'ResourceLoader.php', '', $wgResourceLoaderUrl );
		?>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Kaltura Embed Player iFrame</title>
		<style type="text/css">
			html { margin: 0; padding: 0; width: 100%; height: 100%; }
			body {
				margin:0;
				width: 100%;
				height: 100%;
				overflow:hidden;
				background: #000;
				color: #fff;
				position: fixed;
				top: 0px;
				left: 0px;
			}
		<?php 
		if( $this->isError() ){
			?>
				.error {
					position:absolute;
					top: 37%;
					left: 50%;
					margin: 0 0 0 -140px;
					width: 280px;
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
				}
			<?php 
		} else {
			?>
			.loadingSpinner {
					background: url( '<?php echo $path ?>skins/common/images/loading_ani.gif');
					position: absolute;
					top: 50%; left: 50%;
					width:32px;
					height:32px;
					display:block;
					padding:0px;
					margin: -16px -16px;
				}
				#videoContainer {
					position: absolute;
					width: 100%;
					min-height: 100%;
				}
			<?php
		}
		?>
			</style>
		<?php
	}
	
	function getPath() {
		global $wgResourceLoaderUrl;
		return str_replace( 'ResourceLoader.php', '', $wgResourceLoaderUrl );
	}
	
	function outputIFrame( ){
		//die( '<pre>' . htmlspecialchars($this->getVideoHTML()) );
		// Check for plugins ( can overide output) 
		$this->checkIframePlugins();
		
		$this->setIFrameHeaders();
?>
<!DOCTYPE html>
<html>
	<head>
        
		<script type="text/javascript"> /*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/ 
		</script>
		<?php echo $this->outputIframeHeadCss(); ?>
	</head>
	<body>	
		<?php 
		// Check if the object should be writen by javascript ( instead of outputing video tag and player pay load )
		if( $this->getResultObject()->isJavascriptRewriteObject() ) {
			echo $this->getFlashEmbedHTML();
		} else {
			if( $this->getResultObject()->isPlaylist() ){ 
				echo $this->getPlaylistWraper( 
					// Get video html with a default playlist video size ( we can adjust it later in js )
					// iOS needs display type block: 
					$this->getVideoHTML( $this->getPlaylistPlayerSizeCss() . ';display:block;' )
				);
			} else {
				// For the actual video tag we need to use a document.write since android dies 
				// on some video tag properties
				?>
				<script type="text/javascript">
					function getViewPortSize(){
						var w;
						var h;
						// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
						if (typeof window.innerWidth != 'undefined'){
						      w = window.innerWidth,
						      h = window.innerHeight
						}
						// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
						else if (typeof document.documentElement != 'undefined'
							&& typeof document.documentElement.clientWidth !=
							'undefined' && document.documentElement.clientWidth != 0){
								w = document.documentElement.clientWidth,
								h = document.documentElement.clientHeight
						 } else {// older versions of IE
						 	w = document.getElementsByTagName('body')[0].clientWidth,
							h = document.getElementsByTagName('body')[0].clientHeight
						 }
						 return { 'w': w, 'h': h };
					}
					var videoTagHTML = <?php echo json_encode( $this->getVideoHTML( $this->getPlaylistPlayerSizeCss() ) ) ?>;
					var ua = navigator.userAgent
					// Android can't handle position:absolute style on video tags
					if( ua.indexOf('Android' ) !== -1 ){
						// Also android does not like "type" on source tags
						videoTagHTML= videoTagHTML.replace(/type=\"[^\"]*\"/g, '');
						// Android 4.0.X issues with fixed position
						if ( ua.indexOf( 'Android 4.0' ) ) {
							document.getElementsByTagName('body')[0].style.cssText = 'position: static';
						}
					} 
					
					// IE < 8  does not handle class="persistentNativePlayer" very well:
					if( ua.indexOf("MSIE ")!== -1 
							&&  
						parseFloat( ua.substring( ua.indexOf("MSIE ") + 5, ua.indexOf(";", ua.indexOf("MSIE ") ) )) <= 8
					) {
						videoTagHTML = videoTagHTML.replace( /class=\"persistentNativePlayer\"/gi, '' );
					}
					
					var size = getViewPortSize();
					styleValue = 'display: block;width:' + size.w + 'px;height:' + size.h + 'px;';
					
					videoTagHTML = videoTagHTML.replace(/style=\"\"/, 'style="' + styleValue + '"');
					document.write( videoTagHTML );
				</script>
				<?php
			} 
		}
		?>
		<script type="text/javascript">
			// In same page iframe mode the script loading happens inline and not all the settings get set in time
			// its critical that at least EmbedPlayer.IsIframeServer is set early on. 
			window.preMwEmbedConfig = {};
			window.preMwEmbedConfig['EmbedPlayer.IsIframeServer'] = true;
		</script>
		<!--  Add the mwEmbedLoader.php -->
		<script src="<?php echo $this->getMwEmbedLoaderLocation() ?>" type="text/javascript"></script>
		<!-- Add the kaltura ui logic as inline script: --> 
		<script type="text/javascript"><?php
			$uiConfJ = new mweApiUiConfJs();
			echo $uiConfJ->getUserAgentPlayerRules();
		?></script>
		<script type="text/javascript" >
			// Insert JSON support if in missing ( IE 7, 8 )
			if( typeof JSON == 'undefined' ){ 
				document.write(unescape("%3Cscript src='<?php echo $this->getPath(); ?>/libraries/json/json2.js' type='text/javascript'%3E%3C/script%3E"));
			}
		</script>
		<script type="text/javascript">
			// IE has out of order stuff execution... we have a pooling funciton to make sure mw is ready before we procceed. 
			var waitForMwCount = 0;
			var waitforMw = function( callback ){
				if( window['mw'] ){
					callback();
					return ;
				}
				setTimeout(function(){ 
					waitForMwCount++;
					if(  waitForMwCount < 1000 ){
						waitforMw( callback );
					} else {
						console.log("Error in loading mwEmbedLodaer");
					}
				}, 10 );
			};
			waitforMw( function(){
				<?php 
					global $wgAllowCustomResourceIncludes;
					if( $wgAllowCustomResourceIncludes && $this->getCustomPlayerIncludesJSON() ){
						echo 'mw.setConfig( \'Mw.CustomResourceIncludes\', '. $this->getCustomPlayerIncludesJSON() .' );';
					}
				?>
				
				// Parse any configuration options passed in via hash url more reliable than window['parent']
				try{
					if( window['parent'] && window['parent']['preMwEmbedConfig'] ){ 
						// Grab config from parent frame:
						mw.setConfig( window['parent']['preMwEmbedConfig'] );
						// Set the "iframeServer" to the current domain ( do not include hash tag )
						mw.setConfig( 'EmbedPlayer.IframeParentUrl', document.URL.replace(/#.*/, '' ) ); 
					}
				} catch( e ) {
					// could not get config from parent javascript scope try hash string:
					var hashString = document.location.hash;
					try{
						var hashObj = JSON.parse(
							unescape( hashString.replace( /^#/, '' ) )
						);
						if( hashObj && hashObj.mwConfig ){
							mw.setConfig( hashObj.mwConfig );
						}
					} catch( e ) {
						// error could not parse hash tag ( run with default config )
					}
				}

				mw.setConfig('KalturaSupport.PlayerConfig', <?php echo json_encode( $this->getResultObject()->getPlayerConfig() ); ?> );
	
				// We should first read the config for the hashObj and after that overwrite with our own settings
				// The entire block below must be after mw.setConfig( hashObj.mwConfig );
	
				// Don't do an iframe rewrite inside an iframe
				mw.setConfig('Kaltura.IframeRewrite', false );
	
				// Set a prepend flag so its easy to see whats happening on client vs server side of the iframe:
				mw.setConfig('Mw.LogPrepend', 'iframe:');
	
				// Don't rewrite the video tag from the loader ( if html5 is supported it will be
				// invoked below and respect the persistant video tag option for iPad overlays )
				mw.setConfig( 'Kaltura.LoadScriptForVideoTags', false );
	
				// Don't wait for player metada for size layout and duration Won't be needed since
				// we add durationHint and size attributes to the video tag
				mw.setConfig( 'EmbedPlayer.WaitForMeta', false );
	
				// Add Packaging Kaltura Player Data ( JSON Encoded )
				mw.setConfig( 'KalturaSupport.IFramePresetPlayerData', <?php echo $this->getResultObject()->getJSON(); ?>);

				mw.setConfig('EmbedPlayer.IframeParentPlayerId', '<?php echo $this->getIframeId()?>' );			
				
				// Set uiConf global vars for this player ( overides iframe based hash url config )
				<?php 
					echo $this->getCustomPlayerConfig();
				?>
				// Remove the fullscreen option if we are in an iframe: 
				if( mw.getConfig('EmbedPlayer.IsFullscreenIframe') ){
					mw.setConfig('EmbedPlayer.EnableFullscreen', false );
				} else {
					// If we don't get a 'EmbedPlayer.IframeParentUrl' update fullscreen to pop-up new 
					// window. ( we won't have the iframe api to resize the iframe ) 
					if( mw.getConfig('EmbedPlayer.IframeParentUrl') === null ){
						mw.setConfig( "EmbedPlayer.NewWindowFullscreen", true ); 
					}
				}

				<?php if( ! $this->getResultObject()->isJavascriptRewriteObject() ) { ?>
				// Setup required properties: 
				var flashEmbedHTML = <?php echo json_encode( $this->getFlashEmbedHTML()); ?>;
				// Setup player
				var playerConfig = mw.getConfig( 'KalturaSupport.PlayerConfig' );
				var playerId = mw.getConfig( 'EmbedPlayer.IframeParentPlayerId');

				var removeElement = function( elemId ) {
					if( document.getElementById( elemId ) ){
						try{
							var el = document.getElementById( elemId );
							el.parentNode.removeChild(el);
						}catch(e){
							// failed to remove element
						}
					}
				};

				if( kWidget.isUiConfIdHTML5( playerConfig.uiConfId ) || !( kWidget.supportsFlash() || mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )) ){
						// remove the no_rewrite flash object ( never used in rewrite )
						removeElement('kaltura_player_iframe_no_rewrite');

						// Load the mwEmbed resource library and add resize binding
						mw.ready(function(){
							// Try again to remove the flash player if not already removed: 
							$('#kaltura_player_iframe_no_rewrite').remove();

							var embedPlayer = $( '#' + playerId )[0];
							// Try to seek to the IframeSeekOffset time:
							if( mw.getConfig( 'EmbedPlayer.IframeCurrentTime' ) ){
								embedPlayer.currentTime = mw.getConfig( 'EmbedPlayer.IframeCurrentTime' );					
							}
							// Maintain play state for html5 browsers
							if( mw.getConfig('EmbedPlayer.IframeIsPlaying') ){
								embedPlayer.play();
							}


							function getWindowSize(){
								return {
									'width' : $( window ).width(),
									'height' : $( window ).height()
								};
							};
							function doResizePlayer(){
								var embedPlayer = $( '#' + playerId )[0];						
								embedPlayer.resizePlayer( getWindowSize() );
							};

							// Bind window resize to reize the player:
							$( window ).resize( doResizePlayer );

							// Resize the player per player on ready
							if( mw.getConfig('EmbedPlayer.IsFullscreenIframe') ){
								doResizePlayer();
							}
						});
				} else {
					// Remove the video tag and output a clean "object" or file link
					// ( if javascript is off the child of the video tag so would be played,
					//  but rewriting gives us flexiblity in in selection criteria as
					// part of the javascript check kIsHTML5FallForward )
					// TODO: we should use kWidget.outputFlashObject instead and remove a lot of code from kalturaIframe.php
					removeElement( 'videoContainer' );
					// Write out the embed object
					document.write( flashEmbedHTML );
				}
				<?php } ?>
			});

		</script>
	</body>
</html>
<?php
	}
	/**
	 * Very simple error handling for now: 
	 */
	private function setError( $errorTitle ){
		$this->error = true;
	}
	// Check if there is a local iframe error or result object error
	private function isError( ){
		return ( $this->error || $this->getResultObject()->getError() );
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
		$this->setError( $errorTitle );
		
		// Send expire headers 
		// Note: we can't use normal iframeHeader method because it calls the kalturaResultObject
		// constructor that could be the source of the fatalError 
		$this->sendPublicHeaders( $wgKalturaErrorCacheTime );
		
		// clear the buffer
		$pageInProgress = ob_end_clean();
		
		// Re-start the output buffer: 
		if( ! ob_start("ob_gzhandler") ) ob_start();
		
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
		<div class="error"><?php
			if( $errorTitle ){
				echo '<h2>' . htmlspecialchars( $errorTitle ) . '</h2>';
			}
			// Presently errors can have html foramting ( not ideal )
			// TODO refactor to have error title and error message arguments
			echo htmlspecialchars( $errorMsg );
		?></div>
	</body>
</html><?php
		// TODO clean up flow ( should not have two checks for callback )
		if( isset( $_REQUEST['callback']  )) {
			// get the output buffer:
			$out = ob_get_contents();
			ob_end_clean();
			// Re-start the output buffer: 
			if( ! ob_start("ob_gzhandler") ) ob_start();
			header('Content-type: text/javascript' );
			echo htmlspecialchars( $_REQUEST['callback'] ) . '(' . 
				json_encode( array( 'content' => $out ) ) . ');';
		} 

		ob_end_flush();
		// Iframe error exit
		exit( 1 );
	}
}