<?php
/**
 * FreeWheel plugin manifest 
*/

return array (
	/** Playlist */
	'freeWheel' => array(
		'label' => 'FreeWheel',
		'description' => 'FreeWheel gives enterprise-level media companies the infrastructure they 
		need to create scaled, profitable content businesses in the new media landscape. 
		Lean more about <a href="http://www.freewheel.tv/">FreeWheel offerings</a>. <br>
		Kaltura supports a full featured FreeWheel ad network integration for both HTML5 and flash players.',
		'attributes' => array(
			'adManagerUrl' =>array(
				'doc' => "The FreeWheel ad manager swf url",
				'label' => 'Ad manager SWF URL',
				'type' => 'url'
			),
			'adManagerJsUrl' => array(
				'doc' => "The FreeWheel ad manager javascript url. Must be set in uiConf not via flashvar.",
				'label' => 'Ad manager Javascript URL',
				'type' => 'url',
			), 
			'serverUrl' => array(
				'doc' => "The Freewheel ad server",
				'label' => 'Ad server URL',
				'type' => 'url'
			),
			'networkId' => array(
				'doc' => "The network id property, for retrieving freeWeel ads",
				'type' => 'string'
			),
			'playerProfile' => array(
				'doc' => "The player profile id for flash, for identifying the flash player",
				'label' => 'Player profile id',
				'type' => 'string'
			),
			'playerProfileHTML5' => array(
				'doc' => "The player profile id for HTML5, for identifying the html5 player",
				'label' => 'Player HTML5 profile id',
				'type' => 'string'
			),
			'siteSectionId' => array(
				'doc' => "The site section id, to segment ad retrieval per site section",
				'type' => 'string'
			), 
			'useKalturaTemporalSlots' => array(
				'doc' => "If Kaltura cuePoints should be used for ad opportunities",
				'label' => 'Use Kaltura cue points',
				'type' => 'boolean'
			),
			'videoAssetId' => array(
				'doc' => "Asset ID, for Freewheel ad targeting",
				'type' => 'string'
			),
			'videoAssetFallbackId' => array(
				'doc' => "Fallback asset ID, if the initial asset does not have targeting info",
				'type' => 'string'
			)
		)
	)
);