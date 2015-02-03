<?php
	// Return the KalturaSupport modules 
	return array(
		"mw.KalturaIframePlayerSetup" =>  array( 
			'scripts' => "resources/mw.KalturaIframePlayerSetup.js",
			'dependencies' => array(
				'mw.MwEmbedSupport'
			),
			'kalturaLoad' => 'always'
		),
		"mw.KWidgetSupport" => array( 
			'scripts' => "resources/mw.KWidgetSupport.js",
			'dependencies' => array(
				'base64_encode',
				'matchMedia',
				'mw.KEntryLoader',
				'mw.KDPMapping',
				'mw.KCuePoints'
			),
			'kalturaLoad' => 'always',
			'messageFile' => 'KalturaSupport.i18n.php'
		),
		"mw.KBaseScreen" => array(
			'scripts' => "resources/mw.KBaseScreen.js",
			'dependencies' => array( 'mw.KBaseComponent' )
		),
		"mw.KBaseMediaList" => array(
			'scripts' => "resources/mw.KBaseMediaList.js",
			'dependencies' => array( 'mw.KBaseComponent','jCarouse', 'nanoScroller' )
		),
		"mw.KBaseComponent" => array(
			'scripts' => "resources/mw.KBaseComponent.js",
			'dependencies' => array( 'mw.KBasePlugin', 'mediawiki.kmenu' )
		),
		"mw.KBaseButton" => array(
			'scripts' => "resources/mw.KBaseButton.js",
			'dependencies' => array( 'mw.KBaseComponent')
		),
		"mw.KBasePlugin" => array(
			'scripts' => "resources/mw.KBasePlugin.js",
			'dependencies' => array( 'class', 'mw.PluginManager', 'mediawiki.util.tmpl' )
		),
		"mw.KCuePoints"=> array( 
			'scripts' => "resources/mw.KCuePoints.js" 
		),
		"mw.KTimedText"=> array( 
			'scripts' => "resources/mw.KTimedText.js" 
		),
		"mw.KAnalytics"=> array( 
			'scripts' => "resources/mw.KAnalytics.js"
		),
		"mw.KDPMapping"=> array(
			'scripts' => "resources/mw.KDPMapping.js",
		),
		"mw.KEntryLoader"=> array(
			'scripts' => "resources/mw.KEntryLoader.js"
		),
		"mw.KAds"=> array( 
			'scripts' => "resources/mw.KAds.js",
			'dependencies' => array(
				"mw.AdTimeline",
				"mw.KAdPlayer"
			)
		),
		"mw.KAdPlayer"=> array( 
			'scripts' => "resources/mw.KAdPlayer.js" 
		),
		"dualScreen" => array(
			'scripts' => "components/dualScreen/dualScreen.js",
			'styles' =>  "components/dualScreen/displayControlBar.css",
			'templates' => "components/dualScreen/displayControlBar.tmpl.html",
			'dependencies' => array( 'mw.KBaseComponent', 'jquery.ui.draggable', 'jquery.ui.resizable' ),
			'kalturaPluginName' => 'dualScreen'
		),
		'hammerEvents' => array(
			'scripts' => 'components/hammerEvents/hammerEvents.js',
			'kalturaPluginName' => 'hammerEvents',
			'dependencies' => array(
				'mw.KBasePlugin', 'hammer'
			)
		),
		'hammer' => array(
			'scripts' => 'components/hammerEvents/hammer.min.js',
		),
		"chapters" => array(
			'scripts' => "components/chapters/chapters.js",
			'styles' =>  "components/chapters/chapters.css",
			'templates' => array(
			    "list" => "components/chapters/list.tmpl.html",
			    "chapters" => "components/chapters/chapters.tmpl.html",
			    "slides" => "components/chapters/slides.tmpl.html"
			),
			'dependencies' => array( 'mw.KBaseMediaList', 'typeahead', 'dotdotdot' ),
			'kalturaPluginName' => 'chapters'
		),
		/* Core plugins */
		"keyboardShortcuts" => array(
			'scripts' => "resources/mw.KeyboardShortcuts.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaLoad' => 'always'			
		),
		/* Layout Container */
		"controlBarContainer" => array(
			'scripts' => "components/controlBarContainer.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaLoad' => 'always'
		),
		"topBarContainer" => array(
			'scripts' => "components/topBarContainer.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaLoad' => 'always'
		),
		"sideBarContainer" => array(
			'scripts' => "components/sideBarContainer.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaLoad' => 'always'
		),
		/** 
		 * Layout Components 
		 **/
		"theme" => array(
			'scripts' => "components/theme.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'theme',
		),
		"playlistAPI" => array(
			'scripts' => "components/playlistAPI.js",
			'dependencies' => array('mw.KBaseMediaList','dotdotdot'),
			'styles' =>  "components/playlist/playList.css",
			'templates' => "components/playlist/playList.tmpl.html",
			'kalturaPluginName' => 'playlistAPI',
		),
		"largePlayBtn" => array(
			'scripts' => "components/largePlayBtn.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'largePlayBtn',
		),	
		"playPauseBtn" => array(
			'scripts' => "components/playPauseBtn.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'playPauseBtn',
		),
		"nextPrevBtn" => array(
			'scripts' => "components/nextPrevBtn.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'nextPrevBtn',
		),
		"fullScreenBtn" => array(
			'scripts' => "components/fullScreenBtn.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'fullScreenBtn',
		),
		"expandToggleBtn" =>array(
			'scripts' => "components/expandToggleBtn.js",
			'dependencies' => 'mw.KBaseButton',
			'kalturaPluginName' => 'expandToggleBtn',
		),
		"scrubber" => array(
			'scripts' => "components/scrubber.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'scrubber',
		),
		"volumeControl" => array(
			'scripts' => "components/volumeControl.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'volumeControl',
		),
		"accessibilityButtons" => array(
			'scripts' => "components/accessibilityButtons.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'accessibilityButtons',
		),
		"currentTimeLabel" => array(
			'scripts' => "components/currentTimeLabel.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'currentTimeLabel',
		),				
		"durationLabel" => array(
			'scripts' => "components/durationLabel.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'durationLabel',
		),
		"sourceSelector" => array(
			'scripts' => "components/sourceSelector.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'sourceSelector',
		),
		"logo" => array(
			'scripts' => "components/logo.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'logo',
		),
		"closeFSMobile" => array(
			'scripts' => "components/closeFSMobile.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'closeFSMobile',
		),
		"airPlay" => array(
			'scripts' => "components/airPlay.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'airPlay',
		),
		"nativeCallout" => array(
			'scripts' => "components/nativeCallout.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaPluginName' => 'nativeCallout',
		),
		"closedCaptions" => array(
			'scripts' => "resources/mw.ClosedCaptions.js",
			'dependencies' => array( 
				'mw.KBaseComponent', 
				'mw.TextSource',
				'mw.Language.names' 
			),
			'kalturaPluginName' => 'closedCaptions',
			'messageFile' => '../TimedText/TimedText.i18n.php',
		),
		"infoScreen" => array(
			'scripts' => "components/info/info.js",
			'templates' => "components/info/info.tmpl.html",
			'dependencies' => array( 'mw.KBaseScreen' ),
			'kalturaPluginName' => 'infoScreen',
		),
		"related" => array(
			'scripts' => "components/related/related.js",
			'styles' => "components/related/related.css",
			'templates' => "components/related/related.tmpl.html",
			'dependencies' => array( 'mw.KBaseScreen' ),
			'kalturaPluginName' => 'related',
		),
		"share" => array(
			'scripts' => "components/share/share.js",
			'styles' =>  "components/share/share.css",
			'templates' => "components/share/share.tmpl.html",
			'dependencies' => array( 'mw.KBaseScreen' ),
			'kalturaPluginName' => 'share',
		),
		"playServerUrls" => array(
			'scripts' => "components/playServerUrls.js",
			'dependencies' => array( 'mw.KBasePlugin' ),
			'kalturaPluginName' => 'playServerUrls',
		),
		"adBlockDetector" => array(
			'scripts' => "components/adBlockDetector/adBlockDetector.js",
			'dependencies' => array( 'mw.KBasePlugin' ),
			'kalturaPluginName' => 'adBlockDetector',
		),
		"pptWidgetPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/pptWidgetPlugin.js",
			'kalturaPluginName' => 'pptWidgetAPI'
		),

		/* uiConf based plugins */
		"acCheck" => array(
			'scripts' => "resources/uiConfComponents/acCheck.js",
			// We always should load access controls since 
			// it can be invoked per entry . 
			'kalturaLoad' => 'always'
		),
		"acPreview"=> array( 
			'scripts' => "resources/uiConfComponents/acPreview.js",
			// We always should load access controls since 
			// it can be invoked per entry 
			'kalturaLoad' => 'always'
		),
		"bumperPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/bumperPlugin.js",
			'dependencies' => array( 'mw.KAds' ),
			'kalturaPluginName' => 'bumper'
		),
		"captureThumbnailPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/captureThumbnailPlugin.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'captureThumbnail' 
		),
		"carouselPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/carouselPlugin.js",
			'dependencies' => array( 'jCarouse' ),
			'kalturaPluginName' => array(
				'related',
				'carousel'
			)
		),
		"likeAPIPlugin" => array(
			'scripts' => "resources/uiConfComponents/likeAPIPlugin.js", 
			'kalturaPluginName' => 'likeAPI'
		),
		"liveStream" => array(
			'scripts' => array(
				"components/live/liveCore.js", // Will run API requests for isLive service and trigger events ( extends mw.KBasePlugin )
				"components/live/liveStatus.js" // Live status components  ( extends mw.KBaseComponent )
			),
			'styles' => 'components/live/liveStream.css',
			'dependencies' => 'mw.KBaseComponent',
			'kalturaLoad' => 'always'
		),
		"titleLabel"=> array( 
			'scripts' => "resources/uiConfComponents/titleLabel.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'titleLabel'
		),		
		"shareSnippet"=> array( 
			'scripts' => "resources/uiConfComponents/shareSnippet.js", 
			'kalturaPluginName' => 'shareSnippet'
		),
		"moderationPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/moderationPlugin.js",
			'dependencies' =>  array( 'mw.KBaseScreen' ),
			'kalturaPluginName' => 'moderation'
		),
		"downloadPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/downloadPlugin.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => "download"
		),
		"jCarouse"=> array( 
			'scripts' => "resources/uiConfComponents/jcarousellite_1.0.1.js",
			 'dependencies' => array('touchSwipe')
		),
		"mw.KLayout"=> array( 
			'scripts' => "resources/mw.KLayout.js" 
		),
		"restrictUserAgentPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/restrictUserAgentPlugin.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaPluginName' => 'restrictUserAgent' 
		),
		"segmentScrubberPlugin" => array(
			'scripts' => "resources/uiConfComponents/segmentScrubberPlugin.js",
			'dependencies' => 'mw.KBasePlugin',
			'kalturaPluginName' => 'segmentScrubber',
		),
		"statisticsPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/statisticsPlugin.js",
			'dependencies' => array( 'mw.KAnalytics' ), 
			'kalturaPluginName' => 'statistics'
		),
		"liveAnalytics" => array(
			'scripts' => "resources/mw.KLiveAnalytics.js",
			'dependencies' => array( 'mw.KBasePlugin' ),
			'kalturaPluginName' => 'liveAnalytics'
		),
		'playbackRateSelectorPlugin' => array(
			'scripts' => "resources/uiConfComponents/playbackRateSelector.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'playbackRateSelector'
		),
		'streamSelector' => array(
            'scripts' => "components/streamSelector.js",
            'dependencies' => 'mw.KBaseComponent',
            'kalturaPluginName' => 'streamSelector'
        ),
		"watermarkPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/watermarkPlugin.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'watermark'
		),
		"vastPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/vastPlugin.js",
			'dependencies' => array(
				"mw.KAds"
			),
			'kalturaPluginName' => 'vast'
		),
		"audioDescription" => array(
				'scripts' => "components/audioDescription.js",
				'dependencies' => 'mw.KBaseComponent',
				'kalturaPluginName' => 'audioDescription'
		),
		"reportError" => array(
				'scripts' => "components/reportError.js",
				'dependencies' => 'mw.KBaseComponent',
				'kalturaPluginName' => 'reportError'
		),
	);