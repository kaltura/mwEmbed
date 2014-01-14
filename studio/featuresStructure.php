<?php 
return array(
	"basicDisplay"=> array(
		"label" => "Basic Display",
		"type" => "menu",
		"description" => "Basic settings let you set player name, tags, and other player properties",
		"model" => "basicDisplay",
		"icon" => "TabBasicSettings",
		"children"=> array(
			array(
				"label" => "Player's Name",
				"type" => "text",
				"player-refresh"=> false,
				"model" => "name",
				"default" => "New Player",
				"helpnote" => "Please enter your player's name",
				"endline" => "true"
			),
			array(
				"label" => "Player Tags",
				"type" => "tags",
				"helpnote" => "tags and bugs",
				"model" => "tags",
				"source" => "getTags"
			),
			array(
				"label" => "Preview entry",
				"type" => "select2data",
				"source" => "listEntries",
				"query" => "queryEntries",
				"helpnote" => "testing112143",
				"player-refresh"=> true,
				"endline" => "true",
				"width" => "100%",
				"model" => "previewentry",
				"data-placeholder" => "Pick a entry"
			),
			array(
				"player-refresh" => "aspectToggle",
				"enum"=> array(
					array(
						"label" => "4/3",
						"value" => "narrow"
					),
					array(
						"label" => "16/9",
						"value" => "wide"
					)
				),
				"showSearch"=> false,
				"initvalue" => "wide",
				"helpnote" => "select whatever",
				"type" => "enum",
				"label" => "Aspect Ratio",
				"endline" => "true",
				"model" => "basicDisplay.aspectRatio"
			),
			array(
				"type" => "featuremenu",
				"model" => "basicDisplay.transport",
				"label" => "Transport",
				"helpnote" => "what do you want to do?",
				"children" => array(
					array(
						"enum"=> array(
							array(
								"label" => "2mbs",
								"value" => 2
							),
							array(
								"label" => "1mbs",
								"value" =>  1
							)
						),
						"initvalue"=> 1,
						"type" => "enum",
						"label" => "Prefered Bitrate",
						"model" => "basicDisplay.transport.preferedFlavorBR"
					),
					array(
						"enum" => array(
							array(
								"label" => "option",
								"value" => "0.75"
							)
						),
						"initvalue" => "0.75",
						"type" => "enum",
						"label" => "Delivery type",
						"model" => "basicDisplay.transport.deliveryType"
					)
				)
			),
			array(
				"type" => "featuremenu",
				"model" => "basicDisplay.deviceSpecific",
				"label" => "Device Specific Flags",
				"children"=> array(
					array(
						"type" => "boolean",
						"helpnote" => "to check",
						"label" => "Html Controls on iPad",
						"model" => "basicDisplay.deviceSpecific.ipadHTMLcontrols"
					),
					array(
						"type" => "boolean",
						"label" => "Native Controls Fullscreen",
						"model" => "basicDisplay.deviceSpecific.nativeFullscreenControls"
					)
				)
			),
			array(
				"label" => "Last Update",
				"type" => "readonly",
				"filter" => "timeago",
				"helpnote" => "to read",
				"model" => "updatedAt"
			),
			array(
				"label" => "Version:",
				"btn-label" => "Update Player",
				"type" => "infoAction",
				"helpnote" => "this is the players version",
				"btn-class" => "btn-xs btn-primary",
				"action" => "update",
				"model" => "version"
			)
		)
	),
	"lookAndFeel"=> array(
		"label" => "Look and Feel",
		"icon" => "TabLookandFeel",
		"description" => "Adjust the visual appearance of the player",
		"type" => "menu",  
		"model" => "lookAndFeel",
		"children"=> array(
			"watermark" => "",
			"restrictUserAgent" => ""
		)
	),
	"analytics"=> array(
		"label" => "analytics",
		"icon" => "TabAnalytics",
		"description" => "Kalturas supports robust analytics via the kaltura platform as well as via 3rd party analytics providers.",
		"type" => "menu",
		"model" => "monitization",
		"children"=> array(
			"vast" => ""
		)
	),
	"monitization"=> array(
		"label" => "Monitization",
		"icon" => "TabMonetization",
		"description" => "Monitization pays the bills",
		"type" => "menu",
		"model" => "monitization",
		"children"=> array(
			"vast" => ""
		)
	),
	"plugins"=> array(
		"label" => "Plugins",
		"icon" => "TabPlugins",
		"description" => "Plugins make it more useful",
		"type" => "menu",
		"model" => "plugins",
		"children"=> array()
	)
);