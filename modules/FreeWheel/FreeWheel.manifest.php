<?php
/**
 * FreeWheel plugin manifest 
*/

return array (
	/** Playlist */
	'FreeWheel' => array(
		'description' => 'FreeWheel gives enterprise-level media companies the infrastructure they 
		need to create scaled, profitable content businesses in the new media landscape. 
		Lean more about <a href="http://www.freewheel.tv/">FreeWheel offerings</a>. <br>
		Kaltura supports a full featured FreeWheel ad network integration for both HTML5 and flash players.',
		'attributes' => array(
			'adManagerUrl' =>array(
				'doc' => "The freeWheel ad mannager swf url",
				'type' => 'url'
			),
			'adManagerJsUrl' => array(
				'doc' => "The freeWheel ad manager javascript url. Must be set in uiConf not via flashvar.",
				'type' => 'urlJS',
			), 
			'serverUrl' => array(
				'doc' => "The freewheel ad server",
				'type' => 'url'
			),
			'networkId' => array(
				'doc' => "The network id property, for retrieving freeWeel ads",
				'type' => 'string'
			),
			'playerProfile' => array(
				'doc' => "The player profile id for flash, for identifying the flash player",
				'type' => 'string'
			),
			'playerProfileHTML5' => array(
				'doc' => "The player profile id for HTML5, for identifying the html5 player",
				'type' => 'string'
			),
			'siteSectionId' => array(
				'doc' => "The site section id, to segment ad retrieval per site section",
				'type' => 'string'
			), 
			'useKalturaTemporalSlots' => array(
				'doc' => "If kaltura cuePoints should be used for ad opportunities",
				'type' => 'boolean'
			),
			'videoAssetId' => array(
				'doc' => "Asset id, for freewheel ad targeting",
				'type' => 'string'
			),
			'videoAssetFallbackId' => array(
				'doc' => "Fallback asset id, if the initial asset does not have targeting info",
				'type' => 'string'
			)
		)
	)
);