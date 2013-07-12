/*
 * Implementation for mediaWiki.log stub
 */

(function ($, mw) {
    mediaWiki.logCollector = [];
    mediaWiki.logCount = 0;
     if (document.location.href.indexOf('collectlog='))
     {

         mediaWiki.logInterval = setInterval(function(){
             if (mediaWiki.logCount > 5)
             {
                 clearInterval( mediaWiki.logInterval);
             }
             var currentLog =   mediaWiki.logCollector.join('|');
             mediaWiki.logCollector = [];
             var logname = '';
             if ( document.location.href.match(/collectlog=(.*)/)[1] )
             {
                 logname =  document.location.href.match(/collectlog=(.*)/)[1];
             }
             $.ajax({
                 url: 'http://kgit.html5video.org/pulls/443/logme.php?logcount='+ mediaWiki.logCount++ +'&logname='+logname,
                 data: {logdata: currentLog},
                 type: 'post', // you can use get if you want to.
                 success: function(response) {

                 }
             });
         },10000)
     }
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
	mediaWiki.log = function( string ) {
		// Exit if not in debug
        mediaWiki.logCollector.push(string);
		if( ! mw.config.get('debug') === true ) {
			return ;
		}
		// Allow log messages to use a configured prefix
		if ( mw.config.exists( 'mw.log.prefix' ) ) {
			string = mw.config.get( 'mw.log.prefix' ) + '> ' + string;
		}
		// Try to use an existing console
		if ( typeof window.console !== 'undefined' && typeof window.console.log == 'function' ) {
				var log = Function.prototype.bind.call(console.log, console);
				log.apply(console, $.makeArray( arguments ));
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
