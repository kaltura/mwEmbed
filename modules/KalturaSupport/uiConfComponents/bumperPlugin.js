/**
* Adds bumper support
*/
( function( mw, $ ) { "use strict";

// xxx removed once we move to the new resource loader
window.bumperPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		if( embedPlayer.isPluginEnabled( 'bumper') ){
			window.bumperPlugin( embedPlayer, callback );
		} else {
			// No bumper plugin continue player checks
			callback();
		}
	});
});
window.bumperPlugin = function( embedPlayer, callback ){

	var bumpPostfix = '.Bumper';
	// <plugin id="bumper" bumperentryid="1_187nvs4c" clickurl="http://www.nokia.com" lockui="true" playonce="false" presequence="1" width="100%" height="100%"></plugin>
	var bumperConfig = embedPlayer.getKalturaConfig(
			'bumper', 
			['plugin', 'bumperEntryID', 'clickUrl', 'lockUi', 'playOnce', 'preSequence', 'postSequence', 'width', 'height']
	);
	// Convert the pre and post to ints: 
	bumperConfig.preSequence = parseInt( bumperConfig.preSequence );
	bumperConfig.postSequence = parseInt( bumperConfig.postSequence );

	// Check if the plugin is enabled and we have an entryId:
	if( !bumperConfig.plugin || ! bumperConfig.bumperEntryID && ( !bumperConfig.preSequence || !bumperConfig.postSequence ) ){
		callback();
		return ;
	} else {
		mw.load( ['AdSupport'], function(){
			addBumperBindings( embedPlayer, bumperConfig, callback );
		});
	}
	function addBumperBindings( embedPlayer, bumperConfig, callback ){
		// On change media clear any bumper settings: 
		embedPlayer.bindHelper( "onChangeMedia" + bumpPostfix, function(){
			embedPlayer.unbindHelper( bumpPostfix ); 
		});
		// Remove any old bumper bindings: 
		embedPlayer.unbindHelper( bumpPostfix );
		
		// Add the ad player:
		var adPlayer = new mw.KAdPlayer( embedPlayer );
		
		// Get the bumper entryid			
		mw.log( "BumperPlugin::checkUiConf: get sources for " + bumperConfig.bumperEntryID);
		var size = { 
			'width': embedPlayer.getWidth(), 
			'height': embedPlayer.getHeight()	
		}
		mw.getEntryIdSourcesFromApi( embedPlayer.kwidgetid, embedPlayer.kpartnerid, bumperConfig.bumperEntryID, size, function( sources ){
			if( ! sources ){
				// no sources error:
				mw.log("Error: bumperPlugin: No sources for: " + embedPlayer.kwidgetid + ' entry: ' +  bumperConfig.bumperEntryID );
				callback();
				return ;
			}

			var clickUrl = bumperConfig.clickUrl ? bumperConfig.clickUrl : bumperConfig.clickurl;
			
			// Load adSupport for player timeline:
			var adConf =  {
				'ads': [
					{
						'videoFiles' :sources,
						'clickThrough' : clickUrl
					}
				],
				'lockUI': bumperConfig.lockUI,
				'playOnce': bumperConfig.playOnce
			};
			// handle prerolls
			if( bumperConfig.preSequence ){
				$( embedPlayer ).bind( 'AdSupport_bumper' + bumpPostfix, function( event, sequenceProxy ){
					adConf.type = 'bumper';
					embedPlayer.adTimeline.updateUiForAdPlayback( adConf.type );
					sequenceProxy[ bumperConfig.preSequence ] = function( doneCallback ){
						// bumper triggers play event: 
						$( embedPlayer ).trigger( 'onplay' );
						adPlayer.display( adConf, doneCallback );
					};
				});
			}
			// Technically the postroll bumper should be named something else. 
			if( bumperConfig.postSequence ){
				$( embedPlayer ).bind( 'AdSupport_postroll' + bumpPostfix, function(event, sequenceProxy){
					adConf.type = 'postroll';
					embedPlayer.adTimeline.updateUiForAdPlayback( adConf.type );
					sequenceProxy[ bumperConfig.postSequence ] = function( doneCallback ){
						// bumper triggers play event: 
						$( embedPlayer ).trigger( 'onplay' );
						adPlayer.display( adConf, doneCallback );
					};
				});
			}
			// Done adding bumper bindings issue callback
			callback();
		});
	}
}

})( window.mw, window.jQuery );