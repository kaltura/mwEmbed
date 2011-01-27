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
						if( embedPlayer.bumperPlayCount >= 1){
							return true;
						}	
						embedPlayer.bumperPlayCount++;
						// Call the special insertAndPlaySource function ( used for ads / video inserts ) 
						embedPlayer.switchPlaySrc( sources[0].src, null, function(){
							// restore the orginal source:
							embedPlayer.switchPlaySrc( originalSrc );
						});
					})
				});
			}
		}
		// Don't block player display on bumper lookup 
		callback();
	})
})