<?php
/**
 * Widevine plugin manifest 
*/

return array (
	'widevine' => array(
		'description' => 'Widevine',
		'attributes' => array(
			'useSupportedDeviceMsg' => array(
				'doc' => "Will override the default message text when trying to play Widevine content in an unsupported device.",
				'type' => 'string'
			),
			'useSupportedDeviceTitle' => array(
				'doc' => "Will override the default title of the message that is displayed when trying to play Widevine content in an unsupported device.",
				'type' => 'string'
			),
			'intallFlashMsg' => array(
				'doc' => "Will override the message that prompts the user to install Flash.",
				'type' => 'string'
			),
			'installFlashTitle' => array(
				'doc' => "Will override the title of the message that prompts the user to install Flash.",
				'type' => 'string'
			),
			'useKdpMsg' => array(
				'doc' => "Will override the message that prompts the user to use KDP.",
				'type' => 'string'
			),
			'useKdpTitle' => array(
				'doc' => "Will override the title of the message that prompts the user to use KDP.",
				'type' => 'string'
			),
			'promptStyle' => array(
				'doc' => "Will Override the default Widevine prompt message style.",
				'type' => 'string'
			),
			'promptText' => array(
				'doc' => "Will Override the default Widevine prompt message.",
				'type' => 'string'
			),
			'promptLinkText ' => array(
				'doc' => "Will Override the default Widevine download link text.",
				'type' => 'string'
			)
		)
	)
);
