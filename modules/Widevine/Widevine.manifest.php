<?php
/**
 * Widevine plugin manifest 
*/

return array (
	'widevine' => array(
	 	'description' => 'The Widevine plugin provides a DRM solution for Kaltura content. Initially, the Kaltura player checks for the Widevine browser plugin and displays a message with a download link if this plugin is missing. <a href="http://www.widevine.com/wv_drm.html" target="_blank"> More info </a>',
		'attributes' => array(
			'useSupportedDeviceMsg' => array(
				'label' => "Use supported device message",
				'doc' => "Overrides the default message text when trying to play Widevine content in an unsupported device.",
				'type' => 'string',
				'initvalue' => "This video requires Adobe Flash Player, which is not supported by your device. You can watch it on devices that support Flash."
			),
			'useSupportedDeviceTitle' => array(
				'doc' => "Overrides the default title of the message that is displayed when trying to play Widevine content in an unsupported device.",
				'type' => 'string',
				'initvalue'=> "Notification"
			),
			'intallFlashMsg' => array(
				'label' => "Install Flash message",
				'doc' => "Overrides the message that prompts the user to install Flash.",
				'type' => 'string',
				'initvalue' => "This video requires Adobe Flash Player, which is currently not available on your browser. Please <a href='http://www.adobe.com/support/flashplayer/downloads.html' target='_blank'> install Adobe Flash Player </a> to view this video."
			),
			'installFlashTitle' => array(
				'label' => "Install Flash title",
				'doc' => "Overrides the title of the message that prompts the user to install Flash.",
				'type' => 'string',
				'initvalue' => "Notification"
			),
			'useKdpMsg' => array(
				'label' => "Use KDP message",
				'doc' => "Overrides the message that prompts the user to use KDP.",
				'type' => 'hiddenValue',
				'initvalue' => "This video requires Adobe Flash enabled player."
			),
			'useKdpTitle' => array(
				'label' => "Use KDP title",
				'doc' => "Overrides the title of the message that prompts the user to use KDP.",
				'type' => 'hiddenValue',
				'initvalue' => "Notification"
			),
			'promptStyle' => array(
				'doc' => "CSS Overrides the default Widevine prompt message style.",
				'type' => 'string',
				'initvalue' => "border:solid 1px #eeeeee; position:fixed; z-index:1000; width:100%; height:40px; color:#505050; background-color:#FDFFDB; top:0px; right:0px; left:0px; font-family:arial; font-size:12px;"
			),
			'promptText' => array(
				'doc' => "Overrides the default Widevine prompt message.",
				'type' => 'string',
				'initvalue' => "Widevine Video Optimizer plugin is needed for enabling video playback in this page. "
			),
			'promptLinkText' => array(
				'doc' => "Overrides the default Widevine download link text.",
				'type' => 'string',
				'initvalue' => "Get Video Optimizer"
			)
		)
	)
);
