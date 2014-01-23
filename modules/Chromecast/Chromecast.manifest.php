<?php 
/**
 * The ExternalPlayers plugin manifest
 */
return array(
	'chromecast' => array(
		'description' => "The Chromecast extension enables sending your video to Chromecast device,
			where the <a target=\"_new\" href=\"https://chrome.google.com/webstore/detail/google-cast/\">chromecast extension</a> is installed",
		'attributes'=> array(
			'webDebugMode' => array(
				'doc'=> "Enables you to test chromecast support via popup window in web view, instead of on a chromecast device. 
					This mode does not require the chromecast extension"
			)
			
		)
	)
);