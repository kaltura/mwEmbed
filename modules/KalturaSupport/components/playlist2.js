( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlist2', mw.KBaseComponent.extend({

		defaultConfig: {
			'initItemEntryId': null,
			'autoContinue': null,
			'autoPlay': null,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null
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
		},
		loadPlaylistByID: function(playlistID){
			var embedPlayer = this.embedPlayer;
			debugger;
			console.log ("----------- load by id: "+playlistID);
		},
		loadPlaylistByRss: function(playlistRss){
			console.log ("----------- load by rss: "+playlistRss);
		}

	})

	);

} )( window.mw, window.jQuery );