<?php 
return	array(
	'plymedia' => array(
		'description' => "PLYmedia captions provides on demand and realtime caption services. 
			This player demonstrate plyMedia captions on top of video playback. 
			Learn more about <a target=\"_new\" href=\"http://exchange.kaltura.com/content/plymedia\">adding PLYmedia services</a> to your account",
		'attributes'=> array(
			// 
			"subpos" => array(
				'doc' => "1 - 100. 1 being highest (captions at the top of the video), 100 being lowest (captions at the default bottom which is 40 px).",
				'type'=> 'number'
			),
			// 
			'deflang' => array(
				'doc' => 'Default language - language code or \none\' for no default language.',
				'type' =>  'string'
			),
			'showbackground' => array(
				'doc' => 'Determine whether captions have background or not.',
				'type'=> 'boolean'
			)
		)
	)
);
