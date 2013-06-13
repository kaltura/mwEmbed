<?php

class uiConfLayout {

	const PLAYER_CONTAINER   = 'PlayerContainer';
	const VIDEO_HOLDER       = 'VideoHolder';
	const CONTROLS_CONTAINER = 'ControlBarContainer';
	const CONTROL_BAR_ID	 = 'Controls';

	var $componentsIds = array(
		'largePlay'        => 'htmlLargePlayBtn',
		'replay'           => 'htmlReplay',
		'play'             => 'htmlPlayBtn',
		'fullscreen'       => 'htmlFullScreenBtn',
		'Scrubber'         => 'htmlScrubber',
		'currentTimeLabel' => 'htmlCurrentTimeLabel',
		'durationLabel'    => 'htmlDurationLabel',
		'volumeBar'        => 'htmlVolumeBar',
		'flavorSelector'   => 'htmlFlavorSelector',
		'kalturaLogo'      => 'htmlKalturaLogo',
	);

	// When grabbing node attributes, only take what we need 
	var $allowedAttributes = array(
		'kClick', 
		'width', 
		'height', 
		'visible', 
		'label', 
		'format',
	);

	function __construct( $xml, $nodes ) {

		$this->xml = $xml;
		$this->nodes = $nodes;

		$this->setupMapping();
		$this->transform();
	}

	function setupMapping()
	{
		$this->nodeMapping = array(

		'#ControllerScreen' => array(
			'components' => array(
				array(
					'type'       => "Container",
					'id'         => self::CONTROL_BAR_ID,
					'relativeTo' => self::CONTROLS_CONTAINER,
					'position'   => "firstChild",
				)
			)
		),

		'#playBtnControllerScreen' => array(
			'components' => array(
				array(
					'type'        => "ToggleButton",
					'id'          => $this->componentsIds['play'],
					'state'       => "playerStatus.isPlaying()",					
					'actionOn'    => 'doPause',
					'actionOff'   => 'doPlay',
					'cssClass'    => "btn",
					'cssClassOn'  => "icon-pause",
					'cssClassOff' => "icon-play",
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "firstChild"
				)
			)
		),

		'#fullScreenBtnControllerScreen' => array(
			'components' => array(
				array(
					'type'        => "ToggleButton",
					'id'          => $this->componentsIds['fullscreen'],
					'state'       => "playerStatus.isInFullScreen()",
					'actionOn'    => "closeFullScreen",
					'actionOff'   => "openFullScreen",
					'cssClass'    => "btn pull-right",
					'cssClassOn'  => "icon-contract",
					'cssClassOff' => "icon-expand",
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",
				)
			)
		),

		'#scrubber'	=> array(
			'components' => array(
				array(
					'type' => "Scrubber",
					'id'   => $this->componentsIds['Scrubber'],
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",					
				)
			)
		),

		'#timerControllerScreen1' => array(
			'components' => array(
				array(
					'type' => "Label",
					'id'   => $this->componentsIds['currentTimeLabel'],
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",
				)
			)
		),
		'#timerControllerScreen2' => array(
			'components' => array(
				array(
					'type' => "Label",
					'id'   => $this->componentsIds['durationLabel'],
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",					
				)
			)
		),

		'#volumeBar' => array(
			'components' => array(
				array(
					'type' => "VolumeBar",
					'id'   => $this->componentsIds['volumeBar'],
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",					
				)
			)
		),

		'#flavorComboControllerScreen' => array(
			'components' => array(
				array(
					'type' => "FlavorSelector",
					'id'   => $this->componentsIds['flavorSelector'],
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",					
				)
			)
		),
		'#kalturaLogo' => array(
			'components' => array(
				array(
					'type' => "Button",
					'id'   => $this->componentsIds['kalturaLogo'],
					'href' => "http://www.kaltura.com/",
					'relativeTo'  => self::CONTROL_BAR_ID,
					'position'	  => "lastChild",					
				)
			)
		),
	);

	}

	function transform() 
	{
		$components = array();

		foreach( $this->nodeMapping as $selector => $mapper ) {
			$node = $this->findNode( $selector );
			if( $node ) {
				$nodeAttrs = $this->getAttributes($node);
				foreach( $mapper['components'] as $component ) {
					$components[] = array_merge($nodeAttrs, $component);
				}
			}
		}

		$this->components = $components;

		$this->addOnPlayerButtons();

		//print_r($this->components);

		//exit();
	}

	function addOnPlayerButtons() 
	{
		$showStates = array();
		if( $this->findNode('#onVideoPlayBtnStartScreen') ) {
			$showStates[] = 'start';
		}
		if( $this->findNode('#onVideoPlayBtnPauseScreen') ) {
			$showStates[] = 'pause';
		}

		if( count($showStates) ) {
			$showStates = json_encode($showStates);
			$this->components[] = array(
				'type'       => "Button",
				'id'         => $this->componentsIds['largePlay'],
				'action'     => "doPlay",
				'kShow'      => "playerStatus.isState($showStates)",
				'cssClass'   => 'btn-large icon-play-2',
				'relativeTo' => self::VIDEO_HOLDER,
				'position'   => "firstChild",
			);
		}

		if( $this->findNode('#replayBtnEndScreen') ) {
			$this->components[] = array(
				'type'       => "Button",
				'id'         => $this->componentsIds['replay'],
				'action'     => "doPlay",
				'kShow'      => "playerStatus.isState('end')",
				'cssClass'   => 'btn-large icon-spinner',
				'relativeTo' => self::VIDEO_HOLDER,
				'position'   => "firstChild",				
			);
		}
	}

	function findNode( $selector = null )
	{
		$id = substr($selector, 1, strlen($selector));
		return $this->getElementById( $id );
	}

	function getElementById($id)
	{
		$node = $this->xml->xpath("//*[@id='" . $id . "']");
		if( is_array($node) && count($node) == 0 ) {
			return null;
		}
	    return $node[0];
	}

	function getAttributes( $node ) 
	{
		$attributes = array();
		foreach($this->allowedAttributes as $attr) {
			if( isset($node->attributes()->$attr) ) {
				$attributes[ $attr ] = (string) $node->attributes()->$attr;
			}
		}
		return $attributes;
	}

	function getComponents()
	{
		return $this->components;
	}
}