<?php 
	return array(
		"mw.MediaSessionService" =>array(
			'scripts' => array( 'resources/mw.MediaSessionService.js' ),
			'kalturaPluginName' => 'mediaSessionService',
			'dependencies' => array(
				"AdSupport",
				'mw.kAdsMediaSession'
			)
		),
		'mw.kAdsMediaSession' => array(
			'scripts' => array( 'resources/mw.kAdsMediaSession.js')
		)
	);