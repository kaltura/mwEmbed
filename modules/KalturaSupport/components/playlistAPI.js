( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlistAPI', mw.KBaseComponent.extend({

		defaultConfig: {
			'initItemEntryId': null,
			'autoContinue': null,
			'autoPlay': null,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null,
			'includeInLayout': null
		},

		playlistSet : [],

		getConfig: function( key ){
			return this.embedPlayer.getKalturaConfig( 'playlistAPI', key );
		},

		setup: function( embedPlayer ) {
			this.addBindings();
			this.loadPlaylists();
		},
		addBindings: function() {
			// add bindings
		},
		loadPlaylists: function(){
			// find all playlists that were defined in the config
			for (var playlistIndex=0; playlistIndex < 1000; playlistIndex++){
				if (this.getConfig('kpl' + playlistIndex +'Id')){
					this.loadPlaylistByID(this.getConfig('kpl' + playlistIndex +'Id'));
				}else if (this.getConfig('kpl' + playlistIndex +'Url')){
					this.loadPlaylistByRss(this.getConfig('kpl' + playlistIndex +'Url'));
				}else{
					break;
				}
			}
			if (this.playlistSet.length > 0){
				console.log("----------- render playlist")
			};
		},
		loadPlaylistByID: function(playlistID){
			var embedPlayer = this.embedPlayer;
			// Populate playlist set with kalturaPlaylistData
			for (var playlistId in embedPlayer.kalturaPlaylistData ) {
				if (embedPlayer.kalturaPlaylistData.hasOwnProperty(playlistId)) {
					this.playlistSet.push( embedPlayer.kalturaPlaylistData[ playlistId ] );
				}
			}
		},
		loadPlaylistByRss: function(playlistRss){
			console.log ("load by rss (currently not supported): "+playlistRss);
		}

	})

	);

} )( window.mw, window.jQuery );