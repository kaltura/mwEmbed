<?
/**
 * mwEmbedFrame is a special stand alone page for iframe embed of mwEmbed modules
 *
 * For now we just support the embedPlayer
 *
 * This enables sharing mwEmbed player without js includes ie:
 *
 * <iframe src="mwEmbedFrame.php?src={SRC URL}&poster={POSTER URL}&width={WIDTH}etc"> </iframe>
 */

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
	var $playerAttributes = array(
		'apiTitleKey',
		'apiProvider',
		'durationHint',
		'poster',
		'kEntryId',
		'kWidgetId'	,
		'skin'
	);

	// When used in direct source mode the source asset.
	// NOTE: can be an array of sources in cases of "many" sources set
	var $sources = array();

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
		// Check for attributes
		foreach( $this->playerAttributes as $attributeKey){
			if( isset( $_GET[ $attributeKey ] ) ){				
				$this->$attributeKey = htmlspecialchars( $_GET[$attributeKey] );
			}
		}
				
		// Process the special "src" attribute
		if( isset( $_GET['src'] ) ){
			if( is_array( $_GET['src'] ) ){
				foreach($_GET['src'] as $src ){
					$this->sources[] = htmlspecialchars( $src );
				}
			} else {
				$this->sources = array( htmlspecialchars( $_GET['src'] ) );
			}
		}
	
	}
	private function getVideoTag(){
		// Add default video tag with 100% width / height 
		// ( parent embed is responsible for setting the iframe size )
		$o = '<video style="width:100%;height:100%"';
		foreach( $this->playerAttributes as $attributeKey){
			$o.= ' ' . $attributeKey . '="' . htmlspecialchars( $this->$attributeKey ) . '"';
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
		// Setup the embed string based on attribute set:
		$embedResourceList = 'window.jQuery,mwEmbed,mw.style.mwCommon,$j.fn.menu,mw.style.jquerymenu,mw.EmbedPlayer,mw.EmbedPlayerNative,mw.EmbedPlayerJava,mw.PlayerControlBuilder,$j.fn.hoverIntent,mw.style.EmbedPlayer,$j.cookie,$j.ui,mw.style.ui_redmond,$j.widget,$j.ui.mouse,mw.PlayerSkinKskin,mw.style.PlayerSkinKskin,mw.TimedText,mw.style.TimedText,$j.ui.slider';
		
		if( $this->kEntryId ){
			 $embedResourceList.= ',' . implode(',', array(	
			 		'KalturaClientBase',
					'KalturaClient',
					'KalturaAccessControlService',
					'KalturaAccessControlOrderBy',
					'KalturaAccessControl',
					'MD5',
					'mw.KWidgetSupport',
					'mw.KAnalytics', 
					'mw.KDPMapping',
					'mw.MobilePlayerTimeline',		
					'mw.KAds'
			) );
		}   
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
		<script type="text/javascript" src="ResourceLoader.php?class=<?php echo $embedResourceList?>"></script>
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
