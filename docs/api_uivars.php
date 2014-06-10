<?php
	$uiVars1 = array(
        'httpProtocol' => array(
            'type' => 'String',
            'desc' => 'The http protocol to load the KDP application from',
            'default' => 'Trimmed protocol of the url the KDP was loaded from',
            'availability' => 'kdp'
        ),
        'host' => array(
            'type' => 'String',
            'desc' => 'The url of the Kaltura server to work with',
            'default' => ''
        ),
        'cdnHost' => array(
            'type' => 'String',
            'desc' => 'The base url of the CDN to load media and assets from',
            'default' => 'The host parameter value'
        ),
        'clientTag' => array(
            'type' => 'String',
            'desc' => 'A custom text that will be concatenated to KDP version, this tag is used by the Kaltura server widget caching mechanism and for tracking and analytics',
            'default' => 'KDP:KDP_VERSION'
        ),
        'srvUrl' => array(
            'type' => 'String',
            'desc' => 'Reserved for future use, determine the API services part of the base Kaltura API calls',
            'default' => '',
            'availability' => 'kdp'
        ),
        'partnerId' => array(
            'type' => 'String',
            'desc' => 'The id of the Kaltura partner whos media to play',
            'default' => ''
        ),
        'ks' => array(
            'type' => 'String',
            'desc' => 'Kaltura Session',
            'default' => 'By default, the KDP will generate a ks by calling the widget.get api'
        ),
        'referrer' => array(
            'type' => 'String',
            'desc' => 'The url of the hosting web page for tracking and analytics',
            'default' => ''
        ),
        'disableReferrerOverride' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether to take the referrer from the page (if true) or from the referrer flashvar (if false)',
            'default' => 'false',
            'availability' => 'kdp'
        ),
        'storageId' => array(
            'type' => 'String',
            'desc' => "This flashvar contains the storageId from which we wish to load the entry (assuming there is such storage. If there isn't there is no reason to pass this flashvar)",
            'default' => ''
        ),
        'jsTraces' => array(
            'type' => 'Boolean',
            'desc' => "Flag indicating whether to print traces to a box in the page. Usefull when there's no flash debugger version",
            'default' => 'false',
            'availability' => 'kdp'
        ),
        'centerPreloader' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicationg whether to center the preloader swf. Should be true in case the preloader registration point is not at its center.',
            'default' => 'false',
            'availability' => 'kdp'
        ),
        'usePreloaderBufferAnimation' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indication whetehr we should use the preloader swf animation as the buffering animation. if "false": buffering animation will be taken from "kspin" class in kdp skin.',
            'default' => 'false',
            'availability' => 'kdp'
        )
    );

	$uiVars2 = array(
        'entryId' => array(
            'type' => 'String',
            'desc' => 'Valid Kaltura media entry id or a media url (to use url set sourceType=url)',
            'default' => ''
        ),
        'flavorId' => array(
            'type' => 'String',
            'desc' => 'The flavor asset id of the media entry being played (applicable only when sourceType=entryId)',
            'default' => ''
        ),
        'sourceType' => array(
            'type' => 'String',
            'desc' => 'The type of media source to load, either a url or id of valid Kaltura media entry',
            'default' => 'entryId'
        ),
        'streamerType' => array(
            'type' => 'String',
            'desc' => 'The media source streaming protocol to use (http / rtmp / live / hdnetwork)',
            'default' => 'http'
        ),
        'streamerUrl' => array(
            'type' => 'String',
            'desc' => "A full rtmp url to the streaming application that will be used as the streaming provider, e.g. 'rtmp://rtmpakmi.kaltura.com/ondemand' (Used by the FMSURL OSMF class)",
            'default' => '',
            'availability' => 'kdp'
        ),
        'streamFormat' => array(
            'type' => 'String',
            'desc' => 'Defines the video type of the rtmp stream to be played. To play mp4 streams over rtmp, pass streamFormat=mp4',
            'default' => 'undefined',
            'availability' => 'kdp'
        ),
        'rtmpFlavors' => array(
            'type' => 'String',
            'desc' => 'Determine whether to use a multi-bitrate content flavors for dynamic streaming (set to 1)',
            'default' => 'undefined',
            'availability' => 'kdp'
        ),
        'useRtmptFallback' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether KDP should try to connect to rtmpt/rtmpte when mediaProtocol is rtmp/rtmpe.',
            'default' => 'true',
            'availability' => 'kdp'
        ),
        'disableBitrateCookie' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether the KDP should take the bitrate from the Flash cookie',
            'default' => 'false'
        ),
        'referenceId' => array(
            'type' => 'String',
            'desc' => "Reference Id of an entry to be played (instead of entryId). the player gets a list of entries with matching referenceId and plays the first in the list.",
            'default' => ''
        ),
        'requiredMetadataFields' => array(
            'type' => 'Boolean',
            'desc' => "This flashvar is a flag indicating whether the player should request entry metadata",
            'default' => 'false'
        ),
        'metadataProfileId' => array(
            'type' => 'String',
            'desc' => 'This flashvar contains a specific custom metadata profile id to deliver. If it is not passed, the KDP delivers the latest custom metadata profile',
            'default' => ''
        ),
        'getCuePointsData' => array(
            'type' => 'Boolean',
            'desc' => 'This flashvar is a flag indicating whether the player should deliver cue-point data related to the current playing entry',
            'default' => 'true'
        ),
        'loadThumbnailWithKs' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether the KDP should append the KS to the thumbnail request. Default value "false" to take advantage of caching.',
            'default' => 'false'
        ),
        'noThumbnail' => array(
            'type' => 'Boolean',
            'desc' => 'Flag indicating whether the KDP should forgo loading the thumbnail',
            'default' => 'false',
            'availability' => 'kdp'
        )
    );

	$uiVars3 = array(
        'widgetId' => array(
            'type' => 'String',
            'desc' => 'The widget id as provided by Preview & Embed in KMC (if unsure use _partnerId e.g. _309)',
            'default' => ''
        ),
        'uiConfId' => array(
            'type' => 'String',
            'desc' => 'The player uiConf id as provided by the Application Studio in KMC (or by calling uiConf.add api)',
            'default' => ''
        ),
        'kml' => array(
            'type' => 'String',
            'desc' => 'The source from which to load the Kdp uiConf (KML=Kaltura Meta ui Language), if undefined the kml will be loaded from the Kaltura server via uiConf.get api. Options are: local / inject',
            'default' => 'undefined',
            'availability' => 'kdp'
        ),
        'kmlPath' => array(
            'type' => 'String',
            'desc' => 'An accessible path to valid kml file (use with kml=local)',
            'default' => 'config.xml',
            'availability' => 'kdp'
        ),
        'embeddedWidgetData' => array(
            'type' => 'String',
            'desc' => "Valid uiConf XML result, this is used by the 'KDP wrapper'; A flash application that wraps the KDP for caching purposes",
            'default' => 'null',
            'availability' => 'kdp'
        ),
        'disableAlerts' => array(
            'type' => 'Boolean',
            'desc' => 'Disable the alert boxes',
            'default' => 'false'
        ),
        'fileSystemMode' => array(
            'type' => 'Boolean',
            'desc' => 'Use to load the uiConf xml and skin assets from predefined path when debuggin or loading KDP from local file system',
            'default' => 'false',
            'availability' => 'kdp'
        ),
        'debugMode' => array(
            'type' => 'Boolean',
            'desc' => 'Reserved for future use or use by plugins; will usually be used to allow Flash trace commands',
            'default' => 'false'
        ),
        'disableOnScreenClick' => array(
            'type' => 'Boolean',
            'desc' => 'This flashvar configures whether the on-screen click in kdp pauses/resumes playback',
            'default' => 'false'
        )
    );

	$uiVars4 = array(
        'autoPlay' => array(
            'type' => 'Boolean',
            'desc' => "Auto play single media (doesn't apply to playlists)",
            'default' => 'false'
        ),
        'autoRewind' => array(
            'type' => 'Boolean',
            'desc' => 'Determine whether the first or the last frame of the media will show when playback ends',
            'default' => 'false'
        ),
        'autoMute' => array(
            'type' => 'Boolean',
            'desc' => 'Determine whether to start playback with volume muted (usually used by video ads or homepage auto playe videos)',
            'default' => 'false'
        ),
        'loop' => array(
            'type' => 'Boolean',
            'desc' => 'Indicates whether the media should be played again after playback has completed',
            'default' => 'false'
        )
    );

	$uiVars5 = array(
        'mediaProxy.selectedFlavorId' => array(
            'type' => 'String',
            'desc' => 'The transcoding flavor currently playing. A valid id of a transcoding flavor associated with Kaltura entry currently being played',
            'default' => '',
            'availability' => 'kdp'
        ),
        'mediaProxy.preferedFlavorBR' => array(
            'type' => 'Integer',
            'desc' => 'A prefered bitrate for selecting the flavor to be played. in case of an rtmp adaptive mbr a -1 value will force an auto switching as opposed to manual one. Will be affective only if "disableBitrateCookie=true" flashvar is sent.',
            'default' => '1000'
        ),
        'mediaProxy.imageDefaultDuration' => array(
            'type' => 'Integer',
            'desc' => 'In case of an Image media is played in a playlist this value will set the defualt time period that the image will hold untill the next image is presented. Any positive number representing seconds is acceptable',
            'default' => '3'
        ),
        'mediaProxy.supportImageDuration' => array(
            'type' => 'Boolean',
            'desc' => 'This is used to turn an image to a timed image. It is useful in case of playlist where an image should only show for a specific time before the next item will show. If the image should show without time (static), turn this to false',
            'default' => 'true in case of playlists, false in case of single image',
            'availability' => 'kdp'
        ),
        'mediaProxy.initialBufferTime' => array(
            'type' => 'Integer',
            'desc' => "Set the initial buffer time in dual buffering method, when a number of seconds indicated by this parameter will be buffered, the stream playback will start and the buffer size will incrase to expandedBufferTime. Any positive number representing the number of seconds the buffer should hold before playback",
            'default' => '2',
            'availability' => 'kdp'
        ),
        'mediaProxy.expandedBufferTime' => array(
            'type' => 'Integer',
            'desc' => 'Set the desired buffer time in dual buffering method, after the stream buffer has accumulated the number of seconds indicated by initialBufferTime the buffer size will incrase to the number of seconds indicated by this parameter to maximize the buffer download size during playback. Any positive number representing the desired seconds to buffer',
            'default' => '10',
            'availability' => 'kdp'
        ),
        'mediaProxy.mediaPlayFrom' => array(
            'type' => 'Integer',
            'desc' => 'Indicates the time from which to play the media. If passed and unequal to 0, the player seeks to this time before beginning to play',
            'default' => '-1'
        ),
        'mediaProxy.mediaPlayTo' => array(
            'type' => 'Integer',
            'desc' => 'Indicates the time to which to play the media. If passed and unequal to 0, the player pauses upon arrival at this time',
            'default' => '-1'
        )
    );
?>



