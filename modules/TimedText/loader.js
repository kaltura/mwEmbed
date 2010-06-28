/**
* TimedText loader.    
*/
// Scope everything in "mw"  ( keeps the global namespace clean ) 
( function( mw ) {
	
	mw.addResourcePaths( {
		"mw.TimedText" : "mw.TimedText.js",
		"mw.style.TimedText" : "css/mw.style.TimedText.css",
			
		"mw.TimedTextEdit" : "mw.TimedTextEdit.js",
		"mw.style.TimedTextEdit" : "css/mw.style.TimedTextEdit.css",
		
		"RemoteMwTimedText" : "remotes/RemoteMwTimedText.js"
	} );
	
	mw.setDefaultConfig( {
			// If the Timed Text interface should be displayed: 
		// 'always' Displays link and call to contribute always
		// 'auto' Looks for child timed text elements or "apiTitleKey" & load interface
		// 'off' Does not display the timed text interface
		"TimedText.showInterface" : "auto",
		
		/**
		* If the "add timed text" link / interface should be exposed
		*/
		'TimedText.showAddTextLink' : true
	});
	
	var mwTimedTextRequestSet = [ 
		'$j.fn.menu', 
		'mw.TimedText',
		'mw.style.TimedText',
		'mw.style.jquerymenu'
	];
	
	// TimedText module 
	mw.addModuleLoader( 'TimedText', mwTimedTextRequestSet );
	
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
		// Check for the TimedText.showInterface config flag 
		if( mw.getConfig( 'TimedText.showInterface' ) == 'always' ) {
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
	mw.addModuleLoader( 'TimedText.Edit', [ 
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
	]);

} )( window.mw );