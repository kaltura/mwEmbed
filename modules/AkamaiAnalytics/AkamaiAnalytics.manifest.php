<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	'akamaiMediaAnalytics' => array(
		'description' => "Akamai Analytics, supports sending player analytic event to Akamai.<br>",
		'attributes'=> array(
			'configPath' => array(
				'doc' => 'URL for Akamai\'s configuration XML',
				'type' => 'string',
			),
			'swfPath' => array(
				'doc' => 'URL for Akamai Media Analytics SWF',
				'type' => 'string'
			),
			'trackEventMonitor' => array(
				'doc' => "Track akamai media anlytics events, with a named callback",
				'type' => 'string'
			),
			'playerId' => array(
				'doc' => 'Override default value for playerId field',
				'type' => 'string'
			),
			'title' => array(
				'doc' => 'Override default value for title field',
				'type' => 'string'
			),
			'category' => array(
				'doc' => 'Override default value for category field',
				'type' => 'string'
			),
			'subCategory' => array(
				'doc' => 'Override default value for subCategory field',
				'type' => 'string'
			),
			'eventName' => array(
				'doc' => 'Override default value for eventName field',
				'type' => 'string'
			)
		)
	)
);