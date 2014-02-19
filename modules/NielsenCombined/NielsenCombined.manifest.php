<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenCombined' => array(
		'description' => "Nielsen Combined enables, media owners and advertisers to track video playback 
		as well as accurately measure the size and demographic composition (age, gender, etc.) of audiences viewing video online, 
		across the entire web and for specific sites. Learn more at: 
		<a target=\"new\" href=\"http://www.nielsen.com/us/en/nielsen-solutions.html\">Nielsen.com</a>
		The Kaltura Integration supports the full Combined beacon event flow.",
		'attributes'=> array(
			'clientId' => array(
				'doc' => "The client ID.",
				'type' => 'string'
			),
			'vcid' => array(
				'doc' => "The video ID. ",
				'label' => 'Video id',
				'type' => 'string'
			),
			'tag_title' => array(
				'doc' => "The title tag.",
				'label' => 'Title tag',
				'type' => 'string',
			),
			'tag_category' => array(
				'doc' => "The category tag.",
				'label' => 'Tag category
				',
				'type' => 'string',
			),
			'tag_subcategory' => array(
				'doc' => "The sub-category tag.",
				'label' => 'Tag sub-category',
				'type' => 'string',
			), 
			'tag_censuscategory' => array(
				'doc' => "The census category tag.",
				'label' => 'Tag census category',
				'type' => 'string',
			),
			'tag_imgurl' => array(
				'doc' => "The thumbnail URL tag.",
				'label' => 'Thumbnail url tag',
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
