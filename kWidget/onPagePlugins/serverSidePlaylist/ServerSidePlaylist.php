<!DOCTYPE HTML>
<html>
<head>
<title>Server side playlist</title>
<script type="text/javascript" src="../../../tests/qunit/qunit-bootstrap.js"></script>
<script type="text/javascript" src="../../../mwEmbedLoader.php"></script>
<script type="text/javascript" src="../../../docs/js/doc-bootstrap.js"></script>
<script type="text/javascript">	
function jsKalturaPlayerTest( videoId ){
	// global jsCallbacks will be re-issued we are testing against inline kWiget calls
	asyncTest("Server side playlist", function(){
		
	});
}
</script>
<!-- qunit-kaltura must come after qunit-bootstrap.js and after mwEmbedLoader.php and after any jsCallbackReady stuff-->
<script type="text/javascript" src="resources/qunit-kaltura-bootstrap.js"></script>
</head>
<body>
<h2>Server side playlist</h2>
<p style="max-width:800px;">
<b>Server side playlists</b> are built on the server and are in the page before javascript or the player is invoked.
This is best for cases where you need to optimize playlists in page search engine discoverability.

A sample file getKalturaPlaylist.php is included that includes a single simple method for 
translating kaltura playlist api response into a ul list

The on-page plugin handles binding all elements of your choosing. 
</p>
<?php 
include_once dirname( __FILE__ ) . '/getKalturaPlaylist.php';
$playlist = getKalturaPlaylist( '243342', '1_h92ak5el' );
?>
<br>
<h3>Player with Default Entry</h3>
<div id="kaltura_player" style="width:560px;height:330px;"></div>
<script type="text/javascript">
	// only set autoplay if running a test:
	kWidget.embed({
		'targetId': 'kaltura_player',
		'wid': '_243342',
		'uiconf_id' : '2877502',
		'entry_id' : '0_l1v5vzh3',
		'readyCallback': function( playerId ){
			var kdp = $( '#' + playerId ).get(0);
			$('li.kaltura-video').click(function(){
				var entryId = $(this).find('a').attr('data-entryid');
				kdp.sendNotification('changeMedia', {'entryId': entryId } );
			})
		}
	});
</script>
<br>
<h3>Player includes on-page playlist binding</h3>
<pre  class="prettyprint linenums">
kWidget.embed({<br/>		'targetId': 'kaltura_player',<br/>		'wid': '_243342',<br/>		'uiconf_id' : '2877502',<br/>		'entry_id' : '0_l1v5vzh3',<br/>		'readyCallback': function( playerId ){<br/>			var kdp = $( '#' + playerId ).get(0);<br/>			$('li.kaltura-video').click(function(){<br/>				var entryId = $(this).find('a').attr('data-entryid');<br/>				kdp.sendNotification('changeMedia', {'entryId': entryId } );<br/>			})<br/>		}<br/>	});
</pre>
<div style="clear:both"></div>
<br>
<h3>Playlist Title: <?php echo $playlist['meta']['name']?></h3>
<ul class="thumbnails">
<?php 
$sizeProfile = array(
	array(
		'span' => 'span4',
		'width' => '360',
		'height' => '270'
	), 
	array(
		'span' => 'span3',
		'width' => '260',
		'height' => '120'
	),
	array(
		'span' => 'span2',
		'width' => '160',
		'height' => '120'
	)
);
foreach( $playlist['playlist'] as $key => $entry ){
	$entry =  (array)$entry;
	$inx = 0;
	if( $key > 0 ){
		$inx = 1;
	}
	if( $key > 1 ){
		$inx = 2;
	}
	$sizeName = $sizeProfile[$inx]['width'] . 'x' .  $sizeProfile[$inx]['height'];
?>
	<li itemscope itemtype="http://schema.org/VideoObject" 
		class="kaltura-video <?php echo $sizeProfile[$inx]['span'] ?>">
		<meta itemprop="duration" content="<?php echo $entry['duratoin'] ?>"
		<meta itemprop="thumbnailURL" content="<?php echo $entry['thumbnailUrl'] ?>">
		<a data-entryid="<?php echo $entry['id'] ?>" href="#" class="thumbnail" title="<?php echo $entry['name'] ?>">
			<img data-src="holder.js/<?php echo $sizeName  ?>"
				alt="<?php echo htmlspecialchars( $entry['name'] )?>" 
				style="width: <?php echo $sizeProfile[$inx]['width']?>px; max-height: <?php echo $sizeProfile[$inx]['height']?>px;" 
				src="<?php echo $entry['thumbnailUrl'] ?>/width/<?php echo $sizeProfile[$inx]['width'] ?>">
		</a>
		<span itemprop="description"><?php echo htmlspecialchars( $entry['name'] )?></span>
	</li>
<?php 
}
?>
</ul>
<h3>Server side code to generate playlist</h3>
<pre  class="prettyprint linenums">
&lt;?php <br/>include_once dirname( __FILE__ ) . '/getKalturaPlaylist.php';<br/>$playlist = getKalturaPlaylist( '243342', '1_h92ak5el' );<br/>
foreach( $playlist['playlist'] as $key =&gt; $entry ){
?&gt;
&lt;li itemscope itemtype=&quot;http://schema.org/VideoObject&quot; <br/>		class=&quot;&lt;?php echo $sizeProfile[$inx]['span'] ?&gt;&quot;&gt;<br/>		&lt;meta itemprop=&quot;duration&quot; content=&quot;&lt;?php echo $entry['duratoin'] ?&gt;&quot;<br/>		&lt;meta itemprop=&quot;thumbnailURL&quot; content=&quot;&lt;?php echo $entry['thumbnailUrl'] ?&gt;&quot;&gt;<br/>		&lt;a href=&quot;#&quot; class=&quot;thumbnail&quot; title=&quot;&lt;?php echo $entry['name'] ?&gt;&quot;&gt;<br/>			&lt;img data-src=&quot;holder.js/&lt;?php echo $sizeName  ?&gt;&quot;<br/>				alt=&quot;&lt;?php echo htmlspecialchars( $entry['name'] )?&gt;&quot; <br/>				style=&quot;width: &lt;?php echo $sizeProfile[$inx]['width']?&gt;px; max-height: &lt;?php echo $sizeProfile[$inx]['height']?&gt;px;&quot; <br/>				src=&quot;&lt;?php echo $entry['thumbnailUrl'] ?&gt;/width/&lt;?php echo $sizeProfile[$inx]['width'] ?&gt;&quot;&gt;<br/>		&lt;/a&gt;<br/>		&lt;span itemprop=&quot;description&quot;&gt;&lt;?php echo htmlspecialchars( $entry['name'] )?&gt;&lt;/span&gt;<br/>	&lt;/li&gt;
&lt;?php } ?&gt;
</pre>
<h3>getKalturaPlaylist.php</h3>
<pre  class="prettyprint linenums">
&lt;?php <br/>// Include the kaltura php api, you can get your copy here:<br/>// http://www.kaltura.com/api_v3/testme/client-libs.php<br/>require_once( dirname( __FILE__ ) . '/../../../modules/KalturaSupport/Client/kaltura_client_v3/KalturaClient.php');<br/>/**<br/> * Takes in a : <br/> * $wid, string, The widget id <br/> * $playlistId, string, The playlist_id<br/> */<br/>function getKalturaPlaylist( $partnerId, $playlistId ){<br/>	$config = new KalturaConfiguration($partnerId);<br/>	$config-&gt;serviceUrl = 'http://www.kaltura.com/';<br/>	$client = new KalturaClient($config);<br/>	$client-&gt;startMultiRequest();<br/>	// the session: <br/>	$kparams = array();<br/>	$client-&gt;addParam( $kparams, 'widgetId', '_' . $partnerId );<br/>	$client-&gt;queueServiceActionCall( 'session', 'startWidgetSession', $kparams );<br/>	// The playlist meta:<br/>	$kparams = array();<br/>	$client-&gt;addParam( $kparams, 'ks', '{1:result:ks}' );<br/>	$client-&gt;addParam( $kparams, 'id', $playlistId );<br/>	$client-&gt;queueServiceActionCall( 'playlist', 'get', $kparams );<br/>	// The playlist entries: <br/>	$client-&gt;queueServiceActionCall( 'playlist', 'execute', $kparams );<br/>	<br/>	$rawResultObject = $client-&gt;doQueue();<br/>	return array(<br/>		'meta' =&gt; (array)$rawResultObject[1],<br/>		'playlist' =&gt; (array)$rawResultObject[2] <br/>	);<br/>}
</pre>
</body>
</html>