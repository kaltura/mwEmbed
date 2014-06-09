<?php
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
?>