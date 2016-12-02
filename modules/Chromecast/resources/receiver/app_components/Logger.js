var Logger = (function () {
    var instance;

    function createInstance() {
        return new LoggerManager();
    }

    function LoggerManager() {
    }

    LoggerManager.prototype.log = function ( comp, msg, opt_data ) {
        console.log( this.getMessage_( comp, msg, opt_data ) );
    };

    LoggerManager.prototype.error = function ( comp, msg, opt_data ) {
        console.error( this.getMessage_( comp, msg, opt_data ) );
    };

    LoggerManager.prototype.info = function ( comp, msg, opt_data ) {
        console.info( this.getMessage_( comp, msg, opt_data ) );
    };

    LoggerManager.prototype.getMessage_ = function ( comp, msg, opt_data ) {
        opt_data = opt_data ? JSON.stringify( opt_data ) : 'NO_DATA';
        return "[RECEIVER] ### " + comp + ": " + msg + " ( " + opt_data + " )";
    };

    return {
        getInstance: function () {
            if ( !instance ) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

