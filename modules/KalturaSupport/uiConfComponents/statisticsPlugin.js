/*
 * <Plugin id="statistics" width="0%" height="0%" includeInLayout="false"/>
 */
( function( mw, $ ) { "use strict";
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'statistics' ) ) {
				mw.addKAnalytics( embedPlayer );
			}
			callback();
		});
	});
})( window.mw, window.jQuery );
window['statisticsPlugin'] = true;