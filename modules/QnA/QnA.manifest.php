<?php
/**
 * QnA plugin manifest
*/

return array (
	'qna' => array(
		'label' => 'Q and A.',
		'description' => 'Q and A description.',
		'attributes' => array(
			'parent' => array(
				'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
				'type' => 'enum',
				'enum' => array("topBarContainer", "videoHolder", "controlsContainer")
			),
		)
	)
);
