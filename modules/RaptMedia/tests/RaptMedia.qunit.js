function jsKalturaPlayerTest( videoId ){
		module('RaptMedia');

    window.onTestPlayerPlayed = function setPlayedOnce() {
        window.RaptMedia_playing = true;
    };

    var kdp = $('#' + videoId)[0];

    asyncTest('RaptMedia plugin exists', function() {
        kalturaQunitWaitForPlayer(function(){
            equal(kdp.evaluate('{raptMedia.plugin}'), true, 'RaptMedia plugin exists');
            start();
        });
    });
    asyncTest('Playback has started', function() {
        kalturaQunitWaitForPlayer(function() {
            kdp.addJsListener('playerPlayed', 'onTestPlayerPlayed');
					  kdp.sendNotification('doPlay');
            setTimeout(function() {
                ok(window.RaptMedia_playing, 'Player has started playing');
                start();
            }, 2000);  // NOTE 2s to start playing should be enough
        });
    });
}