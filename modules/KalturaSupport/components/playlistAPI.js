( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlistAPI', mw.KBaseMediaList.extend({

		defaultConfig: {
			'initItemEntryId': null,
			'autoContinue': null,
			'autoPlay': null,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null,
			'includeInLayout': null,
			'parent': 'sideBarContainer',
			'containerPosition': null //'after'
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
			var _this = this;
			this.bind( 'playerReady', function ( e, newState ) {
				if (_this.playlistSet.length > 0){
					_this.setMediaList(_this.playlistSet[0].items);
				}
			});
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
		}

	})

	);

} )( window.mw, window.jQuery );