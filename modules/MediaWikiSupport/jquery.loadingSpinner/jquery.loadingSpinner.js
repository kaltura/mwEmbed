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
		var pos = $( this ).offset();				
		var posLeft = (  $( this ).width() ) ? 
			parseInt( pos.left + ( .5 * $( this ).width() ) -16 ) : 
			pos.left + 30;
			
		var posTop = (  $( this ).height() ) ? 
			parseInt( pos.top + ( .5 * $( this ).height() ) -16 ) : 
			pos.top + 30;
		
		var $spinner = $('<div />')
			.addClass('absoluteOverlaySpinner')
			.loadingSpinner()				
			.css({				
				'top' : posTop + 'px',
				'left' : posLeft + 'px'
			});
		$('body').append( $spinner	);
		return $spinner;
	};	
	
} )( jQuery );