
mw.PlaylistHandlerKaltura = function( options ){
	return this.init( options );
}

mw.PlaylistHandlerKaltura.prototype = {
	clipList:null,
	
	uiconfid: null,
	widgetid: null,
	playlistid: null,	
	
	init: function ( options ){
		this.uiconfid =  options.uiconfid;
		this.widgetid = options.widgetid;			
		if( options.playlistid ){
			this.playlistid = options.playlistid;
		}
	},	
	
	loadPlaylist: function ( callback ){
		var _this = this;
		mw.log( "mw.Playlist::load playlist handler" );		 	
		// Get the kaltura client:
		mw.getKalturaClientSession( this.widgetid, function( kClient ) {
			
			// See if we have a playlist from the setup: 
			if( _this.playlistid ) {
				_this.loadPlaylistById( _this.playlistid, kClient, callback);
				return ;
			}
			
			var uiconfGrabber = new KalturaUiConfService( kClient );
			uiconfGrabber.get( function( status, data ) {
				if( data.confFileFeatures && data.confFileFeatures != 'null') {					
					var $uiConf = $j(  data.confFileFeatures );
					var playlistId = $uiConf.find("uiVars [key='kpl0EntryId']").attr('value');
					if( !playlistId ){
						mw.log( "Error could not find entry id:\n" + data.confFileFeatures );
					}
				} else {
					var playlistId = data.id;
				}
				mw.log( "PlaylistHandlerKaltura:: got uiconf of length " + data.confFileFeatures.length + 
						' Got kaltura playlist id: ' + playlistId);
				_this.loadPlaylistById( playlistId, kClient, callback)
			}, _this.uiconfid );
		});
	},
	
	loadPlaylistById: function( playlistId, kClient, callback ){
		var _this = this;
		mw.log('loadPlaylistById:' + playlistId );
		var kPlaylistGrabber = new KalturaPlaylistService( kClient );
		kPlaylistGrabber.execute( function( status, playlistData ) {			
			if( !  playlistData.length ){						
				mw.log("Error: kaltura playlist:" + playlistId + " could not load:" + playlistData.code)
				_this.clipList = [];
			} else { 
				mw.log( 'kPlaylistGrabber::Got playlist of length::' +  playlistData.length );
				_this.clipList = playlistData;			
			}
			callback();
		}, playlistId);
	},	
	/**
	 * get clip count
	 * @return {number} Number of clips in playlist
	 */
	getClipCount: function(){		
		return this.getClipList().length;
	},
	
	getClip: function( clipIndex ){
		return this.getClipList()[ clipIndex ];
	},
	getClipList: function(){
		return this.clipList;
	},
	
	getClipSources: function( clipIndex, callback ){
		var _this = this;
		mw.getKalturaEntryIdSources( this.getClipList()[ clipIndex ].id, function( sources ){
			// add the durationHint to the sources: 
			for( var i in sources){
				sources[i].durationHint = _this.getClipDuration( clipIndex );
			}
			callback( sources );
		});
	},
	
	getCustomClipAttributes:function( clipIndex ){
		return {
			'kentryid' : this.getClip( clipIndex ).id,
			'kwidgetid' : this.widgetid
		}
	},
	/**
	* Get an items poster image ( return missing thumb src if not found )
	*/ 
	getClipPoster: function ( clipIndex ){						
		return this.getClip( clipIndex ).thumbnailUrl;
	},
	
	/** 
	* Get an item title from the $rss source
	*/
	getClipTitle: function( clipIndex ){
		return this.getClip( clipIndex ).name;
	},
	
	getClipDuration: function ( clipIndex ) {	
		return this.getClip( clipIndex ).duration;
	}
}