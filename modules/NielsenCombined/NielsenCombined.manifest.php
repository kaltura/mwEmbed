<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenCombined' => array(
		'description' => "Nielsen Combined enables, media owners and advertisers to track video playback 
		as well as measure accurately 
		the size and demographic composition (age, gender, etc.) of audiences viewing video online, 
		across the entire web and for specific sites. Lean more at 
		<a target=\"new\" href=\"http://www.nielsen.com/us/en/nielsen-solutions.html\">Nielsen.com</a>
		The Kaltura Integration supports the full Combined becoan event flow.",
		'attributes'=> array(
			'clientId' => array(
				'doc' => "The client id",
			),
			'vcid' => array(
				'doc' => "The video id ",
			),
			'tag_title' => array(
				'doc' => "The title tag",
			),
			'tag_category' => array(
				'doc' => "The category tag",
			),
			'tag_subcategory' => array(
				'doc' => "The subcategory tag",
			), 
			'tag_censuscategory' => array(
				'doc' => "The censuscategory tag",
			),
			'tag_imgurl' => array(
				'doc' => "The Thumbnail url tag",
			),
			'trackEventMonitor' => array(
				'doc' => 'Function called on parent page for every event',
			),
		)
	)
);