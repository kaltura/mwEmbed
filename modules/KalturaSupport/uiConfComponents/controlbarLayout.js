
( function( mw, $ ) { "use strict";
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){

			var disabled = [];

			// HTML5 Options Menu
			var optionsMenu = embedPlayer.getKalturaConfig( 'optionsMenu', ['visible', 'includeInLayout'] );
			if( optionsMenu.visible === false || optionsMenu.includeInLayout === false ) {
				mw.setConfig('EmbedPlayer.EnableOptionsMenu', false );
			}
			
			// Check if the ui conf layout supports play/pause button
			// <button id="playBtnControllerScreen" command="play" buttontype="iconButton" focusrectpadding="0" icon="playIcon" overicon="playIcon" downicon="playIcon" disabeledicon="playIcon" selectedupicon="pauseIcon" selectedovericon="pauseIcon" selecteddownicon="pauseIcon" selecteddisabledicon="pauseIcon" tooltip="" uptooltip="Pause" selectedtooltip="Play" k_buttontype="buttonIconControllerArea" color1="14540253" color2="16777215" color3="3355443" color4="10066329" color5="16777215" font="Arial"></button>
			if( !$uiConf.find( '#playBtnControllerScreen' ).length ){
				// mdale: turned off for now ( seems to be the wrong target ) flash does not match html5 player
				//disabled.push( 'pause' );
			}
			
			// Check if the ui conf layout supports timer text
			// <timer id="timerControllerScreen1" width="40" stylename="timerProgressLeft" format="mm:ss" height="12" dynamiccolor="true" timertype="forwards" color1="14540253"></timer>
			if( !$uiConf.find( 'timer' ).length && 
					( $.browser.msie && parseInt( $.browser.version ) >= 9 ) )
			{
				disabled.push( 'timeDisplay' );
			}			
			
			// Check if the ui conf layout supports scrubber
			// <vbox id="scrubberContainer" width="100%" height="30" verticalalign="middle" verticalgap="-3" notvisible="{mediaProxy.isLive}">
			if( !$uiConf.find( '#scrubberContainer' ).length ){
				// (This really means "custom" playhead disable for now )s
				// disabled.push( 'playHead' );
			}

			// Check if the ui conf layout supports volume control
			// <volumebar id="volumeBar" stylename="volumeBtn" width="20" buttontype="iconButton" tooltip="Change volume" color1="14540253" color2="16777215" color3="3355443" color4="10066329" color5="16777215" font="Arial"></volumebar>
			if( !$uiConf.find( 'volumebar' ).length ){
				disabled.push( 'volumeControl' );
			}
			
			
			// Check if the ui conf layout supports play/pause button
			// <button id="fullScreenBtnControllerScreen" command="fullScreen" buttontype="iconButton" height="22" stylename="controllerScreen" icon="openFullScreenIcon" selectedupicon="closeFullScreenIcong" selectedovericon="closeFullScreenIcon" selecteddownicon="closeFullScreenIcon" selecteddisabledicon="closeFullScreenIcon" focusrectpadding="0" allowdisable="false" tooltip="Toggle fullscreen" k_buttontype="buttonIconControllerArea" color1="14540253" color2="16777215" color3="3355443" color4="10066329" color5="16777215" font="Arial"></button>
			if( !$uiConf.find( '#fullScreenBtnControllerScreen' ).length ){
				disabled.push( 'fullscreen' );
			}
			
			// Check if the ui conf layout supports play/pause button
			// <button id="onVideoPlayBtnStartScreen" command="play" buttontype="onScreenButton" minwidth="60" labelplacement="top" label="Play" stylename="onScreenBtn" upicon="playIcon" overicon="playIcon" downicon="playIcon" disabeledicon="playIcon" selectedupicon="playIcon" selectedovericon="playIcon" selecteddownicon="playIcon" selecteddisabledicon="playIcon" k_buttontype="buttonIconControllerArea" tooltip="Play video" color1="14540253" color2="16777215" color3="3355443" color4="10066329" color5="16777215" font="Arial"></button>
			if( !$uiConf.find( '#onVideoPlayBtnStartScreen' ).length ){
				disabled.push( 'playButtonLarge' );
			}
			// Check if the ui conf layout supports flavorSelector
			// <FlavorCombo id="flavorComboControllerScreen" width="80" streamerType="{configProxy.flashvars.streamerType}" flavorDataProvider="{mediaProxy.kalturaMediaFlavorArray}" styleName="_kdp" color1="14540253" hdOn="HD On" hdOff="HD Off" selectedMessage="" autoMessage="Automatically switches between bitrates" preferedFlavorBR="{mediaProxy.preferedFlavorBR}" tooltip="{flavorComboControllerScreen.selectedMessage}"/>
			if( mw.getConfig("EmbedPlayer.EnableFlavorSelector") === false ){
				disabled.push( 'sourceSwitch' );
			} else {
				// see if flavorComboControllerScreen layout element is present: 
				if( ! $uiConf.find( '#flavorComboControllerScreen' ).length ) {
					disabled.push( 'sourceSwitch' );
				}
			}
			
			controlbarLayout( embedPlayer, disabled );
			
			// Continue trigger event regardless of if ui-conf is found or not
			callback();
			
		});
	});
	
	window.controlbarLayout = function( embedPlayer, disabled ){
		$( embedPlayer ).bind( 'updateFeatureSupportEvent', function( e, supports ){
			for( var i = 0; i < disabled.length ; i++ ){
				var comm = disabled[i];
				supports[comm] = false;
			}
		});
	};
	
})( window.mw, jQuery );
