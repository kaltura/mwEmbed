function jsKalturaPlayerTest( videoId ){
		module('RaptMediaNg');

    window.onTestPlayerPlayed = function setPlayedOnce() {
        window.RaptMediaNg_playing = true;
    };

    var kdp = $('#' + videoId)[0];

    asyncTest('RaptMediaNg plugin exists', function() {
        kalturaQunitWaitForPlayer(function(){
            equal(kdp.evaluate('{raptMediaNg.plugin}'), true, 'RaptMediaNg plugin exists');
            start();
        });
    });
    asyncTest('Playback has started', function() {
        kalturaQunitWaitForPlayer(function() {
            kdp.addJsListener('playerPlayed', 'onTestPlayerPlayed');
					  kdp.sendNotification('doPlay');
            setTimeout(function() {
                ok(window.RaptMediaNg_playing, 'Player has started playing');
                start();
            }, 2000);  // NOTE 2s to start playing should be enough
        });
    });
}
