/*
* Loader for UploadWizard module:
*/

// Scope everything in "mw"  ( keeps the global namespace clean ) 
( function( mw ) {

	mw.addMessages( {
		"mwe-loading-upwiz" : "Loading upload wizard"
	});
	
	// Add class file paths ( From ROOT )
	mw.addResourcePaths( {
		"mw.LanguageUpWiz"		: "js/mw.LanguageUpWiz.js",
		"mw.UploadWizard"		: "js/mw.UploadWizard.js",
		"mw.style.uploadWizard" 	: "styles/uploadWizard.css",
		
		"mw.UploadApiProcessor"		: "js/mw.UploadApiProcessor.js",
		"mw.IframeTransport"		: "js/mw.IframeTransport.js",
		"mw.ApiUploadHandler"		: "js/mw.ApiUploadHandler.js",
		"mw.DestinationChecker"		: "js/mw.DestinationChecker.js",


		"mw.MockUploadHandler"		: "js/mw.MockUploadHandler.js",		

		"$j.fn.tipsy"			: "js/jquery/plugins/jquery.tipsy.js",
		"mw.style.tipsy"		: "styles/jquery.tipsy.css",

		"$j.fn.morphCrossfade"		: "js/jquery/plugins/jquery.morphCrossfade.js",

		"$j.fn.validate"		: "js/jquery/plugins/jquery.validate.js",

		"$j.fn.arrowSteps"		: "js/jquery/plugins/jquery.arrowSteps.js",

		"$j.fn.mwCoolCats"		: "js/jquery/plugins/jquery.mwCoolCats.js",

		"mw.style.arrowSteps"		: "styles/jquery.arrowSteps.css",
		"mw.style.mwCoolCats"		: "styles/jquery.mwCoolCats.css"
	});	
	
	//Set a variable for the base upload interface for easy inclution
	// 
	// var baseUploadlibraries = [
	// 	[
	// 		'mw.UploadHandler',
	// 		'mw.UploadInterface',
	// 		'$j.ui'
	// 	],
	// 	[
	// 		'$j.ui.progressbar',
	// 		'$j.ui.dialog',
	// 		'$j.ui.draggable',
	// 		'$j.fn.autocomplete'
	// 	]
	// ];
	// 	
	// var mwBaseFirefoggReq = baseUploadlibraries.slice( 0 )
	// mwBaseFirefoggReq[0].push('mw.Firefogg');
	// 

	var libraries = [ 
		[
			'$j.ui',
			'$j.ui.progressbar',
			'$j.ui.dialog',
			'$j.ui.draggable',			
			'$j.ui.datepicker',
			'$j.effects',
			'$j.effects.slide',
			//'$j.effects.pulsate',
			'$j.fn.autocomplete',
			'$j.fn.tipsy',
			'mw.style.tipsy',
			'$j.fn.morphCrossfade',
			'$j.fn.validate',
			'$j.fn.arrowSteps',
			'$j.fn.mwCoolCats',
			'mw.style.arrowSteps',
			'mw.style.autocomplete',
			'mw.style.mwCoolCats'
		],
		[
			'mw.LanguageUpWiz',
			'mw.IframeTransport',
			'mw.ApiUploadHandler',
			'mw.DestinationChecker',
			'mw.UploadWizard',
			'mw.style.uploadWizard'
		],
	];

	var testLibraries = libraries.slice( 0 )
	testLibraries.push( [ 'mw.MockUploadHandler' ] );
 
	/**
	* Note: We should move relevant parts of these style sheets to the addMedia/css folder 
	* phase 2: We should separate out sheet sets per sub-module:
	*/ 
	
	mw.addModuleLoader( 'UploadWizard.UploadWizard', libraries );
	
	mw.addModuleLoader( 'UploadWizard.UploadWizardTest', testLibraries );

} )( window.mw );
