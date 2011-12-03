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
	
	// Local cache of current segment: 
	localCurrentSegment: 0,
	
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
		$( this.embedPlayer ).unbind( _this.bindPostFix);
		
		// Reset the current segment index: 
		this.localCurrentSegment = 0;
		
		// Add the first play binding: 
		$( this.embedPlayer ).bind( 'firstPlay' + _this.bindPostFix, function(){
			_this.sendBeacon();
		});
		
		// Send beacon for midrolls
		var inMidroll = false;
		// TODO this should bind to "midSequenceComplete" not a nested AdSupport_EndAdPlayback
		$( _this.embedPlayer ).bind('KalturaSupport_AdOpportunity' + _this.bindPostFix, function(){
			inMidroll = true;
		});
		$( _this.embedPlayer ).bind( 'AdSupport_EndAdPlayback' + _this.bindName, function(){
			if( inMidroll ){
				inMidroll = false;
				_this.localCurrentSegment++;
				_this.sendBeacon();
			}
		});
	},
	sendBeacon: function(){
		mw.log("NielsenVideoCensusPlugin:: sendBeacon" );
		// create a new dav image
		var davImg = new Image(); 
		// Setup the base url: 
		var url = ( this.getConfig('serverUrl') ) ? this.getConfig('serverUrl') : 'http://secure-us.imrworldwide.com/cgi-bin/m?';

		url+= $.param( this.getBeconParams() );
		// Set the Program/Section Name
		davImg.src = url;
	},
	inAd:function(){
		return !! this.embedPlayer.evaluate('{sequenceProxy.isInSequence}'); 
	},
	getBeconParams: function(){
		// Set all the required params
		var params = {
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
		// Check if we are sending long form indicator: 
		if( this.getConfig("lp") ){
			params['lp'] = this.getLpParam();
		}
		if( this.getConfig("ls") ){
			params['ls'] = this.getConfig("ls");
		}
		return params;
	},
	getLpParam: function(){
		// 1) First param comes from config
		var lpParam = this.getConfig("lp") + ',';
		
		// 2) Current segment/chapter number. Set to 0 if not known
		lpParam += this.localCurrentSegment + ',';
		
		// 3) Length in seconds of this segment/chapter. Set to 0 if not known
		lpParam += 0; // we don't have an easy way to calculate this right now. 
		
		// 4) Anticipated total number of segments/chapters for this episode. Set to 0 if not known.
		if( this.embedPlayer.rawCuePoints && this.embedPlayer.rawCuePoints.length){
			// provide the cue point count ( very difficult to know the actual real 
			// number of segments ( because each plugin decides if cue points are
			// applicable to that plugin or not. 
			lpParam += this.embedPlayer.rawCuePoints.length;
		} else {
			lpParam = 0;
		}
		return lpParam ;
	},
	getConfig: function( key ){
		return this.embedPlayer.getKalturaConfig( 'NielsenVideoCensusPlugin', key );
	}
}