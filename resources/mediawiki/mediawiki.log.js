/*
 * Implementation for mediaWiki.log stub
 */

(function ($, mw) {

	/**
	 * Log output to the console.
	 *
	 * In the case that the browser does not have a console available, one is created by appending a
	 * <div> element to the bottom of the body and then appending a <div> element to that for each
	 * message.
	 *
	 * @author Michael Dale <mdale@wikimedia.org>
	 * @author Trevor Parscal <tparscal@wikimedia.org>
	 * @param {string} string Message to output to console
	 */
	mediaWiki.log = function( string , level) {
		// Exit if not in debug
		if( ! mw.config.get('debug') === true ) {
			return ;
		}
		// Allow log messages to use a configured prefix
		if ( mw.config.exists( 'mw.log.prefix' ) ) {
			string = mw.config.get( 'mw.log.prefix' ) + '> ' + string;
		}
		// Try to use an existing console
		if ( typeof window.console !== 'undefined' && typeof window.console.log == 'function' ) {
			
			var c = "fff";
			var bg = "644436";
			
			switch(level){
			
			case 1:
				bg= "9E3B33";
				break;
			case 2:
				bg= "8F6048"; 
				break;
			case 3:
				bg= "DFC184";
				c = "0";
				break;
			case 4:
				bg= "274257";
				break;
			case 5:
				bg= "2A75A9";
				break;
			case 6:
				bg= "7EB5D6";
				break;
			}
			if(level)
				console.log('%c' + string , 'border-radius: 100px; padding-left: 6px; padding-right: 6px; background: #'+bg + '; color: #'+c);
			else
				console.log(string);
		} 
		// the injected log caused issues in IE iframes
		/*else {
			// Set timestamp
			var d = new Date();
			var time = ( d.getHours() < 10 ? '0' + d.getHours() : d.getHours() ) +
				 ':' + ( d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes() ) +
				 ':' + ( d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds() ) +
				 '.' + ( d.getMilliseconds() < 10 ? '00' + d.getMilliseconds() : ( d.getMilliseconds() < 100 ? '0' + d.getMilliseconds() : d.getMilliseconds() ) );
			// Show a log box for console-less browsers
			var $log = $( '#mw-log-console' );
			if ( !$log.length ) {
				$log = $( '<div id="mw-log-console"></div>' )
					.css( {
						'position': 'fixed',
						'overflow': 'auto',
						'z-index': 500,
						'bottom': '0px',
						'left': '0px',
						'right': '0px',
						'height': '150px',
						'background-color': 'white',
						'border-top': 'solid 2px #ADADAD'
					} )
					.appendTo( 'body' );
			}
			$log.append(
				$( '<div></div>' )
					.css( {
						'border-bottom': 'solid 1px #DDDDDD',
						'font-size': 'small',
						'font-family': 'monospace',
						'padding': '0.125em 0.25em'
					} )
					.text( string )
					.append( '<span style="float:right">[' + time + ']</span>' )
			);
		} */
	};

})(jQuery, mediaWiki);
