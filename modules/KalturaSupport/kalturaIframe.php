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

// Some predefined constants:
define( 'KALTURA_SERVICE_URL', 'http://www.kaltura.com/' ); 

//define( 'RESOURCE_LOADER_URL', 'http://www.kaltura.org/apis/html5lib/mwEmbed/ResourceLoader.php');
define( 'RESOURCE_LOADER_URL', 'http://192.168.38.18/html5.kaltura/mwEmbed/ResourceLoader.php');

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
		if( isset( $_REQUEST['debugKalturaPlayer'] ) && $_REQUEST['debugKalturaPlayer'] == 'true' ){
			$this->debug = true;
		}		
		
		// Check for required config
		if( $this->playerAttributes['wid'] == null ){
			$this->error = 'Can not display player, missing widget id';
		}
	}
	
	private function getImageFileLinkTag(){
		// Lookup the asset url ( ideally we could also support 3gp device mapping )
		 
	}
	
	private function getVideoTag( ){
		$videoTagMap = array(			
			'entry_id' => 'kentryid',
			'uiconf_id' => 'kuiconfid',
			'wid' => 'kwidgetid'			 
		);
		
		// Add default video tag with 100% width / height 
		// ( parent embed is responsible for setting the iframe size )
		$o = '<video id="' . htmlspecialchars( $this->playerIframeId ) . '" style="width:100%;height:100%"';
		
		foreach( $this->playerAttributes as $key => $val ){
			if( isset( $videoTagMap[ $key ] ) && $val != null ) {			
				$o.= ' ' . $videoTagMap[ $key ] . '="' . htmlspecialchars( $val ) . '"';
			}
		}
		
		//Close the video attributes
		$o.='>';
		$o.= '</video>';
		return $o;
	}
	 
	private function getFlashEmbedTag(){
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
			'</object>';
	}
	
	function outputIFrame( ){
		// Setup the embed string based on attribute set:
		// @@todo this will be factored out once the resource loader has top level named resources
		$embedResourceList = 'window.jQuery,mwEmbed,mw.style.mwCommon,$j.fn.menu,mw.style.jquerymenu,mw.EmbedPlayer,' .
			'mw.EmbedPlayerNative,mw.EmbedPlayerJava,mw.PlayerControlBuilder,$j.fn.hoverIntent,mw.style.EmbedPlayer,' . 
			'$j.cookie,$j.ui,mw.style.ui_redmond,$j.widget,$j.ui.mouse,mw.PlayerSkinKskin,mw.style.PlayerSkinKskin,' .
			'mw.TimedText,mw.style.TimedText,$j.ui.slider,' . 
			'KalturaClientBase,KalturaClient,KalturaAccessControlService,KalturaAccessControlOrderBy,KalturaAccessControl,'.
			'MD5,mw.KWidgetSupport,mw.KAnalytics,mw.KDPMapping,mw.MobileAdTimeline,mw.KAds';
		
		$isHardLinkDevice = false;
		// Setup the mwEmbed url:  
		$mwEmbedUrl = RESOURCE_LOADER_URL . '?class=' . $embedResourceList;		
		if( $this->debug ){
			$mwEmbedUrl.='&debug=true';
		}
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
		</style>
	</head>
	<body>  
		<?php if( $this->error ) {
			echo $this->error;			
		} else { ?>
		<script type="text/javascript">		
			// Copied from mwEmbedLoader.js ( should figure out a good way to maintain sync ) 
			function kIsHTML5FallForward(){
				// Check for a mobile html5 user agent:	
				if ( (navigator.userAgent.indexOf('iPhone') != -1) || 
					(navigator.userAgent.indexOf('iPod') != -1) || 
					(navigator.userAgent.indexOf('iPad') != -1) ||
					(navigator.userAgent.indexOf('Android 2.') != -1) ||
					// Force html5 for chrome / desktop safari
					(document.URL.indexOf('forceMobileHTML5') != -1 )
				){
					return true;
				}
	
				// Check if the client does not have flash and has the video tag
				if ( navigator.mimeTypes && navigator.mimeTypes.length > 0 ) {
					for ( var i = 0; i < navigator.mimeTypes.length; i++ ) {
						var type = navigator.mimeTypes[i].type;
						var semicolonPos = type.indexOf( ';' );
						if ( semicolonPos > -1 ) {
							type = type.substr( 0, semicolonPos );
						}
						if (type == 'application/x-shockwave-flash' ) {
							// flash is installed don't use html5
							return false;
						}
					}
				}
				
				// for IE: 
				var hasObj = true;
				if( typeof ActiveXObject != 'undefined' ){
					try {
						var obj = new ActiveXObject( 'ShockwaveFlash.ShockwaveFlash' );
					} catch ( e ) {
						hasObj = false;
					}
					if( hasObj ){
						return false;
					}
				}
				// Check for video tag support:
				var dummyvid = document.createElement( "video" );
				if( dummyvid.canPlayType ) {
					return true;
				}
							
				// No video tag or flash, return false ( normal "install flash" user flow )
				return false;
			}
			
			// Inline check for flash support ( output video tag
			if( kIsHTML5FallForward() ){
				document.write(unescape("%3Cscript src='<?php echo $mwEmbedUrl ?>' type='text/javascript'%3E%3C/script%3E"));
				document.write('<?php echo $this->getVideoTag() ?>');								
			} else {
				// write out the embed object 
				document.write('<?php echo $this->getFlashEmbedTag()?>'); 
			}
		</script>
		<script type="text/javascript">		
			// In a seperate script block to give time for the document.write to update javascript state
			if( kIsHTML5FallForward() ){
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
			}
		</script>
		<?php } ?>		
  </body>
</html>
<?php
	}
}
?>
