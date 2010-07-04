/**
* Handles the smil transitions
*/
mw.SmilTransitions = function( smilObject ){
	return this.init( smilObject );
}
mw.SmilTransitions.prototype = {
	
	init: function( smilObject ) {
		this.smil = smilObject;	
	},
	
	// Generates a transition overlay based on the transition type  
	transformTransitionOverlay: function( smilElement, animateTime ) {
		/*mw.log('SmilTransitions::transformTransitionOverlay:' + animateTime + 
				' tIn:' + $j( smilElement ).attr( 'transIn' )  + 
				' tOut:' + $j( smilElement ).attr( 'transOut' ) );		
		*/
		// Get the transition type and id: 
		var transitionInRange = false;		
		
		if( $j( smilElement ).attr( 'transIn' ) ){		
			$transition = this.smil.$dom.find( '#' + $j( smilElement ).attr( 'transIn' ) );
			// Check if the transition is in range
			var transitionDuration = this.smil.parseTime( $transition.attr('dur') );
			//mw.log("SmilTransitions: test: td:" + transitionDuration + ' > ' + animateTime);
			if( transitionDuration > animateTime  ){				
				var percent = animateTime / transitionDuration;
				/* mw.log("SmilTransitions: " + $j( smilElement ).attr( 'transIn' ) + " in range for " + 
						this.smil.getAssetId( smilElement ) + " draw:" + percent );
				*/
				this.drawTransition( percent, $transition, smilElement );	
				transitionInRange = true;
			} else {
				// Out of range hide this overlay
				$j( '#' + this.getTransitionOverlayId( $transition, smilElement ) ).hide();			
			}
		}
		
		if( $j( smilElement ).attr( 'transOut' ) ){
			$transition = this.smil.$dom.find( '#' + $j( smilElement ).attr( 'transOut' ) );
			// Check if the transition is in range
			var duration = this.smil.parseTime( $transition.attr('dur') );
			var nodeDuration = this.smil.getBody().getNodeDuration( smilElement ); 
			if( animateTime > ( nodeDuration - duration ) ){			
				var percent = animateTime - ( nodeDuration - duration ) / duration;
				// Invert the percentage for "transOut"
				percent = 1 - percent;
				
				this.drawTransition( percent, $transition, smilElement );
				transitionInRange = true;
			} else {
				// Hide this overlay
				$j( '#' + this.getTransitionOverlayId( $transition, smilElement ) ).hide();	
			}
		}
		return transitionInRange;
	},	
	
	/**
	 * elementOutOfRange check if an elements transition overlays are out of range and hide them
	 */
	elementOutOfRange: function ( smilElement, time ){
		// for now just hide
		if( $j( smilElement ).attr( 'transIn' ) ){		
			$j( '#' + 
				this.getTransitionOverlayId( 
					this.smil.$dom.find( '#' + $j( smilElement ).attr( 'transIn' ) ),
					smilElement
				)
			).hide();
		}
		if( $j( smilElement ).attr( 'transOut' ) ){
			$j( '#' + 
				this.getTransitionOverlayId( 
					this.smil.$dom.find( '#' + $j( smilElement ).attr( 'transOut' ) ),
					smilElement
				)
			).hide();
		}
	},
	
	/**
	 * Updates a transition to a requested percent
	 * 
	 * @param {float} percent Percent to draw transition
	 * @param {Element} $transition The transition node
	 * @param {Element} smilElement The element to transition on. 
	 */
	drawTransition: function( percent, $transition, smilElement ){
		//mw.log( 'SmilTransitions::drawTransition::' +  $transition.attr('id') );
		// Map draw request to correct transition handler:
		if( ! this.transitionFunctionMap[ $transition.attr('type') ] 
		    ||
		    ! this.transitionFunctionMap[ $transition.attr('type') ][ $transition.attr( 'subtype' ) ] ){
			mw.log( "Error no support for transition " + 
					$transition.attr('type') + " with subtype: " + $transition.attr( 'subtype' ) );
			return ;
		}	
		// Run the transitionFunctionMap update: 
		this.transitionFunctionMap[ $transition.attr('type') ]
		                          [ $transition.attr( 'subtype' ) ]
		                          (this, percent, $transition, smilElement )
	},
	
	/**
	 * Maps all supported transition function types 
	 * 	
	 * Also see: http://www.w3.org/TR/SMIL/smil-transitions.html
	 *
	 * Each transition map function accepts: 
	 * 
	 * @param {Object} _this Reference to SmilTransistions object
	 * @param {float} percent Percent to draw transition
	 * @param {Element} $transition The transition node
	 * @param {Element} smilElement The element to transition on. 
	 */
	transitionFunctionMap : {
		'fade' : {
			'fadeFromColor': function( _this, percent, $transition, smilElement ){
				// Add the overlay if missing
				var transitionOverlayId = _this.getTransitionOverlayId( $transition, smilElement );		
				if( $j( '#' + transitionOverlayId  ).length == 0 ){
					
					// Add the transition to the smilElements "region" 
					// xxx might want to have layout drive the draw a bit more
					_this.smil.getLayout().getRegionTarget( smilElement ).append( 
						$j('<div />')
							.attr('id', transitionOverlayId)
							.addClass( 'smilFillWindow' )
							.addClass( 'smilTransitionOverlay' )
							.css( 'background-color', $transition.attr( 'fadeColor'))
					);
					mw.log('fadeFromColor:: added: ' + transitionOverlayId);														
				}
				
				// Invert the percentage since we setting opacity from full color we are fading from		
				percent = 1 - percent;	
				
				// Update the overlay opacity
				$j( '#' + transitionOverlayId  ).css( 'opacity', percent );
			},
			'crossfade': function( _this, percent, $transition, smilElement ){
				// fade "ourselves" ... in cases of overlapping timelines this will create a true cross fade
				$j( '#' + _this.smil.getAssetId( smilElement )  ).css( 'opacity', percent );
			}
		}		
	},
	
	getTransitionOverlayId: function( $transition, smilElement) {
		 return this.smil.getAssetId( smilElement ) + '_' + $transition.attr('id');	
	}
	

}