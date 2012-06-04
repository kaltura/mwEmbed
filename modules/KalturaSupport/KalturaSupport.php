<?php
	// Register all the KalturaSupport modules 
	return array(
		"IframePlayerSetup" =>  array( 'scripts' => "resources/IframePlayerSetup.js" ),

		"mw.KWidgetSupport" => array( 
			'scripts' => "resources/mw.KWidgetSupport.js",
			'dependencies' => array(
				'base64_encode',
				'mw.KApi',
				'mw.KDPMapping'
			)
		),
		"mw.KCuePoints"=> array( 'scripts' => "resources/mw.KCuePoints.js" ),
		"mw.KTimedText"=> array( 'scripts' => "resources/mw.KTimedText.js" ),
		"mw.KAnalytics"=> array( 'scripts' => "resources/mw.KAnalytics.js"),
		"mw.PlaylistHandlerKaltura"=> array( 'scripts' => "resources/mw.PlaylistHandlerKaltura.js" ), 
		"mw.PlaylistHandlerKalturaRss"=> array( 'scripts' => "resources/mw.PlaylistHandlerKalturaRss.js" ),
		
		"mw.KDPMapping"=> array( 'scripts' => "resources/mw.KDPMapping.js" ),
		
		"mw.KApi"=> array( 
			'scripts' => "resources/mw.KApi.js", 
			'dependencies' => array(
				'MD5'
			)	
		),		
		"mw.KAds"=> array( 'scripts' => "resources/mw.KAds.js" ),
		"mw.KAdPlayer"=> array( 'scripts' => "resources/mw.KAdPlayer.js" ),
		"mw.KPPTWidget"=> array( 'scripts' => "resources/mw.KPPTWidget.js" ),
		
		/* playlist */
		"playlistPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/playlistPlugin.js", 
			'dependencies' => array(
				// core playlist module
				"mw.Playlist",
				// kaltura specific playlist modules
				'mw.PlaylistHandlerKaltura',
				'mw.PlaylistHandlerKalturaRss'
			)
		),
		
		
		/* uiConf based plugins */
		"statisticsPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/statisticsPlugin.js",
			'dependencies' => array( 'mw.KAnalytics' ) 
		),
		"faderPlugin"=> array( 'scripts' => "resources/uiConfComponents/faderPlugin.js" ),
		"watermarkPlugin"=> array( 'scripts' => "resources/uiConfComponents/watermarkPlugin.js" ),
		"adPlugin"=> array( 'scripts' => "resources/uiConfComponents/adPlugin.js" ),
		"acPreview"=> array( 'scripts' => "resources/uiConfComponents/acPreview.js" ),
		
		
		"captionPlugin"=> array( 
			'scripts' => "resources/uiConfComponents/captionPlugin.js",
			'dependencies' => array( "mw.TimedText", "mw.KTimedText" )
		),
				
		"bumperPlugin"=> array( 'scripts' => "resources/uiConfComponents/bumperPlugin.js" ),
		"myLogo"=> array( 'scripts' => "resources/uiConfComponents/myLogo.js" ),
		
		"controlbarLayout"=> array( 'scripts' => "resources/uiConfComponents/controlbarLayout.js" ),
		"titleLayout"=> array( 'scripts' => "resources/uiConfComponents/titleLayout.js" ),
		"volumeBarLayout"=> array( 'scripts' => "resources/uiConfComponents/volumeBarLayout.js" ),
		"shareSnippet"=> array( 'scripts' => "resources/uiConfComponents/shareSnippet.js" ),
		"moderationPlugin"=> array( 'scripts' => "resources/uiConfComponents/moderationPlugin.js" ),
        "downloadPlugin"=> array( 'scripts' => "resources/uiConfComponents/downloadPlugin.js" ),
        "captureThumbnailPlugin"=> array( 'scripts' => "resources/uiConfComponents/captureThumbnailPlugin.js" ),
        "jCarouse"=> array( 'scripts' => "resources/uiConfComponents/jcarousellite_1.0.1.js" ),
        "carouselPlugin"=> array( 'scripts' => "resources/uiConfComponents/carouselPlugin.js" ),
        
		// TODO deprecate
		"mw.KLayout"=> array( 'scripts' => "resources/mw.KLayout.js" ),
	);