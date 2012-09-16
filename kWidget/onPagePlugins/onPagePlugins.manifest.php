<?php 
return array(
	'descriptionBox' => array(
	 	'description' => 'Appends description box below player.',
		'attributes' => array(
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