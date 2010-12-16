
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){

			// Check if the ui conf layout supports volume control
			// <volumebar id="volumeBar" stylename="volumeBtn" width="20" buttontype="iconButton" tooltip="Change volume" color1="14540253" color2="16777215" color3="3355443" color4="10066329" color5="16777215" font="Arial"></volumebar>

			if( !$uiConf.find( 'volumebar' ).length ){
				controlbarLayout( embedPlayer )
			}
			// Continue trigger event regardless of if ui-conf is found or not
			callback();
			
		});
	});
	var controlbarLayout = function( embedPlayer ){
		$j( embedPlayer ).bind( 'updateFeatureSupport', function( e, supports ){
			supports.volumeControl = false;
		});
	}