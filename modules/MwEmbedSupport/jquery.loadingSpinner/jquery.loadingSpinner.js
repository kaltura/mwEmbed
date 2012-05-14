( function( $ ) {
	/**
	 * Set a given selector html to the loading spinner:
	 */
	$.fn.loadingSpinner = function( ) {
		var _this = this;
		if ( _this ) {
			$( _this ).html(
				$( '<div />' )
					.addClass( "loadingSpinner" )
			);
			var i =0;
			var interval = setInterval( function(){
				if( _this && $( _this ).find('.loadingSpinner').length ){
					var offset = i*32;
					$( _this ).find('.loadingSpinner').css('background-position','0 ' + offset + 'px');
					if(i >= 7) i = 0;
					i++;
				} else {
					 clearInterval( interval );
				}
			}, 70 );
		}
		return _this;
	};
	/**
	 * Add an absolute overlay spinner useful for cases where the
	 * element does not display child elements, ( images, video )
	 */
	$.fn.getAbsoluteOverlaySpinner = function(){
		// Set the spin size to "small" ( length 5 ) if target height is small
 		var spinOps = ( $( this ).height() < 36 )? { 'length' : 5, 'width' : 2, 'radius' : 4 }: {};
 		var spinerSize = {
 				'width' : 45, 
 				'height' : 45
 			};
 		
		var $spinner = $('<div />')
			.addClass('absoluteOverlaySpinner')
			.loadingSpinner()				
			.css({			
				'width' : spinerSize.width,
				'height' : spinerSize.height,
				'position': 'absolute',
				'top' : '50%',
				'left' : '50%',
				'z-index' : 100
			})
			.loadingSpinner(
				spinOps
			)
		$( this ).append( $spinner	);
		return $spinner;
	};
	
} )( jQuery );
