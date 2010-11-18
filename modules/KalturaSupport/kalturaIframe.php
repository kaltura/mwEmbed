<?php
/**
 * kalturaIframe is a special stand alone page for iframe embed of mwEmbed modules
 *
 * For now we just support the embedPlayer
 *
 * This enables sharing mwEmbed player without js includes ie:
 *
 * <iframe src="kalturaIframe.php?src={SRC URL}&poster={POSTER URL}&width={WIDTH}etc"> </iframe>
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
		  
		if( $_SERVER['PATH_INFO'] ){		
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
	
	// Returns a simple image with a direct link to the asset
	// ( need to add uiConf configuration to allow or disallow this feature
	// ( maybe we tie it to the "download" option 
	private function getDirectFileLink(){
		// The outer container: 
		$o.='<div style="position:abolute;top:0px;left:0px;height:100%;width:100%">';
			// @@todo once we hook up with the kaltura client output the thumb here:
			// ( for now we use javascript to append it in there ) 
			$o.='<div id="directFileLinkThumb" ></div>';
			$o.='<a href="#" id="directFileLinkButton"></a>';
		$o.='</div>';
		return $o;
	}
	
	private function getVideoTag( ){
		$videoTagMap = array(			
			'entry_id' => 'kentryid',
			'uiconf_id' => 'kuiconfid',
			'wid' => 'kwidgetid'			 
		);				
		
		// Add default video tag with 100% width / height 
		// NOTE: special persistentNativePlayer class will prevent the video from being swapped
		// so that overlays work on the iPad.
		 
		$o = '<video class="persistentNativePlayer" ' .
			'src=""' . 
			'id="' . htmlspecialchars( $this->playerIframeId ) . '" ' . 
			'style="width:100%;height:100%"';
		
		foreach( $this->playerAttributes as $key => $val ){
			if( isset( $videoTagMap[ $key ] ) && $val != null ) {			
				$o.= ' ' . $videoTagMap[ $key ] . '="' . htmlspecialchars( $val ) . '"';
			}
		}
		
		// To be on the safe side include the flash player and 
		// direct file link as a child of the video tag
		// ( if javascript is "off" for example ) 
		$o.= $this->getFlashEmbedTag( 
			$this->getDirectFileLink()
		); 				
		//Close the video attributes
		$o.='>';
		$o.= '</video>';
		return $o;
	}
	 
	private function getFlashEmbedTag( $childHTML = '' ){
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
		<?php echo $this->getVideoTag() ?>	
		<?php if( $this->error ) {
			echo $this->error;			
		} else { ?>
		<script type="text/javascript">							
			// Insert the html5 kalturaLoader script  
			document.write(unescape("%3Cscript src='<?php echo KALTURA_MWEMBED_PATH ?>mwEmbedLoader.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">							
			// Don't rewrite the video tag ( its only there so Ipad can do overlays )
			// if we are using flash it will be removed 
			mw.setConfig( 'Kaltura.LoadScriptForVideoTags', false );	
						
			// Once this iframe is used for kaltura embed we can remove 
			// this wraping of kIsHTML5FallForward 
			// But for now we know that if the iframe is invoked we want video tag: 
			var iframeKIsHTML5FallForward = function(){
				if( kSupportsHTML5() ) {
					return true;
				}
				return kIsHTML5FallForward();
			}			
			
			if( iframeKIsHTML5FallForward() ){
				//Set some iframe embed config:
				// We can't support full screen in object context since it requires outer page DOM control
				mw.setConfig( 'EmbedPlayer.EnableFullscreen', false );
	
				// Enable the iframe player server:
				mw.setConfig( 'EmbedPlayer.EnableIFramePlayerServer', true );

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
				
				// Remove the video tag and output a clean "object" 
				// ( in theory its the child of the video tag so would be played,
				//  but rewriting gives us flexiblity in in selection criteria as 
				// part of the javascript check kIsHTML5FallForward
				var vid = document.getElementById( '<?php echo $this->playerIframeId ?>' );
				document.getElementById( 'videoContainer' ).removeChild(vid); 
				
				if( kSupportsFlash() ){ 
					// write out the embed object 
					document.write('<?php echo $this->getFlashEmbedTag()?>');
				} else {
					// Last resort just provide an image with a link to the file
					// NOTE we need to do some platform checks to see if the device can 
					// "actually" play back the file and or switch to 3gp version if nessesary. 
					// also we need to see if the entryId supports direct links 
					document.write('<?php echo $this->getDirectFileLink()?>');
					
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
		</script>
		<?php } ?>		
  </body>
</html>
<?php
	}
}
?>
