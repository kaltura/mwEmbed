<?php 
	return array(
		array(
			'title' => "Key features",
			'desc' => "Key features of the kaltura front end platform.",
			'featureSets' => array(
				array(
					'title' => 'Accessibility and Close Captions',
					'desc' => 'The kaltura captions player api, supports srt and ttml formats.',
					'testfiles' => array(
						array(
							'title' => 'Captions API',
							'path' => 'KalturaSupport/tests/ClosedCaptions.html',
						),
						/*
						'InVideo Search' => array(
							'title' => 'In-Video Search',
							'path' => '',
						),*/
						array(
                            'title' => 'Captions, TTML format',
                            'path' => 'KalturaSupport/tests/CaptionsCustomVarsTTML.qunit.html',
						),
						array(
							'title' => 'PlyMedia Captions',
							'path' => 'Plymedia/tests/Plymedia_Kaltura.html',
						)
					)
				),
				array(
					'title' => 'Live',
					'desc' => 'The kaltura LIVE supports sending streams to both HLS (iOS / mobile) and HDS ( flahs ).',
					'testfiles' => array(
						array(
							'title' => 'Live Stream',
							'path' => 'KalturaSupport/tests/LiveStream.html',
						),
					),
				),
				array(
					'title' => "Access Controls",
					'desc' => 'Provides mechanism to control access to player content',
					'testfiles' => array(
						array(
							'title' => 'Custom Control Message',
							'path' => 'KalturaSupport/tests/AccessControlCustomMessage.html'
						),
						array(
							'title' => 'Access Control Preview',
							'path' => 'KalturaSupport/tests/AccessControlPreview.qunit.html'
						),
						array(
							'title' => 'Playlist Block Entry',
							'path' => 'KalturaSupport/tests/AccessControlPlaylistBlockMobileFirstEntry.qunit.html'
						)
					)
				),
				array(
					'title' => "Playlists",
					'desc' => 'Playlists support is built into the kaltura player',
					'testfiles' => array(
						array(
							'title' => 'Playlist API',
							'path' => 'KalturaSupport/tests/PlaylistKalturaApi.qunit.html'
						),
						array(
							'title' => 'Playlist On Page',
							'path' => '../kWidget/onPagePlugins/playlistOnPage/playlistOnPage.qunit.html'
						),
						array(
							'title' => "Server Side Playlist",
							'path' => '../kWidget/onPagePlugins/serverSidePlaylist/ServerSidePlaylist.php'
						),
						array(
							'title' => "Vertical Layout",
							'path' => 'KalturaSupport/tests/PlaylistVertical.html'
						),
						array(
							'title' => "Carousel",
							'path' => 'KalturaSupport/tests/Carousel.html'
						),
						array(
							'title' => "Playlist No Clip List",
							'path' => 'KalturaSupport/tests/PlaylistNoClipList.html'
						),
						/*'PlaylistKalturaMRSS' => array(
							'title' => "Media RSS source",
							'path' => 'KalturaSupport/tests/PlaylistKalturaMRSS.html'
						),*/
						array(
							'title' => "Initial EntryId",
							'path' => 'KalturaSupport/tests/PlaylistInitItemEntryId.html'
						)
					)
				),
			)
		),
		array(
			'title' => "Plugins",
			'desc' => "Leverage 3rd party services to enhance player capabilities",
			'featureSets' => array(
				array(
					'title' => "Monetization",
					'desc' => 'The Kaltura player supports several systems for video monitization.',
					'testfiles' => array(
						array(
							'title' => 'VAST Preroll & Companion',
							'path' => 'KalturaSupport/tests/AdFlashvarVastDoubleClickCompanion.qunit.html'
						),
						array(
							'title' => 'VPAID',
							'path' => 'AdSupport/tests/VPAID.html'
						),
						array(
							'title' => 'Ad Patterns Playlist',
							'path' => 'KalturaSupport/tests/AdPatternPlaylist.qunit.html'
						),
						array(
							'title' => 'VAST 3 Ad Pods',
							'path' => 'KalturaSupport/tests/AdPodsVast3.html'
						),
						array(
							'title' => 'Bumper video',
							'path' => 'KalturaSupport/tests/BumperVideoNoAdd.qunit.html'
						),
						array(
							'title' => 'Kaltura Ad Cue Points',
							'path' => 'KalturaSupport/tests/CuePointsMidrollVast.html'
						),
						array(
							'title' => "DoubleClick",
							'path' => 'DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html'
						),
						array(
							'title' => "FreeWheel",
							'path' => 'FreeWheel/tests/FreeWheelPlayer.html'
						),
						array(
							'title' => "Tremor",
							'path' => 'Tremor/tests/TremorPrerollPostroll.qunit.html'
						),
					)
				),
				
				array(
					'title' => 'Analytics',
					'desc' => 'The Kaltura player supports several systems for tracking video playback',
					'testfiles' => array(
						array( 
							'title' => 'Kaltura Analytics',
							'path' => 'KalturaSupport/tests/KalturaAnalytics.qunit.html',
						),
						array( 
							'title' => 'Akamai Analytics',
							'path' => 'AkamaiAnalytics/tests/AkamaiAnalytics.qunit.html',
						),
						array(
							'title' => 'Google Analytics',
							'path' => 'GoogleAnalytics/tests/GoogleAnalytics.qunit.html',
						),
						array(
							'title' => 'Nielsen VideoCensus',
							'path' => 'NielsenVideoCensus/tests/ShortFromNielsenVideoCensus.html',
						),
						array(
							'title' => 'Comscore Analytics',
							'path' => 'Comscore/tests/Comscore.html',
						),
						array(
							'title' => 'Nielsen Combined',
							'path' => 'NielsenCombined/tests/NielsenCombinedPlayer.qunit.html',
						),
						array(
							'title' => 'Nielsen Combined & FreeWheel',
							'path' => 'NielsenCombined/tests/IntegrationFreeWheelNielsen.html',
						),
						array(
							'title' => 'Omniture sCode config',
							'path' => '../kWidget/onPagePlugins/omnitureOnPage/OmnitureOnPage.qunit.html',
						),
						array(
							'title' => 'Omniture manual config',
							'path' => 'Omniture/tests/siteCatalyst15.qunit.html',
						)
					),
				),
				array(
					'title' => 'Engagement',
					'desc' => 'On page widgets load the same plugin for both flash and HTML5',
					'testfiles' => array(
						array(
							'title' => 'Chapters',
							'path' => '../kWidget/onPagePlugins/chapters/chaptersView.qunit.html'
						),
						array(
							'title' => 'Chapters Editor',
							'path' => '../kWidget/onPagePlugins/chapters/chaptersEdit.qunit.html'
						),
						array(
							'title' => 'AttracTV',
							'path' => 'AttracTV/tests/AttracTV.qunit.html'
						),
						array(
							'title' => 'LimeSurvey On Video',
							'path' => '../kWidget/onPagePlugins/limeSurveyCuePointForms/limeSurveyCuePointForms.qunit.html'
						),
						array(
							'title' => 'Video Details Block',
							'path' => '../kWidget/onPagePlugins/videoDetailsBlock/videoDetailsBlock.qunit.html'
						),
					)
				),
				/*'Transport' => array(
					'title' => 'Transport',
					'desc' => 'These plugins help optimize video delivery',
					'testfiles' => array(
						'Peer5' => array( 
							'title' => 'Peer5 HTML5 P2P',
							'path' => 'Peer5/tests/Peer5.qunit.html',
						),
					)
				),*/
			)
		),
		array(
			'title' => "Customization",
			'desc' => "Tools for customizing the look and feel of the player and on-page display",
			'featureSets' => array(
				array(
					'title' => "Player Appearance",
					'desc' => 'The Kaltura supports loading external CSS and JS to customize players look and feel',
					'testfiles' => array(
						array(
							'title' => 'External Resources',
							'path' => 'KalturaSupport/tests/ExternalResources.qunit.html'
						),
						array(
							'title' => 'Chromeless No Controls',
							'path' => 'KalturaSupport/tests/ChromelessPlayer.qunit.html'
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
				
				array(
					'title' => "Player features",
					'desc' => 'Player features',
					'testfiles' => array(
						array(
							'title' => 'Player Watermark',
							'path' => 'KalturaSupport/tests/WatermarkTest.qunit.html'
						),
						array(
							'title' => 'Custom Branding',
							'path' => 'KalturaSupport/tests/branding.html'
						),
						array(
							'title' => 'Title Player',
							'path' => 'KalturaSupport/tests/TitlePlayer.qunit.html'
						),
						array(
							'title' => 'Share',
							'path' => 'KalturaSupport/tests/ShareSnippet.html'
						),
						array(
							'title' => 'Flavor Selection',
							'path' => 'KalturaSupport/tests/FlavorSelector.preferedFlavorBR.qunit.html'
						),
						array(
							'title' => "Playback Rate Selector",
							'path' => 'KalturaSupport/tests/PlaybackRate.qunit.html'
						)
					)
				),
			) 
		),
		array(
			'title' => "Integration tools",
			'desc' => "Front end tools from embedding content, api helpers and sample integration code",
			'featureSets' => array(
		
				array(
					'title' => 'Embedding the kaltura player',
					'desc' => 'These files cover basic embedding from <a href="#rewrite">legacy</a> object embed, to the dynamic <a href="#kwidget">kWidget</a> embed method', 
					'testfiles' =>array(
						array(
							'title' => 'Dynamic embed',
							'path' => 'KalturaSupport/tests/kWidget.embed.qunit.html'
						),
						array(
							'title' => 'Auto embed',
							'path' => 'KalturaSupport/tests/AutoEmbed.html'
						),
						array( 
							'title' => 'Thumbnail embed',
							'path' => 'KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html',
						),
						array(
							'title' => 'Reference Id',
							'path' => 'KalturaSupport/tests/ReferenceId.html'
						),
						array( 
							'title' => 'kWidget playlist',
							'path' => 'KalturaSupport/tests/kWidget.embed.playlist.qunit.html'
		 				),
						array(
							'title' => 'Object rewrite ( legacy )',
							'path' => 'KalturaSupport/tests/BasicPlayer.qunit.html'
						),
		 				array(
		 					'title' => 'swfObject ( legacy )', 
							'path' => 'KalturaSupport/tests/EmbedSWFObject.2.2.qunit.html'
		 				),
						array(
		 					'title' => 'flashembed ( legacy )', 
							'path' => 'KalturaSupport/tests/Flashembed.onPageLinks.qunit.html'
						),
						array(
							'title' => 'Player Rules',
							'path' => 'KalturaSupport/tests/UserAgentPlayerRules.html'
						)
		 			)
				), // Embedding
				
				
				array(
					'title' => "Player API",
					'desc' => 'The Kaltura player includes a robust API to build custom media experiences.',
					'testfiles' => array(
						array(
							'title' => 'kBind and kUnbind',
							'path' => 'KalturaSupport/tests/kBind_kUnbind.qunit.html'
						),
						array(
							'title' => 'Change Media Entry',
							'path' => 'KalturaSupport/tests/ChangeMediaEntry.qunit.html'
						),
						array(
							'title' => 'Buffer Events',
							'path' => 'KalturaSupport/tests/BufferEvents.qunit.html'
						),
						array(
							'title' => 'Seek Api', 
							'path' => 'KalturaSupport/tests/SeekApi.qunit.html'
						),
						array(
							'title' => "Start End Preview",
							'path' => 'KalturaSupport/tests/PlayFromOffsetStartTimeToEndTime.html'
						),
						array( 
							'title' => 'Access Custom Meta Data',
							'path' => 'KalturaSupport/tests/CustomMetaData.html'
						),
						array(
							'title' => 'Show Alert',
							'path' => 'KalturaSupport/tests/showAlert.html'
						),
						array(
							'title' => 'Auto play',
							'path' => 'KalturaSupport/tests/AutoPlay.qunit.html'
						)
					)
				),
				
				array(
					'title' => 'Stand alone tools',
					'desc' => 'Stand alone tools',
					'testfiles' => array(
						array(
							'title' => 'Get Flavor Urls',
							'path' => '../kWidget/tests/kWidget.getSources.html',
						),
						array(
							'title' => 'Self Hosted Player Sources',
							'path' => 'EmbedPlayer/tests/Player_Sources.html'
						),
					)
				),
			)
		)
	);
