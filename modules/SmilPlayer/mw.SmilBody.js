/** 
 * The smil body also see: 
 * http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-structure.html#edef-body
 */
mw.SmilBody = function( $body ){
	return this.init( $body );
}

mw.SmilBody.prototype = {
		
	// Used to store elements for getElementForTime method 
	elementsInRange: [],
	
	// Constructor: 
	init: function( smilObject ){		
		this.smil = smilObject;
		this.$dom = this.smil.getDom().find( 'body' );
	},
	
	/**
	 * Gets all the elements for a given time. 
	 * 
	 */ 
	getElementForTime: function ( time ) {
		var startOffset = 0;
		if( !time )
			time =0;
		// Empty out the requested element set: 
		this.elementsInRange = [];
		this.getElementForTimeRecurse( this.$dom, time, startOffset);
		return this.elementsInRange;
	},	
	
	/**
	 * getElementForTimeRecurse
	 * @param {Object} $node NOde to recursively search for elements in the given time range
	 */ 
	getElementForTimeRecurse: function( $node, time, startOffset){
		// Setup local pointers:
		var nodeDuration = this.getNodeDuration( $node );
		var nodeType = this.getNodeSmilType( $node );
		var nodeParentType = this.getNodeSmilType( $node.parent() );		
		var _this = this;
		
		mw.log( "getElementForTimeRecurse::" + 
			' time: ' + time  + 
			' nodeName: ' + $j( $node ).get(0).nodeName +
			' nodeType: ' + nodeType + 
			' nodeDur: ' + nodeDuration  + 
			' offset: ' + startOffset
		);
		
		// If startOffset is > time skip node and all its children
		if( startOffset > time ){
			mw.log(" Reached end, startOffset is:" + startOffset + ' > ' + time );
			return ;
		}
		
		// Means we need to seek ahead
		if( startOffset < time ){
			mw.log("Seek ahead: startOffset is" + startOffset + ' < ' + time );
			return ;
		}		
		
		// If 'par' or 'seq' recurse to get elements for layout
		if( nodeType == 'par'|| nodeType == 'seq' ) {		
			if( $node.children().length ) {	
				$node.children().each( function( inx, childNode ){
					mw.log(" recurse:: startOffset:" + nodeType  + ' start offset:' + startOffset );
					var childDur = _this.getElementForTimeRecurse( $j( childNode ), time, startOffset);
					// If element parent is a 'seq' increment startOffset: 
					if( nodeType == 'seq' ) {
						mw.log(" Parent Seq:: add child dur: " + childDur );
						startOffset += childDur;
					}
				});
			}			
		}
		
		// If the nodeType is "ref" find the its associated transformations 
		// add to this.elementsInRange array
		if( nodeType == 'ref' || nodeType == 'smilText' ) {			
			// Ref type get the 
			this.elementsInRange.push( $node );
			mw.log("Add ref to elementsInRange:: " + nodeType + " length:"  + this.elementsInRange.length);
		}
		// Return the node Duration for startOffset updates
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
				
		// recurse on children
		if( $node.children().length ){
			$node.children().each( function( inx, childNode ){				
				// If in a sequence add to duration 		
				var childDuration = _this.getNodeDuration( $j( childNode ) );							
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
			//mw.log(" return dur: " + mw.SmilParseTime( $node.attr('dur') ) );			
			$node.data('computedDuration', mw.SmilParseTime( $node.attr('dur') ) );
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
		blockMap = {
			'body':'seq',
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
	
	
	/**
	* Recurse parse out smil elements
	
	recurseSmilBlocks: function( $node, blockStore ){
		var _this = this;

		// Recursively parse the body for "<par>" and <seq>"
		$node.children().each( function( inx, childNode ){
			debugger;
			mw.log( 'on node: ' +  childNode.nodeName);
			var smilBlock = { 
					'name' : childNode.nodeName 
				};			
			switch( childNode.nodeName ) {
				case 'par': 
					smilBlock = new mw.SmilPar( childNode );					
				break;
				case 'seq':
					smilBlock = new mw.SmilSeq( childNode );
				break;
				default:
					mw.log(childNode.nodeName + ' ( not recognized tag )');
					smilBlock = new mw.SmilElement( childNode ); 
				break;
			}	
			
			// Add smilBlock to the current smilBlock
			blockStore.push( smilBlock );
			
			// If children have children add a block store and recurse
			if( $j( childNode ).children().length ) {					
				_this.recurseSmilBlocks( $j( childNode ),  smilBlock.smilBlocks );
			}
		});
	},
	*/
	
}

/**
 * Base smil element 

mw.SmilElement = function( parElement ){
	this.init(  parElement );
}
mw.SmilElement.prototype = {
	init: function( element ){
		this.tag = element.nodeName;
		this.$dom = $j( element );
		this.blockStore = [];	
	}
} */

/**
* Par Block
* http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-timing.html#edef-par

mw.SmilPar = function( parElement ){
	this.init(  parElement );
}
// Inhert the SmilElement prototype
mw.SmilPar.prototype = mw.SmilElement.prototype
*/ 
/**  
* Seq Block 
* http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-timing.html#edef-seq

mw.SmilSeq = function( seqElement ){
	this.init(  seqElement );
}
//Inhert the SmilElement prototype
mw.SmilSeq.prototype = mw.SmilElement.prototype;
*/