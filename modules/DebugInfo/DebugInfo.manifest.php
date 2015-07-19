<?php
/**
 * QnA plugin manifest
*/

return array (
	'debugInfo' => array(
		'label' => 'DebugInfo',
		'description' => 'Debug information overlay.',
		'attributes' => array(
			'parent' => array(
				'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
				'type' => 'enum',
				'enum' => array("topBarContainer", "videoHolder", "controlsContainer")
			)
		)
	)
);
