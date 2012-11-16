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
	'chaptersEdit' => array(
		'description' => 'Provides a simple interface for editing chapter annotation data',
		'attributes' => array(
			'ks' => array(
				'doc' => "The authentication ks, required until we have iframe auth system in place",
				'type' => 'string'
			),
			'editTarget' => array(
				'doc' => "The target id for chapter editing interface",
				'type' => 'string'
			)
		)
	),
	'chaptersView' => array(
	 	'description' => 'Display video chapter information.',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true
			),
			'cuePointType' => array(
				'doc' => 'Allows defining which type of cue point will be used to store the chaptering metadata.',
				'type' => 'enum',
				'enum' => array( 'adCuepoint',  'Annotation' )
			),
			'parentName' => array(
				'doc' => 'Default: "chaptering" – a string value used in case Annotation cuePoints are used. Providing a parentName will force querying only annotations whose parent fits parentName. This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters, references, ads).',
				'type' => 'string'
			),
			'titleAttributeName' => array( 
				'doc' => 'Default "text", Specifies which attribute of the cuePoint object will be used as the chapter’s title. If set to false, title will not be displayed',
				'type' => 'string'
			),
			'descriptionAttributeName' => array(
				'doc' => 'Default "systemName" – specifies which attribute of the cuePoint object will be used as the chapter’s description. If set to false, description will not be displayed',
				'type' => 'string'
			),
			'layout' => array(
				'doc' => 'Will affect the layout of the chapters. This will only add css classes, the actual visual layout is performed via CSS',
				'type'=> 'enum',
				'enum' => array( 'vertical', 'horizontal' )
			),
			'position' => array(
				'doc' =>  'Will affect the position of the chaptering UI in relation to the video. This will only affect the structure of UI HTML elements, and will leave actual layouting to be performed via CSS)',
				'type' => 'enum',
				'enum' => array('top','left','bottom','right')
			),
			'overflow' => array(
				'doc' => 'Defines what should happen in case list of chapters require more space than video’s dimensions. Combined with the “layout” and “position” parameters, this parameter will cause a prev/next UI to appear if overflow is set to false.',
				'type' => 'boolean',
			),
			'includeThumbnail' => array(
				'doc' => 'If set to true, a thumbnail HTML element will be generated containing the video frame from the startTime of the chapter',
				'type' => 'boolean',
			),
			'thumbnailRotator' => array(
				'doc' => 'If set to true (and assuming that includeThumbnail=true), will enable a thumbnail-rotator experience, allowing the user to rollover i. a chapter thumbnail and experience a few (4,5) additional frames of the chapter (length of the chapter will be computed by delta between startTime of this chapter and the next, then divide it by X frames and generate the additional thumbnails for the rotator using the thumbnail URL API)',
				'type' => 'boolean'
			),
			'chapterRenderer' => array(
				'doc' => 'j. If provided, the plugin will delegate rendering of the plugin to this method, while providing it with a chapter’s metadata every time it is called. This will allow full control over produced HTML, adding additional elements etc.',
				'type'=> 'function'
			)
		)
	),
);