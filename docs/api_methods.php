<?php
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
?>