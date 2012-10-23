( function( mw, $ ) { "use strict";

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
	playClip: function( embedPlayer, clipIndex, callback ){
		var kEmbedSettings = this.getKalturaClipAttributes( clipIndex );
		var bindName = 'onChangeMediaDone.playlist';
		$( embedPlayer ).unbind( bindName ).bind( bindName, function( event ){
			// Run play after we switch
			embedPlayer.play();
			if( callback ){
				callback();
			}
		});
		embedPlayer.sendNotification( "changeMedia", { 'entryId' : kEmbedSettings.entry_id, 'playlistCall': true} );
	},
	/**
	 * Kaltura rss playlist include entry and widget id's to build the player source list
	 * @param clipIndex
	 * @param $video
	 * @return
	 */
	updateVideoSources: function( clipIndex, $video ){
		var kEmbedSettings = this.getKalturaClipAttributes( clipIndex );
		$video.attr({
			'kentryid' : kEmbedSettings.entry_id,
			'kwidgetid' :kEmbedSettings.wid
		});
	},
	getKalturaClipAttributes: function( clipIndex ){
		// Get the sources via parent mediaRss parser:
		var clipSources = this.getClipSources( clipIndex );

		// Kaltura mediaRss feeds define a single "content" tag with flash swf as the url
		if( clipSources[0] &&
			clipSources.length == 1 &&
			kWidget.getEmbedSettings( clipSources[0].src )['entry_id']
		){
			return kWidget.getEmbedSettings( clipSources[0].src );
		}
		mw.log("Error: kalturaPlaylist MediaRss used with multiple sources or non-kaltura flash applet url");
		return {}
	}
};

})( mediaWiki, jQuery );