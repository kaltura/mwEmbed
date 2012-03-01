/*
 * Example for plugin uiConf tag
 *
 * <Plugin id="dolStatistics" path="/content/uiconf/disney/kdp_3.5.25/plugins/dolStatisticsPlugin.swf" width="0%" height="0%"
 * includeInLayout="false" playheadFrequency="2" jsFunctionName="cto.trackVideo" protocol="http" host="example.com"
 * ASSETNAME="{mediaProxy.entry.id}|{playBtnControllerScreen.selected}|{mediaProxy.entry.name}" GENURL="" GENTITLE=""
 * DEVID="" USRAGNT="" ASSETID="" playheadFrequency="10" listenTo="mediaReady,percentReached" />
 *
 * */
( function( mw, $ ) { "use strict";

mw.addResourcePaths({
	"mw.DolStatistics": "mw.DolStatistics.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		if( embedPlayer.isPluginEnabled( 'dolStatistics' ) ){
			mw.load( "mw.DolStatistics", function(){
				new mw.DolStatistics( embedPlayer, callback );
			});
		} else {
			callback();
		}

	});
});

})( window.mw, window.jQuery);