	

	// Bind the KalturaWatermark where the uiconf includes the Kaltura Watermark 
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
		
			// Check if the ui conf includes watermark
			if( $j( $uiConf ).find( 'watermark' ).length ){
				// Wait for the player to be ready 
				$j( embedPlayer ).bind( 'playerReady', function(){
					// Run the watermark plugin code
					watermarkPlugin( embedPlayer, $j( $uiConf ).find( 'watermark' ) );
				})
			}
			// Continue trigger event regardless of if ui-conf is found or not
			callback();
		});
	});
	var watermarkPlugin = function( embedPlayer ,$watermarkConf ){
		// Draw the watermark to the player 
		var getCss = function( $watermarkConf ){
			var watermarkCss = {
					'position' : 'absolute',
					'z-index':2
					};
			switch( $watermarkConf.attr('watermarkPosition' ) ){
				case 'topRight': 
					watermarkCss.top = watermarkCss.right = '0px';
				break;
			}
			watermarkCss.padding = $watermarkConf.attr('padding') + 'px';
			return watermarkCss;
		}
		var watermarkCss = getCss( $watermarkConf );
		embedPlayer.$interface.append( 
			$j('<span />')
			.css( watermarkCss )
			.append( 
				$j('<a />').attr({
					'href' : $watermarkConf.attr('watermarkClickPath')
				}).append( 
					$j('<img />').attr({
						'src': $watermarkConf.attr('watermarkPath'),
						'id' : embedPlayer.id + '_' + $watermarkConf.attr('id')
					})
				)
			)
		)
	};
	
