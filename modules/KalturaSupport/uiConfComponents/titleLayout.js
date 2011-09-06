( function( mw, $ ) {
	// xxx can be removed once we move to RL
	window.titleLayout = true;
	
	// 	Check for the Title 
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check for Titles: 
			if( embedPlayer.$uiConf.find( '#TopTitleScreen' ).length ){
				mw.log("add title to interace")
				
			}
			// Continue trigger event regardless of if ui-conf is found or not
			callback();
		});
	});
	
})( mediaWiki, jQuery );