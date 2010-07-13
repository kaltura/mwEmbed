
mw.PlaylistHandlerKaltura = function( options ){
	return this.init( options );
}

mw.PlaylistHandlerKaltura.prototype = {
	clipList:null,
	
	init: function ( options ){
		this.uiconfid =  options.uiconfid;
		this.widgetid = options.widgetid;
	},	
	
	loadPlaylist: function ( callback ){
		var _this = this;
		mw.log("mw.Playlist::load playlist handler");		 	
		// get the kaltura client:
		mw.getKalturaClientSession( this.widgetid, function( kClient ) {
			mw.log( 'PlaylistHandlerKaltura:: getKalturaClientSession: setup ' + kClient);
			var uiconfGrabber = new KalturaUiConfService( kClient );
			uiconfGrabber.get( function( status, data ) {
				mw.log( "PlaylistHandlerKaltura:: got uiconf: " + data.confFileFeatures.length );
				var $uiConf = $j(  data.confFileFeatures );
				var kplid = $uiConf.find("uiVars [key='kpl0EntryId']").attr('value');
				var kPlaylistGrabber = new KalturaPlaylistService( kClient );
				kPlaylistGrabber.execute( function( status, playlistData ) {
					mw.log( 'kPlaylistGrabber::Got playlist data::' +  playlistData.length );
					_this.clipList = playlistData;			
					callback();
				}, kplid);
			}, _this.uiconfid );
		});
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
		mw.getKalturaEntryIdSources( this.getClipList()[ clipIndex ].id, callback );	
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