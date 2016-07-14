// TODO do we need this?  mw.setConfig('forceMobileHTML5', true);

function jsKalturaPlayerTest( videoId ){
		module('Peer5');

    window.onTestPlayerPlayed = function setPlayedOnce() {
        window.Peer5_playing = true;
    };

    var kdp = $('#' + videoId)[0];

    asyncTest('Peer5 plugin exists', function() {
        kalturaQunitWaitForPlayer(function(){
            equal(kdp.evaluate('{peer5.plugin}'), true, 'Peer5 plugin exists');
            start();
        });
    });
    asyncTest('Playback has started', function() {
        kalturaQunitWaitForPlayer(function() {
            kdp.addJsListener('playerPlayed', 'onTestPlayerPlayed');
					  kdp.sendNotification('doPlay');
            setTimeout(function() {
                ok(window.Peer5_playing, 'Player has started playing');
                start();
            }, 2000);  // NOTE 2s to start playing should be enough
        });
    });
}
