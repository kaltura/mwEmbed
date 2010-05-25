/**
 * The playlistEmbed object code
 * Acts as a playback system for embedPlayer where the src  
 * is smil xml or other playlist xml
 *
 * Only works with "video" tag browsers 
 * 
 * @author: Michael Dale  mdale@wikimedia.org
 * @license GPL2
 * 
 * supports frame by frame rendering of "smil" and other playlist formats
 * supports basic drop frame live playback of "smil" and other playlist formats
 * 
 * Extends the "embedPlayer" and represents the playlist as a single video stream
 * 
 */
var playlistEmbed = {

	// Instance Name
	instanceOf: 'playListEmbed',
	
	// Native player supported feature set
	supports: {
		'play_head': true,
		'pause': true,
		'fullscreen': false,
		'time_display': true,
		'volume_control': true,		
		'overlays': true	
	},
	 	
	/**
	* put the embed player into the container
	*/
	doEmbedPlayer: function() {
		var _this = this;
		// Set "loading" here:
		$j(this).text( 	gM( 'mwe-loading_plugin' )	);
		
		// Get the clips in range
		
		// Start loading all the assets
		
	},
	
	/**
	* Get the thumbnail html
	*/
	getThumbnailHTML: function() {
		return 'thumb html';
	},

	/**
	 * Seeks to the requested time and issues a callback when ready / displayed
	 * (should be overwritten by client that supports frame serving)
	 */
	setCurrentTime: function( time, callback ) {
	
	},
	
	/**
	* Get all the "clips" in a given range from currentTime
	*/
	getClipsInRange: function( range ) {
		
	}
}
