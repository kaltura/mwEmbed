/**
* Adds fader plugin support
* Read the fader plugin from the UIConf
* <Plugin id="fader" width="0%" height="0%" includeInLayout="false" target="{controllersVbox}" hoverTarget="{PlayerHolder}" duration="0.5"/>
*/
( function( mw, $ ) {

	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			var $fader = $uiConf.find("Plugin#fader");
			faderPlugin(embedPlayer, $fader );
			callback();
		});
	});

	window.faderPlugin = function( embedPlayer, $fader ){
		if( $fader.attr('target') == "{controllersVbox}" || 
				$fader.attr('target') == "{playerAndControllerHolder}" )
		{
			embedPlayer.overlaycontrols = true;
		} else {
			embedPlayer.overlaycontrols = false;
		}
	};

})( window.mw, window.jQuery );