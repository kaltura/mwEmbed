<?php
return array(
	"basicDisplay"=> array(
		"label" => "Basic Display",
		"type" => "menu",
		"description" => "Basic settings let you set player name, entry and aspect ratio.",
		"model" => "basicDisplay",
		"icon" => "TabBasicSettings",
		"children"=> array(
			array(
				"label" => "Player's Name",
				"type" => "text",
				"player-refresh"=> false,
				"require"=> true,
				"model" => "name",
				"default" => "New Player",
				"helpnote" => "Please enter your player's name",
				"endline" => "true"
			),
//			array(
//				"label" => "Player Tags",
//				"type" => "tags",
//				"helpnote" => "tags and bugs",
//				"model" => "tags",
//				"source" => "getTags"
//			),
			array(
				"label" => "Preview entry",
				"type" => "select2data",
				"source" => "listEntries",
				"query" => "queryEntries",
				"helpnote" => "testing112143",
				"player-refresh"=> true,
				"endline" => "true",
				"width" => "100%",
				"model" => "~settings.previewEntry",
				"data-placeholder" => "Pick an entry"
			),
			array(
				"player-refresh" => "aspectToggle",
				"options"=> array(
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
				"type" => "dropdown",
				"label" => "Aspect Ratio",
				"endline" => "true",
				"model" => "basicDisplay.aspectRatio"
			),/*
			"sourceSelector" => "",

			array(
				"type" => "featuremenu",
				"model" => "basicDisplay.transport",
				"label" => "Transport",
				"helpnote" => "what do you want to do?",
				"children" => array(
					array(
						"options"=> array(
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
						"type" => "dropdown",
						"label" => "Prefered Bitrate",
						"model" => "basicDisplay.transport.preferedFlavorBR"
					),
					array(
						"options"=> array(
							array(
								"label" => "option",
								"value" => "0.75"
							)
						),
						"initvalue" => "0.75",
						"type" => "dropdown",
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
						"type" => "checkbox",
						"helpnote" => "to check",
						"label" => "Html Controls on iPad",
						"model" => "basicDisplay.deviceSpecific.ipadHTMLcontrols"
					),
					array(
						"type" => "checkbox",
						"label" => "Native Controls Fullscreen",
						"model" => "basicDisplay.deviceSpecific.nativeFullscreenControls"
					)
				)
			),*/
			array(
				"label" => "Last Update",
				"type" => "readonly",
				"filter" => "timeago",
				"helpnote" => "to read",
				"model" => "updatedAt"
			)
		)
	),
	"lookAndFeel"=> array(
		"label" => "Look and Feel",
		"icon" => "TabLookandFeel",
		"description" => "Adjust the visual appearance of the player.",
		"type" => "menu",  
		"model" => "lookAndFeel",
		"children"=> array(
			"titleLabel" => "",
			"share" => "",
			"closedCaptions" => "",
			"watermark" => "",
			"theme" => ""
		)
	),
	"analytics"=> array(
		"label" => "Analytics",
		"icon" => "TabAnalytics",
		"description" => "Kaltura supports robust analytics via the Kaltura platform as well as via 3rd party analytics providers.",
		"type" => "menu",
		"model" => "analytics",
		"children"=> array(
			"akamaiMediaAnalytics" => "",
			"googleAnalytics" => "",
			"comscore" => "",
			"nielsenCombined" => "",
			"omnitureOnPage" => ""
		)
	),
	"monetization"=> array(
		"label" => "Monetization",
		"icon" => "TabMonetization",
		"description" => "The Kaltura platform supports VAST 3.0 as well as 3rd party ad plugins to facilitate content monetization.",
		"type" => "menu",
		"model" => "monitization",
		"children"=> array(
			"bumper" => "",
			"vast" => "",
			"doubleClick" => "",
			"freeWheel" => "",
			"tremor" => ""
		)
	),
	"plugins"=> array(
		"label" => "Plugins",
		"icon" => "TabPlugins",
		"description" => "Additional plugins",
		"type" => "menu",
		"model" => "plugins",
		"children"=> array(
			"chaptersView" => "",
			"playbackRateSelector" => "",
			"restrictUserAgent" => "",
			"widevine" => ""
		)
	)
);
