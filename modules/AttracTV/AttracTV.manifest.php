<?php
/**
 * Tremor plugin manifest 
*/

return array (
	/** Playlist */
	'AttracTV' => array(
		'description' => '',
		'attributes' => array(
			'barId' => array(
				'doc' => "Your Bar Id taken from attracTV Studio",
				'type' => 'string'
			),
			'publisherKey' => array(
				'doc' => "Your Publisher Key",
				'type' => 'string'
			),
		)
	)
);