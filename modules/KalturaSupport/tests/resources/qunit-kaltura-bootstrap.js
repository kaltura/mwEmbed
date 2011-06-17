//must come after qunit-bootstrap.j
if( window.QUnit ){
	QUnit.start();	
	jsCallbackCalled = false;
	function jsCallbackReady ( videoId ) {
		jsCallbackCalled = true;
		jsKalturaPlayerTest( videoId );
	}
	asyncTest( "KalturaSupport::PlayerLoaded", function(){
		var waitCount = 0;
		var interval = setInterval(function(){
			// timeout in 20 seconds:
			if( waitCount == 200 && !jsCallbackCalled ){
				ok(false, "Player timed out");
				clearInterval( interval );
			}
			if( jsCallbackCalled ){
				ok(true, "Player loaded");
				clearInterval( interval );
				start();
			}
			waitCount++;
		}, 100);
	});
}