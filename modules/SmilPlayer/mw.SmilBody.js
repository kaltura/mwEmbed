
mw.SmilBody = function( $body ){
	return this.init( $body );
}

mw.SmilBody.prototype = {
	
	init: function( $body ){
		this.$dom = $body; 
	},	
	
	// maybe "build" layout ? 
	updateLayout: function ( $layoutDom , time ) {
		var _this = this;
		
		// Set up the top level "seq" container: 
		// ( by default "body" is treated like a seq tag per smil spec )
		// http://www.w3.org/TR/2008/REC-SMIL3-20081201/smil-structure.html#edef-body 
						
		this.rootBlock = new mw.SmilPar( this.$dom );		
		this.rootBlock.smilBlocks = [] ;
		mw.log( 'updateLayout:: about to recurse smil blocks');
		// Recurse out the rest of the structure:
		this.recurseSmilBlocks( this.$dom, this.rootBlock.blockStore );
		var cat = this.rootBlock;
		debugger;
		
		return  $layoutDom;
	},	
	
	/**
	* Recurse parse out smil elements
	*/
	recurseSmilBlocks: function( $node, blockStore ){
		var _this = this;

		// Recursively parse the body for "<par>" and <seq>"
		$node.children().each( function( inx, bodyChild ){
			mw.log( 'on node: ' +  bodyChild.nodeName);
			var smilBlock = { 'name' : bodyChild.nodeName };			
			switch( bodyChild.nodeName ) {
				case 'par': 
					smilBlock = new mw.SmilPar( bodyChild );					
				break;
				case 'seq':
					smilBlock = new mw.SmilSeq( bodyChild );
				break;
				default:
					mw.log(' Skiped ' + bodyChild.nodeName + ' ( not recognized tag )');
				break;
			}			
			// Add a blockStore the smilBlock
			blockStore.push( smilBlock );
			
			// If children have children add a block store and recurse
			if( $j( bodyChild ).children().length ){
				smilBlock.blockStore = [];				
				_this.recurseSmilBlocks( $j( bodyChild ),  smilBlock.smilBlocks );
			}
		});
	},
	
	
	// Updates the layout and adds a css animation to the next frame
	updateLayoutCssAnimation: function(){
		
	}
}

/**
* Par Block
*/ 
mw.SmilPar = function( parElement ){
	return this.init(  parElement );
}
mw.SmilPar.prototype = {
	tag: 'par',
	init: function( parElement ) {
		var _this = this;
		this.$dom = parElement;
		
		// Go though all its children recursing on mw.SmilSeq where needed
		
	}
}

/**  
* Seq Block 
*/
mw.SmilSeq = function( seqElement ){
	return this.init(  seqElement );
}
mw.SmilSeq.prototype = {
	tag: 'seq',
	init: function( seqElement ) {
		var _this = this;
		this.$dom = seqElement;		
		// Go though all its children recursing on mw.SmilSeq where needed		
	}
}
