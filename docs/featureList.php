<?php 
	return array(
			'Embeding'  => array( 
				'title' => 'Embeding the kaltura player',
				'desc' => 'These files cover basic embeding from <a href="#rewrite">legacy</a> object embed, to the dynamic <a href="#kwidget">kWidget</a> embed method', 
				'testfiles' =>array(
					array(
						'title' => 'kWidget embed',
						'hash' => 'kwidget', 
						'path' => 'KalturaSupport/tests/kWidget.embed.qunit.html'
					),
					array(
							'title' => 'Object rewrite',
							'hash' => 'rewrite',
							'path' => 'KalturaSupport/tests/BasicPlayer.qunit.html'
					),
					array( 
						'title' => 'Thumbnail embed',
						'hash' => 'thumb',
						'path' => 'KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html',
					),
					array( 
						'title' => 'kWidget playlist',
						'hash' => 'kwidget-playlist',
						'path' => 'KalturaSupport/tests/kWidget.embed.playlist.qunit.html'
	 				)
	 			)
			),
			'Analytics' => array(
				'title' => 'Kaltura Analytics providers',
				'desc' => 'The Kaltura player supports several systems for tracking video playback',
				'testfiles' => array(
					array( 
						'title' => 'Kaltura Analytics',
						'hash' => 'kanalytics',
						'path' => 'KalturaSupport/tests/KalturaAnalytics.qunit.html',
					),
					array(
						'title' => 'Google Analytics',
						'hash' => 'GoogleAnalytics',
						'path' => 'GoogleAnalytics/tests/GoogleAnalytics.qunit.html',
					),
					array(
						'title' => 'Comscore Analytics',
						'hash' => 'ComscoreAnalytics',
						'path' => 'Comscore/tests/Comscore.html',
					),
					array(
						'title' => 'Nielsen Combined',
						'hash' => 'NielsenCombined',
						'path' => 'NielsenCombined/tests/NielsenCombinedPlayer.html',
					),
					array(
						'title' => 'Nielsen Combined & FreeWheel',
						'hash' => 'NielsenCombinedFreeWheel',
						'path' => 'NielsenCombined/tests/IntegrationFreeWheelNielsen.html',
					),
					array(
						'title' => 'Nielsen VideoCensus',
						'hash' => 'NielsenVideoCensus',
						'path' => 'NielsenVideoCensus/tests/ShortFromNielsenVideoCensus.html',
					),
					array(
						'title' => 'Nielsen VideoCensus & FreeWheel',
						'hash' => 'NielsenVideoCensus',
						'path' => 'NielsenVideoCensus/tests/LongFormNielsenVideoCensusPluginFreeWheel.html',
					),
					array(
						'title' => 'Omniture SiteCatalyst 15',
						'hash' => 'OmnitureSiteCatalyst15',
						'path' => 'Omniture/tests/siteCatalyst15.qunit.html',
					)
				)
			)
	);