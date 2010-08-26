
mw.PlaylistHandlerKaltura = function( options ){
	return this.init( options );
}

mw.PlaylistHandlerKaltura.prototype = {
	clipList:null,
	
	uiconfid: null,
	widgetid: null,
	playlistid: null,
	playlistSet : [],
	
	// If playback should continue to the next clip on clip complete
	autoContinue: true,
	
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

					// Add all playlists to playlistSet
					var $uiConf = $j(  data.confFileFeatures );
					mw.log( $uiConf.html() );
					// check for autoContinue ( we check false state so that by default we autoContinue ) 
					_this.autoContinue = 
						( $uiConf.find("uiVars [key='playlistAPI.autoContinue']").attr('value') == 'false' )? false: true
															
					// Find all the playlists by number  
					for( var i=0; i < 50 ; i ++ ){
						var playlistId  = $uiConf.find("uiVars [key='kpl" + i +"EntryId']").attr('value');
						var playlistName = $uiConf.find("uiVars [key='playlistAPI.kpl" + i + "Name']").attr('value');
						if( playlistId && playlistName ){
							_this.playlistSet.push( { 
								'name' : playlistName,
								'playlistId' : playlistId
							} )
						} else {
							break;
						}
					}
					if( !_this.playlistSet[0] ){
						mw.log( "Error could not playlist entry id:\n" + data.confFileFeatures );
						return false;
					}														
				} else {
					_this.playlistSet[0] = {'playlistId' : data.id };
				}
				mw.log( "PlaylistHandlerKaltura:: got  " +  _this.playlistSet.length + ' playlists ' );
				
				// Set the playlist to the first playlist
				_this.setPlaylistIndex( 0 );
				_this.loadPlaylistById( _this.playlistid, kClient, callback );								
			}, _this.uiconfid );
		});
	},
	hasMultiplePlaylists: function(){
		return ( this.playlistSet.length > 1 )
	},
	getPlaylistSet: function(){
		return this.playlistSet;
	},
	setPlaylistIndex: function( playlistIndex ){
		this.playlistid = this.playlistSet[ playlistIndex ].playlistId;		
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
		}, playlistId );
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