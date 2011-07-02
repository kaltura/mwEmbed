/**
* Adds bumper support
*/
// ( can be removed once we move to the new resource loader )
var bumperPlugin = true;
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		
		//<plugin id="bumper" bumperentryid="1_187nvs4c" clickurl="http://www.nokia.com" lockui="true" playonce="false" presequence="1" width="100%" height="100%"></plugin>
		var $bumbPlug = $uiConf.find("plugin#bumper");
		if(  $bumbPlug.length ){
			var bumperEntryId = $bumbPlug.attr('bumperentryid');
			var bumperClickUrl = $bumbPlug.attr('clickurl');
			var clickedBumper = false;
			embedPlayer.bumperPlayCount = 0;
			if( !bumperEntryId ){
				callback();
				return ;
			}
			// Get the bumper entryid			
			mw.log( "KWidget:: checkUiConf: get sources for " + bumperEntryId);
			var originalSrc = embedPlayer.getSrc();
			mw.getEntryIdSourcesFromApi( embedPlayer.kwidgetid, bumperEntryId, function( sources ){
				// Check if we are doing ads ( should always come before bumper ) and add bumper to 
				// ad timeline instead of binding to play: 
				if( embedPlayer.ads ){
					mw.addAdToPlayerTimeline( embedPlayer, 'bumper', {
						'ads': [
							{
								'videoFiles' :sources,
								'clickThrough' : bumperClickUrl
							}
						]
					}); 
					callback();
					return ;
				}
				
				// Add to the bumper per entry id:						
				$j( embedPlayer ).unbind('play.bumper').bind('play.bumper', function(){
					// Don't play the bumper 
					// we don't use the "playonce" attribute (check of the kdp is function)
					//if( $bumbPlug.attr('playonce') == "true" && embedPlayer.bumperPlayCount >= 1){
					if( embedPlayer.bumperPlayCount >= 1){						
						return true;
					}
					if( $bumbPlug.attr('playonce') == "false" && embedPlayer.bumperPlayCount > embedPlayer.donePlayingCount ){
						// Don't play the bumper again we are done playing once
						return true;
					}
					
					embedPlayer.bumperPlayCount++;
					
					if( $bumbPlug.attr('lockui') == "true" ){
						embedPlayer.disableSeekBar();
					}
					// Call the special insertAndPlaySource function ( used for ads / video inserts ) 
					embedPlayer.switchPlaySrc( embedPlayer.getCompatibleSource( sources ), 
						function(){
							if( bumperClickUrl ){
								$j( embedPlayer ).bind( 'click.bumper', function(){
									// try to do a popup:
									if(!clickedBumper){
										clickedBumper = true;
										window.open( bumperClickUrl );								
									}
									return true;							
								})
							}
						}, function(){
							// restore the original source:
							embedPlayer.switchPlaySrc( originalSrc );
							embedPlayer.enableSeekBar();
							$j( embedPlayer ).unbind('click.bumper');
					});
				});
				
				// run callback once bumper has been looked up
				callback();
			});
			/* TODO better error handle for failed bumper lookup */
		} else {
			// Don't block player display if no bumper found 
			callback();
		}
	});
});
