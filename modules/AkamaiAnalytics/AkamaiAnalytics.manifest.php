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
				'label' => 'configuration XML path',
				'type' => 'string',
			),
			'swfPath' => array(
				'doc' => 'URL for Akamai Media Analytics SWF',
				'label' => 'Media Analytics SWF path',
				'type' => 'string'
			),
			'trackEventMonitor' => array(
				'doc' => "Track akamai media anlytics events, with a named callback",
				'type' => 'string'
			),
			'playerId' => array(
				'doc' => 'Override default value for playerId field, by default is the uiconf_id',
				'type' => 'string'
			),
			'title' => array(
				'doc' => 'Override default value for title field, by default is the entry title',
				'type' => 'string'
			),
			'category' => array(
				'doc' => 'Override default value for category field, by default is the media type i.e image, video, audio',
				'type' => 'string'
			),
			'subCategory' => array(
				'doc' => 'Override default value for subCategory field, null by default, can be used for additional segmentation',
				'type' => 'string'
			),
			'eventName' => array(
				'doc' => 'Override default value for eventName field, custom set by event',
				'type' => 'string'
			)
		)
	)
);