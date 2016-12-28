var ReceiverUtils = {
    CLASS_NAME: "ReceiverUtils",

    /**
     * Gets the value from the url's query string.
     * @param variable
     * @returns {boolean}
     */
    getQueryVariable: function ( variable ) {
        var query = decodeURIComponent( window.location.search.substring( 1 ) );
        var vars = query.split( "&" );
        for ( var i = 0; i < vars.length; i++ ) {
            var pair = vars[ i ].split( "=" );
            if ( pair[ 0 ] === variable ) {
                return (pair[ 1 ] ? pair[ 1 ] === 'true' : true);
            }
        }
        return false;
    },

    /**
     * Merge between two arrays.
     * @param a
     * @param b
     * @returns {*}
     */
    extend: function ( a, b ) {
        for ( var key in b ) {
            if ( b.hasOwnProperty( key ) ) {
                a[ key ] = b[ key ];
            }
        }
        ReceiverLogger.log( this.CLASS_NAME, "extend", { 'result': a } );
        return a;
    },

    /**
     * Preloads media data that can be preloaded (usually images).
     * @param metadata
     */
    preloadMediaImages: function ( metadata ) {
        ReceiverLogger.log( this.CLASS_NAME, "preloadMediaImages", metadata.images );
        var deferred = $.Deferred();
        var imagesToPreload = [];
        var counter = 0;
        var images = [];

        function imageLoaded() {
            if ( ++counter === imagesToPreload.length ) {
                deferred.resolve();
            }
        }

        // Try to preload image metadata
        var thumbnailUrl = this._getMediaImageUrl( metadata );
        if ( thumbnailUrl ) {
            imagesToPreload.push( thumbnailUrl );
        }
        if ( imagesToPreload.length === 0 ) {
            deferred.resolve();
        } else {
            for ( var i = 0; i < imagesToPreload.length; i++ ) {
                images[ i ] = new Image();
                images[ i ].src = imagesToPreload[ i ];
                images[ i ].onload = imageLoaded;
                images[ i ].onerror = imageLoaded;
            }
        }
        return deferred.promise();
    },

    /**
     * Loads the metadata for the given media.
     * @param metadata
     */
    loadMediaMetadata: function ( metadata ) {
        ReceiverLogger.log( this.CLASS_NAME, "loadMediaMetadata", metadata );
        var deferred = $.Deferred();
        if ( metadata ) {
            $( '#cast-title' ).text( metadata.title ? metadata.title : '' );
            $( '#cast-subtitle' ).text( metadata.subtitle ? metadata.subtitle : '' );
            var imageUrl = this._getMediaImageUrl( metadata );
            var mediaArtwork = $( '#cast-artwork' );
            if ( imageUrl ) {
                mediaArtwork.css( 'background-image', 'url("' + imageUrl.replace( /"/g, '\\"' ) + '")' );
                this.preloadMediaImages( metadata ).then( function () {
                    deferred.resolve( true );
                } );
            } else {
                mediaArtwork.css( 'background-color', '#424242' );
                var img = $( '<img>' )
                    .css( { 'position': 'relative', 'top': '25%', 'left': '10%' } )
                    .attr( 'src', 'assets/media-placeholder.png' )
                    .appendTo( mediaArtwork );
                deferred.resolve( true );
            }
        } else {
            deferred.resolve( false );
        }
        return deferred.promise();
    },

    /**
     * Returns the image url for the given media object.
     * @param metadata
     * @returns {images|{}|HTMLCollection|*|Array}
     * @private
     */
    _getMediaImageUrl: function ( metadata ) {
        var images = metadata.images || [];
        return images && images[ 0 ] && images[ 0 ][ 'url' ];
    }
};
