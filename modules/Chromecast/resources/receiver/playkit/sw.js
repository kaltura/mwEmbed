var CACHE_NAME = 'kaltura-chromecast-receiver-cache';
var urlsToCache = [
    '/',
    '/assets',
    '/app_components/ReceiverAdsMgr.js',
    '/app_components/ReceiverIdleMgr.js',
    '/app_components/ReceiverLogger.js',
    '/app_components/ReceiverStateMgr.js',
    '/app_components/ReceiverUtils.js'
];

self.addEventListener( 'fetch', function ( event ) {
    debugger;
    event.respondWith(
        caches.match( event.request )
            .then( function ( response ) {
                // Cache hit - return response
                debugger;
                if ( response ) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch( fetchRequest ).then(
                    function ( response ) {
                        debugger;
                        // Check if we received a valid response
                        if ( !response || response.status !== 200 || response.type !== 'basic' ) {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open( CACHE_NAME )
                            .then( function ( cache ) {
                                debugger;
                                cache.put( event.request, responseToCache );
                            } );

                        return response;
                    }
                );
            } )
    );
} );
