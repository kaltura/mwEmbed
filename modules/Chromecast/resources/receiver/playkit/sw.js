var CACHE_NAME = 'kaltura-chromecast-receiver-cache';
var TTL_GAP = 10;

self.addEventListener( 'fetch', function ( event ) {
    console.log( 'ServiceWorker:: fetch' );

    event.respondWith(
        caches.match( event.request )
            .then( function ( response ) {
                // Cache hit - return response
                if ( response ) {
                    var now = new Date();
                    if ( (response.TTL - now) > 0 ) {
                        console.log( "ServiceWorker:: Cache hit - return response", response );
                        return response;
                    }
                    console.log( "ServiceWorker:: Response in cache buy ttl is past", response );
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch( fetchRequest ).then(
                    function ( response ) {
                        // Check if we received a valid response
                        if ( !response || response.status !== 200 || response.type !== 'basic' ) {
                            console.log( "ServiceWorker:: Response isn't valid", response );
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();
                        var ttlValue = new Date();
                        ttlValue.setDate( ttlValue.getDate() + TTL_GAP );
                        responseToCache.TTL = ttlValue;
                        console.log( "ServiceWorker:: Caching response...", responseToCache );

                        caches.open( CACHE_NAME )
                            .then( function ( cache ) {
                                cache.put( event.request, responseToCache );
                                console.log( "ServiceWorker:: Response cached!", responseToCache );
                            } );
                        return response;
                    }
                );
            } )
    );
} );
