/**
* Adds bumper support
*/
// ( can be removed once we move to the new resource loader )
var bumperPlugin = true;

$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// <plugin id="bumper" bumperentryid="1_187nvs4c" clickurl="http://www.nokia.com" lockui="true" playonce="false" presequence="1" width="100%" height="100%"></plugin>
		var bc = kWidgetSupport.getPluginConfig(
				embedPlayer,
				$uiConf, 
				'bumper', 
				['bumperEntryID', 'clickUrl', 'lockUi', 'playOnce', 'preSequence', 'width', 'height']
		);
		if( ! bc.bumperEntryID || bc.preSequence == "0" ){
			callback();
			return ;
		}
		// Get the bumper entryid			
		mw.log( "KWidget:: checkUiConf: get sources for " + bc.bumperEntryID);
		var originalSrc = embedPlayer.getSrc();
		mw.getEntryIdSourcesFromApi( embedPlayer.kwidgetid, bc.bumperEntryID, function( sources ){
			// Check if we are doing ads ( should always come before bumper ) and add bumper to 
			// ad timeline instead of binding to play: 
			if( embedPlayer.ads ){
				mw.addAdToPlayerTimeline( embedPlayer, 'bumper', {
					'ads': [
						{
							'videoFiles' :sources,
							'clickThrough' : bc.clickUrl
						}
					]
				}); 
				callback();
				return ;
			}
			// set up initial play count: 
			embedPlayer.bumperPlayCount = 0;
			
			// Add to the bumper per entry id:						
			$j( embedPlayer ).unbind( 'onplay.bumper' ).bind( 'onplay.bumper', function(){
				// Don't play the bumper 
				// we don't use the "playonce" attribute (check of the kdp is function)
				//if( playOnce == "true" && embedPlayer.bumperPlayCount >= 1){
				if( embedPlayer.bumperPlayCount >= 1){						
					return true;
				}
				if( !bc.playOnce && embedPlayer.bumperPlayCount > embedPlayer.donePlayingCount ){
					// Don't play the bumper again, until we are done playing once
					return true;
				}
				
				embedPlayer.bumperPlayCount++;
				
				if( bc.lockUi ){
					embedPlayer.disableSeekBar();
				}
				// Call the special insertAndPlaySource function ( used for ads / video inserts ) 
				embedPlayer.switchPlaySrc( embedPlayer.getCompatibleSource( sources ), 
					function(){
						if( bc.clickUrl ){
							$j( embedPlayer ).bind( 'click.bumper', function(){
								// try to do a popup ( only one click per bumper ) 
								if( !embedPlayer.clickedBumperFlag){
									embedPlayer.clickedBumperFlag = true;
									window.open( bc.clickUrl );								
								}
								return true;							
							});
						}
					}, function(){
						// restore the original source:
						embedPlayer.switchPlaySrc( originalSrc );
						embedPlayer.enableSeekBar();
						$j( embedPlayer ).unbind('click.bumper');
					}
				);
			});
				
			// run callback once bumper has been looked up and all bindings set
			callback();
		});
	});
});
