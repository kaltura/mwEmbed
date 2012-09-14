
( function( mw, $ ) { "use strict";


	var controlbarLayout = function( embedPlayer ){
		var disabled = [];
		var $uiConf = embedPlayer.$uiConf;

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
			// See if flavorComboControllerScreen is enabled:
			if( !embedPlayer.isPluginEnabled( 'flavorComboControllerScreen' ) ) {
				disabled.push( 'sourceSwitch' );
			}
		}

		$( embedPlayer ).bind( 'updateFeatureSupportEvent', function( e, supports ){
			for( var i = 0; i < disabled.length ; i++ ){
				var comm = disabled[i];
				supports[comm] = false;
			}
		});
		
		// Check for share button and add via control bar
		$( embedPlayer ).bind ('addControlBarComponent', function (event, controlBuilder){
			if( !embedPlayer.getKalturaConfig('shareBtnControllerScreen', 'kClick') ){
				// remove the share options: 
				delete controlBuilder.optionMenuItems['share'];
			}
		});
	};

	mw.addKalturaConfCheck( function( embedPlayer, callback ){
		controlbarLayout( embedPlayer );
		// Continue trigger event regardless of if ui-conf is found or not
		callback();
	});


})( window.mw, jQuery );
