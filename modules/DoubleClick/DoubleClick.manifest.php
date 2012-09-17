<?php
/**
 * DoubleClick plugin manifest 
*/

return array (
	/** Playlist */
	'doubleClick' => array(
		'description' => 'The DoubleClick ad provider.',
		'attributes' => array(
			'adTagUrl' => array(
				'doc' => "The DoubleClick DFP vast ad tag url ( can include multiple nested vast urls ) ",
				'type' => 'url'
			),
			'cmsId' => array(
				'doc' => "The content id, apended to vast url, used by DoubleClick plugin api",
				'type' => 'number'
			),
			'adType' => array(
				'doc' => "The adType id, used by DoubleClick plugin api",
				'type' => 'string'
			),
			'channels' => array(
				'doc' => "The channels id, used by DoubleClick plugin api",
				'type' => 'string'
			),
			'contentId' => array(
				'doc' => 'The contentId, used by DoubleClick plugin api, genneraly the entry id, but can also be custom metadata mapping',
				'type' => 'string'
			),
			'publisherId' => array(
				'doc' => "The publisherId, used by DoubleClick plugin api"
			),
			'customParams' => array(
				'doc' => "Custom params passed to the DoubleClick adTag url",
				'type' => 'string'
			),
			'disableCompanionAds' => array(
				'doc' => "if companion ads should be disabled",
				'type' => 'boolean'
			),
			'videoTagSiblingAd' => array(
				'doc' => "Special flag for html5, Set to true for sibling video tag ad loading vs. source swap and single video tag",
				'type' => 'boolean'
			),
			'postSequence'=> array(
				'doc' => "The post sequence index, what order DoubleClick should ocupy among other post sequence plugins. Set to zero to dissable postroll",
				'type' => 'number',
			),
			'preSequence'=> array(
				'doc' => "The pre sequence index, what order DoubleClick should ocupy among other pre sequence plugins. Set to zero to dissable preroll",
				'type' => 'number',
			),
			'trackCuePoints' => array(
				'doc' => "If entry cuepoints should be tracked for DoubleClick cue points / vast urls",
				'type' => 'boolean'
			)
		)
	)
);