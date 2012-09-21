<?php 
return array(
	'playlistOnPage' => array( 
		'description' => 'Adds a playlist to the page, per player defined playlist id',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true,
			),
			'clipListTargetId' => array(
				'doc' => 'Target div for ul list of clips, appended after player if null',
				'type' => 'string'
			),
			'onPageJs1' => array(
				'hideEdit' => true,
			),
			'onPageCss1' => array(
				'hideEdit' => true,
			)
		)
	),

	'descriptionBox' => array(
	 	'description' => 'Appends description box below player.',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true,
			),
			'boxHeight' => array(
				'doc' => 'Height of the description box',
				'type' => 'number'
			),
			'descriptionLabel' => array(
				'doc' => 'Description label, entry title if undefined.',
				'type' => 'string'
			),
			'onPageJs1' => array(
				'hideEdit' => true,
			),
			'onPageCss1' => array(
				'hideEdit' => true,
			)
		)
	),
);