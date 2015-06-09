<?php
/**
 * BigButton plugin manifest
*/

return array (
	'bigButton' => array(
		'description' => 'Big Button Description.',
		'attributes' => array(
			'parent' => array(
				'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
				'type' => 'enum',
				'enum' => array("topBarContainer", "videoHolder", "controlsContainer")
			),
		)
	)
);
