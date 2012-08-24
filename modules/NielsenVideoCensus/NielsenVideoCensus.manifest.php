<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenVideoCensus' => array(
		'description' => "Nielsen Video Census",
		'attributes'=> array(
			'trackEventMonitor' => array(
				'doc' => "Track becon dispatches",
			),
			'clientId' => array(
				'doc' => "Client ID provider by Nielsen",
			),
			'videoCensusId' => array(
				'doc' => "The video Census Id",
			),
			'tl' => array(
				'doc' => "Video title. Should be prefixed by “dav0-“. Percent (%) encode the TL value after the \"dav0-\" prefix. Encoding prevents restricted characters  from impacting any processing scripts",
			),
			'cg' => array(
			 	'doc' => "Show name or category name TV networks required to use program name here The entire cg value should be percent (%) encoded",
			 ),
			 'lp' => array( 
			 	'doc' => "Long play indicator",
			 ),
			 'ls' => array(
			 	'doc' => 'Live stream indicator. One parameter: 1. Set to Y if this is a live stream 2. Set to N if this is a standard video on demand stream',
			 ),
		)
	)
);