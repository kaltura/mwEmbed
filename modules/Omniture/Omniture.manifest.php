<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	'siteCatalyst15' => array(
		'description' => "SiteCatalyst15 kaltura analytics implmentation. SiteCatalyst15 support dynamic set of attributes based on what events you wish to track and what data you want to assoicate with each event.",
		'attributes'=> array(
			'sCodePath' => array(
				'doc' => 'The url to the Ominture gennerated sCode file. If null a local copy of s_code.js is used',
				'type' => 'url',
			),
			'trackingServer'  => array(
				'doc' => 'The Ominture tracking server',
				'type' => 'string',
			), 
			'visitorNamespace'  => array(
				'doc' => 'The visitor namespace i.e "corp1", per Ominture documentation',
				'type' => 'string',
			),
			'account' => array(
				'doc' => 'The omniture account id',
				'type' => 'string',
			),
			'segmentByMilestones' => array(
				'doc' => 'If events should be segmented by milestones',
				'type' => 'bollean',
			),
			'contentType' => array(
				'doc' => 'The media content type eVar mapping',
				'type' => 'string',
			), 
			'timePlayed' => array(
				'doc' => 'Timed played, eEvent mapping',
				'type' => 'string',
			), 		
			'mediaName' => array(
				'doc' => 'The MediaName eVar mapping',
				'type' => 'string',
			), 
			'mediaSegment' => array(
				'doc' => 'The media segment eVar mapping',
				'type' => 'string',
			), 
			'mediaSegmentView' => array(
				'doc' => 'The media segment view event mapping',
				'type' => 'string',
			), 
			'mediaView' => array(
				'doc' => 'The media view, event mapping',
				'type' => 'string',
			), 
			'mediaComplete' => array(
				'doc' => 'The media complete event mapping',
				'type' => 'string',
			), 
	
			'trackMilestones' => array(
				'doc' => 'The milestone targets to be tracked',
				'type' => 'string',
			), 
			'milestonesEvents' => array(
				'doc' => 'The milestone event mappings',
				'type' => 'string',
			), 
	
			'playerLoadedEvent' => array(
				'doc' => 'The player loaded event mapping',
				'type' => 'string',
			), 
			'playerLoadedEventEvar1' => array(
				'doc' => 'Player loaded associated event data name',
				'type' => 'string',
			), 
			'playerLoadedEventEvar1Value' => array(
				'doc' => 'The evaluated value of the assoicated event mapping',
				'type' => 'string',
			), 
	
			'openFullscreenEvent' => array(
				'doc' => 'The open fullscreen event mapping',
				'type' => 'string',
			), 
			'openFullscreenEvar1' => array(
				'doc' => 'The asscoiated event name for openFullscreen event',
				'type' => 'string',
			), 
			'openFullscreenEvar1Value'=> array(
				'doc' => 'The assciated event data for openFullscreen event',
				'type' => 'string',
			), 
	
			'shareEvent'  => array(
				'doc' => 'The shareEvent mapping',
				'type' => 'string',
			), 
			'shareEventEvar1' =>  array(
				'doc' => 'An assciated event name for shareEvent',
				'type' => 'string',
			),
			'shareEventEvar1Value' =>  array(
				'doc' => 'The assciated event data for shareEvent event',
				'type' => 'string',
			),
			'shareEventProp1'  =>  array(
				'doc' => 'A named property to send with the share event',
				'type' => 'string',
			),
			'shareEventprop1Value' =>  array(
				'doc' => 'A property value to send with the share event',
				'type' => 'string',
			), 
			
			'shareEventEvar2' =>  array(
				'doc' => 'A secondary associated even name',
				'type' => 'string',
			),  
			'shareEventEvar2Value'  =>  array(
				'doc' => 'A secondary associated even value',
				'type' => 'string',
			), 
			'shareEventProp2' =>   array(
				'doc' => 'A named property to send with the share event',
				'type' => 'string',
			),
			'shareEventprop2Value' =>  array(
				'doc' => 'A property value to send with the share event',
				'type' => 'string',
			), 
		)
	)
);