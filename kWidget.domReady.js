/**
* Dom Ready object, extends kWidget object
* holds all document ready related functions ( similar to jQuery.ready )  
*/
(function( window, document, undefined ){
	
	// Get kWidget object or create new one
	var kWidget = window.kWidget || {};
	
	kWidget.domReady = {
		
		// Array of callbacks to perform when dom ready
		callbacks: [],
		
		isReady: false,
		
		// Adds callback to run when dom ready
		ready: function( callback ) {
			if( kWidget.domReady.isReady ){
				callback();
			} else {
				this.callbacks.push( callback );
			}			
		},
		
		runDomReady: function( event ) {
			// run dom ready with a 1ms timeout to prevent sync execution in browsers like chrome
			// Async call give a chance for configuration variables to be set
			kWidget.domReady.isReady  = true;
			while( kWidget.domReady.callbacks.length ){
				kWidget.domReady.callbacks.shift()();
			}

			// When in iframe, wait for endOfIframe event status. ( IE9 has issues ) 
			if( mw.getConfig('EmbedPlayer.IsIframeServer')  && event !== 'endOfIframeJs' ){
				return ;
			}
			kCheckAddScript();			
		},
		
		checkDomReady: function() {

			// Check if already ready: 
			if ( document.readyState === "complete" ) {
				kWidget.domReady.runDomReady();
			}
			// Fallback function that should fire for all browsers ( only for non-iframe ) 
			if( ! mw.getConfig( 'EmbedPlayer.IsIframeServer') ){
				var originalOnLoad = false;
				var kDomReadyCall = function(){
					if( typeof originalOnLoad == 'function' ){
						originalOnLoad();
					}
					kWidget.domReady.runDomReady();
				};
				if( window.onload && window.onload.toString() != kDomReadyCall.toString() ){
					originalOnLoad = window.onload;
				}
				window.onload = kDomReadyCall;
			}
			// Cleanup functions for the document ready method
			if ( document.addEventListener ) {
				DOMContentLoaded = function() {
					document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
					kWidget.domReady.runDomReady();
				};

			} else if ( document.attachEvent ) {
				DOMContentLoaded = function() {
					// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
					if ( document.readyState === "complete" ) {
						document.detachEvent( "onreadystatechange", DOMContentLoaded );
						kWidget.domReady.runDomReady();
					}
				};
			}

			// Mozilla, Opera and webkit nightlies currently support this event
			if ( document.addEventListener ) {
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			// If IE event model is used
			} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent("onreadystatechange", DOMContentLoaded);
				// If IE and not a frame
				// continually check to see if the document is ready
				var toplevel = false;
				try {
					toplevel = window.frameElement == null;
				} catch(e) {
				}
				if ( document.documentElement.doScroll && toplevel ) {
					this.doScrollCheck();
				}
			}
			// A document addEventListener
			if ( document.addEventListener ) {
				window.addEventListener( "load", kWidget.domReady.runDomReady, false );
			}
		},
		
		// The DOM ready check for Internet Explorer
		doScrollCheck: function() {
			if ( kWidget.domReady.isReady ) {
				return;
			}
			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch( error ) {
				setTimeout( kWidget.domReady.doScrollCheck, 1 );
				return;
			}
			// and execute any waiting functions
			kWidget.domReady.runDomReady();
		}
	};
	
	// Check for dom ready
	kWidget.domReady.checkDomReady();
	
})( window, document );