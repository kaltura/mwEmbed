mw.PlaylistHandlerKalturaRss = function( playlist, options ){
	return this.init( playlist, options);
};

mw.PlaylistHandlerKalturaRss.prototype = {
			
	init: function ( playlist, options ){
		this.playlist = playlist;
		// Inherit PlaylistHandlerMediaRss
		var tmp = new mw.PlaylistHandlerMediaRss( playlist );
		for( var i in tmp ){
			if( this[i] ){
				this['parent_' + i ] = tmp[i];
			} else {
				this[i] = tmp[i];
			}
		}
		// Set all the options:
		for( var i in options ){
			this[i] = options[i];
		}
	},
	getClipSources: function( clipIndex, callback ){
		this.parent_getClipSources( clipIndex, function( clipSources ){
			// Kaltura mediaRss feeds define a single "content" tag with flash swf as the url
			if( clipSources[0] && 
				clipSources.length == 1 && 
				mw.getKalturaEmbedSettings( clipSources[0].src )['entry_id'] 
			){	
				var kEmbedSettings = mw.getKalturaEmbedSettings( clipSources[0].src );
				var playerRequest = {
					'entry_id' : kEmbedSettings.entry_id,
					'widget_id' : kEmbedSettings.wid
				};
				var clipDuration = clipSources[0].duration;		
				
				// Make sure we have a client session established: 
				mw.KApiPlayerLoader( playerRequest, function( playerData ) {
					mw.getEntryIdSourcesFromApi(kEmbedSettings.wid, kEmbedSettings.entry_id , function( sources ){						
						for( var i in sources ){
							sources[i].durationHint = clipDuration;
						}
						callback( sources );
					});
				});
			} else {
				mw.log("Error: kalturaPlaylist MediaRss used with multiple sources or non-kaltura flash applet url");
			}			
		});
	}
};