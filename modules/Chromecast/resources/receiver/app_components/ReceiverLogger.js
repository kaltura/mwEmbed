var Logger = (function () {
    var instance;

    function createInstance( debugMode ) {
        return new LoggerManager( debugMode );
    }

    function LoggerManager( debugMode ) {
        this.debugMode = debugMode;
    }

    LoggerManager.prototype = {
        /**
         *
         * @param comp
         * @param msg
         * @param opt_data
         */
        log: function ( comp, msg, opt_data ) {
            this._writeToConsole( 'log', comp, msg, opt_data );
        },

        /**
         *
         * @param comp
         * @param msg
         * @param opt_data
         */
        error: function ( comp, msg, opt_data ) {
            this._writeToConsole( 'error', comp, msg, opt_data );
        },

        /**
         *
         * @param comp
         * @param msg
         * @param opt_data
         */
        info: function ( comp, msg, opt_data ) {
            this._writeToConsole( 'info', comp, msg, opt_data );
        },

        /**
         *
         * @param method
         * @param comp
         * @param msg
         * @param opt_data
         * @private
         */
        _writeToConsole: function ( method, comp, msg, opt_data ) {
            if ( !this.debugMode ) {
                return;
            }
            var msg_array = this._getMessage( comp, msg, opt_data );
            switch ( method ) {
                case 'log':
                    console.log( msg_array[ 0 ], " | ", msg_array[ 1 ] );
                    break;
                case 'error':
                    console.error( msg_array[ 0 ], " | ", msg_array[ 1 ] );
                    break;
                case 'info':
                    console.info( msg_array[ 0 ], " | ", msg_array[ 1 ] );
                    break;
            }
        },

        /**
         *
         * @param comp
         * @param msg
         * @param opt_data
         * @returns {[*,*]}
         * @private
         */
        _getMessage: function ( comp, msg, opt_data ) {
            if ( !opt_data ) {
                opt_data = 'NO_DATA';
            }
            return [ "[RECEIVER-APP] ### " + comp + ": " + msg, opt_data ];
        }
    };

    return {
        getInstance: function ( debugMode ) {
            if ( !instance ) {
                instance = createInstance( debugMode );
            }
            return instance;
        }
    };
})();

