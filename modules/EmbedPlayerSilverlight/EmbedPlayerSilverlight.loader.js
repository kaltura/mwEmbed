( function( mw, $ ) { "use strict";

	// Add supported external players:
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		// Add the Silverlight player:
		var silverlightPlayer = new mw.MediaPlayer('silverlightPlayer', ['video/x-ms-wmv'], 'Silverlight' );
		
		// add the silverlight player if installed: 
		if( isSilverlightInstalled( '1.0' ) ){
			mediaPlayers.addPlayer( silverlightPlayer );
			mediaPlayers.defaultPlayers['video/x-ms-wmv'] = [ 'Silverlight' ];
		}
	});

	// checks for silverlight installed:
	function isSilverlightInstalled( version ) {
		var isVersionSupported=false;
		var container = null;
	
		try {
			var control = null;
			
			try {
				control = new ActiveXObject('AgControl.AgControl');
				if ( version == null ){
					isVersionSupported = true;
				}else if ( control.IsVersionSupported(version) ){
					isVersionSupported = true;
				}
				control = null;
			} catch (e) {
				var plugin = navigator.plugins["Silverlight Plug-In"] ;
				if ( plugin ){
					if ( version === null ){
						isVersionSupported = true;
					}else{
						var actualVer = plugin.description;
						if ( actualVer === "1.0.30226.2")
							actualVer = "2.0.30226.2";
						var actualVerArray =actualVer.split(".");
						while ( actualVerArray.length > 3){
							actualVerArray.pop();
						}
						while ( actualVerArray.length < 4){
							actualVerArray.push(0);
						}
						var reqVerArray = version.split(".");
						while ( reqVerArray.length > 4){
							reqVerArray.pop();
						}
						
						var requiredVersionPart ;
						var actualVersionPart
						var index = 0;
						
						
						do{
							requiredVersionPart = parseInt(reqVerArray[index]);
							actualVersionPart = parseInt(actualVerArray[index]);
							index++;
						}
						while (index < reqVerArray.length && requiredVersionPart === actualVersionPart);
						
						if ( requiredVersionPart <= actualVersionPart && !isNaN(requiredVersionPart) ){
							isVersionSupported = true;
						}
					}
				}
			}
		}
		catch (e) {
			isVersionSupported = false;
		}
		if (container) {
			document.body.removeChild(container);
		}
		
		return isVersionSupported;
	};
	
} )( window.mw, window.jQuery );