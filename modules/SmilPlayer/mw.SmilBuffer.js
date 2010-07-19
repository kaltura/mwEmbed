/**
* Handles buffer information for the smilObject
*/

mw.SmilBuffer = function( smilObject ){
	return this.init( smilObject );
}

mw.SmilBuffer.prototype = {
	
	// Stores currently loading assets. 
	assetLoadingSet: [],
	
	// A queue for asset loaded callbacks 
	assetLoadingCallbacks : [],
	
	// Stores the percentage loaded of active video elements
	videoLoadedPercent: {},
	
	// Stores seek listeners for active video elements
	videoSeekListeners: {},
	
	// Stores the previous percentage buffered ( so we know what elements to check )
	prevBufferPercent : 0,
	
	/**
	* Constructor:
	*/ 
	init: function( smilObject ) {
		this.smil = smilObject;
	},
	
	/**
	 * Get the buffered percent 
	 */
	getBufferedPercent: function(){
		var _this = this;
		
		// If we already have 100% return directly
		if( this.prevBufferPercent == 1 ) {
			return 1;
		}
		
		// Search for elements from the prevBufferPercent
		var bufferedStartTime = this.prevBufferPercent * _this.smil.getDuration() 
		
		//mw.log("getBufferedPercent:: bufferedStartTime: " + bufferedStartTime );
		
		// Average the buffers of clips in the current time range: 
		var bufferCount =0;
		var totalBufferPerc = 0;		
		var minTimeBuffred = false;
		var maxTimeBuffred = 0;
		this.smil.getBody().getElementsForTime( bufferedStartTime, function( smilElement ){				
			var relativeStartTime = $j( smilElement ).data ( 'startOffset' );
			var nodeBufferedPercent =  _this.getElementPercentLoaded( smilElement );
			
			// xxx BUG in firefox buffer sometimes hangs at 93-99%
			if( nodeBufferedPercent > .91){
				nodeBufferedPercent= 1;
			}
			
			// Update counters: 
			bufferCount ++;
			totalBufferPerc += nodeBufferedPercent;
			
			var nodeBuffredTime = relativeStartTime + 
				( _this.smil.getBody().getClipDuration( smilElement ) * nodeBufferedPercent );
			
			//mw.log(" asset:" +  $j( smilElement ).attr('id') + ' is buffred:' + nodeBufferedPercent  + 'buffer time: ' + nodeBuffredTime );
			
			
			// Update min time buffered ( if the element is not 100% buffered ) 			
			if( nodeBufferedPercent != 1 && 
				(
					minTimeBuffred === false 
					|| 
					nodeBuffredTime < minTimeBuffred 
				) 
			){
				minTimeBuffred = nodeBuffredTime;
			}
			
			// Update the max time buffered
			if( nodeBuffredTime > maxTimeBuffred ){
				maxTimeBuffred = nodeBuffredTime;
			}
		});
		
		// Check if all the assets are full for this time rage: 
		if( totalBufferPerc == bufferCount ) {
			if( maxTimeBuffred == 0 )
				return 0;
			var newBufferPercet = maxTimeBuffred / _this.smil.getDuration();
			if( newBufferPercet != this.prevBufferPercent ){
				// Update the prevBufferPercent and recurse
				this.prevBufferPercent = newBufferPercet;		
				return this.getBufferedPercent();
			} else {
				return 1;
			}
		}
		// update the previous buffer and return the minimum in range buffer percent 
		this.prevBufferPercent = minTimeBuffred / _this.smil.getDuration();		
		return this.prevBufferPercent;
	},
	
	/**
	 * Start loading every asset in the smil sequence set.  
	 */
	startBuffer: function( ){
		this.continueBufferLoad( 0 );
	},
	
	/**
	 * continueBufferLoad the buffer
	 * @param bufferTime The base time to load new buffer items into 
	 */
	continueBufferLoad: function( bufferTime ){
		var _this = this;		
		// Get all active elements for requested bufferTime		
		this.smil.getBody().getElementsForTime( bufferTime, function( smilElement){
			// If the element is in "activePlayback" ( don't try to load it )
			/*mw.log('continueBufferLoad::' + _this.smil.getAssetId( smilElement ) 
					+ $j( smilElement ).data('activePlayback' ));*/
			if( ! $j( smilElement ).data('activePlayback' ) ){
				// Start loading active assets 
				_this.loadElement( smilElement );
			}
		})
		// Loop on loading until all elements are loaded
		setTimeout( function(){
			if( _this.getBufferedPercent() == 1 ){
				mw.log( "smilBuffer::continueBufferLoad:: done loading buffer "); 
				return ;
			}
			// get the percentage buffered, translated into buffer time and call continueBufferLoad with a timeout
			var timeBuffered = _this.getBufferedPercent() * _this.smil.getDuration();			
			//mw.log( 'ContinueBufferLoad::Timed buffered: ' + timeBuffered );
			_this.continueBufferLoad( timeBuffered );
		}, this.smil.embedPlayer.monitorRate * 2 );
		
	},
	
	/**
	 * Start loading and buffering an target smilElement
	 */
	loadElement: function( smilElement ){
		var _this = this;
		
		// If the element is not already in the DOM add it as an invisible element 
		if( $j( '#' + this.smil.getAssetId( smilElement ) ).length == 0 ){			
			// Draw the element
			_this.smil.getLayout().drawElement( smilElement );
			// hide the element ( in most browsers this should not cause a flicker 
			// because dom update are enforced at a given framerate
			_this.smil.getLayout().hideElement( smilElement );
			mw.log('loadElement::Add:' + this.smil.getAssetId( smilElement )+ ' len: ' +  $j( '#' + this.smil.getAssetId( smilElement ) ).length );
		}		
		// Start "loading" the asset (for now just video ) 
		// but in theory we could set something up with large images
		switch( this.smil.getRefType( smilElement ) ){
			case 'video':
				var vid = $j( '#' + this.smil.getAssetId( smilElement ) ).get(0);
				
				// The load request does not work very well instead .play() then .pause() and seek when on display
				// vid.load();
				
				// Since we can't use "load" across html5 implementations do some hacks: 
				if( vid.paused &&  this.getVideoPercetLoaded( smilElement ) == 0 ){
					// Issue the load / play request 
					vid.play();
					vid.volume = 0;
					
					// XXX seek to clipBegin if provided ( we don't need to load before that point )
				
				} else {
					//mw.log("loadElement:: pause video: " + this.smil.getAssetId( smilElement ));
					// else we have some percentage loaded pause playback 
					//( should continue to load the asset )
					vid.pause();
				}
			break;
		}
	},
	
	/**	
	 * Get the percentage of an element that is loaded. 
	 */	
	getElementPercentLoaded: function( smilElement ){
		switch( this.smil.getRefType( smilElement ) ){
			case 'video':
				return this.getVideoPercetLoaded( smilElement );
			break;
		}
		// for other ref types check if element is in the dom
		// xxx todo hook into image loader hook
		if( $j( '#' + this.smil.getAssetId( smilElement ) ).length == 0 ){
			return 0;
		} else {			
			return 1;
		}
	},
	
	/**
	 * Get the percentage of a video asset that has been loaded 
	 */
	getVideoPercetLoaded: function ( smilElement ){
		var _this = this;
		var assetId = this.smil.getAssetId( smilElement );
		var $vid = $j( '#' + assetId );
		
		// if the asset is not in the DOM return zero: 
		if( $vid.length == 0 ){
			return 0 ;
		}
		// check if 100% has already been loaded: 
		if( _this.videoLoadedPercent[ assetId ] == 1 ){
			return 1;
		}

		// Check if we have a loader registered 
		if( !this.videoLoadedPercent[ assetId ] ){
			// firefox loading based progress indicator: 
			$vid.unbind('progress').bind('progress', function( e ) {		
				// jQuery does not copy over the eventData .loaded and .total
				var eventData = e.originalEvent;
				//mw.log("Video loaded progress:" + assetId +' ' +  (eventData.loaded / eventData.total ) );
				if( eventData.loaded && eventData.total ) {
					_this.videoLoadedPercent[assetId] = eventData.loaded / eventData.total;
				}
			})	
		}
	
		// Set up reference to video object: 
		var vid = $vid.get(0);
		// Check for buffered attribute ( not all browsers support the progress event ) 
		if( vid && vid.buffered && vid.buffered.end && vid.duration ) {		
			_this.videoLoadedPercent[ assetId ] = ( vid.buffered.end(0) / vid.duration);			
		}
		
		if( !_this.videoLoadedPercent[ assetId ] ){
			return 0;
		} else {
			// Return the updated videoLoadedPercent 
			return _this.videoLoadedPercent[ assetId ];
		}
	},
	
	
	/**
	* Add a callback for when assets loaded and "ready"  
	*/
	addAssetsReadyCallback: function( callback ) {
		//mw.log( "smilBuffer::addAssetsReadyCallback:" + this.assetLoadingSet.length  );
		// if no assets are "loading"  issue the callback directly: 
		if ( this.assetLoadingSet.length == 0 ){
			if( callback )
				callback();
			return ;
		}
		// Else we need to add a loading callback ( will be called once all the assets are ready )
		this.assetLoadingCallbacks.push( callback );
	},

	/**
	* Add a asset to the loading set:
	* @param assetId The asset to add to loading set
	*/
	addAssetLoading: function( assetId ) {
		if( $j.inArray( assetId, this.assetLoadingSet ) !== -1 ){
			mw.log("Possible Error: assetId already in loading set: " + assetId ) ;
			return ;
		}
		this.assetLoadingSet.push( assetId );
	},		
	
	/**
	* Asset is ready, check queue and issue callback if empty 
	*/
	assetReady: function( assetId ) {
		//mw.log("SmilBuffer::assetReady:" + assetId);
		for( var i=0; i <  this.assetLoadingSet.length ; i++ ){			
			if( assetId == this.assetLoadingSet[i] ) {
				 this.assetLoadingSet.splice( i, 1 );
			}
		}
		if( this.assetLoadingSet.length ===  0 ) {
			while( this.assetLoadingCallbacks.length ) {
				this.assetLoadingCallbacks.shift()();
			}
		}
	},
	
	/**
	 * Clip ready for grabbing a frame such as a canvas thumb
	 */
	bufferedSeek: function( smilElement, relativeTime, callback ){
		var absoluteTime = relativeTime;
		if( $j( smilElement ).attr('clipBegin') ){
			absoluteTime += this.smil.parseTime( $j( smilElement ).attr('clipBegin') );
		}
		$j( smilElement ).data('activeSeek', true);
		var instanceCallback = function(){
			$j( smilElement ).data('activeSeek', false);
			callback();
		}
		switch( this.smil.getRefType( smilElement ) ){
			case 'video':
				this.videoBufferSeek( smilElement, absoluteTime, instanceCallback )
			break;
			case 'img':
				this.loadImageCallback( smilElement, instanceCallback );
			break;
			default:
				// Assume other formats are directly displayed
				instanceCallback();
			break;
		}		
	},
	
	/**
	 * Check if we can play a given time 
	 * @return {boolean} True if the time can be played, false if we need to buffer
	 */
	canPlayTime: function( smilElement, time ){
		switch( this.smil.getRefType( smilElement ) ){
			case 'video':
				return this.canPlayVideoTime(  smilElement, time );				
			break;
		}
		// by default return true 
		return true;
	},
	
	/**
	 * Register a video loading progress indicator and check the time against the requested time 
	 */
	canPlayVideoTime: function( smilVideoElement, time ){
		var _this = this;
		var assetId = this.smil.getAssetId( smilVideoElement );
		var $vid = $j( '#' + assetId );
		var vid = $j( '#' + assetId ).get( 0 );
		// if the video element is not in the dom its not ready: 
		if( $vid.length == 0 || !$vid.get(0) ){
			return false;
		}		
		/* if we have no metadata return false */
		if( $vid.attr('readyState') == 0 ){
			return false;
		}
		/* if we are asking about a time close to the current time use ready state */
		if( Math.abs( $vid.attr('currentTime') - time ) < 1 ){
			// also see: http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#dom-media-have_metadata
			if( $vid.attr('readyState') > 2 ){
				return true;
			}
		}
		// Check if _this.videoLoadedPercent is in range of duration
		// xxx might need to take into consideration startOfsset 
		if( _this.getVideoPercetLoaded( smilVideoElement ) > vid.duration / time ){
			return true;
		}
		// not likely that the video is loaded for the requested time, return false
		return false;
	},
	
	/**
	 * Abstract the seeked Listener so we don't have stacking bindings 
	 */
	registerVideoSeekListener: function( assetId ){
		var _this = this;
		var vid = $j ( '#' +  assetId).get(0);
		vid.addEventListener( 'seeked', function(){
			// Run the callback
			if( _this.videoSeekListeners[ assetId ].callback ) {				
				_this.videoSeekListeners[ assetId ].callback();
			}
		}, false);
	},
	
	loadImageCallback: function ( smilElement, callback ){		
		var assetId = this.smil.getAssetId( smilElement );
		// Make sure the image is in the dom ( load it )
		this.loadElement( smilElement );
		mw.log("loadImageCallback:: drwa img: " + assetId  + $j( '#' +  assetId ).length );
		// If we already have naturalHeight no need for loading callback 
		if( $j( '#' +  assetId).get(0).naturalHeight ){
			callback();
		}else {
			$j( '#' +  assetId).load( callback );
		}
	},
	
	videoBufferSeek: function ( smilElement, seekTime, callback ){
		var _this = this;
		
		// Get the asset target:		
		var assetId = this.smil.getAssetId( smilElement );
		
		// make sure the target video is in the dom: 
		this.loadElement( smilElement );		
		
		var $vid = $j ( '#' +  assetId);
		var vid = $vid.get(0);
		// Add the asset to the loading set
		_this.addAssetLoading( $vid.attr('id' ) );
		var seekCallbackDone = false;
		var runSeekCallback = function(){
			
			// Register an object for the current asset seek Listener
			if( ! _this.videoSeekListeners[ assetId ] ){
				_this.videoSeekListeners[ assetId ]= {};
			};
			
			if( !_this.videoSeekListeners[ assetId ].listen ){
				_this.videoSeekListeners[ assetId ].listen = true;
				_this.registerVideoSeekListener( assetId );				
			}
			// Update the current context callback
			_this.videoSeekListeners[ assetId ].callback = function(){
				// Fire the asset ready event : 
				_this.assetReady( assetId );
				// Run the callback
				if( callback ){
					callback();
				}
			}			
			// Issue the seek
			vid.currentTime = seekTime;
		}
		
		// Read the video state: http://www.w3.org/TR/html5/video.html#dom-media-have_nothing
		if( $vid.attr('readyState') == 0 /* HAVE_NOTHING */ ){ 
			// Check that we have metadata ( so we can issue the seek ) 
			$vid.unbind( 'loadedmetadata' ).bind( 'loadedmetadata', function(){				
				runSeekCallback();
			} );
		}else { 
			// Already have metadata directly issue the seek with callback
			runSeekCallback();
		}		
	}
}