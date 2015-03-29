<?php
return array(
	"trTitle" =>  array( 
		'scripts' => "resources/trTitle.js", 
		'styles'  => "resources/style.css",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trTitle',
		'messageFile'	=> 'ThomsonReuters.i18n.php',
	),
	"trTranscript" =>  array(
		'scripts' => "resources/trTranscript.js",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trTranscript',
	),
	"trControls" =>  array(
		'scripts' => "resources/trControls.js",
		'templates' => "templates/player-controls.tmpl.html",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trControls',
	),

);