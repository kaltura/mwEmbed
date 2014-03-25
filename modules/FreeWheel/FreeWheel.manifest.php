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
		Learn more about <a href="http://www.freewheel.tv/">FreeWheel offerings</a>. <br>
		Kaltura supports a full featured FreeWheel ad network integration for both HTML5 and flash players.',
		'attributes' => array(
			'adManagerUrl' =>array(
				'doc' => "The FreeWheel ad manager SWF URL.",
				'label' => 'Ad manager SWF URL',
				'type' => 'url'
			),
			'adManagerJsUrl' => array(
				'doc' => "The FreeWheel ad manager JavaScript URL. Must be set in uiConf not via flashvar.",
				'label' => 'Ad manager JavaScript URL',
				'type' => 'url',
			), 
			'serverUrl' => array(
				'doc' => "The FreeWheel ad server",
				'label' => 'Ad server URL',
				'type' => 'url'
			),
			'networkId' => array(
				'doc' => "The network ID property, for retrieving FreeWheel ads.",
				'type' => 'string'
			),
			'playerProfile' => array(
				'doc' => "The player profile ID for Flash, for identifying the Flash player.",
				'label' => 'Player profile id',
				'type' => 'string'
			),
			'playerProfileHTML5' => array(
				'doc' => "The player profile ID for HTML5, for identifying the HTML5 player",
				'label' => 'Player HTML5 profile ID',
				'type' => 'string'
			),
			'siteSectionId' => array(
				'doc' => "The site section ID used to segment ad retrieval per site section.",
				'type' => 'string'
			), 
			'useKalturaTemporalSlots' => array(
				'doc' => "If Kaltura cuePoints should be used for ad opportunities.",
				'label' => 'Use Kaltura cue points.',
				'type' => 'boolean'
			),
			'videoAssetId' => array(
				'doc' => "Asset ID, for FreeWheel ad targeting.",
				'type' => 'string'
			),
			'videoAssetFallbackId' => array(
				'doc' => "Fallback asset ID, if the initial asset does not have targeting info.",
				'type' => 'string'
			)
		)
	)
);
