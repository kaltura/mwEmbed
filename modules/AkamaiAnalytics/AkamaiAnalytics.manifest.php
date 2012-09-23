<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	'akamaiAnalytics' => array(
		'description' => "Akamai Analytics, supports sending player analytic event to Akamai.<br>",
		'attributes'=> array(
			'configPath' => array(
				'doc' => 'URL for Akamai\'s configuration XML',
				'type' => 'string',
			)
		)
	)
);