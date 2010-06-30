/** 
 * The smil body also see: 
 * http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-structure.html#edef-body
 */
mw.SmilBody = function( smilObject ){
	return this.init( smilObject );
}

mw.SmilBody.prototype = {
		
	// Used to store elements for getElementsForTime method 
	elementsInRange: [],
	
	// Used to store elements out of range for getElementsForTime method
	elementsOutOfRange: [],
	
	// Index of auto assigned ids
	idIndex : 0,
	
	// Cache of ids of previous list of active elements
	// This lets us cache a valid element list for a given amount of time
	cacheElementList: {},
	
	// Constructor: 
	init: function( smilObject ){
		this.smil = smilObject;
		this.$dom = this.smil.getDom().find( 'body' );
		
		// Assign ids to smil body elements
		this.assignIds( this.$dom );
	},
	
	/**
	* Assigns body smil elements id (for content that has a html representation "ref" & "smilText" ) 
	*	( enables fast sync between smilDom and htmlDom )  
	*/
	assignIds: function( $node ) {
		var _this = this;
		if( !$node.attr('id')
			&& !$node.attr( 'xml:id' )
			&& ( 
				_this.getNodeSmilType( $node ) == 'ref'
				|| _this.getNodeSmilType( $node ) == 'smilText'
			)
		){
			$node.attr('id', _this.smil.embedPlayer.id + '_ref_' + _this.idIndex );
			mw.log('SmilBody:: gave: ' + $node.get(0).nodeName + ' id: ' + $node.attr('id') );
			_this.idIndex++;
		}
		
		// Recurse to all the nodes children 
		if( $node.children().length ) {	
			$node.children().each( function( inx, childNode ){
				_this.assignIds( $j( childNode ) );
			});
		}
	},
	
	/**
	* Render the body elements for a given time, use layout engine to draw elements 
	*/
	renderTime: function( time, deltaTime ){
		var _this = this;
		mw.log( "renderTime:: " + time );
		 
		// Get all the draw elements from the body this time: 
		var elementList = this.getElementsForTime( time ,
			/* SMIL Element in Range */ 
			function( smilElement) {				
				// var relativeTime = time - smilElement.parentTimeOffset;
				var relativeTime = time - $j( smilElement ).data ( 'parentStartOffset' );
				
				// Render the active elements using the layout engine
				_this.smil.getLayout().drawElement( smilElement );
				
				// Transform the elements per animate engine				
				_this.smil.getAnimate().animateTransform( smilElement, relativeTime, deltaTime );
			},
			/* SMIL Element out of range */
			function( smilElement ){
				// Hide the element in the layout 
				_this.smil.getLayout().hideElement( smilElement );
				
				// Expire transitions if needed
				_this.smil.getTransitions().elementOutOfRange( smilElement, time );				
			}
		);
	},
	
	/**
	* Check if we have a valid element cache: 
	* XXX not yet working.
	*/
	isValidElementCache: function( time ){
		if( time > this.cacheElementList.validStart && time > this.cacheElementList.validEnd ) {
			return this.cacheElementList.elements; 
		}
	},
	
	/**
	 * Gets all the elements for a given time. 
	 */ 
	getElementsForTime: function ( time , inRangeCallback, outOfRangeCallback ) {
		var startOffset = 0;
		if( !time ) {
			time =0;
		}		
		// Empty out the requested element set: 		
		this.getElementsForTimeRecurse( this.$dom, time, startOffset, inRangeCallback, outOfRangeCallback);
	},
	
	/**
	 * getElementsForTimeRecurse
	 * @param {Object} $node Node to recursively search for elements in the given time range
	 */ 
	getElementsForTimeRecurse: function( $node, time, startOffset, inRangeCallback, outOfRangeCallback){
		// Setup local pointers:
		var nodeDuration = this.getNodeDuration( $node );
		var nodeType = this.getNodeSmilType( $node );
		var nodeParentType = this.getNodeSmilType( $node.parent() );		
		var _this = this;
		
		// Set startOffset to zero if not defined. 
		if( !startOffset ) {
			startOffset = 0;
		}
								
				
		// If 'par' or 'seq' recurse to get elements for layout
		if( nodeType == 'par' || nodeType == 'seq' ) {
			if( $node.children().length ) {	
				$node.children().each( function( inx, childNode ){
					// mw.log(" recurse:: startOffset:" + nodeType  + ' start offset:' + startOffset );
					var childDur = _this.getElementsForTimeRecurse( 
						$j( childNode ), 
						time, 
						startOffset, 
						inRangeCallback, 
						outOfRangeCallback 
					);
					// If element parent is a 'seq' increment startOffset as we recurse for each child
					if( nodeType == 'seq' ) {
						//mw.log(" Parent Seq:: add child dur: " + childDur );
						startOffset += childDur;
					}					
				});
			}			
		}							
		
		// If the nodeType is "ref" or smilText run the callback
		if( nodeType == 'ref' || nodeType == 'smilText' ) {		
			// Add the parent startOffset 
			$node.data( 'parentStartOffset', startOffset );			
			
			// Check if element is in range: 
			if( time >= startOffset && time <= ( startOffset + nodeDuration)  ){
				if( inRangeCallback ){
					inRangeCallback( $node );
				}	
			} else {
				if( outOfRangeCallback ){
					outOfRangeCallback( $node );
				}
			}
		}		
		// Return the node Duration for tracking startOffset
		return this.getNodeDuration( $node );
	},
	
	/**
	 * Returns the smil body duration
	 * ( wraps getDurationRecurse to get top level duration ) 
	 */	
	getDuration: function(){		
		this.duration = this.getNodeDuration( this.$dom );	
		mw.log("smilBody:: getDuration: " + this.duration );
		return this.duration;	
	},
	
	/**
	 * Gets the duration recursing from a supplied $node
	 * @param {jQueryObject} $node 
	 * @param {boolean} forceRefresh If a fresh duration should be calculated 
	 */
	getNodeDuration: function( $node, forceRefresh ){		
		if( !forceRefresh && 
			$node.data('computedDuration') != null
		) {
			return $node.data('computedDuration');
		}
		
		var _this = this;		
		var duration = 0;		
		
		// Set the block type to 
		var blockType = this.getNodeSmilType( $node );
				
		// Recurse on children
		if( $node.children().length ){
			$node.children().each( function( inx, childNode ){				
				// If in a sequence add to duration 		
				var childDuration = _this.getNodeDuration( $j( childNode ), forceRefresh );							
				if( blockType == 'seq' ){
					$node.data( 'implictDuration', $node.data('implictDuration') + childDuration ); 			
				}			
				// with par blocks ImplictDuration is longest child
				if( blockType == 'par' ){
					if( childDuration > $node.data( 'implictDuration' ) ){
						$node.data( 'implictDuration',  childDuration); 
					}
				}
			});		
		}
						
		// Check the explicit duration attribute: 
		if( $node.attr('dur') ) {			
			//mw.log(" return dur: " + mw.smil.parseTime( $node.attr('dur') ) );			
			$node.data('computedDuration', this.smil.parseTime( $node.attr('dur') ) );
		} else { 
			// Else return the implictDuration ( built from its children )
			if( $node.data( 'implictDuration' ) ){
				//mw.log(" implictDuration:: " + $node.data( 'implictDuration' ) ); 
				$node.data('computedDuration', $node.data( 'implictDuration' ) );
			} else {
				$node.data('computedDuration', 0 ); 
			}
		}		
		return $node.data('computedDuration');		
	},
	
	/**
	 * Maps a few smil tags to smil types 
	 * 
	 * http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-structure.html#edef-body 
	 * 'body' -> 'seq' 
	 * 
	 * http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-extended-media-object.html#edef-ref
	 * animation, audio, img, text, textstream and video -> 'ref',  
	 */
	getNodeSmilType: function( $node ){
		var blockType = $j( $node ).get(0).nodeName;
		var blockMap = {
			'body':'seq',
			'ref' : 'ref',
			'animation':'ref',
			'audio' : 'ref',
			'img' : 'ref',
			'textstream' : 'ref',
			'video' : 'ref'
		}
		if( blockMap[ blockType ] ){
			blockType = blockMap[ blockType ];
		}
		return blockType;
	}	
}