/**
* Adds Comscore plugin support
*/
// XXX can remove once we move to new resource loader:
window.comscorePlugin = true;

$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		var propSet = ['plugin', 'cTagsMap'];
		// Also check for c2 to c10
		for( var i = 2; i < 11; i++ ){
			propSet.push ( 'c' + i );
		}
		// Alias the config lookup function for clean code lookup of properties
		var comConf = kWidgetSupport.getPluginConfig(embedPlayer, $uiConf, 'comscore', propSet );
		// check if the plugin is enabled: 
		if( !comConf.plugin ){
			// no com score plugin active: 
			callback();
			return ;
		}
		mw.load('mw.Comscore', function(){
			// Load the cTagsMap if set
			if( comConf.cTagsMap ){
				
			}
		});
	});
});
