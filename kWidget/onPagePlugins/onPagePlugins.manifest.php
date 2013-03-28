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
		'description' => '<h3>Omniture SiteCatalyst 15, Kaltura Plugin: Video Analytics at your Fingertips.</h3> 
		The On page version of omniture allows you to connect the omniture plugin to your existing s_code.js 
		configuration for easy integration of video analytics into a omniture site.
		<br>
		<img src="resources/omniture_screen_shot.png" style="float:left;height:200px;padding:5px;">
		<p>Analytics are a key component of a successful video strategy. Many elements can influece your viewers, the content
itsef, the player experience, the web page context, the way you handle ad insertion, the quality of playback, and
more. In order to test and learn different strategies it is critical to track your viewers’ interaction with your content:
What are your viewers watching? What keeps them engaged? When are they more likely to share content? When do
they drop off? With the right information on hand you can truly understand what is driving your audiences’ behavior
and test different strategies to maximize engagement and create an effective monetization strategy.</p>

<p>Using the Omniture SiteCatalyst plugin for Kaltura, you can pull video analytics directly from Kaltura’s player into
SiteCatalyst. The plugin is already in use by some of our leading customers</p>

<p>The Omniture SiteCatalyst plugin for Kaltura tracks user interaction with the player, including video views, share
events, expanding/closing full screen, replaying, and more.</p>

<p>To start working with the plugin all you need to do is configure the relevant Omniture plugin parameters in the Kaltura
Management Console player studio. You can either use the standard configuration or have our experts work with you
to help realize your analytics goals.</p>

		
		',
		'attributes' => array(
			's_codeUrl' => array(
				'doc' => "The URL to the Ominture gennerated sCode file. This is required for this plugin to work. Must be set in uiConf not via flashvars.",
				'type' => 'URL'
			),
			's_codeVarName' => array(
				'doc' => "The name of s_code entry point in the global window scope. ( \"s\" by default )",
				'type' => 'string'
			),
			'trackEventMonitor' => array(
				'doc' => 'A global callback function for logging omniture events',
				'type' => 'string'
			),
			'concatMediaName' => array(
				'doc' => "A per partner key for special media name concatenation rules. By default this paramater should be left null",
				'type'=> 'string'
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
				'doc' => 'Whether to show the details block with a transition. If null, block will apear without transition',
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
				'doc' => 'Overrides the entry name with a custom title for the blocl. If null, will load the currently playing entry name',
				'type' => 'string'
			),
		)
	),
    
    'limeSurveyCuePointForms' => array(
	 	'description' => 'This plugin loads <a href="http://www.limesurvey.org/" target="_blank">LimeSurvey</a> survey ifrmaes over video in cue-points. To create the survey cue-points, use the <a href="./limeSurveyCuePointFormsEdit.qunit.html" target="_blank">Survey Cue-Points Editor</a>',
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
		'description' => 'Provides a simple interface for editing chapter annotation data',
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
					'thumbUrl'=> 'Thumbnail url override'
				),
			),
			'tags' => array(
				'doc' => 'Default: "chaptering" – Providing a tag name will grab only annotations which have that tag. 
									This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters in diffrent languages)',
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
	 	'description' => 'Display video chapter information. See <a target="_blank" href="ChapterSamples.html">chapter samples</a>, for highlighted sample chapter configuration',
		'attributes' => array(
			'containerId' => array(
				'doc'=> "Default: null, The chapter container id, will override some layout settings and allow you to place the chapters in a target div.",
				'type' => 'string'
			),
			'tags' => array(
				'doc' => 'Default: "chaptering" – Providing a tag name will grab only annotations which have that tag. 
									This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters in diffrent languages)',
			),
			'parentName' => array(
				'doc' => 'Default: "chaptering" – Providing a parentName will force querying only annotations whose parent fits parentName. 
									This allows multiple types of cuePoints to be stored on the same entry (e.g. chapters, references, ads).',
				'type' => 'string'
			),
			'layout' => array(
				'doc' => 'Will affect the layout of the chapters. This will only add css classes, the actual visual layout is performed via CSS',
				'type'=> 'enum',
				'enum' => array( 'vertical', 'horizontal' )
			),
			'containerPosition' => array(
				'doc' =>  'Will affect the position of the chaptering UI in relation to the video. This will only affect the structure of UI HTML elements, and will leave actual layouting to be performed via CSS)',
				'type' => 'enum',
				'enum' => array( 'before', 'after', 'left', 'right' )
			),
			'overflow' => array(
				'doc' => 'Defines what should happen in case list of chapters require more space than video’s dimensions. Combined with the “layout” and “position” parameters, this parameter will cause a prev/next UI to appear if overflow is set to false.',
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
				'type' => 'number'
			),
			'descriptionLimit' => array(
				'doc' => "Display limit for chapter description, default 70 characters",
				'type' => 'number'
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
	'widevine' => array(
	 	'description' => 'Widevine plugin provides content DRM. It is responsible for managing the license request flow as well as the content delivery from origin server. <br>
		Initially the onPage will check for widevine browser plugin, and will show a message with a download link if this plugin is missing. <a href="http://www.widevine.com/drm.html"> More info </a>',
		'attributes' => array(
			'promptStyle' => array(
				'doc' => 'Overrides the default prompt message style ',
				'type' => 'string'
			),
			'promptText' => array(
				'doc' => 'Overrides the default prompt message ',
				'type' => 'string'
			),
			'promptLinkText' => array(
				'doc' => 'Overrides the default link text',
				'type' => 'string'
			),
		),
		
	),
);
