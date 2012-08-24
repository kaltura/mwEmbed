<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'NielsenCombined' => array(
		'description' => "Comsore NielsenCombined",
		'attributes'=> array(
			'clientId' => array(
				'doc' => "The client id",
				'edit'=>true
			),
			'vcid' => array(
				'doc' => "The video id ",
				'edit' => true,
			),
			'tag_title' => array(
				'doc' => "The title tag",
				'edit' => true,
			),
			'tag_category' => array(
				'doc' => "The category tag",
				'edit' => true,
			),
			'tag_subcategory' => array(
				'doc' => "The subcategory tag",
				'edit' => true, 
			), 
			'tag_censuscategory' => array(
				'doc' => "The censuscategory tag",
				'edit' => true,
			),
			'tag_imgurl' => array(
				'doc' => "The Thumbnail url tag",
				'edit' => true,
			)
		)
	)
);