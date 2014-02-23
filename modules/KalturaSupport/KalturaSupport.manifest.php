<?php
/**
 * The Kaltura plugin manifest
 */

$kgDefaultComponentAttr = array(
	'parent' => array(
		'doc' => 'Parent container for component. Components include default placement. Leave as null if unsure.',
		'type' => 'enum',
		'enum' => array("topBarContainer", "videoHolder", "controlsContainer")
	),
	'order' => array(
		'doc' => 'Draw order of the component within the container.
			Together with alignment, determines component placement of the component. Inspect elements see sibling order.',
		'type' => 'number',
	),
	'align' => array(
		'doc' => 'Alignment for component, can be left or right.',
		'type' => 'enum',
		'enum' => array('left', 'right')
	)
);

// list any duplicate attribute sets here:
$kgDefaultCaptionAttr = array(
	'layout' => array(
		'doc' => 'Layout mode for caption, overlaid or under player.',
		'type' => 'enum',
		'initvalue' => 'ontop',
		'enum' => array("ontop", "below"),
		'options' => array(
			array(
				'label' => "On top of the video.",
				'value' => "ontop"
			),
			array(
				'label' => "Below the video.",
				'value' => "below"
			)
		)
	),
	'displayCaptions' => array(
		'doc' => 'Should caption be displayed by default.',
		'initvalue' => true,
		'type' => 'boolean'
	),
	'useCookie' => array(
		'doc' => 'Should use cookies to store user language.',
		'type' => 'boolean'
	),
	'fontFamily' => array(
		'doc' => "Top level font family for caption text.",
		'type' => 'enum',
		'initvalue' => 'Arial',
		'enum' => array("Arial", "Arial Narrow", "Arial Black", "Bookman Old Style", "Century Gothic", "Comic Sans MS", "Consolas", "Courier New", "Constantia,Georgia", "Helvetica,Arial", "Impact", "Lucida Sans Unicode", "Cambria", "symbol", "Tahoma", "Cambria", "Times New Roman", "Trebuchet MS", "Verdana,Geneva", "DejaVu Sans", "Webdings,fantasy", "Wingdings,fantasy", "Monotype Corsiva", "Monotype Sorts")
	),
	'fontsize' => array(
		'doc' => "Captions' font size.",
		'label' => 'Font size',
		'initvalue' => 12,
		'type' => 'number'
	),
	'defaultLanguageKey' => array(
		'doc' => "The default language key for the player.",
		'type' => 'language'
	),
	'bg' => array(
		'doc' => "Background color for timed text.",
		'label' => 'Background color.',
		'initvalue' => 'ontop',
		'type' => 'color'
	),
	'fontColor' => array(
		'doc' => "Color of the caption text.",
		'initvalue' => '#000000',
		'type' => 'color'
	),
	'useGlow' => array(
		'doc' => "If the timed text should have a glow / shadow.",
		'initvalue' => false,
		'type' => 'boolean'
	),
	'glowBlur' => array(
		'doc' => "The glow amount in pixels.",
		'initvalue' => 0,
		'type' => 'number'
	),
	'glowColor' => array(
		'doc' => 'The color of the glow.',
		'initvalue' => '#ffffff',
		'type' => 'color'
	)
);
return array(
	/*Captions */
	'closedCaptions' => array(
		'description' => 'Reach multi-lingual audiences and comply with FCC regulations with Kaltura multi-lingual closed captions support.',
		'attributes' => $kgDefaultCaptionAttr
	),
	'custom1BtnControllerScreen' => array(
		'description' => 'Custom on screen button',
	),
	'controlBarContainer' => array(
		'description' => 'Control bar container, holds all the player controls.',
		'attributes' => array(
			'hover' => array(
				'doc' => "If the controls should hover on the player, or not.",
				'type' => 'boolean'
			)
		)
	),
	'audioDescription' => array(
		'description' => 'Audio description tracks, supports associating an audio file to be played at the same time as the video.',
		'attributes' =>array(
			'file' => array(
				'doc' => "The URL or custom data mapping to URL for audio description track.",
				'type' => 'string'
			)
		)
	),

	/** Playlists */

	'carousel' => array(
		'description' => 'Displays an on-screen list of clips in the carousel. When playing it's hidden, when paused it's displayed.',
		'attributes' => array(
			'playlist_id' => array(
				'doc' => "The ID of the playlist to be displayed.",
				'type' => 'string'
			)
		)
	),
	'loadingSpinner' => array(
		'description' => 'Use to customize the look of the loading spinner.',
		'attributes' => array(
			'imageUrl' => array(
				'doc' => "An image URL to use as the loading spinner. The default its null. If given a URL, it will replace the dynamic loading spinner.",
				'type' => 'url'
			),
			'lines' => array(
				'doc' => 'The number of lines to draw, Default is 11.',
				'type' => 'number'
			),
			'lineLength' => array(
				'doc' => 'The length of each line. Default is 10 pixels.',
				'type' => 'number'
			),
			'width' => array(
				'doc' => 'The line thickness. Default is 6 pixels thick.',
				'type' => 'number'
			),
			'radius' => array(
				'doc' => 'The radius of the inner circle. Default is 12 pixels thick.',
				'type' => 'number'
			),
			'corners' => array(
				'doc' => 'Corner roundness (0..1). Default is 1 for fully rounded corners.',
				'type' => 'number'
			),
			'rotate' => array(
				'doc' => 'The rotation offset. Default is 0.',
				'type' => 'number'
			),
			'direction' => array(
				'doc' => '1: clockwise, -1: counterclockwise. Default is clockwise.',
				'type' => 'number'
			),
			'color' => array(
				'doc' => 'An array of RGB colors delimited by |, or a single RGB style color string. The default uses the color wheel.',
				'type' => 'string'
			),
			'speed' => array(
				'doc' => 'Rounds per second. Default is1.6.',
				'type' => 'float'
			),
			'trail' => array(
				'doc' => 'Afterglow percentage. Default is100.',
				'type' => 'number'
			),
			'shadow' => array(
				'doc' => 'Whether to render a shadow. Default is False.',
				'type' => 'boolean'
			),
			'hwaccel' => array(
				'doc' => 'Whether to use hardware acceleration on loading spinner.',
				'type' => 'boolean'
			),
			'className' => array(
				'doc' => 'The CSS class to assign to the spinner. Default is \'spinner\.'',
				'type' => 'string'
			),
			'zIndex' => array(
				'doc' => 'The z-index (defaults to 2000000000)',
				'type' => 'string'
			),
			'top' => array(
				'doc' => 'Top position relative to the parent in px. Default is auto.',
				'type' => 'string'
			),
			'left' => array(
				'doc' => 'Left position relative to parent in px.',
				'type' => 'string'
			)
		)
	),
	'playlistAPI' => array(
		'description' => 'The Kaltura playlist plugin, supports associating multiple clips in sequence.',
		'attributes' => array(
			'autoContinue' => array(
				'doc' => "If the playlist should auto-continue.",
				'type' => 'boolean'
			),
			'autoPlay' => array(
				'doc' => "If the playlist should auto-play on load.",
				'type' => 'boolean'
			),
			'initItemEntryId' => array(
				'doc' => "The entryId that should be played first."
			),
			'kpl0Url' => array(
				'doc' => 'The playlist URL. (This may be a Kaltura playlist service or MRSS.)',
				'type' => 'url'
			),
			'kpl0Name' => array(
				'doc' => "The name of the playlist.",
			),
			'kpl1Url' => array(
				'doc' => 'The N playlist URL.',
				'type' => 'url'
			),
			'kpl1Name' => array(
				'doc' => "The name of the indexed playlist.",
			)
		)
	),
	'playlistHolder' => array(
		'description' => 'Holds the playlist clip list.',
		'attributes' => array(
			'includeInLayout' => array(
				'doc' => "If the playlist clip list should be displayed.",
				'type' => 'boolean'
			)
		)
	),
	'imageDefaultDuration' => array(
		'doc' => 'If the duration image entries should be displayed.',
		'type' => 'number'
	),
	'requiredMetadataFields' => array(
		'doc' => 'If metadata should be loaded into the player.',
		'type' => 'boolean',
	),
	'metadataProfileId' => array(
		'doc' => "The metadata profile ID to be used for custom player metadata. <br> " .
			" If unset, will use the latest metadata ID added to that player. It is best to point it at a particular metadata profile ID.<br>" .
			"It Will pouplate {mediaProxy.entryMetadata} with the associated custom data.",
		'type' => 'number'
	),
	'externalInterfaceDisabled' => array(
		'doc' => 'The external interface disabled flag.',
		'type' => 'boolean',
		'hideEdit' => true
	),
	/* speed selector*/
	'playbackRateSelector' => array(
		'description' => "Enables users to select the video playback rate.",
		'attributes' => array(
			'defaultSpeed' => array(
				'doc' => 'The default speed of the player.',
				'initvalue' => 1,
				'type' => 'number'
			),
			'speeds' => array(
				'doc' => "The set of selectable speeds, where 1 = 100% speed. Speeds should be seperated by commas.",
				'label' => 'Selectable speeds.',
				'type' => 'string'
			)
		)
	),
	/* flavor selector */
	'flavorComboControllerScreen' => array(
		'description' => "The Kaltura flavor selector plugin.",
	),
	'sourceSelector' => array(
		'description' => "Enables users to select the video quality.",
		'attributes' => array(
			'switchOnResize' => array(
				'doc' => 'When the player changes size or goes into full screen,the source updates the per playback resolution. By default, the embed size 
					is only taken into consideration at startup.',
				'type' => 'boolean',
			),
			'simpleFormat' => array(
				'doc' => "Use simple format to restrict to only two sources per named size, and not list the content type",
				'type' => 'boolean',
			)
		)
	),
	'docPlayToFrom' => array(
		'description' => "The playFrom and playTo attributes enable building a preview of segment of content.",
		'hideEdit' => true
	),
	'mediaProxy.mediaPlayFrom' => array(
		'doc' => 'The start time for the video preview.',
		'type' => 'number'
	),
	'mediaProxy.mediaPlayTo' => array(
		'doc' => 'The time in seconds, for the video preview to end.',
		'type' => 'number'
	),
	'mediaProxy.preferedFlavorBR' => array(
		'doc' => 'The initial bit-rate to be selected.',
		'type' => 'number'
	),
	'deliveryCode' => array(
		'doc' => 'Passed along as part of a domain prefix into the stream URL. ( deliveryCode may be used for the per-embed URL billing categorization.) ',
		'type' => 'string'
	),
	'mediaProxy.mediaPlayFrom' => array(
		'doc' => "The media start time.",
		'type' => 'number'
	),
	'mediaProxy.mediaPlayTo' => array(
		'doc' => "The media end time.",
		'type' => 'number'
	),
	/** uiConf components */
	'controlsHolder' => array(
		'description' => "Enables you to hide or show the control bar.",
		'attributes' => array(
			'visible' => array(
				'doc' => "If the control holder should be visible.",
				'type' => 'boolean'
			),
			'height' => array(
				'doc' => "Height of the controls holder.",
				'type' => 'number'
			)
		)
	),
	'ControllerScreenHolder' => array(
		'description' => "The control bar holder.",
		'attributes' => array(
			'visible' => array(
				'doc' => "If the control screen holder should be visible.",
				'type' => 'boolean'
			)
		)
	),
	'scrubber' => array(
		'description' => "The playhead scrubber.",
		'attributes' => array(
			'parent' => array(
				'doc' => "The holder for the playhead scrubber. If set to controlsContainer, it will be placed inline with the other control buttons. If set to controlsBarContainer . it will display all the way across the player.",
				'type' => 'enum',
				'enum' => array("controlsBarContainer", "controlsContainer"),
			),
			'minWidth' => array(
				'doc' => "The minimum width of the playhead. If the min-width is reached, the normal responsive display importance removal rules come into effect.",
				'type' => 'number'
			)
		)
	),
	'segmentScrubber' => array(
		'description' => "<b>Playhead Segment</b> enables setting the start and end times of a larger stream. <br>
The playhead reflects segment time as if it was the natural stream length.",
		'attributes' => array(
			'plugin' => array(
				'type' => 'boolean'
			),
			/*'timeIn' => array(
				'doc' => 'The start time of the segment.',
				'type'=> 'number',
			),
			'timeOut' => array(
				'doc' => 'The end time of the segment.',
				'type'=> 'number',
			)*/
		)
	),
	'mylogo' => array(
		'description' => "The Kaltura custom logo plugin.",
		'attributes' => array(
			'watermarkPath' => array(
				'doc' => "URL path to the plugin image.",
				'type' => 'url'
			),
			'watermarkClickPath' => array(
				'doc' => "URL for plugin click",
				'type' => 'url'
			)
		)
	),
	'theme' => array(
		'description' => 'Theme CSS style.',
		'featureCheckbox' => true,
		'label' => 'Custom styles.',
		'attributes' => array(
			'buttonsSize' => array(
				'label' => 'Buttons size.',
				'doc' => 'Buttons size.',
				'type' => 'number',
				'player-refresh' => 'theme.buttonsSize',
				"initvalue" => 12,
				"from" => 2,
				"to" => 100,
				"stepsize" => 1,
				"numberOfDecimals" => 0
			),
			'buttonsColor' => array(
				'label' => 'Buttons color',
				"initvalue" => "#000000",
				'player-refresh' => 'theme.buttonsColor',
				'doc' => 'Buttons color.',
				'type' => 'color'
			),
			'buttonsIconColor' => array(
				'label' => 'Buttons icon color.',
				"initvalue" => "#ffffff",
				'player-refresh' => 'theme.buttonsIconColor',
				'doc' => 'Buttons icon color.',
				'type' => 'color'
			),
			'sliderColor' => array(
				'label' => 'Slider color',
				"initvalue" => "#333333",
				'player-refresh' => 'theme.sliderColor',
				'doc' => 'Slider color.',
				'type' => 'color'
			),
			'scrubberColor' => array(
				'label' => 'Scrubber color.',
				"initvalue" => "#ffffff",
				'player-refresh' => 'theme.scrubberColor',
				'doc' => 'Scrubber color.',
				'type' => 'color'
			),
			'controlsBkgColor' => array(
				'label' => 'Controls bar color.',
				"initvalue" => "#000000",
				'player-refresh' => 'theme.controlsBkgColor',
				'doc' => 'Controls bar color.',
				'type' => 'color'
			)
		)
	),
	'share' => array(
		'featureCheckbox' => true,
		'description' => 'Add the Share interface to the player.',
		'type' => 'featuremenu',
		'label' => 'Share',
		'model' =>'config.plugins.share',
		'attributes' => array(
			'parent' => array(
				'doc' => 'Parent container for component. The components include: default placement. Leave as null if uncertain.',
				'model' => "config.plugins.share.parent",
				'type' => 'enum',
				'enum' => array("topBarContainer", "videoHolder", "controlsContainer"),
				'options' => array(
					array(
						'label' => "Top bar container.",
						'value' => "topBarContainer"
					),
					array(
						'label' => "Video holder.",
						'value' => "videoHolder"
					), array(
						'label' => "Controls container.",
						'value' => "controlsContainer"
					)
				),
				'initvalue' => "topBarContainer"
			),
			'align' => array(
				'doc' => 'Alignment for component, can be left or right.',
				'type' => 'enum',
				'enum' => array('left', 'right'),
				'initvalue' => "right",
				'options' => array(
					array(
						'label' => "Left",
						'value' => "left"
					),
					array(
						'label' => "Right",
						'value' => "right"
					)
				)
			),
			'socialNetworks' => array(
				'doc' => "Comma separated list of social networks to be included. Presently supported networks include: Facebook, Twitter and Google+.", 
				'type' => 'string',
				'initvalue' => 'facebook,twitter,googleplus'
			),
			'socialShareURL' => array(
				'doc' => "Allows you define the URL shared for this player.
					<ul>
						<li><b>Smart</b> - maximizes inline social sharing playback, by using a page URL or the Kaltura URL, depending if opengraph tags are present.</li>
						<li><b>Parent</b>  - shares the parent page URL.</li>
						<li><b>http://my-custom-domain.com/?v={mediaProxy.entry.id}</b>  - a custom URL with magic substitution can also be used.</li>
					</ul>",
				'type' => 'string'
			),
		)
	),
	'watermark' => array(
		'featureCheckbox' => true, // *NEW* - actually enabled even if undefined but can be disabled via this property
		'description' => "The Kaltura watermark plugin", // used for tooltip
		'type' => 'featuremenu', // *NEW* = renders as featuremenu also if undefined, but can be turned into submenu via this
		'label' => 'Watermark', // *NEW*
		'model' =>'config.plugins.watermark', //*NEW*
		'attributes' => array(
			'watermarkPosition' => array(
				'model' => "config.plugins.watermark.cssClass",
				'label' => 'Position', // *NEW*
				'doc' => 'Position of the watermark.',
				'type' => 'enum',
				'enum' => array("topRight", "topLeft", "bottomRight", "bottomLeft"),
				"initvalue" => "topLeft", // *NEW*
				'options' => array( // *NEW* - we need display values...
					array(
						'label' => "Top Right",
						'value' => "topRight"
					),
					array(
						'label' => "Top Left",
						'value' => "topLeft"
					), array(
						'label' => "Bottom Right",
						'value' => "bottomRight"
					), array(
						'label' => "Bottom Left",
						'value' => "bottomLeft"
					)
				),
			),
			'watermarkPath' => array(
				'label' => 'Image URL', // *NEW*
				'model' => 'config.plugins.watermark.img',
				'doc' => "URL path to watermark image.",
				'initvalue' => 'http://www.kaltura.com/content/uiconf/kaltura/kmc/appstudio/kdp3/exampleWatermark.png',
				'type' => 'url' //URL input validation still not implemented but very easy in anuglar - renders as text.
			),
			'watermarkClickPath' => array(
				'label' => 'Click URL', // *NEW*
				'model' => 'config.plugins.watermark.href',
				'doc' => "URL for watermark click.",
				'initvalue' =>'http://www.kaltura.com/',
				'type' => 'url'
			),
			'padding' => array(
				'label' => 'Padding CSS', // *NEW*
				'doc' => 'Padding CSS property from the edge of the play screen in px.',
				'type' => 'number',
				"initvalue" => 10, // *NEW* all of these have defaults if undefined.
				"from" => 0, // *NEW*
				"to" => 100, // *NEW*
				"stepsize" => 1, // *NEW*
				"numberOfDecimals" => 0 // *NEW*
			)
		)
	),

	/** statistics has global flashvar based configuration:  **/
	'statistics' => array(
		'description' => 'Kaltura Analytics enables
		<a target="_new" href="http://knowledge.kaltura.com/creating-and-tracking-analytics-kmc-0"> you to trackKaltura player aalytics and reporting.</a>
		Statistics are enabled by default. Configuration consists of enabling the statistics plugin: ',
		'attributes' => array(
			'trackEventMonitor' => array(
				'doc' => "Enables you to audit Kaltura events, with a named callback function.",
				'type' => 'string'
			),
			'playbackContext' => array(
				'doc' => "The playback context sent to Kaltura analytics.",
				'type' => 'string'
			),
			'originFeature' => array(
				'doc' => "The featureType var sent to Kaltura analytics.",
				'type' => 'string'
			),
			'applicationName' => array(
				'doc' => "For registering the application with Kaltura analytics.",
				'type' => 'string'
			),
			'userId' => array(
				'doc' => "For associating a userId with Kaltura analytics.",
				'type' => 'string'
			),
		)
	),

	/* external resources example plugin stub */
	'myExternalResourcesPlugin' => array(
		'description' => "External resources attributes can be applied to a custom plugin by any name. All number keys can be incremented to load more resources. i.e onPageJs1 onPageJs2 onPageJs3 etc.",
		"attributes" => array(
			'onPageJs1' => array(
				'doc' => "An onPage JavaScript file is loaded on the client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins.</a>",
				'type' => 'url',
			),
			'onPageCss1' => array(
				'doc' => "A onPage CSS file is loaded on the client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins.</a>",
				'type' => 'url'
			),
			'iframeHTML5Js1' => array(
				'doc' => "JavaScript to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">HTML5 iframe plugins.</a>",
				'type' => 'url'
			),
			'iframeHTML5Css' => array(
				'doc' => "CSS to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">HTML5 iframe plugins.</a>",
				'type' => 'url'
			)
		)
	),
	'userAgentPlayerRules' => array(
		'description' => "Sets the player default by user agent rules.",
		'attributes' => array(
			'disableForceMobileHTML5' => array(
				'doc' => "Disable the forceMobileHTML5 url flag. This prevents showing the HTML5 player via URL flag.",
				'type' => 'boolean',
			),
			'r1RegMatch' => array(
				'doc' => "First rule, RegMatch postfix means the rule is an regular expression",
				'type' => 'string'
			),
			'r1LeadWithHTML5' => array(
				'doc' => "Lead with HTML5 action to take for matching the first rule.",
				'type' => 'boolean'
			),
			'r2Match' => array(
				'doc' => "Second rule, Match postfix means the rule is a simple string search.",
				'type' => 'string'
			),
			'r2ForceFlash' => array(
				'doc' => "Force Flash action to take for matching the second rule.",
				'type' => 'boolean'
			),
			'r3Match' => array(
				'doc' => "Third rule, Match postfix means the rule is a simple string search",
				'type' => 'string'
			),
			'r3ForceMsg' => array(
				'doc' => "Force Msg, displays the HTML for matching the third rule. HTML should be escaped.",
				'type' => 'string',
			),
			'r4RegMatch' => array(
				'doc' => "Fourth rule,  RegMatch postfix means the rule is a regular expression.",
				'type' => 'string'
			),
			'r4LeadWithHTML5' => array(
				'doc' => "Fourth action, LeadWithHTML5 - lead with HTML5 for fourth rule match. "
			)
		)
	),


	'IframeCustomPluginJs1' => array(
		'doc' => 'URL for JavaScript to be loaded in the iframe.',
		'type' => 'url'
	),
	'IframeCustomPluginCss1' => array(
		'doc' => 'URL for CSS to be loaded in the iframe.',
		'type' => 'url'
	),
	"onPageJs1" => array(
		'doc' => 'URL for JavaScript to be loaded on the embedding page.',
		'type' => 'url'
	),
	"onPageCss1" => array(
		'doc' => 'URL for CSS to be loaded on embedding page.',
		'type' => 'url'
	),

	'adsOnReplay' => array(
		'doc' => 'True for showing ads in replay. False to skip ads in replay.',
		'type' => 'boolean'
	),
	'bumper' => array(
		'description' => "Bumpers, enables a Kaltura entry to be displayed before or after the content.",
		"attributes" => array(
			'bumperEntryID' => array(
				'doc' => 'The entry ID of the bumper to be played.',
				'type' => 'string'
			),
			'clickurl' => array(
				'doc' => "The URL to open when the user clicks the bumper video.",
				'label' => 'Click URL.',
				'type' => "url"
			),
			'preSequence' => array(
				'doc' => "The preSequence number, for sequencing the bumper before or after ads before content. Also can be set to zero. Then set postSequence to 1, to have the bumper play after the content.",
				'label' => 'Pre sequence index',
				'initvalue' => 1,
				'type' => 'number'
			),
			'postSequence' => array(
				'doc' => "The postSequence number, for sequencing the bumper before or after ads after content. Also can be set to zero. Then set preSequence to 1, to have the bumper play before the content.",
				'label' => 'Post sequence index',
				'initvalue' => 0,
				'type' => 'number'
			)
		)
	),
	'vast' => array(
		'label' => 'VAST',
		"endline" => "true", // *NEW* - demonstrates possible formatting decorator
		'type' => 'menu', // *NEW* - demonstrates submenu
		'description' => "Kaltura player features robust VAST support for prerolls, midrolls, overlays, companions and postrolls.",
		"attributes" => array(
			'prerollUrl' => array(
				'doc' => "The vast ad tag xml url",
				'label' => 'Preroll URL', // *NEW* - all controls require a label. If there is no label, use the control model camelCase converted to separated words with ucfirst.
				'type' => 'url'
			),
			'numPreroll' => array(
				'label' => 'Preroll(s) amount', // *NEW*
				'doc' => 'The number of prerolls to be played.',
				'type' => 'number',
				'from' => 0, // *NEW*
				'stepsize' => 1, // *NEW*
				'initvalue' => 1,
				'to' => 5, // *NEW*
			),
			'skipOffset' => array(
				'doc' => 'The time in seconds, before the skip ad link is active.',
				'type' => 'number', // this was a string - dosen't seem logical
				'from' => 0, // *NEW*
				'stepsize' => 1, // *NEW*
				'initvalue' => 5,
				'to' => 5,// *NEW*
			),
			'skipBtn' => array(
				'doc' => "Skip button label.",
				'label' => 'Skip button label.', // *NEW* - all controls require label, if is it not there,use the control model camelCase converted to separated words with ucfirst
				'model' => 'config.plugins.skipBtn.label',
				'initvalue' => "Skip Ad",
				'type' => 'string'
			),
			'storeSession' => array(
				'doc' => 'If the frequency playback should be stored across player reloads.
					By default, only playlists respect frequency intervals. 
					If set to true, prerollInterval will be respected across player views.',
				'type' => 'boolean',
				'initvalue' => false,
			),
			'prerollStartWith' => array(
				'label' => 'Number of prerolls to start with.', // *NEW*
				'doc' => 'Number of prerolls to start with.',
				'type' => 'number',// *NEW*
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'initvalue' => 0,
				'to' => 5,// *NEW*
			),
			'prerollInterval' => array(
				'label' => 'Preroll interval',// *NEW*
				'doc' => "How offten to show prerolls",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'initvalue' => 0,
				'to' => 5,// *NEW*
			),
			'preSequence' => array(
				'label' => 'VAST pre-sequence index',// *NEW*
				'doc' => "The vast preSequence index. for example, 1 for ads then 2 for a bumper plugin; would result in an ad and then a bumper.",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 5,// *NEW*
				'initvalue' => 0,
				"endline" => "true", // *NEW* - demonstrates possible formatting decorator
			),

			'postrollUrl' => array(
				'label' => 'Postroll URL',// *NEW*
				'doc' => "The VAST ad tag XML URL,",
				'type' => 'url'
			),
			'numPostroll' => array(
				'label' => 'Postroll(s) amount',
				'doc' => 'The number of postrolls to be played.',
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'initvalue' => 1,
				'to' => 5,// *NEW*
			),
			'postrollStartWith' => array(
				'doc' => 'Number of postrolls to start with.',
				'label' => 'Number of postrolls to start with.',
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 5,// *NEW*
			),
			'postrollInterval' => array(
				'doc' => "How often to show postrolls.",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 5,// *NEW*
			),
			'postSequence' => array(
				'label' => 'VAST post-sequence index.',
				'doc' => "The VAST postSequence index. For example, 1 for ads then 2 for a bumper plugin; would result in an ad and then a bumper.",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 5,// *NEW*
				"endline" => "true", // *NEW* - demonstrates possible formatting decorator
			),
			'htmlCompanions' => array(
				'label' => 'HTML Companions',// *NEW*
				'doc' => "Companion list format, separated by ;, {companionDomId}:{width}:{height};{companionDomId2}:{width2}:{height2}",
				'initvalue' => "Companion_300x250:300:250;Companion_728x90:728:90;",
				'type' => 'string'
			),
			'overlayStartAt' => array(
				'label' => 'Overlay start time',
				'doc' => "Start time ( in seconds ) for overlay.",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 10000,// *NEW*
			),
			'overlayInterval' => array(
				'doc' => "How often should the overlay be displayed.",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 5,// *NEW*
			),
			'overlayUrl' => array(
				'label' => 'Overlay URL',// *NEW*
				'doc' => "The VAST XML file that contains the overlay media and tracking info.",
				'type' => 'url'
			),
			'timeout' => array(
				'doc' => "The timeout in seconds, for loading an ad from a VAST ad server",
				'type' => 'number',
				'from' => 0,// *NEW*
				'stepsize' => 1,// *NEW*
				'to' => 1000,// *NEW*
			)
		)
	),
	'keyboardShortcuts' => array(
		'description' => 'Allows you to control the player using keyboard shortcuts.' . 
			'More about JavaScript <a target="_new" href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent">key mappings.</a>',
		'attributes' => array(
			'volumePercentChange' => array(
				'doc' => 'Volume change percent. from 0 to 1.',
				'type' => 'number',
				'initvalue' => '0.1',
			),
			'shortSeekTime' => array(
				'doc' => 'Short seek time in seconds.',
				'type' => 'number',
				'initvalue' => '5'
			),
			'longSeekTime' => array(
				'doc' => 'Long seek time in seconds.
				'type' => 'number',
				'initvalue' => '10'	
			),
			'volumeUpKey' => array(
				'doc' => 'Volume Up Key.',
				'type' => 'number',
				'initvalue' => '38'	
			),
			'volumeDownKey' => array(
				'doc' => 'Volume Down Key.',
				'type' => 'number',
				'initvalue' => '40'	
			),
			'togglePlaybackKey' => array(
				'doc' => 'Playback Toggle Key.',
				'type' => 'number',
				'initvalue' => '32'
			),
			'shortSeekBackKey' => array(
				'doc' => 'Short Seek Back Key.',
				'type' => 'number',
				'initvalue' => '37'
			),
			'longSeekBackKey' => array(
				'doc' => 'Long Seek Back Key',
				'type' => 'string',
				'initvalue' => 'ctrl+37'
			),
			'shortSeekForwardKey' => array(
				'doc' => 'Short Seek Long Key.',
				'type' => 'number',
				'initvalue' => '39'
			),
			'longSeekForwardKey' => array(
				'doc' => 'Long Seek Long Key.',
				'type' => 'string',
				'initvalue' => 'ctrl+39'
			),
			'openFullscreenKey' => array(
				'doc' => 'Open Full Screen Key.',
				'type' => 'number',
				'initvalue' => '70'
			),
			'closeFullscreenkey' => array(
				'doc' => 'Close Full Screen Key.',
				'type' => 'number',
				'initvalue' => '27'
			),
			'gotoBeginingKey' => array(
				'doc' => 'Go to the beginning of the video.',
				'type' => 'number',
				'initvalue' => '36'
			),
			'gotoEndKey' => array(
				'doc' => 'Go to the end of video.',
				'type' => 'number',
				'initvalue' => '35'
			),
			'percentageSeekKeys' => array(
				'doc' => 'Comma separated keys for percentage seek.',
				'type' => 'string',
				'initvalue' => '49,50,51,52,53,54,55,56,57'
			)
		)
	),
	'volumeControl' => array(
		'description' => 'Allows you to control the player volume using mute/unmute buttons and a volume slider.',
		'attributes' => array_merge_recursive($kgDefaultComponentAttr, array(
				'order' => array(
					'initvalue' => '11'
				),
				'showSlider' => array(
					'doc' => 'Show the volume slider.',
					'type' => 'boolean',
					'initvalue' => true,
				),
				'accessibleControls' => array(
					'doc' => 'Enable accessible controls for screen reader support.',
					'type' => 'boolean',
					'initvalue' => true,
				),
				'accessibleVolumeChange' => array(
					'doc' => 'The step interval for accessible buttons volume change. Values from 0 to 1.',
					'type' => 'number',
					'initvalue' => '0.1'
				),
				'layout' => array(
					'doc' => "The layout of the volume control.",
					'type'=> 'enum',
					'enum' => array('horizontal', 'vertical'),
					'initvalue' => 'horizontal'
				)
			)
		)
	),
	'accessibilityButtons' => array(
		'description' => 'Allow keyboard access to seek forward / backward and current position.',
		'attributes' => array(
			'positionBtn' => array(
				'doc' => 'Adds hidden position button, that communicates current play time.',
				'type' => 'boolean'
			),
			'forwardBtn' => array(
				'doc' => 'Adds a hidden seek forward button.',
				'type' => 'boolean'
			),
			'backwardBtn' => array(
				'doc' => 'Adds a hidden seek backward button.',
				'type' => 'boolean'
			)
		)
	),
	'restrictUserAgent' => array(
		'description' => 'Allows you to block the player to specific user agents. ' .
			'Note this is for player display only. For general purpose access controls, see entry level access controls.',
		'attributes' => array(
			'restrictedUserAgents' => array(
				'doc' => 'Comma separated list of browsers to search for.',
				'type' => 'string',
			),
			'restrictedUserAgentTitle' => array(
				'doc' => 'Error Title.',
				'type' => 'string',
			),
			'restrictedUserAgentMessage' => array(
				'doc' => 'Error Message.',
				'type' => 'string',
			)
		)
	),
	'moderation' => array(
		'description' => 'Allow your users to flag content as inapproriate.',
		'attributes' => array(
			'header' => array(
				'doc' => 'Header text to show above the form.',
				'type' => 'string',
				'initvalue' => "Report this content as inapproriate"
			),
			'text' => array(
				'doc' => 'Long description for the plugin.',
				'type' => 'string',
				'initvalue' => "Please describe your concern about the video so that we can review it and determine whether it is not appropriate for all viewers."
			),
			'tooltip' => array(
				'doc' => 'Button tooltip.',
				'type' => 'string',
				'initvalue' => "Report"
			),
			'reasonSex' => array(
				'doc' => 'Reason Sexual Content.',
				'type' => 'string',
				'initvalue' => 'Sexual Content',
			),
			'reasonViolence' => array(
				'doc' => 'Reason Violent Content.',
				'type' => 'string',
				'initvalue' => 'Violent Or Repulsive',
			),
			'reasonHarmful' => array(
				'doc' => 'Reason Harmful Effects',
				'type' => 'string',
				'initvalue' => 'Harmful Or Dangerous Act'
			),
			'reasonSpam' => array(
				'doc' => 'Reason Spam',
				'type' => 'string',
				'initvalue' => 'Spam / Commercials'
			),
		)
	),
	'infoScreen' => array(
		'description' => 'Add an Information screen about the video.',
		'attributes' => array_merge_recursive($kgDefaultComponentAttr,
			array(
				'order'=>array(
					'initvalue' => '3'
				),
				'minWidth' => array(
					'doc' => 'Minimum width (px) for small view.',
					'type' => 'number',
				),
				'minWidthClass' => array(
					'doc' => 'Class name to apply when in minimum width.',
					'type' => 'string',
				),
				'template' => array(
					'doc' => 'HTML Template for the Information screen.',
					'type' => 'string',
				),
			)
		)
	),
	'titleLabel' => array(
		'description' => 'Enables a title hover overlay over the video content.',
		'attributes' => array(
			'align' => array(
				'doc' => 'Alignment for title text.',
				'initvalue' => 'left',
				'type' => 'enum',
				'enum' => array('left', 'right')
			),
			'text' => array(
				'doc' => 'The text string to be displayed for the title.',
				'type' => 'string',
				'initvalue' => '{mediaProxy.entry.name}',
			),
		)
	),
	'related' => array(
		'description' => 'Add Related videos screen at the end of the video to attract users to watch more videos.',
		'attributes' => array_merge_recursive($kgDefaultComponentAttr,
			array(
				'order'=>array(
					'initvalue' => 4
				),
				'playlistId' => array(
					'doc' => 'Playlist ID that will be used as data source for related items.',
					'type' => 'string'
				),
				'entryList' => array(
					'doc' => 'List of related entries separated by commas.
						 This will only be used if the playlistId is null.',
					'type' => 'string'
				),
				'displayOnPlaybackDone' => array(
					'doc' => 'Display related screen automatically when playback has finished.',
					'type' => 'boolean',
					'initvalue' => true,	
				),
				'autoContinueEnabled' => array(
					'doc' => 'Should the Next Item automatically be played.',
					'type' => 'boolean',
					'initvalue' => true,
				),
				'autoContinueTime' => array(
					'doc' => 'Number of seconds for auto play.',
					'type' => 'number',
					'initvalue' => 5,
				),
				'itemsLimit' => array(
					'doc' => 'Maximum number of items to show on related entries screen.',
					'type' => 'number',
					'initvalue' => 12,
				),
				'templatePath' => array(
					'doc' => 'Template path to be used by the plugin.',
					'type' => 'string'
				),
				'template' => array(
					'doc' => 'HTML Template used by the plugin.',
					'type' => 'string',
				),
			)
		)
	),
);
