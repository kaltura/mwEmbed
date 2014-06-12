<?php
	$methods = array(
        'doPause' => array(
            'params' => 'None',
            'desc' => 'Command the player to pause.'
        ),
        'doPlay' => array(
            'params' => 'None',
            'desc' => 'Command the player to play.'
        ),
        'doStop' => array(
            'params' => 'None',
            'desc' => 'Command the player to stop. Pause and move the playhead to 0.'
        ),
        'doSeek' => array(
            'params' => 'Position to seek to',
            'desc' => 'Command the player to seek.'
        ),
        'doSwitch' => array(
            'params' => 'New stream bitrate',
            'desc' => 'Command the player to manually switch between streams within the resource.'
        ),
        'cleanMedia' => array(
            'params' => 'None',
            'desc' => 'Cleans the media from the player.'
        ),
        'doReplay' => array(
            'params' => 'None',
            'desc' => 'Notification fired when the player started replaying the video'
        ),
        'alert' => array(
            'params' => 'message: alert message, title: alert title',
            'desc' => 'Pop up an alert'
        ),
        'showUiElement' => array(
            'params' => 'id: ID of the element, show: true / false',
            'desc' => 'Show/hide an element from the layout',
            'availability' => 'kdp'
        ),
        'changeMedia' => array(
            'params' => 'entryId: new entry ID / referenceId: new reference ID, flavorId: new flavor ID, if exists',
            'desc' => 'Start the init of change media macro commands'
        ),
        'changeVolume' => array(
            'params' => 'New volume value',
            'desc' => 'An action to change the volume'
        ),
        'removeAlerts' => array(
            'params' => 'None',
            'desc' => 'Fired when all alerts popped by the player need to be removed',
            'availability' => 'kdp'
        ),
        'enableGui' => array(
            'params' => 'guiEnabled: true / false, enableType: full / controls',
            'desc' => 'Enable/disable GUI',
            'availability' => 'kdp'
        ),
        'cancelAlerts' => array(
            'params' => 'None',
            'desc' => 'Hide Alerts at the Alerts Mediator',
            'availability' => 'kdp'
        ),
        'changePreferredBitrate' => array(
            'params' => 'The new preferred bitrate',
            'desc' => 'Change the preferedFlavorBR on mediaProxy.vo object'
        ),
        'liveEntry' => array(
            'params' => 'The URL resource of the played entry',
            'desc' => 'Call the LiveStream command which tests whether the stream is currently on air',
            'availability' => 'kdp'
        )
    );
?>