/**
* NielsenVideoCensusPlugin implemented per document outlined here: 
* https://portal.kaltura.com/product/Shared%20Documents/Solution%20Architects/_Generic%20PRDs/Nielsen/KDP%20Nielsen%20Video%20Census%20Plugin%20PRD.docx
*/

mw.NielsenVideoCensusPlugin = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.NielsenVideoCensusPlugin.prototype = {
	// Post fixed applied in player bindings
	bindPostFix: '.NielsenVideoCensusPlugin',
	
	init: function( embedPlayer, callback ){
		this.embedPlayer = embedPlayer;
		
		// Add the player bindings: 
		this.addPlayerBindings();
		
		// Issue the callback to continue player build out: 
		callback();
	},
	/**
	 * Beacon event structure: 
	 * 
	 * Send a start call for each segment the first time it plays.
	 *	If the user scrubs backwards to a previous segment, and an ad plays before the content resumes 
	 *		–send an additional call for that segment.
	 *	Do not send an additional call for that segment if an ad does not play in between segments.  
	 *		For example: a full episode with 5 segments might have 5 start calls, potentially more if the user revisits a prior segment and is interrupted by an ad.
	 *	Include the LP parameter for full episode players
	 *		Tagging ads  -  Include the ad identifying parameter (c3).
	 *	If another video is clicked while one is in progress you should send a start value for the new video that starts playing.
	 *	Do not send any additional calls for pausing, adjusting video quality or changing to full screen.
	*/
	addPlayerBindings: function(){
		var _this = this;
		// remove any existing bindings: 
		$( this.embedPlayer ).unbind();
		// Add the first play binding: 
		$( this.embedPlayer ).bind( 'firstPlay' + this.bindPostFix, function(){
			_this.sendBeacon();
		});
		// Also send an event once ad playback ends 
		// ( during a midroll and we are about to continue to content) 
		$( this.embedPlayer ).bind('AdSupport_EndAdPlayback'+ + this.bindPostFix, function(){
			_this.sendBeacon();
		});
		
	},
	sendBeacon: function(){
		// create a new dav image
		var davImg = new Image(); 
		// Setup the base url: 
		var url = 'http://secure-us.imrworldwide.com/cgi-bin/m?';

		url+= $.param( this.getBeconParams() );
		// Set the Program/Section Name
		davImg.src = url;
	},
	inAd:function(){
		return !! this.embedPlayer.evaluate('{sequenceProxy.isInSequence}'); 
	},
	getBeconParams: function(){
		// Set all the required params
		return {
			// Set the client Id: 
			'ci' : this.getConfig( 'clientId'),
			
			// Video Census ID:
			'c6' : this.getConfig( 'videoCensusId' ),
			
			// Title of the stream: 
			'tl' : 'dav0-' + this.getConfig( 'tl' ),
			
			// Set the Program Section name:
			'cg' :  this.getConfig( 'cg'),
			
			// Cookie check always 1
			'cc': 1,
			
			// Random number: 
			'rnd': Math.ceil( Math.random() * 1000000000 ),
		};
	},
	getConfig: function( key ){
		return this.embedPlayer.getKalturaConfig( 'NielsenVideoCensusPlugin', key );
	}
}