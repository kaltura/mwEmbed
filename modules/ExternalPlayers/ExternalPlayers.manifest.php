<?php 
/**
 * The ExternalPlayers plugin manifest
 */
return array(
	'YouTube' => array(
		'description' => "YouTube external player",
		'attributes'=> array(
			 'forceIframe' => array( 
			 	'doc' => "Force iFrame for testing",
			 ),
			 'previewMode' => array(
			 	'doc' => 'If true, hide the scrubber and fullscreen from the UI.',
			 ),
		)
	)
);
