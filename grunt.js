/**
 * This is a POC to demonstrate running the QUnit test suite from within mwEmbed
 *
 * Setup: make sure you have a working mwEmbed at http://localhost/kaltura.html5/mwEmbedLoader.php
 *
 * Dependencies: node.js, phantomJS, grunt
 *
 * 1. install node.js and phantomJS however your OS requires
 * 2. install grunt with `npm install -g grunt`
 * 3. from the root directory of mwEmbed, run `grunt qunit` to run all workingish tests
 * 4. to run the 'nonworking' tests: `grunt qunit:timeout`
 * 5. to run the complete set of tests, continuing past errors, `grunt qunit:complete --force`
 */


module.exports = function(grunt) {

	grunt.initConfig({
		qunit: {
			all: [
				'http://localhost/kaltura.html5/kWidget/onPagePlugins/descriptionBox/descriptionBox.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/AkamaiAnalytics/tests/AkamaiAnalytics.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/Omniture/tests/siteCatalyst15.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlNewApi.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPlaylistBlockMobileFirstEntry.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AlertForCookies.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/BasicPlayer.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/BufferEvents.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ChangeMediaEntry.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/EmptyPlayer.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/Flashembed.onPageLinks.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/FlashvarsReadyAtJsCallbackTime.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/FlavorSelector.preferedFlavorBR.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/JsLoaderInjectAfterDomReady.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/KalturaAnalytics.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.emptyPlayer.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.playlist.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.withOnPageObjects.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/LegacyMultipleDynamicEmbeds.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/MyLogo.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/NoHLSforLessThan10Seconds.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PlayerEventsKdpReady.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PlaylistInitItemEntryIdNonExistingEntry.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PlaylistKalturaApi.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/TitlePlaylist.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/TitlePlayer.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ReplaceSources.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PrototypeJsAndJQuery.qunit.html?runQunitTests=1'
			],
			timeout: [
				'http://localhost/kaltura.html5/kWidget/onPagePlugins/playlistOnPage/playlistOnPage.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/GoogleAnalytics/tests/GoogleAnalytics.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/NielsenCombined/tests/NielsenCombinedPlayer.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPreview.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPlaylistBlockMobileSecondEntry.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPreviewEmbedLevelKS.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AdFlashvarVastDoubleClickCompanion.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AudioMP3Entry.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AutoPlay.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/BumperVideoNoAdd.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsCustomVars.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsCustomVarsTTML.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsUnderPlayer.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/DownloadLinkPlayer.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/EmbedSWFObject.2.2.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ExternalResources.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kBind_kUnbind.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embedParams.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/Loop.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/SeekApi.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsCustomVars.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html?runQunitTests=1', 
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/WatermarkTest.qunit.html?runQunitTests=1',
				'http://localhost/kaltura.html5/modules/KalturaSupport/tests/UseHLS_WhereAvailable.qunit.html?runQunitTests=1'
			],
			complete: ['http://localhost/kaltura.html5/kWidget/onPagePlugins/descriptionBox/descriptionBox.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/kWidget/onPagePlugins/playlistOnPage/playlistOnPage.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/AkamaiAnalytics/tests/AkamaiAnalytics.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/DoubleClick/tests/DoubleClickManagedPlayerAdApi.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/GoogleAnalytics/tests/GoogleAnalytics.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/NielsenCombined/tests/NielsenCombinedPlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/Omniture/tests/siteCatalyst15.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlNewApi.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPlaylistBlockMobileFirstEntry.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPlaylistBlockMobileSecondEntry.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPreview.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AccessControlPreviewEmbedLevelKS.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AdFlashvarVastDoubleClickCompanion.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AlertForCookies.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AudioMP3Entry.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/AutoPlay.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/BasicPlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/BufferEvents.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/BumperVideoNoAdd.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsCustomVars.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsCustomVarsTTML.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/CaptionsUnderPlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ChangeMediaEntry.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/DownloadLinkPlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/EmbedSWFObject.2.2.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/EmptyPlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ExternalResources.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/Flashembed.onPageLinks.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/FlashvarsReadyAtJsCallbackTime.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/FlavorSelector.preferedFlavorBR.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/JsLoaderInjectAfterDomReady.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/KalturaAnalytics.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kBind_kUnbind.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.emptyPlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.playlist.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embed.withOnPageObjects.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/kWidget.embedParams.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/LegacyMultipleDynamicEmbeds.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/Loop.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/MyLogo.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/NoHLSforLessThan10Seconds.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PlayerEventsKdpReady.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PlaylistInitItemEntryIdNonExistingEntry.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PlaylistKalturaApi.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/PrototypeJsAndJQuery.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ReplaceSources.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/SeekApi.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/ThumbnailEmbedManyPlayers.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/TitlePlayer.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/TitlePlaylist.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/UseHLS_WhereAvailable.qunit.html?runQunitTests=1', 'http://localhost/kaltura.html5/modules/KalturaSupport/tests/WatermarkTest.qunit.html?runQunitTests=1']
		}
	});

	grunt.registerTask('default', 'qunit');
};
