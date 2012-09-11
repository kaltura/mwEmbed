<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	'googleAnalytics' => array(
		'description' => "Google Analytics, supports sending player analytic event to google.<br> For full implementation guide see <a href=\"http://knowledge.kaltura.com/google-analytics-kaltura-player\">google analytics</a> in the knowledge center",
		'attributes'=> array(
			'urchinCode' => array(
				'doc' => 'The google urchin code i.e UA-30149691-1',
				'type' => 'string',
			),
			'trackEventMonitor'=> array(
				'doc' => 'Function called on parent page for every event',
				'type' => 'string',
			),
			'customEvent' => array(
				'doc' => "Comma seperated list of events you want to track",
				'type' => 'string',
			),
			'doPlayCategory' => array(
				'doc' => "Category sent to google analytics for prefixed event",
				'type' => 'string'
			),
			'doPlayAction' => array(
				'doc' => "Action sent to google analytics for prefixed event",
				'type' => 'string'
			),
			'doPlayValue' => array(
				'doc' => "Value sent to google analytics for prefixed event",
				'type' => 'string'
			)
		)
	)
);