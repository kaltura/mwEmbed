<?php 
	return array(
		'Embedding'  => array( 
			'title' => 'Embedding the kaltura player',
			'desc' => 'These files cover basic embedding from <a href="#rewrite">legacy</a> object embed, to the dynamic <a href="#kwidget">kWidget</a> embed method', 
			'testfiles' =>array(
				array(
					'title' => 'Dynamic embed',
					'hash' => 'kwidget', 
					'path' => 'KalturaSupport/tests/kWidget.embed.qunit.html'
				),
				array(
					'title' => 'Auto embed',
					'hash' => 'autoEmbed', 
					'path' => 'KalturaSupport/tests/AutoEmbed.qunit.html'
				),
				array( 
					'title' => 'Thumbnail embed',
					'hash' => 'thumb',
					'path' => 'KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html',
				),
				array( 
					'title' => 'kWidget playlist',
					'hash' => 'kwidgetPlaylist',
					'path' => 'KalturaSupport/tests/kWidget.embed.playlist.qunit.html'
 				),
				array(
					'title' => 'Object rewrite ( legacy )',
					'hash' => 'rewrite',
					'path' => 'KalturaSupport/tests/BasicPlayer.qunit.html'
				),
 				array(
 					'title' => 'swfObject ( legacy )', 
					'hash' => 'swfObject',
					'path' => 'KalturaSupport/tests/EmbedSWFObject.2.2.qunit.html'
 				),
				array(
 					'title' => 'flashembed ( legacy )', 
					'hash' => 'Flashembed',
					'path' => 'KalturaSupport/tests/Flashembed.onPageLinks.qunit.html'
				)
 			)
		),
		'Stand_Alone_Tools' => array(
			'title' => 'Stand alone tools',
			'desc' => 'Stand alone tools',
			'testfiles' => array(
				array(
					'title' => 'Get Sources ( raw video tag )',
					'hash' => 'getSources',
					'path' => 'KalturaSupport/standAloneTests/kWidget.getSources.html'
				),
				array(
					'title' => 'Self Hosted Player Sources',
					'hash' => 'selfHostedSources',
					'path' => 'EmbedPlayer/tests/Player_Sources.html'
				),
			)
		),
		'On_Page_Plugins' => array(
			'title' => 'On Page Plugins',
			'desc' => 'On page plugins work for both html5 and flash with a single pice of code.',
			'testfiles' => array(
				array(
					'title' => 'Chapters View',
					'hash' => 'chaptersView',
					'path' => '../kWidget/onPagePlugins/chapters/chaptersView.qunit.html'
				),
				array(
					'title' => 'Video Details Block',
					'hash' => 'videoDetailsBlock',
					'path' => '../kWidget/onPagePlugins/videoDetailsBlock/videoDetailsBlock.qunit.html'
				),
				array(
					'title' => 'Playlist On Page',
					'hash' => 'playlistOnPage',
					'path' => '../kWidget/onPagePlugins/playlistOnPage/playlistOnPage.qunit.html'
				),
			)
		),
		'Player_API' => array(
			'title' => "Ad providers",
			'desc' => 'The Kaltura player supports several systems for video monitization.',
			'testfiles' => array(
				array(
					'title' => 'kBind and kUnbind',
					'hash' => 'kbind',
					'path' => 'KalturaSupport/tests/kBind_kUnbind.qunit.html'
				),
				array(
					'title' => 'Change Media Entry',
					'hash' => 'changemedia',
					'path' => 'KalturaSupport/tests/ChangeMediaEntry.qunit.html'
				),
				array(
					'title' => 'Buffer Events',
					'hash' => 'BufferEvents',
					'path' => 'KalturaSupport/tests/BufferEvents.qunit.html'
				),
				array(
					'title' => 'Seek Api', 
					'hash' => 'SeekApi',
					'path' => 'KalturaSupport/tests/SeekApi.qunit.html'
				),
				array( 
					'title' => 'Access Custom Meta Data',
					'hash' => 'CustomMetaData',
					'path' => 'KalturaSupport/tests/CustomMetaData.html'
				),
				array(
					'title' => 'Show Alert',
					'hash' => 'showAlert',
					'path' => 'KalturaSupport/tests/showAlert.html'
				),
				array(
					'title' => 'Auto play',
					'hash' => 'AutoPlay',
					'path' => 'KalturaSupport/tests/AutoPlay.qunit.html'
				)
			)
		),
		'Custom_Players' => array(
			'title' => "Ad providers",
			'desc' => 'The Kaltura supports loading external css and js to customize players look and feel',
			'testfiles' => array(
				array(
					'title' => 'External Resources',
					'hash' => 'ExternalResources',
					'path' => 'KalturaSupport/tests/ExternalResources.qunit.html'
				),
				array(
					'title' => 'Custom Skin',
					'hash' => 'CustomSkin',
					'path' => 'KalturaSupport/tests/CustomSkin.html'
				),
				array(
					'title' => 'Custom Audio Player Skin',
					'hash' => 'CustomSkinAudioPlayer',
					'path' => 'KalturaSupport/tests/CustomSkinAudioPlayer.html'
				)
			)
		),
		'Player_Features' => array(
			'title' => "Player features",
			'desc' => 'Player features',
			'testfiles' => array(
				array(
					'title' => 'Player Watermark',
					'hash' => 'WatermarkTest',
					'path' => 'KalturaSupport/tests/WatermarkTest.qunit.html'
				),
				array(
					'title' => 'Custom Branding',
					'hash' => 'branding',
					'path' => 'KalturaSupport/tests/branding.html'
				),
				array(
					'title' => 'Title Player',
					'hash' => 'TitlePlayer',
					'path' => 'KalturaSupport/tests/TitlePlayer.qunit.html'
				),
				array(
					'title' => 'Share',
					'hash' => 'ShareSnippet',
					'path' => 'KalturaSupport/tests/ShareSnippet.html'
				),
				array(
					'title' => 'Flavor Selection',
					'hash' => 'FlavorSelector',
					'path' => 'KalturaSupport/tests/FlavorSelector.preferedFlavorBR.qunit.html'
				),
			)
		),
		'Access_Control'=> array(
			'title' => "Access Controls",
			'desc' => 'Provides mechensim to control access to player content',
			'testfiles' => array(
				array(
					'title' => 'Custom Control Message',
					'hash' => 'CustomMessageAccessControlKS',
					'path' => 'KalturaSupport/tests/AccessControlCustomMessage.html'
				),
				array(
					'title' => 'Access Control Preview',
					'hash' => 'AccessControlPreview',
					'path' => 'KalturaSupport/tests/AccessControlPreview.qunit.html'
				),
				array(
					'title' => 'Playlist Block Mobile First Entry',
					'hash' => 'AccessControlPlaylistBlockMobileFirstEntry',
					'path' => 'KalturaSupport/tests/AccessControlPlaylistBlockMobileFirstEntry.qunit.html'
				)
			)
		),
		'Ads' => array(
			'title' => "Ad providers",
			'desc' => 'The Kaltura player supports several systems for video monitization.',
			'testfiles' => array(
				array(
					'title' => 'VAST Preroll & Companion',
					'hash' => 'kvast',
					'path' => 'KalturaSupport/tests/AdFlashvarVastDoubleClickCompanion.qunit.html'
				),
				array(
					'title' => 'VAST OpenX, Preroll & Overlay',
					'hash' => 'kopenx',
					'path' => 'KalturaSupport/tests/AdSupportOpenX.html'
				),
				array(
					'title' => 'Bumper video',
					'hash' => 'kbumper',
					'path' => 'KalturaSupport/tests/BumperVideoNoAdd.qunit.html'
				),
				array(
					'title' => 'Kaltura Ad Cue Points',
					'hash' => 'kcuepoints',
					'path' => 'KalturaSupport/tests/CuePointsMidrollVast.html'
				),
				array(
					'title' => "DoubleClick",
					'hash' => 'DoubleClick',
					'path' => 'DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html'
				),
				array(
					'title' => "FreeWheel",
					'hash' => 'FreeWheel',
					'path' => 'FreeWheel/tests/FreeWheelPlayer.html'
				),
				array(
					'title' => "Tremor",
					'hash' => 'Tremor',
					'path' => 'Tremor/tests/TremorPrerollPostroll.qunit.html'
				),
			)
		),
		'Playlists'=> array(
			'title' => "Playlists",
			'desc' => 'Playlists support is built into the kaltura player',
			'testfiles' => array(
				array(
					'title' => 'Playlist API',
					'hash' => 'playlistApi',
					'path' => 'KalturaSupport/tests/PlaylistKalturaApi.qunit.html'
				),
				array(
					'title' => "Vertical Layout",
					'hash' => 'PlaylistVertical',
					'path' => 'KalturaSupport/tests/PlaylistVertical.html'
				),
				array(
					'title' => "Carousel",
					'hash' => 'Carousel',
					'path' => 'KalturaSupport/tests/Carousel.html'
				),
				array(
					'title' => "Playlist No Clip List",
					'hash' => 'PlaylistNoClipList',
					'path' => 'KalturaSupport/tests/PlaylistNoClipList.html'
				),
				/*
				array(
					'title' => "Media RSS source",
					'hash' => 'PlaylistKalturaMRSS',
					'path' => 'KalturaSupport/tests/PlaylistKalturaMRSS.html'
				),
				*/
				array(
					'title' => "Initial EntryId",
					'hash' => 'PlaylistInitItemEntryId',
					'path' => 'KalturaSupport/tests/PlaylistInitItemEntryId.html'
				)
			)
		),			
		'Captions' => array(
			'title' => 'Close Captions examples',
			'desc' => 'The kaltura captions player api, supports srt and ttml formats.',
			'testfiles' => array(
				array(
					'title' => 'Captions under player',
					'hash' => 'CaptionsUnderPlayer',
					'path' => 'KalturaSupport/tests/CaptionsUnderPlayer.qunit.html',
				),
				array(
					'title' => 'Captions Custom Vars TTML',
					'hash' => 'CaptionsCustomVarsTTML',
					'path' => 'KalturaSupport/tests/CaptionsCustomVarsTTML.qunit.html',
				),
				array(
					'title' => 'Captions Entry API',
					'hash' => 'CaptionsKalturaApi',
					'path' => 'KalturaSupport/tests/CaptionsKalturaApi.html',
				)
			)
		),
		'Analytics' => array(
			'title' => 'Base Analytics providers',
			'desc' => 'The Kaltura player supports several systems for tracking video playback',
			'testfiles' => array(
				array( 
					'title' => 'Kaltura Analytics',
					'hash' => 'kanalytics',
					'path' => 'KalturaSupport/tests/KalturaAnalytics.qunit.html',
				),
				array(
					'title' => 'Google Analytics',
					'hash' => 'GoogleAnalytics',
					'path' => 'GoogleAnalytics/tests/GoogleAnalytics.qunit.html',
				),
				array(
					'title' => 'Nielsen VideoCensus',
					'hash' => 'NielsenVideoCensus',
					'path' => 'NielsenVideoCensus/tests/ShortFromNielsenVideoCensus.html',
				),
				array(
					'title' => 'Comscore Analytics',
					'hash' => 'ComscoreAnalytics',
					'path' => 'Comscore/tests/Comscore.html',
				),
				array(
					'title' => 'Nielsen Combined',
					'hash' => 'NielsenCombined',
					'path' => 'NielsenCombined/tests/NielsenCombinedPlayer.qunit.html',
				),
				array(
					'title' => 'Nielsen Combined & FreeWheel',
					'hash' => 'NielsenCombinedFreeWheel',
					'path' => 'NielsenCombined/tests/IntegrationFreeWheelNielsen.html',
				),
				array(
					'title' => 'Omniture SiteCatalyst 15',
					'hash' => 'OmnitureSiteCatalyst15',
					'path' => 'Omniture/tests/siteCatalyst15.qunit.html',
				)
			)
		)
	);
