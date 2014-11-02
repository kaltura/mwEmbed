<?php
/**
 * The kaltura plugin manifest
 */

$kgDefaultComponentAttr = array(
	'plugin' => array(
		'doc' => 'Should plugin be enabled',
		'initvalue' => true,
		'type' => 'boolean',
	),
	'parent' => array(
		'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
		'type' => 'enum',
		'enum' => array("topBarContainer", "videoHolder", "controlsContainer"),
		'options' => array(
			array(
				'label' => "Top bar container",
				'value' => "topBarContainer"
			),/*
			array(
				'label' => "Video holder",
				'value' => "videoHolder"
			), */
			array(
				'label' => "Controls container",
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
	'order' => array(
		'doc' => 'Draw order of the component within the container.
			Together with alignment, determines component placement of the component. Order is set with respect to siblings on the parent container.',
		'type' => 'number',
	),
);

// list any duplicate attribute sets here:
$kgDefaultCaptionAttr = array(
	'layout' => array(
		'doc' => 'Layout mode for caption, on top of the video or below the video.',
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
		'doc' => 'Should cookies be used to store user language.',
		'type' => 'boolean'
	),
	'fontFamily' => array(
		'doc' => "Top level font familiy for Captions text.",
		'type' => 'enum',
		'initvalue' => 'Arial',
		'enum' => array("Arial", "Arial Narrow", "Arial Black", "Bookman Old Style", "Century Gothic", "Comic Sans MS", "Consolas", "Courier New", "Constantia,Georgia", "Helvetica,Arial", "Impact", "Lucida Sans Unicode", "Cambria", "symbol", "Tahoma", "Cambria", "Times New Roman", "Trebuchet MS", "Verdana,Geneva", "DejaVu Sans", "Webdings,fantasy", "Wingdings,fantasy", "Monotype Corsiva", "Monotype Sorts")
	),
	'fontsize' => array(
		'doc' => "Captions font size.",
		'label' => 'Font size',
		'initvalue' => 12,
		'type' => 'number'
	),
	'fontColor' => array(
		'doc' => "Color of the caption text.",
		'initvalue' => '#000000',
		'type' => 'color'
	),
	'bg' => array(
		'doc' => "Background color for timed text.",
		'label' => 'Background color',
		'initvalue' => '#ffffff',
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
	),
	'defaultLanguageKey' => array(
		'doc' => "The default language key for the player.",
		'type' => 'text'
	),
	'hideWhenEmpty' => array(
		'doc' => 'If the caption button should be hidden when no captions are available for the current entry.',
		'type' => 'boolean'
	)
);
return array(
	'Kaltura.UseAppleAdaptive' => array(
		'doc' => 'If apple HLS streams should be used when available.',
		'type' => 'boolean'
	),
	'Kaltura.LeadHLSOnAndroid' => array(
		'doc' => 'If Apple HLS streams should be used when available on Android devices, 
			by default progressive streams are used on Android because of Android HLS compatibility issues.',
		'type' => 'boolean'
	),
	'autoPlay' => array(
		'doc' => 'If the player should start playback once ready.',
		'type' => 'boolean'
	),
	'autoMute' => array(
		'doc' => 'If set to true, player will start with audio muted. This will be respected across entries and ads, until the user enables volume in the player. Note some VPAID ads do not support auto mute.',
		'type' => 'boolean'
	),
	/*Captions */
	'closedCaptions' => array(
		'description' => 'Reach multi-lingual audience and comply with FCC regulations with Kaltura multi-lingual closed captions support.',
		'attributes' => $kgDefaultCaptionAttr
	),
	'custom1BtnControllerScreen' => array(
		'description' => 'Custom on screen button.',
	),
	'controlBarContainer' => array(
		'description' => 'Control bar container, contains all the player controls.',
		'attributes' => array(
			'hover' => array(
				'doc' => "If the controls should hover on the player, or not.",
				'type' => 'boolean'
			)
		)
	),
	'audioDescription' => array(
		'description' => 'Audio description tracks, supports associating an audio file to be played at the same time as the video.',
		'attributes' => array(
			'file' => array(
				'doc' => "The URL or custom data mapping to URL for the audio description track.",
				'type' => 'string'
			)
		)
	),
	'loadingSpinner' => array(
		'description' => 'Loading spinner options allows you to customize the look of the loading spinner.',
		'attributes' => array(
			'imageUrl' => array(
				'doc' => "An image URL, to use as the loading spinner. By default it is null. If a URL is provided, it will replace the dynamic loading spinner.",
				'type' => 'url',
				'initvalue' => ''
			),
			'lines' => array(
				'doc' => 'The number of lines to draw, 11 by default.',
				'type' => 'number',
				'initvalue'=> 10
			),
			'lineLength' => array(
				'doc' => 'The length of each line, 10 pixels by default.',
				'type' => 'number',
				'initvalue'=> 10
			),
			'width' => array(
				'doc' => 'The line thickness, 6 pixels thick by default.',
				'type' => 'number',
				'initvalue'=> 6
			),
			'radius' => array(
				'doc' => 'The radius of the inner circle, 12 pixels thick by default.',
				'type' => 'number',
				'initvalue'=>  12
			),
			'corners' => array(
				'doc' => 'Corner roundness (0..1), default 1 for fully rounded corners.',
				'type' => 'number',
				'initvalue'=>  1
			),
			'rotate' => array(
				'doc' => 'The rotation offset, 0 by default.',
				'type' => 'number',
				'initvalue'=>  0
			),
			'direction' => array(
				'doc' => '1: clockwise, -1: counterclockwise, clockwise by default.',
				'type' => 'number',
				'allowNegative' => true,
				'initvalue'=> 1
			),
			'color' => array(
				'doc' => 'An array of RGB colors delimited by |, or a single RGB style color string. By default uses the color wheel.',
				'type' => 'string',
				'initvalue'=> 'rgb(0,154,218)|rgb(255,221,79)|rgb(0,168,134)|rgb(233,44,46)|rgb(181,211,52)|rgb(252,237,0)|rgb(0,180,209)|rgb(117,192,68)|rgb(232,44,46)|rgb(250,166,26)|rgb(0,154,218)|rgb(232,44,46)|rgb(255,221,79)|rgb(117,192,68)|rgb(232,44,46)'
			),
			'speed' => array(
				'doc' => 'Rounds per second, default 1.6.',
				'type' => 'float',
				'initvalue'=> 1.6
			),
			'trail' => array(
				'doc' => 'Afterglow percentage. 100 by default.',
				'type' => 'number',
				'initvalue'=> 100
			),
			'shadow' => array(
				'doc' => 'Whether to render a shadow, false by default.',
				'type' => 'boolean',
				'initvalue'=> false
			),
			/* removed option ( always should be true )
			'hwaccel' => array(
				'doc' => 'Whether to use hardware acceleration on loading spinner.',
				'type' => 'boolean'
			),
			*/
			'className' => array(
				'doc' => 'The CSS class to assign to the spinner, default \'spinner\'.',
				'type' => 'hiddenValue',
				'initvalue'=> 'spinner'
			),
			'zIndex' => array(
				'doc' => 'The z-index (defaults to 2000000000).',
				'label' => 'Z-index',
				'type' => 'hiddenValue',
				'initvalue' => 2e9
			),
			'top' => array(
				'doc' => 'Top position relative to parent in px, auto by default.',
				'type' => 'string',
				'initvalue' => 'auto'
			),
			'left' => array(
				'doc' => 'Left position relative to parent in px, auto by default.',
				'type' => 'string',
				'initvalue' => 'auto'
			)
		)
	),
	/** Playlists */

	'carousel' => array(
		'description' => 'Displays an on-screen list of clips in the carousel. When playing the list is hidden, when paused it is displayed',
		'attributes' => array(
			'playlist_id' => array(
				'doc' => "The id of the playlist to be displayed",
				'type' => 'string'
			)
		)
	),
	'playlistAPI' => array(
		'description' => 'The Kaltura playlist plugin, supports associating multiple clips in sequence.',
		'label' => 'Playlist Configuration',
		'attributes' => array(
			'containerPosition' => array(
                'doc' => 'Position of the playlist.',
                'label' => "Position",
                'type' => 'enum',
                'initvalue' => 'right',
                'enum' => array("left", "right", "top", "bottom"),
                'options' => array(
                    array(
                        'label' => "Left of the video",
                        'value' => "left"
                    ),
                    array(
                        'label' => "Right of the video",
                        'value' => "right"
                    ),
                    array(
                        'label' => "Above the video",
                        'value' => "top"
                    ),
                    array(
                        'label' => "Below the video",
                        'value' => "bottom"
                    )
                )
            ),
			'layout' => array(
                'doc' => 'Playlist layout.',
                'type' => 'enum',
                'initvalue' => 'vertical',
                'enum' => array("vertical", "horizontal"),
                'options' => array(
                    array(
                        'label' => "Vertical playlist",
                        'value' => "vertical"
                    ),
                    array(
                        'label' => "Horizontal playlist",
                        'value' => "horizontal"
                    )
                )
            ),
            'includeInLayout' => array(
                'doc' => "Include clip list in the display.",
                'type' => 'boolean',
                'initvalue' => true
            ),
            'showControls' => array(
                'doc' => "Display Next / Previous buttons.",
                'type' => 'boolean',
                'initvalue' => true
            ),
			'autoContinue' => array(
				'doc' => "If the playlist should autocontinue.",
				'type' => 'boolean'
			),
			'autoPlay' => array(
				'doc' => "If the playlist should autoplay on load.",
				'type' => 'boolean'
			),
			'loop' => array(
				'doc' => "If the playlist should loop.",
				'type' => 'boolean'
			),
			'hideClipPoster' => array(
				'doc' => "Hide clip poster when switching to another clip.",
				'type' => 'boolean',
				'initvalue' => true
			),
			'onPage' => array(
				'doc' => "If the playlist should be rendered out of the IFrame (on page).",
				'type' => 'boolean'
			),
			'initItemEntryId' => array(
				'doc' => "The entryId that should be played first."
			),
			'kpl0Url' => array(
				'doc' => 'The playlist URL. (can be a Kaltura playlist service or MRSS)',
				'type' => 'hiddenValue'
			),
			'kpl0Id' => array(
				'doc' => "The kaltura playlist Id",
				'type' => 'hiddenValue'
			),
			'kpl0Name' => array(
				'doc' => "The name of the playlist.",
				'type' => 'hiddenValue'
			),
			'kpl1Url' => array(
				'doc' => 'The N playlist URL.',
				'type' => 'hiddenValue'
			),
			'kpl1Name' => array(
				'doc' => "The name of the indexed playlist.",
				'type' => 'hiddenValue'
			)
		)
	),/*
	'playlistHolder' => array(
		'description' => 'Holds the playlist clip list.',
		'attributes' => array(
			'includeInLayout' => array(
				'doc' => "If the playlist clip list should be displayed.",
				'type' => 'boolean'
			)
		)
	),*/

	'localizationCode' => array(
			'description'=> "Set the language of the Kaltura player user interface. Supports language code or <b>auto</b> to take the browser
		requested language from JavaScript vars.",
			'doc' => 'language code, or "auto" for browser content language preference',
			'type' => 'string',
	),
	'imageDefaultDuration' => array(
		'doc' => 'The duration image entries should be displayed.',
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
		'description' => "Enables users to select the video playback rate. Note http streamerType must be used to support playbackRateSelector in capable HTML5 browsers.",
		'attributes' => array(
			'defaultSpeed' => array(
				'doc' => 'The default speed of the player.',
				'initvalue' => 1,
				'type' => 'number'
			),
			'speeds' => array(
				'doc' => "The set of selectable speeds, where 1 = 100% speed. Seperated by commas.",
				'label' => 'Selectable speeds',
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
				'doc' => 'When the player changes size or goes into fullscreen,
					the source will update per playback resolution. By default, the embed size 
					is only taken into consideration at startup.',
				'type' => 'boolean',
				'initvalue' => false,
			),
			'simpleFormat' => array(
				'doc' => "Use simple format to restrict to two sources only per named size, and not list content type.",
				'type' => 'boolean',
				'initvalue' => true,
			),
			array(
				"doc" => "Preferred flavor bitrate",
				"label" => "Preferred flavor bitrate",
				"type" => "number",
				"initvalue" => 1600,
				"model" => "config.uiVars.mediaProxy.preferedFlavorBR"
			),
		)
	),
	'uiVars' => array(
		'description' => "Allows you to add UI variables to the player configuration.",
		'label' => "UI Variables",
		'attributes' => array(
			'vars' => array(
				'doc' => 'List of UI variables',
				'label' => 'UI variables',
				'type' => 'uivars',
				'model' => 'vars'
			)
		)
	),
	'download' => array(
		'description' => "Enables users to add a download button to the player controls.
			The download button will enable users to download the media to a local file.",
		'attributes' => array_merge($kgDefaultComponentAttr,
			array(
                'flavorID' => array(
                    'label' => 'Flavor ID',
                    'doc' => "Flavor ID for the downloaded movie source. When specified, overrides any preferred bitrate settings",
                    'type' => 'string',
                    'initvalue' => ''
                ),
            ),
			array(
				'preferredBitrate' => array(
					'label' => 'Preferred bitrate',
					'doc' => "Preferred bitrate for the downloaded movie source (when Flavor ID is not specified). Keep empty for the highest bitrate. Enter '0' for the original movie source file",
					'type' => 'string',
					'initvalue' => ''
				),
			)
		)
	),
	'docPlayToFrom' => array(
		'description' => "The playFrom and playTo attributes enable building a preview of a segment of content.",
		'hideEdit' => true
	),
	'mediaProxy.mediaPlayFrom' => array(
		'doc' => 'The start time for the video playback.',
		'type' => 'number'
	),
	'mediaProxy.mediaPlayTo' => array(
		'doc' => 'The time in seconds, for the video playback to end.',
		'type' => 'number'
	),
	'mediaProxy.preferedFlavorBR' => array(
		'doc' => 'The initial bitrate to be selected.',
		'type' => 'number'
	),
	'segmentScrubber.plugin' => array(
		'doc' => 'Virtaulzies the playhead to selected segment of time.',
		'type' => 'boolean'
	),
	'deliveryCode' => array(
		'doc' => 'The deliveryCode is passed along as part of a domain prefix into the stream URL. (can be used for per-embed URL billing categorization)',
		'type' => 'string'
	),
	/** uiConf components */
	'controlsHolder' => array(
		'description' => "The controlsHolder enables you to hide or show the control bar.",
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
				'doc' => "The holder for the playhead scrubber. If set to controlsContainer,
					will be inline with the other control buttons.
					If set to controlsBarContainer,will take a full horizontal line",
				'type' => 'enum',
				'enum' => array("controlsBarContainer", "controlsContainer"),
			),
			'minWidth' => array(
				'doc' => "The minimum width of the playhead. If the min-width is reached, normal responsive display importance removal rules come into effect.",
				'type' => 'number'
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
				'doc' => 'The start time of the segment.',
				'type'=> 'number',
			),
			'timeOut' => array(
				'doc' => 'The end time of the segment.',
				'type'=> 'number',
			)*/
		)
	),
	'logo' => array(
		'description' => "The Kaltura custom logo plugin.",
		'featureCheckbox' => true,
		'attributes' => array(
			'img'=> array(
					'label' => 'Logo image URL',
					'doc' => "URL for custom control bar logo image.",
					'type' => 'url'
			),
			'href' => array(
					'label' => 'Logo link',
					'doc' => "URL for the control bar logo to click through to.",
					'type' => 'url'
			),
			'title' => array(
					'doc' => "Title tooltip for the logo",
					'type' => 'string'
			),
			'cssClass' => array(
					'doc' => "An additional class to add to the logo. Can be used for CSS based custom logo image.",
					'type' => 'hiddenValue'
			)
		)
	),
	/** legay support */
	'mylogo' => array(
		'description' => "The Kaltura custom logo plugin.",
		'attributes' => array(
			'watermarkPath' => array(
				'doc' => "URL path to plugin image.",
				'type' => 'url'
			),
			'watermarkClickPath' => array(
				'doc' => "URL for plugin click.",
				'type' => 'url'
			)
		)
	),
'theme' => array(
		'description' => 'Theme CSS style.',
		'featureCheckbox' => true,
		'label' => 'Custom styles',
		'attributes' => array(
			'buttonsSize' => array(
				'label' => 'Button\'s size',
				'doc' => 'Button\'s size.',
				'type' => 'number',
				'player-refresh' => 'theme.buttonsSize',
				"initvalue" => 12,
				"from" => 2,
				"to" => 100,
				"stepsize" => 1,
				"numberOfDecimals" => 0
			),
			'buttonsColor' => array(
				'label' => 'Button\'s color',
				"initvalue" => "#000000",
				'player-refresh' => 'theme.buttonsColor',
				'doc' => 'Button\'s color',
				'type' => 'color'
			),
			'buttonsIconColor' => array(
				'label' => 'Button\'s icon color',
				"initvalue" => "#ffffff",
				'player-refresh' => 'theme.buttonsIconColor',
				'doc' => 'Button\'s icon color',
				'type' => 'color'
			),
			'sliderColor' => array(
				'label' => 'Slider color',
				"initvalue" => "#333333",
				'player-refresh' => 'theme.sliderColor',
				'doc' => 'Slider color',
				'type' => 'color'
			),
			'scrubberColor' => array(
				'label' => 'Scrubber color',
				"initvalue" => "#ffffff",
				'player-refresh' => 'theme.scrubberColor',
				'doc' => 'Scrubber color',
				'type' => 'color'
			),
			'controlsBkgColor' => array(
				'label' => 'Controls bar color',
				"initvalue" => "#000000",
				'player-refresh' => 'theme.controlsBkgColor',
				'doc' => 'Controls bar color',
				'type' => 'color'
			),
			'watchedSliderColor' => array(
				'label' => 'Slider watched color',
				"initvalue" => "#2ec7e1",
				'player-refresh' => 'theme.watchedSliderColor',
				'doc' => 'Slider watched color',
				'type' => 'color'
			),
			'bufferedSliderColor' => array(
				'label' => 'Slider buffer color',
				"initvalue" => "#AFAFAF",
				'player-refresh' => 'theme.bufferedSliderColor',
				'doc' => 'Slider buffer color',
				'type' => 'color'
			),
			'buttonsIconColorDropShadow' => array(
				'label' => 'Apply drop shadow to icons',
				"initvalue" => true,
				'player-refresh' => 'theme.buttonsIconColorDropShadow',
				'doc' => 'Apply drop shadow to icons',
				'type' => 'boolean'
			),
			'dropShadowColor' => array(
				'label' => 'Drop shadow color',
				'doc' => 'Drop shadow color',
				'type' => 'hiddenValue'
			)
		)
	),
	'share' => array(
		'featureCheckbox' => true,
		'description' => 'Add the share interface to the player.',
		'type' => 'featuremenu',
		'label' => 'Share',
		'model' => 'config.plugins.share',
		'attributes' => array_merge($kgDefaultComponentAttr,
			array(
				'socialShareURL' => array(
					'doc' => "<p style='text-align: left'>Allows you to define the URL shared for this player:</p>
						<ul style='text-align: left'>
							<li><b>smart</b> will maximize inline social sharing playback, by using the
								page URL or Kaltura URL, and depend on whether opengraph tags are present on the page</li>
							<li><b>parent</b> will share the parent page URL.</li>
							<li><b>http://my-custom-domain.com/?v={mediaProxy.entry.id}</b> a custom URL with magic substitution can also be used.</li>
						</ul>",
					'type' => 'string',
					'initvalue' => 'smart'
				),
				'socialNetworks' => array(
					'doc' => "Define included networks, separate by commas. Currently share supports facebook, twitter, googleplus.",
					'type' => 'string',
					'initvalue' => 'facebook,twitter,googleplus'
				),
			)
		)
	),
	'watermark' => array(
		'featureCheckbox' => true, // *NEW* - actually enabled even if undefined but can be disabled via this property
		'description' => "The kaltura watermark plugin", // used for tooltip
		'type' => 'featuremenu', // *NEW* = renders as featuremenu also if undefined, but can be turned into submenu via this
		'label' => 'Watermark', // *NEW*
		'model' => 'config.plugins.watermark', //*NEW*
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
				'doc' => "The URL path to the watermark image.",
				'initvalue' => 'http://www.kaltura.com/content/uiconf/kaltura/kmc/appstudio/kdp3/exampleWatermark.png',
				'type' => 'url' //URL input validation still not implemented but very easy in anuglar - renders as text.
			),
			'watermarkClickPath' => array(
				'label' => 'Click URL', // *NEW*
				'model' => 'config.plugins.watermark.href',
				'doc' => "The URL for the watermark click.",
				'initvalue' => 'http://www.kaltura.com/',
				'type' => 'url'
			),
			'padding' => array(
				'label' => 'Padding CSS', // *NEW*
				'doc' => 'Padding CSS property from the edge of the play screen; top right bottom left, or single value.',
				'type' => 'number',
				"initvalue" => 10, // *NEW* all of these have defaults if undefined.
				"from" => 0, // *NEW*
				"to" => 100, // *NEW*
				"stepsize" => 1, // *NEW*
				"numberOfDecimals" => 0 // *NEW*
			)
		)
	),

    'nextPrevBtn' => array(
        'featureCheckbox' => true, // *NEW* - actually enabled even if undefined but can be disabled via this property
        'description' => "Playlist 'Next' and 'Previous' buttons", // used for tooltip
        'type' => 'featuremenu', // *NEW* = renders as featuremenu also if undefined, but can be turned into submenu via this
        'label' => 'Playlist controls', // *NEW*
        'model' => 'config.plugins.nextPrevBtn', //*NEW*
        'attributes' => array(
			'parent' => array(
				'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
				'type' => 'enum',
				'enum' => array("topBarContainer", "videoHolder", "controlsContainer"),
				'options' => array(
					array(
						'label' => "Top bar container",
						'value' => "topBarContainer"
					),
					array(
						'label' => "Controls container",
						'value' => "controlsContainer"
					)
				),
				'initvalue' => "controlsContainer"
			)
        )
    ),
	/** statistics has global flashvar based configuration:  **/
	'statistics' => array(
		'description' => 'Use Kaltura statistics to
		<a target="_new" href="http://knowledge.kaltura.com/creating-and-tracking-analytics-kmc-0">track analytics for the Kaltura player.</a>
		Statistics are enabled by default.',
		'attributes' => array(
			'trackEventMonitor' => array(
				'doc' => "Use to audit Kaltura events with a named callback function.",
				'type' => 'string'
			)
		)
	),
	// top level properties:
	'playbackContext' => array(
		'doc' => "The playback context sent to Kaltura analytics."
	),
	'originFeature' => array(
		'doc' => "The featureType var sent to Kaltura analytics."
	),
	'applicationName' => array(
		'doc' => "For registering the application with Kaltura analytics.",
	),
	'userId' => array(
		'doc' => "For associating a userId with Kaltura analytics."
	),

	/* external resources example plugin stub */
	'myExternalResourcesPlugin' => array(
		'description' => "The external resources attributes can be applied to a custom plugin by any name. All number keys can be incremneted to load more resources. i.e onPageJs1 onPageJs2 onPageJs3 etc.",
		"attributes" => array(
			'onPageJs1' => array(
				'doc' => "An onPage javascript file is loaded on the client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins</a>",
				'type' => 'url',
			),
			'onPageCss1' => array(
				'doc' => "An onPage CSS file is loaded on the client page. More about <a href=\"http://html5video.org/wiki/Kaltura_OnPage_Plugins\">onPage plugins</a>",
				'type' => 'url'
			),
			'iframeHTML5Js1' => array(
				'doc' => "Javascript to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">html5 iframe plugins</a>",
				'type' => 'url'
			),
			'iframeHTML5Css' => array(
				'doc' => "CSS to be loaded inside the iframe. More about <a href=\"http://html5video.org/wiki/Developing_Kaltura_HTML5_Plugins\">html5 iframe plugins</a>",
				'type' => 'url'
			)
		)
	),
	'userAgentPlayerRules' => array(
		'description' => "Sets player default by user agent rules.",
		'attributes' => array(
			'disableForceMobileHTML5' => array(
				'doc' => "Disable the forceMobileHTML5 URL flag. This prevents showing the HTML5 player via the URL flag.",
				'type' => 'boolean',
			),
			'r1RegMatch' => array(
				'doc' => "First rule, RegMatch postfix means the rule is a regular expression.",
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
				'doc' => "Third rule, Match postfix means the rule is a simple string search.",
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
				'doc' => "Fourth action, LeadWithHTML5 means lead with HTML5 for fourth rule match "
			)
		)
	),


	'IframeCustomPluginJs1' => array(
		'doc' => 'URL for the javascript to be loaded in the iframe.',
		'type' => 'url'
	),
	'IframeCustomPluginCss1' => array(
		'doc' => 'URL for the CSS to be loaded in the iframe.',
		'type' => 'url'
	),
	"onPageJs1" => array(
		'doc' => 'URL for the javascript to be loaded on the embedding page.',
		'type' => 'url'
	),
	"onPageCss1" => array(
		'doc' => 'URL for CSS to be loaded on the embedding page.',
		'type' => 'url'
	),
	'enableControlsDuringAd' => array(
		'doc' => 'If true, play pause button will be active during ad playback',
		'type' => 'boolean'
	),
	'adsOnReplay' => array(
		'doc' => 'true for showing ads in replay, false to skip ads in replay.',
		'type' => 'boolean'
	),
	'bumper' => array(
		'description' => "Bumpers, enables a Kaltura entry to be displayed before or after the content.",
		"attributes" => array(
			'bumperEntryID' => array(
				'doc' => 'The entry id of the bumper to be played',
				"type" => "entrySelector",
				'configObject' => "entriesSelectBox",
				'model' => 'config.plugins.bumper.bumperEntryID',
				"helpnote" => "Bumper entry ID",
				'filter' => "entry",
				'initvalue' => ''
			),
			'clickurl' => array(
				'doc' => "The URL to open when the user clicks the bumper video.",
				'label' => 'Click URL',
				'type' => "url"
			),
			'preSequence' => array(
				'doc' => "The preSequence number for sequencing the bumper before or after ads before content. Also can be set to zero and set postSequence to 1, to have the bumper play after the content",
				'label' => 'Pre-sequence index',
				'initvalue' => 1,
				'type' => 'number'
			),
			'postSequence' => array(
				'doc' => "The postSequence number for sequencing the bumper before or after ads after content. Also can be set to zero and set preSequence to 1, to have the bumper play before the content",
				'label' => 'Post-sequence index',
				'initvalue' => 1,
				'type' => 'number'
			)
		)
	),
	'vast' => array(
		'label' => 'Vast',
		"endline" => "true", // *NEW* - demonstrates possible formatting decorator
		'type' => 'menu', // *NEW* - demonstrates submenu
		'sections' => array( // *NEW* - demonstrates separtating to sections
			'type' => 'tabs',
			'tabset' => array(
				array('label' => 'Preroll', 'active' => true, 'key' => 'pre', 'children' => array()),
				array('label' => 'Overlay', 'key' => 'over', 'children' => array()),
				array('label' => 'Postroll', 'key' => 'post', 'children' => array()),
				array('label' => 'Comp.', 'key' => 'comp', 'children' => array())),
			'title' => 'Configuration'
		),
		'description' => "Kaltura player features robust VAST support for prerolls, midrolls, overlays, companions and postrolls",
		"attributes" => array(
			'prerollUrl' => array(
				'doc' => "The VAST ad tag XML URL.",
				'label' => 'Preroll URL', // *NEW* - all controls require label, if is it not there I use the control model camelCase converted to separated words with ucfirst
				'type' => 'url',
				'section' => 'pre'
			),
			'prerollUrlJs' => array(
				'doc' => "The VAST ad tag URL used where platform does not support flash. If undefined all platforms will use the base prerollUrl for ad requests.",
				'label' => 'Preroll JS URL',
				'type' => 'url',
				'section' => 'pre'
			),
			'numPreroll' => array(
				'label' => 'Preroll(s) amount', // *NEW*
				'doc' => 'The number of prerolls to be played.',
				'type' => 'number',
				'section' => 'pre',
				'min' => 0, // *NEW*
				'initvalue' => 1,
				'max' => 5, // *NEW*
			),
			'skipBtn' => array(
				'doc' => "Skip button label.",
				'label' => 'Skip button label', // *NEW* - all controls require label, if is it not there I use the control model camelCase converted to separated words with ucfirst
				'initvalue' => "Skip Ad",
				'model' => 'config.plugins.skipBtn.label',
				'type' => 'string'
			),
			'skipOffset' => array(
				'doc' => 'The time in seconds, before the skip ad link is active.',
				'type' => 'number', // this was a string - dosen't seem logical
				'min' => 0, // *NEW*
				'initvalue' => 5,
				'max' => 30, // *NEW*
			),
			'prerollStartWith' => array(
				'label' => 'Number of prerolls to start with.', // *NEW*
				'doc' => 'Number of prerolls to start with.',
				'type' => 'number', // *NEW*
				'section' => 'pre',
				'min' => 0, // *NEW*
				'initvalue' => 0,
				'max' => 5, // *NEW*
			),
			'prerollInterval' => array(
				'label' => 'Preroll interval.', // *NEW*
				'doc' => "How often to show prerolls",
				'type' => 'number',
				'section' => 'pre',
				'min' => 0, // *NEW*
				'initvalue' => 0,
				'max' => 5, // *NEW*
			),
			'preSequence' => array(
				'label' => 'VAST pre-sequence index', // *NEW*
				'doc' => "The VAST preSequence index. For example,1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
				'type' => 'number',
				'section' => 'pre',
				'min' => 0, // *NEW*
				'max' => 5, // *NEW*
				'initvalue' => 0
			),

			'postrollUrl' => array(
				'label' => 'Postroll URL', // *NEW*
				'doc' => "The vast ad tag xml url",
				'type' => 'url',
				'section' => 'post',
			),
			'postrollUrlJs' => array(
				'doc' => "The VAST ad tag URL used where platform does not support flash.
			If undefined all platforms will use the base postrollUrl for ad requests.",
				'label' => 'Preroll JS URL',
				'type' => 'url',
				'section' => 'post',
			),
			'numPostroll' => array(
				'label' => 'Postroll(s) amount',
				'doc' => 'The number of prerolls to be played.',
				'type' => 'number',
				'section' => 'post',
				'min' => 0, // *NEW*
				'initvalue' => 1,
				'max' => 5, // *NEW*
			),
			'postrollStartWith' => array(
				'doc' => 'Number of postrolls to start with.',
				'label' => 'Number of postrolls to start with',
				'type' => 'number',
				'section' => 'post',
				'min' => 0, // *NEW*
				'initvalue' => 0, // *NEW*
				'max' => 5, // *NEW*
			),
			'postrollInterval' => array(
				'doc' => "How often to show postrolls.",
				'type' => 'number',
				'section' => 'post',
				'min' => 0, // *NEW*
				'initvalue' => 0, // *NEW*
				'max' => 5, // *NEW*
			),
			'postSequence' => array(
				'label' => 'VAST post-sequence index',
				'doc' => "The VAST post-Sequence index. For example, 1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
				'type' => 'number',
				'section' => 'post',
				'min' => 0, // *NEW*
				'initvalue' => 0, // *NEW*
				'max' => 5
			),
			'htmlCompanions' => array(
				'label' => 'HTML Companions', // *NEW*
				'doc' => "Companions list. For each companion please specify the ad container div id and the expected ad width and height.",
				'type' => 'companions',
				'section' => 'comp',
				'filter' => 'companions',
				"initvalue" => "Comp_300x250:300:250;Comp_728x90:728:90;",
			),
			'overlayUrl' => array(
				'label' => 'Overlay URL', // *NEW*
				'section' => 'over',
				'doc' => "The VAST XML file that contains the overlay media and tracking info.",
				'type' => 'url'
			),
			'overlayStartAt' => array(
				'label' => 'Overlay start time.',
				'doc' => "Start time (in seconds) for overlay.",
				'type' => 'number',
				'section' => 'over',
				'min' => 0, // *NEW*
				'initvalue' => 5, // *NEW*
				'max' => 10000, // *NEW*
			),
			'overlayInterval' => array(
				'doc' => "How often should the overlay be displayed.",
				'type' => 'number',
				'section' => 'over',
				'from' => 0, // *NEW*
				'stepsize' => 1, // *NEW*
				'to' => 500, // *NEW*
				'initvalue' => 300, // *NEW*
			),
			'timeout' => array(
				'doc' => "The timeout in seconds, for displaying an overlay VAST ad. If the VAST XML specifies the minSuggestedDuration attribute, this property will be ignored.",
				'type' => 'number',
				'section' => 'over',
				'min' => 0, // *NEW*
				'initvalue' => 5, // *NEW*
				'max' => 1000, // *NEW*
			),
			'trackCuePoints' => array(
				'doc' => "If entry cuepoints should be tracked for midroll ad requests.",
				'type' => 'boolean'
			),
			'allowSeekWithNativeControls' => array(
				'doc' => "It allows to catch seek requests during ads and return the player to original play time..",
				'type' => 'boolean'
			),
			'storeSession' => array(
				'doc' => 'If the frequency playback should be stored across player reloads.
					By default, only playlists respect frequency intervals.
					If set to true, the prerollInterval will be respected across player views.',
				'type' => 'boolean',
				'initvalue' => false,
			)
		)
	),
	'keyboardShortcuts' => array(
		'description' => 'The keyboard shortcuts plugins allows you to control the player using keyboard shortcuts. ' .
			'More about JavaScript <a target="_new" href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Constants_for_keyCode_value">key mappings</a>',
		'attributes' => array(
			'volumePercentChange' => array(
				'doc' => 'Volume change percent, from 0 to 1.',
				'type' => 'float',
				'initvalue' => '0.1'
			),
			'shortSeekTime' => array(
				'doc' => 'Short seek time in seconds.',
				'type' => 'number',
				'initvalue' => '5'
			),
			'longSeekTime' => array(
				'doc' => 'Long seek time in seconds.',
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
				'doc' => 'Playback toggle Key.',
				'type' => 'number',
				'initvalue' => '32'
			),
			'shortSeekBackKey' => array(
				'doc' => 'Short Seek back key.',
				'type' => 'number',
				'initvalue' => '37'
			),
			'shortSeekForwardKey' => array(
				'doc' => 'Short Seek long key.',
				'type' => 'number',
				'initvalue' => '39'
			),
			'openFullscreenKey' => array(
				'doc' => 'Open Full Screen Key.',
				'type' => 'number',
				'initvalue' => '70'
			),
			'closeFullscreenkey' => array(
				'doc' => 'Close Full Screen Key. Browsers by default supports escape key, independent of keyboard mapping.',
				'type' => 'number',
				'initvalue' => '27'
			),
			'gotoBeginingKey' => array(
				'doc' => 'Go to the beginning of the video.',
				'type' => 'number',
				'initvalue' => '36'
			),
			'gotoEndKey' => array(
				'doc' => 'Go to the end of the video.',
				'type' => 'number',
				'initvalue' => '35'
			),
			'longSeekForwardKey' => array(
				'doc' => 'Long Seek long key.',
				'type' => 'string',
				'initvalue' => 'ctrl+39'
			),
			'longSeekBackKey' => array(
				'doc' => 'Long Seek back key.',
				'type' => 'string',
				'initvalue' => 'ctrl+37'
			),
			'percentageSeekKeys' => array(
				'doc' => 'Comma seperated keys for percentage seek.',
				'type' => 'string',
				'initvalue' => "49,50,51,52,53,54,55,56,57",
			)
		)
	),
	'volumeControl' => array(
		'description' => 'The volume control plugin allows you to control the player volume using mute/unmute buttons and a volume slider.',
		'attributes' => array(
			'showSlider' => array(
				'doc' => 'Show the volume slider.',
				'type' => 'boolean',
				'initvalue' => true
			),
			'pinVolumeBar' => array(
				'doc' => 'If the volume slider bar should always be shown.',
				'type' => 'boolean',
				'initvalue' => false
			),
			'accessibleControls' => array(
				'doc' => 'Accessible buttons volume change percent from 0 to 1: The amount of volume that will be added or reduced when using the accessible volume buttons.',
				'type' => 'boolean',
				'initvalue' => false
			),
			'accessibleVolumeChange' => array(
				'doc' => 'Accessible buttons volume change percent from 0 to 1.',
				'type' => 'float',
				'initvalue' => 0.1
			)
		)
	),
	'accessibilityButtons' => array(
		'description' => 'The accessibility buttons allow keyboard access to seek forward/backward and current position.',
		'attributes' => array(
			'positionBtn' => array(
				'doc' => 'Support position button.',
				'type' => 'boolean'
			),
			'forwardBtn' => array(
				'doc' => 'Support seek forward button.',
				'type' => 'boolean'
			),
			'backwardBtn' => array(
				'doc' => 'Support seek backward button.',
				'type' => 'boolean'
			)
		)
	),
	'restrictUserAgent' => array(
		'description' => 'Allows you to block the player to specific user agents.',
		'attributes' => array(
			'restrictedUserAgents' => array(
				'doc' => 'Comma seperated list of browsers to search for.',
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
			),
			'text' => array(
				'doc' => 'Long description for the plugin.',
				'type' => 'string',
			),
			'tooltip' => array(
				'doc' => 'Button tooltip.',
				'type' => 'string',
			),
			'reasonSex' => array(
				'label' => 'Reason: Sexual Content',
				'doc' => 'Reason: Sexual Content.',
				'type' => 'string',
			),
			'reasonViolence' => array(
				'label' => 'Reason: Violent Content',
				'doc' => 'Reason: Violent Content.',
				'type' => 'string',
			),
			'reasonHarmful' => array(
				'label' => 'Reason: Harmful Content',
				'doc' => 'Reason: Harmful Content.',
				'type' => 'string',
			),
			'reasonSpam' => array(
				'label' => 'Reason: Spam',
				'doc' => 'Reason: Spam.',
				'type' => 'string',
			),
		)
	),
	'infoScreen' => array(
		'description' => 'Add Information screen about the video.',
		'attributes' => array_merge($kgDefaultComponentAttr,
			array(
				'template' => array(
					'doc' => 'HTML Template for the info screen.',
					'type' => 'hiddenValue',
				),
			)
		)
	),
	'titleLabel' => array(
		'description' => 'Enables a title hover overlay over the video content.',
		'attributes' => array(
			'align' => array(
				'doc' => 'Alignment for title text.',
				'type' => 'enum',
				'enum' => array('left', 'right'),
				'initvalue' => 'left',
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
			'text' => array(
				'doc' => 'The text string to be displayed for the title.',
				'initvalue' => '{mediaProxy.entry.name}',
				'type' => 'string',
				'initValue' => '{mediaProxy.entry.name}',
			),
		)
	),
	'airPlay' => array(
		'description' => 'Enables wireless streaming of audio, video, and photos, together with related metadata between devices, for iOS.',
		'type' => 'featuremenu',
		'label' => 'airPlay',
		'model' => 'config.plugins.airPlay',
	),
	'nativeCallout' => array(
		'description' => 'Supports replacing the player "play button" with a callout to native player, for Mobile Devices.',
		'type' => 'featuremenu',
		'label' => 'nativeCallout',
		'model' => 'config.plugins.nativeCallout',
	),
	'related' => array(
		'description' => 'Add the Related Videos screen at the end of the video to attract users to watch additional videos.',
		'attributes' => array_merge($kgDefaultComponentAttr,
			array(
				'playlistId' => array(
					'doc' => 'Playlist Id that will be used as the data source for related items.',
					'configObject' => "playlistSelectBox",
					'initvalue' => '',
					'filter' => "entry",
					'type' => 'entrySelector'
				),
				'entryList' => array(
					'label' => 'Entry IDs list',
					'doc' => 'Allows runtime injection of list of related entries seperated by commas.
						 This will only be used if the playlistId is null.',
					'type' => 'string'
				),
				'displayOnPlaybackDone' => array(
					'doc' => 'Display related screen automatically when playback has finished',
					'type' => 'boolean',
					'initvalue' => true,
				),
				'autoContinueEnabled' => array(
					'doc' => 'Should the Next Item be automatically played.',
					'type' => 'boolean'
				),
				'autoContinueTime' => array(
					'doc' => 'Number of seconds for auto play.',
					'type' => 'number'
				),
				'clickUrl' => array(
					'doc' => "<p style='text-align: left'>Defines the URL for a related item click</p>
								If this left blank the click will replace the current video with a new one.
								example: <b>http://mydomain.com/?videoId={related.selectedEntry.id}</b> as a custom
								URL with the entry id as postfix",
					'type' => 'string'
				),
				'itemsLimit' => array(
					'doc' => 'Maximum number of items to show on the related screen.',
					'type' => 'number'
				),
				'storeSession'=> array(
					'doc' => "Store the played entries across page views in related clips display",
					'type' => 'boolean'
				)
				/*
				// hide template path for now, no way for user to provide useful value here.
				'templatePath' => array(
					'doc' => 'Template path to be used by the plugin.',
					'type' => 'string'
				),
				'template' => array(
					'doc' => 'HTML Template used by the plugin.',
					'type' => 'string',
				),*/
			)
		)
	),
);
