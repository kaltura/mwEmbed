
mw.PlaylistHandlerKaltura = function( Playlist ){
	return this.init( Playlist );
}

mw.PlaylistHandlerKaltura.prototype = {
			
	init: function ( Playlist ){
		this.playlist = Playlist;
	},
	
	/**
	 * load the playlist source file with a callback 
	 */
	loadFromSrc: function( callback ){
		var _this = this;
		var playlistGrabber = new KalturaPlaylistService( this.kClient );
		this.addPlaylistSource( embedPlayer, callback );
		
		
	},
	
	loadPlaylist: function ( callback ){
		var _this = this;
		var kUiConfId = $j( embedPlayer ).attr( 'kuiconfid' ); 		

		var uiconfGrabber = new KalturaUiConfService( this.kClient );
		uiconfGrabber.get( function( status, data ){
			mw.log( data.confFileFeatures );
			var $uiConf = $j(  data.confFileFeatures );
			var kplid = $uiConf.find("uiVars [key='kpl0EntryId']").attr('value');
			var kPlaylistGrabber = new KalturaPlaylistService( _this.kClient );
			kPlaylistGrabber.execute( function(status, playlistData){
				
				var playlistData = _this.buildPlaylistXML( playlistData );
				callback(  playlistData );
			}, kplid);
		}, kUiConfId )
	}
	/**
	 * get clip count
	 * @return {number} Number of clips in playlist
	 */
	getClipCount: function(){
	
	},
	
	getClipSources: function( clipIndex ){
	
	}, 
	
	getClipList: function(){
				
	},
	
	/**
	* Get an items poster image ( return missing thumb src if not found )
	*/ 
	getClipPoster: function ( clipIndex ){						
	
	},	
	/** 
	* Get an item title from the $rss source
	*/
	getClipTitle: function( clipIndex ){
	
	},
	
	getClipDuration: function ( clipIndex ) {		
	
	}
}