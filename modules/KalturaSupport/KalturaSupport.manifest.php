<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	/** uiConf components */
	'watermark' => array(
		'description' => "The kaltura watermark plugin",
		'attributes' => array(
			'watermarkPosition' =>array(
				'doc' => 'position of the watermark',
				'type' => 'enum',
				'enum' => array( "topRight", "topLeft", "bottomRight", "bottomLeft" )
			),
			'watermarkPath' => array(
				'doc' => "Url path to watermark image",
				'type' => 'url'
			),
			'watermarkClickPath' => array(
				'doc' => "Url for watermark click",
				'type' => 'url'
			),
			'padding' => array(
				'doc' => 'Padding from the edge of the play screen',
				'type' => 'number'
			)
		)
	),
		
		
	/** statistics has global flashvar based configuration:  **/
	'statistics' => array(
		'description' => "Kaltura Analytics plugin",
		'attributes'=> array(
		)
	),
	// top level properties: 
	'playbackContext' => array(
		'doc' => "The playback context sent to kaltura analytics"
	),
	'originFeature' => array(
		'doc' => "The featureType var sent to kaltura analytics"
	),
	'applicationName' => array(
		'doc' => "For registering the application with  kaltura analytics",
	),
	'userId' => array( 
		'doc' => "For associating a userId with kaltura analytics"
	),
	
	/* external resources example plugin stub */
	'myExternalResourcesPlugin' => array(
		'description' => "External resources attributes can be applied to a custom plugin by any name. All number keys can be incremneted to load more resources. i.e onPageJs1 onPageJs2 onPageJs3 etc.",
		"attributes" => array(
			'onPageJs1' => array(
				'doc' => "A onPage javascript file is loaded on client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins</a>",
				'type'=> 'url',
			),
			'onPageCss1' => array(
				'doc' => "A onPage css file is loaded on client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins</a>",
				'type'=> 'url'
			),
			'iframeHTML5Js1' => array(
				'doc' => "Javascript to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">html5 iframe plugins</a>",
				'type'=> 'url'
			),
			'iframeHTML5Css' => array(
				'doc' => "Css to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">html5 iframe plugins</a>",
				'type'=> 'url'
			)
		)
	),
	'IframeCustomPluginJs1' => array(
		'doc' => 'Url forjavascript to be loaded in the iframe',
		'type'=> 'url'
	),
	'IframeCustomPluginCss1' => array(
		'doc' => 'Url for css to be loaded in the iframe',
		'type'=> 'url'
	),
	"onPageJs1" =>array(
		'doc' => 'Url for javascript to be loaded on the embedding page',
		'type'=> 'url'
	), 
	"onPageCss1" => array(
		'doc' => 'Url for css to be loaded on embedding page',
		'type'=> 'url'
	),
	
	'adsOnReplay' => array(
		'doc' => 'True for showing ads in replay, flase to skip ads in replay',
		'type' => 'boolean'
	),
	
	'vast' => array(
		'description' => "External resources attributes can be applied to a custom plugin by any name. All number keys can be incremneted to load more resources. i.e onPageJs1 onPageJs2 onPageJs3 etc.",
		"attributes" => array(
			'numPreroll' => array(
				'doc' => 'The number of prerolls to be played',
				'type' => 'number'
			),
			'prerollUrl' => array(
				'doc' => "The vast ad tag xml url",
				'type' => 'url'
			),
			
			'numPostroll' => array(
				'doc' => 'The number of prerolls to be played',
				'type' => 'number'
			),
			'postrollUrl' => array(
				'doc' => "The vast ad tag xml url",
				'type' => 'url'
			),
			'preSequence' => array(
				'doc' => "The vast preSequence index, i.e 1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
				'type' => 'number'
			),
			'postSequence' => array(
				'doc' => "The vast postSequence index, i.e 1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
				'type' => 'number'
			),
			'htmlCompanions' => array(
				'doc' => "Companion list format, seperated by ;, {companionDomId}:{width}:{height};{companionDomId2}:{width2}:{height2}",
				'type' => 'string'
			),
			'overlayStartAt' => array(
				'doc' => "Start time ( in seconds ) for overlay",
				'type' => 'number'
			),
			'overlayInterval' => array(
				'doc' => "How offten should the overlay be displayed",
				'type' => 'number'
			),
			'overlayUrl' => array(
				'doc' => "The vast xml file which contains the overlay media and tracking info",
				'type' => 'url'
			),
			'timeout' => array(
				'doc' => "The timeout time in seconds, for loading an ad from a vast ad server",
				'type' => 'number'
			)
		)
	)
);
