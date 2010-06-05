/*
 * This script is run on [[Special:UploadWizard]].
 * Creates an interface for uploading files in multiple steps, hence "wizard"
 */

mw.ready( function() {

	// The namespace for media files. We use this to look up what the URL prefix is on this MediaWiki, usually
	// 'Image:' or something like that. Defined in defines.php
	var NS_FILE = 6; 

	mw.load( 'UploadWizard.UploadWizard', function () {		
		mw.setConfig( 'debug', true ); 

		mw.setDefaultConfig( 'uploadHandlerClass', null );

		mw.setConfig( { 
			debug:  true,  
			userName:  wgUserName,  
			userLanguage:  wgUserLanguage, 
			fileExtensions:  wgFileExtensions, 
			token:  wgEditToken, 
			thumbnailWidth:  120,  
			smallThumbnailWidth:  60,  
			maxAuthorLength: 50,
			minAuthorLength: 2,

			// not for use with all wikis. 
			// The ISO 639 code for the language tagalog is "tl".
			// Normally we name templates for languages by the ISO 639 code.
			// Commons already had a template called 'tl:  though.
			// so, this workaround will cause tagalog descriptions to be saved with this template instead.
			languageTemplateFixups:  { tl: 'tgl' }, 
			defaultLicenses:  [ 'cc_by_sa_30' ], 

			// usually, but not always, File: 
			fileNamespace: wgCanonicalNamespaceNames[NS_FILE],


			// XXX this is horribly confusing -- some file restrictions are client side, others are server side
			// the filename prefix blacklist is at least server side -- all this should be replaced with PHP regex config
			//
			// we can export these to JS if we so want.
			// filenamePrefixBlacklist: wgFilenamePrefixBlacklist,
			// 
			// filenameRegexBlacklist: [
			//	/^(test|image|img|bild|example?[\s_-]*)$/,  // test stuff
			//	/^(\d{10}[\s_-][0-9a-f]{10}[\s_-][a-z])$/   // flickr
			// ]
		});

		var uploadWizard = new mw.UploadWizard();
		uploadWizard.createInterface( '#upload-wizard' );
	
	} );
} );

