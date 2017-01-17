<?php
$uiVars = array(
	'services' => array(
		'desc' => "Kaltura service variables define define respective Kaltura API configuration.",
		'vars' => array(
			'Kaltura.ServiceUrl' => array(
				'type' => 'String',
				'desc' => 'The API service URL, used to for all API calls. Can be overwritten for on-prem or api proxy setups.',
				'default' => 'http://cdnapi.kaltura.com',
				'example' => ''
			),
			'Kaltura.ServiceBase' => array(
					'type' => 'String',
					'desc' => 'URL Path on the server to the API services.',
					'default' => '/api_v3/index.php?service=',
					'example' => ''
			),
			'Kaltura.StatsServiceUrl' => array(
					'type' => 'String',
					'desc' => 'The URL used for all Kaltura analytics events.',
					'default' => 'http://stats.kaltura.com',
					'example' => ''
			),
			'Kaltura.NoApiCache' => array(
					'type' => 'String',
					'desc' => 'Set to true to disable the player API cache.',
					'default' => 'false',
					'example' => ''
			),
			'Kaltura.ForceIframeEmbed' => array(
					'type' => 'String',
					'desc' => 'Set to true to force iframe output with player API. Useful for simulating iframe syndication environment.',
					'default' => 'false',
					'example' => ''
			),
			'Kaltura.KWidgetPsPath' => array(
					'type' => 'String',
					'desc' => 'Used to append path to additional library of professional service scripts and plugins, that are outside the mwEmbed repository. ',
					'default' => '../kwidget-ps/',
					'example' => ''
			),
			'Kaltura.AllowIframeRemoteService' => array(
					'type' => 'String',
					'desc' => 'By default external API service URLs are not allowed, set this to true to allow them',
					'default' => 'false',
					'example' => ''
			),
			'Kaltura.ForceFlashOnDesktop' => array(
					'type' => 'String',
					'desc' => 'If the player should be forced to use flash on desktop (kdp only).',
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/ForceFlashOnDesktop.html'
			),
			'ForceFlashOnDesktopSafari' => array(
				'type' => 'String',
				'desc' => 'If the player should be forced to use flash on desktop Safari.',
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/ForceFlashOnDesktopSafari.html'
			),
			'Kaltura.EnableEmbedUiConfJs' => array(
					'type' => 'String',
					'desc' => 'If the player should request uiConf Javascript prior to embed',
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/ExternalResources.qunit.html'
			),
			'Kaltura.ForceFlashOnIE10' => array(
					'type' => 'String',
					'desc' => 'Will force flash exclusively on IE10',
					'default' => 'false',
					'example' => ''
			),
			'Kaltura.IframeRewrite' => array(
					'type' => 'String',
					'desc' => 'Enables the HTML5 player. A legacy flag to convert objects to iframes',
					'default' => 'true',
					'example' => ''
			),
			'Kaltura.LicenseServerURL' => array(
					'type' => 'String',
					'desc' => 'The playReady license server URL.',
					'default' => 'null',
					'example' => ''
			),
			'Kaltura.BlackVideoSources' => array(
					'type' => 'String',
					'desc' => "A array of assets used for black video streams. 
						Used to capture user gestures against a valid asset where the actual asset is not yet available",
					'default' => '',
					'example' => ''
			),
			'Kaltura.UseManifestUrls' => array(
					'type' => 'String',
					'desc' => 'Used to designate usage of playMainfest URL type instead of legacy flvclipper Kaltura media URLs',
					'default' => 'true',
					'example' => ''
			),
			'Kaltura.CdnUrl' => array(
					'type' => 'String',
					'desc' => 'The CDN URL used to construct Kaltura media asset URLs',
					'default' => 'http://cdnakmi.kaltura.com',
					'example' => ''
			),
			'Kaltura.Protocol' => array(
					'type' => 'String',
					'desc' => 'The current protocol of player instance, http or https. Protocol relative urls can\'t be used where different CDN prefixes for secure and standard http',
					'default' => 'http',
					'example' => ''
			),
			'Kaltura.UseFlavorIdsUrls' => array(
					'type' => 'String',
					'desc' => 'If the adaptive streams should be dynamically constructed passing along respective flavor list per device capabilities.',
					'default' => 'true',
					'example' => ''
			),
			'Kaltura.LeadHLSOnAndroid' => array(
					'type' => 'String',
					'desc' => 'If Apple HLS streams should be used when available on Android devices, 
			by default progressive streams are used on Android because of Android HLS compatibility issues.',
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/UseHLS_WhereAvailable.qunit.html'
			),
			'Kaltura.UseAppleAdaptive' => array(
					'type' => 'String',
					'desc' => 'If apple HLS streams should be used when available',
					'default' => 'true',
					'example' => '../modules/KalturaSupport/tests/UseHLS_WhereAvailable.qunit.html'
			),
			'LeadWithHLSOnFlash' => array(
					'type' => 'Boolean',
					'desc' => 'If Apple HLS streams should be on desktop browsers where Flash and an HLS stream are available',
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/LeadWithHLSOnFlash.html'
			),
			'forceHDS' => array(
            					'type' => 'Boolean',
            					'desc' => 'Force HDS streamerType for Kaltura Live (HLS by default)',
            					'default' => 'false',
            					'example' => ''
            ),
            'ignoreAkamaiHD' => array(
                        					'type' => 'Boolean',
                        					'desc' => 'Play HDS without AkamaiHD plugin (the plugin is loaded by default for HDNETWORK or HDNETWORK_HDS streamerTypes)',
                        					'default' => 'false',
                        					'example' => ''
                        ),
			'host' => array(
					'type' => 'String',
					'desc' => 'The URL of the Kaltura server to work with',
					'default' => '',
					'example' => ''
			),
			'cdnHost' => array(
					'type' => 'String',
					'desc' => 'The base URL of the CDN to load media and assets from',
					'default' => 'The host parameter value',
					'example' => ''
			),
			'clientTag' => array(
					'type' => 'String',
					'desc' => 'A custom text that is concatenated to KDP version. The tag is used by the Kaltura server widget caching mechanism and for tracking and analytics',
					'default' => 'KDP:KDP_VERSION',
					'example' => ''
			),
			'srvUrl' => array(
					'type' => 'String',
					'desc' => 'Reserved for future use, determine the API services part of the base Kaltura API calls',
					'default' => '',
					'availability' => 'kdp',
					'example' => ''
			),
			'partnerId' => array(
					'type' => 'String',
					'desc' => 'The id of the current Kaltura partner',
					'default' => '',
					'example' => ''
			),
			'ks' => array(
					'type' => 'String',
					'desc' => 'Kaltura Session',
					'default' => 'By default, the KDP generates a KS by calling the widget.get API',
					'example' => ''
			),
			'referrer' => array(
					'type' => 'String',
					'desc' => 'The URL of the hosting web page for tracking and analytics',
					'default' => '',
					'example' => ''
			),
			'disableReferrerOverride' => array(
					'type' => 'Boolean',
					'desc' => 'Flag indicating whether to take the referrer from the page (if true) or from the referrer Flashvar (if false)',
					'default' => 'false',
					'availability' => 'kdp',
					'example' => ''
			),
			'storageId' => array(
					'type' => 'String',
					'desc' => "This Flashvar contains the storageId from which the entry loads (assuming there is such storage. If there isn't, there is no reason to pass this Flashvar)",
					'default' => '',
					'example' => ''
			),
			'jsTraces' => array(
					'type' => 'Boolean',
					'desc' => "Flag indicating whether to print traces to a box in the page. Useful when there's no Flash debugger version",
					'default' => 'false',
					'availability' => 'kdp',
					'example' => ''
			),
			'centerPreloader' => array(
					'type' => 'Boolean',
					'desc' => 'Flag indicating whether to center the preloader SWF. Should be true in case the preloader registration point is not at its center.',
					'default' => 'false',
					'availability' => 'kdp',
					'example' => ''
			),
			'usePreloaderBufferAnimation' => array(
					'type' => 'Boolean',
					'desc' => 'Flag indication whether we should use the preloader SWF animation as the buffering animation. if "false", buffering animation is taken from "kspin" class in KDP skin.',
					'default' => 'false',
					'availability' => 'kdp',
					'example' => ''
			),
			'httpProtocol' => array(
					'type' => 'String',
					'desc' => 'The HTTP protocol to load the KDP application from',
					'default' => 'Trimmed protocol of the URL the KDP was loaded from',
					'availability' => 'kdp',
					'example' => ''
			),
			'strings.ks-no-flash-installed' => array(
            					'type' => 'String',
            					'desc' => 'No Flash installed message for IE8 users. This Flashvar can be used only through mw.setConfig(). For example: mw.setConfig( \'strings.ks-no-flash-installed\' , \'Flash Player nėra įdiegtas jūsų kompiuteryje\' ); Note: IE8 may parse utf-8 characters incorrectly. To translate the message, save the HTML file with UTF-8 encoding and add a META tag to the HEAD of the HTML page: &lt;META http-equiv=Content-Type content=\'text/html; charset=utf-8\'&gt;',
            					'default' => 'Flash does not appear to be installed or active. Please install or activate Flash.',
            					'example' => ''
            ),
		)
	),
	'mediaEntry' => array(
		'desc' => "Kaltura mediaEntry variables enable controls of flavor and protocol selection.",
		'vars' => array(
			'entryId' => array(
				'type' => 'String',
				'desc' => 'Valid Kaltura media entry id. To support directly assigning media see <a href="#uiVarsMediaProxy">MediaProxy</a>',
				'default' => '',
				'example' => '../modules/KalturaSupport/tests/kWidget.embed.qunit.html'
			),
			'referenceId' => array(
				'type' => 'String',
				'desc' => "Reference Id is an alternate unique identifier for media assets. Can be used instead of the entry id. 
					The player will use the first found matching referenceId found.",
				'default' => '',
				'example' => '../modules/KalturaSupport/tests/ReferenceId.html'
			),
			'flavorId' => array(
				'type' => 'String',
				'desc' => 'The flavor asset id of the media entry being played (applicable only when sourceType=entryId)',
				'default' => '',
				'example' => ''
			),
			'sourceType' => array(
				'type' => 'String',
				'desc' => 'The type of media source to load, either a URL or id of valid Kaltura media entry',
				'default' => 'entryId',
				'availability' => 'kdp',
				'example' => ''
			),
			'streamerType' => array(
				'type' => 'String',
				'desc' => 'The media source streaming protocol to use (http / rtmp / live / hdnetwork / auto ). Auto will select http or adaptive based on content length and protocols available on the platform.',
				'default' => 'auto',
				'example' => ''
			),
			'streamerUrl' => array(
				'type' => 'String',
				'desc' => "A full RTMP URL to the streaming application that will be used as the streaming provider, e.g. 'rtmp://rtmpakmi.kaltura.com/ondemand' (Used by the FMSURL OSMF class)",
				'default' => '',
				'availability' => 'kdp',
				'example' => ''
			),
			'streamFormat' => array(
				'type' => 'String',
				'desc' => 'Defines the video type of the RTMP stream to be played. To play mp4 streams over RTMP, pass streamFormat=mp4',
				'default' => 'undefined',
				'availability' => 'kdp',
				'example' => ''
			),
			'rtmpFlavors' => array(
				'type' => 'String',
				'desc' => 'Determine whether to use a multi-bitrate content flavors for dynamic streaming (set to 1)',
				'default' => 'undefined',
				'availability' => 'kdp',
				'example' => ''
			),
			'useRtmptFallback' => array(
				'type' => 'Boolean',
				'desc' => 'Flag indicating whether KDP should try to connect to rtmpt/rtmpte when mediaProtocol is rtmp/rtmpe.',
				'default' => 'true',
				'availability' => 'kdp',
				'example' => ''
			),
			'disableBitrateCookie' => array(
				'type' => 'Boolean',
				'desc' => 'Flag indicating whether the KDP should take the bitrate from the Flash cookie',
				'default' => 'false',
				'example' => ''
			),
			'requiredMetadataFields' => array(
				'type' => 'Boolean',
				'desc' => "This Flashvar is a flag indicating whether the player should request entry metadata",
				'default' => 'false',
				'example' => ''
			),
			'metadataProfileId' => array(
				'type' => 'String',
				'desc' => 'This Flashvar contains a specific custom metadata profile id to deliver. If it is not passed, the KDP delivers the latest custom metadata profile',
				'default' => '',
				'example' => ''
			),
			'getCuePointsData' => array(
				'type' => 'Boolean',
				'desc' => 'This Flashvar is a flag indicating whether the player should deliver cue-point data related to the current playing entry',
				'default' => 'true',
				'example' => ''
			),
			'loadThumbnailWithKs' => array(
				'type' => 'Boolean',
				'desc' => 'Flag indicating whether the KDP should append the KS to the thumbnail request. Default value "false" to take advantage of caching.',
				'default' => 'false',
				'example' => ''
			),
			'loadThumbnailWithReferrer' => array(
				'type' => 'Boolean',
				'desc' => 'Flag indicating whether the KDP should append the referrer to the thumbnail serve request. Default value "false" to take advantage of caching.',
				'default' => 'false',
				'example' => ''
			),
			'noThumbnail' => array(
				'type' => 'Boolean',
				'desc' => 'Flag indicating whether the KDP should forgo loading the thumbnail',
				'default' => 'false',
				'availability' => 'kdp',
				'example' => ''
			),
			'liveCore.showThumbnailWhenOffline' => array(
            				'type' => 'Boolean',
            				'desc' => 'Flag indicating whether the the default thumbnail should be shown if live stream becomes offline',
            				'default' => 'false',
            				'example' => ''
            )
		)
	),
	'layout' => array(
		'desc' => "Controls basic layout properties and provides access to player config ids.",
		'vars' => array(
			'widgetId' => array(
				'type' => 'String',
				'desc' => 'The widget id as provided by Preview & Embed in KMC (if unsure use _partnerId e.g. _309)',
				'default' => '',
				'example' => ''
			),
			'uiConfId' => array(
				'type' => 'String',
				'desc' => 'The player uiConf id as provided by KMC (or by calling uiConf.add api)',
				'default' => '',
				'example' => ''
			),
			'disableAlerts' => array(
				'type' => 'Boolean',
				'desc' => 'Disable the alert boxes',
				'default' => 'false',
				'example' => ''
			),
			'debugMode' => array(
				'type' => 'Boolean',
				'desc' => 'Reserved for future use or use by plugins; Usually used to allow Flash trace commands',
				'default' => 'false',
				'example' => ''
			),
			'disableOnScreenClick' => array(
				'type' => 'Boolean',
				'desc' => 'This Flashvar configures whether the on-screen click in KDP pauses/resumes playback',
				'default' => 'false',
				'example' => ''
			),
			'KalturaSupport_ForceUserAgent' => array(
				'type' => 'String',
				'desc' => 'Enable forcing a specific user agent by setting the user agent string. Player rules are validated against this user agent string',
				'default' => '',
				'example' => ''
			),
			'disableForceMobileHTML5' => array(
				'type' => 'Boolean',
				'desc' => 'Disables forced usage of the HTML5 player set by the forceMobileHTML5 Flash var',
				'default' => '',
				'example' => '../modules/KalturaSupport/tests/UserAgentPlayerRules.html'
			),
			'forceMobileHTML5' => array(
				'type' => 'Boolean ',
				'desc' => 'When set to true, forces the usage of the HTML5 player',
				'default' => '',
				'example' => '../modules/KalturaSupport/tests/UserAgentPlayerRules.html'
			),
			'alertForCookies' => array(
				'type' => 'Boolean',
				'desc' => 'When set to true, pops a user confirmation alert when the player needs to save a cookie in the local machine',
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/AlertForCookies.qunit.html'
			),
			'fileSystemMode' => array(
				'type' => 'Boolean',
				'desc' => 'Use to load the uiConf XML and skin assets from predefined path when debugging or loading KDP from local file system',
				'default' => 'false',
				'availability' => 'kdp',
			),
			'thumbnailUrl' => array(
				'type' => 'String',
				'desc' => 'External thumbnail URL to load instead of the entry default thumbnail. Supports evaluated expressions within curly brackets',
				'default' => '',
				'example' => '../modules/KalturaSupport/tests/ThumbnailEmbedExternalThumbnail.html',
			),
			'kml' => array(
				'type' => 'String',
				'desc' => 'The source from which to load the KDP uiConf (KML=Kaltura Meta ui Language). If undefined, the kml will be loaded from the Kaltura server via uiConf.get api. Options are: local / inject',
				'default' => 'undefined',
				'availability' => 'kdp',
			),
			'kmlPath' => array(
					'type' => 'String',
					'desc' => 'An accessible path to valid kml file (use with kml=local)',
					'default' => 'config.xml',
					'availability' => 'kdp',
					'example' => ''
			),
			'embeddedWidgetData' => array(
					'type' => 'String',
					'desc' => "Valid uiConf XML result, that is used by the 'KDP wrapper'; A Flash application that wraps the KDP for caching purposes",
					'default' => 'null',
					'availability' => 'kdp',
			),
			'disableTrackElement' => array(
				'type' => 'Boolean',
				'desc' => 'Under iOS - if there are captions within the HLS stream, users should set disableTrackElement to true to prevent caption duplications',
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/ClosedCaptions.html'
			),
			'KalturaSupport.LeadWithHTML5' => array(
				'type' => 'Boolean',
				'desc' => 'When set to true, first tries to load the HTML5 player and if loading fails, loads the Flash player',
				'default' => 'false',
			),
			'KalturaSupport.PlayerConfig' => array(
				'type' => 'Object',
				'desc' => 'The Kaltura player configuration object',
				'default' => '',
				'example' => ''
			)
		)
	),
	'playback' => array(
		'desc' => "UiVars for contoling basic playback.",
		'vars' => array(
			'autoPlay' => array(
				'type' => 'Boolean',
				'desc' => "Auto play single media (doesn't apply to playlists)",
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/AutoPlay.qunit.html'
			),
			'EmbedPlayer.WebKitPlaysInline' => array(
			 		'type' => 'Boolean',
					'desc' => "Determines if should play the video inline when inside a webview on iOS.",
					'default' => 'false',
					'example' => ''
			),
			'autoMute' => array(
				'type' => 'Boolean',
				'desc' => 'Determine whether to start playback with volume muted (usually used by video ads or homepage auto play videos)',
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/PlaylistAutoMute.html'
			),
			'loop' => array(
				'type' => 'Boolean',
				'desc' => 'Indicates whether the media should be played again after playback has completed',
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/Loop.qunit.html'
			),
			'enableControlsDuringAd' => array(
				'type' => 'Boolean',
				'desc' => 'If true, play pause button will be active during ad playback',
				'default' => 'false',
				'example' => '../modules/KalturaSupport/tests/AdEnableControls.html'
			),
			'adsOnReplay' => array(
				'type' => 'Boolean',
				'desc' => 'Indicates whether to play ads after video replay',
				'default' => 'false',
				'example' => '../modules/DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html'
			),
			'autoRewind' => array(
					'type' => 'Boolean',
					'desc' => 'Determine whether the first or the last frame of the media will show when playback ends',
					'default' => 'false',
					'example' => '',
					'availability' => 'kdp',
			),
			'stretchVideo' => array(
					'type' => 'Boolean',
					'desc' => 'When true, stretchs the video to fill its container even if video aspect ratio breaks',
					'default' => 'false',
					'example' => '',
					'availability' => 'kdp',
			),
		)
	),
	'playerProperties' => array(
		'desc' => "Properties that control basic embed and player types.",
		'vars' => array(
			/*'EmbedPlayer.IsIframeServer' => array(
			 'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),*/
			/*'EmbedPlayer.IframeParentUrl' => array(
			 'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),
			'EmbedPlayer.ForceNativeComponent' => array(
					'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),*/
			'EmbedPlayer.DisableVideoTagSupport' => array(
					'type' => 'Boolean',
					'desc' => "If video tag support should be disabled all-together",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.DisableHTML5FlashFallback' => array(
					'type' => 'Boolean',
					'desc' => "If detected, browser Flash support should be ignored and Flash support should be set to false. This eliminates support for Flash based playback.",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.UseFlashOnAndroid' => array(
					'type' => 'Boolean',
					'desc' => "If on Android, should use HTML5 ( even if Flash is installed on the machine )",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.RewriteSelector' => array(
					'type' => 'String',
					'desc' => "What tags will be re-written to video player by default. Set to empty string or null to avoid automatic video tag rewrites to embedPlayer",
					'default' => 'video,audio,playlist',
					'example' => ''
			),
			/*'EmbedPlayer.Attributes' => array(
			 'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),*/
			'EmbedPlayer.DefaultSkin' => array(
					'type' => 'String',
					'desc' => "Default player skin name",
					'default' => 'mvpcf',
					'example' => ''
			),
			'EmbedPlayer.MonitorRate' => array(
					'type' => 'Integer',
					'desc' => "Number of milliseconds between interface updates",
					'default' => '250',
					'example' => ''
			),
			'EmbedPlayer.DefaultSize' => array(
					'type' => 'String',
					'desc' => "Default video size ( if no size provided )",
					'default' => '400x300',
					'example' => ''
			),
			'EmbedPlayer.ReplaceSources' => array(
					'type' => 'Boolean',
					'desc' => "Can be used to set player sources via configuration",
					'default' => 'false',
					'example' => ''
			),
			/*'EmbedPlayer.IgnoreStreamerType' => array(
			 'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),
			'EmbedPlayer.ShowPlayerAlerts' => array(
					'type' => 'Boolean',
					'desc' => "If player errors / alerts should be displayed",
					'default' => 'true',
					'example' => ''
			),*/
			'EmbedPlayer.NotPlayableDownloadLink' => array(
					'type' => 'Boolean',
					'desc' => "When there is no in-browser playback mechanism, provides a download link for the play button",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.BlackPixel' => array(
					'type' => 'String',
					'desc' => "A Base64 black pixel image for source switching",
					'default' => '',
					'example' => ''
			),
			'EmbedPlayer.DisableEntryCache' => array(
			 'type' => '',
					'desc' => "When set to true, entry data is not saved in the player cache. This can improve performances, especially when using long play lists",
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/PlaylistEvents.qunit.html'
			),
			'EmbedPlayer.NativeControls' => array(
					'type' => 'Boolean',
					'desc' => "Determines if mwEmbed should use the Native player controls. This will prevent video tag rewriting and skinning. Useful for devices such as iPad / iPod that don't fully support DOM overlays or don't expose full-screen functionality to JavaScript",
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/iPadNativeControls.html'
			),
			'EmbedPlayer.EnableIpadHTMLControls' => array(
					'type' => 'Boolean',
					'desc' => "Determines if iPad should use HTML controls. With HTML controls you can't access native fullscreen. With HTML controls you can support HTML themed controls, overlays, ads etc.",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.OverlayControls' => array(
					'type' => 'Boolean',
					'desc' => 'Determines if the player controls should be overlaid on top of the video ( if supported by playback method)',
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.ShareEmbedMode' => array(
					'type' => 'String',
					'desc' => "The default share embed mode ( can be 'iframe' or 'xssVideo' )",
					'default' => 'iframe',
					'example' => ''
			),
			'EmbedPlayer.EnableURLTimeEncoding' => array(
					'type' => 'Boolean',
					'desc' => "Determines if embedPlayer should support server side temporal URLs for seeking",
					'default' => false,
					'example' => ''
			),
			'EmbedPlayer.DefaultImageDuration' => array(
					'type' => 'Integer',
					'desc' => "Default duration for playing images",
					'default' => '2',
					'example' => ''
			),
			'EmbedPlayer.SeekTargetThreshold'  => array(
					'type' => 'Number',
					'desc' => "Seek target precision threshold. Will not seek if difference between playback element time and seek target time is lower than the specified value",
					'default' => '0.1',
					'example' => ''
			),
			/*'EmbedPlayer.WebKitPlaysInline' => array(
			 		'type' => 'Boolean',
					'desc' => "Determines if should play the video inline or not",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.WebKitAllowAirplay' => array(
					'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),
			'EmbedPlayer.DisableVideoTagSupport' => array(
					'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),*/
			'EmbedPlayer.EnableFullscreen' => array(
					'type' => 'Boolean',
					'desc' => "If fullscreen is globally enabled",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.NewWindowFullscreen' => array(
					'type' => 'Boolean',
					'desc' => "Determines if fullscreen should pop-open a new window ( instead of trying to expand the video player to browser fullscreen )",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.EnableIpadNativeFullscreen' => array(
					'type' => 'Boolean',
					'desc' => "Whether to use the native device fullscreen call on iPad",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.EnableNativeChromeFullscreen' => array(
					'type' => 'Boolean',
					'desc' => "Whether to use the native device fullscreen call on Android Chrome",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.FullScreenZIndex' => array(
					'type' => 'Integer',
					'desc' => "The z-index given to the player interface during full screen ( high z-index )",
					'default' => '999998',
					'example' => ''
			),
			'EmbedPlayer.CodecPreference' => array(
					'type' => 'String',
					'desc' => "The preferred media codec preference ('h264', 'webm', 'ogg')",
					'default' => 'n/a',
					'example' => ''
			),
			'EmbedPlayer.ShowPosterOnStop' => array(
					'type' => 'Boolean',
					'desc' => "When set to true, shows the movie thumbnail upon movie ends",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.HidePosterOnStart' => array(
					'type' => 'Boolean',
					'desc' => "When set to true, movie thumbnail doesn't show upon movie load (before playback starts)",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.ShowOriginalPoster' => array(
					'type' => 'Boolean',
					'desc' => "When set to true, the thumbnail is loaded with its original size",
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/ImageEntry.html'
			),
			/*'EmbedPlayer.SourceAttributes' => array(
			 'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),*/
			'EmbedPlayer.ControlsHeight' => array(
					'type' => 'Integer',
					'desc' => "Default player controls size",
					'default' => '31',
					'example' => ''
			),
			'EmbedPlayer.HoverOutTimeout' => array(
					'type' => 'Integer',
					'desc' => "Default Timeout (in milliseconds) for Player controls hover out",
					'default' => '1000',
					'example' => ''
			),
			'EmbedPlayer.EnableRightClick' => array(
					'type' => 'Boolean',
					'desc' => "If users can right click on the player",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.ShowNativeWarning' => array(
					'type' => 'Boolean',
					'desc' => "Set the browser player warning flag displays warning for non optimal playback",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.WaitForMeta' => array(
					'type' => 'Boolean',
					'desc' => "If the player should wait for metadata like video size and duration before trying to draw the player interface.",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.ForceKPlayer' => array(
					'type' => 'Boolean',
					'desc' => "Force loading the legacy KDP Flash video player.",
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/ForceKPlayer.qunit.html'
			),
			'EmbedPlayer.ForceSPlayer' => array(
					'type' => 'Boolean',
					'desc' => "Force loading the Silverlight video player.",
					'default' => 'false',
					'example' => ''
			),
			/*'EmbedPlayer.DataAttributes' => array(
			 'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),
			'EmbedPlayer.IframeParentUrl' => array(
					'type' => '',
					'desc' => "",
					'default' => '',
					'example' => ''
			),*/
			'EmbedPlayer.iPhoneShowHTMLPlayScreen' => array(
					'type' => 'Boolean',
					'desc' => "By default, an HTML play screen is displayed with image, thumb and play button. If you are not using ad plugins you may want to set this to false and display the native play button",
					'default' => 'true',
					'example' => ''
			),
			'EmbedPlayer.twoPhaseManifestHlsAndroid' => array(
					'type' => 'Boolean',
					'desc' => "If the player should load the final location of m3u8 file and not a URL that redirects to the m3u8 file on Android set this flag to true",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.DisableBufferingSpinner' => array(
					'type' => 'Boolean',
					'desc' => "If the player should hide the loading spinner when it is in buffering mode",
					'default' => 'false',
					'example' => ''
			),
			'EmbedPlayer.DisableContextMenu' => array(
					'type' => 'Boolean',
					'desc' => "Disables the player's right-click context menu",
					'default' => 'false',
					'example' => '../modules/KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html'
			),
			'EmbedPlayer.KeepPoster' => array(
					'type' => 'Boolean',
					'desc' => "Keeps the entry thumbnail shown during playback (covers the video)",
					'default' => 'false',
					'example' => ''
			)
		)
	),
	'mediaProxy'=> array(
		'desc' => "The MediaProxy object is responsible for referencing and loading of the current playing media.",
		'vars' => array(
			'mediaProxy.entry' => array(
					'type' => 'Object',
					'desc' => 'Supports partial or complete override of <a href="http://www.kaltura.com/api_v3/testmeDoc/index.php?object=KalturaBaseEntry">entry object</a>.',
					'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
			),
			'mediaProxy.entryCuePoints' => array(
					'type' => 'Object',
					'desc' => 'Supports partial or complete override of <a href="http://www.kaltura.com/api_v3/testmeDoc/index.php?object=KalturaCuePoint">player cuePoints</a>.',
					'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
			),
			'mediaProxy.entryCuePoints' => array(
					'type' => 'Object',
					'desc' => 'Supports partial or complete override of <a href="http://www.kaltura.com/api_v3/testmeDoc/index.php?object=KalturaCuePoint">player cuePoints</a>.',
					'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
			),
			'mediaProxy.contextData' => array(
					'type' => 'Object',
					'desc' => 'Supports partial or complete override of entry access control restriction.',
					'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
			),
			'mediaProxy.entryMetadata' => array(
					'type' => 'Object',
					'desc' => 'Supports partial or complete override of entry custom metadata.',
					'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
			),
			'mediaProxy.sources' => array(
					'type' => 'Object',
					'desc' => 'Supports partial or complete override of entry media sources.',
					'example' => '../modules/KalturaSupport/tests/StandAlonePlayerMediaProxyOverride.html'
			),
			'mediaProxy.selectedFlavorId' => array(
					'type' => 'String',
					'desc' => 'The transcoding flavor currently playing. A valid id of a transcoding flavor associated with Kaltura entry currently being played',
					'default' => '',
					'availability' => 'kdp',
					'example' => ''
			),
			'mediaProxy.preferedFlavorBR' => array(
					'type' => 'Integer',
					'desc' => 'A prefered bitrate for selecting the flavor to be played (progressive download and RTMP). '.
						'In case of an RTMP adaptive mbr, a -1 value will force an auto switching as opposed to manual one. Will be affective only if the "disableBitrateCookie=true" Flashvar is sent.',
					'default' => '1000',
					'example' => '../modules/KalturaSupport/tests/FlavorSelector.preferedFlavorBR.qunit.html'
			),
			'mediaProxy.imageDefaultDuration' => array(
					'type' => 'Integer',
					'desc' => 'In case an Image media is played in a playlist, this value sets the default time period that the image will hold until the next image is presented. Any positive number representing seconds is acceptable',
					'default' => '3',
			),
			'mediaProxy.supportImageDuration' => array(
					'type' => 'Boolean',
					'desc' => 'This is used to turn an image to a timed image. It is useful in case of playlist where an image should only show for a specific time before the next item will show. If the image should show without time (static), set this to false',
					'default' => 'true in case of playlists, false in case of single image',
					'availability' => 'kdp',
			),
			'mediaProxy.initialBufferTime' => array(
					'type' => 'Integer',
					'desc' => "Set the initial buffer time in dual buffering method. When a number of seconds indicated by this parameter will be buffered, the stream playback will start and the buffer size will increase to expandedBufferTime. Any positive number representing the number of seconds the buffer should hold before playback",
					'default' => '2',
					'availability' => 'kdp',
			),
			'mediaProxy.expandedBufferTime' => array(
					'type' => 'Integer',
					'desc' => 'Set the desired buffer time in dual buffering method. After the stream buffer has accumulated the number of seconds indicated by initialBufferTime, the buffer size increases to the number of seconds indicated by this parameter to maximize the buffer download size during playback. Any positive number representing the desired seconds to buffer',
					'default' => '10',
					'availability' => 'kdp',
			),
			'mediaProxy.mediaPlayFrom' => array(
					'type' => 'Integer',
					'desc' => 'Indicates the time from which to play the media. If passed and unequal to 0, the player seeks to this time before beginning to play content.',
					'default' => 'null',
					'example' => '../modules/KalturaSupport/tests/PlayFromOffsetStartTimeToEndTime.html'
			),
			'mediaProxy.mediaPlayTo' => array(
					'type' => 'Integer',
					'desc' => 'Indicates the time to which to play the media. If passed and unequal to 0, the player pauses upon arrival at this time',
					'default' => 'null',
					'example' => '../modules/KalturaSupport/tests/PlayFromOffsetStartTimeToEndTime.html'
			)
		)
	)
);
