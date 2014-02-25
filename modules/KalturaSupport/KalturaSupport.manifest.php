<?php
/**
 * The kaltura plugin manifest
 */

$kgDefaultComponentAttr = array(
    'parent' => array(
        'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
        'type' => 'enum',
        'enum' => array("topBarContainer", "videoHolder", "controlsContainer")
    ),
    'order' => array(
        'doc' => 'Draw order of the component within the container.
			Together with alignment, determines component placement of the component. Order is set with respect to siblings on the parent container.',
        'type' => 'number.',
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
        'label' => 'Fone size',
        'initvalue' => 12,
        'type' => 'number'
    ),
    'defaultLanguageKey' => array(
        'doc' => "The default language key for the player.",
        'type' => 'language'
    ),
    'bg' => array(
        'doc' => "Background color for timed text.",
        'label' => 'Background color',
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
    'loadingSpinner' => array(
        'description' => 'Loading spinner options allows you to customize the look of the loading spinner.',
        'attributes' => array(
            'imageUrl' => array(
                'doc' => "An image URL, to use as the loading spinner. By default it is null. If a URL is provided, it will replace the dynamic loading spinner.",
                'type' => 'url'
            ),
            'lines' => array(
                'doc' => 'The number of lines to draw, 11 by default.',
                'type' => 'number'
            ),
            'lineLength' => array(
                'doc' => 'The length of each line, 10 pixels by default.',
                'type' => 'number'
            ),
            'width' => array(
                'doc' => 'The line thickness, 6 pixels thick by default.',
                'type' => 'number'
            ),
            'radius' => array(
                'doc' => 'The radius of the inner circle, 12 pixels thick by default.',
                'type' => 'number'
            ),
            'corners' => array(
                'doc' => 'Corner roundness (0..1), default 1 for fully rounded corners.',
                'type' => 'number'
            ),
            'rotate' => array(
                'doc' => 'The rotation offset, 0 by default.',
                'type' => 'number'
            ),
            'direction' => array(
                'doc' => '1: clockwise, -1: counterclockwise, clockwise by default.',
                'type' => 'number'
            ),
            'color' => array(
                'doc' => 'An array of RGB colors delimited by |, or a single RGB style color string. By default uses the color wheel.',
                'type' => 'string'
            ),
            'speed' => array(
                'doc' => 'Rounds per second, default 1.6.',
                'type' => 'float'
            ),
            'trail' => array(
                'doc' => 'Afterglow percentage. 100 by default.',
                'type' => 'number'
            ),
            'shadow' => array(
                'doc' => 'Whether to render a shadow, false by default.',
                'type' => 'boolean'
            ),
            'hwaccel' => array(
                'doc' => 'Whether to use hardware acceleration on loading spinner.',
                'type' => 'boolean'
            ),
            'className' => array(
                'doc' => 'The CSS class to assign to the spinner, default \'spinner\'.',
                'type' => 'string'
            ),
            'zIndex' => array(
                'doc' => 'The z-index (defaults to 2000000000).',
                'type' => 'string'
            ),
            'top' => array(
                'doc' => 'Top position relative to parent in px, default auto.',
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
                'doc' => "If the playlist should autocontinue.",
                'type' => 'boolean'
            ),
            'autoPlay' => array(
                'doc' => "If the playlist should autoplay on load.",
                'type' => 'boolean'
            ),
            'initItemEntryId' => array(
                'doc' => "The entryId that should be played first."
            ),
            'kpl0Url' => array(
                'doc' => 'The playlist URL. (can be a Kaltura playlist service or MRSS)',
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
        'description' => "Enables users to select the video playback rate.",
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
            ),
            'simpleFormat' => array(
                'doc' => "Use simple format to restrict to two sources only per named size, and not list content type.",
                'type' => 'boolean',
            )
        )
    ),
    'docPlayToFrom' => array(
        'description' => "The playFrom and playTo attributes enable building a preview of a segment of content.",
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
        'doc' => 'The initial bitrate to be selected.',
        'type' => 'number'
    ),
    'deliveryCode' => array(
        'doc' => 'The deliveryCode is passed along as part of a domain prefix into the stream URL. (can be used for per-embed URL billing categorization)',
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
            )
        )
    ),
    'share' => array(
        'featureCheckbox' => true,
        'description' => 'Add the share interface to the player.',
        'type' => 'featuremenu',
        'label' => 'Share',
        'model' => 'config.plugins.share',
        'attributes' => array(
            'parent' => array(
                'doc' => 'Parent container for component. Components include default placement, leave as null if unsure.',
                'model' => "config.plugins.share.parent",
                'type' => 'enum',
                'enum' => array("topBarContainer", "videoHolder", "controlsContainer"),
                'options' => array(
                    array(
                        'label' => "Top bar container",
                        'value' => "topBarContainer"
                    ),
                    array(
                        'label' => "Video holder",
                        'value' => "videoHolder"
                    ), array(
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
            'socialShareURL' => array(
                'doc' => "Allows you to define the URL shared for this player.
					<ul>
						<li><b>Smart</b> will maximize inline social sharing playback, by using the
							page URL or Kaltura URL, and depend on whether opengraph tags are present</li>
						<li><b>Parent</b> will share the parent page URL.</li>
						<li><b>http://my-custom-domain.com/?v={mediaProxy.entry.id}</b> a custom URL with magic substitution can also be used.</li>
					</ul>",
                'type' => 'string'
            ),
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

    /** statistics has global flashvar based configuration:  **/
    'statistics' => array(
        'description' => 'Kaltura analytics enables
		<a target="_new" href="http://knowledge.kaltura.com/creating-and-tracking-analytics-kmc-0">tracking Kaltura players.</a>
		Statistics are enabled by default. Configuration consists of enabling the statistics plugin: ',
        'attributes' => array(
            'trackEventMonitor' => array(
                'doc' => "Enables you to audit Kaltura events with a named callback function.",
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

    'adsOnReplay' => array(
        'doc' => 'True for showing ads in replay, Fa;se to skip ads in replay.',
        'type' => 'boolean'
    ),
    'bumper' => array(
        'description' => "Bumpers, enables a Kaltura entry to be displayed before or after the content.",
        "attributes" => array(
            'bumperEntryID' => array(
                'doc' => 'The entry id of the bumper to be played',
                'type' => 'string'
            ),
            'clickurl' => array(
                'doc' => "The URL to open when the user clicks the bumper video.",
                'label' => 'Click URL',
                'type' => "url"
            ),
            'preSequence' => array(
                'doc' => "The preSequence number for sequencing the bumper before or after ads before content. Also can be set to zero and set postSequence to 1, to have the bumper play after the content",
                'label' => 'Number of pre-sequences',
                'initvalue' => 1,
                'type' => 'number'
            ),
            'postSequence' => array(
                'doc' => "The postSequence number for sequencing the bumper before or after ads after content. Also can be set to zero and set preSequence to 1, to have the bumper play before the content",
                'label' => 'Number of post-sequences',
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
                array('title' => 'Pre Roll', 'active' => true, 'key' => 'pre')
            , array('title' => 'Post Roll', 'key' => 'post')),
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
            'numPreroll' => array(
                'label' => 'Preroll(s) amount', // *NEW*
                'doc' => 'The number of prerolls to be played.',
                'type' => 'number',
                'section' => 'pre',
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
                'to' => 5, // *NEW*
            ),
            'skipBtn' => array(
                'doc' => "Skip button label.",
                'label' => 'Skip button label', // *NEW* - all controls require label, if is it not there I use the control model camelCase converted to separated words with ucfirst
                'model' => 'config.plugins.skipBtn.label',
                'initvalue' => "Skip Ad",
                'type' => 'string'
            ),
            'storeSession' => array(
                'doc' => 'If the frequency playback should be stored across player reloads.
					By default, only playlists respect frequency intervals. 
					If set to true, the prerollInterval will be respected across player views.',
                'type' => 'boolean',
                'initvalue' => false,
            ),
            'prerollStartWith' => array(
                'label' => 'Number of prerolls to start with.', // *NEW*
                'doc' => 'Number of prerolls to start with.',
                'type' => 'number', // *NEW*
                'section' => 'pre',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'initvalue' => 0,
                'to' => 5, // *NEW*
            ),
            'prerollInterval' => array(
                'label' => 'Preroll interval.', // *NEW*
                'doc' => "How often to show prerolls",
                'type' => 'number',
                'section' => 'pre',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'initvalue' => 0,
                'to' => 5, // *NEW*
            ),
            'preSequence' => array(
                'label' => 'VAST pre-sequence index', // *NEW*
                'doc' => "The VAST preSequence index. For example,1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
                'type' => 'number',
                'section' => 'pre',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 5, // *NEW*
                'initvalue' => 0,
                "endline" => "true", // *NEW* - demonstrates possible formatting decorator
            ),

            'postrollUrl' => array(
                'label' => 'Postroll URL', // *NEW*
                'doc' => "The vast ad tag xml url",
                'type' => 'url'
            ),
            'numPostroll' => array(
                'label' => 'Postroll(s) amount',
                'doc' => 'The number of prerolls to be played.',
                'type' => 'number',
                'section' => 'post',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'initvalue' => 1,
                'to' => 5, // *NEW*
            ),
            'postrollStartWith' => array(
                'doc' => 'Number of postrolls to start with.',
                'label' => 'Number of postrolls to start with.',
                'type' => 'number',
                'section' => 'post',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 5, // *NEW*
            ),
            'postrollInterval' => array(
                'doc' => "How often to show postrolls.",
                'type' => 'number',
                'section' => 'post',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 5, // *NEW*
            ),
            'postSequence' => array(
                'label' => 'VAST post-sequence index',
                'doc' => "The VAST post-Sequence index. For example, 1 for ads then 2 for a bumper plugin; would result in ad then bumper.",
                'type' => 'number',
                'section' => 'post',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 5, // *NEW*
                "endline" => "true", // *NEW* - demonstrates possible formatting decorator
            ),
            'htmlCompanions' => array(
                'label' => 'HTML Companions', // *NEW*
                'doc' => "Companion list format, seperated by ;, {companionDomId}:{width}:{height};{companionDomId2}:{width2}:{height2}.",
                'initvalue' => "Companion_300x250:300:250;Companion_728x90:728:90;",
                'type' => 'multiinput'
            ),
            'overlayStartAt' => array(
                'label' => 'Overlay start time.',
                'doc' => "Start time (in seconds) for overlay.",
                'type' => 'number',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 10000, // *NEW*
            ),
            'overlayInterval' => array(
                'doc' => "How often should the overlay be displayed.",
                'type' => 'number',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 5, // *NEW*
            ),
            'overlayUrl' => array(
                'label' => 'Overlay URL', // *NEW*
                'doc' => "The VAST XML file that contains the overlay media and tracking info.",
                'type' => 'url'
            ),
            'timeout' => array(
                'doc' => "The timeout in seconds, for loading an ad from a VAST ad server.",
                'type' => 'number',
                'from' => 0, // *NEW*
                'stepsize' => 1, // *NEW*
                'to' => 1000, // *NEW*
            ),
            'trackCuePoints' => array(
                'doc' => "If entry cuepoints should be tracked for DoubleClick cue points / VAST URLs.",
                'type' => 'boolean'
            )
        )
    ),
    'keyboardShortcuts' => array(
        'description' => 'The keyboard shortcuts plugins allows you to control the player using keyboard shortcuts. ' .
            'More about javasciprt <a target="_new" href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent">key mappings</a>',
        'attributes' => array(
            'volumePercentChange' => array(
                'doc' => 'Volume change percent, from 0 to 1.',
                'type' => 'number'
            ),
            'shortSeekTime' => array(
                'doc' => 'Short seek time in seconds.',
                'type' => 'number'
            ),
            'longSeekTime' => array(
                'doc' => 'Long seek time in seconds',
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
            ),
            'shortSeekBackKey' => array(
                'doc' => 'Short Seek back key.',
                'type' => 'number',
            ),
            'longSeekBackKey' => array(
                'doc' => 'Long Seek back key.',
                'type' => 'string',
            ),
            'shortSeekForwardKey' => array(
                'doc' => 'Short Seek long key.',
                'type' => 'number',
            ),
            'longSeekForwardKey' => array(
                'doc' => 'Long Seek long key.',
                'type' => 'string',
            ),
            'openFullscreenKey' => array(
                'doc' => 'Open Full Screen Key.',
                'type' => 'number',
            ),
            'closeFullscreenkey' => array(
                'doc' => 'Close Full Screen Key.',
                'type' => 'number',
            ),
            'gotoBeginingKey' => array(
                'doc' => 'Go to the beginning of the video.',
                'type' => 'number',
            ),
            'gotoEndKey' => array(
                'doc' => 'Go to the end of the video.',
                'type' => 'number',
            ),
            'percentageSeekKeys' => array(
                'doc' => 'Comma seperated keys for percentage seek.',
                'type' => 'string'
            )
        )
    ),
    'volumeControl' => array(
        'description' => 'The volume control plugin allows you to control the player volume using mute/unmute buttons and a volume slider.',
        'attributes' => array(
            'showSlider' => array(
                'doc' => 'Show the volume slider.',
                'type' => 'boolean'
            ),
            'accessibleControls' => array(
                'doc' => 'Enable accessible controls for screen reader support.',
                'type' => 'boolean'
            ),
            'accessibleVolumeChange' => array(
                'doc' => 'Accessible buttons volume change percent from 0 to 1.',
                'type' => 'number'
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
                'doc' => 'Reason Sexual Content.',
                'type' => 'string',
            ),
            'reasonViolence' => array(
                'doc' => 'Reason Violent Content.',
                'type' => 'string',
            ),
            'reasonHarmful' => array(
                'doc' => 'Reason Harmful Content.',
                'type' => 'string',
            ),
            'reasonSpam' => array(
                'doc' => 'Reason Spam Content.',
                'type' => 'string',
            ),
        )
    ),
    'infoScreen' => array(
        'description' => 'Add Information screen about the video.',
        'attributes' => array_merge($kgDefaultComponentAttr,
            array(
                'minWidth' => array(
                    'doc' => 'Minimum width (px) for small view.',
                    'type' => 'number',
                ),
                'minWidthClass' => array(
                    'doc' => 'Class name to apply when in minimum width.',
                    'type' => 'string',
                ),
                'template' => array(
                    'doc' => 'HTML Template for the info screen.',
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
                'type' => 'enum',
                'enum' => array('left', 'right')
            ),
            'text' => array(
                'doc' => 'The text string to be displayed for the title.',
                'type' => 'string',
            ),
        )
    ),
    'related' => array(
        'description' => 'Add the Related Videos screen at the end of the video to attract users to watch additional videos.',
        'attributes' => array_merge($kgDefaultComponentAttr,
            array(
                'playlistId' => array(
                    'doc' => 'Playlist Id that will be used as the data source for related items.',
                    'type' => 'string'
                ),
                'entryList' => array(
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
                'itemsLimit' => array(
                    'doc' => 'Maximum number of items to show on the related screen.',
                    'type' => 'number'
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
