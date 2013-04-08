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
			)
		)
	)
);