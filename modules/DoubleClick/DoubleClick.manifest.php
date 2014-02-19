<?php
/**
 * DoubleClick plugin manifest 
*/

return array (
	/** Playlist */
	'doubleClick' => array(
		'label' => 'DoubleClick',
		'description' => 'DoubleClick for Publishers (DFP) Video provides publishers with a platform 
		to increase revenue from video advertising as well as manage costs. Fully integrated with DFP,
		 publishers can now manage their entire display advertising through one platform, with video at its core.
		 Lean more about <a href="http://www.google.com/doubleclick/publishers/solutions/video.html">DFP video solutions</a>',
		'attributes' => array(
			'adTagUrl' => array(
				'label' => 'Ad tag URL',
				'doc' => "The DoubleClick DFP VAST ad tag URL (can include multiple nested VAST URLs). ",
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
				'doc' => 'The contentId, used by DoubleClick plugin API, generally the entry ID, but can also be custom metadata mapping',
				'type' => 'string'
			),
			'publisherId' => array(
				'doc' => "The publisherId, used by DoubleClick plugin api",
				'type' => 'string',
			),
			'customParams' => array(
				'doc' => "Custom parameters passed to the DoubleClick adTag URL. Should be listed as URL parameterss key=value&key2=value2 pairs.",
				'type' => 'string'
			),
			'disableCompanionAds' => array(
				'doc' => "determine if companion ads should be disabled.",
				'type' => 'boolean'
			),
			'videoTagSiblingAd' => array(
				'doc' => "Special flag for HTML5, Set to true for sibling video tag ad loading vs. source swap and single video.g",
				'type' => 'boolean'
			),
			'postSequence'=> array(
				'label' => 'Post sequence index',
				'doc' => "Determine the order DoubleClick should occupy among other post sequence plugins. Set to zero to disable postroll. (This has no effect in themanaged ad player.)",
				'type' => 'number',
			),
			'preSequence'=> array(
				'label' => 'Pre sequence index',
				'doc' => "Determine the order DoubleClick should occupy among other pre sequence plugins. Set to zero to disable preroll. ( This has no effect in managed ad player.)",
				'initvalue' => 1,
				'type' => 'number',
			)
		)
	)
);
