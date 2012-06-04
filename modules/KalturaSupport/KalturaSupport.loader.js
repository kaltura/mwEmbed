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
	$(mw ).bind( 'MwEmbedSupportReady', function(){
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
		
		// TODO deprecate ( we don't really use flashvars anymnore )
		mw.mergeConfig( 'EmbedPlayer.DataAttributes', {
			'flashvars': null 
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
		if( $( playerElement ).attr( 'kwidgetid' ) && $( playerElement ).attr( 'kuiconfid' ) ){
			dependencySet.push( 'mw.KWidgetSupport' );
		}
	});
	
	// Make sure flashvars and player config are ready as soon as we create a new player
	$( mw ).bind( 'EmbedPlayerNewPlayer', function(event, embedPlayer){
		
		// Update player config
		if( mw.getConfig( 'KalturaSupport.PlayerConfig' ) ){
			embedPlayer.playerConfig =  mw.getConfig( 'KalturaSupport.PlayerConfig' );
			mw.setConfig('KalturaSupport.PlayerConfig', null );
		}
		// Overrides the direct download link to kaltura specific download.php tool for
		// selecting a download / playback flavor based on user agent. 
		embedPlayer.bindHelper( 'directDownloadLink', function() {
			var baseUrl = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', '' );
			var downloadUrl = baseUrl + 'modules/KalturaSupport/download.php/wid/' + this.kwidgetid;

			// Also add the uiconf id to the url:
			if( this.kuiconfid ){
				downloadUrl += '/uiconf_id/' + this.kuiconfid;
			}

			if( this.kentryid ) {
				downloadUrl += '/entry_id/'+ this.kentryid;
			}			
			$( embedPlayer ).data( 'directDownloadUrl', downloadUrl );
		});
	});
	
	// Set binding to disable "waitForMeta" for kaltura items ( We get size and length from api)
	$( mw ).bind( 'checkPlayerWaitForMetaData', function(even, playerElement ){
		if( $( playerElement ).attr( 'kuiconfid') || $( playerElement ).attr( 'kentryid') ){
			playerElement.waitForMeta = false;
		}
	});
	
	
	
	$( mw ).bind("Playlist_GetSourceHandler", function( event, playlist ){
		var $playlistTarget = $( '#' + playlist.id );
		var embedPlayer = playlist.embedPlayer;
		var kplUrl0, playlistConfig;
		
		// Check if we are dealing with a kaltura player: 
		if( !embedPlayer  ){
			mw.log("Error: playlist source handler without embedPlayer");
		} else {
			playlistConfig = {
				'uiconf_id' : embedPlayer.kuiconfid,
				'widget_id' : embedPlayer.kwidgetid
			};
			kplUrl0 = embedPlayer.getKalturaConfig( 'playlistAPI', 'kpl0Url' )
		}
		// No kpl0Url, not a kaltura playlist
		if( !kplUrl0 ){
			return ;
		} 
		var plId =  mw.parseUri( kplUrl0 ).queryKey['playlist_id'];
		// If the url has a partner_id and executeplaylist in its url assume its a "kaltura services playlist"
		if( embedPlayer.kalturaPlaylistData || plId && mw.parseUri( kplUrl0 ).queryKey['partner_id'] && kplUrl0.indexOf('executeplaylist') != -1 ){
			playlistConfig.playlist_id = plId;
			playlist.sourceHandler = new mw.PlaylistHandlerKaltura( playlist, playlistConfig );
			return ;
		}
		// must be a media rss url:
		if( mw.isUrl( kplUrl0 ) ){
			playlist.src = kplUrl0;
			playlist.sourceHandler = new mw.PlaylistHandlerKalturaRss( playlist, playlistConfig );
			return ;
		}
		mw.log("Error playlist source not found");
	});
	
	
} )( window.mw, window.jQuery );
