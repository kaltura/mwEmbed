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
				['plugin', 'bumperEntryID', 'clickUrl', 'lockUi', 'playOnce', 'preSequence', 'postSequence', 'width', 'height']
		);
		// check if the plugin is enabled and we have an entryId:
		if( !bc.plugin || ! bc.bumperEntryID ){
			callback();
			return ;
		}
		// Get the bumper entryid			
		mw.log( "KWidget:: checkUiConf: get sources for " + bc.bumperEntryID);
		var originalSrc = embedPlayer.getSrc();
		mw.getEntryIdSourcesFromApi( embedPlayer.kwidgetid, bc.bumperEntryID, function( sources ){
			// Load adSupport for player timeline:
			mw.load( 'AdSupport', function(){
				var targetType = ( bc.postSequence == 1 )? 'postroll' : 'bumper';
				mw.addAdToPlayerTimeline( embedPlayer, targetType, {
					'ads': [
						{
							'videoFiles' :sources,
							'clickThrough' : bc.clickUrl
						}
					],
					'lockUI': bc.lockUi,
					'playOnce': bc.playOnce
				}); 
				// done loading bumper code issue callback
				callback();
			});
		});
	});
});
