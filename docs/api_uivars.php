<?php
	$uiVars1 = array(
        'Kaltura.ServiceUrl' => array(
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
        ),
        'httpProtocol' => array(
            'type' => 'String',
            'desc' => 'The http protocol to load the KDP application from',
            'default' => 'Trimmed protocol of the url the KDP was loaded from',
            'availability' => 'kdp',
            'example' => ''
        ),
        'host' => array(
            'type' => 'String',
            'desc' => 'The url of the Kaltura server to work with',
            'default' => '',
            'example' => ''
        ),
        'cdnHost' => array(
            'type' => 'String',
            'desc' => 'The base url of the CDN to load media and assets from',
            'default' => 'The host parameter value',
            'example' => ''
        ),
        'clientTag' => array(
            'type' => 'String',
            'desc' => 'A custom text that will be concatenated to KDP version, this tag is used by the Kaltura server widget caching mechanism and for tracking and analytics',
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
            'desc' => 'The id of the Kaltura partner whos media to play',
            'default' => '',
            'example' => ''
        ),
        'ks' => array(
            'type' => 'String',
            'desc' => 'Kaltura Session',
            'default' => 'By default, the KDP will generate a ks by calling the widget.get api',
            'example' => ''
        ),
        'referrer' => array(
            'type' => 'String',
            'desc' => 'The url of the hosting web page for tracking and analytics',
            'default' => '',
            'example' => ''
        ),
        'disableReferrerOverride' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether to take the referrer from the page (if true) or from the referrer flashvar (if false)',
            'default' => 'false',
            'availability' => 'kdp',
            'example' => ''
        ),
        'storageId' => array(
            'type' => 'String',
            'desc' => "This flashvar contains the storageId from which we wish to load the entry (assuming there is such storage. If there isn't there is no reason to pass this flashvar)",
            'default' => '',
            'example' => ''
        ),
        'jsTraces' => array(
            'type' => 'Boolean',
            'desc' => "Flag indicating whether to print traces to a box in the page. Usefull when there's no flash debugger version",
            'default' => 'false',
            'availability' => 'kdp',
            'example' => ''
        ),
        'centerPreloader' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicationg whether to center the preloader swf. Should be true in case the preloader registration point is not at its center.',
            'default' => 'false',
            'availability' => 'kdp',
            'example' => ''
        ),
        'usePreloaderBufferAnimation' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indication whetehr we should use the preloader swf animation as the buffering animation. if "false": buffering animation will be taken from "kspin" class in kdp skin.',
            'default' => 'false',
            'availability' => 'kdp',
            'example' => ''
        )
    );

	$uiVars2 = array(
        'entryId' => array(
            'type' => 'String',
            'desc' => 'Valid Kaltura media entry id or a media url (to use url set sourceType=url)',
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
            'desc' => 'The type of media source to load, either a url or id of valid Kaltura media entry',
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
            'desc' => "A full rtmp url to the streaming application that will be used as the streaming provider, e.g. 'rtmp://rtmpakmi.kaltura.com/ondemand' (Used by the FMSURL OSMF class)",
            'default' => '',
            'availability' => 'kdp',
            'example' => ''
        ),
        'streamFormat' => array(
            'type' => 'String',
            'desc' => 'Defines the video type of the rtmp stream to be played. To play mp4 streams over rtmp, pass streamFormat=mp4',
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
            'desc' => "Reference Id of an entry to be played (instead of entryId). the player gets a list of entries with matching referenceId and plays the first in the list.",
            'default' => '',
            'example' => ''
        ),
        'requiredMetadataFields' => array(
            'type' => 'Boolean',
            'desc' => "This flashvar is a flag indicating whether the player should request entry metadata",
            'default' => 'false',
            'example' => ''
        ),
        'metadataProfileId' => array(
            'type' => 'String',
            'desc' => 'This flashvar contains a specific custom metadata profile id to deliver. If it is not passed, the KDP delivers the latest custom metadata profile',
            'default' => '',
            'example' => ''
        ),
        'getCuePointsData' => array(
            'type' => 'Boolean',
            'desc' => 'This flashvar is a flag indicating whether the player should deliver cue-point data related to the current playing entry',
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
            'desc' => 'The player uiConf id as provided by the Application Studio in KMC (or by calling uiConf.add api)',
            'default' => '',
            'example' => ''
        ),
        'kml' => array(
            'type' => 'String',
            'desc' => 'The source from which to load the Kdp uiConf (KML=Kaltura Meta ui Language), if undefined the kml will be loaded from the Kaltura server via uiConf.get api. Options are: local / inject',
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
            'desc' => "Valid uiConf XML result, this is used by the 'KDP wrapper'; A flash application that wraps the KDP for caching purposes",
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
            'desc' => 'Use to load the uiConf xml and skin assets from predefined path when debuggin or loading KDP from local file system',
            'default' => 'false',
            'availability' => 'kdp',
            'example' => ''
        ),
        'debugMode' => array(
            'type' => 'Boolean',
            'desc' => 'Reserved for future use or use by plugins; will usually be used to allow Flash trace commands',
            'default' => 'false',
            'example' => ''
        ),
        'disableOnScreenClick' => array(
            'type' => 'Boolean',
            'desc' => 'This flashvar configures whether the on-screen click in kdp pauses/resumes playback',
            'default' => 'false',
            'example' => ''
        ),
        'KalturaSupport_ForceUserAgent' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'disableForceMobileHTML5' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'forceMobileHTML5' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'alertForCookies' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'relativeCortadoAppletPath' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'disableTrackElement' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'KalturaSupport.LeadWithHTML5' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'KalturaSupport.DepModuleList' => array(
            'type' => '',
            'desc' => '',
            'default' => '',
            'example' => ''
        ),
        'KalturaSupport.PlayerConfig' => array(
            'type' => '',
            'desc' => '',
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
            'desc' => 'Determine whether to start playback with volume muted (usually used by video ads or homepage auto playe videos)',
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
            'desc' => 'When true will stretch the video to fill its container even if breaking video aspect ratio',
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
        'EmbedPlayer.IsIframeServer' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.EnableIframeApi' => array(
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
        ),
        'EmbedPlayer.ForceNativeComponent' => array(
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
        ),
        'EmbedPlayer.DisableHTML5FlashFallback' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.UseFlashOnAndroid' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.RewriteSelector' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.Attributes' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.DefaultSkin' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.MonitorRate' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.DefaultSize' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.ReplaceSources' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.IgnoreStreamerType' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.ShowPlayerAlerts' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.NotPlayableDownloadLink' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.BlackPixel' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.iPhoneShowHTMLPlayScreen' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.NativeControls' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.EnableIpadHTMLControls' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.OverlayControls' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.ShareEmbedMode' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.EnableURLTimeEncoding' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.DefaultImageDuration' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.WebKitPlaysInline' => array(
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
        ),
        'EmbedPlayer.EnableFullscreen' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.NewWindowFullscreen' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.EnableIpadNativeFullscreen' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.FullScreenZIndex' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.CodecPreference' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.ShowPosterOnStop' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.SourceAttributes' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.ControlsHeight' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.HoverOutTimeout' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.EnableRightClick' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.ShowNativeWarning' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.WaitForMeta' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
            'example' => ''
        ),
        'EmbedPlayer.DataAttributes' => array(
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
        ),
        'EmbedPlayer.iPhoneShowHTMLPlayScreen' => array(
            'type' => '',
            'desc' => "",
            'default' => '',
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
            'desc' => 'A prefered bitrate for selecting the flavor to be played. in case of an rtmp adaptive mbr a -1 value will force an auto switching as opposed to manual one. Will be affective only if "disableBitrateCookie=true" flashvar is sent.',
            'default' => '1000',
            'example' => ''
        ),
        'mediaProxy.imageDefaultDuration' => array(
            'type' => 'Integer',
            'desc' => 'In case of an Image media is played in a playlist this value will set the defualt time period that the image will hold untill the next image is presented. Any positive number representing seconds is acceptable',
            'default' => '3',
            'example' => ''
        ),
        'mediaProxy.supportImageDuration' => array(
            'type' => 'Boolean',
            'desc' => 'This is used to turn an image to a timed image. It is useful in case of playlist where an image should only show for a specific time before the next item will show. If the image should show without time (static), turn this to false',
            'default' => 'true in case of playlists, false in case of single image',
            'availability' => 'kdp',
            'example' => ''
        ),
        'mediaProxy.initialBufferTime' => array(
            'type' => 'Integer',
            'desc' => "Set the initial buffer time in dual buffering method, when a number of seconds indicated by this parameter will be buffered, the stream playback will start and the buffer size will incrase to expandedBufferTime. Any positive number representing the number of seconds the buffer should hold before playback",
            'default' => '2',
            'availability' => 'kdp',
            'example' => ''
        ),
        'mediaProxy.expandedBufferTime' => array(
            'type' => 'Integer',
            'desc' => 'Set the desired buffer time in dual buffering method, after the stream buffer has accumulated the number of seconds indicated by initialBufferTime the buffer size will incrase to the number of seconds indicated by this parameter to maximize the buffer download size during playback. Any positive number representing the desired seconds to buffer',
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



