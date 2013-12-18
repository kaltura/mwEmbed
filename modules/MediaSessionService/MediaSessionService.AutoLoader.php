<?php 
return array(
	// service entry points:
	'ServiceM3u8Segment' => 'apiServices/ServiceM3u8Segment.php',
	'ServiceM3u8Stream' => 'apiServices/ServiceM3u8Stream.php',
	'ServiceMediaSession' => 'apiServices/ServiceMediaSession.php',
	'ServiceMediaSequence' => 'apiServices/ServiceMediaSequence.php',
	
	'BaseStreamService' => 'apiServices/BaseStreamService.php',
		
	// supporting libs:
	'M3U8StreamManifestHandler' => 'includes/M3U8StreamManifestHandler.php',
	'BaseStreamService' => 'includes/BaseStreamService.php',
	'M3u8Handler' => 'includes/M3u8Handler.php',
	'MediaSessionVastHandler' => 'includes/MediaSessionVastHandler.php',
	'KalturaAdUrlHandler' => 'includes/KalturaAdUrlHandler.php',
	'WebsocketLogger' => 'includes/WebsocketLogger.php'
);