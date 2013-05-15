<?php 
/**
 * The kaltura plugin manifest
 */

// list any duplicate attribute sets here:
$kgDefaultCaptionAttr = array(
	'fontFamily' => array(
		'doc' => "Top level font familiy for Captions text",
		'type' => 'enum',
		'enum' => array("Arial","Arial Narrow","Arial Black","Bookman Old Style","Century Gothic","Comic Sans MS","Consolas","Courier New","Constantia,Georgia","Helvetica,Arial","Impact","Lucida Sans Unicode","Cambria","symbol","Tahoma","Cambria","Times New Roman","Trebuchet MS","Verdana,Geneva","DejaVu Sans","Webdings,fantasy","Wingdings,fantasy","Monotype Corsiva","Monotype Sorts" )
	),	
	'fontsize' => array(
		'doc' => "Captions font size",
		'type' => 'number'
	),
	'defaultLanguageKey' => array(
		'doc' => "The default launage key for the player",
		'type' => 'language'
	),
	'bg' => array(
		'doc' => "Background color for timed text",
		'type' => 'color'
	),
	'fontColor' => array(
		'doc' => "Color of the caption text",
		'type' => 'color'
	),
	'useGlow' => array(
		'doc' => "If the timed text should have a glow / shadow",
		'type' => 'boolean'
	),
	'glowBlur' => array(
		'doc' => "The glow amount in pixels",
		'type' => 'number'
	), 
	'glowColor' => array(
		'doc' => 'The color of the glow',
		'type' => 'color'
	)
);
return array (
	/*Captions */
	'closedCaptionsOverPlayer' => array(
		'description' => 'Display Captions over the player. Reach multi-lingual audience and comply with FCC regulations with Kaltura multi-lingual closed captions support.',
		'attributes' => $kgDefaultCaptionAttr
	),
	'closedCaptionsUnderPlayer' => array(
		'description' => 'Display under the player. Reach multi-lingual audience and comply with FCC regulations with Kaltura multi-lingual closed captions support.',
		'attributes' => $kgDefaultCaptionAttr
	),
	'closedCaptions' => array(
		'description' => 'Reach multi-lingual audience and comply with FCC regulations with Kaltura multi-lingual closed captions support.',
		'attributes' => $kgDefaultCaptionAttr
	),
	'custom1BtnControllerScreen' => array(
		'description' => 'Custom on screen button',
	),
	/** Playlists */
	
	'carousel' => array(
		'description' => 'Displays an on-screen list of clips in carousel, when playing its hidden, when paused its displayed',
		'attributes' => array(
			'playlist_id' => array(
				'doc' => "The id of the playlist to be displayed",
				'type' => 'string'
			)
		)
	),
	
	'playlistAPI' => array(
		'description' => 'The kaltura playlist plugin, supports associating multiple clips in sequence.',
		'attributes' => array(
			'autoContinue' => array(
				'doc' => "If the playlist should autocontinue",
				'type' => 'boolean'
			),
			'autoPlay' => array(
				'doc' => "If the playlist should autoplay on load",
				'type' => 'boolean'
			),
			'initItemEntryId' => array(
				'doc' => "The entryId that should be played first"
			),
			'kpl0Url' => array(
				'doc' => 'The playlist url. ( can be a kaltura playlist service or mrss)',
				'type' => 'url'
			),
			'kpl0Name' => array(
				'doc' => "The name of the playlist",
			),
			'kpl1Url' => array(
				'doc' => 'The N playlist url',
				'type' => 'url'
			),
			'kpl1Name' => array(
				'doc' => "The name of the indexed playlist",
			)
		) 
	),
	'playlistHolder' => array(
		'description' => 'Holds the playlist clip list',
		'attributes' => array(
			'includeInLayout' => array(
				'doc' => "If the playlist clip list should be displayed.",
				'type' => 'boolean'
			)
		)
	),
	'imageDefaultDuration' => array(
		'doc' => 'The duration image entries should be displayed',
		'type' => 'number'
	),
	'requiredMetadataFields' => array(
		'doc' => 'If metadata should be loaded into the player',
		'type' => 'boolean',
	),
	'externalInterfaceDisabled' => array(
		'doc' => 'The external interface disabled flag',
		'type' => 'boolean',
		'hideEdit' => true
	),
	
	/* flavor selector */
	'flavorComboControllerScreen' => array(
		'description' => "The kaltura flavor selector plugin",
	),
	'mediaProxy.preferedFlavorBR' => array(
		'doc' => 'The initial bitrate to be selected',
		'type' => 'number'
	),
	'deliveryCode' => array(
		'doc' => 'The deliveryCode is passed along as part of a domain prefix into the stream url. ( can be used for per-embed url billing categorization ) ',
		'type' => 'string'
	),
	'mediaProxy.mediaPlayFrom' => array(
		'doc' => "The media start time",
		'type' => 'number'
	),
	'mediaProxy.mediaPlayTo' => array(
		'doc' => "The media end time",
		'type' => 'number'
	),
	/** uiConf components */
	'controlsHolder' => array(
		'description' => "controlsHolder enables visible control over the control bar holder",
		'attributes' => array(
			'visible' => array(
				'doc' => "If the control holder should be visible",
				'type' => 'boolean'
			),
			'height' => array(
				'doc' => "Height of the controls holder",
				'type' => 'number'
			)
		)
	),
	'ControllerScreenHolder' => array(
		'description' => "The control bar holder",
		'attributes' => array(
			'visible' => array(
				'doc' => "If the control screen holder should be visible",
				'type' => 'boolean'
			)
		)
	),
	'segmentScrubber' => array(
		'description' => "<b>Playhead Segment</b> enables setting start and end times of a larger stream. <br>
The playhead reflects segment time as if it was the natural stream length.",
		'attributes' => array(
			'plugin' => array(
				'type' => 'boolean'
			),
			/*'timeIn' => array(
				'doc' => 'The start time of the segment',
				'type'=> 'number',
			),
			'timeOut' => array(
				'doc' => 'The end time of the segment',
				'type'=> 'number',
			)*/
		)
	),
	'mylogo' => array(
		'description' => "The kaltura custom logo plugin",
		'attributes' => array(
			'watermarkPath' => array(
				'doc' => "Url path to plugin image",
				'type' => 'url'
			),
			'watermarkClickPath' => array(
				'doc' => "Url for plugin click",
				'type' => 'url'
			)
		)
	),
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
		'description' => 'Kaltura analytics enables 
		<a target="_new" href="http://knowledge.kaltura.com/creating-and-tracking-analytics-kmc-0">tracking kaltura players</a>
		Statistics are enabled by default. Configuration consists of enabling the statistics plugin: ',
		'attributes'=> array(
			'trackEventMonitor' => array(
				'doc'=> "Enables you to audit kaltura events, with a named callback function",
				'type'=> 'string'
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
	'userAgentPlayerRules' => array(
		'description' => "Sets player default by user agent rules.",
		'attributes' => array(
			'disableForceMobileHTML5'=> array(
				'doc'=> "Disable the forceMobileHTML5 url flag. This prevents showing html5 player via url flag.",
				'type'=> 'boolean',
			),
			'r1RegMatch' => array(
				'doc'=> "First rule, RegMatch postfix means the rule is an regular expression",
				'type' => 'string'
			),
			'r1LeadWithHTML5'=> array(
				'doc' => "Lead with HTML5 action to take for matching the first rule",
				'type' => 'boolean'
			),
			'r2Match' => array(
				'doc'=> "Second rule, Match postfix means the rule is a simple string search",
				'type'=> 'string'
			),
			'r2ForceFlash' => array(
				'doc' => "Force Flash action to take for matching the second rule",
				'type' => 'boolean'
			),
			'r3Match' => array(
				'doc'=> "Third rule, Match postfix means the rule is a simple string search",
				'type'=> 'string'
			),
			'r3ForceMsg' => array(
				'doc' => "Force Msg, displays html for matching the third rule. HTML should be escaped",
				'type'=> 'string',
			),
			'r4RegMatch' => array(
				'doc' => "Forth rule,  RegMatch postfix means the rule is an regular expression",
				'type' => 'string'
			),
			'r4LeadWithHTML5' => array( 
				'doc' => "Forth action, LeadWithHTML5 means lead with html5 for forth rule match "
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
	'bumper' => array(
		'description' => "Bumpers, enables a kaltura entry, to be displayed before or after the content.",
		"attributes" => array(
			'bumperEntryID' => array(
				'doc' => 'The entry id of the bumper to be played',
				'type' => 'string'
			),
			'clickurl' => array(
				'doc'=> "The url to open when the user clicks the bumper video",
				'type' => "URL"
			),
			'lockUI' => array(
				'doc' => "If the playhead, pause and volume controls should be locked durring bumper playback",
				'type' => 'boolean'
			),
			'playOnce' => array(
				'doc' => "If the bumper should only play once, in cases of playlists or content replay",
				'type' => 'boolean'
			),
			'preSequence'=> array(
				'doc' => "The preSequence number, for sequencing the bumper before or after ads <i>before content</i>.
					 Also can be set to zero and set postSequence to 1, to have the bumper play after the content",
				'type' => 'number'
			),
			'postSequence'=> array(
				'doc' => "The postSequence number, for sequencing the bumper before or after ads <i>after content</i>. 
					Also can be set to zero and set preSequence to 1, to have the bumper play before the content",
				'type' => 'number'
			)
		)
	),
	'vast' => array(
		'description' => "Kaltura player features robust VAST support for prerolls, midrolls, overlays, companions and postrolls",
		"attributes" => array(
			'prerollUrl' => array(
				'doc' => "The vast ad tag xml url",
				'type' => 'url'
			),
			'numPreroll' => array(
				'doc' => 'The number of prerolls to be played',
				'type' => 'number'
			),
			'prerollStartWith' => array(
				'doc' => 'What prerolls to start with',
				'type' => 'number'
			),
			'prerollInterval' => array(
				'doc' => "How offten to show prerolls",
				'type' => 'number'
			),
			'preSequence' => array(
				'doc' => "The vast preSequence index, i.e 1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
				'type' => 'number'
			),
			
			'postrollUrl' => array(
				'doc' => "The vast ad tag xml url",
				'type' => 'url'
			),
			'numPostroll' => array(
				'doc' => 'The number of prerolls to be played',
				'type' => 'number'
			),
			'postrollStartWith' => array(
				'doc' => 'What postrolls to start with',
				'type' => 'number'
			),
			'postrollInterval' => array(
				'doc' => "How offten to show postrolls",
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
