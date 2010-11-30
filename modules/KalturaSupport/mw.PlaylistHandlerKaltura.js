
mw.PlaylistHandlerKaltura = function( options ){
	return this.init( options );
}

mw.PlaylistHandlerKaltura.prototype = {
	clipList:null,
	
	uiconfid: null,
	widgetid: null,
	playlistid: null,
	playlistSet : [],
	
	// ui conf data
	uiConfData : null,
	
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
	
		// Get the kaltura client:
		mw.getKalturaClientSession( this.widgetid, function( kClient ) {
			// Check if we have already initialised the playlist session: 
			if( _this.playlistid !== null ){
				_this.loadCurrentPlaylist( kClient, callback );
				return ;
			}
			
			
			// Get playlist uiConf data
			var uiconfGrabber = new KalturaUiConfService( kClient );		
			uiconfGrabber.get( function( status, data ) {
				gotUiConfData = true;
				_this.uiConfData = data;
				if( data.confFileFeatures && data.confFileFeatures != 'null') {
						
					// Add all playlists to playlistSet
					var $uiConf = $j(  data.confFileFeatures );				
					
					// Check for autoContinue ( we check false state so that by default we autoContinue ) 
					_this.autoContinue = 
						( $uiConf.find("uiVars [key='playlistAPI.autoContinue']").attr('value') == 'false' )? false: true
															
					// Find all the playlists by number  
					for( var i=0; i < 50 ; i ++ ){
						var playlistid  = $uiConf.find("uiVars [key='kpl" + i +"EntryId']").attr('value');
						var playlistName = $uiConf.find("uiVars [key='playlistAPI.kpl" + i + "Name']").attr('value');
						if( playlistid && playlistName ){
							_this.playlistSet.push( { 
								'name' : playlistName,
								'playlistid' : playlistid
							} )
						} else {
							break;
						}
					}				
					if( !_this.playlistSet[0] ){
						mw.log( "Error could not get playlist entry id in the following uiConf data::\n" + data.confFileFeatures );
						return false;
					}														
				} else {
					// This is just a single playlist:
					_this.playlistSet[0] = {'playlistid' : data.id };
				}
				mw.log( "PlaylistHandlerKaltura:: got  " +  _this.playlistSet.length + ' playlists ' );																
				// Set the playlist to the first playlist
				_this.setPlaylistIndex( 0 );
				
				// Load playlist by Id 
				_this.loadCurrentPlaylist( kClient, callback );
				
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
		this.playlistid = this.playlistSet[ playlistIndex ].playlistid;		
	},
	loadCurrentPlaylist: function( kClient, callback ){
		this.loadPlaylistById( this.playlistid, kClient, callback );
	},
	loadPlaylistById: function( playlistid, kClient, callback ){
		var _this = this;
		var kPlaylistGrabber = new KalturaPlaylistService( kClient );
		kPlaylistGrabber.execute( function( status, playlistData ) {
			// empty the clip list
			_this.clipList = [];
			if( !  playlistData.length ){						
				mw.log("Error: kaltura playlist:" + playlistid + " could not load:" + playlistData.code)
			} else { 
				mw.log( 'kPlaylistGrabber::Got playlist of length::' +  playlistData.length );
				_this.clipList = playlistData;			
			}
			callback();
		}, playlistid );
	},	
	
	/**
	 * Get clip count
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
		mw.getEntryIdSourcesFromApi( this.getClipList()[ clipIndex ].id, function( sources ){
			// add the durationHint to the sources: 
			for( var i in sources){
				sources[i].durationHint = _this.getClipDuration( clipIndex );
			}
			callback( sources );
		});
	},
	
	applyCustomClipData:function( embedPlayer, clipIndex ){
		$j( embedPlayer ).attr({
			'kentryid' : this.getClip( clipIndex ).id,
			'kwidgetid' : this.widgetid
		});		
		$j( embedPlayer ).data( 'kuiconf', this.uiConfData );
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