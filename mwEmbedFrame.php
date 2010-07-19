<?
/**
 * mwEmbedFrame is a special stand alone page for iframe embed of mwEmbed modules
 *
 * For now we just support the embedPlayer
 *
 * This enables sharing mwEmbed player without js includes ie:
 *
 * <object data="mwEmbedFrame.php?apiTitleKey=MyFile.ogg" > </object>
 *
 * or
 *
 * <iframe src="mwEmbedFrame.php?src={SRC URL}&poster={POSTER URL}&width={WIDTH}etc"> </iframe>
 */

//Setup the script local script cache directory
// ( has to be hard coded rather than config based for fast non-mediawiki config hits )
$wgScriptCacheDirectory = realpath( dirname( __FILE__ ) ) . '/includes/cache';

// Setup the mwEmbedFrame
$myMwEmbedFrame = new mwEmbedFrame();

// Do mwEmbedFrame output:
$myMwEmbedFrame->outputFrame();

/**
 * mwEmbed iFrame class
 */
class mwEmbedFrame {
	/**
	 * Variables set by the Frame request:
	 */
	// The default width of the embedFrame
	var $width = null;

	// The default height of the embedFrame
	var $height = null;

	// The apiTitleKey used for mediaWiki asset lookup
	var $apiTitleKey = null;

	// The entryId used for kaltura media asset lookup
	var $entryId = null;

	// The player skin ( can be mvpcf or kskin )
	var $skin = null;

	// The duration of the media asset.
	var $durationHint = null;

	// When used in direct source mode the source asset.
	// NOTE: can be an array of sources in cases of "many" sources set
	var $sources = array();

	// Poster src url for video embed
	var $poster = null;

	function __construct(){
		//parse input:
		$this->parseRequest();
	}
	function outputFrame(){
		// Presently only video frame supported:
		$this->outputEmbedFrame();
	}

	// Parse the embedFrame request and sanitize input
	private function parseRequest(){
		// Check for apiTitleKey request
		if( isset($_GET['apiTitleKey'])){
			$this->apiTitleKey = htmlspecialchars( $_GET['apiTitleKey'] );
		}
		if( isset( $_GET['poster'] ) ){
			$this->poster = htmlspecialchars( $_GET['poster'] );
		}
		if( isset( $_GET['src'] ) ){
			if( is_array( $_GET['src'] ) ){
				foreach($_GET['src'] as $src ){
					$this->sources[] = htmlspecialchars( $src );
				}
			} else {
				$this->sources = array( htmlspecialchars( $_GET['src'] ) );
			}
		}
		if( isset($_GET['skin'])){
			$this->skin = htmlspecialchars( $_GET['skin'] );
		}

		if( isset($_GET['width'])){
			$this->width = (int)$_GET['width'];
		}
		if( isset( $_GET['height'] ) ){
			$this->height = (int)$_GET['height'];
		}
		if( isset( $_GET['durationHint'] ) ){
			$this->durationHint = $_GET['durationHint'];
		}
	}
	private function getVideoTag(){
		$o = '<video ';
		// Output attributes
		if( $this->apiTitleKey ){
			$o.= 'apiTitleKey="' . htmlspecialchars( $this->apiTitleKey ) . '" ';
		}
		if( $this->poster ){
			$o.= 'poster="' . htmlspecialchars( $this->poster ) . '" ';
		}
		if( $this->skin ){
			$o.= 'class="' . htmlspecialchars( $this->skin ) . '" ';
		}
		if( $this->width || $this->height){
			$o.= 'style="';
			if( $this->width ){
				$o.= 'width:' . htmlspecialchars( $this->width ) . 'px;';
			}
			if( $this->height ){
				$o.= 'height:' . htmlspecialchars( $this->height ) . 'px;';
			}
			$o.= '" ';
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
	private function outputEmbedFrame( ){
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>mwEmbed iframe</title>
		<style type="text/css">
			body {
				margin-left: 0px;
				margin-top: 0px;
				margin-right: 0px;
				margin-bottom: 0px;
			}
		</style>
		<script type="text/javascript" src="ResourceLoader.php?class=window.jQuery,mwEmbed"></script>
		<script type="text/javascript">
			//Set some iframe embed config:

			// Do not overlay controls since we cant dynamically resize the embed window.
			mw.setConfig( 'EmbedPlayer.OverlayControls', false );

			// We can't support full screen in object context since it requires outter page DOM control
			mw.setConfig( 'EmbedPlayer.EnableFullscreen', false );
		</script>
    </head>
    <body>
    <?
    // Check if we have code to output player embed
    if( $this->apiTitleKey || count( $this->sources ) != 0 ) {
		echo $this->getVideoTag();
    } else {
    	echo "Error: mwEmbedFrame missing required parameter ( src or apiTitleKey )";
    }
    ?>
    </body>
</html>
<?php
	}
}
	?>
