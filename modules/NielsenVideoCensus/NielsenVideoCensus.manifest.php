<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenVideoCensus' => array(
		'description' => "Nielsen Video Census allows media owners and advertisers to accurately measure  
		the size and demographic composition (age, gender, etc.) of audiences viewing video online, 
		across the entire web and for specific sites. Learn more at per
		content view. See NielsenCombined for Nielsen video event tracking support.",
		'attributes'=> array(
			'trackEventMonitor' => array(
				'doc' => "Track beacon dispatches.",
				'type' => 'string'
			),
			'clientId' => array(
				'doc' => "Client ID provider by Nielsen.",
				'type' => 'string'
			),
			'videoCensusId' => array(
				'doc' => "The video Census Id.",
				'type' => 'string'
			),
			'tl' => array(
				'doc' => "Video title. Should be prefixed by \"dav0-\" Percent (%) encode the TL value after the \"dav0-\" prefix. Encoding prevents restricted characters from impacting any processing scripts.",
				'type' => 'string'
			),
			'cg' => array(
			 	'doc' => "Show the name or category name of the TV networks required to use program name here. The entire cg value should be percent (%) encoded.",
			 	'type' => 'string'
			),
			 'lp' => array( 
			 	'doc' => "Long play indicator.",
			 	'type' => 'string'
			),
			 'ls' => array(
			 	'doc' => 'Live stream indicator. One parameter: 1. Set to Y if this is a live stream 2. Set to N if this is a standard video on demand stream.',
			 	'type' => 'string'
			),
		)
	)
);
