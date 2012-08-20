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
		"mw.BaseAdPlugin" => array( 'scripts' => 'resources/mw.BaseAdPlugin.js'),
		"mw.AdLoader" => array( 
			'scripts' => 'resources/mw.AdLoader.js',
			'dependencies' => array( 'mw.ajaxProxy' )
		),
		"mw.VastAdParser" => array( 'scripts' => 'resources/mw.VastAdParser.js')
	);