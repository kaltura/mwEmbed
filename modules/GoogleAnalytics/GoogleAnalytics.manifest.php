<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	'googleAnalytics' => array(
		'description' => "Google Analytics, supports sending player analytic event to google",
		'attributes'=> array(
			'urchinCode' => array(
				'doc' => 'The google urchin code i.e UA-30149691-1',
				'type' => 'string'
			),
			'trackEventMonitor'=> array(
				'doc' => 'Function called on parent page for every event',
				'type' => 'string'
			)
		)
	)
);