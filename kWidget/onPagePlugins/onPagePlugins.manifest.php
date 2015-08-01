<?php 
return array(
	'playlistOnPage' => array( 
		'description' => 'Adds a playlist to the page, per player defined playlist id. This enables custom on-page css to theme the playlist to the host page.',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true,
			),
			'path' => array(
				'hideEdit' => true
			),
			'clipListTargetId' => array(
				'doc' => 'Target div for ul list of clips, appended after player if null',
				'type' => 'string'
			),
			'layoutMode' => array(
				'doc' => "Layout mode of playlist ( vertical or horizontal ) ",
				'type' => 'enum',
				'enum' => array( 'vertical', 'horizontal' )
			),
			'thumbWidth' => array(
				'doc' => "The width of the clip thumbnails in pixels ( default 110 )",
				'type' => 'number',
			)
		)
	),
	'omnitureOnPage' => array(
		'description' => 'The Omniture s_code config version of the plugin, allows you to connect the Omniture plugin to your existing s_code.js
			configuration for easy integration of video analytics into an Omniture site.',
		'attributes' => array(
			's_codeUrl' => array(
				'doc' => "The URL to the Ominture generated sCode file that must be set in the uiConf (not via flashvars). This parameter is required for the plugin to work.",
				'type' => 'url'
			),
			's_codeVarName' => array(
				'doc' => "The name of s_code entry point in the global window scope. ( \"s\" by default ).",
				'label' => 'Entry code name',
				'initvalue' => 's',
				'type' => 'string'
			),
			'monitorEventInterval' => array(
				'doc' => "Set to an interval ( in seconds ) for tracking the Omniture 'monitor' event.",
				'label' => 'Monitor event tracking interval',
				'initvalue' => 0,
				'type' => 'number'
			),
			'trackEventMonitor' => array(
				'doc' => 'A global callback function for logging Omniture events.',
				'label' => 'Omniture events function name',
				'type' => 'string'
			),
			'concatMediaName' => array(
				'doc' => "A per partner key for special media name concatenation rules. By default this parameter should be left null.",
				'label' => 'Media name concatenation rules',
				'type'=> 'string'
			),
			'customEvents' => array(
				'doc' => "A comma separated list of Kaltura player events you want to track.",
				'label' => 'Kaltura player events',
				'type'=> 'string'
			),
			'additionalEvarsAndProps' => array(
				'doc' => "A comma separated list of Omniture evars and props, you wish to pass along with every media event.",
				'label' => 'Omniture variables and properties',
				'type' => 'string'
			),
			'additionalEvarsAndPropsValues' => array(
				'doc' => "A comma separated list of Kaltura values, you want to pass along with every media event.
				Values will correspond to the evars and props comma separated map defined in additionalEvarsAndProps.",
				'label' => 'Kaltura values',
				'type' => 'string'
			)
		)
	),
	'videoDetailsBlock' => array(
	 	'description' => 'This plugin creates a block that includes a title, description paragraph and list of tags of the currently playing media entry. The block will be appended to the player\'s div or be added to a given target div (the contents of the target div will be replaced). The design of the block is determined by the CSS of the plugin. Check out the integrate options for various configurations such as overriding the block title, show transition and more.',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true,
			),
			'path' => array(
				'hideEdit' => true
			),
			'showTransition' => array(
				'doc' => 'Whether to show the details block with a transition. If null, block will appear without transition',
				'type' => 'boolean'
			),
			'showTransitionDuration' => array(
				'doc' => "milliseconds for the transition duration, default is 300ms",
				'type' => 'number'
			),
			'targetDiv' => array(
				'doc' => 'The id of the target div on the page where the block should be loaded. If null, block will load relative to the player',
				'type' => 'string',
				'hideEdit' => true
			),
			'blockRelativePosition' => array(
				'doc' => 'The relative location of the block. Only used if targetDiv is null. By default its set to append after the player',
				'type' => 'enum',
				'enum' => array( 'after', 'before', 'left', 'right' )
			),
			'customTitle' => array(
				'doc' => 'Overrides the entry name with a custom title for the block. If null, will load the currently playing entry name',
				'type' => 'string'
			),
		)
	),
	
	'limeSurveyCuePointForms' => array(
	 	'description' => 'This plugin loads <a href="http://www.limesurvey.org/" target="_blank">LimeSurvey</a>  survey ifrmaes over video in cue-points. To create the  survey cue-points, use the <a href="./limeSurveyCuePointFormsEdit.qunit.html" target="_blank">Survey Cue-Points Editor</a>',
		'attributes' => array(
			'plugin' => array(
				'hideEdit' => true,
			),
			'path' => array(
				'hideEdit' => true
			),
			'tags' => array(
				'doc' => 'The cue-points tag that identify the type of cue-points to read (defined by the cue-points editor)',
				'type' => 'string',
				'hideEdit' => true
			),
			'backgroundHexColor' => array(
				'doc' => 'Hex color value (in the form of: #ffffff) indicating the background color of the survey overlay',
				'type' => 'string'
			),
			'backgroundAlpha' => array(
				'doc' => 'Float value (0 to 1) indicating the opacity level of the survey overlay',
				'type' => 'number'
			),
		)
	),
	
	'descriptionBox' => array(
	 	'description' => 'Appends or updates a target; with the asset\'s title and description',
		'attributes' => array(
			'boxHeight' => array(
				'doc' => 'Height of the description box, <i>null</i> to fill per height of content',
				'type' => 'number'
			),
			'boxWidth' => array(
				'doc' => "Box width ( can be 100% of parent ), <i>null</i> to fill 100% width",
				'type' => 'string'
			),
			'boxTargetId' => array(
				'doc' => 'The target on page div id, for the title / description box',
				'type' => 'string'
			),
			'boxLocation' => array(
				'doc' => 'The relative location of title / description box ( only used if boxTargetId is null ) by default its after the player ',
				'type' => 'enum',
				'enum' => array( 'before', 'after', 'left', 'right' )
			),
			'descriptionLabel' => array(
				'doc' => 'Description label, entry title if null.',
				'type' => 'string'
			),
		)
	),
	
	'chaptersEdit' => array(
		'description' => 'Provides a simple interface for editing chapter annotation data. You 
		must provide your credentials on the "integrate" tab and select an entry from your 
		account to edits it\'s chapter cuePoints.',
		'attributes' => array(
			'ks' => array(
				'doc' => "The authentication ks, required until we have iframe auth system in place",
				'type' => 'string',
				'hideEdit' => true
			),
			'editTargetId' => array(
				'doc' => "The target id for chapter editing interface",
				'type' => 'string'
			),
			'customDataFields' => array(
				'doc' => "List of custom data properties to be listed in editor",
				'type' => 'list',
				'list' => array(
					'desc'=> 'Chapter Description',
					'thumbUrl'=> 'Thumbnail URL override'
				),
			),
			'tags' => array(
				'doc' => 'Default: "chaptering", Providing a tag name will grab only annotations which have that tag. 
									This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters in different languages)',
				'type' => 'string'
			),
			'editPropId' => array(
				'doc' => "The target id to edit chapter cuePoint properties",
				'type' => 'string'
			),
			'editTimelineId' => array(
				'doc' => "The timeline id to for clickable timeline widget for cuePoints",
				'type' => 'string'
			),
			// custom data always enabled stores to partnerData: 
			// thumbnailUrl
		)
	),
	'chaptersView' => array(
	 	'description' => 'Display video chapter information. See <a target="_blank" href="http://player.kaltura.com/kWidget/onPagePlugins/chapters/ChapterSamples.html">chapter samples</a>, for highlighted sample chapter configuration',
		'attributes' => array(
			'containerId' => array(
				'doc'=> "Default: null, The chapter container id, will override some layout settings and allow you to place the chapters in a target div.",
				'type' => 'string'
			),
			'tags' => array(
				'doc' => 'Default: "chaptering" Providing a tag name will grab only annotations which have that tag.
									This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters in different languages)',
				'type' => 'string'
			),
			'parentName' => array(
				'doc' => 'Default: "chaptering" Providing a parentName will force querying only annotations whose parent fits parentName.
									This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters, references, ads).',
				'type' => 'string'
			),
			'layout' => array(
				'doc' => 'Will affect the layout of the chapters. This will only add CSS classes, the actual visual layout is performed via CSS',
				'type'=> 'enum',
				'initvalue' => 'horizontal',
				'enum' => array( 'vertical', 'horizontal' )
			),
			'containerPosition' => array(
				'doc' =>  'Will affect the position of the chaptering UI in relation to the video. This will only affect the structure of UI HTML elements, and will leave actual layout to be performed via CSS)',
				'type' => 'enum',
				'initvalue' => 'after',
				'enum' => array( 'before', 'after', 'left', 'right' )
			),
			'overflow' => array(
				'doc' => 'Defines what should happen in case list of chapters require more space than videos dimensions. Combined with the layout and position parameters, this parameter will cause a prev/next UI to appear if overflow is set to false.',
				'type' => 'boolean',
			),
			'includeThumbnail' => array(
				'doc' => 'If set to true, a thumbnail HTML element will be generated containing the video frame from the startTime of the chapter',
				'type' => 'boolean',
			),
			'thumbnailWidth' => array(
				'doc' => "The width of the clip thumbnails in pixels ( default 100 )",
				'type' => 'number',
			),
			'horizontalChapterBoxWidth'=> array(
				'doc' => "The total width of the chapter box for horizontal layout, in pixels ( default 320 )",
				'type' => 'nubmer',
			),
			'thumbnailRotator' => array(
				'doc' => 'If set to true (and assuming that includeThumbnail=true), will enable a thumbnail-rotator experience, allowing the user to rollover i. a chapter thumbnail and experience a few (4,5) additional frames of the chapter (length of the chapter will be computed by delta between startTime of this chapter and the next, then divide it by X frames and generate the additional thumbnails for the rotator using the thumbnail URL API)',
				'type' => 'boolean'
			),
			'includeChapterNumberPattern' => array(
				'doc' => 'If set to true, chapter number will prefix chapter. If set to string, will substitute chapter into pattern. i.e "Ch $1 -" will prefix chapter text with "Ch 1 -", "Ch 2 -" etc.',
				'type' => 'string'
			),
			'includeChapterStartTime' => array(
				'doc' => 'If the chapter start time should be included left of the title',
				'type' => 'boolean'
			),
			'includeChapterDuration' => array(
				'doc' => 'If the chapter duration should be included right of the title',
				'type' => 'boolean'
			),
			'pauseAfterChapter' => array(
				'doc' => "If set to true, video playback will pause on chapter complete",
				'type' => 'boolean'
			),
			'titleLimit' => array(
				'doc' => "Display limit for chapter titles, default 24 characters",
				'initvalue' => 24,
				'type' => 'number'
			),
			'descriptionLimit' => array(
				'doc' => "Display limit for chapter description, default 70 characters",
				'initvalue' => 70,
				'type' => 'number'
			),
			'onPageJs1' => array(
				'doc' => "",
				'initvalue' => "{onPagePluginPath}\/chapters\/chaptersView.js",
				'type' => 'hidden'
			),
			'onPageJs2' => array(
				'doc' => "",
				'initvalue' => "{onPagePluginPath}\/libs\/jcarousellite.js",
				'type' => 'hidden'
			),
			'onPageJs3' => array(
				'doc' => "",
				'initvalue' => "{onPagePluginPath}\/libs\/jquery.sortElements.js",
				'type' => 'hidden'
			),
			'onPageCss1' => array(
				'doc' => "",
				'initvalue' => "{onPagePluginPath}\/chapters\/chaptersView.css",
				'type' => 'hidden'
			),
			'requiresJQuery' => array(
				'doc' => "",
				'initvalue' => true,
				'type' => 'hidden'
			),
			'path' => array(
				'doc' => "",
				'initvalue' => '/content/uiconf/ps/kaltura/kdp/v3.6.9/plugins/facadePlugin.swf',
				'type' => 'hidden'
			),
			'chapterRenderer' => array(
				'doc' => "If provided, the plugin will delegate rendering of the plugin to this method, <br><br>
							<i>chapterRenderer : function(  cuePoint, \$chapterBox ) </i> <br>
							<b>cuePoint</b> The cuePoint object, includes <i>customData</i> object as a property<br>
							<b>\$chapterBox</b> A jQuery object reference to current chapter box",
				'type'=> 'function'
			),
			'chaptersRenderDone' => array(
				'doc' => "Optional callback for once chapter rendering is done<br><br>
						<i>chaptersRenderDone: function( \$chapterContainer )</i><br>
						<b>\$chapterContainer</b> jQuery container of chapters.",
				'type' => 'function'
			),
		)
	),
    'cielo24Transcriptions' => array(
        'description' => 'Adds a Cielo24 Media Data Player widget to the page.',
        'attributes' => array(
            'onPageJs1' => array(
                'doc' => "URL for the widgets JavaScript",
                'initvalue' => "\/\/mediadataplayer.cdn.cielo24.com\/v2\/stabl\/kaltura.js",
                'type' => 'hidden'
            ),
            'DynaTransWindowSize' => array(
                'doc' => "The height of the widget.",
                'initvalue' => 400,
                'type' => 'number',
            ),
            'DynaTransWindowTitle' => array(
                'doc' => "Widget title.",
                'initvalue' => 'cielo24 Media Data Player',
                'type' => 'string',
            ),
            'DynaTransClientLogo' => array(
                'doc' => "URL to display in the widgets footer.",
                'initvalue' => "https:\/\/mediadataplayer.cdn.cielo24.com\/v2\/stable\/widget\/img\/logo-transparent.png",
                'type' => 'string',
            ),
            'DynaTransHideGear' => array(
                'doc' => "If set to true, the settings icon will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransHideShare' => array(
                'doc' => "If set to true, the social sharing icon will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransHidePrint' => array(
                'doc' => "If set to true, the print icon will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransHideDownload' => array(
                'doc' => "If set to true, the transcript download icon will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransHideLeftMenu' => array(
                'doc' => "If set to true, metadata menu icon will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransHideSpeakers' => array(
                'doc' => "If set to true, speaker names will be hidden by default.",
                'type' => 'boolean',
                'initvalue' => true
            ),
            'DynaTransHideTimestamps' => array(
                'doc' => "If set to true, timestamps will be hidden by default.",
                'type' => 'boolean',
                'initvalue' => true
            ),
            'DynaTransAutoscrollOff' => array(
                'doc' => "If set to true, auto-scrolling will be disabled by default.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransWidgetUrl' => array(
                'doc' => "URL for the widgets html.",
                'initvalue' => "https:\/\/mediadataplayer.cdn.cielo24.com\/v2\/stable\/widget\/widget.html",
                'type' => 'hidden',
            ),            
            'DynaTransHideMetaSpeakers' => array(
                'doc' => "If set to true, the speakers option in the metadata menu will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransHideMetaTopics' => array(
                'doc' => "If set to true, the topics option in the metadata menu will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransMetaKeywords' => array(
                'doc' => "If set to true, the keywords option in the metadata menu will be hidden.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransAdditionalCSS' => array(
                'doc' => "Additional CSS to inject into the page that hosts the player. (Optional)",
                'type' => 'string',
                'initvalue' => ".action-edit #wrapper.video{margin-bottom:0}#mediaContainer #wrapper.video{height:auto;padding-bottom:0 !important}#mediaContainer #wrapper.video #player div.kWidgetIframeContainer{position:relative;height:400px;left:auto;top:auto}.entryTitle,.stat_data{margin-top:20px}#mediaContainer #wrapper.video #player div#cielo24-iframe-wrapper-kplayer{background:#FFF;height:auto;left:auto;position:relative;top:auto;width:auto}#mediaContainer #wrapper.video #player #cielo24-iframe-wrapper-kplayer iframe{background-color:#FFF;height:inherit;left:unset;position:unset;top:unset;width:none}"
            ),
            'DynaTransEnableAdditionalCSS' => array(
                'doc' => "If set to true, the additional CSS will be injected into the page that hosts the player.",
                'type' => 'boolean',
                'initvalue' => false
            ),
            'DynaTransTargetDivId' => array(
                'doc' => "The HTML div into which the player should be rendered. (Optional)",
                'type' => 'string',
                'initvalue' => ""
            ),
        )
    ),
);