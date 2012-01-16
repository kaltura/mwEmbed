/**
* Adds my logo support
* Read the mylogo plugin from the UiConf
*/
( function( mw, $ ) {

	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check if the kaltura logo is present. 
			if( !$uiConf.find("button[icon='kalturaLogo']").length ){
				// disable attribution: 
				mw.setConfig('EmbedPlayer.AttributionButton', false);
			}
			// Get Raw config ( we don't support id name resolution yet )
			if( embedPlayer.isPluginEnabled( 'mylogo') ){
				myLogo( embedPlayer )
			}
			callback();
		});
	});

	window.myLogo = function( embedPlayer ){
		var myLogoConfig = embedPlayer.getRawKalturaConfig(
				'mylogo', 
				[ 'relativeTo', 'position', 'watermarkClickPath', 'watermarkPath', 
				 'height', 'width', 'className' ]
		);
		// setup attribution override: 
		// turn off default attribution
		mw.setConfig('EmbedPlayer.AttributionButton', false);
		if( !myLogoConfig.width )
			myLogoConfig.width = 28;
		// wait for addToContolBar time: 
		$( embedPlayer ).bind('addControlBarComponent', function(event, controlBar ){
			controlBar.supportedComponents['controlBarWatermark'] = true;
			
			//Make a new associative array because we want this at the beginning.
			var components = {};
			components['controlBarWatermark'] = {
					'w': myLogoConfig.width,
					'o': function( ctrlObj ) {
						var $watermarkButton = $('<div />')
						.addClass('rButton k-watermark-plugin' + myLogoConfig.className )
						.css({
							'top' : '4px',
							'width' : myLogoConfig.width + 'px'
						})
						.append( 
							$('<a />').attr({
								'href' : myLogoConfig.watermarkClickPath,
								'target' : '_blank'
							}).append( 
								$('<img />').attr({
									'src': myLogoConfig.watermarkPath,
								})
								.css({
									'top': '-2px',
									'position': 'absolute'	
								})
								
							)
						)
						// add height if set: 
						if( myLogoConfig.height ){
							$watermarkButton.css( 'height', myLogoConfig.height )
						}
						
						return $watermarkButton;
				}
			};
			
			// Add them back in the same order
			for ( var component_id in controlBar.components ) {
				components[component_id] = controlBar.components[component_id];
			}
			
			controlBar.components = components;
		});
	}

})( window.mw, window.jQuery );