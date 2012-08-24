<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	/** statistics has global flashvar based configuration:  **/
	'statistics' => array(
		'description' => "Kaltura Analytics plugin",
		'attributes'=> array(
			'plugin' => array(
				'doc' => 'If the plugin should be enabled',
				'edit' => true,
				'type' => 'boolean'
			)
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
				'edit' => true,
				'type'=> 'url',
			),
			'onPageCss1' => array(
				'doc' => "A onPage css file is loaded on client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins</a>",
				'edit' => true,
				'type'=> 'url'
			),
			'iframeHTML5Js1' => array(
				'doc' => "Javascript to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">html5 iframe plugins</a>",
				'edit' => true,
				'type'=> 'url'
			),
			'iframeHTML5Css' => array(
				'doc' => "Css to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">html5 iframe plugins</a>",
				'edit' => true,
				'type'=> 'url'
			)
		)
	),
	'IframeCustomPluginJs1' => array(
		'doc' => 'var for registering javascript to be loaded in the iframe',
		'edit' => true,
		'type'=> 'url'
	),
	'IframeCustomPluginCss1' => array(
		'doc' => 'var for registering css to be loaded in the iframe',
		'edit' => true,
		'type'=> 'url'
	),
	"onPageJs1" =>array(
		'doc' => 'var for registering js to be loaded on page',
		'edit' => true,
		'type'=> 'url'
	), 
	"onPageCss1" => array(
		'doc' => 'var for registering css to be loaded on page',
		'edit' => true,
		'type'=> 'url'
	),
);
