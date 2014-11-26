<?php 
return array(
	'EmbedPlayer.OverlayControls' => array(
		'type' => 'boolean',
		'doc' => "If the player controls should be overlaid on top of the video. Can also be set to false per embed player via the overlayControls attribute."
	),
	'EmbedPlayer.EnableIpadHTMLControls' => array(
		'type' => 'boolean',
		'doc' => "Set to false to use native device controls on iPad. By default this is true. We use HTML controls on iPad.",
		'description'=> "The Kaltura player supports configuring native controls on iPad."
	),
	'EmbedPlayer.LiveCuepoints' => array(
        'type' => 'boolean',
        'doc' => "Enable/Disable live cuepoints feature."
    ),
    'EmbedPlayer.LiveCuepointsRequestInterval' => array(
        'type' => 'number',
        'doc' => "Live cuepoints polling interval."
    )
);
