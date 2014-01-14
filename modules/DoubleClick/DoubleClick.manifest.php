<?php
/**
 * DoubleClick plugin manifest 
*/

return array (
	/** Playlist */
	'doubleClick' => array(
		'description' => 'DoubleClick for Publishers (DFP) Video provides publishers with a platform 
		to increase revenue from video advertising as well as manage costs. Fully integrated with DFP,
		 publishers can now manage their entire display advertising through one platform, with video at its core.
		 Lean more about <a href="http://www.google.com/doubleclick/publishers/solutions/video.html">DFP video solutions</a>',
		'attributes' => array(
			'adTagUrl' => array(
				'doc' => "The DoubleClick DFP vast ad tag url ( can include multiple nested vast urls ) ",
				'type' => 'url'
			),
			//'adPattern' add me
			/*'cmsId' => array(
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
			),*/
			'contentId' => array(
				'doc' => 'The contentId, used by DoubleClick plugin api, generally the entry id, but can also be custom metadata mapping',
				'type' => 'string'
			),
			'publisherId' => array(
				'doc' => "The publisherId, used by DoubleClick plugin api",
				'type' => 'string',
			),
			'customParams' => array(
				'doc' => "Custom params passed to the DoubleClick adTag url. Should be listed as url params key=value&key2=value2 pairs.",
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
				'doc' => "The post sequence index, what order DoubleClick should occupy among other post sequence plugins. Set to zero to disable postroll. ( has no effect in managed ad player )",
				'type' => 'number',
			),
			'preSequence'=> array(
				'doc' => "The pre sequence index, what order DoubleClick should occupy among other pre sequence plugins. Set to zero to disable preroll. ( has no effect in managed ad player )",
				'type' => 'number',
			),
			'trackCuePoints' => array(
				'doc' => "If entry cuepoints should be tracked for DoubleClick cue points / vast urls",
				'type' => 'boolean'
			)
		)
	)
);
