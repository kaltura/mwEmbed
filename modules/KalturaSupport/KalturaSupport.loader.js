/**
 * kSupport module
 *
 * Add support for kaltura api calls
 *
 * TODO this loader is a little too large portions should be refactored into separate files
 *  this refactor can happen post rl_17 resource loader support
 */
// Scope everything in "mw" ( keeps the global namespace clean )
( function( mw, $ ) { "use strict";

	// Add Kaltura specific attributes to the embedPlayer
	$( mw ).bind( 'MwEmbedSupportReady', function(){
		mw.mergeConfig( 'EmbedPlayer.Attributes', {
			'kentryid' : null, // mediaProxy.entry.id
			'kwidgetid' : null,
			'kuiconfid' : null,
			// helps emulate the kdp behavior of not updating currentTime until a seek is complete.
			'kPreSeekTime': null,
			// Kaltura player Metadata exported across the iframe
			'kalturaPlayerMetaData' : null,
			'kalturaEntryMetaData' : null,
			'kalturaPlaylistData' : null,
			'playerConfig': null,
			'rawCuePoints' : null
		});

		mw.mergeConfig( 'EmbedPlayer.SourceAttributes', [
			'data-flavorid'
		]);
	});

	/**
	 * Base utility functions
	 */
	mw.addKalturaConfCheck = function( callback ){
		$( mw ).bind( 'EmbedPlayerNewPlayer', function(event, embedPlayer){
			$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, checkUiCallback ){
				callback( embedPlayer, checkUiCallback );
			})
		} );
	};

	// Add support for legacy events:
	mw.newEmbedPlayerCheckUiConf = function( callback ){
		mw.log( "Warning: mw.newEmbedPlayerCheckUiConf is deprecated, please use mw.addKalturaConfCheck instead");
		mw.addKalturaConfCheck( callback );
	};

	/**
	 * Abstracts the base kaltura plugin initialization
	 *
	 * @param depencies {Array} optional set of dependencies ( can also be set via php )
	 * @param pluginName {String} the unique plugin name per the uiConf / uiVars
	 * @param enabledCallback {function} the function called for a initialized plugin
	 */
	mw.addKalturaPlugin = function( dependencies, pluginName, initCallback ){
		// Handle optional dependencies
		if( ! $.isArray( dependencies ) ){
			initCallback = pluginName;
			pluginName = dependencies;
			dependencies = null;
		}

		mw.addKalturaConfCheck( function( embedPlayer, callback ){
			if( embedPlayer.isPluginEnabled( pluginName ) ){
				if( $.isArray( dependencies ) ){
					mw.load(dependencies, function(){
						initCallback(  embedPlayer, callback );
					})
				} else {
					initCallback(  embedPlayer, callback );
				}
			} else {
				callback();
			}
		});
	}

	// Make sure kWidget is part of EmbedPlayer dependencies if we have a uiConf id
	$( mw ).bind( 'EmbedPlayerUpdateDependencies', function( event, playerElement, dependencySet ){
		if( mw.getConfig( 'KalturaSupport.DepModuleList') ){
			$.merge( dependencySet,  mw.getConfig( 'KalturaSupport.DepModuleList') );
		}
		if( $( playerElement ).attr( 'kwidgetid' ) && $( playerElement ).attr( 'kuiconfid' ) ){
			dependencySet.push( 'mw.KWidgetSupport' );
		}
	});

	// Make sure flashvars and player config are ready as soon as we create a new player
	$( mw ).bind( 'EmbedPlayerNewPlayer', function(event, embedPlayer){
		if( mw.getConfig( 'KalturaSupport.PlayerConfig' ) ){
			embedPlayer.playerConfig =  mw.getConfig( 'KalturaSupport.PlayerConfig' );
			mw.setConfig('KalturaSupport.PlayerConfig', null );
		}
		// player config should be set before calling KalturaSupportNewPlayer
		$( mw ).trigger( 'KalturaSupportNewPlayer',  [ embedPlayer ] );
	});

	// Set binding to disable "waitForMeta" for kaltura items ( We get size and length from api)
	$( mw ).bind( 'EmbedPlayerWaitForMetaCheck', function(even, playerElement ){
		if( $( playerElement ).attr( 'kuiconfid') || $( playerElement ).attr( 'kentryid') ){
			playerElement.waitForMeta = false;
		}
	});


} )( window.mw, window.jQuery );
