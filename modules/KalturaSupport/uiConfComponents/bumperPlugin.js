/**
* Adds bumper support
*/
( function( mw, $ ) {

// xxx removed once we move to the new resource loader
window.bumperPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){

		var adPlayer = new mw.KAdPlayer( embedPlayer );
		var bumpPostfix = '.Bumper';
		
		// On change media clear any bumper settings: 
		$( embedPlayer ).bind( "onChangeMedia" + bumpPostfix, function(){
			$( embedPlayer ).unbind( bumpPostfix ); 
		});
		
		// <plugin id="bumper" bumperentryid="1_187nvs4c" clickurl="http://www.nokia.com" lockui="true" playonce="false" presequence="1" width="100%" height="100%"></plugin>
		var bc = embedPlayer.getKalturaConfig(
				'bumper', 
				['plugin', 'bumperEntryID', 'clickUrl', 'lockUi', 'playOnce', 'preSequence', 'postSequence', 'width', 'height']
		);
		// convert the pre and post to ints: 
		bc.preSequence = parseInt( bc.preSequence );
		bc.postSequence = parseInt( bc.postSequence );

		// check if the plugin is enabled and we have an entryId:
		if( !bc.plugin || ! bc.bumperEntryID && ( !bc.preSequence || !bc.postSequence ) ){
			callback();
			return ;
		}
		
		// Get the bumper entryid			
		mw.log( "KWidget:: checkUiConf: get sources for " + bc.bumperEntryID);
		var originalSrc = embedPlayer.getSrc();
		mw.getEntryIdSourcesFromApi( embedPlayer.kwidgetid, bc.bumperEntryID, function( sources ){
			// Load adSupport for player timeline:
			mw.load( 'AdSupport', function(){
				var adConf =  {
					'ads': [
						{
							'videoFiles' :sources,
							'clickThrough' : bc.clickUrl
						}
					],
					'lockUI': bc.lockUi,
					'playOnce': bc.playOnce
				};
				// handle prerolls
				if( bc.preSequence ){
					$( embedPlayer ).bind( 'AdSupport_bumper' + bumpPostfix, function( event, sequenceProxy ){
						adConf.type = 'bumper';
						sequenceProxy[ bc.preSequence ] = function( doneCallback ){
							// bumper triggers play event: 
							$( embedPlayer ).trigger( 'onplay' );
							adPlayer.display( adConf, doneCallback );
						};
					});
				}
				// Technically the postroll bumper should be named something else. 
				if( bc.postSequence ){
					$( embedPlayer ).bind( 'AdSupport_postroll' + bumpPostfix, function(event, sequenceProxy){
						adConf.type = 'postroll';
						sequenceProxy[ bc.postSequence ] = function( doneCallback ){
							// bumper triggers play event: 
							$( embedPlayer ).trigger( 'onplay' );
							adPlayer.display( adConf, doneCallback );
						};
					});
				}
				// Done adding bumper bindings issue callback
				callback();
			});
		});
	});
});

})( window.mw, window.jQuery );