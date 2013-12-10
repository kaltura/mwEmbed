( function( $ ) {
	/**
	 * Set a given selector html to the loading spinner:
	 */
	$.fn.loadingSpinner = function( opts ) {
		// empty the target:
		$( this ).empty();
		// If we have loader path defined, load an image
		if( mw.getConfig('loadingSpinner.imageUrl') ) {
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

		// Allow override loading spinner options
		// Generate options using: http://fgnass.github.com/spin.js/
		var spinnerConfig =  {
			lines: 11, // The number of lines to draw
			length: 10, // The length of each line
			width: 6, // The line thickness
			radius: 12, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: [
				'rgb(0,154,218)',
				'rgb(255,221,79)',
				'rgb(0,168,134)',
				'rgb(233,44,46)',
				'rgb(181,211,52)',
				'rgb(252,237,0)',
				'rgb(0,180,209)',
				'rgb(117,192,68)',
				'rgb(232,44,46)',
				'rgb(250,166,26)',
				'rgb(0,154,218)',
				'rgb(232,44,46)',
				'rgb(255,221,79)',
				'rgb(117,192,68)',
				'rgb(232,44,46)'
			],
			speed: 1.6, // Rounds per second
			trail: 100, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: true, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};
		// Else, use Spin.js defaults
		if( !opts ){
			opts = {};
		}
		// get any config based options: 
		if( mw.getConfig('loadingSpinner') ) {
			opts = $.extend(opts, mw.getConfig('loadingSpinner') );
			// normalize some options: 
			if( opts['lineLength'] ){
				opts['length'] = opts['lineLength'];
			}
			if( opts['color'] ){
				opts['color'] =  opts['color'].split('|');
				if( opts['color'].length == 1 ){
					opts['color'] = opts['color'][0];
				}
			}
		}
		// add color and shadow:
		opts = $.extend({}, spinnerConfig, opts);
		

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
