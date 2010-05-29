/**
* TimedText loader.    
*/
// Scope everything in "mw"  ( keeps the global namespace clean ) 
( function( mw ) {
	
mw.addClassFilePaths( {
	"mw.TimedText" : "mw.TimedText.js",
	"mw.style.TimedText" : "css/mw.style.TimedText.css",
		
	"mw.TimedTextEdit" : "mw.TimedTextEdit.js",
	"mw.style.TimedTextEdit" : "css/mw.style.TimedTextEdit.css",
	
	"RemoteMwTimedText" : "remotes/RemoteMwTimedText.js"
} );

var mwTimedTextRequestSet = [ 
	'$j.fn.menu', 
	'mw.TimedText',
	'mw.style.TimedText',
	'mw.style.jquerymenu'
];

// TimedText module
mw.addModuleLoader( 'TimedText', function( callback ) {
	mw.load( mwTimedTextRequestSet , function() {
		callback( 'TimedText' );
	} );
});

/**
* Setup the load embedPlayer visit tag addSetupHook function 
*
* Check if the video tags in the page support timed text
* this way we can add our timed text libraries to the player 
* library request.
*/

// Update the player loader request with timedText library if the embedPlayer
// includes timedText tracks. 
$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {
	
	var mwLoadTimedTextFlag = false;
	// Check for the textInterface config flag 
	if( mw.getConfig( 'textInterface' ) == 'always' ) {
		mwLoadTimedTextFlag = true;	
	}
		
	// If add timed text flag not already set check for track, and sources
	if( ! mwLoadTimedTextFlag ) {
		if( $j( playerElement ).find( 'track' ).length != 0 ) {
			// Has an track child include timed text request
			mwLoadTimedTextFlag = true;
		}
		// Check for ROE pointer or apiTitleKey
		if ( $j( playerElement ).attr('roe') 
			|| $j( playerElement ).attr( 'apiTitleKey' ) )
		{
			mwLoadTimedTextFlag = true;
		}
	}		
	
	// Add timed text items if flag set. 
	// its oky if we merge in multiple times the loader can handle it
	if( mwLoadTimedTextFlag ) {
		$j.merge( classRequest, mwTimedTextRequestSet );
	}	

} );
	

// TimedText editor:
mw.addModuleLoader( 'TimedText.Edit', function( callback ) {
	mw.load([ 
		[
			'$j.ui',
			'$j.fn.menu', 
			"mw.style.jquerymenu",
			
			'mw.TimedText',
			'mw.style.TimedText',
			
			'mw.TimedTextEdit',
			'mw.style.TimedTextEdit'
		],
		[
			'$j.ui.dialog',
			'$j.ui.tabs'
		]
	], function( ) {
		callback( 'TimedText.Edit' );
	});
});

} )( window.mw );