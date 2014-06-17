( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlistAPI', mw.KBaseMediaList.extend({

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
			var embedPlayer = this.embedPlayer;
			// Populate playlist set with kalturaPlaylistData
			for (var playlistId in embedPlayer.kalturaPlaylistData ) {
				if (embedPlayer.kalturaPlaylistData.hasOwnProperty(playlistId)) {
					this.playlistSet.push( embedPlayer.kalturaPlaylistData[ playlistId ] );
				}
			}

			if (this.playlistSet.length > 0){
				debugger;
				console.log("----------- render playlist")
			};
		}


	})

	);

} )( window.mw, window.jQuery );