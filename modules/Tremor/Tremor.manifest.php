<?php
/**
 * FreeWheel plugin manifest 
*/

return array (
	/** Playlist */
	'tremor' => array(
		'description' => 'The Tremor Ad provider. <a target="_new" href="http://tremorvideo.com/">More about Tremor</a>',
		'attributes' => array(
			'displayAdCountdown' => array(
				'doc' => "If the ad countdown should be displayed",
				'type' => 'string'
			),
			'progId' =>array(
				'doc' => "The Tremor policy id",
				'type' => 'string'
			),
			'banner' => array(
				'doc' => "The banner id",
				'type' => 'string'
			),
			'timeout' => array(
				'doc' => "Time in seconds to load the tremor ad, default 10 seconds",
				'type' => 'number'
			)
		)
	)
);