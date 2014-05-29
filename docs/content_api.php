<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/doc-base.php' );
	
	/* should ideally auto generate or be in a seperate file */
	$methodDocs = array(
		'kWidget' => array(
			'kWidget.embed' => array(
				'desc'=>'Used to embed the Kaltura player against an element target in the DOM',
				'params' => array(
					''
				)
			),
		)
	);
?>
<script src="js/doctrine.js"></script>
<script>
// TODO in production mode preset parsed docs:
var parsedDocs;
// List of resources to parse:
var sourceFiles = [
                   '../kWidget/kWidget.js'
                   ]

function getParsedDocs(){
	return $.when( $.get(sourceFiles[0]) ).done( function (res1) {
		
	});
}

function getMethodDoc( methodName ){
	parsedDocs = parsedDocs || getParsedDocs();
	return parsedDocs;
}

// when document ready, and all script loaded
getMethodDoc('kWidget');
</script>

<div id="hps-resources"></div>
<h3>Kaltura Player API</h3>
This documentation covers version 
	<strong><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library.		

<h3>JavaScript API</h3>
Kaltura player provide a complete integration with it's hosting environment event binding functions. 
<h4>kWidget API</h4>
kWidget is recomended to be used for player integrations. <br>
It was introduced with the HTML5 based player and offer a friendly javascript interface for palyer interacitons.  <br>
<h5>Embedding</h5>
<ul>
	<li>
		<h5>kWidget.embed( [targetId], settings )</h5>
		<b>targetId</b> ( optional )
	<li> 
</ul>
Notifications: Notifications are both actions and events; (e.g. play and pause). To know when a notification was dispatched add a listener to the notification name using the addJsListener (e.g. addJsListener('play');) and to make Kdp perform an action dispatch the notification using sendNotification (e.g. sendNotification('play')); For a list of notifications see the Notifications leaf in this tree
Attributes: At run-time any public Kdp parameter or object properties in Kdp can be retrieved or changed via JavaScript; use evaluate method to get the values of various attributes or object properties and use the setKDPAttribute method to change it's value

<h4>Legacy KDP API</h4>
 jsCallbackReady
A javascript function on the hosting web page that will be called by KDP when setup of externalInterface APIs is completed. When setting sourceType=entryId, it is advised to use kdpReady instead of this event. Value should be the name of a function to be used as the handler in the hosting page
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