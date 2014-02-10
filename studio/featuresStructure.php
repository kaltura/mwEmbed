<?php
return array(
	"basicDisplay"=> array(
		"label" => "Basic Display",
		"type" => "menu",
		"description" => "Basic settings let you set player name, entry and aspect ratio",
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
				"helpnote" => "Select entry",
				"player-refresh"=> true,
				"endline" => "true",
				"width" => "100%",
				"model" => "~settings.previewEntry",
				"data-placeholder" => "Pick a entry"
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
				"helpnote" => "Select aspect ratio",
				"type" => "dropdown",
				"label" => "Aspect Ratio",
				"endline" => "true",
				"model" => "basicDisplay.aspectRatio"
			),
			array(
				"label" => "Last Update",
				"type" => "readonly",
				"filter" => "timeago",
				"model" => "updatedAt"
			),
            array(
				"label" => "Auto play",
				"type" => "checkbox",
				"model" => "config.uiVars.autoPlay"
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
		"description" => "Kalturas supports robust analytics via the kaltura platform as well as via 3rd party analytics providers.",
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
		"description" => "The Kaltura platform support VAST 3.0 as well as 3rd party ad plugins to facilitate content monetization",
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
			"restrictUserAgent" => ""
		)
	)
);
