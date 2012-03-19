<?php
/**
 * Sample Playlist Iframe with nested iframe player
 * 
 *  NOTE:: this file was created a POC, and needs clean up before usage outside
 *  of that context. 
 *  
 */

// Include configuration: ( will include LocalSettings.php )
require( '../../includes/DefaultSettings.php' );

// Setup the kalturaIframe
global $wgKalturaIframe;
$wgKalturaPLIframe = new kalturaPlaylistIframe();

// Do kalturaIframe video output:

// Start output buffering to 'catch errors' and override output
if( ! ob_start("ob_gzhandler") ) ob_start();
$wgKalturaPLIframe->outputIFrame();
ob_end_flush();

class kalturaPlaylistIframe {

	public $playlistItems = array();

	function __construct( $clientTag = 'php')
	{
		$this->clientTag = $clientTag;
		//set cache key
		$this->cacheSt();
		//parse input:
		$this->parseRequest();
		// load the request object:
		$this->parseMRSS();
	}

	private function cacheSt()
	{
		$this->cache_st = time() + (60*15);
	}

	private function parseRequest()
	{
		if( isset( $_SERVER['PATH_INFO'] ) ){
			$urlParts = explode( '/', $_SERVER['PATH_INFO'] );
			foreach( $urlParts as $inx => $urlPart ){
				foreach( $this->urlParameters as $attributeKey => $na){
					if( $urlPart == $attributeKey && isset( $urlParts[$inx+1] ) ){
						$_REQUEST[ $attributeKey ] = $urlParts[$inx+1];
					}
				}
			}
		}

		// Check for urlParameters in the request:
		foreach( $this->urlParameters as $attributeKey => $na){
			if( isset( $_REQUEST[ $attributeKey ] ) ){
				// set the url parameter and don't let any html in:
				if( is_array( $_REQUEST[$attributeKey] ) ){
					$payLoad = array();
					foreach( $_REQUEST[$attributeKey] as $key => $val ){
						$payLoad[$key] = htmlspecialchars( $val );
					}
					$this->urlParameters[ $attributeKey ] = $payLoad;
				} else {
					$this->urlParameters[ $attributeKey ] = htmlspecialchars( $_REQUEST[$attributeKey] );
				}
			}
		}

		// add p == _widget
		if( isset( $this->urlParameters['p'] ) && !isset( $this->urlParameters['wid'] ) ){
			$this->urlParameters['wid'] = '_' . $this->urlParameters['p'];
		}
	}

	private function formatTime($secs)
	{
		return
			//str_pad(floor($secs/3600),2,"0",STR_PAD_LEFT).
			//":".
			str_pad(floor(($secs%3600)/60),2,"0",STR_PAD_LEFT).
			":".
			str_pad($secs%60,2,"0",STR_PAD_LEFT);
	}

	private function formatThumbnail($url)
	{
		$pattern = '/\/width\/[0-9]+\/height\/[0-9]+/';
		$replacement = '/width/72/height/48';
		return preg_replace($pattern, $replacement, $url);
	}

	private function parseMRSS()
	{
		global $wgKalturaServiceUrl;
		$mrssUrl = $wgKalturaServiceUrl . '/index.php/partnerservices2/executeplaylist?partner_id='.$this->urlParameters['p'] .'&format=8&playlist_id=' . $this->urlParameters['playlist_id'];

		// Parse XML code
		$feed = file_get_contents($mrssUrl);
		$xml = new SimpleXMLElement($feed);
		$playlist_items = array();

		foreach ($xml->channel->item as $item) {
			
			$media = $item->children('http://search.yahoo.com/mrss/');
			$content = $media->content->attributes();
			$thumbnail = $media->thumbnail->attributes();
			$guid = explode("|", $item->guid);

			$media_item = array(
				'partner_id' => $guid[0],
				'entry_id' => $guid[1],
				'title' => $media->title,
				'duration' => $this->formatTime($content['duration']),
				'thumbnail' => $this->formatThumbnail($thumbnail['url'])
			);

			$playlist_items[] = $media_item;
		}

		$this->playlistItems = $playlist_items;
	}

	/**
	 * Get the location of the mwEmbed library
	 */
	private function getMwEmbedLoaderLocation(){
		return substr(dirname($_SERVER['SCRIPT_NAME']), 0, strrpos(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/') + 1)
 . 'mwEmbedLoader.php';
	}
	

	private function getFlashVarsString()
	{
		// output the escaped flash vars from get arguments
		$s = 'externalInterfaceDisabled=false';
		if( isset( $_REQUEST['flashvars'] ) && is_array( $_REQUEST['flashvars'] ) ){
			foreach( $_REQUEST['flashvars'] as $key=>$val ){
				$s.= '&' . htmlspecialchars( $key ) . '=' . urlencode( $val );
			}
		}
		return $s;
	}
	
	public function getSwfUrl()
	{
		global $wgKalturaServiceUrl;
		return $wgKalturaServiceUrl . '/index.php/kwidget/cache_st/' . $this->cache_st .'/wid/' . $this->urlParameters['wid'] .'/uiconf_id/' . $this->urlParameters['uiconf_id'] . '/entry_id/' . $this->playlistItems[0]['entry_id'];
	}

	public function outputIFrame() 
	{
?>
<html>
<head>
	<title>Kaltura Playlist</title>
	<script src="<?php echo $this->getMwEmbedLoaderLocation(); ?>"></script>
	<style>
	html, body, div, p, ul, li { margin:0; padding: 0; }
	body { margin:0; position:fixed; width: 100%; height: 100%; overflow:hidden; background: #161616; color: #fff; font-family: Arial; font-size: 11px; }
	#kaltura_player { float: left; width: 400px; height: 330px; background: #000; }
	#kaltura_playlist { float: left; width: 340px; height: 330px; overflow: hidden; }
	#kaltura_playlist ul { margin: 10px; list-style: none; }
	#kaltura_playlist .playlist_item { background: #252525; height: 50px; border-radius: 4px; padding: 8px; margin-bottom: 4px; cursor: pointer; }
	#kaltura_playlist .playlist_item img { float: left; margin-right: 8px; width: 72px; height: 48px;}
	#kaltura_playlist .playlist_item:hover { background: #3C3C3C; }
	#kaltura_playlist .playlist_item.active { background: #3C3C3C; }
	#kaltura_playlist .title { float: left; max-width: 175px; color: #bcbcbc; }
	#kaltura_playlist .duration { float: right; margin-right: 20px; color: #bcbcbc; font-size: 10px; }
	</style>
	<script>
	// For now load the guestbook plugin always
	mw.setConfig('Mw.CustomResourceIncludes', [
		{"src":"http://projects.kaltura.com/ran/guestbook/mw.KGuestbook.js","type":"js"},
		{"src":"http://projects.kaltura.com/ran/guestbook/mw.KGuestbook.css","type":"css"}
	]);
	mw.setConfig('Kaltura.UseAppleAdaptive' , false );
	
	var kdp;
	var didClick = false;
	
	function jsCallbackReady( playerId ) {
		kdp = document.getElementById( playerId );
		
		kdp.addJsListener( 'entryReady', 'doPlay' );
		// add playlist link binding:
		$('.playlist_item')
		.click( function() {
			var $this = $(this);
			$( '.playlist_item' ).removeClass('active');
			$this.addClass('active');
			didClick = true;
			kdp.sendNotification('changeMedia', { 'entryId' : $this.data('entryid') });
		});
	}
	function doPlay(){
		if( didClick ) {
			setTimeout(function(){
				if( !kdp['guestbookonscreen'] ){
					kdp.sendNotification('doPlay');
				}
			}, 300);
			didClick = false;
		}
	}
	</script>
</head>
<body>
	<object id="kaltura_player" width="400" height="330" name="kaltura_player" type="application/x-shockwave-flash" allowFullScreen="true" allowNetworking="all" allowScriptAccess="always" xmlns:dc="http://purl.org/dc/terms/" xmlns:media="http://search.yahoo.com/searchmonkey/media/" rel="media:video" resource="<?php echo $this->getSwfUrl(); ?>" data="<?php echo $this->getSwfUrl(); ?>">
		<param name="allowFullScreen" value="true" />
		<param name="allowNetworking" value="all" />
		<param name="allowScriptAccess" value="always" />
		<param name="bgcolor" value="#000000" />
		<param name="flashVars" value="<?php echo $this->getFlashVarsString(); ?>" />
		<param name="movie" value="<?php echo $this->getSwfUrl(); ?>" />
	</object>
	<div id="kaltura_playlist">
		<ul>
			<?php 
			$i = 0;
			foreach( $this->playlistItems as $item){
				$i++;
				$active = ($i == 1) ? ' active' : '';
			?>
			<li class="playlist_item<?php echo $active; ?>" data-entryid="<?php echo $item['entry_id'];?>">
				<img src="<?php echo $item['thumbnail'];?>" alt="<?php echo $item['title'];?>" />
				<div class="title" title="<?php echo $item['title'];?>"><?php echo $item['title'];?></div>
				<div class="duration"><?php echo $item['duration'];?></div>
			</li>
			<?php } ?>
		</ul>
	</div>
</body>
</html>
<?php
	}

}