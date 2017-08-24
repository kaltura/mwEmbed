(function(mw, $) { "use strict";

console.log('[OpenX] Start');

mw.addKalturaPlugin(['mw.OpenX'], 'OpenX', function(embedPlayer, callback){
    console.log('[OpenX] Install');
    embedPlayer.openx = new mw.OpenXController(embedPlayer, callback);
});


})(window.mw, window.jQuery);

