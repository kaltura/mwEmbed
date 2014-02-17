<?php 
/**
 * The Kaltura plugin manifest
 */
return array(
	'akamaiMediaAnalytics' => array(
		'description' => "Akamai Analytics, supports sending player analytics event to Akamai.<br>",
		'attributes'=> array(
			'configPath' => array(
				'doc' => 'URL for Akamai\'s configuration XML.',
				'label' => 'configuration XML path',
				'type' => 'string',
			),
			'swfPath' => array(
				'doc' => 'URL for Akamai Media Analytics SWF.',
				'label' => 'Media Analytics SWF path',
				'type' => 'string'
			),
			'trackEventMonitor' => array(
				'doc' => "Track Akamai media analytics events with a named callback.",
				'type' => 'string'
			),
			'playerId' => array(
				'doc' => 'Override the default value for the playerId field, By default it is the uiconf_id.',
				'type' => 'string'
			),
			'title' => array(
				'doc' => 'Override the default value for the title field. By default it is the entry title.',
				'type' => 'string'
			),
			'category' => array(
				'doc' => 'Override the default value for the category field, By default it is the media type. For example, image, video, audio.',
				'type' => 'string'
			),
			'subCategory' => array(
				'doc' => 'Override the default value for the subCategory field. The default value is null. This field can be used for additional segmentation.',
				'type' => 'string'
			),
			'eventName' => array(
				'doc' => 'Override the default value for the eventName field, custom set by event',
				'type' => 'string'
			)
		)
	)
);
