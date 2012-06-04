<?php 
	return array(
		"mw.AdTimeline" => array(
			'scripts' => array( 'resources/mw.AdTimeline.js' ),
			'dependencies' => array(
				"mw.BaseAdPlugin",
				"mw.AdLoader",
				"mw.VastAdParser",
			)
		),
		"mw.BaseAdPlugin" => array( 'scripts' => 'resources/mw.BaseAdPlugin'),
		"mw.AdLoader" => array( 'scripts' => 'resources/mw.AdLoader.js' ),
		"mw.VastAdParser" => array( 'scripts' => 'resources/mw.VastAdParser.js')
	);