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
					'name' => 'kWidget.embed',
					'docPath' => 'kwidget'
				),
				array(
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
					'name' => 'kWidget.thumbEmbed',
					'docPath' => 'thumb'
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
<div class="docblock">

<?php echo getTableContent( array( 'Ui Var', 'Type', 'Description' ), $uiVars ) ?>

</div><br><br>


<!--br><br><br>
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

<h3>All plugins:</h3-->