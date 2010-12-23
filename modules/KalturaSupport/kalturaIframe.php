<?php
/**
 * kalturaIframe support
 *
 */

// Some predefined constants ( need to load these from config.. 
// and or allow configuration payload to be passed in via iframe message.  
define( 'KALTURA_SERVICE_URL', 'http://www.kaltura.com/' );
define( 'KALTURA_CDN_URL', 'http://cdn.kaltura.com' );
define( 'KALTURA_SERVICE_BASE', '/api_v3/index.php?');
define( 'KALTURA_MWEMBED_PATH', str_replace( 'mwEmbedFrame.php', '', $_SERVER['SCRIPT_NAME'] ) );
define( 'KALTURA_UICONF_CACHE_TIME', 600 );

// Setup the kalturaIframe
$mykalturaIframe = new kalturaIframe();

// Do kalturaIframe video output:
$mykalturaIframe->outputIFrame();

// Define the KalturaFlavorAsset that the api will blindly set as a class 
class KalturaFlavorAsset {};
class KalturaEntryContextDataResult {};
/**
 * Kaltura iFrame class:
 */
class kalturaIframe {
	/**
	 * Variables set by the Frame request:
	 */
	private $playerAttributes = array(
		'cache_st' => null,				
		'wid' => null,
		'uiconf_id' => null,
		'entry_id' => null
	);
	var $playerIframeId = 'iframeVid';
	var $debug = false;
	var $error = false;
	var $resultObj = null;
	
	// When used in direct source mode the source asset.
	// NOTE: can be an array of sources in cases of "many" sources set
	var $sources = array();

	function __construct(){
		//parse input:
		$this->parseRequest();
	}
	
	// Parse the embedFrame request and sanitize input
	private function parseRequest(){		
		// Support /key/value request type:
		  
		if( isset( $_SERVER['PATH_INFO'] ) ){		
			$urlParts = explode( '/', $_SERVER['PATH_INFO'] );
			foreach( $urlParts as $inx => $urlPart ){
				foreach( $this->playerAttributes as $attributeKey => $na){
					if( $urlPart == $attributeKey && isset( $urlParts[$inx+1] ) ){
						$_REQUEST[ $attributeKey ] = $urlParts[$inx+1];
					}
				}
			}
		}		
		// Check for player attributes:
		foreach( $this->playerAttributes as $attributeKey => $na){
			if( isset( $_REQUEST[ $attributeKey ] ) ){
				$this->playerAttributes[ $attributeKey ] = htmlspecialchars( $_REQUEST[$attributeKey] );
			}
		}

		// Check for debug flag
		if( isset( $_REQUEST['debugKalturaPlayer'] ) || isset( $_REQUEST['debug'] ) ){
			$this->debug = true;
		}
				
		// Check for required config
		if( $this->playerAttributes['wid'] == null ){
			$this->error = 'Can not display player, missing widget id';
		}
	}
	
	// Load the kaltura library and grab the most compatible flavor 
	private function getFlavorSources(){
			
		// Check the access control before returning any source urls
		if( !$this->isAccessControlAllowed() ) {
			return array();
		}
		
		$resultObject =  $this->getResultObject();
		// add any web sources		
		$sources = array();

		// Check for error in getting flavor
		if( isset( $resultObject['flavors']['code'] ) ){
			switch(  $resultObject['flavors']['code'] ){
				case  'ENTRY_ID_NOT_FOUND':
					$this->error = "<h2>Entry Id not found</h2>" . htmlspecialchars( $resultObject['flavors']['message'] );
					break;
			}
			// @@TODO should probably refactor to use throw catch error system. 
			return array();
		}
		foreach( $resultObject['flavors'] as $KalturaFlavorAsset ){	


			$assetUrl =  KALTURA_CDN_URL .'/p/' . $this->getPartnerId() . '/sp/' . 
					$this->getPartnerId() . '00/flvclipper/entry_id/' . 
					$this->playerAttributes['entry_id'] . '/flavor/' . 	$KalturaFlavorAsset->id;
			if( strpos( $KalturaFlavorAsset->tags, 'iphone' ) !== false ){
				$sources['iphone'] = array(
					'src' => $assetUrl . '/a.mp4?novar=0',
					'type' => 'video/h264',
					'data-flavorid' => 'iPhone' 
				);
			};
			if( strpos( $KalturaFlavorAsset->tags, 'ipad' ) !== false ){
				$sources['ipad'] = array(
					'src' => $assetUrl  . '/a.mp4?novar=0',
					'type' => 'video/h264',
					'data-flavorid' => 'iPad' 
				);
			};
			if( $KalturaFlavorAsset->fileExt == 'ogg' || $KalturaFlavorAsset->fileExt == 'ogv' 
				|| $KalturaFlavorAsset->fileExt == 'oga' 
			){
				$sources['ogg'] = array(
					'src' => $assetUrl . '/a.ogg?novar=0',
					'type' => 'video/ogg',
					'data-flavorid' => 'ogg' 
				);
			};
			if( $KalturaFlavorAsset->fileExt == '3gp' ){
				$sources['3gp'] = array(
					'src' => $assetUrl . '/a.3gp?novar=0',
					'type' => 'video/3gp',
					'data-flavorid' => '3gp' 
				);
			};
		}
		return $sources;
	}
	
	private function getCacheDir(){
		global $mwEmbedRoot;
		$cacheDir = $mwEmbedRoot . '/includes/cache/iframecache';
		// make sure the dir exists: 
		if( ! is_dir( $cacheDir) ){
			@mkdir( $cacheDir, 0777, true );
		}
		return $cacheDir;
	}
	
	private function getResultObject(){
		// Check if we have a cached result object: 		
		if( $this->resultObj ){
			return $this->resultObj;
		}
		
		$cacheFile = $this->getCacheDir() . '/' . $this->getResultObjectCacheKey() . ".entry.txt";		
		$cacheLife = KALTURA_UICONF_CACHE_TIME;
			
		// Check modify time on cached php file
		$filemtime = @filemtime($cacheFile);  // returns FALSE if file does not exist
		if ( !$filemtime || filesize( $cacheFile ) === 0 || ( time() - $filemtime >= $cacheLife ) ){
			$this->resultObj = $this->getResultObjectFromApi();
		} else {
			$this->resultObj = unserialize( file_get_contents( $cacheFile ) );
		}
		// Test if the resultObject can be cached ( no access control restrictions ) 
		if( $this->isAccessControlAllowed() ){
			file_put_contents($cacheFile, serialize($this->resultObj  ) );
		}
		return $this->resultObj;
	}
	/**
	 * Returns a cache key for the result object based on Referer and partner id
	 */
	private function getResultObjectCacheKey(){		
		// Get a key based on partner id,  entry_id and ui_confand refer url: 
		$playerUnique = ( isset( $this->playerAttributes['entry_id'] ) ) ?  $this->playerAttributes['entry_id'] : '';
		$playerUnique .= ( isset( $this->playerAttributes['uiconf_id'] ) ) ?  $this->playerAttributes['uiconf_id'] : '';
		
		return $this->getPartnerId() . '_' . $playerUnique . '_' . substr( md5( $this->getReferer() ), 0, 10 );
	}
	
	function getResultObjectFromApi(){
		// Include the kaltura client
		include_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
		$client = $this->getClient();
		
		// @@todo support MultiRequest
		$client->startMultiRequest();
		try{			
			// NOTE this should probably be wrapped in a service class 
			$kparams = array();
			
			// sources
			$client->addParam( $kparams, "entryId",  $this->playerAttributes['entry_id'] );
			$client->queueServiceActionCall( "flavorAsset", "getByEntryId", $kparams ); 
			
			// access control	
			$client->addParam( $kparams, "contextDataParams",  array( 'referer' => $this->getReferer() ) );
			$client->queueServiceActionCall( "baseEntry", "getContextData", $kparams ); 		
			
			// Entry Meta
			$client->addParam( $kparams, "entryId",  $this->playerAttributes['entry_id'] );
			$client->queueServiceActionCall( "baseEntry", "get", $kparams ); 

			if($this->playerAttributes['uiconf_id']) {
				$client->addParam( $kparams, "id",  $this->playerAttributes['uiconf_id'] );
				$client->queueServiceActionCall( "uiconf", "get", $kparams ); 
			}
			$rawResultObject = $client->doQueue();
			$client->throwExceptionIfError($this->resultObj);
		} catch( Exception $e ){
			$this->error = "Error getting sources from server, something maybe broken or server is under high load. Please try again.";
			return array();
		}
				
		$resultObject = array(
			'flavors' 			=> 	$rawResultObject[0],
			'accessControl' 	=> 	$rawResultObject[1],
			'meta'				=>	$rawResultObject[2],			
			'entry_id'			=>	$this->playerAttributes['entry_id'],
			'partner_id'		=>	$this->getPartnerId(),		
			'ks' 				=> 	$this->getKS()
		);
		if( isset( $rawResultObject[3] ) && $rawResultObject[3]->confFile ){
			$resultObject[ 'uiconf_id' ] = $this->playerAttributes['uiconf_id'];
			$resultObject[ 'uiConf'] = $rawResultObject[3]->confFile;
		}
		return $resultObject;
	}
	
	function getReferer(){
		return ( isset( $_SERVER['HTTP_REFERER'] ) ) ? $_SERVER['HTTP_REFERER'] : 'http://www.kaltura.org/';
	}
	function getClient(){
		global $mwEmbedRoot;

		$cacheDir = $mwEmbedRoot . '/includes/cache';

		$cacheFile = $this->getCacheDir() . '/' . $this->getPartnerId() . ".ks.txt";
		$cacheLife = KALTURA_UICONF_CACHE_TIME; 
			
		$conf = new KalturaConfiguration( $this->getPartnerId() );
		$client = new KalturaClient( $conf );
		
		// Check modify time on cached php file
		$filemtime = @filemtime($cacheFile);  // returns FALSE if file does not exist
		if ( !$filemtime || filesize( $cacheFile ) === 0 || ( time() - $filemtime >= $cacheLife ) ){
		    $session = $client->session->startWidgetSession( $this->playerAttributes['wid'] );
		    $this->ks = $session->ks;
		    file_put_contents( $cacheFile,  $this->ks );
		} else {
		  	$this->ks = file_get_contents( $cacheFile );
		}
		// Set the kaltura ks and return the client
		$client->setKS( $this->ks );	
		
		return $client;
	}
	function getKS(){
		if(!isset($this->ks)){
			include_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
			$this->getClient();
		}
		return $this->ks;
	}
	
	function getPartnerId(){
		// Partner id is widget_id but strip the first character 
		return substr( $this->playerAttributes['wid'], 1 );
	}
	
	/**
	*  Set the player data array
	*/	
	function getPlayerData() {
		return json_encode( $playerData );
	}
	
	/**
	*  Access Control Handling
	*/	
	function isAccessControlAllowed() {
		$resultObject =  $this->getResultObject();
		$accessControl = $resultObject['accessControl'];
		// Checks if admin
		if($accessControl->isAdmin) {
			return true;
		}
		
		/* Domain Name Restricted */
		if($accessControl->isSiteRestricted) {
			$this->error = "<h2>Un authorized domain</h2>We're sorry, this content is only available on certain domains.";
			return false;
		}
		
		/* Country Restricted */
		if($accessControl->isCountryRestricted) {
			$this->error = "<h2>Un authorized country</h2>We're sorry, this content is only available on certain countries.";
			return false;
		}
		
		/* Session Restricted */
		if($accessControl->isSessionRestricted) {
			$this->error = "<h2>No KS where KS is required</h2>We're sorry, access to this content is restricted.";
			return false;
		}
		
		if($accessControl->isScheduledNow == null) {
			$this->error = "<h2>Out of scheduling</h2>We're sorry, this content is currently unavailable.";
			return false;
		}
		
		return true;
	}
	
	function getPlayEventUrl() {
		
		$param = array(
			'service' => 'stats',				
			'action' => 'collect',				
			'apiVersion' => '3.0',
			'clientTag' => 'html5',
			'expiry' => '86400',
			'format' => 9, // 9 = JSONP format
			'ignoreNull' => 1,			
			'ks' => $this->getKS() 
		);
		
		$eventSet = array(		
			'eventType' =>	3, // PLAY Event	
			'clientVer' => 0.1,
			'currentPoint' => 	0,
			'duration' =>	0,
			'eventTimestamp' => time(),			
			'isFirstInSession' => 'false',
			'objectType' => 'KalturaStatsEvent',
			'partnerId' =>	$this->getPartnerId(),		
			'sessionId' =>	$this->getKS(),
			'uiconfId' => 0,	
			'seek'	 =>  'false',
			'entryId'   =>   $this->playerAttributes['entry_id'],				
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
	
		return KALTURA_SERVICE_URL . KALTURA_SERVICE_BASE . $requestString;	
	}
	
	// Returns a simple image with a direct link to the asset
	// ( need to add uiConf configuration to allow or disallow this feature
	// ( maybe we tie it to the "download" option 
	private function getFileLinkHTML(){
		$sources = $this->getFlavorSources();
		// For now use the 3gp, iPhone, iPad, ogg ( in that order most device compatible to least)
		if( isset( $sources['iphone'] )) {
			$flavorUrl = $sources['iphone']['src'];
		} else if( isset( $sources['ipad'] ) ){
			$flavorUrl = $sources['ipad']['src'];
		} else if( isset( $sources['3gp'] ) ){
			$flavorUrl = $sources['3gp']['src'];
		} else if(  isset( $sources['ogg'] ) ){
			$flavorUrl = $sources['ogg']['src'];
		} else {
			// Throw an exception ( no web streams ) 
			$this->error = 'No web streams available, please check your enabled flavors';
			return ;
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
		$videoTagMap = array(			
			'entry_id' => 'kentryid',
			'uiconf_id' => 'kuiconfid',
			'wid' => 'kwidgetid'
		);
		$posterUrl =  KALTURA_CDN_URL . '/p/' . $this->getPartnerId() . '/sp/' .
						$this->getPartnerId() . '00/thumbnail/' .
						'entry_id/' .  $this->playerAttributes['entry_id'] .
						'/height/480';
		$sources = $this->getFlavorSources();
		
		// if we hvae no sources do not output the video tag: 
		if( count( $sources ) == 0 ){
			return ;
		}
		// Add default video tag with 100% width / height 
		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		
		$o = "\n" .'<video class="persistentNativePlayer" ' .
			'poster="' . htmlspecialchars( $posterUrl ) . '" ' . 
			'id="' . htmlspecialchars( $this->playerIframeId ) . '" ' . 			
			'style="width:100%;height:100%" ';
		
		// Add any additional attributes: 
		foreach( $this->playerAttributes as $key => $val ){
			if( isset( $videoTagMap[ $key ] ) && $val != null ) {			
				$o.= ' ' . $videoTagMap[ $key ] . '="' . htmlspecialchars( $val ) . '"';
			}
		}
		//Close the video tag
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
			$this->getFileLinkHTML()
		); 				
		
		
		$o.= "\n" .'</video>';
		return $o;
	}
	 
	private function getFlashEmbedHTML( $childHTML = '' ){
		$swfUrl = KALTURA_SERVICE_URL . '/index.php/kwidget';		
		foreach($this->playerAttributes as $key => $val ){
			if( $val != null ){
				$swfUrl.='/' . $key . '/' . $val;
			}
		}		
		return '<object id="kaltura_player" name="kaltura_player" ' .
				'type="application/x-shockwave-flash" allowFullScreen="true" '. 
				'allowNetworking="all" allowScriptAccess="always" style="height:100%;width:100%" '.
				'xmlns:dc="http://purl.org/dc/terms/" '. 
				'xmlns:media="http://search.yahoo.com/searchmonkey/media/" '. 
				'rel="media:video" '. 
				'resource="' . htmlspecialchars( $swfUrl ) . '" '. 
				'data="' . htmlspecialchars( $swfUrl ) . '"> '.				
				'<param name="allowFullScreen" value="true" /><param name="allowNetworking" value="all" />' .
				'<param name="allowScriptAccess" value="always" /><param name="bgcolor" value="#000000" />'.
				'<param name="flashVars" value="streamerType=rtmp&streamerUrl=rtmp://rtmpakmi.kaltura.com/ondemand&rtmpFlavors=1&&" />'.
				'<param name="movie" value="' . htmlspecialchars( $swfUrl ) . '" />'.
				$childHTML . 
			'</object>';
	}
	
	function outputIFrame( ){	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>kaltura iFrame</title>
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
			.loadingSpinner {
				background: url( '<?php echo KALTURA_MWEMBED_PATH ?>skins/common/images/loading_ani.gif');
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
				background: url( '<?php echo KALTURA_MWEMBED_PATH ?>skins/common/images/player_big_play_button.png');
				width: 130px;
				height: 96px;
				position: absolute;
				top:50%;
				left:50%;
				margin: -49px 0 0 -65px;
			}		
			#directFileLinkThumb{				
				position: absolute;
				top:0px;
				left:0px;
				width: 100%;
				height: 100%;
			}
			#error {
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
			#error h2 {
				font-size: 14px;
			}
		</style>
	</head>
	<body>	
		<?php 		
		$videoHTML = $this->getVideoHTML();
		if( $this->error ) {
			echo '<div id="error">'. $this->error .'</div>';			
		} else { 
			?>
			<div id="videoContainer" >
				<div class="loadingSpinner"></div>
				<?php echo $videoHTML ?>
			</div>
			<script type="text/javascript">					
				// Insert the html5 kalturaLoader script  
				document.write(unescape("%3Cscript src='<?php echo KALTURA_MWEMBED_PATH ?>mwEmbedLoader.js' type='text/javascript'%3E%3C/script%3E"));
			</script>
			<script type="text/javascript">	
				// Don't rewrite the video tag from the loader ( if html5 is supported it will be 
				// invoked bellow and respect the persistant video tag option for iPad overlays )
				mw.setConfig( 'Kaltura.LoadScriptForVideoTags', false );	
				// Don't wait for player metada for size layout and duration ( won't be needed once
				// we add durationHint and size attributes to the video tag
				mw.setConfig( 'EmbedPlayer.WaitForMeta', false );

				// Add Packaging Kaltura Player Data ( JSON Encoded )
				mw.setConfig('KalturaSupport.BootstrapPlayerData', <?php echo json_encode( $this->getResultObject() ) ?>);
				// Parse any configuration options passed in via hash url:
				var hashString = document.location.hash; 
				if( hashString ){
					var hashObj = JSON.parse( 
							decodeURIComponent( hashString.replace( /^#/, '' ) )
						);
					if( hashObj.mwConfig ){
						mw.setConfig( hashObj.mwConfig );
					}
				}
				// For testing limited capacity browsers
				//var kSupportsHTML5 = function(){ return false };
				//var kSupportsFlash = function(){ return false };
				if( kSupportsHTML5() ){
					//Set some iframe embed config:
					
					// We can't support full screen in object context since it requires outer page DOM control
					mw.setConfig( 'EmbedPlayer.EnableFullscreen', false );

					// Don't do an iframe rewrite inside an iframe!
					mw.setConfig( 'Kaltura.IframeRewrite', false );
					
					// Load the mwEmbed resource library
					mw.ready(function(){
						// Bind window resize to reize the player: 
						$j(window).resize(function(){
							$j( '#<?php echo htmlspecialchars( $this->playerIframeId )?>' )
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
					var vid = document.getElementById( '<?php echo $this->playerIframeId ?>' );
					document.getElementById( 'videoContainer' ).removeChild(vid); 
					
					if( kSupportsFlash() ){ 
						// Write out the embed object 
						document.write('<?php echo $this->getFlashEmbedHTML()?>');
					} else {
						// Last resort just provide an image with a link to the file
						// NOTE we need to do some platform checks to see if the device can 
						// "actually" play back the file and or switch to 3gp version if nessesary. 
						// also we need to see if the entryId supports direct download links 
						document.write('<?php echo $this->getFileLinkHTML()?>');
						
						var thumbSrc = kGetEntryThumbUrl({
							'entry_id' : '<?php echo $this->playerAttributes['entry_id']?>',
							'partner_id' : '<?php echo $this->getPartnerId() ?>',
							'height' : window.innerHeight,
							'width' : window.innerWidth
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
			</script><?php 
		} ?>		
  </body>
</html>
<?php
	}
}
?>
