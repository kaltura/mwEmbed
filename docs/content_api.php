<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/doc-base.php' );
	
	/* should ideally auto generate or be in a separate file */
	
	$kWidgetApiDoc = array(
		'kWidget.api' => array(
			'desc' => 'The kWidget API object, used to create new instances of Kaltura API request.',
			'params' => array(
				'apiObject'=> array(
					'type' => 'kWidget.apiOptions',
					'desc' => 'Object of API settings to be used in API requests.'
				)
			),
			'methods'=> array(
				'doRequest' => array(
					'type' => 'function',
					'desc' => "( RequestObject, callback ) Run the API request, issue callback with API response data."
				)
			),
			'returns' => array(
				'type' => 'kWidget.api',
				'desc' => 'Returns an instance of the kWidget API object.'
			),
			'examples' => array(
				array(
					'name' => 'kWidget.api',
					'docFullPath' => 'kWidget/tests/kWidget.api.html'
				),
				array(
					'name' => 'kWidget.getSources',
					'docFullPath' => 'modules/KalturaSupport/tests/kWidget.getSources.html'
				)
			)
		)
	);
	$kWidgetDocs = array(
		'kWidget.embed' => array(
			'desc'=>'Used to embed the Kaltura player against an element target in the DOM',
			'params' => array(
				'targetId' => array(
					'type' => 'String', // assumed
					'optional' => true, 
					'desc' => 'The DOM player target id attribute string. ( if not included, you must include targetId in "settings" object',
				),
				'settings'=> array(
					'type' => 'kWidget.settingsObject',
					'desc' => 'Object of settings to be used in embedding.'
				)
			),
			'returns' => array(
				'type' => 'boolean|null',
				'desc' => 'Returns boolean false if id not found'
			),
			'examples' => array(
				array(
					// either doc name or path can be defined ( for feature listed files vs non-feature listed )
					'name' => 'kWidget.embed',
					'docPath' => 'kwidget'
				),
				array(
					'name' => 'kWidget.embed playlist',
					'docFullPath' => 'modules/KalturaSupport/tests/kWidget.embed.playlist.qunit.html'
				)
			)
		),
		'kWidget.thumbEmbed' => array(
			'desc'=>'Used to embed a thumbnail player. When the user clicks on the thumbnail kWidget.embed will be called with the provided settings.',
			'params' => array(
				'targetId' => array(
					'type' => 'String', // assumed
					'optional' => true,
					'desc' => 'The DOM player target id attribute string. ( if not included, you must include targetId in "settings" object',
				),
				'settings'=> array(
					'type' => 'kWidget.settingsObject',
					'desc' => 'Object of settings to be used in embedding.'
				)
			),
			'examples' => array(
				array(
					// either doc name or path can be defined ( for feature listed files vs non-feature listed )
					'name' => 'kWidget.thumbEmbed',
					'docPath' => 'thumb'
				)
			)
		),
		'kWidget.addReadyCallback' => array(
			'desc' => 'Adds a ready callback to be called once the kdp or html5 player is ready', 
			'params' => array(
				'readyCallback' => array(
					'type' => 'function', 
					'desc' => 'Called when players are ready for JavaScript bindings. The callback will include the player id as callback argument.'
				)
			),
			'examples' => array(
				array(
					'name' => 'External Resources',
					'docPath' => 'ExternalResources'
				),
				array(
					'name' => 'kWidget.embed',
					'docPath' => 'kwidget'
				)
			)
		),
		'kWidget.destroy' => array(
			'desc'=>'Used to safely remove a player reference and event bindings from the DOM.',
			'params' => array(
				'targetId' => array(
					'type' => '{Element|String}', // assumed
					'optional' => true,
					'desc' => 'The target element or id of the target element to be removed from he DOM.',
				)
			),
			'examples' => array(
				array(
					// either doc name or path can be defined ( for feature listed files vs non-feature listed )
					'name' => 'kWidget.embed',
					'docPath' => 'kwidget'
				)
			)
		),
		'kWidget.supportsHTML5' => array(
			'desc'=> 'Used to check if the current browser instance supports HTML5',
			'returns' => array(
				'type' => 'boolean',
				'desc' => '<i>true</i> if browser supports HTML5.'
			),
		)
	);
	$objectDefinitions = array(
		'kWidget.apiOptions' => array(
			'wid'=> array(
				'desc' => "The partner id to be used in the API request."
			),
			'ks' => array(
				'desc' => "The Kaltura secret to be used in the request, if not supplied an anonymous KS will be generated and used."
			), 
			'serviceUrl' => array(
				'desc' => 'Can be overwritten to target a different Kaltura server.',
				'default' => 'http://cdnapi.kaltura.com'
			),
			'serviceBase' => array(
				'desc' => "Can be overwritten to alternate kaltura service path.",
				'default' => '/api_v3/index.php?service='
			),
			'statsServiceUrl' => array(
				'desc' => "Default supplied via kaltura library include, can be overwritten to alternate URL for core analytics events.",
				'default' => 'http://stats.kaltura.com'
			),
			'disableCache' => array(
				'desc' => "Sends no-cache param to API, for a fresh result. Can hurt performance and CDN cachability should be used sparingly.",
				'default' => 'false'
			)
		),
		'kWidget.settingsObject' => array(
			'targetId' => array(
				'desc' => 'The DOM player target id attribute string. If not defined as top level param.'
			),
			'wid' => array(
				'desc' => 'Widget id, usually the partner id prefixed by underscore'
			),
			'uiconf_id' => array(
				'type' => 'Number',
				'optional' => true,
				'desc' => 'The player uiconf_id'
			),
			'entry_id' => array(
				'desc' => 'The content entry id, can be left empty for JavaScript based entry id insert or in playlist based players.' 
			),
			'flashvars' => array(
				'type' => 'Object',
				'desc' => 'Runtime configuration object, can override arbitrary UiVars and plugin config.'
			),
			'params' => array(
				'type' => 'Object',
				'desc' => 'Runtime configuration object, can override arbitrary UiVars and plugin config.'
			),
			'cache_st' => array(
				'optional'=> true,
				'desc' => 'String to burst player cache'
			)
		)
	);
	
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
	$methodDocs = null;
	function getDocs( $fnName ){
		global $methodDocs;
		$o='';
		// support recursive lookup for arrays: 
		if( is_array($fnName) ){
			$methodDocs = $fnName;
			foreach( $fnName as $fname => $na){
				$o.= getDocs( $fname );
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
		// output methods if set:
		if( isset(  $methodDocs[$fnName]['methods'] ) ){
			$o.='<h5 id="'. $fnName .'-methods">METHODS:</h5>';
			$o.= '<ul>';
			foreach( $methodDocs[$fnName]['methods'] as $paramName => $param ){
				$o.='<li><b>' . $paramName . '</b> '.
						getDocTypeStr( $param ) .
						$param['desc'] .  '</li>';
			}
			$o.='</ul>';
		}
		// output returns if set:
		if( isset(  $methodDocs[$fnName]['returns'] ) ){
			$o.='<h5 id="'. $fnName .'-returns">RETURNS:</h5>';
			$o.= '<ul><li>' . getDocTypeStr( $methodDocs[$fnName]['returns']  ) .
			 ' ' . $methodDocs[$fnName]['returns']['desc'] . '</li></ul>';
		}
		// output examples if set:
		if( isset( $methodDocs[$fnName]['examples'] ) ){
			$o.='<h5 class="linkable" id="'. $fnName .'-examples">EXAMPLES:</h5>';
			$coma = '';
			foreach( $methodDocs[$fnName]['examples'] as $example ){
				$link = ( isset( $example['docPath'] ) ) ? 
					'index.php?path=' . $example['docPath']: '';
				if( $link == '' && isset( $example['docFullPath'] ) ){
					$link = '../' . $example['docFullPath'];
				}
				$o.= $coma . '<a href="'. $link . '">' . $example['name'] . '</a>';
				$coma = ', ';
			}
		}
		// close <div class="docblock">
		$o.='</div>';
		return $o;
	}
?>
<style>
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
This documentation covers version 
	<strong><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library.

<h3>kWidget API</h3>
kWidget API is an on-page player api, available after a Kaltura player library include. kWidget provides embedding and basic utility functions.<br><br>
Here is a sample Kaltura player library include : 
<pre class="prettyprint linenums">
&lt!-- Substitute {partner_id} for your Kaltura partner id, {uiconf_id} for uiconf player id --&gt;
&lt;script src=&quot;http://cdnapi.kaltura.com/p/{partner_id}/sp/{partnerId}00/embedIframeJs/uiconf_id/{uiconf_id}/partner_id/{partnerId}&quot;&gt;&lt;/script&gt;
</pre>
Once the kaltura HTML5 lib is included, the following API is available: 
<div class="docblock">
	<?php echo getDocs( $kWidgetDocs ) ?>
	<?php echo getObjectDocs( array( 'kWidget.settingsObject' ) ) ?>
</div>

<h3>Server API requests ( kWidget.api )</h3>
kWidget Server API enables direct <a href="http://www.kaltura.com/api_v3/testmeDoc/index.php">Kaltura Server API</a> calls from JavaScript. 
This should not be confused with the <a href="http://www.kaltura.com/api_v3/testme/client-libs.php">JavaScript client library</a>, 
which offers object mappings and works with the code generated in the 
<a href="http://www.kaltura.com/api_v3/testme/index.php">test me console</a>. <br><br>
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
	<?php echo getDocs( $kWidgetApiDoc ) ?>
	<?php echo getObjectDocs( array( 'kWidget.apiOptions' ) ) ?>
</div>

<br><br><br>
<h3>On Page, KDP Player API</h3>
Once you have embeded the player, and the ready callback has been issued you can now 
start adding bindings to events, triggering actions or chaning attributes. 
<br><br>
To grab an instance of the player:
<pre class="prettyprint linenums">
kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById( playerId );
});
</pre>
<h4>KDP API</h4>
<div class="docblock">
	<?php echo getDocs( $kdpApi ) ?>
</div>
Notifications: Notifications are both actions and events; (e.g. play and pause). To know when a notification was dispatched add a listener to the notification name using the addJsListener (e.g. addJsListener('play');) and to make Kdp perform an action dispatch the notification using sendNotification (e.g. sendNotification('play')); For a list of notifications see the Notifications leaf in this tree
Attributes: At run-time any public KDP parameter or object properties in Kdp can be retrieved or changed via JavaScript; use evaluate method to get the values of various attributes or object properties and use the setKDPAttribute method to change it's value
<h4>Legacy KDP API</h4>
 jsCallbackReady
A JavaScript function on the hosting web page that will be called by KDP when setup of externalInterface APIs is completed. When setting sourceType=entryId, it is advised to use kdpReady instead of this event. Value should be the name of a function to be used as the handler in the hosting page
Default: 
undefined
 addJsListener(listenerString:String, jsFunctionName:String)
Register a javascript handler function for a KDP notification
Parameters: 
listenerString: The name of the notification to listen to
jsFunctionName: The name of the JavaScript handler function
 removeJsListener(listenerString:String, jsFunctionName:String)
Remove a listener to KDP notofication
Parameters: 
listenerString: The name of the notification to listen to
jsFunctionName: The name of the JavaScript handler function
 sendNotification(notificationName:String, notificationData:Object)
Call a KDP notification (perform actions using this API, for example: play, pause, changeMedia, etc.)
Parameters: 
notificationName: The name of notification to call
notificationData: the custom data to pass with the notification
<h3>Native SDK API</h3>

<h3>Evaluatble Properties</h3>

<h3>On Page / App, Public Notifications</h3>
This is the public api
<h4>Player Buildout</h4>
<h4>Player States</h4>
<h4>Playback Actions</h4>
<h4>Add related</h4>

<h3>Iframe in player plugins, Public Events</h3>
This API should be used when building player plugins that run inside the iframe
<h4>Player Buildout</h4>
<h4>Player States</h4>
<h4>Playback Actions</h4>
<h4>Add related</h4>

<h3>All plugins:</h3>