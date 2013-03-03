/**
* Adds my logo support
* Read the mylogo plugin from the UiConf
*/
( function( mw, $ ) { "use strict";

	var myLogo = function( embedPlayer ){
		var myLogoConfig = embedPlayer.getKalturaConfig(
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
							'width' : myLogoConfig.width + 'px'
						})
						.append(
							$('<a />').attr({
								'href' : myLogoConfig.watermarkClickPath,
								'target' : '_blank'
							}).append(
								$('<img />').attr({
									'src': myLogoConfig.watermarkPath
								})
								.css({
									'right': '1px',
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

	mw.addKalturaConfCheck( function(embedPlayer, callback ){
		// Check if the kaltura logo is present.
		if( !embedPlayer.$uiConf.find("Button[icon='kalturaLogo']").length
				||
			embedPlayer.getKalturaConfig('kalturaLogo', 'visible') == false
				||
			embedPlayer.getKalturaConfig('kalturaLogo', 'includeInLayout') == false
		){
			// disable attribution:
			mw.setConfig('EmbedPlayer.AttributionButton', false);
		}
		// If myLogo is enabled activate plugin:
		if( embedPlayer.isPluginEnabled( 'mylogo') ){
			myLogo( embedPlayer )
		}
		callback();
	});

})( window.mw, window.jQuery );