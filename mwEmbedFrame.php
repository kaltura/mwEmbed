<?php
header("Access-Control-Allow-Origin: *");
/**
 * mwEmbedFrame is a special stand alone page for iframe embed of mwEmbed modules
 *
 * For now we just support the embedPlayer
 *
 * This enables sharing mwEmbed player without js includes ie:
 *
 * <iframe src="mwEmbedFrame.php?src={SRC URL}&poster={POSTER URL}&width={WIDTH}etc"> </iframe>
 */

// Include configuration: ( will include LocalSettings.php ) 
require(	dirname( __FILE__ ) . '/includes/DefaultSettings.php' );

// Include MwEmbedWebStartSetup.php for all of mediawiki support
require ( dirname( __FILE__ ) . '/includes/MwEmbedWebStartSetup.php' );

// Setup the mwEmbedFrame
$myMwEmbedFrame = new mwEmbedFrame();

$mwEmbedRoot = dirname( __FILE__ );

// @@TODO temporary HACK to override to kalturaIframe 
// ( need to refactor embedFrame into an abstract class )
// @@TODO Need a php based configuration system for modules so they 
// can extend / override entry points

if( isset( $myMwEmbedFrame->kwidgetid ) || isset($_REQUEST['wid']) ){
	require(	dirname( __FILE__ ) . '/modules/KalturaSupport/kalturaIframe.php');
	exit();
}

// Do mwEmbedFrame video output:
$myMwEmbedFrame->outputIFrame();

// Direct link list


/**
 * mwEmbed iFrame class
 */
class mwEmbedFrame {
	/**
	 * Variables set by the Frame request:
	 */
	var $playerAttributes = array(
		'apiTitleKey',
		'apiProvider',
		'autoplay',
		'durationHint',
		'poster',
		'kentryid',
		'kwidgetid',
		'kuiconfid',
		'kplaylistid',
		'skin'
	);
	var $playerIframeId = 'iframeVid';
	var $debug = false;
				var $theme = 'kdark';
				
	
	// When used in direct source mode the source asset.
	// NOTE: can be an array of sources in cases of "many" sources set
	var $sources = array();

	function __construct(){
		//parse input:
		$this->parseRequest();
	}

	// Parse the embedFrame request and sanitize input
	private function parseRequest(){
		// Check for / attribute type request and update "REQUEST" global 
		// ( uses kaltura standard entry_id/{entryId} request )
		// normalize to the REQUEST object
		// @@FIXME: this should be moved over to a kaltura specific iframe implementation 
		if( isset( $_SERVER['PATH_INFO'] ) ){
			$kalturaUrlMap = Array( 
				'entry_id' => 'kentryid',
				'uiconf_id' => 'kuiconfid',
				'wid' => 'kwidgetid',
				'playlist_id' => 'kplaylistid'
			);
			$urlParts = explode( '/', $_SERVER['PATH_INFO'] );
			foreach( $urlParts as $inx => $urlPart ){
				foreach( $kalturaUrlMap as $urlKey => $reqeustAttribute ){
					if( $urlPart == $urlKey && isset( $urlParts[$inx+1] ) ){
						$_REQUEST[ $reqeustAttribute ] = $urlParts[$inx+1];
					}
				}
			}
		}
		
		// Check for attributes
		foreach( $this->playerAttributes as $attributeKey){
			if( isset( $_REQUEST[ $attributeKey ] ) ){
				$this->$attributeKey = htmlspecialchars( $_REQUEST[$attributeKey] );
			}
		}

								// Check for non-default theme.	
		if( isset( $_REQUEST['theme'] )	&&
										in_array($_REQUEST['theme'],
														 array('darkness','le-frog', 'redmond','start',
																	 'sunny', 'kdark')) ){
									$this->theme = $_REQUEST['theme'];
								}
								
		// Check for debug flag
		if( isset( $_REQUEST['debug'] ) ){
			$this->debug = true;
		}
		
		// Process the special "src" attribute
		if( isset( $_REQUEST['src'] ) ){
			if( is_array( $_REQUEST['src'] ) ){
				foreach($_REQUEST['src'] as $src ){
					$this->sources[] = htmlspecialchars( $src );
				}
			} else {
				$this->sources = array( htmlspecialchars( $_REQUEST['src'] ) );
			}
		}
	
	}
	private function getVideoTag( ){
		// Add default video tag with 100% width / height 
		// ( parent embed is responsible for setting the iframe size )
		$o = '<video id="' . htmlspecialchars( $this->playerIframeId ) . '" style="width:100%;height:100%"';
		foreach( $this->playerAttributes as $attributeKey){
			if( isset( $this->$attributeKey ) ){
				$o.= ' ' . $attributeKey . '="' . htmlspecialchars( $this->$attributeKey ) . '"';
			}
		}
		//Close the video attributes
		$o.='>';
		// Output each source
		if( count( $this->sources ) ){
			foreach($this->sources as $src ){
				$o.= '<source src="' . htmlspecialchars( $src ) . '"></source>';
			}
		}
		$o.= '</video>';
		return $o;
	}	
	
	function outputIFrame( ){
		// Setup the embed string based on attribute set:
		$embedResourceList = 'window.jQuery,mwEmbed';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>mwEmbed iframe</title>
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
		<script type="text/javascript" src="<?php echo str_replace( 'mwEmbedFrame.php', '', $_SERVER['SCRIPT_NAME'] ); ?>ResourceLoader.php?class=<?php 
		// @@TODO we should move this over to using the mwEmbedLoader.js so we don't have to mannage the resource list in two places. 
		// ( this will matter less once we migrate to the new mediaWiki resource loader framework) 
		echo $embedResourceList;
		if( $this->debug ){
			echo '&debug=true';
		} 
		?>"></script>
		
		<script type="text/javascript">
			//Set some iframe embed config:
			// We can't support full screen in object context since it requires outer page DOM control
			mw.setConfig( 'EmbedPlayer.EnableFullscreen', false );

			mw.ready(function(){
				// Bind window resize to reize the player: 
				$(window).resize(function(){
					$( '#<?php echo htmlspecialchars( $this->playerIframeId )?>' )
						[0].resizePlayer({
							'width' : $(window).width(),
							'height' : $(window).height()
						});
				});
			});
		</script>
	</head>
	<body>	
	<?php
	// Check if we have a way to get sources:
	if( isset( $this->apiTitleKey ) || isset( $this->kentryid ) || count( $this->sources ) != 0 ) {
		echo $this->getVideoTag();
	} else {
		echo "Error: mwEmbedFrame missing required parameter for video sources</body></html>";
	}	
	?>
	</body>
</html>
<?php
	}
}
?>
