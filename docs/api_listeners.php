<?php
	$eventsPlayerLifeCycle = array(
		'startUp' => array(
			'callbackArgs' => 'Root of the application',
			'callbackType' => 'Object',
			'desc' => 'The first command that registers the main proxys and main view mediator.',
			'availability' => 'kdp'
		),
		'initiatApp' => array(
			'desc' => 'Start the init macro commands.',
			'availability' => 'kdp'
		),
		'skinLoaded' => array(
			'desc' => 'Dispatched when the skin is loaded.',
			'availability' => 'kdp'
		),
		'skinLoadFailed' => array(
			'desc' => 'Dispatched when the skin load failed.',
			'availability' => 'kdp'
		),
		'sourceReady' => array(
			'desc' => 'When the source is ready use to set the media element to the media player.',
			'availability' => 'kdp'
		),
		'kdpReady' => array(
			'desc' => 'Notify that the application is ready to be used and events can be listened to and that the loaded entry is ready to be played.'
		),
		'kdpEmpty' => array(
			'desc' => 'Notify that the application is ready to be used and events can be listened to, but no media was loaded'
		),
		'layoutReady' => array(
			'desc' => 'Dispatched when the init macro command is done and the layout is ready'
		),
		'playerReady' => array(
			'desc' => 'Dispatches when the player is ready to play the media'
		),
		'pluginsLoaded' => array(
			'callbackArgs' => 'Plugins map object. Every key is a plugin ID, value is the status of the plugin (see PluginStatus class)',
			'desc' => 'Notification fired when all plugins finished the loading process.',
			'availability' => 'kdp'
		),
		'singlePluginLoaded' => array(
			'callbackArgs' => 'The plugin ID',
			'desc' => 'Notification fired when a single plugin is ready',
			'availability' => 'kdp'
		),
		'singlePluginFailedToLoad' => array(
			'callbackArgs' => 'The plugin ID',
			'desc' => 'Notification fired when a single plugin failed to load',
			'availability' => 'kdp'
		),
		'readyToPlay' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notification added with version 3.5.0, signifies that an entry / media is ready to be played in the KDP',
			'availability' => 'kdp'
		),
		'readyToLoad' => array(
			'callbackArgs' => 'None',
			'desc' => 'Dispatched when the skin is loaded.'
		),
		'entryReady' => array(
			'callbackArgs' => 'The entry object (KalturaBaseEntry)',
			'desc' => 'The Entry is set'
		),
		'entryFailed' => array(
			'callbackArgs' => 'None',
			'desc' => 'Get Entry failed'
		),
		'entryNotAvailable' => array(
			'callbackArgs' => 'entryId: The new entry ID',
			'desc' => "Notification fired when the BaseEntry object has been retrieved but KDP can't play the entry. Possible reasons: status not ready / moderation status/ access control",
			'availability' => 'kdp'
		),
		'mediaReady' => array(
			'callbackArgs' => 'None',
			'desc' => 'The loadable media has completed loading'
		),
		'mediaError' => array(
			'callbackArgs' => 'errorEvent: the media error event (MediaErrorEvent)',
			'desc' => 'The player notify on media error'
		),
		'mediaLoaded' => array(
			'callbackArgs' => 'None',
			'desc' => 'From version 3.5.0, this notification replaces the MEDIA_READY notification as the catalyst for the MediaReadyCommand. This notification is indicative that the MediaElement constructed under the MediaProxy function prepareMediaElement is loaded into the OSMF MediaPlayer.'
		)
	);
	$eventsPlayerStates = array(
		'firstQuartile' => array(
			'desc' => 'The player reached 25% of the entry playback'
		),
		'secondQuartile' => array(
			'desc' => 'The player reached 50% of the entry playback'
		),
		'thirdQuartile' => array(
			'desc' => 'The player reached 75% of the entry playback'
		),
		'playerPlayEnd' => array(
			'callbackArgs' => 'None',
			'desc' => 'The played media has reached the end of content playback.'
		),
		'durationChange' => array(
			'callbackArgs' => 'New duration value',
			'desc' => 'Notify a change in the playing entry duration'
		),
		'rootResize' => array(
			'callbackArgs' => 'width: new width, height: new height',
			'desc' => 'The player parent was resized',
			'availability' => 'kdp'
		),
		'mediaViewableChange' => array(
			'callbackArgs' => 'None',
			'desc' => 'Used mainly to know when OSMF Media Player is viewable',
			'availability' => 'kdp'
		),
		'playerStateChange' => array(
			'callbackArgs' => 'The new state (MediaPlayerState)',
			'desc' => "Dispatched when media player's state has changed (OSMF MediaPlayerState: uninitialized / loading / ready / playing / paused / buffering / playbackError"
		),
		'playerPaused' => array(
			'callbackArgs' => 'None',
			'desc' => 'The player is now in pause state'
		),
		'playerPlayed' => array(
			'callbackArgs' => 'None',
			'desc' => 'The player is now in play state'
		),
		'playerSeekStart' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notify about a seek activity that started'
		),
		'playerSeekEnd' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notify that the seek activity has finished'
		),
		'playerUpdatePlayhead' => array(
			'callbackArgs' => 'Player current time',
			'desc' => 'An update event that notifies about the progress in time when playback is running'
		),
		'openFullScreen' => array(
			'callbackArgs' => 'None',
			'desc' => 'Player entered full screen mode'
		),
		'closeFullScreen' => array(
			'callbackArgs' => 'None',
			'desc' => 'Player exited from full screen mode'
		),
		'hasCloseFullScreen' => array(
			'callbackArgs' => 'None',
			'desc' => 'The fullscreen has just closed'
		),
		'hasOpenedFullScreen' => array(
			'callbackArgs' => 'None',
			'desc' => 'The fullscreen was just activated'
		),
		'volumeChanged' => array(
			'callbackArgs' => 'New volume value',
			'desc' => 'Notification about a change in the player volume'
		),
		'volumeChangedEnd' => array(
			'callbackArgs' => 'New volume value',
			'desc' => 'Notification fired when volumeChanged process ended (volume slider thumb release / volume button click). Saves value to cookie if possible',
			'availability' => 'kdp'
		),
		'mute' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notification fired when the player is muted'
		),
		'unmute' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notification fired when the player is unmuted'
		),
		'bytesDownloadedChange' => array(
			'callbackArgs' => 'newValue: bytes loaded',
			'desc' => 'Notify the current and the previous value of bytesDownloaded'
		),
		'bytesTotalChange' => array(
			'callbackArgs' => 'newValue: total bytes',
			'desc' => "Dispatched by the player when the value of the property 'bytesTotal' has changed"
		),
		'bufferProgress' => array(
			'callbackArgs' => 'newTime: new buffer time',
			'desc' => 'The player dispatches this event when the buffer time has changed'
		),
		'bufferChange' => array(
			'callbackArgs' => 'true / false',
			'desc' => 'Dispatches when the player starts or stops buffering'
		),
		'scrubberDragStart' => array(
			'callbackArgs' => 'None',
			'desc' => 'The scrubber had started being dragged',
			'availability' => 'kdp'
		),
		'scrubberDragEnd' => array(
			'callbackArgs' => 'None',
			'desc' => 'The scrubber had stopped being dragged',
			'availability' => 'kdp'
		),
		'intelliSeek' => array(
			'callbackArgs' => 'intelliseekTo: new position to seek to',
			'desc' => 'Notification fired when the player has started intelligent seeking',
			'availability' => 'kdp'
		),
		'freePreviewEnd' => array(
			'callbackArgs' => 'id of the viewed entry',
			'desc' => 'A notification that is called on the hosting page with content that should be purchased after a short preview'
		),
		'changeMediaProcessStarted' => array(
			'callbackArgs' => 'entryId: The new entry ID',
			'desc' => 'Notification fired when the first mini-command of the ChangeMedia macro command has started',
			'availability' => 'kdp'
		),
		'metadataReceived' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notification fired when entry custom data was received'
		),
		'cuePointsReceived' => array(
			'callbackArgs' => 'Cue Points Map. Object mapping between start-times and arrays of the cue points found on that start-time',
			'desc' => "Notification fired when the player has successfully loaded an entry's cue-point configuration"
		),
		'cuePointReached' => array(
			'callbackArgs' => 'Current cuePoint object. Return Object with context and a cuePoint object',
			'desc' => "Notification fired when the player reaches a cuePoint",
			"example" => "../modules/KalturaSupport/tests/CuePointsMidrollVast.html"
		),
		'switchingChangeStarted' => array(
			'callbackArgs' => 'newIndex: The index of the bitrate the player started switching to. If auto, send -1, newBitrate: The bitrate the player started switching to. If auto, send null',
			'desc' => 'Notification dispatched when the player has started switching to a different dynamic bitrate'
		),
		'switchingChangeComplete' => array(
			'callbackArgs' => 'currentIndex: The index of the bitrate that the player finished switching to, currentBitrate: The bitrate the player finished switching to',
			'desc' => 'Notification dispatched when the player has finished switching to a different dynamic bitrate'
		),
		'playbackComplete' => array(
			'callbackArgs' => 'None',
			'desc' => 'Signifies the end of a media in the player (can be either ad or content)'
		)
	);

	$eventAds = array(
		'adOpportunity' => array(
			'callbackArgs' => 'context: context of the ad opportunity: pre, post, mid, cuePoint: the cue point object',
			'desc' => "Notification fired when the player's time progress reaches an ad cue point"
		),
		'sequenceItemPlayStart' => array(
			'callbackArgs' => 'sequenceContext: pre / post / mid / main (see SequenceContextType class), currentIndex: index of current item',
			'desc' => 'Signifies the start of an entry that is part of a sequence',
			'availability' => 'kdp'
		),
		'sequenceItemPlayEnd' => array(
			'callbackArgs' => 'sequenceContext: pre / post / mid / main (see SequenceContextType class), currentIndex: index of current item',
			'desc' => 'Signifies the end of an entry that is part of a sequence as opposed to the end of a regular entry',
			'availability' => 'kdp'
		),
		'preSequenceStart' => array(
			'callbackArgs' => 'None',
			'desc' => 'Signifies the start of the pre-sequence'
		),
		'preSequenceComplete' => array(
			'callbackArgs' => 'None',
			'desc' => 'Signifies the end of the pre-sequence'
		),
		'postSequenceStart' => array(
			'callbackArgs' => 'None',
			'desc' => 'Signifies the start of the post-sequence'
		),
		'postSequenceComplete' => array(
			'callbackArgs' => 'None',
			'desc' => 'Signifies the end of the post-sequence'
		),
		'midSequenceStart' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notification fired when the midroll sequence starts'
		),
		'midSequenceComplete' => array(
			'callbackArgs' => 'None',
			'desc' => 'Notification fired when the midroll sequence ends'
		),
		'bumperStarted' => array(
			'callbackArgs' => 'timeSlot: preroll / postroll',
			'desc' => 'Defines the value of the type property of a bumper start notification',
			'availability' => 'kdp'
		),
		'bumperClicked' => array(
			'callbackArgs' => 'None',
			'desc' => 'Defines the value of the type property of a bumper click notification',
			'availability' => 'kdp'
		),
		'adStart' => array(
			'callbackArgs' => 'timeSlot: pre / post / mid / main (see SequenceContextType class)',
			'desc' => 'Defines the value of the type property of an ad start notification'
		),
		'adClick' => array(
			'callbackArgs' => 'timeSlot: pre / post / mid / main (see SequenceContextType class)',
			'desc' => 'Defines the value of the type property of an ad click notification'
		),
		'adEnd' => array(
			'callbackArgs' => 'timeSlot: pre / post / mid / main (see SequenceContextType class)',
			'desc' => 'Defines the value of the type property of an ad end notification'
		),
		'firstQuartileOfAd' => array(
			'callbackArgs' => 'timeSlot: pre / post / mid / main (see SequenceContextType class)',
			'desc' => 'Defines the value of the type property of 25% of ad notification',
			'availability' => 'kdp'
		),
		'midOfAd' => array(
			'callbackArgs' => 'timeSlot: pre / post / mid / main (see SequenceContextType class)',
			'desc' => 'Defines the value of the type property of 50% of ad notification',
			'availability' => 'kdp'
		),
		'ThirdQuartileOfAd' => array(
			'callbackArgs' => 'timeSlot: pre / post / mid / main (see SequenceContextType class)',
			'desc' => 'Defines the value of the type property of 75% of ad notification',
			'availability' => 'kdp'
		),
		'adErrorEvent' => array(
			'callbackArgs' => 'None',
			'desc' => 'Fired when an ad fails to load (applicable to all ad systems)'
		)
	);
	$playlists = array(
        'playlistReady' => array(
            'props' => 'None',
            'desc' => 'The playlist layout is ready.'
        ),
        'playlistPlayNext' => array(
            'props' => 'None',
            'desc' => 'The next clip was requested.'
        ),
        'playlistPlayPrevious' => array(
            'props' => 'None',
            'desc' => 'The previous clip was requested.'
        ),
        'playlistFirstEntry' => array(
            'props' => 'None',
            'desc' => 'The first clip in the playlist was loaded.'
        ),
        'playlistMiddleEntry' => array(
            'props' => 'None',
            'desc' => 'A clip that is not the first or the last clip in the playlist was loaded.'
        ),
        'playlistLastEntry' => array(
            'props' => 'None',
            'desc' => 'The last clip in the playlist was loaded.'
        )
    );
?>