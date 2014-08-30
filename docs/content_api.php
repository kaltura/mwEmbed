<?php      // Some includes for output of configuration options
require_once( realpath( dirname( __FILE__ ) ) . '/doc-base.php' );
require_once( realpath( dirname( __FILE__ ) ) . '/api_uivars.php' );
require_once( realpath( dirname( __FILE__ ) ) . '/api_methods.php' );
require_once( realpath( dirname( __FILE__ ) ) . '/api_listeners.php');
require_once( realpath( dirname( __FILE__ ) ) . '/api_evaluates.php' );

	function getDocTypeStr( $param ){
		global $objectDefinitions;
		$typeStr = ( isset( $param['type'] ) )?  $param['type'] : 'String';
		$optionalStr = ( isset( $param['optional'] ) )? ' <i>( Optional )</i> ': '';
		
		if( isset( $param['type'] ) &&  isset( $objectDefinitions[ $param['type'] ] )){
			$typeStr = '<a href="#'. $param['type'] . '">'.$param['type'] . '</a>';
		}
		return  '<span class="vartype">' . $typeStr . '</span> ' . $optionalStr;
	}
	function getObjectDocs( $objName ){
		$o='';
		// support recusive lookup for arrays: 
		if( is_array($objName) ){
			foreach( $objName as $name ){
				$o.= getObjectDocs( $name );
			}
			return $o;
		}
		global $objectDefinitions;
		$o= '<hr></hr>'.
			'<h4 class="linkable objectdoc" id="'. $objName . '">' . $objName . '</h4>' .
			'<div class="docblock">'.
			'<ul>';
		foreach( $objectDefinitions[$objName] as $attrName => $attrObj){
			$o.='<li><b>' . $attrName .'</b> ' . getDocTypeStr( $attrObj ) . ' ' . $attrObj['desc'] . '</li>';
		}
		$o.='<ul>';
		return $o;
	}
	function getDocs( $fnName){
		$o='';
		// support recursive lookup for arrays: 
		if( is_array($fnName) ){
			foreach( $fnName as $name ){
				$o.= getDocs( $name );
			}
			return $o;
		}
		global $methodDocs;
		$paramStr = '';
		$paramBlock = '';
		if( isset(  $methodDocs[$fnName]['params'] ) ){
			$paramBlock.='<h5 class="linkable" id="'. $fnName .'-parameters">PARAMETERS:</h5>'.
					'<ul>';
			$coma = '';
			foreach( $methodDocs[$fnName]['params'] as $paramName => $param ){
				if( isset( $param['optional'] ) && $param['optional'] == true ){
					$paramStr.=$coma . ' [' . $paramName . ']';
				} else{
					$paramStr.=$coma. $paramName;
				}
				
				$paramBlock.= '<li><b>' . $paramName . '</b> '.
						getDocTypeStr( $param ) .
						$param['desc'] .
						"</li>";
				$coma = ', ';
			}
			$paramBlock.='</ul>';
		}
		
		$o= '<hr></hr>'.
			'<h4 class="linkable" id="'. $fnName . '">' . $fnName . ' ('. $paramStr . ')</h4>' . 
			'<span class="description">'. $methodDocs[$fnName]['desc'] . '</span>'. 
			'<div class="docblock">';
		// output parameters if set: 
		$o.= $paramBlock;
		// output returns if set:
		if( isset(  $methodDocs[$fnName]['returns'] ) ){
			$o.='<h5 id="'. $fnName .'-returns">RETURNS:</h5>';
			$o.= '<ul><li>' . getDocTypeStr( $methodDocs[$fnName]['returns']  ) .
			 ' ' . $methodDocs[$fnName]['returns']['desc'] . '</li></ul>';
		}
		// output examples if set:
		if( isset( $methodDocs[$fnName]['examples'] ) ){
			$o.='<h5 class="linkable" id="'. $fnName .'-examples">EXAMPLES:</h5><ul>';
			foreach( $methodDocs[$fnName]['examples'] as $example ){
				$text = '';
				if( !isset( $example['type'] ) ){
					$example['type'] = 'link';
				}
				switch ($example['type']) {
					case 'link':
						$link = ( isset( $example['docPath'] ) ) ?
							'index.php?path=' . $example['docPath']: '';
						if( $link == '' && isset( $example['docFullPath'] ) ){
							$link = '../' . $example['docFullPath'];
						}
						$text = '<a href="'. $link . '">' . $example['name'] . '</a>';
						break;
					case 'code':
						$text = $example['name'] . '<br><pre class="prettyprint linenums">'.htmlspecialchars($example['code']).'</pre>';
						break;
				}
				$o.= '<li>'. $text .'</li>';
			}
			$o.='</ul>';
		}
		// close <div class="docblock">
		$o.='</div>';
		return $o;
	}
	function getOutlineContent( $objectSet ){
		$o='<ul class="outline-vars">';
		foreach( $objectSet as $key => $var ){
			$o.='<li class="linkable" id="'. $key .'">';
			$o.='<span class="key">'. $key . '</span><br>';
			$o.= $var['desc'];
			if( isset( $var['example'] ) && $var['example'] != '' ){
				$o.= '<br><a href="'. $var['example'] . '" target="_blank">Live Example</a>';
			}
			$o.='<br><span class="type">Type</span>: <br>&nbsp;&nbsp;&nbsp;&nbsp;' .$var['type'];
			if( isset( $var['default'] ) && $var['default'] != '' ){
				$o.='<br><span class="default">Default</span>: <br>&nbsp;&nbsp;&nbsp;&nbsp;' .$var['default'];
			}
			if( isset( $var['availability'] ) && $var['availability'] == 'kdp' ){
				$o.= '<br><span class="label label-warning">Legacy Only</span>';
			}
		}
		$o.='</ul>';
		return $o;
	}

	function getTableContent($headers, $param){
		$paramArrayObject = new ArrayObject($param);
		$paramArrayObject->ksort();
		$o = "<table>";
		$o.= "<tr>";
		foreach( $headers as $header ){
			$o.= "<th>".$header."</th>";
		}
		$o.= "</tr>";
		if( is_array($param) ){
			foreach( $paramArrayObject as $key => $value ){
				$restrictedAvailability = false;
				$o.= '<tr class="linkable" id="'. $key .'">';
				$o.= "<td>".$key;
				foreach( $value as $val => $value1){
					if ($val == 'availability' && $value1 == 'kdp'){
						$o.= '<br><span class="label label-warning">Legacy Only</span>';
						$restrictedAvailability = true;
					}
				}
				//if (!$restrictedAvailability)
				//	$o.= '<br><span class="label label-success">Legacy / Universal</span>';
				$o.= "</td>";

				foreach( $value as $val => $value){
					if ($val != 'availability' && $val != 'example')
						$o.= "<td>".$value."</td>";
					if ($val == 'example'){
						if ($value != ''){
								$o.= '<td><a href="'.$value.'" target="_blank">Example</a></td>';
							}else{
								$o.= '<td>-</td>';
							}

						}
				}
/*
				foreach( $value as $val){
						$o.= "<td>".$val."</td>";
				}
				$o.= "</tr>";*/
			}

		}
		$o.= "</table>";
		return $o;
	}

?>
<style>
	ul.outline-vars li {
		list-style-type: circle;
		padding-top:15px;
	}
	ul.outline-vars .key{
		font-weight:800;
		font-size:110%;
	}
	ul.outline-vars .type, ul.outline-vars .default{
		text-decoration: underline;
		font-weight:800;
	}
	.vartype{
		margin: 0px;
		border: 1px solid #DDD;
		background-color: #F8F8F8;
		border-radius: 3px;
		padding: 2px;
	}
	.docblock{
		padding-left:20px;
	}
	.linkable{
		cursor: pointer;
	}
	.objectdoc{
		color:#777;
	}
	table,th,td{
		border:1px solid black;
		border-collapse:collapse;
	}
	th,td{
		padding:5px;
	}
	th{
		text-align:left;
	}
</style>


<script>
//document ready events:
$(function(){
	// make code pretty
	window.prettyPrint && prettyPrint();
	// add linkable actions: 
	$('.linkable').on('click', function(){
		window.location.hash = '#' + $(this).attr('id');
	});
});</script>
<div id="hps-resources"></div>
<h2>Kaltura Player API</h2>
<p>This documentation covers version <strong><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library. </p>
<p>
<a href="#kWidget" class="btn btn btn-info">kWidget API &raquo;</a>
<a href="#uiVars" class="btn btn btn-info">UiVars &raquo;</a>
<a href="#kdpAPI" class="btn btn btn-info">Player API &raquo;</a>
<a href="#kWidgetApi" class="btn btn btn-info">KWidget Server API &raquo;</a>
</p>

<a name="kWidget"></a>
<h2>kWidget Embedding API</h2>
The kWidget API is available after you include the Kaltura player library. kWidget provides embedding and basic utility functions.
<br>Sample Kaltura player library include :
<pre class="prettyprint linenums">
&lt!-- Substitute {partner_id} for your Kaltura partner id, {uiconf_id} for uiconf player id --&gt;
&lt;script src=&quot;http://cdnapi.kaltura.com/p/{partner_id}/sp/{partnerId}00/embedIframeJs/uiconf_id/{uiconf_id}/partner_id/{partnerId}&quot;&gt;&lt;/script&gt;
</pre>
After you include the Kaltura player library, the following kWidget API is available:
<div class="docblock">
	<?php echo getDocs( array( 'kWidget.embed', 'kWidget.thumbEmbed', 'kWidget.getKalturaThumbUrl','kWidget.addReadyCallback','kWidget.destroy' ) ) ?>
	<?php echo getObjectDocs( array( 'kWidget.settingsObject' ) ) ?>
</div><br><br>
<a name="kWidgetApi"></a>
<h3>Server API requests ( kWidget.api )</h3>
kWidget Server API enables direct <a href="http://www.kaltura.com/api_v3/testmeDoc/index.php">Kaltura Server API</a> calls from JavaScript. 
This should not be confused with the <a href="http://www.kaltura.com/api_v3/testme/client-libs.php">JavaScript client library</a>, 
which offers object mappings and works with the code generated in the 
<a href="http://www.kaltura.com/api_v3/testme/index.php">test me console</a>. <br>
The Kaltura Server API offers minimal object validation, in exchange for being much smaller, and included with every kaltura player library include.<br><br>
Creating a kWidget API object, issue a playlist request, log the result:
<pre class="prettyprint linenums">
new kWidget.api( { 'wid' : '_243342', })
	.doRequest({'service':'playlist', 'action': 'execute', 'id': '1_e387kavu'}, 
		function( data ){
			console.log( data );
		}
	);
</pre>
<div class="docblock">
	<?php echo getDocs('kWidget.api' ) ?>
	<?php echo getObjectDocs( array( 'kWidget.apiOptions' ) ) ?>
</div>

<a name="uiVars"></a>
<h2>Player Configuration key value pairs ( UiVars )</h2>
<p>
	<?php
		foreach( $uiVars as $key => $na){
			echo '<a href="#uiVars' . ucfirst( $key ) . '" class="btn btn btn-info">' . 
				ucfirst( $key ) . ' &raquo;</a>&nbsp;';
		}
	?>

</p>
UiVars enable configuration of all player features. There are two classes of UiVars: 
<ul>
	<li>top level configuration options</li>  
	<li>plugins configuration options</li>
</ul>
These values can be set a few ways:<br> <br> 
<p>
Within the <a href="http://knowledge.kaltura.com/universal-studio-information-guide">player studio</a>
UiVar configuration appears plugins -> uivars:<br>
<img src="http://knowledge.kaltura.com/sites/default/files/styles/large/public/ui_variables_2.png">
</p>
<p>
You can control the raw JSON code for UiVars by modifying the "uiVars" section of the JSON config using the <a href="http://player.kaltura.com/kWidget/tests/PlayerVersionUtility.html">player version utility</a>. 
</p>
<pre class="prettyprint linenums">
{
   "plugins":{
	/* plugins go here */
   },
   "uiVars": [{
	"key": "autoPlay",
	"value": false,
	"overrideFlashvar": false
   }]
}
</pre>
Player configuration can be set at embed time as "flashvars": 
<pre class="prettyprint linenums">
kWidget.embed({
	...
	flashvars:{
		"autoPlay": false
	}
})
</pre>

</pre>
All player properties can also be retrieved at runtime or used in plugins macro evaluations. 
<pre class="prettyprint linenums">
kWidget.addReadyCallback( function(playerId){
	alert( document.getElementById( playerId ).evaluate("{autoPlay}") );
})
</pre>
<br>

<?php
	foreach( $uiVars as $key => $uiVarSet ){
		echo '<h2 class="linkable objectdoc" id="uiVars' . ucfirst($key) . '">' . ucfirst($key) . '</h2>';
		if( $uiVarSet['desc'] ){
			echo '<p>'. $uiVarSet['desc'] . '</p>';
		}
		// print all the vars: 
		echo '<div class="docblock">' . 
			getOutlineContent( $uiVarSet['vars']) . 
			'</div><br>';
	}
?>

</div><br><br>
<h3>KDP Components & Plugins:</h3>
<p>Using a standard OOP dot notation, each KDP component and plugin attribute can be overridden via Flashvars: objectId.parameter=value.<br>For example, to set the playlist to load automatically, pass the following Flashvar: playlistAPI.autoPlay=true</p><br><br>

Code sample:<br>
<pre class="prettyprint linenums">
kWidget.embed({
  "targetId": "kaltura_player_1402219661",
  "wid": "_1645161",
  "uiconf_id": 24231962,
  "flashvars": {
		'autoMute': true,
		'autoPlay': false,
		'adsOnReplay': true,
		'imageDefaultDuration': 5,
		'mediaProxy.preferedFlavorBR': 1400,
		'closedCaptions': {
				'layout': 'ontop',
				'useCookie': true,
				'defaultLanguageKey': 'en',
				'fontsize': 12,
				'bg' : '0x335544',
				'fontFamily' : 'Arial',
				'fontColor' : '0xFFFFFF',
				'useGlow' : 'false',
				'glowBlur': 4,
				'glowColor': '0x133693'
				}
  },
  "cache_st": 1402219661,
  "entry_id": "1_a3njcsia"
});
</pre>

<br><br>
<a name="kdpAPI"></a>

 <h2>Player API</h2>
<p>The JavaScript API is a two-way communication channel that lets the player communicate what it is doing and lets you instruct the player to perform operations.
<br>For more information: <a href="http://knowledge.kaltura.com/javascript-api-kaltura-media-players#UnderstandingtheJavaScriptAPIWorkflow" target="_blank">JavaScript API for Kaltura Media Players</a></p>
<p>Available JavaScript API:</p>
<a href="#kWidget.addReadyCallback-desc">1. Receiving notification that the player API is ready</a><br>
<a href="#sendNotification-desc">2. Calling a player method from JavaScript</a><br>
<a href="#addJsListener-desc">3. Registering to a player event</a><br>
<a href="#api4">4. Un-registering a player event</a><br>
<a href="#api5">5. Retrieving a player property</a><br>
<a href="#api6">6. Setting a player attribute</a><br>


<a name="kWidget.addReadyCallback-desc"></a>
<h3>1. Receiving notification that the player API is ready</h3>
<p>See <a href="#kWidget.addReadyCallback">kWidget.addReadyCallback</a> or the "readyCallback" method.</p>

<a name="sendNotification-desc"></a>
<h3>2. Calling a player method from JavaScript</h3>
<p>Use the <b>sendNotification</b> method to create custom notifications that instruct the player to perform an action, such as play, seek, or pause.</p>
<?php echo getDocs( array( 'sendNotification' ) ) ?>
<br><br><p>Available Notifications:</p>
<?php echo getTableContent( array( 'Notification', 'Params', 'Description' ), $methods ) ?>
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
&lt;script language="JavaScript"&gt;
	var kdp;
	function jumpToTime(timesec)
	{
		kdp.sendNotification("doPlay");

		// Moves to a specific point, defined in seconds from the start of the video
		kdp.sendNotification("doSeek", timesec);
	}
&lt;/script&gt;
</pre>
<a name="addJsListener-desc"></a>
<h3>3. Registering to a player event</h3>
<p>Use the <b>addJsListener</b> method to listen for a specific notification that something happened in the player, such as the video is playing or is paused.</p>
<?php echo getDocs( array( 'addJsListener' ) ) ?>
<br><h5>Player Life Cycle:</h5>
<?php echo getTableContent( array( 'Event', 'Parameters', 'Description' ), $listeners1 ) ?>
<br><br><h5>Player Information:</h5>
<?php echo getTableContent( array( 'Event', 'Parameters', 'Description' ), $listeners2 ) ?>
<br><br><h5>Player Advertisement Related Notifications:</h5>
<?php echo getTableContent( array( 'Event', 'Parameters', 'Description' ), $listeners3 ) ?>
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
kdp.addJsListener(“playerUpdatePlayhead”, “playerUpdatePlayheadHandler”)
function playerUpdatePlayheadHandler(data, id) {
	// data = the player's progress time in seconds
	// id = the ID of the player that fired the notification
}
</pre>


<a name="api4"></a>
<h3>4. Un-registering a player event</h3>
<p>Use the <b>removeJsListener</b> method to remove a listener that is no longer needed.</p>
<h5>Why Remove a JsListener?</h5>
KDP3 accumulates JsListeners. If you add a JsListener for a notification and then add another JsListener for the same notification, the new JsListener does not override the previous one. Both JsListeners are executed in the order in which they are added. To prevent unexpected behavior in your application, Kaltura recommends that you remove unnecessary JsListeners.
When you remove a listener, you must specify the associated function name.
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
removeJsListener("event", "functionName")
</pre>


<a name="api5"></a>
<h3>5. Retrieving a player property</h3>
<p>Use the <b>evaluate</b> method to find out something about a player by extracting data from player components.</p>
<?php echo getDocs( array( 'evaluate' ) ) ?>
<br><br><p>Available Properties:</p>
<?php echo getTableContent( array( 'Property', 'Description' ), $evaluates ) ?>
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
function getName() {
var entry_name = kdp.evaluate('{mediaProxy.entry.name}');
	alert('Entry name: '+entry_name);
}
</pre>


<a name="api6"></a>
<h3>6. Setting a player attribute</h3>
<p>Use the <b>setKDPAttribute</b> method to change a player attribute by setting its value.</p>
<br>Code sample:<br>
<pre class="prettyprint linenums">
kdp.setKDPAttribute("configProxy.flashvars","autoPlay","true")
</pre>
<br><p>Some plugins support runtime updates using <b>setKDPAttribute</b>.
<br>For example, the "theme" plugin supports such updates:</p>
<pre class="prettyprint linenums">
var kdp = document.getElementById('kVideoTarget');
kdp.setKDPAttribute("theme", "buttonsSize", "14");
</pre>
<?php echo getDocs( array( 'setKDPAttribute' ) ) ?>
