<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenCombined' => array(
		'description' => "Supports sending player analytics events to Nielsen Combined.
		Kaltura integration supports the full Combined beacon event flow.",
		'attributes'=> array(
			'clientId' => array(
				'doc' => "The client ID.",
				'type' => 'string'
			),
			'vcid' => array(
				'doc' => "The video ID. ",
				'label' => 'Video ID',
				'type' => 'string'
			),
			'tag_title' => array(
				'doc' => "The title tag.",
				'label' => 'Title tag',
				'type' => 'string',
			),
			'tag_category' => array(
				'doc' => "The category tag.",
				'label' => 'Category tag',
				'type' => 'string',
			),
			'tag_subcategory' => array(
				'doc' => "The subcategory tag.",
				'label' => 'Sub-category tag',
				'type' => 'string',
			), 
			'tag_censuscategory' => array(
				'doc' => "The census category tag.",
				'label' => 'Census category tag',
				'type' => 'string',
			),
			'tag_imgurl' => array(
				'doc' => "The thumbnail URL tag.",
				'label' => 'Thumbnail URL tag',
				'type' => 'string',
			),
			'trackEventMonitor' => array(
				'doc' => 'Function called on parent page for every event.',
				'label' => 'Event function name',
				'type' => 'string',
			),
		)
	)
);
