<?php
return array(
	"trTitle" =>  array( 
		'scripts' => "resources/trTitle.js", 
		'styles'  => "resources/style.css",
		'templates' => "../tr/templates/playlist.tmpl.html",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trTitle',
		'messageFile'	=> 'tr.i18n.php'
	),
	"trTranscript" =>  array(
		'scripts' => "resources/trTranscript.js",
		'templates' => "../tr/templates/transcript.tmpl.html",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trTranscript'
	),
	"trControls" =>  array(
		'scripts' => "resources/trControls.js",
		'styles'  => "resources/style.css",
		'templates' => "../tr/templates/player-controls.tmpl.html",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trControls',
		'messageFile'	=> 'tr.i18n.php'
	),
	"trLocale" =>  array(
		'scripts' => "resources/trLocale.js",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trLocale',
		'messageFile'	=> 'tr.i18n.php'
	),
	"trPlaylistServices" =>  array(
		'scripts' => "resources/trPlaylistServices.js",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'kalturaPluginName' => 'trPlaylistServices'
	),
	"trSwa" =>  array(
		'scripts' => "resources/trSwa.js",
		'dependencies' => array(
			'mw.KBasePlugin'
		),
		'templates' => "../tr/templates/swa.tmpl.html",
		'kalturaPluginName' => 'trSwa'
	)

);