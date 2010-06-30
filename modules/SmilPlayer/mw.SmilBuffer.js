/**
* Hanndles buffer information for the smilObject
*/

mw.SmilBuffer = function( smilObject ){
	return this.init( smilObject );
}

mw.SmilBuffer.prototype = {
	
	// Stores currently loading assets. 
	assetLoadingSet: [],
	
	// 
	assetLoadingCallbacks : [],
	
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
		
		// Check load status per temporal offset 
		
		// setTimeout to call self until buffer is ready
			
		// Temp ( assume ready );
		callback();
	},
	
	/**
	* Add a callback for when assets loaded and "ready"  
	*/
	addAssetsReadyCallback: function( callback ) {
		mw.log( "addAssetsReadyCallback:: " + this.assetLoadingSet.length  );
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
	
	
	videoBufferSeek: function ( smilElement, seekTime, callback ){
		var _this = this;
		// Get the video target: 
		var $vid = $j ( '#' + this.smil.getAssetId( smilElement ) );
		
		// Add the asset to the loading set
		_this.addAssetLoading( $vid.attr('id' ) );
			
		var runSeekCallback = function(){
			// Add a seek binding
			$vid.unbind( 'seeked' ).bind( 'seeked', function(){
				_this.assetReady( $vid.attr('id' ) );
				if( callback ) {
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