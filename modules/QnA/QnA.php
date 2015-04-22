<?php
return array(
	"qna" => array(
		'scripts' => array( 'resources/knockout-3.3.0.js', 'resources/qnaKOExtensions.js', 'resources/qnaModule.js', 'resources/qnaService.js', 'resources/qna.js'),
		'dependencies' => array( 'mw.KBaseScreen', 'nanoScroller' ),
		'kalturaPluginName' => 'qna',
		'styles' => 'resources/qna.css',
		'templates' => "../QnA/resources/qna.tmpl.html",
		'messageFile' => 'QnA.i18n.php',
	),
);