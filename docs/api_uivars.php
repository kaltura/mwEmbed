<?php
	$uiVars1 = array(
        /*'Kaltura.ServiceUrl' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.ServiceBase' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.StatsServiceUrl' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.NoApiCache' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.ForceIframeEmbed' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.KWidgetPsPath' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.AllowIframeRemoteService' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        '' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        '' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.ForceFlashOnDesktop' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.EnableEmbedUiConfJs' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.ForceFlashOnIE10' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.IframeRewrite' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.LicenseServerURL' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.BlackVideoSources' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.UseManifestUrls' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.CdnUrl' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.Protocol' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.UseAppleAdaptive' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.UseFlavorIdsUrls' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'Kaltura.LeadHLSOnAndroid' => array(
            'type' => 'String',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),*/
        'httpProtocol' => array(
            'type' => 'String',
            'desc' => 'The HTTP protocol to load the KDP application from',
            'default' => 'Trimmed protocol of the URL the KDP was loaded from',
            'availability' => 'kdp',
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
        )
    );

	$uiVars2 = array(
        'entryId' => array(
            'type' => 'String',
            'desc' => 'Valid Kaltura media entry id or a media URL (to use URL set sourceType=URL)',
            'default' => '',
            'example' => ''
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
            'example' => ''
        ),
        'streamerType' => array(
            'type' => 'String',
            'desc' => 'The media source streaming protocol to use (http / rtmp / live / hdnetwork)',
            'default' => 'http',
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
        'referenceId' => array(
            'type' => 'String',
            'desc' => "Reference Id of an entry to be played (instead of entryId). The player gets a list of entries with matching referenceId and plays the first in the list.",
            'default' => '',
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
        'noThumbnail' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether the KDP should forgo loading the thumbnail',
            'default' => 'false',
            'availability' => 'kdp',
            'example' => ''
        )
    );

	$uiVars3 = array(
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
        'kml' => array(
            'type' => 'String',
            'desc' => 'The source from which to load the KDP uiConf (KML=Kaltura Meta ui Language). If undefined, the kml will be loaded from the Kaltura server via uiConf.get api. Options are: local / inject',
            'default' => 'undefined',
            'availability' => 'kdp',
            'example' => ''
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
            'example' => ''
        ),
        'disableAlerts' => array(
            'type' => 'Boolean',
            'desc' => 'Disable the alert boxes',
            'default' => 'false',
            'example' => ''
        ),
        'fileSystemMode' => array(
            'type' => 'Boolean',
            'desc' => 'Use to load the uiConf XML and skin assets from predefined path when debugging or loading KDP from local file system',
            'default' => 'false',
            'availability' => 'kdp',
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
            'example' => ''
        ),
        'alertForCookies' => array(
            'type' => 'Boolean',
            'desc' => 'When set to true, pops a user confirmation alert when the player needs to save a cookie in the local machine',
            'default' => 'false',
            'example' => '../modules/KalturaSupport/tests/AlertForCookies.qunit.html'
        ),
        'relativeCortadoAppletPath' => array(
            'type' => 'String',
            'desc' => 'The default location for Java Cortado Applet',
            'default' => '',
            'example' => ''
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
            'example' => ''
        ),
        'KalturaSupport.PlayerConfig' => array(
            'type' => 'Object',
            'desc' => 'The Kaltura player configuration object',
            'default' => '',
            'example' => ''
        )
    );

	$uiVars4 = array(
        'autoPlay' => array(
            'type' => 'Boolean',
            'desc' => "Auto play single media (doesn't apply to playlists)",
            'default' => 'false',
            'example' => '../modules/KalturaSupport/tests/AutoPlay.qunit.html'
        ),
        'autoRewind' => array(
            'type' => 'Boolean',
            'desc' => 'Determine whether the first or the last frame of the media will show when playback ends',
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
        'stretchVideo' => array(
            'type' => 'Boolean',
            'desc' => 'When true, stretchs the video to fill its container even if video aspect ratio breaks',
            'default' => 'false',
            'example' => '../modules/KalturaSupport/tests/Loop.qunit.html'
        ),
        'adsOnReplay' => array(
            'type' => 'Boolean',
            'desc' => 'Indicates whether to play ads after video replay',
            'default' => 'false',
            'example' => '../modules/DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html'
        )
    );

	$uiVars5 = array(
        /*'EmbedPlayer.IsIframeServer' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),*/
        'EmbedPlayer.EnableIframeApi' => array(
            'type' => 'Boolean',
            'desc' => "If the iFrame should send and receive JavaScript events across domains via postMessage",
            'default' => 'true',
            'example' => ''
        ),
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
        /*'EmbedPlayer.iPhoneShowHTMLPlayScreen' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),*/
        'EmbedPlayer.NativeControls' => array(
            'type' => 'Boolean',
            'desc' => "Determines if mwEmbed should use the Native player controls. This will prevent video tag rewriting and skinning. Useful for devices such as iPad / iPod that don't fully support DOM overlays or don't expose full-screen functionality to JavaScript",
            'default' => 'false',
            'example' => ''
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
            'type' => 'String',
            'desc' => "Determines if embedPlayer should support server side temporal URLs for seeking. Options are Flash|always|none",
            'default' => 'flash',
            'example' => ''
        ),
        'EmbedPlayer.DefaultImageDuration' => array(
            'type' => 'Integer',
            'desc' => "Default duration for playing images",
            'default' => '2',
            'example' => ''
        ),
        /*'EmbedPlayer.WebKitPlaysInline' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.WebKitAllowAirplay' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.DisableJava' => array(
            'type' => 'Boolean',
            'desc' => "If the java cortado player should be disabled",
            'default' => 'true',
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
            'desc' => "Whether to use the native device fullscreen call",
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
            'example' => ''
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
        )
    );

	$uiVars6 = array(
        'mediaProxy.selectedFlavorId' => array(
            'type' => 'String',
            'desc' => 'The transcoding flavor currently playing. A valid id of a transcoding flavor associated with Kaltura entry currently being played',
            'default' => '',
            'availability' => 'kdp',
            'example' => ''
        ),
        'mediaProxy.preferedFlavorBR' => array(
            'type' => 'Integer',
            'desc' => 'A prefered bitrate for selecting the flavor to be played. In case of an RTMP adaptive mbr, a -1 value will force an auto switching as opposed to manual one. Will be affective only if the "disableBitrateCookie=true" Flashvar is sent.',
            'default' => '1000',
            'example' => ''
        ),
        'mediaProxy.imageDefaultDuration' => array(
            'type' => 'Integer',
            'desc' => 'In case an Image media is played in a playlist, this value sets the default time period that the image will hold until the next image is presented. Any positive number representing seconds is acceptable',
            'default' => '3',
            'example' => ''
        ),
        'mediaProxy.supportImageDuration' => array(
            'type' => 'Boolean',
            'desc' => 'This is used to turn an image to a timed image. It is useful in case of playlist where an image should only show for a specific time before the next item will show. If the image should show without time (static), set this to false',
            'default' => 'true in case of playlists, false in case of single image',
            'availability' => 'kdp',
            'example' => ''
        ),
        'mediaProxy.initialBufferTime' => array(
            'type' => 'Integer',
            'desc' => "Set the initial buffer time in dual buffering method. When a number of seconds indicated by this parameter will be buffered, the stream playback will start and the buffer size will increase to expandedBufferTime. Any positive number representing the number of seconds the buffer should hold before playback",
            'default' => '2',
            'availability' => 'kdp',
            'example' => ''
        ),
        'mediaProxy.expandedBufferTime' => array(
            'type' => 'Integer',
            'desc' => 'Set the desired buffer time in dual buffering method. After the stream buffer has accumulated the number of seconds indicated by initialBufferTime, the buffer size increases to the number of seconds indicated by this parameter to maximize the buffer download size during playback. Any positive number representing the desired seconds to buffer',
            'default' => '10',
            'availability' => 'kdp',
            'example' => ''
        ),
        'mediaProxy.mediaPlayFrom' => array(
            'type' => 'Integer',
            'desc' => 'Indicates the time from which to play the media. If passed and unequal to 0, the player seeks to this time before beginning to play',
            'default' => '-1',
            'example' => ''
        ),
        'mediaProxy.mediaPlayTo' => array(
            'type' => 'Integer',
            'desc' => 'Indicates the time to which to play the media. If passed and unequal to 0, the player pauses upon arrival at this time',
            'default' => '-1',
            'example' => ''
        )
    );
?>



