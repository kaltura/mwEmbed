<?php
/**
 * kalturaIframe support
 *
 */

// Some predefined constants ( need to load these from config.. 
// and or allow configuration payload to be passed in via iframe message.  
define( 'KALTURA_SERVICE_URL', 'http://www.kaltura.com/' );
define( 'KALTURA_CDN_URL', 'http://cdn.kaltura.com' );
define( 'KALTURA_MWEMBED_PATH', str_replace( 'mwEmbedFrame.php', '', $_SERVER['SCRIPT_NAME'] ) );

// Setup the kalturaIframe
$mykalturaIframe = new kalturaIframe();

// Do kalturaIframe video output:
$mykalturaIframe->outputIFrame();

// Define the KalturaFlavorAsset that the api will blindly set as a class 
class KalturaFlavorAsset {};
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
		
		// @@TODO support native player ( for letting uses do true full screen, no overlays )
		// the default setting for mobile < iPad 
		//if( isset( $_REQUEST['nativePlayer'] )){
		// mw.setConfig('EmbedPlayer.NativeControls', true ) 
		//}
		
		// check the userAgent for directFileLink 
		
		// Check for required config
		if( $this->playerAttributes['wid'] == null ){
			$this->error = 'Can not display player, missing widget id';
		}
	}
	
	// Load the kaltura library and grab the most compatible flavour
	private function getFlavorSources(){
		
		include_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
		$userId = "username";
		$secret = "dc8a616702359ec844b18143667d130a";
		$adminsecret = "509d0007e53ecc4b05401ec12b15ed2f";
		// Partner id is widget_id but strip the first character 
		$partnerId =  substr( $this->playerAttributes['wid'], 1 );
		$conf = new KalturaConfiguration( $partnerId );
		$client = new KalturaClient( $conf );
		// @@todo support MultiRequest
		//$client->startMultiRequest();
		try{
			$session = $client->session->startWidgetSession( $this->playerAttributes['wid'] );
			$client->setKS($session->ks);
			
			// TODO lookup duration for "durationHint"
			
			// NOTE this should probably be wrapped in a service class 
			$kparams = array();
			$client->addParam( $kparams, "entryId",  $this->playerAttributes['entry_id'] );
			$client->queueServiceActionCall( "flavorAsset", "getByEntryId", $kparams );
			$resultObject = $client->doQueue();
			$client->throwExceptionIfError($resultObject);
		} catch( Exception $e ){
			$this->error = "Error getting sources from server, something maybe broken or server is under high load. Please try again.";
			return array();
		}
		// add any web sources		
		$sources = array();
		foreach( $resultObject as $KalturaFlavorAsset ){	

			$assetUrl =  KALTURA_CDN_URL .'/p/' . $partnerId . '/sp/' . 
					$partnerId . '00/flvclipper/entry_id/' . 
					$this->playerAttributes['entry_id'] . '/flavor/' . 	$KalturaFlavorAsset->id;
			if( strpos( $KalturaFlavorAsset->tags, 'iphone' ) !== false ){
				$sources['iphone'] = array(
					'src' => $assetUrl . '/a.mp4?novar=0',
					'type' => 'video/h264',
					'data-flavorid' => 'iphone' 
				);
			};
			if( strpos( $KalturaFlavorAsset->tags, 'ipad' ) !== false ){
				$sources['ipad'] = array(
					'src' => $assetUrl  . '/a.mp4?novar=0',
					'type' => 'video/h264',
					'data-flavorid' => 'ipad' 
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
		}
		return $sources;
	}
	
	// Returns a simple image with a direct link to the asset
	// ( need to add uiConf configuration to allow or disallow this feature
	// ( maybe we tie it to the "download" option 
	private function getFileLinkHTML(){
		$sources = $this->getFlavorSources();
		// For now use the iPhone, iPad, ogg ( in that order )
		if( isset( $sources['iphone'] )) {
			$flavorUrl = $sources['iphone']['src'];
		} else if( isset( $sources['ipad'] ) ){
			$flavorUrl = $sources['ipad']['src'];			
		} else if(  isset( $sources['ogg'] ) ){
			$flavorUrl = $sources['ogg']['src'];
		} else {
			// throw an exception ( no web streams ) 
			$this->error = 'No web streams available, please check your enabled flavors';
			return ;
		}
		// The outer container: 
		$o='<div id="directFileLinkContainer">';
			// @@todo once we hook up with the kaltura client output the thumb here:
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
		$partnerId =  substr( $this->playerAttributes['wid'], 1 );
		$posterUrl =  KALTURA_CDN_URL . '/p/' . $partnerId . '/sp/' .
						$partnerId . '00/thumbnail/' .
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
				overflow:hidden;				
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
				top:40%;
				left:40%;
			}		
			#directFileLinkThumb{				
				position: absolute;
				top:0px;
				left:0px;
				width: 100%;
				height: 100%;
			}
		</style>
	</head>
	<body>	
		<?php 
		$videoHTML = $this->getVideoHTML();
		if( $this->error ) {
			echo $this->error;			
		} else { 
			?>
			<div id="videoContainer" >
				<?php echo $videoHTML ?>
			</div>
			<script type="text/javascript">							
				// Insert the html5 kalturaLoader script  
				document.write(unescape("%3Cscript src='<?php echo KALTURA_MWEMBED_PATH ?>mwEmbedLoader.js' type='text/javascript'%3E%3C/script%3E"));
			</script>
			<script type="text/javascript">			
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
				
				// Don't rewrite the video tag from the loader ( if html5 is supported it will be 
				// invoked bellow and respect the persistant video tag option for iPad overlays )
				mw.setConfig( 'Kaltura.LoadScriptForVideoTags', false );	
								
				// For testing limited capacity browsers
				//var kSupportsHTML5 = function(){ return false };
				//var kSupportsFlash = function(){ return false };
				
				if( kSupportsHTML5() ){
					//Set some iframe embed config:
					
					// We can't support full screen in object context since it requires outer page DOM control
					mw.setConfig( 'EmbedPlayer.EnableFullscreen', false );
		
					// By default the iFrame api is dissabled ( its enabled via iframe url hash config )
					mw.setConfig( 'EmbedPlayer.EnableIframeApi', false );

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
						document.write('<?php echo $this->getFileLInkHTML()?>');
						
						var thumbSrc = kGetEntryThumbUrl({
							'entry_id' : '<?php echo $this->playerAttributes['entry_id']?>',
							'partner_id' : '<?php echo substr( $this->playerAttributes['wid'], 1 ) ?>',
							'height' : window.innerHeight,
							'width' : window.innerWidth
						});			
						document.getElementById( 'directFileLinkThumb' ).innerHTML = 
							'<img style="width:100%;height:100%" src="' + thumbSrc + '" >';
						// here we need to add the URL to the asset ( look up via kaltura api ) 
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
