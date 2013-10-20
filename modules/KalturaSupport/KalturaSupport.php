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
		"mw.KBaseComponent" => array(
			'scripts' => "resources/mw.KBaseComponent.js",
			'dependencies' => array( 'mw.KBasePlugin', 'mediawiki.kmenu' )
		),		
		"mw.KBasePlugin" => array(
			'scripts' => "resources/mw.KBasePlugin.js",
			'dependencies' => array( 'class', 'mw.PluginManager', 'mw.TemplateManager' )
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
			'scripts' => "components/infoScreen.js",
			'dependencies' => 'mw.KBaseComponent',
			'kalturaPluginName' => 'infoScreen',
		),
		"related" => array(
			'scripts' => "components/related.js",
			'dependencies' => array( 'mw.KBaseComponent' ),
			'kalturaPluginName' => 'related',
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
		"liveStreamPlugin" => array(
			'scripts' => "resources/uiConfComponents/liveStream.js",
			'styles' => "resources/uiConfComponents/liveStream.css",
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
			'dependencies' => 'mw.KBaseComponent',
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
	);