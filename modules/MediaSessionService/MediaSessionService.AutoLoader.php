<?php 
return array(
	// service entry points:
	'ServiceM3u8Segment' => 'apiServices/ServiceM3u8Segment.php',
	'ServiceM3u8Stream' => 'apiServices/ServiceM3u8Stream.php',
	'ServiceMediaSession' => 'apiServices/ServiceMediaSession.php',
	'BaseStreamHandler' => 'apiServices/BaseStreamHandler.php',
		
	// supporting libs:
	'M3U8StreamManifestHandler' => 'includes/M3U8StreamManifestHandler.php',
	'BaseStreamHandler' => 'includes/BaseStreamHandler.php',
	'M3u8Parser' => 'includes/M3u8Parser.php'
);