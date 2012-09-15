<?php 

	// Register all the timedText modules 
	return array(			
		"mw.TimedText" => array(
			'scripts' => "resources/mw.TimedText.js",
			'styles' => "resources/mw.style.TimedText.css",
			'dependencies' => array(
				'mw.EmbedPlayer',
				'jquery.ui.dialog',
				'mw.TextSource',
				'mw.Language.names'
			),
			'messageFile' => 'TimedText.i18n.php',
		),
		"mw.TextSource" => array(
			'scripts' => "resources/mw.TextSource.js",
			'dependencies' => array(
				'mediawiki.UtilitiesTime',
				"mw.ajaxProxy",
			)
		),
		"mw.Language.names" => array(
			'scripts' => "resources/mw.Language.names.js"
		)
	);	