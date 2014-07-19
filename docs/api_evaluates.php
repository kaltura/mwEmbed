<?php
	$evaluates = array(
		'isHTML5' => array(
			'desc' => 'A flag specifying if the current player is an HTML5 player (Universal player)',
		),
		'sequenceProxy.timeRemaining' => array(
			'desc' => 'Time remaining until the end of the current ads sequence',
		),
		'sequenceProxy.duration' => array(
			'desc' => 'The total duration of the current ad set.',
		),
		'sequenceProxy.isInSequence' => array(
			'desc' => 'A flag specifying if the player is currently playing ads',
		),
		'sequenceProxy.skipOffsetRemaining' => array(
			'desc' => 'During ad playback, the time remaining until the Skip button appears',
		),
		'sequenceProxy.activePluginMetadata' => array(
			'desc' => 'Metadata object of the plugin currently playing the ads sequence',
		),
		'video.volume' => array(
			'desc' => 'The volume of the currently playing video (0-1)',
		),
		'video.player.currentTime' => array(
			'desc' => 'The current video time in seconds',
		),
		'duration' => array(
			'desc' => 'Current video duration in seconds',
		),
		'mediaProxy.entryCuePoints' => array(
			'desc' => 'Array of cue points if defined for the current media',
		),
		'mediaProxy.entryMetadata' => array(
			'desc' => 'Metadata object for the current entry',
		),
		'mediaProxy.entry' => array(
			'desc' => 'Returns all entry properties for the currently active entry.',
		),
		'mediaProxy.isLive' => array(
			'desc' => 'Returns true, if the the current entries live broadcast is active.',
		),
		'mediaProxy.isOffline' => array(
			'desc' => 'Returns true if the current entries live broadcast is offline.',
		),
		'mediaProxy.kalturaMediaFlavorArray' => array(
			'desc' => 'An array holding all available flavours for the current media',
		),
		'configProxy' => array(
			'desc' => 'The player configuration object. Allows access to all UI vars and plugin properties',
		),
		'playerStatusProxy.kdpStatus' => array(
			'desc' => 'The player status. Can be "empty" or "ready"',
		),
		'playerStatusProxy.loadTime' => array(
			'desc' => 'The time it took to load the player on the page',
		),
		'playlistAPI.dataProvider' => array(
			'desc' => 'The data provider of a play list holding all the entries for this list',
		),
		'utility.random' => array(
			'desc' => 'Utility for generating a random number',
		),
		'utility.timestamp' => array(
			'desc' => 'Utility for generating the current time stamp',
		),
		'utility.referrer_url' => array(
			'desc' => 'Retrieve the referrer URL',
		),
		'utility.referrer_host' => array(
			'desc' => 'Retrieve the referrer host',
		)
	);
?>



