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
                "label" => "Player's ID:",
                "type" => "readonly",
                "player-refresh"=> false,
                "model" => "id"
            ),
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
				"label" => "Preview entry / playlist",
				"type" => "select2data",
				"allow-custom-values" => true,
				"source" => "listEntries",
				"query" => "queryEntries",
				"helpnote" => "Select entry / playlist",
				"player-refresh"=> true,
				"endline" => "true",
				"width" => "100%",
				"model" => "~selectedEntry",
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
					),
                    array(
                        "label" => "Custom",
                        "value" => "custom"
                    )
				),
				"showSearch"=> false,
				"allowNegative"=> false,
				"helpnote" => "Set Player Dimensions",
				"helpnote2" => "Height will be automatically calculated according to the selected aspect ratio",
				"type" => "dimensions",
				"label" => "Player Dimensions",
				"endline" => "true"
			),
			array(
				"label" => "Automatically play video on page load",
				"type" => "checkbox",
				"endline" => "true",
				"model" => "config.uiVars.autoPlay"
			),
			array(
				"label" => "Start player muted",
				"type" => "checkbox",
				"endline" => "true",
				"model" => "config.uiVars.autoMute"
			),
			array(
                "label" => "Hovering controls",
                "type" => "checkbox",
                "endline" => "true",
                "model" => "config.plugins.controlBarContainer.hover"
            ),
//            array(
//               "label" => "Localization code:",
//                "type" => "text",
//                "size" => "small",
//                "endline" => "true",
//                "model" => "config.enviornmentConfig.localizationCode"
//            ),
			array(
				"label" => "Last Update",
				"type" => "readonly",
				"filter" => "timeago",
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
			array(
                "label" => "Show tooltips",
                "type" => "checkbox",
                "initvalue" => true,
                "endline" => "false",
                "model" => "config.uiVars.enableTooltips"
            ),
//            array(
//                "label" => "Simulate Mobile",
//                "type" => "checkbox",
//                "initvalue" => false,
//                "endline" => "false",
//                "model" => "config.uiVars.EmbedPlayer.SimulateMobile"
//            ),
			"titleLabel" => "",
			"logo" => "",
			"loadingSpinner" => "",
			"volumeControl" => "",
			"closedCaptions" => "",
			"cvaa" => "",
			"watermark" => "",
			"theme" => "",
			"infoScreen" => "",
			"share" => "",
			"playersJsReceiver" => "",
			"related" => "",
			"dualScreen" => "",
			"playlistAPI" => "",
			"nextPrevBtn" => ""
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
			"omnitureOnPage" => "",
			"statistics" => "",
			"youbora" => ""
		)
	),
	"monetization"=> array(
		"label" => "Monetization",
		"icon" => "TabMonetization",
		"description" => "The Kaltura platform supports VAST 3.0 as well as 3rd party ad plugins to facilitate content monetization.",
		"type" => "menu",
		"model" => "monitization",
		"children"=> array(
			array(
                "label" => "Display ads on replay",
                "type" => "checkbox",
                "initvalue" => true,
                "endline" => "false",
                "model" => "config.uiVars.adsOnReplay"
            ),
			"bumper" => "",
			"vast" => "",
			"doubleClick" => "",
			"freeWheel" => "",
			"skipBtn" => "",
            "skipNotice" => "",
            "noticeMessage" => ""
		)
	),
	"plugins"=> array(
		"label" => "Plugins",
		"icon" => "TabPlugins",
		"description" => "Additional plugins",
		"type" => "menu",
		"model" => "plugins",
		"children"=> array(
			/*"chaptersView" => "",*/
			"keyboardShortcuts" => "",
			"moderation" => "",
			"playbackRateSelector" => "",
			"restrictUserAgent" => "",
			"multiDrm" => "",
			"sourceSelector" => "",
			"download" => "",
			"strings" => "",
			"uiVars" => ""
		)
	)
);
