<?php
return array(
	"qna" => array(
		'scripts' => array( 'resources/qna.js', 'resources/knockout-3.3.0.js' ),
		'dependencies' => array( 'mw.KBaseScreen', 'nanoScroller' ),
		'kalturaPluginName' => 'qna',
		'styles' => 'resources/qna.css',
		'templates' => "../QnA/resources/qna.tmpl.html",
		'messageFile' => 'QnA.i18n.php',
	),
);