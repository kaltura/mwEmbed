if ( 'serviceWorker' in navigator ) {
    window.addEventListener( 'load', function () {
        navigator.serviceWorker.register( 'sw.js' )
            .then( function ( registration ) {
                // Registration was successful
                console.log( 'ReceiverServiceWorker:: registration successful with scope: ', registration.scope );
            } ).catch( function ( err ) {
            // registration failed
            console.log( 'ServiceWorker:: registration failed: ', err );
        } );
    } );
}