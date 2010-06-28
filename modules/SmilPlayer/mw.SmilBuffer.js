/**
* Hanndles buffer information for the smilObject
*/

mw.SmilBuffer = function( smilObject ){
	return this.init( smilObject );
}

mw.SmilBuffer.prototype = {
	
	// Stores currently loading assets. 
	assetLoadingSet: [],
	
	/**
	* Constructor:
	*/ 
	init: function( smilObject ) {
		this.smil = smilObject;
	},
	
	/**
	* Runs a callback once the buffer time is ready.
	*/
	timeIsReady: function( time, callback ) {
		
		// Get active body elements
		//this.smil.getBody().getElementsForTime( time );
		
		// Check load status per temporal offset 
		
		// setTimeout to call self until buffer is ready
		
		// Temp ( assume ready );
		callback();
	},
		
	/*
	* Add a asset to the loading set:
	*/
	addAssetLoading: function( assetId ){
	
	},
	
	/**
	* Asset is ready, check queue and issue callback if empty 
	*/
	assetReady: function( assetId ){
		
	},
	
	
	videoBufferSeek: function ( smilElement, seekTime, callback ){
		var _this = this;
		// get the video target: 
		var $vid = $j ( '#' + this.smil.getAssetId( smilElement ) );
		
		var runSeekCallback = function(){
			_this.assetReadyQueue.push( $vid )
			$vid.unbind( 'seeked' ).bind( 'seeked', function(){
				if( callback ){
					callback();
				}
			});
			$vid.attr('currentTime', seekTime );
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