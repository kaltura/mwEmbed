( function( $ ) {
	/**
	 * Set a given selector html to the loading spinner:
	 */
	$.fn.loadingSpinner = function( opts ) {
		// empty the target:
		$( this ).empty();

		// If we have loader path defined, load an image
		if( mw.getConfig('LoadingSpinner.ImageUrl') ) {
			this.each(function() {
				var $this = $(this).empty();
				var thisSpinner = $this.data('spinner');
				if (thisSpinner) {
					$this.data('spinner', null);
					delete thisSpinner;
				}
				if (opts !== false) {
					var $loadingSpinner = $('<img />').attr("src", mw.getConfig('LoadingSpinner.ImageUrl')).load(function() {
						// Set spinner position based on image dimension
						$( this ).css({
							'margin-top': '-' + (this.height/2) + 'px',
							'margin-left': '-' + (this.width/2) + 'px'
						});
					});
					thisSpinner = $this.append( $loadingSpinner);
				}
			});
			return this;
		}

		// Else, use Spin.js defaults
		if( !opts ){
			opts = {};
		}

		// Allow override loading spinner options
		// Generate options using: http://fgnass.github.com/spin.js/
		if( mw.getConfig('LoadingSpinner.Options') ) {
			opts = mw.getConfig('LoadingSpinner.Options');
		} else {
			// add color and shadow:
			opts = $.extend( {'color' : '#eee', 'shadow': true }, opts);
		}

		this.each( function() {
			var $this = $(this).empty();
			var thisSpinner = $this.data('spinner');
			if (thisSpinner) {
				thisSpinner.stop();
				delete thisSpinner;
			}
			if ( opts !== false ) {
				thisSpinner = new Spinner( $.extend( { color: $this.css('color') }, opts ) ).spin( this );
			}
		});
		// correct the position:
		return this;
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
		var pos = $( this ).position();
		var $overlay = $("<div />")
			.css( pos )
			.css( {
				'position': 'absolute',
				'width' : $(this).width(),
				'height': $(this).height()
			})
			.append(
				$spinner
			);
		if( !mw.getConfig('LoadingSpinner.Disabled') ) {
			$( this ).after(
			$overlay
			);
		}
		
		return $overlay;
	};

} )( jQuery );
