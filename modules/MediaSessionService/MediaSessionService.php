<?php 
	return array(
		"mw.MediaSessionService" =>array(
			'scripts' => array( 'resources/mw.MediaSessionService.js' ),
			'kalturaPluginName' => 'mediaSessionService',
			'dependencies' => array(
				"AdSupport",
				'mw.kAdsMediaSession',
				'mw.kAdMediaSessionPlayer'
			)
		),
		'mw.kAdsMediaSession' => array(
			'scripts' => array( 'resources/mw.kAdsMediaSession.js')
		),
		'mw.kAdMediaSessionPlayer' => array(
			'scripts' => array( 'resources/mw.kAdMediaSessionPlayer.js') 
		)
	);