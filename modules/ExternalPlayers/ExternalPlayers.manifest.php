<?php 
/**
 * The ExternalPlayers plugin manifest
 */
return array(
	'YouTube' => array(
		'description' => "YouTube external player",
		'attributes'=> array(
			 'forceIframe' => array( 
			 	'doc' => "Force Iframe for testing",
			 ),
			 'previewMode' => array(
			 	'doc' => 'If true, hide scrubber and fullscreen from UI',
			 ),
		)
	)
);