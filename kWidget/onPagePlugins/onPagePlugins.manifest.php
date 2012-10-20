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
			'layoutMode' => array(
				'doc' => "Layout mode of playlist ( vertical or horizontal ) ",
				'type' => 'enum',
				'enum' => array( 'vertical', 'horizontal' )
			),
			'thumbWidth' => array(
				'doc' => "The width of the clip thumbnails in pixels ( default 110 )",
				'type' => 'number',
			),
			'onPageJs1' => array(
				'hideEdit' => true,
			),
			'onPageJs2' => array(
				'hideEdit' => true,
			),
			'onPageJs3' => array(
				'hideEdit' => true,
			),
			'onPageCss1' => array(
				'hideEdit' => true,
			)
		)
	),

	'descriptionBox' => array(
	 	'description' => 'Appends or updates a target; with the asset\'s title and description',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true,
			),
			'boxHeight' => array(
				'doc' => 'Height of the description box, <i>null</i> to fill per height of content',
				'type' => 'number'
			),
			'boxWidth' => array(
				'doc' => "Box width ( can be 100% of parent ), <i>null</i> to fill 100% width",
				'type' => 'string'
			),
			'boxTargetId' => array(
				'doc' => 'The target on page div id, for the title / description box',
				'type' => 'string'
			),
			'boxLocation' => array(
				'doc' => 'The relative location of title / description box ( only used if boxTargetId is null ) by default its after the player ',
				'type' => 'enum',
				'enum' => array( 'before', 'after', 'left', 'right' )
			),
			'descriptionLabel' => array(
				'doc' => 'Description label, entry title if null.',
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