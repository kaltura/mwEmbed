/**
 * mwEmbed jQuery utility functions that are too small for their own file
 */
( function( $ ) {

	/**
	 * Extend Unique to work with strings and number values
	 * http://paulirish.com/2010/duck-punching-with-jquery/
	 */
	var _oldUnique = $.unique;
    $.unique = function(arr){
        // Do the default behavior only if we got an array of elements
        if (!!arr[0].nodeType){
            return _oldUnique.apply(this,arguments);
        } else {
            // reduce the array to contain no dupes via grep/inArray
            return $.grep(arr,function(v,k){
                return $.inArray(v,arr) === k;
            });
        }
    };


	/**
	 * Shortcut to a themed button Should be depreciated for $.button
	 * bellow
	 */
	$.btnHtml = function( msg, styleClass, iconId, opt ) {
		if ( !opt )
			opt = { };
		var href = ( opt.href ) ? opt.href : '#';
		var target_attr = ( opt.target ) ? ' target="' + opt.target + '" ' : '';
		var style_attr = ( opt.style ) ? ' style="' + opt.style + '" ' : '';
		return '<a href="' + href + '" ' + target_attr + style_attr +
			' class="ui-state-default ui-corner-all ui-icon_link ' +
			styleClass + '"><span class="ui-icon ui-icon-' + iconId + '" ></span>' +
			'<span class="btnText">' + msg + '</span></a>';
	};

	// Shortcut to generate a jQuery button
	var mw_default_button_options = {
		// The class name for the button link
		'class' : '',

		// The style properties for the button link
		'style' : { },

		// The text of the button link
		'text' : '',

		// The icon id that precedes the button link:
		'icon' : 'carat-1-n'
	};

	$.button = function( options ) {
		var options = $j.extend( {}, mw_default_button_options, options);

		// Button:
		var $button = $('<a />')
			.attr('href', '#')
			.addClass( 'ui-state-default ui-corner-all ui-icon_link' );
		// Add css if set:
		if( options.css ) {
			$button.css( options.css );
		}

		if( options['class'] ) {
			$button.addClass( options['class'] );
		}

		// return the button:
		$button.append(
				$('<span />').addClass( 'ui-icon ui-icon-' + options.icon ),
				$('<span />').addClass( 'btnText' )
				.text( options.text )
		)
		.buttonHover(); // add buttonHover binding;
		if( !options.text ){
			$button.css('padding', '1em');
		}
		return $button;
	};

	// Shortcut to bind hover state
	$.fn.buttonHover = function() {
		$( this ).hover(
			function() {
				$( this ).addClass( 'ui-state-hover' );
			},
			function() {
				$( this ).removeClass( 'ui-state-hover' );
			}
		);
		return this;
	};

} )( jQuery );