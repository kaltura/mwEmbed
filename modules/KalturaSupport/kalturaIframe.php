<?php
/**
 * KalturaIframe support
 *
 */

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server, something maybe broken or server is under high load. Please try again.");

// Setup the kalturaIframe
global $wgKalturaIframe;
$wgKalturaIframe = new kalturaIframe();

// Do kalturaIframe video output:

// Start output buffering to 'catch errors' and override output
if( ! ob_start("ob_gzhandler") ) ob_start();
$wgKalturaIframe->outputIFrame();
ob_end_flush();

/**
 * Kaltura iFrame class:
 */
class kalturaIframe {
	var $resultObject = null; // lazy init 
	var $debug = false;
	var $error = false;
	var $playerError = false;
	var $uiConfXml = null; // lazy init
	
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

	function getPlayEventUrl() {
		global $wgKalturaServiceUrl, $wgKalturaServiceBase;
		$param = array(
			'action' => 'collect',
			'apiVersion' => '3.0',
			'clientTag' => 'html5',
			'expiry' => '86400',
			'format' => 9, // 9 = JSONP format
			'ignoreNull' => 1,
			'ks' => $this->getResultObject()->getKS()
		);

		$eventSet = array(
			'eventType' =>	3, // PLAY Event
			'clientVer' => 0.1,
			'currentPoint' => 	0,
			'duration' =>	0,
			'eventTimestamp' => time(),
			'isFirstInSession' => 'false',
			'objectType' => 'KalturaStatsEvent',
			'partnerId' =>	$this->getResultObject()->getPartnerId(),
			'sessionId' =>	$this->getResultObject()->getKS(),
			'uiconfId' => 0,
			'seek'	 =>  'false',
			'entryId'   =>   $this->getResultObject()->getEntryId(),
		);
		foreach( $eventSet as $key=> $val){
			$param['event:' . $key ] = $val;
		}
		ksort( $param );
		// Get the signature:
		$sigString = '';
		foreach( $param as $key => $val ){
			$sigString.= $key . $val;
		}
		$param['kalsig'] = md5( $sigString );
		$requestString =  http_build_query( $param );

		return $wgKalturaServiceUrl . $wgKalturaServiceBase . 'stats&' . $requestString;
	}

	// Returns a simple image with a direct link to the asset
	private function getFileLinkHTML(){
		try {
			$sources =  $this->getResultObject()->getSources();
			// If no sources are found use the error video source: 
			if( count( $sources ) == 0 ){
				$sources = $this->getResultObject()->getErrorVideoSources();
			}
			$flavorUrl = $this->getResultObject()->getSourceForUserAgent( $sources );
		} catch ( Exception $e ){
			$this->fatalError( $e->getMessage() );
		}
		// The outer container:
		$o='<div id="directFileLinkContainer">';
			// TODO once we hook up with the kaltura client output the thumb here:
			// ( for now we use javascript to append it in there )
			$o.='<div id="directFileLinkThumb" ></div>';
			$o.='<a href="' . $flavorUrl . '" id="directFileLinkButton" target="_new"></a>';
		$o.='</div>';

		return $o;
	}

	private function getVideoHTML( ){
		global $wgKalturaCDNUrl;
		$videoTagMap = array(
			'entry_id' => 'kentryid',
			'uiconf_id' => 'kuiconfid',
			'wid' => 'kwidgetid',
			'autoplay' => 'autoplay',
		);
		// Check if we have flashvar: loadThumbnailWithKs, if so load the thumbnail with KS
		$ksParam = '';
		if( isset( $_REQUEST['flashvars'] ) && is_array( $_REQUEST['flashvars'] ) && 
				isset( $_REQUEST['flashvars']['loadThumbnailWithKs']) ) {
			$ksParam = '?ks=' . $this->getResultObject()->getKS();
		}
		// We should grab the thumbnail url from our entry to get the latest version of the thumbnail
		$posterUrl = $this->getResultObject()->getThumbnailUrl() . '/height/480' . $ksParam;
		
		try {
			$sources = $this->getResultObject()->getSources();
			// If no sources get the black sources:
			if( count( $sources ) == 0 ) {
				$this->playerError = "No mobile sources found";
				$sources = $this->getResultObject()->getBlackVideoSources();
			}
		} catch ( Exception $e ){
			// xxx log an empty entry id lookup!
			$this->fatalError( $e->getMessage() );
		}

		// Add default video tag with 100% width / height
		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		$o = "\n" .'<video class="persistentNativePlayer" ' .
			'poster="' . htmlspecialchars( $posterUrl ) . '" ' .
			'id="' . htmlspecialchars( $this->getIframeId() ) . '" ' .
			'style="position:absolute;width:100%;height:100%" ';

		$urlParams = $this->getResultObject()->getUrlParameters();
		
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
		if( $this->playerError  !== false ){
			// TODO should move this to i8ln keys instead of raw msgs
			$o.= ' data-playerError="' . htmlentities( $this->playerError ) . '" ';
		}
		
		
		//Close the open video tag
		$o.='>';

		// Output each source as a child element ( for javascript off browsers to have a chance
		// to playback the content
		foreach( $sources as $source ){
			$o.="\n" .'<source ' .
					'type="' . htmlspecialchars( $source['type'] ) . '" ' .
					'src="' . htmlspecialchars(  $source['src'] ) . '" '.
					'data-flavorid="' . htmlspecialchars( $source['data-flavorid'] ) . '" '.
				'></source>';
		}

		// To be on the safe side include the flash player and
		// direct file link as a child of the video tag
		// ( if javascript is "off" and they dont have video tag support for example )
		$o.= $this->getFlashEmbedHTML(
			$this->getFileLinkHTML(), 
			'kaltura_player_iframe_no_rewrite'
		);


		$o.= "\n" .'</video>';
		return $o;
	}
	/**
	 * Get Flash embed code with default flashvars:
	 * @param childHtml Html string to set as child of object embed
	 */	
	private function getFlashEmbedHTML( $childHTML = '', $idOverride = false ){		
		return 	$this->getPreFlashVars( $idOverride) . 
				$this->getFlashVarsString() . 
				$this->getPostFlashVars( $childHTML );
	}
	private function getFlashVarsString(){
		// output the escaped flash vars from get arguments
		$s = 'externalInterfaceDisabled=false';
		if( isset( $_REQUEST['flashvars'] ) && is_array( $_REQUEST['flashvars'] ) ){
			foreach( $_REQUEST['flashvars'] as $key=>$val ){
				$s.= '&' . htmlspecialchars( $key ) . '=' . urlencode( $val );
			}
		}
		return $s;
	}
	/**
	 * Get custom player includes for css and javascript
	 */
	private function getCustomPlayerIncludesJSON(){
		if( ! $this->getResultObject()->getUiConf() ){
			return false;
		}
		$xml = new SimpleXMLElement( $this->getResultObject()->getUiConf() );
		$resourceIncludes = array();
		foreach ($xml->uiVars->var as $var ){
			if( $var['key'] != 'HTML5PluginUrl' && $var['key'] != 'HTML5PlayerCssUrl'){
				continue;
			}
			
			$resource = array( 'src'=> htmlspecialchars(  $var['value'] ) );
			if( $var['key'] == 'HTML5PluginUrl' ){
				$resource['type'] = 'js';
			}
			if( $var['key'] == 'HTML5PlayerCssUrl'){
				$resource['type'] = 'css';
			}
			$resourceIncludes[] = $resource;
		}
		return json_encode( $resourceIncludes );
	}
	/** 
	 * Gets a series of mw.setConfig calls set via the uiConf of the kaltura player 
	 * */
	private function getCustomPlayerConfig(){
		if( ! $this->getResultObject()->getUiConf() ){
			return '';
		}
		$o = '';
		$xml = $this->getUiConfXML();
		foreach ($xml->uiVars->var as $var ){
			if( isset( $var['key'] ) && isset( $var['value'] ) 
				&& $var['key'] != 'HTML5PluginUrl' && $var['key'] != 'HTML5PlayerCssUrl'
				&& $var['key'] != 'Mw.CustomResourceIncludes' 
			){
				$o.="mw.setConfig('" . htmlspecialchars( addslashes( $var['key'] ) ) . "', ";
				// check for boolean attributes: 
				if( $var['value'] == 'false' || $var['value'] == 'true' ){
					$o.=  $var['value'];
				}else {
					$o.= "'" . htmlspecialchars( addslashes( $var['value'] ) ) . "'";
				}
				$o.= ");\n";
			}
		}
		return $o;
	}
	private function getUiConfXML(){
		global $wgKalturaIframe;
		if( !$this->uiConfXml ){
			if( ! $this->getResultObject()->getUiConf() ){
				return ;
			}
			$this->uiConfXml = new SimpleXMLElement( $this->getResultObject()->getUiConf() );
		}
		return $this->uiConfXml;
	}
	private function checkIframePlugins(){
		$xml = $this->getUiConfXML();
		if( ! $xml )
			return ;
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
		global $wgKalturaServiceUrl;
		$swfUrl = $wgKalturaServiceUrl . '/index.php/kwidget';
		// pass along player attributes to the swf:
		$urlParams = $this->getResultObject()->getUrlParameters();	
		foreach($urlParams as $key => $val ){
			if( $val != null && $key != 'flashvars' ){
				$swfUrl.='/' . $key . '/' . $val;
			}
		}
		return $swfUrl;
	}
	
	private function getPreFlashVars( $idOverride = false ){
		// Check if a playlist
		$playerName = ( $this->getResultObject()->isPlaylist() ) ? 'kaltura_playlist' : 'kaltura_player_iframe_no_rewrite';
		
		$playerId = ( $idOverride )? $idOverride :  $this->getIframeId();
		
		return '<object id="' . htmlspecialchars( $playerId ) . '" name="' . $playerName . '" ' .
				'type="application/x-shockwave-flash" allowFullScreen="true" '.
				'allowNetworking="all" allowScriptAccess="always" height="100%" width="100%" style="height:100%;width:100%" '.
				'xmlns:dc="http://purl.org/dc/terms/" '.
				'xmlns:media="http://search.yahoo.com/searchmonkey/media/" '.
				'rel="media:video" '.
				'resource="' . htmlspecialchars( $this->getSwfUrl() ) . '" '.
				'data="' . htmlspecialchars( $this->getSwfUrl() ) . '"> '.
				'<param name="allowFullScreen" value="true" /><param name="allowNetworking" value="all" />' .
				'<param name="allowScriptAccess" value="always" /><param name="bgcolor" value="#000000" />'.
				'<param name="flashVars" value="';
	}
	
	private function getPostFlashVars( $childHTML = '' ){
			return '" />'.
				'<param name="movie" value="' . htmlspecialchars( $this->getSwfUrl() ) . '" />'.
					$childHTML .
				'</object>';
	}
	
	/**
	 * void function to set iframe content headers
	 */
	private function setIFrameHeaders(){
		global $wgKalturaUiConfCacheTime;

		// Set relevent expire headers:
		if( $this->getResultObject()->isCachedOutput() ){
			header( 'Pragma: public' );
			// Cache for $wgKalturaUiConfCacheTime
			header( "Expires: " . gmdate( "D, d M Y H:i:s", time() + $wgKalturaUiConfCacheTime ) . " GM" );
		} else {
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Pragma: no-cache");
			header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		}
	}
	
	/**
	 * Get the location of the mwEmbed library
	 */
	private function getMwEmbedLoaderLocation(){
		global $wgMwEmbedPathUrl, $wgKalturaCDNUrl;
		$loaderPath = $wgMwEmbedPathUrl . 'mwEmbedLoader.php';
		
		$versionParam = '';
		$urlParam = $this->getResultObject()->getUrlParameters();
		if( isset( $urlParam['urid'] ) ){
			$versionParam = '?urid=' . htmlspecialchars( $urlParam['urid'] );
		}
		
		$xml = $this->getUiConfXML();
		if( $xml && isset( $xml->layout ) && isset( $xml->layout[0] ) ){
			foreach($xml->layout[0]->attributes() as $name => $value) {
				if( $name == 'html5_url' ){
					if( $value[0] == '/' ){
						$loaderPath = $wgKalturaCDNUrl	 . $value;
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
		global $wgMwEmbedPathUrl;
		?>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>Kaltura Embed Player iFrame</title>
		<style type="text/css">
			body {
				margin:0;
				position:fixed;
				top:0px;
				left:0px;
				bottom:0px;
				right:0px;
				width: 100%;
				height: 100%;
				overflow:hidden;
				background: #000;
				color: #fff;
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
					background: url( '<?php echo $wgMwEmbedPathUrl ?>skins/common/images/loading_ani.gif');
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
					height: 100%;
				}
				#directFileLinkContainer{
					position:abolute;
					top:0px;
					left:0px;
					height:100%;
					width:100%
				}
				/* Should allow this to be overided */
				#directFileLinkButton {
					background: url( '<?php echo $wgMwEmbedPathUrl ?>skins/common/images/player_big_play_button.png');
					width: 70px;
					height: 53px;
					position: absolute;
					top:50%;
					left:50%;
					margin: -26px 0 0 -35px;
				}
				#directFileLinkThumb{
					position: absolute;
					top:0px;
					left:0px;
					width: 100%;
					height: 100%;
				}
			<?php 
		}
		?>
			</style>
		<?php
	}
	function outputIFrame( ){
		global $wgMwEmbedPathUrl;
		
		// Check for plugins ( can overide output) 
		$this->checkIframePlugins();
		
		$this->setIFrameHeaders();
?>
<!DOCTYPE html>
<html>
	<head>
		<?php echo $this->outputIframeHeadCss(); ?>
		<script type="text/javascript">
			// Insert the html5 kalturaLoader script
			document.write(unescape("%3Cscript src='<?php echo $this->getMwEmbedLoaderLocation() ?>' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
			// Insert JSON support if in missing ( IE 7, 8 )
			if( typeof JSON == 'undefined' ){ 
				document.write(unescape("%3Cscript src='<?php echo $wgMwEmbedPathUrl ?>/libraries/json/json2.js' type='text/javascript'%3E%3C/script%3E"));
			}
		</script>
		
		<script type="text/javascript">
			<?php 
				global $wgAllowCustomResourceIncludes;
				if( $wgAllowCustomResourceIncludes && $this->getCustomPlayerIncludesJSON() ){
					echo 'mw.setConfig( \'Mw.CustomResourceIncludes\', '. $this->getCustomPlayerIncludesJSON() .' );';
				}
				// Set custom global vars for this player: 
				echo $this->getCustomPlayerConfig();
			?>
			// Don't do an iframe rewrite inside an iframe!
			mw.setConfig( 'Kaltura.IframeRewrite', false );

			// Set a prepend flag so its easy to see whats happening on client vs server side of the iframe:
			mw.setConfig('Mw.LogPrepend', 'iframe:' );

			// Don't rewrite the video tag from the loader ( if html5 is supported it will be
			// invoked bellow and respect the persistant video tag option for iPad overlays )
			mw.setConfig( 'Kaltura.LoadScriptForVideoTags', false );

			// Don't wait for player metada for size layout and duration Won't be needed since
			// we add durationHint and size attributes to the video tag
			mw.setConfig( 'EmbedPlayer.WaitForMeta', false );

			// Add Packaging Kaltura Player Data ( JSON Encoded )
			mw.setConfig( 'KalturaSupport.IFramePresetPlayerData', <?php echo $this->getResultObject()->getJSON(); ?>);

			// Get the flashvars object:
			var flashVarsString = '<?php echo $this->getFlashVarsString() ?>';
			var fvparts = flashVarsString.split('&');
			var flashvarsObject = {};
			for(var i=0;i<fvparts.length;i++){
				var kv = fvparts[i].split('=');
				if( kv[0] && kv[1] ){
					flashvarsObject[ unescape( kv[0] ) ] = unescape( kv[1] );
				}
			}
			mw.setConfig( 'KalturaSupport.IFramePresetFlashvars', flashvarsObject );

			// Parse any configuration options passed in via hash url:
			var hashString = document.location.hash;
			if( hashString ){
				var hashObj = JSON.parse(
						decodeURIComponent( hashString.replace( /^#/, '' ) )
					);
				if( hashObj.mwConfig ){
					mw.setConfig( hashObj.mwConfig );
				}
				if( hashObj.playerId ){
					mw.setConfig('EmbedPlayer.IframeParentPlayerId', hashObj.playerId );
				}
			}
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
			// For testing limited capacity browsers
			//var kIsHTML5FallForward = function(){ return false };
			//var kSupportsFlash = function(){ return false };

			// Don't do an iframe rewrite inside an iframe!
			mw.setConfig( 'Kaltura.IframeRewrite', false );

			// Identify the player as an iframe server
			mw.setConfig( "EmbedPlayer.IsIframeServer", true );

			<?php 
				if( !$this->getResultObject()->isPlaylist() ){
					echo $this->javascriptPlayerLogic();
				}
			?>
		</script>
	</head>
	<body>	
		<?php 
		if( $this->getResultObject()->isPlaylist() ){
			echo "<!-- Playlist is rewriteen from flash object ( no standard html5 representation atm ) -->\n";
			// if playlist just output the playlist object and let javascript rewrite it:
			echo $this->getFlashEmbedHTML() . "\n";
		}else {
			?>
			<div id="videoContainer" >
				<div id="iframeLoadingSpinner" class="loadingSpinner"></div>
				<?php echo $this->getVideoHTML(); ?>
			</div>
			<?php 
		}
		?>
	</body>
</html>
<?php
	}
	private function javaScriptPlayerLogic(){
		?>
		if( kIsHTML5FallForward() ){
				// Load the mwEmbed resource library and add resize binding
				mw.ready(function(){
					// remove the no_rewrite flash object:
					$j('#kaltura_player_iframe_no_rewrite').remove();
				
					var embedPlayer = $j( '#<?php echo htmlspecialchars( $this->getIframeId() )?>' ).get(0);
					// Try to seek to the IframeSeekOffset time:
					if( mw.getConfig( 'EmbedPlayer.IframeCurrentTime' ) ){
						embedPlayer.currentTime = mw.getConfig( 'EmbedPlayer.IframeCurrentTime' );					
					}
					// this unfortunatly won't work on iOS but will support play state for html5 browsers
					if( mw.getConfig('EmbedPlayer.IframeIsPlaying') ){
						embedPlayer.play();
					}
					// Bind window resize to reize the player:
					$j( window ).resize( function(){
						$j( '#<?php echo htmlspecialchars( $this->getIframeId() )?>' )
							.get(0).resizePlayer({
								'width' : $j(window).width(),
								'height' : $j(window).height()
							});
					});				    
				});
		} else {
			// Remove the video tag and output a clean "object" or file link
			// ( if javascript is off the child of the video tag so would be played,
			//  but rewriting gives us flexiblity in in selection criteria as
			// part of the javascript check kIsHTML5FallForward )
			if( document.getElementById( 'videoContainer' ) ){
				document.getElementById( 'videoContainer' ).innerHTML = "";
			}
			
			if( kSupportsFlash() ||  mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){				
				// Write out the embed object
				document.write('<?php echo $this->getFlashEmbedHTML() ?>' );
				
				// Load server side bindings for kdpServer
				kLoadJsRequestSet( ['window.jQuery', 'mwEmbed', 'mw.style.mwCommon', '$j.postMessage', 'kdpServerIFrame', 'JSON' ] );
			} else {
				
				// Last resort just provide an image with a link to the file
				// NOTE we need to do some platform checks to see if the device can
				// "actually" play back the file and or switch to 3gp version if nessesary.
				// also we need to see if the entryId supports direct download links
				document.write('<?php echo $this->getFileLinkHTML()?>');

				var thumbSrc = kGetEntryThumbUrl({
					'entry_id' : '<?php echo $this->getResultObject()->getEntryId() ?>',
					'partner_id' : '<?php echo $this->getResultObject()->getPartnerId() ?>',
					'height' : ( document.body.clientHeight )? document.body.clientHeight : '300',
					'width' : ( document.body.clientHeight )? document.body.clientHeight : '400'
				});
				document.getElementById( 'directFileLinkThumb' ).innerHTML =
					'<img style="width:100%;height:100%" src="' + thumbSrc + '" >';

				window.kCollectCallback = function(){ return ; }; // callback for jsonp

				document.getElementById('directFileLinkButton').onclick = function() {
					kAppendScriptUrl( '<?php echo $this->getPlayEventUrl() ?>' + '&callback=kCollectCallback' );
					return true;
				};
			}
		}
		<?php 
	}
	/**
	 * Very simple error handling for now: 
	 */
	private function setError( $errorTitle ){
		$this->error = true;
	}
	private function isError( ){
		return $this->error;
	}
	/**
	 * Output a fatal error and exit with error code 1
	 */
	private function fatalError( $errorTitle, $errorMsg = false ){
		// check for multi line errorTitle array: 
		if( strpos( $errorTitle, "\n" ) !== false ){
			list( $errorTitle, $errorMsg) = explode( "\n", $errorTitle);
		};
		
		$this->setError( $errorTitle );
		
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
		ob_end_flush();
		// Iframe error exit
		exit( 1 );
	}
}
?>