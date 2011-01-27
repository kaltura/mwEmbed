/**
* Adds bumper support
*/
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
		
		//<plugin id="bumper" bumperentryid="1_187nvs4c" clickurl="http://www.nokia.com" lockui="true" playonce="false" presequence="1" width="100%" height="100%"></plugin>
		
		var $bumbPlug = $uiConf.find("plugin#bumper");
		if(  $bumbPlug.length ){
			var bumperEntryId = $bumbPlug.attr('bumperentryid');
			var bumperClickUrl = $bumbPlug.attr('clickurl');
					
			embedPlayer.bumperPlayCount = 0;
			// Get the bumper entryid			
			if( bumperEntryId ){
				mw.log( "KWidget:: checkUiConf: get sources for " + bumperEntryId);
				var originalSrc = embedPlayer.getSrc();
				mw.getEntryIdSourcesFromApi( $j( embedPlayer ).attr( 'kwidgetid' ), bumperEntryId, function( sources ){
					// Add to the bumper per entry id:						
					$j( embedPlayer ).bind('play', function(){	
						// don't play the bumper 
						if( embedPlayer.bumperPlayCount >= 1){
							return true;
						}	
						embedPlayer.bumperPlayCount++;
						// Call the special insertAndPlaySource function ( used for ads / video inserts ) 
						embedPlayer.switchPlaySrc( sources[0].src, null, function(){
							// restore the orginal source:
							embedPlayer.switchPlaySrc( originalSrc );
						});
					});
					// run callback once bumper has been looked up
					callback();
				});
				/* TODO better error handle for failed bumper lookup */
			}
		} else {
			// Don't block player display if no bumper found 
			callback();
		}
	})
})