<?php 
/**
 * The Kaltura plugin manifest
 */
return array(
	'googleAnalytics' => array(
		'description' => "Supports sending player analytics events to Google.<br>
		For full implementation guide see <a target=\"_new\" href=\"http://knowledge.kaltura.com/google-analytics-kaltura-player\">Google Analytics</a> 
		in the Knowledge Center",
		'attributes'=> array(
			'urchinCode' => array(
				'doc' => 'The Google urchin code i.e. UA-30149691-1',
				'label' => 'Google urchin code',
				'type' => 'string',
			),
			'trackEventMonitor'=> array(
				'doc' => 'Function called on parent page for every event.',
				'label' => 'Event monitor function name',
				'type' => 'string',
			),
			'customEvent' => array(
				'doc' => "Comma separated list of events you want to track.",
				'label' => 'Custom events list',
				'type' => 'string',
			),
			'doPlayCategory' => array(
				'doc' => "Category sent to Google analytics for prefixed event.",
				'label' => 'Category for event',
				'type' => 'string'
			),
			'doPlayAction' => array(
				'doc' => "Action sent to Google Analytics for prefixed event.",
				'label' => 'Action for event',
				'type' => 'string'
			),
			'doPlayValue' => array(
				'doc' => "Value sent to Google Analytics for prefixed event",
				'label' => 'Value for event',
				'type' => 'string'
			)
		)
	)
);
