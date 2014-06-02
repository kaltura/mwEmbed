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
				'mw.KApi',
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
		"mw.KBaseComponent" => array(
			'scripts' => "resources/mw.KBaseComponent.js",
			'dependencies' => array( 'mw.KBasePlugin', 'mediawiki.kmenu' )
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
		"mw.PlaylistHandlerKaltura"=> array( 
			'scripts' => "resources/mw.PlaylistHandlerKaltura.js",
			'dependencies' => array(
				'mw.MwEmbedSupport'
			)
		), 
		"mw.KDPMapping"=> array(
			'scripts' => "resources/mw.KDPMapping.js",
		),
		"mw.KApi"=> array(
			'scripts' => "resources/mw.KApi.js", 
			'dependencies' => array(
				'MD5'
			)	
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
		/** 
		 * Layout Components 
		 **/
		"theme" => array(
			'scripts' => "components/theme.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'theme',
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
		"fullScreenBtn" => array(
			'scripts' => "components/fullScreenBtn.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'fullScreenBtn',
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

		"pptWidgetPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/pptWidgetPlugin.js",
			'kalturaPluginName' => 'pptWidgetAPI'
		),

		/* playlist */
		"playlistPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/playlistPlugin.js", 
			'dependencies' => array(
				// core playlist module
				"mw.Playlist",
				// kaltura specific playlist modules
				'mw.PlaylistHandlerKaltura',
				// support playlist layout
				'mw.KLayout'
			),
			'kalturaPluginName' => 'playlistAPI'
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
				"components/live/liveStatus.js", // Live status components  ( extends mw.KBaseComponent )
				"components/live/liveBackBtn.js" // Back to live button ( extends mw.KBaseComponent )
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
			'scripts' => "resources/uiConfComponents/jcarousellite_1.0.1.js" 
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
		'playbackRateSelectorPlugin' => array(
			'scripts' => "resources/uiConfComponents/playbackRateSelector.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'playbackRateSelector'
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
	);