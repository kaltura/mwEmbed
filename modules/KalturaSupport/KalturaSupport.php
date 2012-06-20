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
				'mw.KApi',
				'mw.KDPMapping'
			),
			'kalturaLoad' => 'always'
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
			'scripts' => "resources/mw.PlaylistHandlerKaltura.js" 
		), 
		"mw.PlaylistHandlerKalturaRss"=> array( '
			scripts' => "resources/mw.PlaylistHandlerKalturaRss.js" 
		),
		"mw.KDPMapping"=> array(
			'scripts' => "resources/mw.KDPMapping.js" 
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
		"mw.KPPTWidget"=> array( 
			'scripts' => "resources/mw.KPPTWidget.js" 
		),

		/* playlist */
		"playlistPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/playlistPlugin.js", 
			'dependencies' => array(
				// core playlist module
				"mw.Playlist",
				// kaltura specific playlist modules
				'mw.PlaylistHandlerKaltura',
				'mw.PlaylistHandlerKalturaRss',
				// support playlist layout
				'mw.KLayout'
			),
			'kalturaPluginName' => 'playlistAPI'
		),
		
		/* uiConf based plugins */
		"statisticsPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/statisticsPlugin.js",
			'dependencies' => array( 'mw.KAnalytics' ) 
		),
		"vastPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/vastPlugin.js",
			'dependencies' => array(
				"mw.KAds"
			),
			'kalturaPluginName' => 'vast'
		),
		"acPreview"=> array( 
			'scripts' => "resources/uiConfComponents/acPreview.js",
			// We always should load access controls since a change Media call 
			// could invoke an access control entry. 
			'kalturaLoad' => 'always'
		),
		"captionPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/captionPlugin.js",
			'dependencies' => array( 
				"mw.KTimedText"
			),
			'kalturaPluginName' => array( 
				'closedCaptions', 
				'closedCaptionsUnderPlayer',
				'closedCaptionsOverPlayer',  
				'closedCaptionsFlexible'
			)
		),
			
		"faderPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/faderPlugin.js", 
			'kalturaLoad' => 'always'
		),
		"watermarkPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/watermarkPlugin.js",
			'kalturaPluginName' => 'watermark'
		),
		"bumperPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/bumperPlugin.js",
			'kalturaPluginName' => 'bumper'
		),
		"myLogo"=> array( 
			'scripts' => "resources/uiConfComponents/myLogo.js",
			'kalturaPluginName' => 'mylogo'
		),
		"controlbarLayout"=> array( 
			'scripts' => "resources/uiConfComponents/controlbarLayout.js", 
			'kalturaLoad' => 'always'
		),
		"titleLayout"=> array( 
			'scripts' => "resources/uiConfComponents/titleLayout.js",
			'dependencies' => array(
				'mw.KLayout'
			),
			'kalturaPluginName' => 'TopTitleScreen'
		),
		"volumeBarLayout"=> array( 
			'scripts' => "resources/uiConfComponents/volumeBarLayout.js",
			'kalturaPluginName' => 'volumeBar'
		),
		"shareSnippet"=> array( 
			'scripts' => "resources/uiConfComponents/shareSnippet.js", 
			'kalturaPluginName' => 'shareSnippet'
		),
		"moderationPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/moderationPlugin.js",
			'kalturaPluginName' => 'moderation'
		),
        "downloadPlugin"=> array( 
        	'scripts' => "resources/uiConfComponents/downloadPlugin.js",
			'kalturaPluginName' => "download"
		),
        "captureThumbnailPlugin"=> array( 
        	'scripts' => "resources/uiConfComponents/captureThumbnailPlugin.js",
			'kalturaPluginName' => 'captureThumbnail' 
		),
        "carouselPlugin"=> array( 
        	'scripts' => "resources/uiConfComponents/carouselPlugin.js",
			'dependencies' => array( 'jCarouse' ),
			'kalturaPluginName' => 'related'
		),
		"jCarouse"=> array( 
        	'scripts' => "resources/uiConfComponents/jcarousellite_1.0.1.js" 
		),
		"mw.KLayout"=> array( 
			'scripts' => "resources/mw.KLayout.js" 
		),
	);