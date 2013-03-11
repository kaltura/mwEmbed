<?php 
	return array(
		'KeyFeatures'=> array(
			'title' => "Key features",
			'desc' => "Key features of the kaltura front end platform.",
			'featureSets' => array(
				'Captions' => array(
					'title' => 'Accessibility and Close Captions',
					'desc' => 'The kaltura captions player api, supports srt and ttml formats.',
					'testfiles' => array(
						'CaptionsUnderPlayer' => array(
							'title' => 'Captions',
							'path' => 'KalturaSupport/tests/CaptionsUnderPlayer.qunit.html',
						),
						'InVideo Search' => array(
							'title' => 'In-Video Search',
							'path' => '',
						),
						'CaptionsCustomVarsTTML' => array(
							'title' => 'Captions Custom Vars TTML',
							'path' => 'KalturaSupport/tests/CaptionsCustomVarsTTML.qunit.html',
						),
						'CaptionsKalturaApi' => array(
							'title' => 'Captions Entry API',
							'path' => 'KalturaSupport/tests/CaptionsKalturaApi.html',
						),
						'CaptionsPlyMedia' => array(
							'title' => 'PlyMedia Captions',
							'path' => 'Plymedia/tests/Plymedia_Kaltura.html',
						)
					)
				),
				'Access_Control'=> array(
					'title' => "Access Controls",
					'desc' => 'Provides mechanism to control access to player content',
					'testfiles' => array(
						'CustomMessageAccessControlKS' => array(
							'title' => 'Custom Control Message',
							'path' => 'KalturaSupport/tests/AccessControlCustomMessage.html'
						),
						'AccessControlPreview' => array(
							'title' => 'Access Control Preview',
							'path' => 'KalturaSupport/tests/AccessControlPreview.qunit.html'
						),
						'AccessControlPlaylistBlockMobileFirstEntry' => array(
							'title' => 'Playlist Block Mobile First Entry',
							'path' => 'KalturaSupport/tests/AccessControlPlaylistBlockMobileFirstEntry.qunit.html'
						)
					)
				),
				'Playlists'=> array(
					'title' => "Playlists",
					'desc' => 'Playlists support is built into the kaltura player',
					'testfiles' => array(
						'playlistApi' => array(
							'title' => 'Playlist API',
							'path' => 'KalturaSupport/tests/PlaylistKalturaApi.qunit.html'
						),
						'PlaylistVertical' => array(
							'title' => "Vertical Layout",
							'path' => 'KalturaSupport/tests/PlaylistVertical.html'
						),
						'ServerSidePlaylist' => array(
							'title' => "Server Side Playlist",
							'path' => '../kWidget/onPagePlugins/serverSidePlaylist/ServerSidePlaylist.php'
						),
						'Carousel' => array(
							'title' => "Carousel",
							'path' => 'KalturaSupport/tests/Carousel.html'
						),
						'PlaylistNoClipList' => array(
							'title' => "Playlist No Clip List",
							'path' => 'KalturaSupport/tests/PlaylistNoClipList.html'
						),
						'PlaylistKalturaMRSS' => array(
							'title' => "Media RSS source",
							'path' => 'KalturaSupport/tests/PlaylistKalturaMRSS.html'
						),
						'PlaylistInitItemEntryId' => array(
							'title' => "Initial EntryId",
							'path' => 'KalturaSupport/tests/PlaylistInitItemEntryId.html'
						)
					)
				),
			)
		),
		'Plugins'=> array(
			'title' => "Plugins",
			'desc' => "Leverage 3rd party services to enhance player capabilities",
			'featureSets' => array(
				'Ads' => array(
					'title' => "Monetization",
					'desc' => 'The Kaltura player supports several systems for video monitization.',
					'testfiles' => array(
						'kvast' => array(
							'title' => 'VAST Preroll & Companion',
							'path' => 'KalturaSupport/tests/AdFlashvarVastDoubleClickCompanion.qunit.html'
						),
						'kopenx' => array(
							'title' => 'VAST OpenX, Preroll & Overlay',
							'path' => 'KalturaSupport/tests/AdSupportOpenX.html'
						),
						'kbumper' => array(
							'title' => 'Bumper video',
							'path' => 'KalturaSupport/tests/BumperVideoNoAdd.qunit.html'
						),
						'kcuepoints' => array(
							'title' => 'Kaltura Ad Cue Points',
							'path' => 'KalturaSupport/tests/CuePointsMidrollVast.html'
						),
						'DoubleClick' => array(
							'title' => "DoubleClick",
							'path' => 'DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html'
						),
						'FreeWheel' => array(
							'title' => "FreeWheel",
							'path' => 'FreeWheel/tests/FreeWheelPlayer.html'
						),
						'Tremor' => array(
							'title' => "Tremor",
							'path' => 'Tremor/tests/TremorPrerollPostroll.qunit.html'
						),
					)
				),
				
				'Analytics' => array(
					'title' => 'Analytics',
					'desc' => 'The Kaltura player supports several systems for tracking video playback',
					'testfiles' => array(
						'kanalytics' => array( 
							'title' => 'Kaltura Analytics',
							'path' => 'KalturaSupport/tests/KalturaAnalytics.qunit.html',
						),
						'GoogleAnalytics' => array(
							'title' => 'Google Analytics',
							'path' => 'GoogleAnalytics/tests/GoogleAnalytics.qunit.html',
						),
						'NielsenVideoCensus' => array(
							'title' => 'Nielsen VideoCensus',
							'path' => 'NielsenVideoCensus/tests/ShortFromNielsenVideoCensus.html',
						),
						'ComscoreAnalytics' => array(
							'title' => 'Comscore Analytics',
							'path' => 'Comscore/tests/Comscore.html',
						),
						'NielsenCombined' => array(
							'title' => 'Nielsen Combined',
							'path' => 'NielsenCombined/tests/NielsenCombinedPlayer.qunit.html',
						),
						'NielsenCombinedFreeWheel' => array(
							'title' => 'Nielsen Combined & FreeWheel',
							'path' => 'NielsenCombined/tests/IntegrationFreeWheelNielsen.html',
						),
						'OmnitureSiteCatalyst15' => array(
							'title' => 'Omniture SiteCatalyst 15',
							'path' => 'Omniture/tests/siteCatalyst15.qunit.html',
						)
					)
				),
				
				'On_Page_Plugins' => array(
					'title' => 'On Page Plugins',
					'desc' => 'On page plugins work for both HTML5 and flash with a single piece of code.',
					'testfiles' => array(
						'chaptersView' => array(
							'title' => 'Chapters View',
							'path' => '../kWidget/onPagePlugins/chapters/chaptersView.qunit.html'
						),
						'videoDetailsBlock' => array(
							'title' => 'Video Details Block',
							'path' => '../kWidget/onPagePlugins/videoDetailsBlock/videoDetailsBlock.qunit.html'
						),
						'playlistOnPage' => array(
							'title' => 'Playlist On Page',
							'path' => '../kWidget/onPagePlugins/playlistOnPage/playlistOnPage.qunit.html'
						),
					)
				),
			)
		),
		'Customization' => array(
			'title' => "Customization",
			'desc' => "Tools for customizing the look and feel of the player and on-page display",
			'featureSets' => array(
				'Custom_Players' => array(
					'title' => "Player Appearance",
					'desc' => 'The Kaltura supports loading external CSS and JS to customize players look and feel',
					'testfiles' => array(
						'ExternalResources' => array(
							'title' => 'External Resources',
							'path' => 'KalturaSupport/tests/ExternalResources.qunit.html'
						),
						/*'CustomSkin' => array(
							'title' => 'Custom Skin',
							'path' => 'KalturaSupport/tests/CustomSkin.html'
						),
						'CustomSkinAudioPlayer' => array(
							'title' => 'Custom Audio Player Skin',
							'path' => 'KalturaSupport/tests/CustomSkinAudioPlayer.html'
						)*/
					)
				),
				
				'Player_Features' => array(
					'title' => "Player features",
					'desc' => 'Player features',
					'testfiles' => array(
						'Watermark' => array(
							'title' => 'Player Watermark',
							'path' => 'KalturaSupport/tests/WatermarkTest.qunit.html'
						),
						'branding' => array(
							'title' => 'Custom Branding',
							'path' => 'KalturaSupport/tests/branding.html'
						),
						'TitlePlayer' => array(
							'title' => 'Title Player',
							'path' => 'KalturaSupport/tests/TitlePlayer.qunit.html'
						),
						'ShareSnippet' => array(
							'title' => 'Share',
							'path' => 'KalturaSupport/tests/ShareSnippet.html'
						),
						'FlavorSelector' => array(
							'title' => 'Flavor Selection',
							'path' => 'KalturaSupport/tests/FlavorSelector.preferedFlavorBR.qunit.html'
						),
					)
				),
			) 
		),
		'Tools' => array(
			'title' => "Integration tools",
			'desc' => "Front end tools from embedding content, api helpers and sample integration code",
			'featureSets' => array(
		
				'Embedding'  => array(
					'title' => 'Embedding the kaltura player',
					'desc' => 'These files cover basic embedding from <a href="#rewrite">legacy</a> object embed, to the dynamic <a href="#kwidget">kWidget</a> embed method', 
					'testfiles' =>array(
						'kwidget' => array(
							'title' => 'Dynamic embed',
							'path' => 'KalturaSupport/tests/kWidget.embed.qunit.html'
						),
						'autoEmbed' => array(
							'title' => 'Auto embed',
							'path' => 'KalturaSupport/tests/AutoEmbed.qunit.html'
						),
						'thumb' => array( 
							'title' => 'Thumbnail embed',
							'path' => 'KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html',
						),
						'referenceId' => array(
							'title' => 'Reference Id',
							'path' => 'KalturaSupport/tests/ReferenceId.html'
						),
						'kwidgetPlaylist' => array( 
							'title' => 'kWidget playlist',
							'path' => 'KalturaSupport/tests/kWidget.embed.playlist.qunit.html'
		 				),
						'rewrite' => array(
							'title' => 'Object rewrite ( legacy )',
							'path' => 'KalturaSupport/tests/BasicPlayer.qunit.html'
						),
		 				'swfObject' => array(
		 					'title' => 'swfObject ( legacy )', 
							'path' => 'KalturaSupport/tests/EmbedSWFObject.2.2.qunit.html'
		 				),
						'Flashembed' => array(
		 					'title' => 'flashembed ( legacy )', 
							'path' => 'KalturaSupport/tests/Flashembed.onPageLinks.qunit.html'
						)
		 			)
				), // Embedding
				
				
				'Player_API' => array(
					'title' => "Player API",
					'desc' => 'The Kaltura player includes a robust API to build custom media experiences.',
					'testfiles' => array(
						'kbind' => array(
							'title' => 'kBind and kUnbind',
							'path' => 'KalturaSupport/tests/kBind_kUnbind.qunit.html'
						),
						'changeMedia' => array(
							'title' => 'Change Media Entry',
							'path' => 'KalturaSupport/tests/ChangeMediaEntry.qunit.html'
						),
						'BufferEvents' => array(
							'title' => 'Buffer Events',
							'path' => 'KalturaSupport/tests/BufferEvents.qunit.html'
						),
						'SeekApi' => array(
							'title' => 'Seek Api', 
							'path' => 'KalturaSupport/tests/SeekApi.qunit.html'
						),
						'CustomMetaData' => array( 
							'title' => 'Access Custom Meta Data',
							'path' => 'KalturaSupport/tests/CustomMetaData.html'
						),
						'showAlert' =>  array(
							'title' => 'Show Alert',
							'path' => 'KalturaSupport/tests/showAlert.html'
						),
						'AutoPlay' => array(
							'title' => 'Auto play',
							'path' => 'KalturaSupport/tests/AutoPlay.qunit.html'
						)
					)
				),
				
				'Stand_Alone_Tools' => array(
					'title' => 'Stand alone tools',
					'desc' => 'Stand alone tools',
					'testfiles' => array(
						'getSources' => array(
							'title' => 'Get Sources ( raw video tag )',
							'path' => '../kWidget/tests/kWidget.getSources.html',
						),
						'selfHostedSources' => array(
							'title' => 'Self Hosted Player Sources',
							'path' => 'EmbedPlayer/tests/Player_Sources.html'
						),
					)
				),
			)
		)
	);
