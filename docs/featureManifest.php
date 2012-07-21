<?php 
	return array(
			'Embeding'  => array( 
				array(
					'title' => 'Object rewrite',
					'hash' => 'rewrite',
					'path' => '../KalturaSupport/tests/BasicPlayer.qunit.html'
				),
				array(
					'title' => 'kWidget embed',
					'hash' => 'kwidget', 
					'path' => '../KalturaSupport/tests/KWidget.embed.qunit.html'
				),
				array( 
					'title' => 'Thumbnail embed',
					'hash' => 'thumb',
					'path' => '../KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html',
				),
				array( 
					'title' => 'kWidget playlist',
					'hash' => 'kwidget-playlist',
					'path' => '../KalturaSupport/tests/kWidget.embed.playlist.qunit.html'
 				)
			),
			'Analytics' => array(
				array( 
					'title' => 'Kaltura Analytics',
					'hash' => 'kanalytics',
					'path' => '../KalturaSupport/tests/KalturaAnalytics.qunit.html',
				),
			)
	);