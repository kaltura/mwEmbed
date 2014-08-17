<?php

return array(
	"actionButtons" =>  array( 
		'scripts' => "resources/actionButtons.js", 
		'styles' => "resources/call-to-action.css",
		'dependencies' => array(
			"mw.EmbedPlayer",
			'mw.KBaseScreen' 
		),
		'templates' => '../CallToAction/templates/action-buttons.tmpl.html',
		'kalturaPluginName' => 'actionButtons'
	),

	"actionForm" => array(
		'scripts' => 'resources/actionForm.js',
		'styles' => 'resources/call-to-action.css',
		'dependencies' => array(
			'mw.EmbedPlayer',
			'jquery.serialize-object',
			'mw.KBaseScreen'
		),
		'templates' => '../CallToAction/templates/collect-form.tmpl.html',
		'kalturaPluginName' => 'actionForm'
	),
);