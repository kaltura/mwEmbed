/**
 * mediaPlayers is a collection of mediaPlayer objects supported by the client.
 *
 * @constructor
 */
( function( mw, $ ) { "use strict";

mw.MediaPlayers = function(){
	this.init();
};

mw.MediaPlayers.prototype = {
	// The list of players supported
	players : null,

	// Store per mime-type preferences for players
	preference : { },

	// Stores the default set of players for a given mime type
	defaultPlayers : { },

	/**
	 * Initialization function sets the default order for players for a given
	 * mime type
	 */
	init: function() {
		this.players = new Array();
		this.loadPreferences();

		// Set up default players order for each library type
		this.defaultPlayers['video/wvm'] = ['NativeComponent'];
		this.defaultPlayers['video/live'] = ['Kplayer'];
		this.defaultPlayers['video/kontiki'] = ['Kplayer'];
		this.defaultPlayers['video/x-flv'] = ['Kplayer', 'Vlc'];
		this.defaultPlayers['video/h264'] = ['NativeComponent', 'Native', 'Kplayer', 'Silverlight', 'Vlc'];
		this.defaultPlayers['video/mp4'] = ['NativeComponent', 'Native', 'Kplayer', 'Silverlight', 'Vlc'];
		this.defaultPlayers['application/vnd.apple.mpegurl'] = ['Native'];
		this.defaultPlayers['application/x-shockwave-flash'] = ['Kplayer'];

		this.defaultPlayers['video/ogg'] = ['Native', 'Vlc', 'Java', 'Generic'];
		this.defaultPlayers['video/webm'] = ['Native', 'Vlc'];
		this.defaultPlayers['application/ogg'] = ['Native', 'Vlc', 'Java', 'Generic'];
		this.defaultPlayers['audio/ogg'] = ['Native', 'Vlc', 'Java' ];
		this.defaultPlayers['audio/mpeg']= ['Native', 'Kplayer'];
		this.defaultPlayers['audio/mp3']= ['Native', 'Kplayer'];
		this.defaultPlayers['video/mpeg'] = ['Vlc'];
		this.defaultPlayers['video/x-msvideo'] = ['Vlc'];
		this.defaultPlayers['video/multicast'] = ['Silverlight'];
		this.defaultPlayers['video/ism'] = ['Silverlight'];
		this.defaultPlayers['video/playreadySmooth'] = ['Silverlight'];
		// this.defaultPlayers['text/html'] = ['Html'];
		//this.defaultPlayers['image/svg'] = ['ImageOverlay'];

		this.defaultPlayers['image/jpeg'] = ['ImageOverlay'];
		this.defaultPlayers['image/png'] = ['ImageOverlay'];
		if ( mw.getConfig("LeadWithHLSOnFlash") ) {
			this.defaultPlayers['application/vnd.apple.mpegurl'].push('Kplayer');
		}
		if ( mw.getConfig("chromecastReceiver") ) {
			this.defaultPlayers['application/vnd.apple.mpegurl'].push('ChromecastReceiver');
		}
		// If nativeComponent can play dash, use it.
        if ($.inArray('application/dash+xml',  window.kNativeSdk && window.kNativeSdk.allFormats) >= 0) {
            this.defaultPlayers['application/dash+xml'] = ['NativeComponent'];
        }

		// If nativeComponent can play hls, use it.
		if (window.kNativeSdk && window.kNativeSdk.allFormats) {
			if ( $.inArray( 'application/vnd.apple.mpegurl' , window.kNativeSdk && window.kNativeSdk.allFormats ) >= 0 ) {
				this.defaultPlayers['application/vnd.apple.mpegurl'] = ['NativeComponent'];
			}
		} else {
			//backward compatibility for sdk that don't send the allFormats param
			this.defaultPlayers['application/vnd.apple.mpegurl'].push('NativeComponent');
		}
	},

	/**
	 * Adds a Player to the player list
	 *
	 * @param {Object}
	 *	  player Player object to be added
	 */
	addPlayer: function( player ) {
		for ( var i = 0; i < this.players.length; i++ ) {
			if ( this.players[i].id == player.id ) {
				// Player already found
				return ;
			}
		}
		// Add the player:
		this.players.push( player );
	},

	/**
	 * Checks if a player is supported by id
	 */
	isSupportedPlayer: function( playerId ){
		for( var i=0; i < this.players.length; i++ ){
			if( this.players[i].id == playerId ){
				return true;
			}
		}
		return false;
	},
	getPlayerById: function(playerId){
		for( var i=0; i < this.players.length; i++ ){
			if( this.players[i].id.toLowerCase() == playerId.toLowerCase() ){
				return this.players[i];
			}
		}
		return null;
	},
	/**
	 * get players that support a given mimeType
	 *
	 * @param {String}
	 *	  mimeType Mime type of player set
	 * @return {Array} Array of players that support a the requested mime type
	 */
	getMIMETypePlayers: function( mimeType ) {
		var mimePlayers = new Array();
		var _this = this;
		if ( this.defaultPlayers[mimeType] ) {
			$.each( this.defaultPlayers[ mimeType ], function( d, lib ) {
				var library = _this.defaultPlayers[ mimeType ][ d ];
				for ( var i = 0; i < _this.players.length; i++ ) {
					if ( _this.players[i].library == library && _this.players[i].supportsMIMEType( mimeType ) ) {
						mimePlayers.push( _this.players[i] );
					}
				}
			} );
		}
		return mimePlayers;
	},
	setMIMETypePlayers: function( mimeType, playerName ){
		if (this.defaultPlayers[mimeType] && $.isArray(this.defaultPlayers[mimeType])) {
			var contains = false;
			$.each(this.defaultPlayers[mimeType], function(index, name){
				if (name === playerName){
					contains = true;
					return false;
				}
			});
			if (!contains) {
				this.defaultPlayers[mimeType].push(playerName);
			}
		} else {
			this.defaultPlayers[mimeType] = [playerName];
		}
	},
	removeMIMETypePlayers: function( mimeType, playerName ){
		if (this.defaultPlayers[mimeType] && $.isArray(this.defaultPlayers[mimeType])) {
			var _this = this;
			$.each(this.defaultPlayers[mimeType], function(index, name){
				if (name === playerName){
					_this.defaultPlayers[mimeType].splice(index, 1);
					return false;
				}
			});
		}
	},
	/**
	 * Deprecated method call lacked get prefix for getter. 
	 */
	defaultPlayer: function( mimeType ){
		mw.log( "MediaPlayer:: defaultPlayer has been deprecated, use getDefaultPlayer method instead" );
		return getDefaultPlayer( mimeType );
	},
	/**
	 * Default player for a given mime type
	 *
	 * @param {String}
	 *	  mimeType Mime type of the requested player
	 * @return Player for mime type null if no player found
	 */
	getDefaultPlayer : function( mimeType ) {
		// mw.log( "get defaultPlayer for " + mimeType );
		var mimePlayers = this.getMIMETypePlayers( mimeType );
		if (mw.getConfig( 'chromecastReceiver')) {
			return this.getPlayerById('chromecastReceiver');
		}
		if ( mw.getConfig( 'EmbedPlayer.ForceNativeComponent' ) && this.isSupportedPlayer( 'nativeComponentPlayer' )) {
			var nativeComponentPlayer = mw.EmbedTypes.getNativeComponentPlayerVideo();
			var imageOverlayPlayer = mw.EmbedTypes.getNativeImageOverlayPlayer();
			if (this.isPlayerSupportMimeType(mimePlayers, nativeComponentPlayer)) {
				mimePlayers = [nativeComponentPlayer];
			} else if(imageOverlayPlayer.supportsMIMEType(mimeType) ) {
				mimePlayers = [imageOverlayPlayer];
			} else {
				mimePlayers = [];
			}
		}
		if ( ( mw.getConfig( 'EmbedPlayer.ForceKPlayer' ) ||
			( mw.getConfig( 'ForceFlashOnDesktopSafari') && mw.isDesktopSafari() ) ) &&
			this.isSupportedPlayer( 'kplayer' ) && mimeType !== "video/youtube" ) {
			var kplayer = mw.EmbedTypes.getKplayer();
			if (this.isPlayerSupportMimeType(mimePlayers, kplayer)) {
				mimePlayers = [kplayer];
			} else {
				mimePlayers = [];
			}
		}
		if (mw.getConfig( 'EmbedPlayer.ForceSPlayer') && this.isSupportedPlayer('splayer')) {
			var silverlightPlayer = mw.EmbedTypes.getSilverlightPlayer();
			if (this.isPlayerSupportMimeType(mimePlayers, silverlightPlayer)) {
				mimePlayers = [silverlightPlayer];
			} else {
				mimePlayers = [];
			}
		}

		// Check for prior preference for this mime type
		for ( var i = 0; i < mimePlayers.length; i++ ) {
			if ( mimePlayers[i].id == this.preference[mimeType] ){
				mimePlayers = [mimePlayers[i]];
				break;
			}
		}
		// Otherwise just return the first compatible player
		// (it will be chosen according to the defaultPlayers list
		if( mimePlayers[0] ){
			return mimePlayers[0];
		}
		// mw.log( 'No default player found for ' + mimeType );
		return null;
	},
	isPlayerSupportMimeType: function(mimePlayers, player){
		var playerSupported = mimePlayers.filter(function(mimePlayer){
			return mimePlayer.id === player.id;
		});
		return (playerSupported.length > 0);
	},
	/**
	 * Returns only a native video tag player
	 * @param {String}
	 * 	mimeType for player selection criteria 
	 */
	getNativePlayer: function( mimeType ){
		var mimePlayers = this.getMIMETypePlayers( mimeType );
		for ( var i = 0; i < mimePlayers.length; i++ ) {
			if( mimePlayers[i].library == 'Native' ){
				return mimePlayers[i];
			}
		}
		return null;
	},

	/**
	 * Sets the format preference.
	 *
	 * @param {String}
	 *	  mimeFormat Prefered format
	 */
	setFormatPreference : function ( mimeFormat ) {
		 this.preference['formatPreference'] = mimeFormat;
		 $.cookie( 'EmbedPlayer.Preference', JSON.stringify( this.preference) );
	},

	/**
	 * Loads the user preference settings from a cookie
	 */
	loadPreferences : function ( ) {
		this.preference = { };
		// See if we have a cookie set to a clientSupported type:
		if( $.cookie( 'EmbedPlayer.Preference' ) ) {
			this.preference = JSON.parse( $.cookie( 'EmbedPlayer.Preference' ) );
		}
	},

	/**
	 * Sets the player preference
	 *
	 * @param {String}
	 *	  playerId Prefered player id
	 * @param {String}
	 *	  mimeType Mime type for the associated player stream
	 */
	setPlayerPreference : function( playerId, mimeType ) {
		var selectedPlayer = null;
		for ( var i = 0; i < this.players.length; i++ ) {
			if ( this.players[i].id == playerId ) {
				selectedPlayer = this.players[i];
				mw.log( 'EmbedPlayer::setPlayerPreference: choosing ' + playerId + ' for ' + mimeType );
				this.preference[ mimeType ] = playerId;
				$.cookie( 'EmbedPlayer.Preference', JSON.stringify( this.preference ) );
				break;
			}
		}
		// Update All the player instances on the page
		if ( selectedPlayer ) {
			$('.mwEmbedPlayer').each(function(inx, playerTarget ){
				var embedPlayer = $( playerTarget ).get( 0 );
				if ( embedPlayer.mediaElement.selectedSource
						&& ( embedPlayer.mediaElement.selectedSource.mimeType == mimeType ) )
				{
					embedPlayer.selectPlayer( selectedPlayer );
				}
			});
		}
	}
};

} )( mediaWiki, jQuery );
