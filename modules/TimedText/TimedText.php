<?php 

	// Register all the timedText modules 
	return array(			
		"mw.TimedText" => array(
			'scripts' => "resources/mw.TimedText.js",
			'styles' => "resources/mw.style.TimedText.css",
			'dependencies' => array(
				'mw.EmbedPlayer',	
				'mw.Language.names',
				'jquery.ui.dialog',			
			),
			'messageFile' => 'TimedText.i18n.php',
		),
		"mw.TimedTextEdit" => array(
			'scripts' => "resources/mw.TimedTextEdit.js",
			'styles' => "resources/mw.style.TimedTextEdit.css",
			'dependencies' => array(
				'mw.TimedText',				
				'jquery.ui.tabs'
			)
		),
		"RemoteMwTimedText" =>array(
			'scripts' => "remotes/RemoteMwTimedText.js"
		)
	);	