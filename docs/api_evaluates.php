<?php
	$evaluates = array(
		'isHTML5' => array(
			'desc' => 'A flag specifying if the current player is an HTML5 player (Universal player)',
		),
		'playerVersion' => array(
			'desc' => 'The current version of the player library. Versions are represented in major.minor.point format',
			'example' => '../modules/AdSupport/tests/AdTagUrlSubstitutions.html'
		),
		'flashVersion' => array(
			'desc' => 'The version of Adobe Flash available. Returns 0,0,0 if Flash is not available.',
			'example' => '../modules/AdSupport/tests/AdTagUrlSubstitutions.html'
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
		'video.player.width' => array(
			'desc' => 'The current video player width in pixels.',
			'example' => '../modules/AdSupport/tests/AdTagUrlSubstitutions.html'
		),
		'video.player.height' => array(
			'desc' => 'The current video player height in pixels.',
			'example' => '../modules/AdSupport/tests/AdTagUrlSubstitutions.html'
		),
		'video.buffer.lastBufferDuration'=>array(
			'desc' => 'How long the player was in a buffering state, during the last buffer event. Should be read after bufferEndEvent. Value is in seconds.',
			'example' => '../modules/KalturaSupport/tests/PlayerBufferTest.qunit.html'
		), 
		'video.buffer.lastBufferDurationMs'=>array(
				'desc' => 'Same as lastBufferDuration but in Milliseconds.',
				'example' => '../modules/KalturaSupport/tests/PlayerBufferTest.qunit.html'
		),
		'video.buffer.bufferEndTime' => array(
			'desc' => 'Timestamp of last buffer end, in ms.',
			'example' => '../modules/KalturaSupport/tests/PlayerBufferTest.qunit.html'
		),
		'video.buffer.bufferStartTime' => array(
			'desc' => 'Timestamp of last buffer start, in ms.',
			'example' => '../modules/KalturaSupport/tests/PlayerBufferTest.qunit.html'
		),
		'video.buffer.percent' => array(
			'desc' => 'Percentage of the video that has been buffered.',
			'example' => '../modules/KalturaSupport/tests/PlayerBufferTest.qunit.html'
		), 
		'duration' => array(
			'desc' => 'Current video duration in seconds',
		),
		'mediaProxy.entry' => array(
			'desc' => "Return or set all entry properties. Entry properties include:
					'id','name','description','plays','views','duration','createdAt', 'thumbnailUrl' and others.
				See Kaltura <a target=\"_new\" href=\"http://www.kaltura.com/api_v3/testmeDoc/?object=KalturaBaseEntry\">base entry object</a>,
				in Kaltura API definition for full set of properties.",
			'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
		),
		'mediaProxy.entryCuePoints' => array(
			'desc' => 'Return or set cue points for the current media entry.
				See Kaltura <a target=\"_new\" href=\"http://www.kaltura.com/api_v3/testmeDoc/?object=KalturaCuePoint\">cuePoint object</a>,
				in Kaltura API definition for full set of properties.',
			'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
		),
		'mediaProxy.entryMetadata' => array(
			'desc' => 'Metadata object for the current entry. Enables reading custom metadata key value pairs.',
			'example' => '../modules/KalturaSupport/tests/CustomMetaData.html'
		),
		'mediaProxy.sources' => array(
			'desc' => 'An array of HTML5 sources with src attribute for fully resolved URL and Type attribute which should match HTML5 source type value.',
			'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
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
		),
		'utility.nativeAd' => array(
			'desc' => 'The native device identifier,
				<a href="https://developer.apple.com/library/ios/documentation/AdSupport/Reference/ASIdentifierManager_Ref/#//apple_ref/occ/instp/ASIdentifierManager/advertisingIdentifier">
					AdvertisingIdentifier
				</a> for Apple and <a href="http://developer.android.com/reference/com/google/android/gms/ads/identifier/AdvertisingIdClient.Info.html">
					AdvertisingIdClient
				</a> for Android.',
			'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
		)
	);
?>



