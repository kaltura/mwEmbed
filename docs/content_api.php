<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/doc-base.php' );
	
	/* should ideally auto generate or be in a separate file */
	$methodDocs = array(
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
					'type' => 'link',
					'name' => 'kWidget.embed',
					'docPath' => 'kwidget'
				),
				array(
				    'type' => 'link',
					'name' => 'kWidget.embed playlist',
					'docFullPath' => 'modules/KalturaSupport/tests/kWidget.embed.playlist.qunit.html '
				)
			)
		),
		'kWidget.thumbEmbed' => array(
			'desc'=>'Used to embed a thumbnail, with kWidget.embed settings used for a player on click.',
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
					'type' => 'link',
					'name' => 'kWidget.thumbEmbed',
					'docPath' => 'thumb'
				)
			)
		),
		'sendNotification' => array(
			'desc'=>'Call a KDP notification (perform actions using this API, for example: play, pause, changeMedia, etc.)',
			'params' => array(
				'notificationName' => array(
					'type' => 'String',
					'desc' => 'The name of notification to call',
				),
				'notificationData'=> array(
					'type' => 'Object',
					'optional' => true,
					'desc' => 'The custom data to pass with the notification.'
				)
			)
		),
		'addJsListener' => array(
			'desc'=>'Register a javascript handler function for a KDP notification',
			'params' => array(
				'listenerString' => array(
					'type' => 'String',
					'desc' => 'The name of the notification to listen to',
				),
				'jsFunctionName'=> array(
					'type' => 'String',
					'desc' => 'The name of the JavaScript handler function'
				)
			)
		),
		'evaluate' => array(
			'desc'=>"Retrieve the value of a KDP model property or component's property using the standard OOP dot notation inside curly brackets",
			'params' => array(
				'object.property.properties' => array(
					'type' => 'String',
					'desc' => 'the reference to the component object with data that you want to extract. Enclose the reference in curly braces within single or double quotation marks.',
				)
			)
		),
		'setKDPAttribute' => array(
			'desc'=>"Change a value of a KDP model property or component's property using the standard OOP dot notation.",
			'params' => array(
				'object' => array(
					'type' => 'String',
					'desc' => 'A string that represents the object you want to modify. Use standard dot notation to specify sub-objects, for example, configProxy.flashvars'
				),'property' => array(
					'type' => 'String',
					'desc' => 'The player property that you want to modify.'
				),'value' => array(
					'type' => 'String',
					'desc' => 'The new value that you want to set for the player property.'
				)
			)
		),
		'jsCallbackReady' => array(
			'desc'=>"A javascript function on the hosting web page that will be called by KDP when setup of externalInterface APIs is completed.",
			'params' => array(
				'objectId' => array(
					'type' => 'String',
					'desc' => 'Represents the identifier of the player that is embedded.'
				)
			)
		)
	);
	$objectDefinitions = array(
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

	$uiVars = array(
        'kalturaLogo.visible' => array(
            'type' => 'Boolean',
            'desc' => 'Used to control the Kaltura player logo. Commonly used when white labeling the Kaltura player.'
        ),
        'kalturaLogo.kClick' => array(
            'type' => 'String',
            'desc' => 'JavaScript code to execute upon logo click.'
        )
    );

	$methods = array(
        'doPause' => array(
            'body' => 'None',
            'desc' => 'Command the player to pause.'
        ),
        'doPlay' => array(
            'body' => 'None',
            'desc' => 'Command the player to play.'
        ),
        'doStop' => array(
            'body' => 'None',
            'desc' => 'Do stop command to the player. Pause and move the playhead to 0.'
        ),
        'doSeek' => array(
            'body' => 'Position to seek to',
            'desc' => 'Do seek command to the player.'
        ),
        'doSwitch' => array(
            'body' => 'New stream bitrate',
            'desc' => 'Do switch command for manual switching between streams within the resource.'
        ),
        'cleanMedia' => array(
            'body' => 'None',
            'desc' => 'cleans the media from the player.'
        )
    );

	$listeners = array(
        'startUp' => array(
            'body' => 'Root of the application',
            'desc' => 'The first command that register the main proxys and main view mediator.'
        ),
        'initiatApp' => array(
            'body' => 'None',
            'desc' => 'Start the init macro commands.'
        ),
        'skinLoaded' => array(
            'body' => 'None',
            'desc' => 'Dispatched when the skin is loaded.'
        ),
        'skinLoadFailed' => array(
            'body' => 'None',
            'desc' => 'Dispatched when skin load failed.'
        ),
        'sourceReady' => array(
            'body' => 'None',
            'desc' => 'When the source is ready we can set the media element to the media player.'
        ),
        'kdpReady' => array(
            'body' => 'None',
            'desc' => 'Notify that the application is ready to be used and events can be listened to and that the loaded entry is ready to be played.'
        )
    );

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
                $o.= "<tr>";
                $o.= "<td>".$key."</td>";
                foreach( $value as $val ){
                    $o.= "<td>".$val."</td>";
                }
                $o.= "</tr>";
            }

        }
        $o.= "</table>";
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
<a href="#kWidget" class="btn btn btn-info btn-large">kWidget API &raquo;</a>
<a href="#uiVars" class="btn btn btn-info btn-large">Using UI Vars &raquo;</a>
<a href="#kdpAPI" class="btn btn btn-info btn-large">Player API &raquo;</a>
</p>

<a name="kWidget"></a>
<h2>kWidget API</h2>
kWidget API is available after a Kaltura player library include. kWidget provides embedding and basic utility functions.
Sample Kaltura player library include : 
<pre class="prettyprint linenums">
&lt!-- Substitute {partner_id} for your Kaltura partner id, {uiconf_id} for uiconf player id --&gt;
&lt;script src=&quot;http://cdnapi.kaltura.com/p/{partner_id}/sp/{partnerId}00/embedIframeJs/uiconf_id/{uiconf_id}/partner_id/{partnerId}&quot;&gt;&lt;/script&gt;
</pre>
Once embed the following API is available: 
<div class="docblock">
	<h3>Embedding</h3>
	<?php echo getDocs( array( 'kWidget.embed', 'kWidget.thumbEmbed' ) ) ?>
	<?php echo getObjectDocs( array( 'kWidget.settingsObject' ) ) ?>
</div><br><br>

<a name="uiVars"></a>
<h2>Using UI Vars</h2>
<p>To simplify the management of many of the player features, Kaltura has implemented the “UIVars” to override and configure player features.</p>
<p>Kaltura UIVars are an incredibly powerful feature of the Kaltura Players which allow publishers to pre-set or override the value of any FlashVar (object level parameters), show, hide and disable existing UI element, add new plugins and UI elements to an existing player, and modify attributes of all the player's elements.</p>
<p>FlashVars are configuration variables that are set to the Kaltura Player in the HTML embed code and work for “regular” static embed, server-generated embed or JavaScript-generated embed code.  Below is a list of all the Kaltura Player FlashVars.</p>
<br><br>
<div class="docblock">
	<?php echo getTableContent( array( 'Ui Var', 'Type', 'Description' ), $uiVars ) ?>
</div><br><br>
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
		'mediaProxy.preferedFlavorBR': 1400
  },
  "cache_st": 1402219661,
  "entry_id": "1_a3njcsia"
});
</pre>

<br><br>
<a name="kdpAPI"></a>

<h2>Player API</h2>
<p>The JavaScript API is a two-way communication channel that lets the player tell you what it is doing and lets you tell the player to do things.
<br>For more information: <a href="http://knowledge.kaltura.com/javascript-api-kaltura-media-players#UnderstandingtheJavaScriptAPIWorkflow" target="_blank">JavaScript API for Kaltura Media Players</a></p>

<h3>Receiving Notification that the Player API Is Ready </h3>
<p>Before you can use the JavaScript API's base methods, the player has to reach the point in its internal loading sequence when it is ready to interact with your code. The player lets you know that it is ready by calling the <b>jsCallbackReady</b> JavaScript function on the page.</p>
<p>jsCallbackReady is the player's first callback. The player passes jsCallbackReady an objectId parameter that represents the identifier of the player that is embedded on the page.</p>
<?php echo getDocs( array( 'jsCallbackReady' ) ) ?>
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
function jsCallbackReady(objectId) {
    window.kdp = document.getElementById(objectId);
}
</pre>
<p>Kaltura recommends that you place jsCallbackReady in the global scope. This allows easily finding this critical function in the JavaScript code.</p><br><br>

<h3>Calling a player method from JavaScript</h3>
<p>Use the <b>sendNotification</b> method to create custom notifications that tell the player to do something, such as play, seek, or pause.</p>
<?php echo getDocs( array( 'sendNotification' ) ) ?>
<br><br><p>Available Notifications:</p>
<?php echo getTableContent( array( 'Notification', 'Body', 'Description' ), $methods ) ?>
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
//TBD
</pre>

<h3>Registering to a player event</h3>
<p>Use the <b>addJsListener</b> method to listen for a specific notification that something happened in the player, such as the video is playing or is paused.</p>
<?php echo getDocs( array( 'addJsListener' ) ) ?>
<br><br><p>Available Listeners:</p>
<?php echo getTableContent( array( 'Notification', 'Body', 'Description' ), $listeners ) ?>
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
kdp.addJsListener(“playerUpdatePlayhead”, “playerUpdatePlayheadHandler”)
function playerUpdatePlayheadHandler(data, id) {
    // data = the player's progress time in seconds
    // id = the ID of the player that fired the notification
}
</pre>

<h3>Un-registering a player event</h3>
<p>Use the <b>removeJsListener</b> method to remove a listener that is no longer needed.</p>
<h5>Why Remove a JsListener?</h5>
KDP3 accumulates JsListeners. If you add a JsListener for a notification and then add another JsListener for the same notification, the new JsListener does not override the previous one. Both JsListeners are executed in the order in which they are added. To prevent unexpected behavior in your application, Kaltura recommends that you remove unnecessary JsListeners.
When you remove a listener, you must specify the associated function name.
<br><br>Code sample:<br>
<pre class="prettyprint linenums">
removeJsListener("event", "functionName")
</pre>

<h3>Retrieving a player property</h3>
<p>Use the <b>evaluate</b> method to find out something about a player by extracting data from player components.</p>
<?php echo getDocs( array( 'evaluate' ) ) ?>
<br><br><p>Available Properties:</p>

<br><br>Code sample:<br>
<pre class="prettyprint linenums">
function getName() {
var entry_name = kdp.evaluate('{mediaProxy.entry.name}');
    alert('Entry name: '+entry_name);
}
</pre>

<h3>Setting a player attribute</h3>
<p>Use the <b>setKDPAttribute</b> method to change something about a player by setting player attribute values.</p>
<?php echo getDocs( array( 'setKDPAttribute' ) ) ?>
<br><br><p>Available Attributes:</p>

<br><br>Code sample:<br>
<pre class="prettyprint linenums">
kdp.setKDPAttribute("configProxy.flashvars","autoPlay","true")
</pre>