//must come after qunit-bootstrap.js and after mwEmbedLoader.php
if( window.QUnit ){
	mw.setConfig( 'forceMobileHTML5', true );
	QUnit.start();	
	jsCallbackCalled = false;
	function jsCallbackReady ( videoId ) {
		jsCallbackCalled = true;
		jsKalturaPlayerTest( videoId );

		document.getElementById( videoId ).addJsListener("entryReady", "kalturaQunitEntryReady");
	}
	asyncTest( "KalturaSupport::PlayerLoaded", function(){
		var waitCount = 0;
		var interval = setInterval(function(){
			// timeout in 20 seconds:
			if( waitCount == 2000 && !jsCallbackCalled ){
				ok(false, "Player timed out");
				clearInterval( interval );
			}
			if( jsCallbackCalled ){
				ok(true, "Player loaded");
				clearInterval( interval );
				start();
			}
			waitCount++;
		}, 10);
	});
	var entryReadyCallbacks = [];
	var entryReadyAlreadyCalled = false;
	// Utility function for entry ready testing handler
	window['kalturaQunitEntryReady'] = function(){
		// run in async call to ensure non-blocking build out is in dom
		setTimeout(function(){
			while( entryReadyCallbacks.length ){
				entryReadyCallbacks.shift()();
			}
			entryReadyAlreadyCalled = true;
		}, 10 );
	};
	window['kalturaQunitWaitForPlayer'] = function( callback ){
		if( entryReadyAlreadyCalled ){
			callback();
			return ;
		}
		entryReadyCallbacks.push( callback );
	};
}