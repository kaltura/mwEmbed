<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenCombined' => array(
		'description' => "Nielsen Combined",
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