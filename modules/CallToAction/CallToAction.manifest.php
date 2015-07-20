<?php

/*
displayOn: "end", // Can be either "end" or "related"
		customDataKey: "ActionButtons", 
		openInNewWindow: true,
		actions: [],
		*/
return array(
	'actionButtons' => array(
		'description' => 'Call to Action plugin that allow you to show buttons on the player.',
		'attributes' => array(
			'displayOn' => array(
				'doc' => "When to show the screen",
				'type' => 'enum',
				'enum' => array('end', 'related'),
				'options' => array(
					array(
						'label' => "End Screen",
						'value' => "end"
					),
					array(
						'label' => "Related Screen",
						'value' => "related"
					)
				)
			),
			'customDataKey' => array(
				'doc' => 'Which metadata key to use when searching for custom actions',
				'type' => 'string'
			),
			'openInNewWindow' => array(
				'doc' => 'Links should open in new screen',
				'value' => 'boolean',
			),
			'actions' => array(
				'doc' => 'List of Actions that used to draw the buttons',
				'type' => 'string'
			),
			'templatePath' => array(
				'doc' => 'Which pre-defined template to use',
				'type' => 'enum',
				'enum' => array( '../CallToAction/templates/action-buttons.tmpl.html', '../CallToAction/templates/action-button-related.tmpl.html '),
				'options' => array(
					array(
						'label' => 'Action Button Standalone Screen',
						'value' => '../CallToAction/templates/action-buttons.tmpl.html',
					),
					array(
						'label' => 'Action Button in Related Screen',
						'value' => '../CallToAction/templates/action-button-related.tmpl.html', 
					),
				)
			),
			'template' => array(
				'doc' => 'HTML Template to override "templatePath".',
				'type' => 'string',
			),
		)
	),
	'actionForm' => array(
		'description' => 'Call to Action - Data collection form',
		'attributes' => array(
			'displayOn' => array(
				'doc' => 'When to show the screen. Can be either: "start", "end", <time> or <percent%>',
				'type' => 'string',
			),
			'submitRequired' => array(
				'doc' => 'Does the user must submit the form to view the video',
				'type' => 'boolean'
			),
			'template' => array(
				'doc' => 'HTML Template for the info screen.',
				'type' => 'string',
			),
		)
	)
);