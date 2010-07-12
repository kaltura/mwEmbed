/**
* Handles the smil animate class
*/
mw.SmilAnimate = function( smilObject ){
	return this.init( smilObject );
}
mw.SmilAnimate.prototype = {

	// Constructor: 
	init: function( smilObject ){		
		this.smil = smilObject;
		
		this.framerate = mw.getConfig( 'SmilPlayer.framerate');
		
		this.callbackRate = 1000 / this.framerate;
		this.animateInterval = [];
	},
	
	/**
	 * Pause any active animation or video playback
	 */
	pauseAnimation: function( smilElement ){		
		// Check if the element is in the html dom: 
		if( !$j ( '#' + this.smil.getAssetId( smilElement ) ).length ){
			return ;
		}
		// Pause the animation of a given element ( presently just video )		
		switch( this.smil.getRefType( smilElement ) ){
			case 'video':
				$j ( '#' + this.smil.getAssetId( smilElement ) ).get( 0 ).pause();
			break;
		}
		// non-video elements just pause by clearing any animation loops
		if( this.animateInterval[ this.smil.getAssetId( smilElement ) ]  ){
			clearInterval( this.animateInterval[ this.smil.getAssetId( smilElement ) ]  );
		}
	},
	
	/**
	 * Checks if assets are insync 
	 *  re
	 */
	getPlaybackSyncDelta: function( time ){
		var _this = this;
		// Get all the elements for the current time:
		var maxOutOfSync = 0;
		this.smil.getBody().getElementsForTime( time, function( smilElement ){
			//mw.log( 'check element: '+ time + ' ' +  _this.smil.getAssetId( smilElement ) );
			// var relativeTime = time - smilElement.parentTimeOffset;
			var relativeTime = time - $j( smilElement ).data ( 'startOffset' );
			switch( _this.smil.getRefType( smilElement ) ){
				case 'video':
					var vid = $j ( '#' + _this.smil.getAssetId( smilElement ) ).get( 0 );
					var vidTime = ( !vid || !vid.currentTime )? 0 : vid.currentTime;					
					//mw.log( "getPlaybackSyncDelta:: video time should be: " + relativeTime + ' video time is: ' + vidTime );
					
					var syncOffset = ( relativeTime -vidTime );
					if( syncOffset >  maxOutOfSync ){
						maxOutOfSync = syncOffset;
					}
				break;
			}
		});
		// Return the max out of sync element
		return maxOutOfSync;
	},
	
	/**
	* Animate a smil transform per supplied time.
	* @param {Element} smilElement Smil element to be animated
	* @param {float} animateTime Float time target for element transform
	* @param {float} deltaTime Extra time interval to be animated between animateTransform calls
	*/
	animateTransform: function( smilElement, animateTime, deltaTime ){
		var _this = this;
		//mw.log("SmilAnimate::animateTransform:" + smilElement.id + ' AnimateTime: ' + animateTime + ' delta:' + deltaTime);
		
		// Check for deltaTime to animate over, if zero
		if( !deltaTime || deltaTime === 0 ){
			// transformElement directly ( no playback or animation loop ) 
			_this.transformElement( smilElement, animateTime );
			
			// Also update the smil Element transition directly
			this.smil.getTransitions().transformTransitionOverlay( smilElement, animateTime );

			// We are not playing return directly: 
			return ;
		}
			
		
		// Check for special playback types that for playback animation action:
		if( this.smil.getRefType( smilElement ) == 'video' ){
			this.transformVideoForPlayback( smilElement, animateTime );
		}
				
		// Check if the current smilElement has any transforms to be done
		if( ! this.checkForTransformUpdate( smilElement, animateTime, deltaTime ) ){
			// xxx no animate loop needed for element: smilElement
			return ;
		}		
		
		// We have a delta spawn an short animateInterval 
		
		// Clear any old animation loop	( can be caused by overlapping play requests or slow animation )	
		clearInterval( this.animateInterval[ this.smil.getAssetId( smilElement ) ]  );
		
		// Start a new animation interval  		 
		var animationStartTime = new Date().getTime();
		var animateTimeDelta =  0;
		
		this.animateInterval[ this.smil.getAssetId( smilElement ) ] = 
			setInterval(
				function(){
					var timeElapsed =  new Date().getTime() - animationStartTime;
					// Set the animate Time delta 
					animateTimeDelta += _this.callbackRate;
					
					// See if the animation has expired: 
					if( animateTimeDelta > deltaTime || timeElapsed > deltaTime ){
						// Stop animating:
						clearInterval( _this.animateInterval[ _this.smil.getAssetId( smilElement ) ]  );
						return ;
					}
					
					// Check if there is lag in animations 
					if( Math.abs( timeElapsed - animateTimeDelta ) > 100 ){
						mw.log( "Error more than 100ms lag within animateTransform loop: te:" + timeElapsed + 
							' td:'  + animateTimeDelta + ' diff: ' + Math.abs( timeElapsed - animateTimeDelta ) );
					}
					
					// Do the transform request: 				
					_this.transformAnimateFrame( smilElement, animateTime + ( animateTimeDelta/1000 ) );
				}, 
				this.callbackRate 
			);	
	},
	
	/**
	* Quickly check if a given smil element needs to be updated for a given time delta
	*/
	checkForTransformUpdate: function( smilElement, animateTime, deltaTime ){
		// Get the node type: 		
		var refType = this.smil.getRefType( smilElement )
		
		// Let transition check for updates
		if( refType == 'img' || refType=='video' ){
			 if( $j( smilElement ).attr('transIn') || $j( smilElement ).attr('transOut') ){
				return true;
			 }
		}
				
		// NOTE: our img node check avoids deltaTime check but its assumed to not matter much
		// since any our supported keyframe granularity will be equal to deltaTime ie 1/4 a second. 		
		if( refType == 'img' ){
			// Confirm a child animate is in-range
			if( $j( smilElement ).find( 'animate' ).length ) {
				// Check if there are animate elements in range: 				
				if( this.getSmilAnimateInRange(  smilElement, animateTime) ){
					return true;
				}
			}		
		}
		
		// Check if we need to do a smilText clear: 
		if( refType == 'smiltext' ){		
			var el = $j( smilElement ).get(0);
			for ( var i=0; i < el.childNodes.length; i++ ) {
				var node = el.childNodes[i];
				// Check for text Node type: 
				if( node.nodeName == 'clear' ) {
					var clearTime = this.smil.parseTime(  $j( node ).attr( 'begin') );
					//mw.log( ' ct: ' + clearTime + ' >= ' + animateTime  + ' , ' + deltaTime );
					if( clearTime >= animateTime && clearTime <= ( animateTime +  deltaTime ) ) {
						return true;
					}
				}
			}
		}
		//mw.log( 'checkForTransformUpdate::' + nodeName +' ' +  animateTime );	
		return false;
	},
	/** 
	 * Transform Element in an inner animation loop
	 */
	transformAnimateFrame: function( smilElement, animateTime ){
		// Video has no inner animation per-frame transforms 
		if( this.smil.getRefType( smilElement ) != 'video' ){
			this.transformElement( smilElement, animateTime );	
		}
		// Update the smil Element transition:
		this.smil.getTransitions().transformTransitionOverlay( smilElement, animateTime );		
	},
	/** 
	* Transform a smil element for a requested time.
	*
	* @param {Element} smilElement Element to be transformed
	* @param {float} animateTime The relative time to be transformed. 
	*/
	transformElement: function( smilElement, animateTime ) {		
		mw.log("SmilAnimate::transformForTime:" + animateTime );
		switch( this.smil.getRefType( smilElement ) ){
			case 'smiltext':
				this.transformTextForTime( smilElement, animateTime );
			break;
			case 'img': 
				this.transformImageForTime( smilElement, animateTime );
			break;
			case 'video':
				this.transformVideoForTime( smilElement, animateTime );
			break;
		}					
	},
	
	/**
	 * Transform video for time
	 * @param {Element} smilElement Smil video element to be transformed
	 * @param {time} animateTime Relative time to be transformed
	 */
	transformVideoForTime: function( smilElement, animateTime ){
		// Get the video element 
		var assetId = this.smil.getAssetId( smilElement );
		var vid = $j ( '#' + assetId ).get( 0 );		
		
		var videoSeekTime = animateTime;
		//Add the clipBegin if set
		if( $j( smilElement ).attr( 'clipBegin') && 
				this.smil.parseTime( $j( smilElement ).attr( 'clipBegin') ) )
		{
			videoSeekTime += this.smil.parseTime( $j( smilElement ).attr( 'clipBegin') );  
		}
				
		//mw.log( "SmilAnimate::transformVideoForTime:" + assetId + " ct:" +vid.currentTime + ' should be: ' + videoSeekTime );
		
		// Register a buffer ready callback
		this.smil.getBuffer().videoBufferSeek( smilElement, videoSeekTime, function() {			
			//mw.log( "transformVideoForTime:: seek complete ");
		});
	},
	
	/** 
	 * Used to support video playback
	 */
	transformVideoForPlayback: function( smilElement, animateTime ){ 
		var $vid = $j ( '#' + this.smil.getAssetId( smilElement ) );	
		
		// Set activePlayback flag ( informs edit and buffer actions ) 
		$j( smilElement ).data('activePlayback', true)
		
		// Make the video is being displayed and get a pointer to the video element:
		var vid = $vid.show().get( 0 );
		
		// Set volume to master volume 
		vid.volume = this.smil.embedPlayer.volume;
		
		// Seek to correct time if off by more than 1 second 
		// ( buffer delays management things insync below this range )
		
		// Check the buffer if we can play this time and the video is "paused" ( if so start playback )
		if( this.smil.getBuffer().canPlayTime( smilElement, animateTime ) 
			&& vid.paused
		) {
			//mw.log( "transformVideoForPlayback:: should play:" + animateTime );						
			vid.play();
			return ;
		}		
		// Else issue the initial "play" request
		vid.play();		
	},
	
	/**
	* Transform Text For Time 
	*/
	transformTextForTime: function( textElement, animateTime ) {
		//mw.log("transformTextForTime:: " + animateTime );
		
		if( $j( textElement ).children().length == 0 ){
			// no text transform children
			return ;
		}		
		// xxx Note: we could have text transforms in the future: 
		var textCss = this.smil.getLayout().transformSmilCss( textElement );
				
		// Set initial textValue: 
		var textValue ='';
		
		var el = $j( textElement ).get(0);	
		for ( var i=0; i < el.childNodes.length; i++ ) {	
			var node = el.childNodes[i];
			// Check for text Node type: 
			if( node.nodeType == 3 ) {					
				textValue += node.nodeValue;
			} else if( node.nodeName == 'clear' ){
				var clearTime = this.smil.parseTime(  $j( node ).attr( 'begin') );					
				if( clearTime > animateTime ){
					break;
				}
				// Clear the bucket text collection
				textValue = '';
			}
		}		
				
		// Update the text value target
		// xxx need to profile update vs check value
		$j( '#' + this.smil.getAssetId( textElement )  )
		.html( 
			$j('<span />')
			// Add the text value
			.text( textValue )
			.css( textCss	)
		)
	},
	
	transformImageForTime: function( smilImgElement, animateTime ) {
		var _this = this;
		//mw.log( "transformImageForTime:: animateTime:" +  animateTime );
		
		if( $j( smilImgElement ).children().length == 0 ){
			// No image transform children
			return ;
		}
				
		var animateInRange = _this.getSmilAnimateInRange(  smilImgElement, animateTime, function( animateElement ){			
			// mw.log('animateInRange callback::' + $j( animateElement ).attr( 'attributeName' ) );			
			switch( $j( animateElement ).attr( 'attributeName' ) ) {
				case 'panZoom':						
					// Get the pan zoom css for "this" time 
					_this.transformPanZoom ( smilImgElement, animateElement, animateTime );
				break;
				default:
					mw.log("Error unrecognized Animation attributName: " +
						 $j( animateElement ).attr( 'attributeName' ) );
			}
		});		
		// No animate elements in range, make sure we transform to previous or to initial state if time is zero 
		if( !animateInRange  ) {
			if( animateTime == 0 ) {
				// just a hack for now ( should read from previous animation or from source attribute
				// this.updateElementLayout( smilImgElement, { 'top':1,'left':1,'width':1, 'height':1 } );
				var $target = $j( '#' + this.smil.getAssetId( smilImgElement ));
				$target.css( {
					'top' : '0px',
					'left'  :'0px',
					'width' : '100%', 
					'height' : '100%' 
				} );
			}
			// xxx should check for transform to previous 
		}
	},
	
	/**
	* Calls a callback with Smil Animate In Range for a requested time
	*
	* @param {Element} smilImgElement The smil element to search for child animate 
	* @param {float} animateTime The target animation time 
	* @param {function=} callback Optional function to call with elements in range. 
	* return boolean true if animate elements are in range false if none found
	*/
	getSmilAnimateInRange: function( smilImgElement, animateTime, callback ){
		var _this = this;
		var animateInRange = false;
		// Get transform elements in range
		$j( smilImgElement ).find( 'animate' ).each( function( inx, animateElement ){
			var begin = _this.smil.parseTime(  $j( animateElement ).attr( 'begin') );
			var duration = _this.smil.parseTime(  $j( animateElement ).attr( 'dur') );
			//mw.log( "getSmilAnimateInRange:: b:" + begin +" < " + animateTime + " && b+d: " + ( begin + duration ) + " > " + animateTime );
			
			// Check if the animate element is in range
			var cssTransform = {};			
			if( begin <= animateTime && ( begin + duration ) >= animateTime ) {
				animateInRange = true;
				if( callback ) {
					callback( animateElement );
				}
			}			
		});
		return animateInRange;
	},
	
	/**
	* Get the css layout transforms for a panzoom transform type
	* 
	* http://www.w3.org/TR/SMIL/smil-extended-media-object.html#q32
	*/
	transformPanZoom: function( smilImgElement, animateElement, animateTime ){
		var begin = this.smil.parseTime(  $j( animateElement ).attr( 'begin') );
		var duration = this.smil.parseTime(  $j( animateElement ).attr( 'dur') );
		
		// internal offset
		var relativeAnimationTime = animateTime - begin;
		
		// Get target panZoom for given animateTime 
		var animatePoints = $j( animateElement ).attr('values').split( ';' );
		
		// Get the target interpreted value
		var targetValue = this.getInterpolatePointsValue( animatePoints, relativeAnimationTime, duration );
		
		//mw.log( "SmilAnimate::transformPanZoom: source points: " + $j( animateElement ).attr('values') + " target:" + targetValue.join(',') );  
								
		// Let Top Width Height
		// translate values into % values
		// NOTE this is dependent on the media being "loaded" and having natural width and height
		var namedValueOrder = ['left', 'top', 'width', 'height' ];
		var htmlAsset = $j( '#' + this.smil.getAssetId( smilImgElement ) ).get(0);
		
		var percentValues = {};
		for( var i =0 ;i < targetValue.length ; i++ ){
			if( targetValue[i].indexOf('%') == -1 ) {
				switch( namedValueOrder[i] ){
					case 'left':
					case 'width':
						percentValues[ namedValueOrder[i] ] = parseFloat( targetValue[i] ) / htmlAsset.naturalWidth;
					break;
					case 'height':
					case 'top':
						percentValues[ namedValueOrder[i] ] =  parseFloat( targetValue[i] ) / htmlAsset.naturalHeight 
					break;
				}				
			} else {
				percentValues[ namedValueOrder[i] ] = parseFloat( targetValue[i] ) / 100;
			} 
		}		
		
		// Now we have "hard" layout info try and render it. 
		this.updateElementLayout( smilImgElement, percentValues );		
				
	},
	
	// xxx need to refactor move to "smilLayout"
	updateElementLayout: function( smilElement, percentValues ){
		
		//mw.log("updateElementLayout::" + percentValues.top + ' ' + percentValues.left + ' ' + percentValues.width + ' ' + percentValues.height );
		
		// get a pointer to the html target:
		var $target = $j( '#' + this.smil.getAssetId( smilElement ));
		
		var htmlAsset = $j( '#' + this.smil.getAssetId( smilElement ) ).get(0);
		
		// xxx best way may be to use canvas and a fitting system. 
		
		// Setup target height width based target region size	
		var fullWidth = $target.parents('.smilRegion').width() ;
		var fullHeight =  $target.parents('.smilRegion').height() ;
		var targetWidth = fullWidth;
		var targetHeight = targetWidth * ( 
			( percentValues['height'] * htmlAsset.naturalHeight )				
			/ 
			( percentValues['width'] * htmlAsset.naturalWidth ) 
		)		
		// Check if it exceeds the height constraint: 	
		var sourceScale = ( targetHeight <  fullHeight ) 
			? (1 / percentValues['width'] )
			: (1 / percentValues['height'] )
		
		
		// Wrap the target and absolute the image layout ( if not already ) 
		if( $target.parent('.refTransformWrap').length === 0 ){
			$target		
			.wrap( 
				$j( '<div />' )
				.css( {
					'position' : 'relative',
					'overflow' : 'hidden',
					'width'	: '100%',
					'height' : '100%'
				} )
				.addClass('refTransformWrap') 
			)
		}	
		// Run the css transform
		$target.css( { 
			'position' : 'absolute', 
			'width' : sourceScale *100 + '%',
			'height' : sourceScale *100 + '%',
			'top' : (-1 * percentValues['top'])*100 + '%',
			'left' : (-1 * percentValues['left'])*100 + '%',
		} );
	},
	
	/**
	* getInterpolatePointsValue
	*
	* @param animatePoints Set of points to be interpolated 
	* @param relativeAnimationTime Time to be animated
	* @param duration 
	*/ 
	getInterpolatePointsValue: function( animatePoints, relativeAnimationTime,  duration ){
		// For now only support "linear" transforms 
		// What two points are we animating between: 
		var timeInx = ( relativeAnimationTime / duration ) * animatePoints.length ;
		// if timeInx is zero just return the first point: 
		if( timeInx == 0 ){
			return animatePoints[0].split(',');
		}
		
		// Make sure we are in bounds: 
		var startInx = ( Math.floor( timeInx ) -1 ); 
		startInx = ( startInx < 0 ) ? 0 : startInx; 		
		var startPointSet = animatePoints[ startInx ].split( ',' );					
		var endPointSet = animatePoints[ Math.ceil( timeInx) -1 ].split( ',' );
		
		var interptPercent = ( relativeAnimationTime / duration ) / ( animatePoints.length -1 );

		// Interpolate between start and end points to get target "value"
		var targetValue = []; 
		for( var i = 0 ; i < startPointSet.length ; i++ ){			
			targetValue[ i ] = parseFloat( startPointSet[i] ) + ( parseFloat( endPointSet[i] ) - parseFloat( startPointSet[i] ) ) *  interptPercent;
			// Retain percent measurement			
			targetValue[ i ] += ( startPointSet[i].indexOf('%') != -1 ) ? '%' : ''; 
		}
		return targetValue;
	}	
		
}