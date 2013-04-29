<?php 
/**
 * The NielsenCombined plugin manifest
 */


return array(
	'nielsenVideoCensus' => array(
		'description' => "Nielsen Video Census allows media owners and advertisers to measure accurately 
		the size and demographic composition (age, gender, etc.) of audiences viewing video online, 
		across the entire web and for specific sites. Lean more at 
		<a target=\"new\" href=\"http://www.nielsen.com/us/en/nielsen-solutions.html\">Nielsen.com</a>
		The Kaltura Integration supports the Video Census becoan. <br>Note only one beacon is fired per
		content view. See NielsenCombined for Nielsen video event tracking support.",
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
				'doc' => "Video title. Should be prefixed by \"dav0-\" Percent (%) encode the TL value after the \"dav0-\" prefix. Encoding prevents restricted characters  from impacting any processing scripts",
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