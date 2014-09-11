<?php
/**
 * Widevine plugin manifest 
*/

return array (
	'chromecast' => array(
		'description' => 'Enable casting the video stream to Google Chromecast.',
		'attributes' => array(
			'parent' => array(
				'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
				'type' => 'enum',
				'enum' => array("topBarContainer", "videoHolder", "controlsContainer")
			),
		)
	)
);
