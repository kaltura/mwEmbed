/**
* Adds Conviva plugin support
*/
( function( mw, $ ) {
// XXX can remove once we move to new resource loader:
window.convivaPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		
		// Here we list any plugin attributes we are interested in like: 
		// <plugin id="conviva" ckey="XXXX">
		var propSet = ['plugin', 'ckey'];
		
		// We grab configuration via the getKalturaConfig call.
		// This call includes checks against uiVars and flashvars so properties can be 
		// set per embed instance via flashvars i.e: "&conviva.ckey=YYYY"
		var convivaConf = embedPlayer.getKalturaConfig( 'conviva', propSet );
		// Check if the plugin is enabled: 
		if( !convivaConf.plugin ){
			// No conviva plugin active, run callback:
			callback();
			return ;
		}
		// Here you can load the conviva html5 plugin js pay load: 
		/* $.getScript( conviva_pay_load_URL, function(){
		 * 
		 * $( embedPlayer ).bind('onplay.conviva', function(){
		 * 		//video tag is located at: 
		 * 		embedPlayer.getPlayerElement();
		 * 		// but most all html5 player events should be accessible on "embedPlayer"
		 * 		ie: $( embedPlayer ).bind( 'seeking' ...
		 * 		is the same as: 
		 * 		$( embedPlayer.getPlayerElement()  ).bind( 'seeking' 
		 * 		
		 * });
		 * 
		 */
			// you need to issue the callback once your done setting up your bindings so that the 
			// player and other plugins can continue their build out. 
			callback();
		/*
		})
		*/
	});
});

})( window.mw, jQuery );